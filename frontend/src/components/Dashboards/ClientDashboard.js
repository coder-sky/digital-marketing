import {  Logout } from '@mui/icons-material';
import { AppBar,  Button, Container, Grid,  Paper, Toolbar,  Typography, Box, Stack, TextField, Autocomplete, } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import { TypeAnimation } from 'react-type-animation';
import axios from 'axios';
import swal from 'sweetalert';
import { Navigate, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie'
import UserContext from '../Context/UserContext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { LinearGradient } from 'react-text-gradients'
import { motion } from "framer-motion"
import CountUp from 'react-countup';
import Chart from "react-apexcharts";
import Loader from '../Loader';



function ClientDashboard() {

    const [campaignStats, setCampaignStats] = useState({ campInfo: { total_campaigns: 0, live_campaigns: 0, closed_campaigns: 0 }, campaigns: [], areaGraphData: { labels: [], data: [] }, donutGraphData: { labels: [], data: [] }, tableData: { data: [], headers: [] } })
    const [searchFields, setSearchFields] = useState({ campaign_name: null, from_date: '', to_date: '' })
    const [inputValue, setInputValue] = useState('');
    const [selectedCamp, setSelectedCamp] = useState('')
    const [loader, setLoader] = useState(false)
    const navigate = useNavigate()
    const { userDetails } = useContext(UserContext)


    useEffect(() => {
        const getData = async () => {
            try {
                setLoader(true)
                const res = await axios.get('/api/clientdashboard', { params: { client_id: userDetails.id } })
                //console.log(res.data)
                setSearchFields({ campaign_name: res.data.selectedCamp })
                res.data.selectedCamp && setSelectedCamp(res.data.selectedCamp.campaign_name)
                setCampaignStats(res.data)
                setLoader(false)
            }
            catch (err) {
                swal({
                    title: "Error Occured!",
                    text: err.response.data,
                    icon: 'error'
                })
                setLoader(false)
            }
        }
        if (userDetails.id) {

            getData()
        }
        //console.log('came',userDetails)

    }, [userDetails])

    if (Cookies.get('ssid') === undefined) {
        return <Navigate to="/login" replace={true} />;
    }



    const handleLogout = () => {
        axios.get('/api/logout')
            .then(res => {
                //console.log(res.data)
                swal({
                    title: res.data,

                    icon: "success"
                })
                navigate('/login')
            })
            .catch(() => {
                swal({
                    title: 'Eroor Occured!',
                    text: "Please contact admin",
                    icon: "error"
                })
            })
    }

    const donut = {
        series: campaignStats.donutGraphData.data,
        options: {
            chart: {
                type: 'donut',
                toolbar: {
                    show: false
                },
            },
            labels: campaignStats.donutGraphData.labels,
            title: {
                text: 'Total Campaign Performance',
                align: 'left'
            },
            legend: {
                position: 'bottom'
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '75%',
                        labels: {
                            show: true,

                        }
                    }

                },
            },

            dataLabels: {
                enabled: false,
            },
            animate: true,
            responsive: [{
                breakpoint: 480,
                options: {
                    chart: {
                        width: '100%'
                    },
                    legend: {
                        position: 'bottom'
                    }

                }
            }]
        },


    };

    const data = {

        series: campaignStats.areaGraphData.data.map(data => ({ name: Object.keys(data)[0], data: Object.values(data)[0] })),
        options: {
            chart: {
                height: 350,
                type: 'bar',
                toolbar: {
                    show: false
                },

                zoom: {
                    enabled: false
                }
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    endingShape: 'rounded'
                },
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                show: true,
                width: 2,
                colors: ['transparent']
            },

            grid: {
                row: {
                    colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                    opacity: 0.5
                },
            },
            xaxis: {

                categories: campaignStats.areaGraphData.labels
            }
        },
        fill: {
            opacity: 1
        },
        tooltip: {
            y: {
                formatter: function (val) {
                    return "$ " + val + " thousands"
                }
            }
        }


    };

    const handleSearch = async(e)=>{
        e.preventDefault()
        try {
            const res = await axios.get('/api/searchcampaign', { params: searchFields })
            //console.log(res.data)
            
            setSelectedCamp(searchFields.campaign_name.campaign_name)
            setCampaignStats({...campaignStats, ...res.data})
        }
        catch (err) {
            swal({
                title: "Error Occured!",
                text: err.response.data,
                icon: 'error'
            })
        }

    }


    const handleCampaignChange = async(_,newValue) =>{
        if(newValue){
            try {
                setLoader(true)
                const res = await axios.get('/api/campaigninfo', { params: {client_id:userDetails.id, campaign:newValue} })
                console.log(res.data)
                
                setSelectedCamp(res.data.selectedCamp)
                setCampaignStats({...campaignStats, ...res.data})
                setLoader(false)
            }
            catch (err) {
                swal({
                    title: "Error Occured!",
                    text: err.response.data,
                    icon: 'error'
                })
                setLoader(false)
            }
        }
        setSearchFields({ ...searchFields, campaign_name: newValue });

    }


    return (
        <Box sx={{ width: '100%', height: '100%' }}>
            <AppBar position='static' sx={{ backgroundColor: 'white' }} >{/* sx={{backgroundColor:'white'}}*/}
                <Container maxWidth="100%">
                    <Toolbar disableGutters  >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', height: '60px', }}>
                                <img src='companyLogoHere.png' alt='companyLogo' style={{ width: '80%', height: '100%', objectFit: 'contain' }} />
                            </Box>
                            {userDetails.company_logo!=='' && <Box sx={{ display: 'flex', justifyContent: 'flex-start', height: '60px', }}>
                                <img src={userDetails.company_logo} alt='companyLogo' style={{ width: '80%', height: '100%', objectFit: 'contain' }} />
                            </Box>}
                            <Box >
                                <Button
                                
                                startIcon={<Logout />}
                                    onClick={handleLogout}
                                    sx={{ my: 2, color: 'black', }}
                                >
                                    Logout
                                </Button>

                            </Box>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
            <Box sx={{ width: '100%', height: '100%', display: 'flex', p: 2 }}>
                <Grid container spacing={2}>

                    <Grid item xs={12} sm={12} lg={5.5} xl={5.5}>
                        <Box sx={{ height: '100px', display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>

                            <Typography variant='h3' fontFamily={'"Times New Roman", Times, serif;'} >
                                {userDetails.client_name !== '' && <TypeAnimation
                                    sequence={[
                                        'Welcome, ' + userDetails.client_name ,  
                                        5000, // Waits 1s
                                        '',
                                    ]}

                                    cursor={true}
                                    repeat={Infinity}

                                />}
                            </Typography>
                        </Box>

                    </Grid>
                    <Grid item xs={12} sm={12} lg={2} xl={2}>
                        <Box sx={{ height: '100px' }}>
                            <Paper sx={{ height: '100%', p: 1 }} >
                                <Typography component={'h3'} variant='p' color={'#0086B4'}>Total Campaigns</Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                    {campaignStats.campInfo.total_campaigns !== 0 && <CountUp start={0} end={campaignStats.campInfo.total_campaigns} duration={5} >

                                        {({ countUpRef }) => (
                                            <div>
                                                <span style={{ fontSize: '40px', fontWeight: 'bold', color: '#0086B4' }} ref={countUpRef} />
                                            </div>
                                        )}
                                    </CountUp>
                                    }
                                    {
                                        campaignStats.campInfo.total_campaigns === 0 && <span style={{ fontSize: '40px', fontWeight: 'bold', color: '#0086B4' }}>0</span>
                                    }
                                </Box>

                            </Paper>

                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={12} lg={2} xl={2}>
                        <Box sx={{ height: '100px' }}>
                            <Paper sx={{ height: '100%', p: 1 }} >
                                <Typography component={'h3'} variant='p' color={'#047D4A'}>Live Campaigns</Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                    {campaignStats.campInfo.live_campaigns !== 0 && <CountUp start={0} end={campaignStats.campInfo.live_campaigns} duration={5} >

                                        {({ countUpRef }) => (
                                            <div>
                                                <span style={{ fontSize: '40px', fontWeight: 'bold', color: '#047D4A' }} ref={countUpRef} />
                                            </div>
                                        )}
                                    </CountUp>
                                    }
                                    {
                                        campaignStats.campInfo.live_campaigns === 0 && <span style={{ fontSize: '40px', fontWeight: 'bold', color: '#047D4A' }}>0</span>
                                    }
                                </Box>

                            </Paper>

                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={12} lg={2} xl={2}>
                        <Box sx={{ height: '100px' }}>
                            <Paper sx={{ height: '100%', p: 1 }} >
                                <Typography component={'h3'} variant='p' color={'#B90707'}>Closed Campaigns</Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                    {campaignStats.campInfo.closed_campaigns !== 0 && <CountUp start={0} end={campaignStats.campInfo.closed_campaigns} duration={5} >

                                        {({ countUpRef }) => (
                                            <div>
                                                <span style={{ fontSize: '40px', fontWeight: 'bold', color: '#B90707' }} ref={countUpRef} />
                                            </div>
                                        )}
                                    </CountUp>
                                    }
                                    {
                                        campaignStats.campInfo.closed_campaigns === 0 && <span style={{ fontSize: '40px', fontWeight: 'bold', color: '#B90707' }}>0</span>
                                    }
                                </Box>

                            </Paper>

                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={12} lg={8} xl={8}>
                        <Stack component={'form'} onSubmit={handleSearch} spacing={2} direction={{ xs: 'column', lg: 'row' }}>

                            <Autocomplete
                                disablePortal
                                options={campaignStats.campaigns}
                                fullWidth
                                size='small'
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                getOptionLabel={(option) => option.campaign_name || ""}
                                renderInput={(params) => <TextField required size='small' {...params} label='Select Campaign Name' />}
                                inputValue={inputValue}
                                onInputChange={(_, newInputValue) => {
                                    setInputValue(newInputValue);
                                }}
                                value={searchFields.campaign_name}
                                onChange={handleCampaignChange}
                            />
                            <Stack spacing={2} direction={{ xs: 'column', lg: 'row' }}>
                                <TextField
                                    label='From Date'
                                    size='small'
                                    fullWidth
                                    type='date'
                                    name='fromDate'
                                    value={searchFields.from_date}
                                    onChange={(e) => setSearchFields({ ...searchFields, from_date: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ max: searchFields.to_date }}
                                    required

                                />


                                <TextField
                                    label='To Date'
                                    size='small'
                                    fullWidth
                                    type='date'
                                    name='toDate'
                                    value={searchFields.to_date}
                                    onChange={(e) => setSearchFields({ ...searchFields, to_date: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ min: searchFields.from_date }}
                                    required


                                />
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <Button variant='outlined' color='warning' type='submit'>Search</Button>
                                </Box>
                            </Stack>
                        </Stack>

                    </Grid>
                    {campaignStats.tableData.data.length !== 0 && <>


                        <Grid item xs={12} sm={12} lg={12} xl={12}>

                            <motion.div

                                initial={{
                                    opacity: 0,
                                    // if odd index card,slide from right instead of left
                                    x: -50
                                }}
                                whileInView={{
                                    opacity: 1,
                                    x: 0, // Slide in to its original position
                                    transition: {
                                        duration: 1 // Animation duration
                                    }
                                }}
                                viewport={{ once: true }}
                            >

                                <Typography textAlign={'center'} component={'h2'} variant='p'><LinearGradient gradient={['to bottom', '#534E57,#63AECB']}>
                                    {selectedCamp}
                                </LinearGradient>
                                </Typography>
                            </motion.div>



                        </Grid>
                        <Grid item xs={12} sm={12} lg={8} xl={8}>
                            <motion.div

                                initial={{
                                    opacity: 0,
                                    // if odd index card,slide from right instead of left
                                    x: -50
                                }}
                                whileInView={{
                                    opacity: 1,
                                    x: 0, // Slide in to its original position
                                    transition: {
                                        duration: 1 // Animation duration
                                    }
                                }}
                                viewport={{ once: true }}
                            >
                                <Paper sx={{ p: 1 }} elevation={8}>
                                    <Chart
                                        series={data.series}
                                        options={data.options}
                                        type='bar'
                                        height={'350px'}


                                    />
                                </Paper>
                            </motion.div>
                        </Grid>
                        <Grid item xs={12} sm={12} lg={4} xl={4}>
                            <motion.div

                                initial={{
                                    opacity: 0,
                                    // if odd index card,slide from right instead of left
                                    y: -50
                                }}
                                whileInView={{
                                    opacity: 1,
                                    y: 0, // Slide in to its original position
                                    transition: {
                                        duration: 1 // Animation duration
                                    }
                                }}
                                viewport={{ once: true }}
                            >
                                <Paper sx={{ p: 3, height: '380px' }} elevation={8}>
                                    <Chart
                                        series={donut.series}
                                        options={donut.options}
                                        type='donut'
                                        height={'100%'}


                                    />
                                </Paper>
                            </motion.div>
                        </Grid>
                        <Grid item xs={12} sm={12} lg={12} xl={12}>
                            <motion.div

                                initial={{
                                    opacity: 0,
                                    // if odd index card,slide from right instead of left

                                }}
                                whileInView={{
                                    opacity: 1,

                                    transition: {
                                        duration: 1 // Animation duration
                                    }
                                }}
                                viewport={{ once: true }}
                            >
                                <Paper  elevation={8}>
                                    <DataTable value={campaignStats.tableData.data} size='small' height={'600px'} paginator rows={10} paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                        rowsPerPageOptions={[10, 25, 50, 100, 300, 500]} tableStyle={{ maxWidth: '150rem' }} scrollHeight='350px' scrollable>
                                        {
                                            campaignStats.tableData.headers.map((col, index) => (
                                                <Column key={index} headerStyle={{ backgroundColor: '#00A4CC', color: '#ffffff' }} sortable align={'center'} field={col.field} header={col.header}></Column>
                                            ))
                                        }

                                    </DataTable>

                                </Paper>
                            </motion.div>
                        </Grid>
                    </>
                    }
                    {
                        campaignStats.tableData.data.length === 0 && <>
                        <Grid item xs={12} sm={12} lg={12} xl={12}>
                            <motion.div

                                initial={{
                                    opacity: 0,
                                    // if odd index card,slide from right instead of left

                                }}
                                whileInView={{
                                    opacity: 1,

                                    transition: {
                                        duration: 1 // Animation duration
                                    }
                                }}
                                viewport={{ once: true }}
                            >
                                
                                <Box sx={{ width: '100%', height: '300px', backgroundColor: '#fafbfd', display:'flex', justifyContent:'center' }}>
                                <img src='https://static.shegatravel.com/assets/whitelable1/img/norecordfound.gif' alt='No records' style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </Box>
                                
                            </motion.div>
                            </Grid>
                        </>
                    }
                </Grid>

            </Box>
            <Loader loader={loader} />
        </Box>
    )
}

export default ClientDashboard