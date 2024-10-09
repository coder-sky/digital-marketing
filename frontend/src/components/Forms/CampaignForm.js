import { Autocomplete, Box, Button, Checkbox, Collapse, Container, FormControl, FormControlLabel, FormGroup, FormLabel, Grid, Paper, Stack, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import Navbar from '../NavBar/Navbar'
import axios from 'axios';
import swal from 'sweetalert';
import Loader from '../Loader';
import LoadingButton from '@mui/lab/LoadingButton';

function CampaignForm() {
    const [inputValue, setInputValue] = useState('');
    const [fields, setFields] = useState({ clientName: null, campaignName: '', startDate: '', endDate: '', campaignBasedOn: [], selectedCampOptions: [], plannedImpressions: 0, plannedCPM: 0, plannedClicks: 0, plannedCPC: 0, plannedSessions: 0, plannedCPS: 0, ctr: 0, plannedBudgetImpressions: 0, plannedBudgetClicks: 0, plannedBudgetSessions: 0, clientReportAccess: [] })
    const [clientData, setClientData] = useState([])
    const [loader, setLoader] = useState(false)
    const [campaignSelectionError, setCampaignSelectionError] = useState(false)
    const [loadButton, setLoadButton] = useState(false)

    useEffect(() => {
        const getData = async () => {
            setLoader(true)
            try {
                const res = await axios.get('/api/clientdetails')
                //console.log(res.data)
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

    const handleOptionChecks = (e) => {
        const val = e.target.value
        let newSelection;
        if (fields.selectedCampOptions.includes(val)) {
            newSelection = fields.selectedCampOptions.filter(op => op !== val);

        }
        else {
            newSelection = [...fields.selectedCampOptions, val];
        }
        setFields({ ...fields, selectedCampOptions: newSelection });
    }
    const handleFieldsChange = (e) => {
        setFields({ ...fields, [e.target.name]: e.target.value })
        let field, cal, ctrPer;
        //console.log(e.target.name)
        const val = e.target.value === '' ? 0 : e.target.value
        if (e.target.name === 'plannedImpressions') {
            field = 'plannedBudgetImpressions'
            cal = ((val * fields.plannedCPM) / 1000).toFixed(2)

            if (fields.plannedClicks !== 0 && fields.plannedClicks !== '') {
                ctrPer = ((fields.plannedClicks / val) * 100).toFixed(2)
            }
            else {
                ctrPer = 0
            }

        }
        if (e.target.name === 'plannedCPM') {
            field = 'plannedBudgetImpressions'
            cal = ((fields.plannedImpressions * val) / 1000).toFixed(2)
            //console.log(field,cal,e.target.value)
        }
        if (e.target.name === 'plannedClicks') {
            field = 'plannedBudgetClicks'
            cal = (val * fields.plannedCPC).toFixed(2)
            if (fields.plannedImpressions !== 0 && fields.plannedImpressions !== '') {
                ctrPer = ((val / fields.plannedImpressions) * 100).toFixed(2)
            }
            else {
                ctrPer = 0
            }

        }
        if (e.target.name === 'plannedCPC') {
            field = 'plannedBudgetClicks'
            cal = (fields.plannedClicks * val).toFixed(2)
        }
        if (e.target.name === 'plannedSessions') {
            field = 'plannedBudgetSessions'
            cal = (val * fields.plannedCPS).toFixed(2)
        }
        if (e.target.name === 'plannedCPS') {
            field = 'plannedBudgetSessions'
            cal = (fields.plannedSessions * val).toFixed(2)
        }
        if (field !== undefined && cal !== undefined) {
            setFields({ ...fields, [e.target.name]: e.target.value, [field]: cal })
        }
        else {
            setFields({ ...fields, [e.target.name]: e.target.value })
        }
        if (ctrPer !== undefined && ctrPer !== 'Infinity') {
            setFields({ ...fields, [e.target.name]: e.target.value, ctr: ctrPer })
        }


    }
    const handleClear = () => {
        setFields({ clientName: '', campaignName: '', startDate: '', endDate: '', campaignBasedOn: [], selectedCampOptions: [], plannedImpressions: 0, plannedCPM: 0, plannedClicks: 0, plannedCPC: 0, plannedSessions: 0, plannedCPS: 0, ctr: 0, plannedBudgetImpressions: 0, plannedBudgetClicks: 0, plannedBudgetSessions: 0, clientReportAccess: [] })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (fields.campaignBasedOn.length === 0) {
            setCampaignSelectionError(true)
        }
        else {
            setLoadButton(true)
            try {
                const res = await axios.post('/api/addcampaign', fields)
                //console.log(res.data)
                setLoadButton(false)
                swal({
                    title: 'Success',
                    text: res.data,
                    icon: 'success'
                })
                handleClear()
            }
            catch (err) {
                setLoadButton(false)
                swal({
                    title: 'Error Occured!',
                    text: err.response.data,
                    icon: 'error'
                })
            }
        }
    }
    return (
        <Box sx={{ width: '100%', height: { xs: 'auto', md: '100vh' }, backgroundImage: 'url(12244.jpg)', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}>

            <Navbar />
            <Grid container>
                <Container sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', mt: { xs: 1, xl: 3 } }}>
                    <Grid item xs={12} sm={12} md={12} lg={10} xl={10}>
                        <Paper sx={{ pl: 2, pr: 2, pb: 1, p: { xl: 3 } }} elevation={20} >
                            <Stack component={'form'} onSubmit={handleSubmit} spacing={{ xs: 1.5, xl: 3 }}>
                                <Typography component={'h1'} variant='p' textAlign={'center'} >Campaign Form</Typography>
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
                                    value={fields.clientName}
                                    onChange={(_, newValue) => {
                                        //console.log(newValue)
                                        setFields({ ...fields, clientName: newValue })
                                    }}
                                />
                                <TextField
                                    label='Enter Campaign Name'
                                    size='small'
                                    type='text'
                                    name='campaignName'
                                    value={fields.campaignName}
                                    onChange={handleFieldsChange}
                                    required

                                />
                                <Stack spacing={2} direction={{ xs: "column", lg: 'row' }} sx={{ width: '100%' }}>

                                    <TextField
                                        label='Start Date'
                                        size='small'
                                        fullWidth
                                        type='date'
                                        name='startDate'
                                        value={fields.startDate}
                                        onChange={handleFieldsChange}
                                        InputLabelProps={{ shrink: true }}
                                        inputProps={{ max: fields.endDate }}
                                        required

                                    />


                                    <TextField
                                        label='End Date'
                                        size='small'
                                        fullWidth
                                        type='date'
                                        name='endDate'
                                        value={fields.endDate}
                                        onChange={handleFieldsChange}
                                        InputLabelProps={{ shrink: true }}

                                        inputProps={{ min: fields.startDate }}
                                        required
                                    />


                                </Stack>
                                <Stack spacing={2} direction={{ xs: "column", lg: 'row' }} sx={{ width: '100%' }}>
                                    <Stack spacing={2} sx={{ width: '100%' }}>
                                        <FormControl component="fieldset" required>
                                            <FormLabel component="legend" error={campaignSelectionError} >Campaign Based On</FormLabel>
                                            <FormGroup aria-label="position" onChange={e => {
                                                const val = e.target.value
                                                let newBasedValues;
                                                let selectedOpt = fields.selectedCampOptions;
                                                let clientOpt = fields.clientReportAccess;
                                                let pl_impr = fields.plannedImpressions
                                                let pl_cpm = fields.plannedCPM
                                                let pl_cli = fields.plannedClicks
                                                let pl_cpc = fields.plannedCPC
                                                let pl_ses = fields.plannedSessions
                                                let pl_cps = fields.plannedCPS
                                                let { plannedBudgetImpressions, plannedBudgetClicks, plannedBudgetSessions, ctr } = fields
                                                if (fields.campaignBasedOn.includes(val)) {
                                                    newBasedValues = fields.campaignBasedOn.filter(camp => camp !== val)


                                                    if (val === 'impressions') {
                                                        console.log(fields.selectedCampOptions)
                                                        selectedOpt = fields.selectedCampOptions.filter(opt => opt !== 'impressions' && opt !== 'cpm')
                                                        //console.log(fields.selectedCampOptions, selectedOpt)
                                                        clientOpt = fields.clientReportAccess.filter(opt => !['impressions', 'cpm', 'total_cpm'].includes(opt))
                                                        pl_impr = 0;
                                                        pl_cpm = 0;
                                                        plannedBudgetImpressions = 0;
                                                        ctr = 0
                                                        //setFields({ ...fields, selectedCampOptions: selectedOpt, clientReportAccess:clientOpt })
                                                    }
                                                    else if (val === 'clicks') {
                                                        selectedOpt = fields.selectedCampOptions.filter(opt => !['clicks', 'cpc'].includes(opt))
                                                        clientOpt = fields.clientReportAccess.filter(opt => !['clicks', 'cpc', 'total_cpc'].includes(opt))
                                                        pl_cli = 0;
                                                        pl_cpc = 0;
                                                        plannedBudgetClicks = 0;
                                                        ctr = 0

                                                    }
                                                    else if (val === 'sessions') {
                                                        selectedOpt = fields.selectedCampOptions.filter(opt => !['sessions', 'cps'].includes(opt))
                                                        clientOpt = fields.clientReportAccess.filter(opt => !['sessions', 'cps', 'total_cps'].includes(opt))
                                                        pl_ses = 0;
                                                        pl_cps = 0;
                                                        plannedBudgetSessions = 0


                                                    }
                                                    console.log(val, selectedOpt, clientOpt)
                                                    //setFields({ ...fields, selectedCampOptions: selectedOpt, clientReportAccess:clientOpt })


                                                }
                                                else {

                                                    newBasedValues = [...fields.campaignBasedOn, val]
                                                }
                                                //console.log(newBasedValues)
                                                setCampaignSelectionError(false)
                                                setFields({ ...fields, campaignBasedOn: newBasedValues, selectedCampOptions: selectedOpt, clientReportAccess: clientOpt, plannedImpressions: pl_impr, plannedCPM: pl_cpm, plannedClicks: pl_cli, plannedCPC: pl_cpc, plannedSessions: pl_ses, plannedCPS: pl_cps, plannedBudgetImpressions: plannedBudgetImpressions, plannedBudgetClicks: plannedBudgetClicks, plannedBudgetSessions: plannedBudgetSessions, ctr: ctr })

                                                //setFields({...fields, campaignBasedOn:{...fields.campaignBasedOn,[val]:!fields.campaignBasedOn[val]}})
                                            }} row>

                                                <FormControlLabel
                                                    value="impressions"
                                                    control={<Checkbox checked={fields.campaignBasedOn.includes('impressions')} />}
                                                    label="Impression"
                                                    labelPlacement="end"

                                                />
                                                <FormControlLabel
                                                    value="clicks"
                                                    control={<Checkbox checked={fields.campaignBasedOn.includes('clicks')} />}
                                                    label="Clicks"
                                                    labelPlacement="end"
                                                />
                                                <FormControlLabel
                                                    value="sessions"
                                                    control={<Checkbox checked={fields.campaignBasedOn.includes('sessions')} />}
                                                    label="Sessions"
                                                    labelPlacement="end"

                                                />
                                            </FormGroup>
                                            <Typography component={'h6'} variant='p' color='red'>*Select the below fields checkbox for displaying in Report Details.</Typography>
                                        </FormControl>
                                        <Collapse in={fields.campaignBasedOn.includes('impressions')} unmountOnExit timeout={'auto'}>
                                            <Stack spacing={1} sx={{ width: '100%' }} direction={'row'}>
                                                <FormControl fullWidth >
                                                    <FormGroup row>
                                                        <FormControlLabel

                                                            control={<><Checkbox size='small' value={'impressions'} onChange={handleOptionChecks} checked={fields.selectedCampOptions.includes('impressions')} /><TextField
                                                                label='Planned Impreessions'
                                                                size='small'
                                                                fullWidth
                                                                type='number'
                                                                name='plannedImpressions'
                                                                value={fields.plannedImpressions}
                                                                onChange={handleFieldsChange}
                                                                inputProps={{ min: 0 }}
                                                            /></>}


                                                        />


                                                    </FormGroup>
                                                </FormControl>

                                                <FormControl fullWidth>
                                                    <FormGroup row>
                                                        <FormControlLabel

                                                            control={<><Checkbox size='small' value={'cpm'} checked={fields.selectedCampOptions.includes('cpm')} onChange={handleOptionChecks} /><TextField
                                                                label='Planned CPM'
                                                                size='small'
                                                                fullWidth
                                                                type='number'
                                                                name='plannedCPM'
                                                                value={fields.plannedCPM}
                                                                onChange={handleFieldsChange}
                                                                inputProps={{ min: 0, step: 0.1 }}
                                                            /></>}


                                                        />


                                                    </FormGroup>
                                                </FormControl>

                                            </Stack>
                                        </Collapse>

                                        <Collapse in={fields.campaignBasedOn.includes('clicks')} unmountOnExit timeout={'auto'}>
                                            <Stack spacing={1} sx={{ width: '100%' }} direction={'row'}>
                                                <FormControl fullWidth>
                                                    <FormGroup row>
                                                        <FormControlLabel
                                                            value="end"
                                                            control={<><Checkbox size='small' value={'clicks'} checked={fields.selectedCampOptions.includes('clicks')} onChange={handleOptionChecks} /><TextField
                                                                label='Planned Clicks'
                                                                size='small'
                                                                fullWidth
                                                                type='number'
                                                                name='plannedClicks'
                                                                value={fields.plannedClicks}
                                                                onChange={handleFieldsChange}
                                                                inputProps={{ min: 0 }}
                                                            /></>}


                                                        />


                                                    </FormGroup>
                                                </FormControl>

                                                <FormControl fullWidth>
                                                    <FormGroup row>
                                                        <FormControlLabel

                                                            control={<><Checkbox size='small' value={'cpc'} onChange={handleOptionChecks} checked={fields.selectedCampOptions.includes('cpc')} /><TextField
                                                                label='Planned CPC'
                                                                size='small'
                                                                fullWidth
                                                                type='number'
                                                                name='plannedCPC'
                                                                value={fields.plannedCPC}
                                                                onChange={handleFieldsChange}
                                                                inputProps={{ min: 0, step: 0.1 }}
                                                            /></>}


                                                        />


                                                    </FormGroup>
                                                </FormControl>

                                            </Stack>
                                        </Collapse>

                                        <Collapse in={fields.campaignBasedOn.includes('sessions')} unmountOnExit timeout={'auto'}>
                                            <Stack spacing={1} sx={{ width: '100%' }} direction={'row'}>
                                                <FormControl fullWidth>
                                                    <FormGroup row>
                                                        <FormControlLabel
                                                            value="end"
                                                            control={<><Checkbox size='small' value={'sessions'} onChange={handleOptionChecks} checked={fields.selectedCampOptions.includes('sessions')} /><TextField
                                                                label='Planned Sessions'
                                                                size='small'
                                                                fullWidth
                                                                type='number'
                                                                name='plannedSessions'
                                                                value={fields.plannedSessions}
                                                                onChange={handleFieldsChange}
                                                                inputProps={{ min: 0 }}
                                                            /></>}


                                                        />


                                                    </FormGroup>
                                                </FormControl>

                                                <FormControl fullWidth>
                                                    <FormGroup row>
                                                        <FormControlLabel

                                                            control={<><Checkbox size='small' value={'cps'} onChange={handleOptionChecks} checked={fields.selectedCampOptions.includes('cps')} /><TextField
                                                                label='Planned CPS'
                                                                size='small'
                                                                fullWidth
                                                                type='number'
                                                                name='plannedCPS'
                                                                value={fields.plannedCPS}
                                                                onChange={handleFieldsChange}
                                                                inputProps={{ min: 0, step: 0.1 }}
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
                                                value={fields.plannedBudgetImpressions}
                                                disabled
                                            />
                                            <TextField
                                                label='Planned Budget(Clicks)'
                                                size='small'
                                                fullWidth
                                                value={fields.plannedBudgetClicks}
                                                disabled
                                            />

                                        </Stack>

                                        <Stack spacing={2} direction={{ xs: 'column', lg: 'row' }} sx={{ width: '100%' }}>
                                            <TextField
                                                label='Planned Budget(Sessions)'
                                                size='small'
                                                fullWidth
                                                value={fields.plannedBudgetSessions}
                                                disabled
                                            />
                                            <FormControl fullWidth>
                                                <FormControlLabel

                                                    control={<><Checkbox size='small' value={'ctr'} onChange={handleOptionChecks} checked={fields.selectedCampOptions.includes('ctr')} /><TextField
                                                        label='CTR in %'
                                                        size='small'
                                                        fullWidth
                                                        type='number'
                                                        name='ctr'
                                                        value={fields.ctr}
                                                        onChange={handleFieldsChange}

                                                        inputProps={{ min: 0, step: 0.1 }}
                                                        
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
                                                        if (fields.clientReportAccess.includes(val)) {
                                                            newBasedValues = fields.clientReportAccess.filter(acc => acc !== val)
                                                        }
                                                        else {
                                                            newBasedValues = [...fields.clientReportAccess, val]
                                                        }
                                                        setFields({ ...fields, clientReportAccess: newBasedValues })
                                                    }}>

                                                        <Collapse in={fields.campaignBasedOn.includes('impressions')} dir='horizontal' unmountOnExit timeout={1000} >
                                                            {
                                                                ['impressions', 'cpm', 'total_cpm'].map(imp =>

                                                                    <FormControlLabel
                                                                        key={imp}
                                                                        value={imp}
                                                                        control={<Checkbox size='small' checked={fields.clientReportAccess.includes(imp)} />}
                                                                        label={imp.toLocaleUpperCase()}

                                                                        labelPlacement="end"
                                                                    />



                                                                )
                                                            }

                                                        </Collapse>
                                                        <Collapse in={fields.campaignBasedOn.includes('clicks')} dir='horizontal' unmountOnExit timeout={1000} >
                                                            {
                                                                ['clicks', 'cpc', 'total_cpc'].map(cl =>

                                                                    <FormControlLabel
                                                                        key={cl}
                                                                        value={cl}
                                                                        control={<Checkbox size='small' checked={fields.clientReportAccess.includes(cl)} />}
                                                                        label={cl.toLocaleUpperCase()}

                                                                        labelPlacement="end"
                                                                    />



                                                                )
                                                            }

                                                        </Collapse>
                                                        <Collapse in={fields.campaignBasedOn.includes('sessions')} dir='horizontal' unmountOnExit timeout={1000} >
                                                            {
                                                                ['sessions', 'cps', 'total_cps'].map(ss =>

                                                                    <FormControlLabel
                                                                        key={ss}
                                                                        value={ss}
                                                                        control={<Checkbox size='small' checked={fields.clientReportAccess.includes(ss)} />}
                                                                        label={ss.toLocaleUpperCase()}

                                                                        labelPlacement="end"
                                                                    />



                                                                )
                                                            }

                                                        </Collapse>
                                                        <FormControlLabel
                                                            key={'ctr'}
                                                            value={'ctr'}
                                                            control={<Checkbox size='small' checked={fields.clientReportAccess.includes('ctr')} />}
                                                            label={'CTR'}

                                                            labelPlacement="end"
                                                        />




                                                    </FormGroup>
                                                </FormControl>
                                            </fieldset>
                                        </Box>

                                    </Stack>





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
    )
}

export default CampaignForm