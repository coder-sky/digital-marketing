import { Autocomplete, Box, Button, Container, Grid, Paper, Stack, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import Navbar from '../NavBar/Navbar'
import swal from 'sweetalert';
import Loader from '../Loader';
import LoadingButton from '@mui/lab/LoadingButton';
import India from './India';
import Instance from '../../api/apiInstance';

function ReportForm() {
    const [inputValue, setInputValue] = useState('');
    const [inputValueCampaign, setInputValueCampaign] = useState('');
    const [inputValueState, setInputValueState] = useState('');
    const [inputValueCity, setInputValueCity] = useState('');
    const [fields, setFields] = useState({ client_name: null, campaign_name: null, state: null, city: null, start_date: '', end_date: '', camp_based_on: [], date: '', impressions: 0, cpm: 0, clicks: 0, cpc: 0, sessions: 0, cps: 0, ctr: 0, total_cpm: 0, total_cpc: 0, total_cps: 0, })
    const [clientData, setClientData] = useState([])
    const [campaigns, setCampaigns] = useState([])
    const [campaignData, setCampaignData] = useState([])
    const [loader, setLoader] = useState(false)
    const [loadButton, setLoadButton] = useState(false)




    useEffect(() => {
        const getData = async () => {
            setLoader(true)
            try {
                const api = Instance()
                const res = await api.get('/api/clientdetails')
                // console.log(res.data)
                const data = res.data.map(data => ({ id: data.id, clientName: data.client_name }))
                setClientData(data)
                //setFilterdClientData(data)

                setLoader(false)

            }
            catch (err) {
                setLoader(false)
                swal({
                    title: 'Error Occured!',
                    text: err.response.data,
                    icon: 'error'
                })
            }


        }
        getData()
    }, [])
    const handleClientSelection = async (_, newValue) => {
        // console.log(newValue)
        if (newValue) {
            const { id } = newValue
            try {
                setLoader(true)
                const api = Instance()
                const res = await api.get('/api/campaigns/' + id)
                // console.log(res.data)
                setCampaignData(res.data)
                const data = res.data.map(data => ({ campaignName: data.campaign_name, campId: data.camp_id }))
                setCampaigns(data)
                setFields({ client_name: newValue, campaign_name: null, state: null, city: null, start_date: '', end_date: '', camp_based_on: [], date: '', impressions: 0, cpm: 0, clicks: 0, cpc: 0, sessions: 0, cps: 0, ctr: 0, total_cpm: 0, total_cpc: 0, total_cps: 0, })
                setLoader(false)
            }
            catch (err) {
                setLoader(false)
                swal({
                    title: 'Error Occured!',
                    text: err.response.data,
                    icon: 'error'
                })
            }

        }
        else {
            setFields({ ...fields, client_name: newValue, campaign_name: null, state: null, city: null, start_date: '', end_date: '', camp_based_on: [], date: '', impressions: 0, cpm: 0, clicks: 0, cpc: 0, sessions: 0, cps: 0, ctr: 0, total_cpm: 0, total_cpc: 0, total_cps: 0, })
            setCampaigns([])
        }



    }

    const handleCampaignSelection = (_, newValue) => {
        if (newValue) {
            // console.log(newValue)
            const data = campaignData.filter(camp => camp.camp_id === newValue.campId)[0];
            const { start_date, end_date, camp_based_on, planned_cpm, planned_cpc, planned_cps } = data;
            const stDate = new Date(start_date).toLocaleString('en-CA').slice(0, 10);
            const endDate = new Date(end_date).toLocaleString('en-CA').slice(0, 10);
            const cpm = planned_cpm
            const cpc = planned_cpc
            const cps = planned_cps
            const basedOn = camp_based_on.split(',')
            setFields({ ...fields, campaign_name: newValue, start_date: stDate, end_date: endDate, cpm: cpm, cpc: cpc, cps: cps, camp_based_on: basedOn, state: null, city: null, date: '', impressions: 0, clicks: 0, sessions: 0, ctr: 0, total_cpm: 0, total_cpc: 0, total_cps: 0, })

        }
        else {
            setFields({ ...fields, campaign_name: newValue, state: null, city: null, start_date: '', end_date: '', camp_based_on: [], date: '', impressions: 0, cpm: 0, clicks: 0, cpc: 0, sessions: 0, cps: 0, ctr: 0, total_cpm: 0, total_cpc: 0, total_cps: 0, })
        }

    }

    const handleFieldsChange = (e) => {
        const val = e.target.value === '' ? 0 : e.target.value
        // console.log(val, e.target.name )
        let field, cal, ctrPer;
        if (e.target.name === 'impressions') {
            field = 'total_cpm'
            cal = ((val * fields.cpm) / 1000).toFixed(2)

            if (fields.clicks !== 0 && fields.clicks !== '') {
                ctrPer = ((fields.clicks / val) * 100).toFixed(2)
            }
            else {
                ctrPer = 0
            }


        }
        if (e.target.name === 'cpm') {
            field = 'total_cpm'
            cal = ((fields.impressions * val) / 1000).toFixed(2)
            // console.log(field,cal,e.target.value)
        }
        if (e.target.name === 'clicks') {
            field = 'total_cpc'
            cal = (val * fields.cpc).toFixed(2)
            if (fields.impressions !== 0 && fields.impressions !== '') {
                ctrPer = ((val / fields.impressions) * 100).toFixed(2)
            }
            else {
                ctrPer = 0
            }

        }
        if (e.target.name === 'cpc') {
            field = 'total_cpc'
            cal = (fields.clicks * val).toFixed(2)
        }
        if (e.target.name === 'sessions') {
            field = 'total_cps'
            cal = (val * fields.cps).toFixed(2)
        }
        if (e.target.name === 'cps') {
            field = 'total_cps'
            cal = (fields.sessions * val).toFixed(2)
        }
        // console.log(cal, field,ctrPer)
        if (field !== undefined && cal !== undefined) {
            if (ctrPer !== undefined && ctrPer !== 'Infinity') {
                setFields({ ...fields, [e.target.name]: e.target.value, [field]: cal, ctr: ctrPer })
            }
            else {
                setFields({ ...fields, [e.target.name]: e.target.value, [field]: cal })
            }

        }
        else {
            if (ctrPer !== undefined && ctrPer !== 'Infinity') {
                setFields({ ...fields, [e.target.name]: e.target.value, ctr: ctrPer })
            }
            else {
                setFields({ ...fields, [e.target.name]: e.target.value })
            }

        }
        // if(ctrPer!==undefined&&ctrPer!=='Infinity'){
        //     setFields({...fields, [e.target.name]:e.target.value,ctr:ctrPer})
        // }

    }

    const handleClear = () => {
        setCampaigns([])
        setFields({ client_name: null, campaign_name: null, state: null, city: null, start_date: '', end_date: '', camp_based_on: [], date: '', impressions: 0, cpm: 0, clicks: 0, cpc: 0, sessions: 0, cps: 0, ctr: 0, total_cpm: 0, total_cpc: 0, total_cps: 0, })
    }
    const handleSubmit = (e) => {
        e.preventDefault()
        // console.log(fields)
        setLoadButton(true)
        const api = Instance()
        api.post('/api/addreport', fields)
            .then(res => {
                handleClear()
                setLoadButton(false)
                swal({
                    title: "Success",
                    text: res.data,
                    icon: 'success'
                })
            })
            .catch(err => {
                setLoadButton(false)
                swal({
                    title: "Error Occured!",
                    text: err.response.data,
                    icon: 'error'
                })
            })

    }
    return (
        <>
            <Box sx={{ width: '100%', height: '100vh', backgroundImage: 'url(12244.jpg)', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}>

                <Navbar />
                <Grid container>
                    <Container sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', mt: { xs: 1, xl: 3 } }}>
                        <Grid item xs={12} sm={12} md={12} lg={7} xl={10}>
                            <Paper sx={{ p: 1, }} elevation={20}  >
                                <Typography component={'h1'} variant='p' textAlign={'center'} >Report Form</Typography>
                                <Stack component={'form'} p={2} onSubmit={handleSubmit} spacing={{ xs: 2, xl: 3, }}>

                                    <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
                                        <Autocomplete
                                            disablePortal
                                            options={clientData}
                                            fullWidth
                                            size='small'
                                            isOptionEqualToValue={(option, value) => option.value === value.value}
                                            getOptionLabel={(option) => option.clientName || ""}
                                            renderInput={(params) => <TextField required size='small' {...params} label='Select Client Name' />}
                                            inputValue={inputValue}
                                            onInputChange={(_, newInputValue) => {
                                                setInputValue(newInputValue);
                                            }}
                                            value={fields.client_name}
                                            onChange={handleClientSelection}
                                        />
                                        <Autocomplete
                                            disablePortal
                                            options={campaigns}
                                            fullWidth
                                            size='small'
                                            isOptionEqualToValue={(option, value) => option.value === value.value}
                                            getOptionLabel={(option) => option.campaignName || ""}
                                            renderInput={(params) => <TextField required size='small' {...params} label='Select Campaign Name' />}
                                            inputValue={inputValueCampaign}
                                            onInputChange={(_, newInputValue) => {
                                                setInputValueCampaign(newInputValue);
                                            }}
                                            value={fields.campaign_name}
                                            onChange={handleCampaignSelection}
                                        />

                                    </Stack>
                                    <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
                                        <Autocomplete
                                            disablePortal
                                            options={Object.keys(India).map((st, index) => ({ id: index, state: st }))}
                                            fullWidth
                                            size='small'
                                            isOptionEqualToValue={(option, value) => option.value === value.value}
                                            getOptionLabel={(option) => option.state || ""}
                                            renderInput={(params) => <TextField required size='small' {...params} label='Select State' />}
                                            inputValue={inputValueState}
                                            onInputChange={(_, newInputValue) => {
                                                setInputValueState(newInputValue);
                                            }}
                                            value={fields.state}
                                            onChange={(_, newValue) => {
                                                // console.log(newValue)
                                               
                                                    setFields({ ...fields, state: newValue, city: null })
                                                

                                            }}
                                        />
                                        <Autocomplete
                                            disablePortal
                                            options={fields.state === null ? [] : India[fields.state.state].map((c, i) => ({ id: i, city: c }))}
                                            fullWidth
                                            size='small'
                                            isOptionEqualToValue={(option, value) => option.value === value.value}
                                            getOptionLabel={(option) => option.city || ""}
                                            renderInput={(params) => <TextField required size='small' {...params} label='Select City' />}
                                            inputValue={inputValueCity}
                                            onInputChange={(_, newInputValue) => {
                                                setInputValueCity(newInputValue);
                                            }}
                                            value={fields.city}
                                            onChange={(_, newValue) => {
                                                setFields({ ...fields, city: newValue })
                                            }}
                                        />


                                    </Stack>
                                    <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
                                        <TextField
                                            label='Date'
                                            size='small'
                                            fullWidth
                                            type='date'
                                            inputProps={{ min: fields.start_date, max: fields.end_date }}
                                            InputLabelProps={{ shrink: true }}
                                            value={fields.date}
                                            name='date'
                                            onChange={handleFieldsChange}
                                            required
                                        />
                                        <TextField
                                            label='CTR in %'
                                            size='small'
                                            disabled
                                            fullWidth
                                            value={fields.ctr}
                                        />

                                    </Stack>

                                    <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
                                        <TextField
                                            label='No of Impreessions'
                                            size='small'
                                            fullWidth
                                            name='impressions'
                                            value={fields.impressions}
                                            onChange={handleFieldsChange}
                                            disabled={!fields.camp_based_on.includes('impressions')}
                                        />
                                        <TextField
                                            label='CPM'
                                            size='small'
                                            fullWidth
                                            name='cpm'
                                            value={fields.cpm}
                                            onChange={handleFieldsChange}
                                            disabled={!fields.camp_based_on.includes('impressions')}
                                        />
                                    </Stack>
                                    <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
                                        <TextField
                                            label='No of Clicks'
                                            size='small'
                                            fullWidth
                                            name='clicks'
                                            value={fields.clicks}
                                            onChange={handleFieldsChange}
                                            disabled={!fields.camp_based_on.includes('clicks')}
                                        />
                                        <TextField
                                            label='CPC'
                                            size='small'
                                            fullWidth
                                            name='cpc'
                                            value={fields.cpc}
                                            onChange={handleFieldsChange}
                                            disabled={!fields.camp_based_on.includes('clicks')}
                                        />
                                    </Stack>
                                    <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
                                        <TextField
                                            label='No of Sessions'
                                            size='small'
                                            fullWidth
                                            name='sessions'
                                            value={fields.sessions}
                                            onChange={handleFieldsChange}
                                            disabled={!fields.camp_based_on.includes('sessions')}
                                        />
                                        <TextField
                                            label='CPS'
                                            size='small'
                                            fullWidth
                                            name='cps'
                                            value={fields.cps}
                                            onChange={handleFieldsChange}
                                            disabled={!fields.camp_based_on.includes('sessions')}
                                        />
                                    </Stack>
                                    <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
                                        <TextField
                                            label='Total CPM'
                                            size='small'
                                            value={fields.total_cpm}
                                            disabled
                                            fullWidth

                                        />
                                        <TextField
                                            label='Total CPC'
                                            size='small'
                                            disabled
                                            value={fields.total_cpc}
                                            fullWidth
                                        />
                                        <TextField
                                            label='Total CPS'
                                            size='small'
                                            disabled
                                            value={fields.total_cps}
                                            fullWidth
                                        />
                                    </Stack>

                                    <Stack spacing={4} direction={'row'} display={'flex'} justifyContent={'center'}>
                                        <LoadingButton loading={loadButton} variant='contained' color='success' type='submit'>Submit</LoadingButton>

                                        <Button variant='contained' color='error' type='clear' onClick={handleClear} > Clear</Button>
                                    </Stack>
                                </Stack>
                            </Paper>
                        </Grid>
                    </Container>
                </Grid>
                <Loader loader={loader} />
            </Box>
        </>
    )
}

export default ReportForm