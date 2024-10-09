import { Box, Button, Checkbox, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormControlLabel, FormGroup, FormLabel, Grid, InputAdornment, Slide, Stack, TextField, Typography, } from '@mui/material'
import React, { forwardRef, useEffect, useMemo, useState } from 'react'
import Navbar from '../NavBar/Navbar'
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import swal from 'sweetalert';
import axios from 'axios';
import {Search } from '@mui/icons-material';
import Loader from '../Loader';
import LoadingButton from '@mui/lab/LoadingButton';


const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});


function CampaignDetails() {
    const [campaignData, setCampaignData] = useState([])
    const [filterdCampaignData, setFilterdCampaignData] = useState(campaignData)
    const [loader, setLoader] = useState(false)
    const [update, setUpdate] = useState(0)
    const [editFields, setEditFields] = useState({ camp_id: '', client_name: '', campaign_name: '', start_date: '', end_date: '', camp_based_on: [], selected_camp_opt: [], planned_impressions: 0, planned_cpm: 0, planned_clicks: 0, planned_cpc: 0, planned_sessions: 0, planned_cps: 0, ctr: 0, planned_budget_impressions: 0, planned_budget_clicks: 0, planned_budget_sessions: 0, client_camp_access: [], client_id: '' })
    const [prevEditFields, setPrevEditFields] = useState(editFields)
    const [open, setOpen] = useState(false);
    const [loadButton, setLoadButton] = useState(false)
    const [campaignSelectionError, setCampaignSelectionError] = useState(false)


    const handleClose = () => {
        setEditFields({ camp_id: '', client_name: '', campaign_name: '', start_date: '', end_date: '', camp_based_on: [], selected_camp_opt: [], planned_impressions: 0, planned_cpm: 0, planned_clicks: 0, planned_cpc: 0, planned_sessions: 0, planned_cps: 0, ctr: 0, planned_budget_impressions: 0, planned_budget_clicks: 0, planned_budget_sessions: 0, client_camp_access: [], client_id: '' })
        setOpen(false);
    };




    useEffect(() => {
        const getData = async () => {
            setLoader(true)
            try {
                const res = await axios.get('/api/campaigndetails')
                //console.log(res.data)
                const data = res.data.map(data => ({ ...data, start_date: new Date(data.start_date).toLocaleString('en-CA').slice(0, 10), end_date: new Date(data.end_date).toLocaleString('en-CA').slice(0, 10) }))
                setCampaignData(data)
                setFilterdCampaignData(data)
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
    }, [update])


    const handleDeleteRow = (row) => {
        swal({
            title: "Do you want delete campaign?",
            text: "Once deleted, you will not be able to recover this details!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    //console.log(row)
                    axios.delete('/api/deletecampaign/' + row.camp_id)
                        .then(res => {
                            setUpdate(prev => prev + 1)
                            swal(res.data, {
                                icon: "success",
                            });


                        })

                }
            });
    }

    const handleEdit = (rowData) => {
        const based_on = rowData.camp_based_on.split(',')
        const opt = rowData.selected_camp_opt.split(',')
        const client_access = rowData.client_camp_access.split(',')

        setEditFields({ ...rowData, camp_based_on: based_on, selected_camp_opt: opt, client_camp_access: client_access })
        setPrevEditFields({ ...rowData, camp_based_on: based_on, selected_camp_opt: opt, client_camp_access: client_access })
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



    const editMode = useMemo(() => {
        const handleOptionChecks = (e) => {
            const val = e.target.value
            let newSelection;
            if (editFields.selected_camp_opt.includes(val)) {
                newSelection = editFields.selected_camp_opt.filter(op => op !== val);

            }
            else {
                newSelection = [...editFields.selected_camp_opt, val];
            }
            setEditFields({ ...editFields, selected_camp_opt: newSelection });
        }

        const handleEditFieldsChange = (e) => {
            setEditFields({ ...editFields, [e.target.name]: e.target.value })
            let field, cal, ctrPer;
            //console.log(e.target.name)
            const val = e.target.value === '' ? 0 : e.target.value
            if (e.target.name === 'planned_impressions') {
                field = 'planned_budget_impressions'
                cal = ((val * editFields.planned_cpm) / 1000).toFixed(2)

                if (editFields.planned_clicks !== 0 && editFields.planned_clicks !== '') {
                    ctrPer = ((editFields.planned_clicks / val) * 100).toFixed(2)
                }
                else {
                    ctrPer = 0
                }

            }
            if (e.target.name === 'planned_cpm') {
                field = 'planned_budget_impressions'
                cal = ((editFields.planned_impressions * val) / 1000).toFixed(2)
                //console.log(field,cal,e.target.value)
            }
            if (e.target.name === 'planned_clicks') {
                field = 'planned_budget_clicks'
                cal = (val * editFields.planned_cpc).toFixed(2)
                if (editFields.planned_impressions !== 0 && editFields.planned_impressions !== '') {
                    ctrPer = ((val / editFields.planned_impressions) * 100).toFixed(2)
                }
                else {
                    ctrPer = 0
                }

            }
            if (e.target.name === 'planned_cpc') {
                field = 'planned_budget_clicks'
                cal = (editFields.planned_clicks * val).toFixed(2)
            }
            if (e.target.name === 'planned_sessions') {
                field = 'planned_budget_sessions'
                cal = (val * editFields.planned_cps).toFixed(2)
            }
            if (e.target.name === 'planned_cps') {
                field = 'planned_budget_sessions'
                cal = (editFields.planned_sessions * val).toFixed(2)
            }
            if (field !== undefined && cal !== undefined) {
                setEditFields({ ...editFields, [e.target.name]: e.target.value, [field]: cal })
            }
            else {
                setEditFields({ ...editFields, [e.target.name]: e.target.value })
            }
            if (ctrPer !== undefined && ctrPer !== 'Infinity') {
                setEditFields({ ...editFields, [e.target.name]: e.target.value, ctr: ctrPer })
            }


        }

        const handleSubmit = async (e) => {
            e.preventDefault()
            //console.log(editFields.camp_based_on.length===0)
            if(editFields.camp_based_on.length===0){
                setCampaignSelectionError(true)
            }
            else{
                if (JSON.stringify(prevEditFields) !== JSON.stringify(editFields)) {
                    setLoadButton(true)
                    try {
                        const res = await axios.put('/api/editcampaign', editFields)
                        console.log(res.data)
                        setLoadButton(false)
                        handleClose()
                        setUpdate(prev => prev + 1)
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
                    //console.log(editFields)
                }

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
                    <DialogTitle sx={{ fontWeight: 'bold' }}>Edit Campaign</DialogTitle>
                    <DialogContent>
                        <Stack p={1} component={'form'} id='editcampaignform' onSubmit={handleSubmit} spacing={{ xs: 1.5, xl: 3 }}>

                            <TextField
                                label='Enter Campaign Name'
                                size='small'
                                type='text'
                                name='campaign_name'
                                value={editFields.campaign_name}
                                onChange={handleEditFieldsChange}
                                required

                            />
                            <Stack spacing={2} direction={{ xs: "column", lg: 'row' }} sx={{ width: '100%' }}>

                                <TextField
                                    label='Start Date'
                                    size='small'
                                    fullWidth
                                    type='date'
                                    name='start_date'
                                    value={editFields.start_date}
                                    onChange={handleEditFieldsChange}
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ max: editFields.end_date }}
                                    required

                                />


                                <TextField
                                    label='End Date'
                                    size='small'
                                    fullWidth
                                    type='date'
                                    name='end_date'
                                    value={editFields.end_date}
                                    onChange={handleEditFieldsChange}
                                    InputLabelProps={{ shrink: true }}

                                    inputProps={{ min: editFields.start_date }}
                                    required
                                />


                            </Stack>
                            <Stack spacing={2} direction={{ xs: "column", lg: 'row' }} sx={{ width: '100%' }}>
                                <Stack spacing={2} sx={{ width: '100%' }}>
                                    <FormControl component="editFieldset"  required>
                                        <FormLabel component="legend" error={campaignSelectionError}>Campaign Based On</FormLabel>
                                        <FormGroup aria-label="position" onChange={e => {
                                            const val = e.target.value
                                            let newBasedValues;
                                            let selectedOpt = editFields.selected_camp_opt;
                                            let clientOpt = editFields.client_camp_access;


                                            let { planned_impressions, planned_cpm, planned_clicks, planned_cpc, planned_sessions, planned_cps, planned_budget_impressions, planned_budget_clicks, planned_budget_sessions, ctr } = editFields
                                            if (editFields.camp_based_on.includes(val)) {
                                                newBasedValues = editFields.camp_based_on.filter(camp => camp !== val)


                                                if (val === 'impressions') {
                                                    console.log(editFields.selected_camp_opt)
                                                    selectedOpt = editFields.selected_camp_opt.filter(opt => opt !== 'impressions' && opt !== 'cpm')
                                                    //console.log(fields.selectedCampOptions, selectedOpt)
                                                    clientOpt = editFields.client_camp_access.filter(opt => !['impressions', 'cpm', 'total_cpm'].includes(opt))
                                                    planned_impressions = 0;
                                                    planned_cpm = 0;
                                                    planned_budget_impressions = 0;
                                                    ctr = 0
                                                    //setFields({ ...fields, selectedCampOptions: selectedOpt, clientReportAccess:clientOpt })
                                                }
                                                else if (val === 'clicks') {
                                                    selectedOpt = editFields.selected_camp_opt.filter(opt => !['clicks', 'cpc'].includes(opt))
                                                    clientOpt = editFields.client_camp_access.filter(opt => !['clicks', 'cpc', 'total_cpc'].includes(opt))
                                                    planned_clicks = 0;
                                                    planned_cpc = 0;
                                                    planned_budget_clicks = 0;
                                                    ctr = 0

                                                }
                                                else if (val === 'sessions') {
                                                    selectedOpt = editFields.selected_camp_opt.filter(opt => !['sessions', 'cps'].includes(opt))
                                                    clientOpt = editFields.client_camp_access.filter(opt => !['sessions', 'cps', 'total_cps'].includes(opt))
                                                    planned_sessions = 0;
                                                    planned_cps = 0;
                                                    planned_budget_sessions = 0


                                                }
                                                console.log(val, selectedOpt, clientOpt)
                                                //setFields({ ...fields, selectedCampOptions: selectedOpt, clientReportAccess:clientOpt })


                                            }
                                            else {

                                                newBasedValues = [...editFields.camp_based_on, val]
                                            }
                                            //console.log(newBasedValues)
                                            setCampaignSelectionError(false)
                                            setEditFields({ ...editFields, camp_based_on: newBasedValues, selected_camp_opt: selectedOpt, client_camp_access: clientOpt, planned_impressions: planned_impressions, planned_cpm: planned_cpm, planned_clicks: planned_clicks, planned_cpc: planned_cpc, planned_sessions: planned_sessions, planned_cps: planned_cps, planned_budget_impressions: planned_budget_impressions, planned_budget_clicks: planned_budget_clicks, planned_budget_sessions: planned_budget_sessions, ctr: ctr })

                                            //setFields({...fields, campaignBasedOn:{...fields.campaignBasedOn,[val]:!fields.campaignBasedOn[val]}})

                                        }} row>

                                            <FormControlLabel
                                                value="impressions"
                                                control={<Checkbox checked={editFields.camp_based_on.includes('impressions')} />}
                                                label="Impression"
                                                labelPlacement="end"

                                            />
                                            <FormControlLabel
                                                value="clicks"
                                                control={<Checkbox checked={editFields.camp_based_on.includes('clicks')} />}
                                                label="Clicks"
                                                labelPlacement="end"
                                            />
                                            <FormControlLabel
                                                value="sessions"
                                                control={<Checkbox checked={editFields.camp_based_on.includes('sessions')} />}
                                                label="Sessions"
                                                labelPlacement="end"

                                            />
                                        </FormGroup>
                                        <Typography component={'h6'} variant='p' color='red'>*Select the below editFields checkbox for displaying in Report Details.</Typography>
                                    </FormControl>
                                    <Collapse in={editFields.camp_based_on.includes('impressions')} unmountOnExit timeout={'auto'}>
                                        <Stack spacing={1} sx={{ width: '100%' }} direction={{ xs: 'column', lg: 'row' }}>
                                            <FormControl fullWidth >
                                                <FormGroup row>
                                                    <FormControlLabel

                                                        control={<><Checkbox size='small' value={'impressions'} checked={editFields.selected_camp_opt.includes('impressions')} onChange={handleOptionChecks} /><TextField
                                                            label='Planned Impreessions'
                                                            size='small'
                                                            fullWidth
                                                            type='number'
                                                            name='planned_impressions'
                                                            value={editFields.planned_impressions}
                                                            onChange={handleEditFieldsChange}
                                                            inputProps={{ min: 0 }}
                                                        /></>}


                                                    />


                                                </FormGroup>
                                            </FormControl>

                                            <FormControl fullWidth>
                                                <FormGroup row>
                                                    <FormControlLabel

                                                        control={<><Checkbox size='small' value={'cpm'} checked={editFields.selected_camp_opt.includes('cpm')} onChange={handleOptionChecks} /><TextField
                                                            label='Planned CPM'
                                                            size='small'
                                                            fullWidth
                                                            type='number'
                                                            name='planned_cpm'
                                                            value={editFields.planned_cpm}
                                                            onChange={handleEditFieldsChange}
                                                            inputProps={{ min: 0 }}
                                                        /></>}


                                                    />


                                                </FormGroup>
                                            </FormControl>

                                        </Stack>
                                    </Collapse>

                                    <Collapse in={editFields.camp_based_on.includes('clicks')} unmountOnExit timeout={'auto'}>
                                        <Stack spacing={1} sx={{ width: '100%' }} direction={{ xs: 'column', lg: 'row' }}>
                                            <FormControl fullWidth>
                                                <FormGroup row>
                                                    <FormControlLabel
                                                        value="end"
                                                        control={<><Checkbox size='small' value={'clicks'} checked={editFields.selected_camp_opt.includes('clicks')} onChange={handleOptionChecks} /><TextField
                                                            label='Planned Clicks'
                                                            size='small'
                                                            fullWidth
                                                            type='number'
                                                            name='planned_clicks'
                                                            value={editFields.planned_clicks}
                                                            onChange={handleEditFieldsChange}
                                                            inputProps={{ min: 0 }}
                                                        /></>}


                                                    />


                                                </FormGroup>
                                            </FormControl>

                                            <FormControl fullWidth>
                                                <FormGroup row>
                                                    <FormControlLabel

                                                        control={<><Checkbox size='small' value={'cpc'} checked={editFields.selected_camp_opt.includes('cpc')} onChange={handleOptionChecks} /><TextField
                                                            label='Planned CPC'
                                                            size='small'
                                                            fullWidth
                                                            type='number'
                                                            name='planned_cpc'
                                                            value={editFields.planned_cpc}
                                                            onChange={handleEditFieldsChange}
                                                            inputProps={{ min: 0 }}
                                                        /></>}


                                                    />


                                                </FormGroup>
                                            </FormControl>

                                        </Stack>
                                    </Collapse>

                                    <Collapse in={editFields.camp_based_on.includes('sessions')} unmountOnExit timeout={'auto'}>
                                        <Stack spacing={1} sx={{ width: '100%' }} direction={{ xs: 'column', lg: 'row' }}>
                                            <FormControl fullWidth>
                                                <FormGroup row>
                                                    <FormControlLabel
                                                        value="end"
                                                        control={<><Checkbox size='small' value={'sessions'} checked={editFields.selected_camp_opt.includes('sessions')} onChange={handleOptionChecks} /><TextField
                                                            label='Planned Sessions'
                                                            size='small'
                                                            fullWidth
                                                            type='number'
                                                            name='planned_sessions'
                                                            value={editFields.planned_sessions}
                                                            onChange={handleEditFieldsChange}
                                                            inputProps={{ min: 0 }}
                                                        /></>}


                                                    />


                                                </FormGroup>
                                            </FormControl>

                                            <FormControl fullWidth>
                                                <FormGroup row>
                                                    <FormControlLabel

                                                        control={<><Checkbox size='small' value={'cps'} checked={editFields.selected_camp_opt.includes('cps')} onChange={handleOptionChecks} /><TextField
                                                            label='Planned CPS'
                                                            size='small'
                                                            fullWidth
                                                            type='number'
                                                            name='planned_cps'
                                                            value={editFields.planned_cps}
                                                            onChange={handleEditFieldsChange}
                                                            inputProps={{ min: 0 }}
                                                        /></>}


                                                    />


                                                </FormGroup>
                                            </FormControl>

                                        </Stack>
                                    </Collapse>



                                </Stack>
                                <Stack spacing={1.5} sx={{ width: '100%' }}>
                                    <Stack spacing={2} direction={{ xs: 'column', lg: 'row' }} sx={{ width: '100%' }}>
                                        <TextField
                                            label='Planned Budget(Impressions)'
                                            size='small'
                                            fullWidth
                                            value={editFields.planned_budget_impressions}
                                            disabled
                                        />
                                        <TextField
                                            label='Planned Budget(Clicks)'
                                            size='small'
                                            fullWidth
                                            value={editFields.planned_budget_clicks}
                                            disabled
                                        />

                                    </Stack>

                                    <Stack spacing={2} direction={{ xs: 'column', lg: 'row' }} sx={{ width: '100%' }}>
                                        <TextField
                                            label='Planned Budget(Sessions)'
                                            size='small'
                                            fullWidth
                                            value={editFields.planned_budget_sessions}
                                            disabled
                                        />
                                        <FormControl fullWidth>
                                            <FormControlLabel

                                                control={<><Checkbox size='small' value={'ctr'} checked={editFields.selected_camp_opt.includes('ctr')} onChange={handleOptionChecks} /><TextField
                                                    label='CTR in %'
                                                    size='small'
                                                    fullWidth
                                                    type='number'
                                                    name='ctr'
                                                    value={editFields.ctr}
                                                    onChange={handleEditFieldsChange}
                                                    inputProps={{ min: 0 }}
                                                    disabled
                                                /></>}
                                            />
                                        </FormControl>


                                    </Stack>
                                    <Box>
                                        <fieldset style={{ textAlign: 'center' }}>
                                            <legend>Client Report Access</legend>
                                            <FormControl fullWidth>
                                                <FormGroup row onChange={e => {
                                                    //console.log(e.target.value)
                                                    const val = e.target.value
                                                    let newBasedValues;
                                                    if (editFields.client_camp_access.includes(val)) {
                                                        newBasedValues = editFields.client_camp_access.filter(acc => acc !== val)
                                                    }
                                                    else {
                                                        newBasedValues = [...editFields.client_camp_access, val]
                                                    }
                                                    setEditFields({ ...editFields, client_camp_access: newBasedValues })
                                                }}>

                                                    <Collapse in={editFields.camp_based_on.includes('impressions')} dir='horizontal' unmountOnExit timeout={1000} >
                                                        {
                                                            ['impressions', 'cpm', 'total_cpm'].map(imp =>

                                                                <FormControlLabel
                                                                    key={imp}
                                                                    value={imp}
                                                                    control={<Checkbox size='small' />}
                                                                    label={imp.toLocaleUpperCase()}
                                                                    checked={editFields.client_camp_access.includes(imp)}

                                                                    labelPlacement="end"
                                                                />



                                                            )
                                                        }

                                                    </Collapse>
                                                    <Collapse in={editFields.camp_based_on.includes('clicks')} dir='horizontal' unmountOnExit timeout={1000} >
                                                        {
                                                            ['clicks', 'cpc', 'total_cpc'].map(cl =>

                                                                <FormControlLabel
                                                                    key={cl}
                                                                    value={cl}
                                                                    control={<Checkbox size='small' />}
                                                                    label={cl.toLocaleUpperCase()}
                                                                    checked={editFields.client_camp_access.includes(cl)}

                                                                    labelPlacement="end"
                                                                />



                                                            )
                                                        }

                                                    </Collapse>
                                                    <Collapse in={editFields.camp_based_on.includes('sessions')} dir='horizontal' unmountOnExit timeout={1000} >
                                                        {
                                                            ['sessions', 'cps', 'total_cps'].map(ss =>

                                                                <FormControlLabel
                                                                    key={ss}
                                                                    value={ss}
                                                                    control={<Checkbox size='small' />}
                                                                    label={ss.toLocaleUpperCase()}
                                                                    checked={editFields.client_camp_access.includes(ss)}
                                                                    labelPlacement="end"
                                                                />



                                                            )
                                                        }

                                                    </Collapse>
                                                    <FormControlLabel
                                                        key={'ctr'}
                                                        value={'ctr'}
                                                        control={<Checkbox size='small' />}
                                                        label={'CTR'}
                                                        checked={editFields.client_camp_access.includes('ctr')}
                                                        labelPlacement="end"
                                                    />




                                                </FormGroup>
                                            </FormControl>
                                        </fieldset>
                                    </Box>

                                </Stack>





                            </Stack>






                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Stack spacing={1} direction={'row'}>
                            <Button color='error' onClick={handleClose}>cancel</Button>
                            <LoadingButton loading={loadButton} color='success' form='editcampaignform' type='submit'  >Save</LoadingButton>
                        </Stack>
                    </DialogActions>
                </Dialog>

            </>
        )
    }, [editFields, open, prevEditFields, loadButton, campaignSelectionError])


    const renderHeader = () => {


        return (
            <>
                <Stack spacing={2}>
                    <Typography component={'h1'} variant='p' textAlign={'center'} >Campaign Details</Typography>
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'right' }}>
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
                                const filter = campaignData.filter(data => data.campaign_name.toLowerCase().includes(val))
                                setFilterdCampaignData(filter)
                            }}
                        />
                    </Box>
                </Stack>
            </>
        );
    };

    const header = renderHeader();

    return (
        <Box sx={{ width: '100%', height: '100vh', backgroundImage: 'url(12244.jpg)', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}>

            <Navbar />
            <Grid container>
                <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', }}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>


                        <div className="card">
                            <DataTable value={filterdCampaignData} header={header}  columnResizeMode="expand" size='small' paginator rows={10} paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                rowsPerPageOptions={[10, 25, 50]} scrollHeight='350px' scrollable>
                                <Column headerStyle={{ backgroundColor: '#00A4CC', color: '#ffffff' }} align={'center'} field="client_name" header="Client Name"></Column>
                                <Column headerStyle={{ backgroundColor: '#00A4CC', color: '#ffffff' }} field="campaign_name" header="Campaign Name" align={'center'}></Column>
                                <Column headerStyle={{ backgroundColor: '#00A4CC', color: '#ffffff' }} sortable field="start_date" header="Start Date" align={'center'}></Column>
                                <Column headerStyle={{ backgroundColor: '#00A4CC', color: '#ffffff' }} sortable field="end_date" header="End Date" align={'center'}></Column>
                                <Column headerStyle={{ backgroundColor: '#00A4CC', color: '#ffffff' }} field="planned_impressions" header="Planned Impressions" align={'center'} />
                                <Column headerStyle={{ backgroundColor: '#00A4CC', color: '#ffffff' }} field="planned_cpm" header="Planned CPM" align={'center'} />
                                <Column headerStyle={{ backgroundColor: '#00A4CC', color: '#ffffff' }} field="planned_clicks" header="Planned Clicks" align={'center'} />
                                <Column headerStyle={{ backgroundColor: '#00A4CC', color: '#ffffff' }} field="planned_cpc" header="Planned CPC" align={'center'} />
                                <Column headerStyle={{ backgroundColor: '#00A4CC', color: '#ffffff' }} field="planned_sessions" header="Planned Sessions" align={'center'} />
                                <Column headerStyle={{ backgroundColor: '#00A4CC', color: '#ffffff' }} field="planned_cps" header="Planned CPS" align={'center'} />
                                <Column headerStyle={{ backgroundColor: '#00A4CC', color: '#ffffff' }} field="planned_budget_impressions" header="Planned Budget Impressions" align={'center'} />
                                <Column headerStyle={{ backgroundColor: '#00A4CC', color: '#ffffff' }} field="planned_budget_clicks" header="Planned Budget Clicks" align={'center'} />
                                <Column headerStyle={{ backgroundColor: '#00A4CC', color: '#ffffff' }} field="planned_budget_sessions" header="Planned Budget Sessions" align={'center'} />
                                <Column headerStyle={{ backgroundColor: '#00A4CC', color: '#ffffff' }} field="ctr" header="CTR in %" align={'center'} />
                                <Column headerStyle={{ backgroundColor: '#00A4CC', color: '#ffffff' }} header="Action" align={'center'} body={actionTemplete} />
                            </DataTable>
                        </div>


                    </Grid>
                </Box>
            </Grid>
            {editMode}
            <Loader loader={loader} />
        </Box>
    )
}

export default CampaignDetails