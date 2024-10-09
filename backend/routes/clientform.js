import express from 'express'
import { addclientdetails, clientdetails, deleteclient, editclient } from '../controllers/clientform.js'

const route = express.Router()

route.post('/addclientdetails', addclientdetails)
route.get('/clientdetails', clientdetails)
route.post('/deleteclient', deleteclient)
route.put('/editclient', editclient)

export default route