import express from 'express'
import { addreport, campaigninfo, campaigns, clientdashboard, clientdashboardadmin, deletecampaignrecord, editcampaignreport, reports, searchcampaign, searchreports } from '../controllers/reportform.js'


const route = express.Router()

route.get('/campaigns/:id', campaigns)
route.post('/addreport', addreport)
route.get('/reports', reports)
route.get('/searchreports/', searchreports)
route.delete('/deletecampaignrecord', deletecampaignrecord)
route.put('/editcampaignreport', editcampaignreport)
route.get('/clientdashboard-admin', clientdashboardadmin)
//client
route.get('/clientdashboard', clientdashboard)
route.get('/searchcampaign', searchcampaign)
route.get('/campaigninfo',campaigninfo)


export default route