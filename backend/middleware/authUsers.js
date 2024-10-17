import jwt from 'jsonwebtoken'


export const checkAuthentication = function (req, res, next) {
    //console.log(req.cookies)
    //console.log(req.headers)
    const authKey = req.headers.authorization //req.cookies.ssid
    //console.log(authKey)
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
            try {
                const verifyKey = jwt.verify(authKey.split(' ')[1], process.env.JWT_SECRET)
                req.checkAuth = {
                    isAuth: true,
                    ...verifyKey
                }
            }
            catch {
                req.checkAuth = {
                    isAuth: false,
                    client_name: 'none',
                    username: 'none',
                    role: 'none',
                    email: 'none'
                }
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