import {checkuser, forgotpasword, login, logout, resetpassword, verifycode} from '../controllers/auth.js'
import express from 'express'

const route = express.Router()

route.post('/login', login)
route.post('/forgotpassword', forgotpasword)
route.post('/verifycode', verifycode)
route.put('/resetpassword', resetpassword)
route.get('/checkuser', checkuser)
route.get('/logout', logout)

export default route