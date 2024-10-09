import express from 'express'
import { addcampaign, campaigndetails, deletecampaign, editcampaign } from '../controllers/campaignform.js'


const route = express.Router()

route.post('/addcampaign', addcampaign)
route.get('/campaigndetails', campaigndetails)
route.delete('/deletecampaign/:id', deletecampaign)
route.put('/editcampaign', editcampaign)


export default route