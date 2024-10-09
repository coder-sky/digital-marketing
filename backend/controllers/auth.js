import db from "../config/mysqlconnection.js"
import jwt from 'jsonwebtoken'
import bcrypt from "bcrypt";
import otpGenerator from 'otp-generator'
import { v4 as uuidv4 } from 'uuid';
import { transporter } from "../config/emailconfig.js";

export const login = (req, res) => {
    console.log(req.body)
    const { username, password } = req.body

    const check_user_query = `select * from logindetails where binary username=?`
    db.query(check_user_query, [username], (err, result) => {
        if (err) {
            console.log(err)
            return res.status(500).json('Server Error Contact Admin!')
        }
        else {
            if (result.length !== 0 && bcrypt.compareSync(password, result[0].password)) {
                //const {client_name, username, email, company_logo, role} = result[0]
                const data_to_encrypt = result[0];
                delete data_to_encrypt['password']
                const token = jwt.sign({ ...data_to_encrypt }, process.env.JWT_SECRET)
                console.log(data_to_encrypt)
                return res.cookie('ssid', token).status(200).json(data_to_encrypt)
            }
            else {
                return res.status(406).json('Invalid Username/Password')
            }

        }
    })
    //res.send('ok')
}

export const logout = (req, res) => {
    //console.log(req.cookies.USERAUTHID)
    return res.clearCookie('ssid').status(200).json('Logged Out!')
}

export const checkuser = async (req, res) => {
    //console.log(req.cookies, req.checkAuth)
    const {isAuth,client_name, username, email, role} = req.checkAuth
    try {
        if (isAuth) {
            const q = `select * from logindetails where binary client_name=? and email=? and binary username=? and role=?`
            db.query(q, [client_name, email, username, role], (err, result) => {
                if (err) {
                    console.log(err)
                    return res.status(500).json('Server Error Contact Admin!')
                }
                else {
                    if (result.length !== 0) {
                        result = result[0]
                        delete result.password
                        console.log(result)
                        
                        return res.status(200).send(result)
                        //res.status(200).json(result)
                    }
                    else {
                        return res.clearCookie('ssid').status(401).json('Unauthorized')
                    }

                }
            })

        }
        else {
            return res.clearCookie('USERAUTHID').status(401).json('Unauthorized')
        }


    }
    catch {
        return res.status(401).json('Unauthorized')
    }

}

export const forgotpasword = (req, res) => {
    console.log(req.body)
    const { username, email } = req.body
    const checkuser_query = 'select * from logindetails where binary username=? and email=?'
    const checkuser_values = [username, email]
    db.query(checkuser_query, checkuser_values, async (err, result) => {
        if (err) {
            console.log(err)
            return res.status(500).json('Server Error Contact Admin!')
        }
        else {
            console.log(result)
            if (result.length === 0) {
                return res.status(406).json('Invalid Details!')
            }
            else {
                const otp = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
                const id = uuidv4()
                console.log(otp)
                const insert_code_query = 'insert into validationcodes values(?)'
                const insert_code_values = [[id, username, email, otp]]
                try {
                    await db.promise().query(insert_code_query, insert_code_values)
                    //mail
                    const mailOptions = {
                        from: '"Company Name Here"', // sender address
                        to: [email],
                        subject: `Validation Code`,
                        template: 'ResetPassword', // the name of the template file i.e email.handlebars
                        context: {
                            otp:`${otp}`.split('')

                        }
                    };
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            return console.log(error);
                        }
                        //console.log(info)
                        console.log('Message sent: ' + info.response);
                    })

                    //-------------------
                    return res.status(200).json({ msg: 'Validation code sended successfully', ref: id })
                }
                catch (err) {
                    console.log(err)
                    return res.status(500).json('Server Error Contact Admin!')
                }
            }
        }
    })

    //res.send('ok')

}

export const verifycode = (req, res) => {
    console.log(req.body)
    const { username, email, ref, clientOtp } = req.body
    const check_otp_query = 'select * from validationcodes where binary username=? and email=? and binary id=? and validation_code=?;'
    const check_otp_values = [username, email, ref, Number(clientOtp)]
    db.query(check_otp_query, check_otp_values, (err, result) => {
        if (err) {
            console.log(err)
            return res.status(500).json('Server Error Contact Admin!')
        }
        else {
            console.log(result)
            if (result.length === 0) {
                return res.status(406).json('Invalid Validation Code.')
            }
            else {
                const token = jwt.sign(req.body, process.env.JWT_SECRET)
                return res.cookie('validationid', token).send('validation successfull')
            }
        }

    })
    //res.send('ok')

}

export const resetpassword = (req, res) => {
    console.log(req.body)
    console.log(req.cookies)
    const { username, email, password } = req.body
    const { validationid } = req.cookies
    if (validationid) {
        const verify = jwt.verify(validationid, process.env.JWT_SECRET)
        console.log(verify)
        const { ref, clientOtp } = verify
        const check_otp_query = 'select * from validationcodes where binary username=? and email=? and binary id=? and validation_code=?;'
        const check_otp_values = [username, email, ref, Number(clientOtp)]
        db.query(check_otp_query, check_otp_values, async (err, result) => {
            if (err) {
                console.log(err)
                return res.status(500).json('Server Error Contact Admin!')
            }
            else {
                console.log(result)
                if (result.length === 0) {
                    return res.status(406).json('Invalid Request.')
                }
                else {
                    const encryptPWD = bcrypt.hashSync(password, 12)
                    const update_password_query = 'update logindetails set password=? where binary username=? and email=?'
                    const update_password_values = [encryptPWD, username, email]
                    const delete_validation_codes_query = 'delete from validationcodes where binary username=? and email=?'
                    const delete_validation_codes_values = [username, email]
                    try {
                        await db.promise().query(update_password_query, update_password_values)
                        await db.promise().query(delete_validation_codes_query, delete_validation_codes_values)
                        return res.clearCookie('validationid').status(200).json('Password updated successfully')

                    }
                    catch (err) {
                        console.log(err)
                        return res.status(500).json('Server Error Contact Admin!')
                    }
                }
            }

        })

    }

}

