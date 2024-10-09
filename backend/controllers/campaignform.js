import db from "../config/mysqlconnection.js"
import { v4 as uuid4 } from 'uuid'

export const addcampaign = (req, res) => {
    console.log(req.body)
    const { isAuth, role } = req.checkAuth
    if (isAuth && (role === 'superadmin' || role === 'user')) {
        const { clientName, campaignName, startDate, endDate, campaignBasedOn, selectedCampOptions, plannedImpressions, plannedCPM, plannedClicks, plannedCPC, plannedSessions, plannedCPS, ctr, plannedBudgetImpressions, plannedBudgetClicks, plannedBudgetSessions, clientReportAccess } = req.body
        const client_name = clientName.clientName
        const client_id = clientName.id
        const check_campaing_query = 'select * from campaigndetails where campaign_name=? and client_id=?;'
        const check_campaing_values = [campaignName, client_id]
        db.query(check_campaing_query, check_campaing_values, async (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json('Server Error Contact Admin!');
            }
            else {
                if (result.length === 0) {
                    console.log(campaignBasedOn.toString(), selectedCampOptions, clientReportAccess,)

                    const camp_based_on = campaignBasedOn.toString(',')
                    const selected_camp_opt = selectedCampOptions.toString(',')
                    const client_camp_access = clientReportAccess.toString(',')

                    const camp_id = uuid4()
                    console.log(camp_based_on, selected_camp_opt, client_camp_access)

                    const insert_campaign_query = 'insert into campaigndetails values(?)'
                    const insert_campaign_values = [[camp_id, client_name, campaignName, startDate, endDate, camp_based_on, selected_camp_opt, plannedImpressions, plannedCPM, plannedClicks, plannedCPC, plannedSessions, plannedCPS, ctr, plannedBudgetImpressions, plannedBudgetClicks, plannedBudgetSessions, client_camp_access, client_id]]
                    try {
                        await db.promise().query(insert_campaign_query, insert_campaign_values)
                        return res.status(200).json('Campaign added successfully.')
                    }
                    catch (err) {
                        console.log(err)
                        return res.status(500).json('Server Error Contact Admin!')
                    }

                }
                else {
                    return res.status(406).json('Campaign Name Already Exists!')
                }
            }
        })
    }
    else {
        return res.status(406).json('Invalid Access')
    }

}


export const campaigndetails = (req, res) => {
    const { isAuth, role } = req.checkAuth
    if (isAuth && role === 'superadmin') {
        const campaign_details_query = 'select * from campaigndetails order by start_date desc;'
        db.query(campaign_details_query, (err, result) => {
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

export const deletecampaign = async (req, res) => {
    const { isAuth, role } = req.checkAuth
    if (isAuth && role === 'superadmin') {
        //console.log(req.params)
        const { id } = req.params
        const delete_campaign_query = 'delete from campaigndetails where camp_id=?;'
        const delete_campaign_values = [id]
        try {
            await db.promise().query(delete_campaign_query, delete_campaign_values)
            return res.send('Campaign deleted successfully')
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


export const editcampaign = async (req, res) => {
    const { isAuth, role } = req.checkAuth
    if (isAuth && role === 'superadmin') {
        //console.log(req.body)
        const { camp_id, campaign_name, start_date, end_date, camp_based_on, selected_camp_opt, planned_impressions, planned_cpm, planned_clicks, planned_cpc, planned_sessions, planned_cps, ctr, planned_budget_impressions, planned_budget_clicks, planned_budget_sessions, client_camp_access, client_id } = req.body
        const basedOnOpt = camp_based_on.join(',')
        const selectedOpt = selected_camp_opt.join(',')
        const accsessOpt = client_camp_access.join(',')
        const check_campaing_query = 'select * from campaigndetails where campaign_name=? and client_id=? and camp_id!=?;'
        const check_campaing_values = [campaign_name, client_id, camp_id]
        db.query(check_campaing_query, check_campaing_values, async (err, result) => {
            if (err) {
                console.log(err)
                return res.status(500).json('Server Error Contact Admin!')
            }
            else {
                if (result.length == 0) {
                    const update_campaign_query = 'update campaigndetails set campaign_name=?, start_date=?, end_date=?, camp_based_on=?, selected_camp_opt=?, planned_impressions=?, planned_cpm=?, planned_clicks=?, planned_cpc=?, planned_sessions=?, planned_cps=?, ctr=?, planned_budget_impressions=?,  planned_budget_clicks=?, planned_budget_sessions=?, client_camp_access=? where camp_id=? and client_id=?;'
                    const update_campaign_values = [campaign_name, start_date, end_date, basedOnOpt, selectedOpt, planned_impressions, planned_cpm, planned_clicks, planned_cpc, planned_sessions, planned_cps, ctr, planned_budget_impressions, planned_budget_clicks, planned_budget_sessions, accsessOpt, camp_id, client_id]
                    const update_campaign_report = 'update reportdetails set campaign_name=? where camp_id=? and client_id=?'
                    try {
                        await db.promise().query(update_campaign_query, update_campaign_values)
                        await db.promise().query(update_campaign_report,[campaign_name,camp_id, client_id])
                        return res.send('Campaign details updated successfully')
                    }
                    catch (err) {
                        console.log(err)
                        return res.status(500).json('Server Error Contact Admin!')
                    }
                }
                else {
                    return res.status(500).json('Campaign Name already exists!')
                }

            }

        })

    }
    else {
        return res.status(406).json('Invalid Access')
    }

}