import cloudinary from "../config/cloudinaryconfig.js"
import { transporter } from "../config/emailconfig.js";
import db from "../config/mysqlconnection.js"
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid';


export const addclientdetails = (req, res) => {
    console.log(req.body)
    const { isAuth, role } = req.checkAuth
    if (isAuth && role === 'superadmin') {
        const { clientName, clientUserName, password, clientEmail, dateOfJoining, logo, sendMail } = req.body
        const checkuser_query = 'select * from logindetails where binary client_name=? or binary username=?'
        const checkuser_values = [clientName, clientUserName]
        db.query(checkuser_query, checkuser_values, async (err, result) => {
            if (err) {
                console.log(err)
                return res.status(500).json('Server Error Contact Admin!')
            }
            else {
                if (result.length === 0) {
                    let logoUrl = logo.url;
                    if (logoUrl !== '') {
                        try {
                            const img_res = await cloudinary.uploader.upload(logoUrl, { upload_preset: process.env.UPLOAD_PRESET_COMPANYLOGOS })
                            //console.log(img_res)
                            // Optimize delivery by resizing and applying auto-format and auto-quality
                            const optimizeUrl = cloudinary.url(img_res.url, {
                                fetch_format: 'auto',
                                quality: 'auto'
                            });

                            logoUrl = optimizeUrl;
                        }
                        catch (err) {
                            console.log(err)
                            return res.status(500).json('something went wrong try again!')

                        }
                    }
                    const encryptedPassword = bcrypt.hashSync(password, 12)
                    const id = uuidv4()

                    try {
                        const insert_clientdatails_query = 'insert into logindetails values(?)'
                        const insert_clientdatails_values = [[id, clientName, clientUserName, encryptedPassword, clientEmail, dateOfJoining, logoUrl, 'client']]
                        await db.promise().query(insert_clientdatails_query, insert_clientdatails_values)
                        // -------------------------mail----------------------
                        const mailOptions = {
                            from: '"Company Name Here"', // sender address
                            to: [clientEmail],
                            subject: `Login Credentials`,
                            template: 'UserRegister', // the name of the template file i.e email.handlebars
                            context: {
                                clientName: clientName,
                                clientUserName: clientUserName,
                                password: password,

                            }
                        };
                        if(sendMail==='yes'){
                            transporter.sendMail(mailOptions, function (error, info) {
                                if (error) {
                                    return console.log(error);
                                }
                                //console.log(info)
                                console.log('Message sent: ' + info.response);
                            })
                        }
                        
                        return res.send('Client data added successfully')

                    }
                    catch (err) {
                        console.log(err)
                        return res.status(500).json('Server Error Contact Admin!')
                    }


                }
                else {
                    const { client_name, username } = result[0]
                    if (client_name === clientName) {
                        return res.status(406).json('Client Name Already Exists!')
                    }
                    else if (username === clientUserName) {
                        return res.status(406).json('Client Username Already Exists!')
                    }
                }
            }
        })

    }
    else {
        return res.status(406).json('Invalid Access')
    }


    //res.send('ok')
}

export const clientdetails = (req, res) => {
    const { isAuth, role } = req.checkAuth
    if (isAuth && (role === 'superadmin' || role === 'user')) {
        const client_details_query = 'select id, client_name, username, email, date_of_joining, company_logo from logindetails where role="client" order by date_of_joining desc;'
        db.query(client_details_query, (err, result) => {
            if (err) {
                console.log(err)
                return res.status(500).json('Server Error Contact Admin!')
            }
            else {
                return res.send(result)
            }
        })

    }
    else {
        return res.status(406).json('Invalid Access')
    }

}

export const deleteclient = async (req, res) => {
    const { isAuth, role } = req.checkAuth
    if (isAuth && role === 'superadmin') {
        console.log(req.body,)
        const { id, company_logo } = req.body

        if (company_logo !== '') {
            // console.log(company_logo)
            // const url = company_logo.slice(0, company_logo.lastIndexOf('/'))
            // const img_name = company_logo.slice(company_logo.lastIndexOf('/'), company_logo.lastIndexOf('.'))
            // const path = url.slice(url.lastIndexOf('/') + 1,) + img_name
            // console.log(path)
            const publicId = company_logo.slice(company_logo.lastIndexOf('/') + 1, company_logo.lastIndexOf('.'))
            try {
                await cloudinary.uploader.destroy(publicId)
                console.log('path', publicId)
            }
            catch (err) {
                console.log(err)
                return res.status(500).json('Server Error Contact Admin!')
            }

        }
        const client_delate_query = 'delete from logindetails where id=?'
        try {
            await db.promise().query(client_delate_query, [id])
            return res.send('Client deleted successfully')
        }
        catch (err) {
            console.log(err)
            return res.status(500).json('Server Error Contact Admin!')
        }

    }
    else {
        return res.status(406).json('Invalid Access')
    }

}

export const editclient = async (req, res) => {
    const { isAuth, role } = req.checkAuth
    if (isAuth && role === 'superadmin') {
        //console.log(req.body,)
        const prevLogoData = req.body.prevData.logo
        const newLogoData = req.body.newData.logo
        let logo;
        if (JSON.stringify(prevLogoData) === JSON.stringify(newLogoData)) {
            logo = newLogoData.url
        }
        else {
            try {
                //console.log(newLogoData, prevLogoData, newLogoData.url === '')
                if (newLogoData.url === '') {
                    const company_logo = prevLogoData.url;
                    const publicId = company_logo.slice(company_logo.lastIndexOf('/') + 1, company_logo.lastIndexOf('.'));
                    //console.log(publicId)
                    await cloudinary.uploader.destroy(publicId);
                    logo = ''

                }
                else {
                    const img_res = await cloudinary.uploader.upload(newLogoData.url, { upload_preset: process.env.UPLOAD_PRESET_COMPANYLOGOS })
                    //console.log(img_res)
                    // Optimize delivery by resizing and applying auto-format and auto-quality
                    const optimizeUrl = cloudinary.url(img_res.url, {
                        fetch_format: 'auto',
                        quality: 'auto'
                    });

                    logo = optimizeUrl;

                }

            }
            catch (err) {
                console.log(err)
            }
        }
        //console.log('logo', logo)
        try {
            const { id, email, date_of_joining } = req.body.newData
            const update_client_query = 'update logindetails set email=?, date_of_joining=?, company_logo=? where id=?'
            const update_client_values = [email, date_of_joining, logo, id]
            await db.promise().query(update_client_query, update_client_values)
            return res.send('Client data updated successfully')

        }
        catch (err) {
            console.log(err)
            return res.status(500).json('Server Error Contact Admin!')

        }

    }
    else {
        return res.status(406).json('Invalid Access')
    }

}