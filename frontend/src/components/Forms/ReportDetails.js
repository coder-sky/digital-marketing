import { Autocomplete, Box, Button, Card, CardContent, Collapse, Container, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton, InputAdornment, Slide, Stack, TextField, Typography, keyframes, } from '@mui/material'
import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import Navbar from '../NavBar/Navbar'
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import swal from 'sweetalert';
import { Circle, FileDownload, Search } from '@mui/icons-material';
import Loader from '../Loader';
import LoadingButton from '@mui/lab/LoadingButton';
import India from './India';
import { useNavigate } from 'react-router-dom';
import Instance from '../../api/apiInstance';


const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const spin = keyframes`
  0%{
  opacity: 1;
  }
  50%{
  opacity: 0;
  }
  100%{
  opacity: 1;
  }
`;


function ReportDetails() {
    const [reportData, setReportData] = useState({ columns: [], data: [] })
    const [filtedReportData, setFiltedReportData] = useState(reportData.data)
    const [loader, setLoader] = useState(false)
    const [update, setUpdate] = useState(0)
    const [searchFields, setSearchFields] = useState({ clientName: null, campaignName: null, fromDate: '', toDate: '' })
    const [editFields, setEditFields] = useState({ id: '', camp_id: '', client_name: '', campaign_name: '', date: '', start_date: '', end_date: '', state: null, city: null, camp_based_on: [], impressions: 0, cpm: 0, clicks: 0, cpc: 0, sessions: 0, cps: 0, total_cpm: 0, total_cpc: 0, total_cps: 0, ctr: 0, planned_budget_impressions: 0, planned_budget_clicks: 0, planned_budget_sessions: 0, client_id: '' })
    const [prevEditFields, setPrevEditFields] = useState(editFields)
    const [open, setOpen] = useState(false);
    const [loadButton, setLoadButton] = useState(false)
    const [inputValue, setInputValue] = useState('');
    const [inputValueCampaign, setInputValueCampaign] = useState('');
    const [clientData, setClientData] = useState([])
    const [campaigns, setCampaigns] = useState([])
    const [campaignInfo, setCampaignInfo] = useState({ name: '', status: '', planned: [] })
    const [inputValueState, setInputValueState] = useState('');
    const [inputValueCity, setInputValueCity] = useState('');
    const dt = useRef(null);
    const navigate = useNavigate()

    const handleClose = () => {
        setEditFields({ id: '', camp_id: '', client_name: '', campaign_name: '', date: '', start_date: '', end_date: '', state: null, city: null, camp_based_on: [], impressions: 0, cpm: 0, clicks: 0, cpc: 0, sessions: 0, cps: 0, total_cpm: 0, total_cpc: 0, total_cps: 0, ctr: 0, planned_budget_impressions: 0, planned_budget_clicks: 0, planned_budget_sessions: 0, client_id: '' })
        setOpen(false);
    };




    useEffect(() => {
        const getData = async () => {
            setLoader(true)
            try {
                const api = Instance()
                const res = await api.get('/api/reports')
                // console.log(res.data)
                const data = res.data.data.map(data => ({ ...data, date: new Date(data.date).toLocaleString('en-CA').slice(0, 10), start_date: new Date(data.start_date).toLocaleString('en-CA').slice(0, 10), end_date: new Date(data.end_date).toLocaleString('en-CA').slice(0, 10) }))
                setReportData({ ...res.data, data: data })
                setFiltedReportData(data)
                const result = await api.get('/api/clientdetails')
                // console.log(res.data)
                const dataCli = result.data.map(data => ({ id: data.id, clientName: data.client_name }))
                dataCli.unshift({ id: 1, clientName: 'All' })
                setClientData(dataCli)

                setLoader(false)
            }
            catch (err) {
                // console.log(err)
                setLoader(false)
                swal({
                    title: 'Error Occured!',
                    text: err.response.data,
                    icon: 'error'
                })
            }
        }
        getData()
    }, [update])


    const handleDeleteRow = (row) => {
        swal({
            title: "Do you want delete record?",
            text: "Once deleted, you will not be able to recover this details!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    // console.log(row)
                    const api = Instance()
                    api.delete('/api/deletecampaignrecord/', { params: { id: row.id, camp_id: row.camp_id } })
                        .then(res => {
                            setUpdate(prev => prev + 1)
                            swal(res.data, {
                                icon: "success",
                            });
                        })
                        .catch(err => {
                            swal(err.response.data, {
                                icon: "error",
                            });
                        })

                }
            });
    }

    const handleEdit = (rowData) => {
        const based_on = rowData.camp_based_on.split(',')
        // console.log({ ...rowData, camp_based_on: based_on, state: { id: 0, state: rowData.state }, city: { id: 0, city: rowData.city } })

        setEditFields({ ...rowData, camp_based_on: based_on, state: { id: 0, state: rowData.state }, city: { id: 0, city: rowData.city } })
        setPrevEditFields({ ...rowData, camp_based_on: based_on, state: { id: 0, state: rowData.state }, city: { id: 0, city: rowData.city } })
        setOpen(true)

    }
    const actionTemplete = (rowData) => {
        return (
            <>
                <Stack direction={'row'} spacing={1} display={'flex'} justifyContent={'center'}>
                    <Button size='small' variant='contained' color='info' onClick={() => handleEdit(rowData)}>Edit</Button>
                    <Divider orientation="vertical" flexItem />
                    <Button size='small' variant='contained' onClick={() => handleDeleteRow(rowData)} color='error'>Delete</Button>
                </Stack>
            </>
        )
    };

    const handleNavigate = (e) => {
        const val = e.value
        // console.log('/client-dashboard/' + val.client_name + '/' + val.camp_id)
        const path = '/client-dashboard/' + val.client_name + '/' + val.camp_id
        navigate(path)


    }

    const editMode = useMemo(() => {

        const handleFieldsChange = (e) => {
            const val = e.target.value === '' ? 0 : e.target.value
            // console.log(val, e.target.name )
            let field, cal, ctrPer;
            if (e.target.name === 'impressions') {
                field = 'total_cpm'
                cal = ((val * editFields.cpm) / 1000).toFixed(2)

                if (editFields.clicks !== 0 && editFields.clicks !== '') {
                    ctrPer = ((editFields.clicks / val) * 100).toFixed(2)
                }
                else {
                    ctrPer = 0
                }


            }
            if (e.target.name === 'cpm') {
                field = 'total_cpm'
                cal = ((editFields.impressions * val) / 1000).toFixed(2)
                // console.log(field,cal,e.target.value)
            }
            if (e.target.name === 'clicks') {
                field = 'total_cpc'
                cal = (val * editFields.cpc).toFixed(2)
                if (editFields.impressions !== 0 && editFields.impressions !== '') {
                    ctrPer = ((val / editFields.impressions) * 100).toFixed(2)
                }
                else {
                    ctrPer = 0
                }

            }
            if (e.target.name === 'cpc') {
                field = 'total_cpc'
                cal = (editFields.clicks * val).toFixed(2)
            }
            if (e.target.name === 'sessions') {
                field = 'total_cps'
                cal = (val * editFields.cps).toFixed(2)
            }
            if (e.target.name === 'cps') {
                field = 'total_cps'
                cal = (editFields.sessions * val).toFixed(2)
            }
            // console.log(cal, field,ctrPer)
            if (field !== undefined && cal !== undefined) {
                if (ctrPer !== undefined && ctrPer !== 'Infinity') {
                    setEditFields({ ...editFields, [e.target.name]: e.target.value, [field]: cal, ctr: ctrPer })
                }
                else {
                    setEditFields({ ...editFields, [e.target.name]: e.target.value, [field]: cal })
                }

            }
            else {
                if (ctrPer !== undefined && ctrPer !== 'Infinity') {
                    setEditFields({ ...editFields, [e.target.name]: e.target.value, ctr: ctrPer })
                }
                else {
                    setEditFields({ ...editFields, [e.target.name]: e.target.value })
                }

            }
        }

        const handleSubmit = async (e) => {
            e.preventDefault()
            // console.log(editFields)
            // console.log(editFields.camp_based_on.length===0)

            if (JSON.stringify(prevEditFields) !== JSON.stringify(editFields)) {
                setLoadButton(true)
                try {
                    // console.log('edit', editFields)
                    const api = Instance()
                    const res = await api.put('/api/editcampaignreport', editFields)
                    // console.log(res.data)
                    setLoadButton(false)
                    handleClose()
                    if (searchFields.campaignName !== null && searchFields.clientName !== null) {
                        const res = await api.get(`/api/searchreports/`, { params: searchFields })
                        if (res.data.info !== undefined) {
                            setCampaignInfo(res.data.info)
                            // console.log(res.data.info,'done')
                        }
                        else {
                            campaignInfo.planned.length !== 0 && setCampaignInfo({ name: '', status: '', planned: [] })
                        }
                        
                        const data = res.data.data.map(data => ({ ...data, date: new Date(data.date).toLocaleString('en-CA').slice(0, 10), start_date: new Date(data.start_date).toLocaleString('en-CA').slice(0, 10), end_date: new Date(data.end_date).toLocaleString('en-CA').slice(0, 10) }))
                        //console.log('data', data)
                        setReportData({ ...res.data, data: data })
                        setFiltedReportData(data)
                    }
                    else {
                        setUpdate(prev => prev + 1)
                    }

                    swal({
                        title: "Success",
                        text: res.data,
                        icon: "success"
                    })

                }
                catch (err) {
                    setLoadButton(false)
                    swal({
                        title: 'Error Occured!',
                        text: err.response.data,
                        icon: 'error'
                    })
                }
                // console.log(editFields)
            }




        }
        return (
            <>
                <Dialog
                    fullWidth={true}
                    maxWidth={'md'}
                    open={open}
                    onClose={handleClose}
                    TransitionComponent={Transition}
                    keepMounted
                >
                    <DialogTitle sx={{ fontWeight: 'bold' }}>Edit Report</DialogTitle>
                    <DialogContent>
                        <Stack component={'form'} p={2} id='editreportform' onSubmit={handleSubmit} spacing={{ xs: 2, xl: 3, }}>

                            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
                                <TextField
                                    label='Client Name'
                                    size='small'
                                    fullWidth
                                    name='client_name'
                                    value={editFields.client_name}
                                    disabled

                                />
                                <TextField
                                    label='Campaign Name'
                                    size='small'
                                    fullWidth
                                    name='campaign_name'
                                    value={editFields.campaign_name}
                                    disabled

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
                                    value={editFields.state}
                                    onChange={(_, newValue) => {
                                        // console.log(newValue)
                                        if (newValue) {
                                            setEditFields({ ...editFields, state: newValue })
                                        }
                                        else {
                                            setEditFields({ ...editFields, state: newValue, city: null })
                                        }

                                    }}
                                />
                                <Autocomplete
                                    disablePortal
                                    options={editFields.state === null ? [] : India[editFields.state.state].map((c, i) => ({ id: i, city: c }))}
                                    fullWidth
                                    size='small'
                                    isOptionEqualToValue={(option, value) => option.value === value.value}
                                    getOptionLabel={(option) => option.city || ""}
                                    renderInput={(params) => <TextField required size='small' {...params} label='Select City' />}
                                    inputValue={inputValueCity}
                                    onInputChange={(_, newInputValue) => {
                                        setInputValueCity(newInputValue);
                                    }}
                                    value={editFields.city}
                                    onChange={(_, newValue) => {
                                        setEditFields({ ...editFields, city: newValue })
                                    }}
                                />


                            </Stack>
                            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
                                <TextField
                                    label='Date'
                                    size='small'
                                    fullWidth
                                    type='date'
                                    inputProps={{ min: editFields.start_date, max: editFields.end_date }}
                                    InputLabelProps={{ shrink: true }}
                                    value={editFields.date}
                                    name='date'
                                    onChange={handleFieldsChange}
                                    required
                                />
                                <TextField
                                    label='CTR in %'
                                    size='small'
                                    disabled
                                    fullWidth
                                    value={editFields.ctr}
                                />

                            </Stack>

                            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
                                <TextField
                                    label='No of Impreessions'
                                    size='small'
                                    fullWidth
                                    name='impressions'
                                    value={editFields.impressions}
                                    onChange={handleFieldsChange}
                                    disabled={!editFields.camp_based_on.includes('impressions')}
                                />
                                <TextField
                                    label='CPM'
                                    size='small'
                                    fullWidth
                                    name='cpm'
                                    value={editFields.cpm}
                                    onChange={handleFieldsChange}
                                    disabled={!editFields.camp_based_on.includes('impressions')}
                                />
                            </Stack>
                            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
                                <TextField
                                    label='No of Clicks'
                                    size='small'
                                    fullWidth
                                    name='clicks'
                                    value={editFields.clicks}
                                    onChange={handleFieldsChange}
                                    disabled={!editFields.camp_based_on.includes('clicks')}
                                />
                                <TextField
                                    label='CPC'
                                    size='small'
                                    fullWidth
                                    name='cpc'
                                    value={editFields.cpc}
                                    onChange={handleFieldsChange}
                                    disabled={!editFields.camp_based_on.includes('clicks')}
                                />
                            </Stack>
                            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
                                <TextField
                                    label='No of Sessions'
                                    size='small'
                                    fullWidth
                                    name='sessions'
                                    value={editFields.sessions}
                                    onChange={handleFieldsChange}
                                    disabled={!editFields.camp_based_on.includes('sessions')}
                                />
                                <TextField
                                    label='CPS'
                                    size='small'
                                    fullWidth
                                    name='cps'
                                    value={editFields.cps}
                                    onChange={handleFieldsChange}
                                    disabled={!editFields.camp_based_on.includes('sessions')}
                                />
                            </Stack>
                            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
                                <TextField
                                    label='Total CPM'
                                    size='small'
                                    value={editFields.total_cpm}
                                    disabled
                                    fullWidth

                                />
                                <TextField
                                    label='Total CPC'
                                    size='small'
                                    disabled
                                    value={editFields.total_cpc}
                                    fullWidth
                                />
                                <TextField
                                    label='Total CPS'
                                    size='small'
                                    disabled
                                    value={editFields.total_cps}
                                    fullWidth
                                />
                            </Stack>


                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Stack spacing={1} direction={'row'}>
                            <Button color='error' onClick={handleClose}>cancel</Button>
                            <LoadingButton loading={loadButton} color='success' form='editreportform' type='submit'  >Save</LoadingButton>
                        </Stack>
                    </DialogActions>
                </Dialog>

            </>
        )
    }, [editFields, open, prevEditFields, loadButton, inputValueCity, inputValueState,campaignInfo,searchFields])


    const renderHeader = () => {


        const exportCSV = (selectionOnly) => {
            dt.current.exportCSV({ selectionOnly });
        };

        return (
            <>

                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'right' }}>
                    <Stack spacing={1} direction={'row'}>
                        {/* <Button variant='outlined' size='small' endIcon={<Download />}>Download</Button> */}
                        <TextField
                            label='Search Campain Name'
                            size='small'
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position='end'>
                                        <Search />
                                    </InputAdornment>
                                )
                            }}
                            onChange={e => {
                                const val = (e.target.value).toLowerCase()
                                const filter = reportData.data.filter(data => data.campaign_name.toLowerCase().includes(val))
                                setFiltedReportData(filter)
                            }}
                        />
                        <IconButton title='Download Report' color='primary' onClick={() => exportCSV(false)}><FileDownload /></IconButton>
                    </Stack>
                </Box>

            </>
        );
    };

    const header = renderHeader();

    const handleClientSelection = async (_, newValue) => {
        // console.log(newValue)

        if (newValue) {
            const { id, clientName } = newValue
            if (id === 1 && clientName === 'All') {
                setSearchFields({ ...searchFields, clientName: newValue, campaignName: { campId: 0, campaignName: 'All' } })
                setCampaigns([])

            } else {
                try {
                    setLoader(true)
                    const api = Instance()
                    const res = await api.get('/api/campaigns/' + id)
                    // console.log(res.data)
                    //setCampaignData(res.data)
                    const data = res.data.map(data => ({ campaignName: data.campaign_name, campId: data.camp_id }))
                    data.unshift({ campId: 0, campaignName: 'All' })
                    setCampaigns(data)
                    //setFields({client_name:newValue,campaign_name: null, state: null, city: null,start_date:'', end_date:'', camp_based_on:[], date: '', impressions:0, cpm:0, clicks:0, cpc:0, sessions:0, cps:0, ctr:0, total_cpm:0, total_cpc:0, total_cps:0,})
                    setLoader(false)
                    setSearchFields({ ...searchFields, clientName: newValue, campaignName: null })
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


        }
        else {
            setSearchFields({ ...searchFields, clientName: newValue, campaignName: null })
            //setCampaigns([])
        }



    }

    const handleSearch = async (e) => {
        e.preventDefault()
        try {
            setLoader(true)
            const api = Instance()
            const res = await api.get(`/api/searchreports/`, { params: searchFields })
            // console.log(res.data,res.data.info!==undefined)

            if (res.data.info !== undefined) {
                setCampaignInfo(res.data.info)
                // console.log(res.data.info,'done')
            }
            else {
                campaignInfo.planned.length !== 0 && setCampaignInfo({ name: '', status: '', planned: [] })
            }
            const data = res.data.data.map(data => ({ ...data, date: new Date(data.date).toLocaleString('en-CA').slice(0, 10), start_date: new Date(data.start_date).toLocaleString('en-CA').slice(0, 10), end_date: new Date(data.end_date).toLocaleString('en-CA').slice(0, 10) }))
            setReportData({ ...res.data, data: data })
            setFiltedReportData(data)
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

    return (
        <Box sx={{ width: '100%', height: '100vh', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}>
            <Navbar />
            <Grid container>
                <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', }}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', }}>
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                                <Container sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', }}>

                                    <Typography component={'h1'} variant='p' m={1} textAlign={'center'} >Report Details</Typography>

                                    <Stack component={'form'} onSubmit={handleSearch} spacing={2}>
                                        <fieldset>
                                            <legend><Typography variant='p' component={'h5'}>Search Perticular Campaign/Client</Typography></legend>
                                            <Stack direction={{ xs: 'column', lg: 'row' }} p={1} spacing={2}>
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
                                                    value={searchFields.clientName}
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
                                                    value={searchFields.campaignName}
                                                    onChange={(_, newValue) => setSearchFields({ ...searchFields, campaignName: newValue })}
                                                />
                                                <TextField
                                                    label='From Date'
                                                    size='small'
                                                    fullWidth
                                                    type='date'
                                                    name='fromDate'
                                                    value={searchFields.fromDate}
                                                    onChange={(e) => setSearchFields({ ...searchFields, fromDate: e.target.value })}
                                                    InputLabelProps={{ shrink: true }}
                                                    inputProps={{ max: searchFields.toDate }}
                                                    required={searchFields.toDate !== '' || searchFields.fromDate !== ''}
                                                />


                                                <TextField
                                                    label='To Date'
                                                    size='small'
                                                    fullWidth
                                                    type='date'
                                                    name='toDate'
                                                    value={searchFields.toDate}
                                                    onChange={(e) => setSearchFields({ ...searchFields, toDate: e.target.value })}
                                                    InputLabelProps={{ shrink: true }}
                                                    inputProps={{ min: searchFields.fromDate }}
                                                    required={searchFields.toDate !== '' || searchFields.fromDate !== ''}


                                                />
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Button type='submit' size='small' color='success' variant='contained' >Search</Button>
                                                </Box>


                                            </Stack>
                                        </fieldset>
                                        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>

                                        </Stack>

                                    </Stack>
                                </Container>



                            </Grid>
                            <Container sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', mb: 3 }}>

                                <Grid item xs={12} sm={12} md={12} lg={6} xl={8}>
                                    <Collapse in={campaignInfo.planned.length !== 0} unmountOnExit timeout={800}>
                                        <Card>
                                            <CardContent>
                                                <Typography component={'h3'} variant='p' textAlign={'center'}>{campaignInfo.name} <Box component="span" sx={{ color: campaignInfo.status === 'Running' ? 'green' : campaignInfo.status === 'Closed' ? 'red' : 'orange', fontSize: 'small', animation: `${spin} 1s linear infinite` }} >{campaignInfo.status !== '' ? <Circle fontSize='8px' /> : null}{campaignInfo.status}</Box></Typography>
                                                <table style={{ width: "100%", fontSize: '12px', borderCollapse: 'collapse' }}>
                                                    <tbody>
                                                    {
                                                        campaignInfo['planned'].map((info, index) => (
                                                            <tr key={index}>
                                                                {
                                                                    Object.keys(info).map((data, index) => (
                                                                        <td style={{ borderBottom: '1px solid gray', padding: '8px' }} key={`${index} ${info}`}>{data}: {info[data]}</td>

                                                                    ))
                                                                }
                                                            </tr>
                                                        ))
                                                    }
                                                    </tbody>

                                                </table>
                                            </CardContent>
                                        </Card>
                                    </Collapse>
                                </Grid>
                            </Container>
                        </Box>

                        <Collapse in={reportData.columns.length === 0} unmountOnExit timeout={'auto'}>
                            <Box sx={{ width: '100%', height: '300px', backgroundColor: '#fafbfd' }}>
                                <img src='https://static.shegatravel.com/assets/whitelable1/img/norecordfound.gif' alt='No records' style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </Box>
                        </Collapse>

                        <Collapse in={reportData.columns.length !== 0} unmountOnExit timeout={'auto'}>
                            <div className="card">
                                <DataTable ref={dt} value={filtedReportData} header={header} selectionMode="single" dataKey="id"
                                    onSelectionChange={handleNavigate} size='small' resizableColumns paginator rows={10} paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                    rowsPerPageOptions={[10, 25, 50, 100, 300, 500]} tableStyle={{ maxWidth: '150rem' }} scrollHeight='350px' scrollable>
                                    {
                                        reportData.columns.map((col, index) => (
                                            <Column key={index} headerStyle={{ backgroundColor: '#00A4CC', color: '#ffffff' }} sortable align={'center'} field={col.field} header={col.header}></Column>
                                        ))
                                    }
                                    {
                                        reportData.columns.length !== 0 && <Column headerStyle={{ backgroundColor: '#00A4CC', color: '#ffffff' }} header="Action" align={'center'} body={actionTemplete} />
                                    }
                                </DataTable>
                            </div>
                        </Collapse>


                    </Grid>

                </Box>

            </Grid>
            {editMode}
            <Loader loader={loader} />
        </Box>
    )
}

export default ReportDetails