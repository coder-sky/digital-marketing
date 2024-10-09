import jwt from 'jsonwebtoken'
//import db from '../config/connectiondb.js'

export const checkAuthentication = function (req, res, next) {
    //console.log(req.body, req.cookies)
    const authKey = req.cookies.ssid
    if (authKey === undefined) {
        req.checkAuth = {
            isAuth: false,
            client_name: 'none',
            username: 'none',
            role: 'none',
            email: 'none'
        }
        next()
    }
    else {
        try {
            const verifyKey = jwt.verify(req.cookies.ssid, process.env.JWT_SECRET)
            req.checkAuth = {
                isAuth: true,
                ...verifyKey
            }
            next()

        }
        catch (err) {
            console.log(err)
            req.checkAuth = {
                isAuth: false,
                client_name: 'none',
                username: 'none',
                role: 'none',
                email: 'none'
            }
            next()

        }


    }



}