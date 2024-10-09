import db from "../config/mysqlconnection.js"


export const campaigns = (req, res) => {
    //console.log(req.checkAuth)
    const { isAuth, role } = req.checkAuth
    if (isAuth && (role === 'superadmin' || role === 'user')) {
        const { id } = req.params
        console.log(id)
        const getcampaigns_query = 'select camp_id, campaign_name, start_date, end_date, camp_based_on, planned_cpm, planned_cpc, planned_cps from campaigndetails where client_id=?;'
        const getcampaigns_value = [id]
        db.query(getcampaigns_query, getcampaigns_value, (err, result) => {
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
    //res.send('ok')
}

export const addreport = (req, res) => {
    const { isAuth, role } = req.checkAuth
    if (isAuth && (role === 'superadmin' || role === 'user')) {
        //console.log(req.body)
        let { client_name, campaign_name, state, city, date, impressions, cpm, clicks, cpc, sessions, cps, ctr, total_cpm, total_cpc, total_cps } = req.body
        const clientName = client_name.clientName
        const clientId = client_name.id
        const campaignName = campaign_name.campaignName;
        const campaignId = campaign_name.campId;
        state = state.state
        city = city.city
        const check_record_query = 'select * from reportdetails where state=? and city=? and date=? and camp_id=? and client_id=?';
        const check_campaing_values = [state, city, date, campaignId, clientId]

        db.query(check_record_query, check_campaing_values, async (err, result) => {
            if (err) {
                console.log(err)
                return res.status(500).json('Server Error Contact Admin!')
            }
            else {
                if (result.length === 0) {
                    try {
                        const insert_record_query = 'insert into reportdetails(client_name, campaign_name,state, city, date, impressions, cpm, clicks, cpc, sessions, cps, total_cpm, total_cpc, total_cps, ctr, camp_id, client_id) values(?)';
                        const insert_record_values = [[clientName, campaignName, state, city, date, impressions, cpm, clicks, cpc, sessions, cps, total_cpm, total_cpc, total_cps, ctr, campaignId, clientId]]
                        await db.promise().query(insert_record_query, insert_record_values)
                        return res.send('Record added successfully')
                    }
                    catch (err) {
                        console.log(err)
                        return res.status(500).json('Server Error Contact Admin!')
                    }
                }
                else {
                    return res.status(406).json('Record already exists!')
                }

            }
        })

        //res.send('ok')


    }
    else {
        return res.status(406).json('Invalid Access')
    }

}

export const reports = (req, res) => {
    const { isAuth, role } = req.checkAuth
    if (isAuth && role === 'superadmin') {
        const getreports_query = 'select reportdetails.id, reportdetails.client_name, reportdetails.campaign_name, state, city, date, impressions, cpm, clicks, cpc, sessions, cps, total_cpm, total_cpc, total_cps, reportdetails.ctr, reportdetails.camp_id, reportdetails.client_id, start_date, end_date, camp_based_on from reportdetails inner join campaigndetails on reportdetails.camp_id = campaigndetails.camp_id order by date desc limit 500;'

        db.query(getreports_query, (err, result) => {
            if (err) {
                console.log(err)
                return res.status(500).json('Server Error Contact Admin!')
            }
            else {
                if (result.length === 0) {
                    return res.send({ data: result, columns: [] })
                }
                else {
                    const col = Object.keys(result[0]).filter(col => !['id', 'camp_id', 'client_id', 'start_date', 'end_date', 'camp_based_on'].includes(col)).map(col => ({ field: col, header: col.replace('_', ' ').toUpperCase() }))
                    return res.send({ data: result, columns: col })
                }

            }
        })

    }
    else {
        return res.status(406).json('Invalid Access')
    }

}

export const searchreports = (req, res) => {
    const { isAuth, role } = req.checkAuth
    if (isAuth && role === 'superadmin') {
        console.log(req.query)
        let { clientName, campaignName, fromDate, toDate } = req.query
        clientName = clientName.clientName
        campaignName = campaignName.campaignName
        let query;
        if (clientName === 'All' && campaignName === 'All' && (fromDate === '' || toDate === '')) {
            query = 'select reportdetails.id, reportdetails.client_name, reportdetails.campaign_name, state, city, date, impressions, cpm, clicks, cpc, sessions, cps, total_cpm, total_cpc, total_cps, reportdetails.ctr, reportdetails.camp_id, reportdetails.client_id, start_date, end_date, camp_based_on from reportdetails inner join campaigndetails on reportdetails.camp_id = campaigndetails.camp_id order by date desc limit 500;'
        }
        else if (clientName === 'All' && campaignName === 'All' && fromDate !== '' && toDate !== '') {
            query = `select reportdetails.id, reportdetails.client_name, reportdetails.campaign_name, state, city, date, impressions, cpm, clicks, cpc, sessions, cps, total_cpm, total_cpc, total_cps, reportdetails.ctr, reportdetails.camp_id, reportdetails.client_id, start_date, end_date, camp_based_on from reportdetails inner join campaigndetails on reportdetails.camp_id = campaigndetails.camp_id where date>='${fromDate}' and date<='${toDate}' order by date desc;`
        }
        else if (clientName !== 'All' && campaignName === 'All' && (fromDate === '' || toDate === '')) {
            query = `select reportdetails.id, reportdetails.client_name, reportdetails.campaign_name, state, city, date, impressions, cpm, clicks, cpc, sessions, cps, total_cpm, total_cpc, total_cps, reportdetails.ctr, reportdetails.camp_id, reportdetails.client_id, start_date, end_date, camp_based_on from reportdetails inner join campaigndetails on reportdetails.camp_id = campaigndetails.camp_id where reportdetails.client_name='${clientName}' order by date desc;`
        }
        else if (clientName !== 'All' && campaignName === 'All' && fromDate !== '' && toDate !== '') {
            query = `select reportdetails.id, reportdetails.client_name, reportdetails.campaign_name, state, city, date, impressions, cpm, clicks, cpc, sessions, cps, total_cpm, total_cpc, total_cps, reportdetails.ctr, reportdetails.camp_id, reportdetails.client_id, start_date, end_date, camp_based_on from reportdetails inner join campaigndetails on reportdetails.camp_id = campaigndetails.camp_id where reportdetails.client_name='${clientName}' and date>='${fromDate}' and date<='${toDate}' order by date desc ;`
        }
        else if (clientName !== 'All' && campaignName !== 'All' && (fromDate === '' || toDate === '')) {
            query = `select reportdetails.id, reportdetails.client_name, reportdetails.campaign_name, state, city, date, impressions, cpm, clicks, cpc, sessions, cps, total_cpm, total_cpc, total_cps, reportdetails.ctr, reportdetails.camp_id, reportdetails.client_id, start_date, end_date, camp_based_on, selected_camp_opt, planned_budget_impressions, planned_budget_clicks, planned_budget_sessions from reportdetails inner join campaigndetails on reportdetails.camp_id = campaigndetails.camp_id where binary reportdetails.client_name='${clientName}' and binary reportdetails.campaign_name='${campaignName}' order by date desc;`
        }
        else if (clientName !== 'All' && campaignName !== 'All' && fromDate !== '' && toDate !== '') {
            query = `select reportdetails.id, reportdetails.client_name, reportdetails.campaign_name, state, city, date, impressions, cpm, clicks, cpc, sessions, cps, total_cpm, total_cpc, total_cps, reportdetails.ctr, reportdetails.camp_id, reportdetails.client_id, start_date, end_date, camp_based_on, selected_camp_opt, planned_budget_impressions, planned_budget_clicks, planned_budget_sessions from reportdetails inner join campaigndetails on reportdetails.camp_id = campaigndetails.camp_id where binary reportdetails.client_name='${clientName}' and binary reportdetails.campaign_name='${campaignName}' and date>='${fromDate}' and date<='${toDate}' order by date desc;`
        }

        //console.log(query)
        db.query(query, (err, result) => {
            if (err) {
                console.log(err)
                return res.status(500).json('Server Error Contact Admin!')
            }
            else {
                if (result.length == 0) {
                    return res.send({ data: [], columns: [] })
                }
                else {
                    const rec = result[0]
                    if (rec['selected_camp_opt']) {
                        //console.log(rec)
                        // const basedOn = {
                        //     impressions : ['cpm', t]
                        // }
                        const campBasedOn = rec['camp_based_on'].split(',')
                        const selectedCol = rec['selected_camp_opt'].split(',')

                        if (campBasedOn.includes('impressions')) {
                            selectedCol.push('total_cpm')
                        }
                        if (campBasedOn.includes('clicks')) {
                            selectedCol.push('total_cpc')
                        }
                        if (campBasedOn.includes('sessions')) {
                            selectedCol.push('total_cps')
                        }
                        //console.log(selectedCol, rec, Object.keys(rec).filter(col => !['id', 'camp_id', 'client_id', 'start_date', 'end_date', 'camp_based_on', 'selected_camp_opt', 'planned_budget_impressions', 'planned_budget_clicks', 'planned_budget_sessions'].includes(col)))
                        let col = Object.keys(rec).filter(col => !['id', 'camp_id', 'client_id', 'start_date', 'end_date', 'camp_based_on', 'selected_camp_opt', 'planned_budget_impressions', 'planned_budget_clicks', 'planned_budget_sessions'].includes(col))//.map(col=>({field:col,header:col.replace('_', ' ').toUpperCase()}))
                        col = [...col.slice(0, 5), ...selectedCol]
                        //console.log(col)
                        const newData = []
                        result.forEach(rec => {
                            const newObj = {}
                            const arr = ['id', 'camp_id', 'client_id', 'start_date', 'end_date', 'camp_based_on', 'selected_camp_opt', 'planned_budget_impressions', 'planned_budget_clicks', 'planned_budget_sessions', ...col]
                            arr.forEach(col => {
                                newObj[col] = rec[col]
                            })
                            newData.push(newObj)
                        })
                        col = col.map(col => ({ field: col, header: col.replace('_', ' ').toUpperCase() }))
                        console.log(col)
                        const stDate = new Date(rec['start_date'])
                        const endDate = new Date(rec['end_date'])
                        const today = new Date()
                        const camp_status = today >= stDate && endDate >= today ? 'Running' : stDate <= today && endDate <= today ? 'Closed' : 'Upcoming'
                        const obj = {
                            impressions: 'total_cpm',
                            clicks: 'total_cpc',
                            sessions: 'total_cps'
                        }
                        const planned_status = campBasedOn.map(val => ({
                            [`Planned Budget ${val[0].toUpperCase() + val.slice(1,)}`]: rec[`planned_budget_${val}`] === 0 ? 'Not Set' : rec[`planned_budget_${val}`],
                            'Target': rec[`planned_budget_${val}`] === 0 ? 'Not Set' : rec[`planned_budget_${val}`] <= newData.reduce((acc, curr_val) => acc + curr_val[obj[val]], 0) ? 'Hit' : 'Not Hit',
                            'Achived': newData.reduce((acc, curr_val) => acc + curr_val[obj[val]], 0),

                        }))
                        //console.log(camp_status)
                        return res.send({ data: newData, columns: col, info: { planned: planned_status, status: camp_status, name: rec['campaign_name'] } })


                    }
                    else {
                        //console.log(result)
                        const col = Object.keys(result[0]).filter(col => !['id', 'camp_id', 'client_id', , 'start_date', 'end_date', 'camp_based_on'].includes(col)).map(col => ({ field: col, header: col.replace('_', ' ').toUpperCase() }))
                        console.log(col)
                        return res.send({ data: result, columns: col })
                    }


                }

            }
        })

        //res.send('ok')
    }
    else {
        return res.status(406).json('Invalid Access')
    }
}

export const deletecampaignrecord = async (req, res) => {
    const { isAuth, role } = req.checkAuth
    if (isAuth && role === 'superadmin') {
        //console.log(req.query)
        const { id, camp_id } = req.query
        try {
            const delete_record_query = 'delete from reportdetails where id=? and camp_id=?'
            await db.promise().query(delete_record_query, [id, camp_id])
            return res.send('Record deleted successfully')

        }
        catch (err) {
            return res.status(500).json('Server Error Contact Admin!')
        }

    }
    else {
        return res.status(406).json('Invalid Access')
    }
}

export const editcampaignreport = async (req, res) => {
    const { isAuth, role } = req.checkAuth
    if (isAuth && role === 'superadmin') {
        let { id, camp_id, campaign_name, state, city, date, impressions, cpm, clicks, cpc, sessions, cps, ctr, total_cpm, total_cpc, total_cps } = req.body
        try {
            state = state.state
            city = city.city
            const check_record_query = 'select * from reportdetails where date=? and state=? and city=? and id!=?'
            const check_record_values = [date, state, city, id]
            db.query(check_record_query, check_record_values, async (err, result) => {
                if (err) {
                    console.log(err)
                    return res.status(500).json('Server Error Contact Admin!')
                }
                else {
                    if (result.length === 0) {
                        try {
                            const update_record_query = 'update reportdetails set state=?, city=?, date=?, impressions=?, cpm=?, clicks=?, cpc=?, sessions=?, cps=?, ctr=?, total_cpm=?, total_cpc=?, total_cps=? where id=? and camp_id=? and campaign_name=?'
                            const update_record_values = [state, city, date, impressions, cpm, clicks, cpc, sessions, cps, ctr, total_cpm, total_cpc, total_cps, id, camp_id, campaign_name]
                            await db.promise().query(update_record_query, update_record_values)
                            return res.send('Record updated successfully')
                        }
                        catch (err) {
                            console.log(err)
                            return res.status(500).json('Server Error Contact Admin!')
                        }

                    }
                    else {
                        return res.status(406).json('Record already exists in selected campaign')
                    }
                }
            })

        }
        catch (err) {
            return res.status(500).json('Server Error Contact Admin!')
        }
    }
    else {
        return res.status(406).json('Invalid Access')
    }

}




export const clientdashboard = async (req, res) => {
    const { isAuth, role } = req.checkAuth
    if (isAuth && (role === 'superadmin' || role === 'client')) {
        console.log('came', req.query)
        try {
            const { client_id } = req.query

            const camp_info_query = 'select count(campaign_name) as total_campaigns, count(if(end_date>curdate(),1,null)) as live_campaigns,  count(if(end_date<=curdate(),1,null)) as closed_campaigns from campaigndetails where client_id=?'
            const camp_info_values = [client_id]
            const infoResult = await db.promise().query(camp_info_query, camp_info_values)
            const campInfo = infoResult[0][0]
            const campaigns_query = 'select campaign_name, camp_id from campaigndetails where client_id=? order by start_date desc;'
            const campaignsResult = await db.promise().query(campaigns_query, [client_id])
            const campaigns = campaignsResult[0]
            //---------------------------------------
            const most_recent_campaign_query = 'select campaigndetails.campaign_name, campaigndetails.camp_id from campaigndetails inner join reportdetails  on reportdetails.camp_id = campaigndetails.camp_id where  campaigndetails.client_id = ? order by start_date desc limit 1;'
            const mostRecentCampResult = await db.promise().query(most_recent_campaign_query, [client_id])
            const mostRecentCamp = mostRecentCampResult[0]

            //console.log(campInfo)
            // const campaign_records_query = 'select reportdetails.id, reportdetails.client_name, reportdetails.campaign_name, state, city, date, impressions, cpm, clicks, cpc, sessions, cps, total_cpm, total_cpc, total_cps, reportdetails.ctr, reportdetails.camp_id, reportdetails.client_id, campaigndetails.camp_based_on, campaigndetails.client_camp_access from reportdetails inner join campaigndetails on reportdetails.camp_id=reportdetails.camp_id where reportdetails.camp_id=(select campaigndetails.camp_id from campaigndetails inner join reportdetails  on reportdetails.camp_id = campaigndetails.camp_id where  campaigndetails.client_id = ? order by start_date desc limit 1) and campaigndetails.client_id=? limit 30;'
            // const recordResult = await db.promise().query(campaign_records_query, [client_id, client_id])

            let areaGraphData = { labels: [], data: [] }
            let donutGraphData = { labels: [], data: [] }
            let tableData = { headers: [], data: [] }
            let selectedCamp = null
            if (mostRecentCamp.length !== 0) {
                const { camp_id } = mostRecentCamp[0]
                selectedCamp = mostRecentCamp[0]
                const top_30_dates_query = 'select distinct date from reportdetails where camp_id = ? order by date desc limit 30;'
                const top_30Result = await db.promise().query(top_30_dates_query, [camp_id])
                const dates = top_30Result[0].map(val => new Date(val.date))
                dates.reverse()
                //console.log(camp_id, dates)
                const campaign_records_query = 'select reportdetails.id, reportdetails.client_name, reportdetails.campaign_name, state, city, date, impressions, cpm, clicks, cpc, sessions, cps, total_cpm, total_cpc, total_cps, reportdetails.ctr, reportdetails.camp_id, reportdetails.client_id, campaigndetails.camp_based_on, campaigndetails.client_camp_access from reportdetails inner join campaigndetails on campaigndetails.camp_id=reportdetails.camp_id where campaigndetails.client_id = ? and campaigndetails.camp_id =? and reportdetails.date in (?)'
                const recordResult = await db.promise().query(campaign_records_query, [client_id, camp_id, dates])
                const campRecords = recordResult[0]
                const campBasedOn = campRecords[0]['camp_based_on'].split(',')
                const clientAccess = campRecords[0]['client_camp_access'].split(',')
                let col = Object.keys(campRecords[0])
                //console.log('test',campBasedOn.map(camp => ({ [camp]:dates.map(date=>campRecords.filter(rec=>new Date(rec.date).toString()===new Date(date).toString()).reduce((acc,curr)=>acc+curr[camp],0))})))
                // const obj = {}
                // dates.forEach(date=>{
                //     const day_rec = campRecords.filter(rec=>new Date(rec.date).toString()===new Date(date).toString())
                //     let im; 
                //     day_rec.forEach(rec)
                // })

                col = col.filter(name => [...clientAccess, 'state', 'city', 'date'].includes(name))
                areaGraphData = { labels: dates.map(date => new Date(date).toLocaleString(undefined, { month: 'short', day: '2-digit' }).slice(0, 10)), data: campBasedOn.map(camp => ({ [camp]: dates.map(date => campRecords.filter(rec => new Date(rec.date).toString() === new Date(date).toString()).reduce((acc, curr) => acc + curr[camp], 0)) })) }
                donutGraphData = { labels: campBasedOn.map(camp => camp[0].toUpperCase() + camp.slice(1,)), data: campBasedOn.map(camp => (campRecords.reduce((acc, curr) => acc + curr[camp], 0))) }
                //console.log(col)
                const newData = []
                campRecords.forEach(rec => {
                    const newObj = {}

                    col.forEach(col => {
                        newObj[col] = rec[col]
                    })
                    newData.push(newObj)
                })

                tableData = { headers: col.map(col => ({ field: col, header: col.toUpperCase().replace('_', ' ') })), data: newData.map(data => ({ ...data, date: new Date(data.date).toLocaleString('en-CA').slice(0, 9) })) }

            }



            //console.log(areaGraphData, donutGraphData, tableData)
            return res.send({ campInfo: campInfo, campaigns: campaigns, areaGraphData: areaGraphData, donutGraphData: donutGraphData, tableData: tableData, selectedCamp: selectedCamp })
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

export const campaigninfo = async (req, res) => {
    const { isAuth, role } = req.checkAuth
    console.log(req.query)
    if (isAuth && role === 'client') {
        try {
            const { client_id, campaign } = req.query



            let areaGraphData = { labels: [], data: [] }
            let donutGraphData = { labels: [], data: [] }
            let tableData = { headers: [], data: [] }
            let selectedCamp = null

            const { camp_id, campaign_name } = campaign
            selectedCamp = campaign_name
            const top_30_dates_query = 'select distinct date from reportdetails where camp_id = ? order by date desc limit 30;'
            const top_30Result = await db.promise().query(top_30_dates_query, [camp_id])
            const dates = top_30Result[0].map(val => new Date(val.date))
            dates.reverse()
            //console.log(camp_id, dates)
            const campaign_records_query = 'select reportdetails.id, reportdetails.client_name, reportdetails.campaign_name, state, city, date, impressions, cpm, clicks, cpc, sessions, cps, total_cpm, total_cpc, total_cps, reportdetails.ctr, reportdetails.camp_id, reportdetails.client_id, campaigndetails.camp_based_on, campaigndetails.client_camp_access from reportdetails inner join campaigndetails on campaigndetails.camp_id=reportdetails.camp_id where campaigndetails.client_id = ? and campaigndetails.camp_id =? and reportdetails.date in (?)'
            const recordResult = await db.promise().query(campaign_records_query, [client_id, camp_id, dates])
            const campRecords = recordResult[0]
            const campBasedOn = campRecords[0]['camp_based_on'].split(',')
            const clientAccess = campRecords[0]['client_camp_access'].split(',')
            let col = Object.keys(campRecords[0])
            //console.log('test',campBasedOn.map(camp => ({ [camp]:dates.map(date=>campRecords.filter(rec=>new Date(rec.date).toString()===new Date(date).toString()).reduce((acc,curr)=>acc+curr[camp],0))})))
            // const obj = {}
            // dates.forEach(date=>{
            //     const day_rec = campRecords.filter(rec=>new Date(rec.date).toString()===new Date(date).toString())
            //     let im; 
            //     day_rec.forEach(rec)
            // })

            col = col.filter(name => [...clientAccess, 'state', 'city', 'date'].includes(name))
            areaGraphData = { labels: dates.map(date => new Date(date).toLocaleString(undefined, { month: 'short', day: '2-digit' }).slice(0, 10)), data: campBasedOn.map(camp => ({ [camp]: dates.map(date => campRecords.filter(rec => new Date(rec.date).toString() === new Date(date).toString()).reduce((acc, curr) => acc + curr[camp], 0)) })) }
            donutGraphData = { labels: campBasedOn.map(camp => camp[0].toUpperCase() + camp.slice(1,)), data: campBasedOn.map(camp => (campRecords.reduce((acc, curr) => acc + curr[camp], 0))) }
            //console.log(col)
            const newData = []
            campRecords.forEach(rec => {
                const newObj = {}

                col.forEach(col => {
                    newObj[col] = rec[col]
                })
                newData.push(newObj)
            })

            tableData = { headers: col.map(col => ({ field: col, header: col.toUpperCase().replace('_', ' ') })), data: newData.map(data => ({ ...data, date: new Date(data.date).toLocaleString('en-CA').slice(0, 9) })) }





            //console.log(areaGraphData, donutGraphData, tableData)
            return res.send({areaGraphData: areaGraphData, donutGraphData: donutGraphData, tableData: tableData, selectedCamp: selectedCamp })
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

export const searchcampaign = async (req, res) => {
    const { isAuth, role } = req.checkAuth
    if (isAuth && (role === 'superadmin' || role === 'client')) {
        console.log('came', req.query)
        try {
            const { campaign_name, from_date, to_date } = req.query
            const campaign_records_query = 'select reportdetails.id, reportdetails.client_name, reportdetails.campaign_name, state, city, date, impressions, cpm, clicks, cpc, sessions, cps, total_cpm, total_cpc, total_cps, reportdetails.ctr,reportdetails.camp_id,  reportdetails.camp_id, reportdetails.client_id, campaigndetails.camp_based_on, campaigndetails.client_camp_access from reportdetails inner join campaigndetails on reportdetails.camp_id=campaigndetails.camp_id where campaigndetails.camp_id =? and reportdetails.date>=? and reportdetails.date<=? order by date;'
            const recordResult = await db.promise().query(campaign_records_query, [campaign_name.camp_id, from_date, to_date])
            const campRecords = recordResult[0]
            let areaGraphData = { labels: [], data: [] }
            let donutGraphData = { labels: [], data: [] }
            let tableData = { headers: [], data: [] }
            if (campRecords.length !== 0) {
                console.log(campRecords)
                const dates = Array.from(new Set(campRecords.map(rec => new Date(rec.date).toString())))
                console.log(dates)
                const campBasedOn = campRecords[0]['camp_based_on'].split(',')
                const clientAccess = campRecords[0]['client_camp_access'].split(',')
                let col = Object.keys(campRecords[0])
                col = col.filter(name => [...clientAccess, 'state', 'city', 'date'].includes(name))
                areaGraphData = { labels: dates.map(date => new Date(date).toLocaleString(undefined, { month: 'short', day: '2-digit' }).slice(0, 10)), data: campBasedOn.map(camp => ({ [camp]: dates.map(date => campRecords.filter(rec => new Date(rec.date).toString() === new Date(date).toString()).reduce((acc, curr) => acc + curr[camp], 0)) })) }
                donutGraphData = { labels: campBasedOn.map(camp => camp[0].toUpperCase() + camp.slice(1,)), data: campBasedOn.map(camp => (campRecords.reduce((acc, curr) => acc + curr[camp], 0))) }

                const newData = []
                campRecords.forEach(rec => {
                    const newObj = {}

                    col.forEach(col => {
                        newObj[col] = rec[col]
                    })
                    newData.push(newObj)
                })

                tableData = { headers: col.map(col => ({ field: col, header: col.toUpperCase().replace('_', ' ') })), data: newData.map(data => ({ ...data, date: new Date(data.date).toLocaleString('en-CA').slice(0, 9) })) }

            }
            return res.send({ areaGraphData: areaGraphData, donutGraphData: donutGraphData, tableData: tableData })



        }
        catch (err) {
            console.log(err)

        }
        res.send('ok')
    }
    else {
        return res.status(406).json('Invalid Access')
    }
}


export const clientdashboardadmin = async (req, res) => {
    const { isAuth, role } = req.checkAuth
    if (isAuth && (role === 'superadmin')) {
        try {
            const { clientName, campId } = req.query

            const camp_info_query = 'select count(campaign_name) as total_campaigns, count(if(end_date>curdate(),1,null)) as live_campaigns,  count(if(end_date<=curdate(),1,null)) as closed_campaigns from campaigndetails where client_name=?'
            const camp_info_values = [clientName]
            const infoResult = await db.promise().query(camp_info_query, camp_info_values)
            const campInfo = infoResult[0][0]
            // const campaigns_query = 'select campaign_name, camp_id from campaigndetails where client_id=? order by start_date desc;'
            // const campaignsResult = await db.promise().query(campaigns_query, [client_id])
            // const campaigns = campaignsResult[0]
            // //---------------------------------------
            // const most_recent_campaign_query = 'select campaigndetails.campaign_name, campaigndetails.camp_id from campaigndetails inner join reportdetails  on reportdetails.camp_id = campaigndetails.camp_id where  campaigndetails.client_id = ? order by start_date desc limit 1;'
            // const mostRecentCampResult = await db.promise().query(most_recent_campaign_query, [client_id])
            // const mostRecentCamp = mostRecentCampResult[0]

            // //console.log(campInfo)
            // // const campaign_records_query = 'select reportdetails.id, reportdetails.client_name, reportdetails.campaign_name, state, city, date, impressions, cpm, clicks, cpc, sessions, cps, total_cpm, total_cpc, total_cps, reportdetails.ctr, reportdetails.camp_id, reportdetails.client_id, campaigndetails.camp_based_on, campaigndetails.client_camp_access from reportdetails inner join campaigndetails on reportdetails.camp_id=reportdetails.camp_id where reportdetails.camp_id=(select campaigndetails.camp_id from campaigndetails inner join reportdetails  on reportdetails.camp_id = campaigndetails.camp_id where  campaigndetails.client_id = ? order by start_date desc limit 1) and campaigndetails.client_id=? limit 30;'
            // // const recordResult = await db.promise().query(campaign_records_query, [client_id, client_id])

            let areaGraphData = { labels: [], data: [] }
            let donutGraphData = { labels: [], data: [] }
            let tableData = { headers: [], data: [] }


            // const { camp_id } = mostRecentCamp[0]
            // selectedCamp = mostRecentCamp[0]
            const top_30_dates_query = 'select distinct date from reportdetails where camp_id = ? order by date desc limit 30;'
            const top_30Result = await db.promise().query(top_30_dates_query, [campId])
            const dates = top_30Result[0].map(val => new Date(val.date))
            dates.reverse()
            //console.log(camp_id, dates)
            const campaign_records_query = 'select reportdetails.id, reportdetails.client_name, reportdetails.campaign_name, state, city, date, impressions, cpm, clicks, cpc, sessions, cps, total_cpm, total_cpc, total_cps, reportdetails.ctr, reportdetails.camp_id, reportdetails.client_id, campaigndetails.camp_based_on, campaigndetails.client_camp_access from reportdetails inner join campaigndetails on campaigndetails.camp_id=reportdetails.camp_id where campaigndetails.client_name = ? and campaigndetails.camp_id =? and reportdetails.date in (?)'
            const recordResult = await db.promise().query(campaign_records_query, [clientName, campId, dates])
            const campRecords = recordResult[0]
            const campBasedOn = campRecords[0]['camp_based_on'].split(',')
            const clientAccess = campRecords[0]['client_camp_access'].split(',')
            let col = Object.keys(campRecords[0])
            //console.log('test',campBasedOn.map(camp => ({ [camp]:dates.map(date=>campRecords.filter(rec=>new Date(rec.date).toString()===new Date(date).toString()).reduce((acc,curr)=>acc+curr[camp],0))})))
            // const obj = {}
            // dates.forEach(date=>{
            //     const day_rec = campRecords.filter(rec=>new Date(rec.date).toString()===new Date(date).toString())
            //     let im; 
            //     day_rec.forEach(rec)
            // })

            col = col.filter(name => [...clientAccess, 'state', 'city', 'date'].includes(name))
            areaGraphData = { labels: dates.map(date => new Date(date).toLocaleString(undefined, { month: 'short', day: '2-digit' }).slice(0, 10)), data: campBasedOn.map(camp => ({ [camp]: dates.map(date => campRecords.filter(rec => new Date(rec.date).toString() === new Date(date).toString()).reduce((acc, curr) => acc + curr[camp], 0)) })) }
            donutGraphData = { labels: campBasedOn.map(camp => camp[0].toUpperCase() + camp.slice(1,)), data: campBasedOn.map(camp => (campRecords.reduce((acc, curr) => acc + curr[camp], 0))) }
            //console.log(col)
            const newData = []
            campRecords.forEach(rec => {
                const newObj = {}

                col.forEach(col => {
                    newObj[col] = rec[col]
                })
                newData.push(newObj)
            })

            tableData = { headers: col.map(col => ({ field: col, header: col.toUpperCase().replace('_', ' ') })), data: newData.map(data => ({ ...data, date: new Date(data.date).toLocaleString('en-CA').slice(0, 9) })) }





            //console.log(campRecords[0]['campaign_name'])
            return res.send({ campInfo: campInfo, areaGraphData: areaGraphData, donutGraphData: donutGraphData, tableData: tableData, selectedCamp: campRecords[0]['campaign_name'] })
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