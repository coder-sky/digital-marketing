import { Box, Button, Collapse,  Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton, InputAdornment, Slide, Stack, TextField, Typography, styled } from '@mui/material'
import React, { forwardRef, useEffect, useMemo, useState } from 'react'
import Navbar from '../NavBar/Navbar'
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import swal from 'sweetalert';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { Cancel, CloudUpload, Search } from '@mui/icons-material';

import Loader from '../Loader';
import LoadingButton from '@mui/lab/LoadingButton';
import Instance from '../../api/apiInstance';


const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});
const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});


function ClientDetails() {
    const [clientData, setClientData] = useState([])
    const [filterdClientData, setFilterdClientData] = useState(clientData)
    const [loader, setLoader] = useState(false)
    const [update, setUpdate] = useState(0)
    const [editFields, setEditFields] = useState({ client_name: '', username: '', email: '', date_of_joining: '', logo: { filename: '', url: '' } })
    const [prevEditFields, setPrevEditFields] = useState(editFields)
    const [open, setOpen] = useState(false);
    const [loadButton, setLoadButton] = useState(false)



    const handleClose = () => {
        setOpen(false);
    };




    useEffect(() => {
        const getData = async () => {
            setLoader(true)
            try {
                const api = Instance()
                const res = await api.get('/api/clientdetails')
                // console.log(res.data)
                const data = res.data.map(data => ({ ...data, date_of_joining: new Date(data.date_of_joining).toLocaleString('en-CA').slice(0, 10) }))
                setClientData(data)
                setFilterdClientData(data)
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

    

    const imageBodyTemplate = (rowData) => {
        return <img src={rowData.company_logo} alt={rowData.client_name} onError={(err) => err.target.src = 'noImage.jpeg'} width="64px" height={'40px'} style={{ objectFit: 'contain' }} className="shadow-4" />;
    };

    const handleDeleteRow = (row) => {
        swal({
            title: "Do you want delete client?",
            text: "Once deleted, you will not be able to recover this details!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    // console.log(row)
                    const api = Instance()
                    api.post('/api/deleteclient', row)
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
        const logoUrl = rowData.company_logo
        let url = '', filename = '';
        if (logoUrl !== '') {
            filename = logoUrl.slice(logoUrl.lastIndexOf('/') + 1,)
            url = logoUrl

        }
        setEditFields({ ...rowData, logo: { filename: filename, url: url } })
        setPrevEditFields({ ...rowData, logo: { filename: filename, url: url } })
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
        const convertBase64 = (file) => {
            return new Promise((resolve, reject) => {
                const fileReader = new FileReader();
                fileReader.readAsDataURL(file);
    
                fileReader.onload = () => {
                    resolve(fileReader.result);
                };
    
                fileReader.onerror = (error) => {
                    // console.log('err',error)
                    reject(error);
                };
            });
        };

        const handleSubmit = async(e)=>{
            e.preventDefault()
            
            if(JSON.stringify(prevEditFields)!==JSON.stringify(editFields)){
                setLoadButton(true)
                try{
                    const api = Instance()
                    const res = await api.put('/api/editclient', {newData:editFields,prevData:prevEditFields})
                    // console.log(res.data)
                    setLoadButton(false)
                    setOpen(false)
                    setUpdate(prev=>prev+1)
                    swal({
                        title:"Success",
                        text:res.data,
                        icon:"success"
                    })

                }
                catch(err){
                    setLoadButton(false)
                    swal({
                        title:'Error Occured!',
                        text:err.response.data,
                        icon:'error'
                    })
                }
                // console.log(editFields)
            }
        }
        return (
            <>
                <Dialog
                    fullWidth={true}
                    maxWidth={'sm'}
                    open={open}
                    onClose={handleClose}
                    TransitionComponent={Transition}
                    keepMounted
                >
                    <DialogTitle sx={{ fontWeight: 'bold' }}>Edit Client</DialogTitle>
                    <DialogContent>
                        <Stack component={'form'} onSubmit={handleSubmit} id='editclientform' spacing={{ xs: 2, xl: 3 }} p={1}>

                            <TextField
                                label='Client Name'
                                required
                                type='text'
                                size={'small'}
                                name='client_name'
                                value={editFields.client_name}
                                disabled
                            
                            />
                            <TextField
                                label='Client User Name'
                                required
                                type='text'
                                size='small'
                                name='username'
                                value={editFields.username}
                                disabled
                            
                            />

                            <TextField

                                label='Password'
                                required
                                type={'password'}
                                size='small'
                                name='password'
                                value={'xxxxxxxxxxxxxx'}
                                disabled
                            

                            />


                            <TextField
                                label='Client Email'
                                required
                                type='email'
                                size='small'
                                name='email'
                                value={editFields.email}
                                onChange={e=>setEditFields({...editFields, email:e.target.value})}
                            />
                            <TextField
                                label='Date of joining'
                                required
                                type='date'
                                size='small'
                                InputLabelProps={{ shrink: true }}
                                name='date_of_joining'
                                value={editFields.date_of_joining}
                                onChange={e=>setEditFields({...editFields, date_of_joining:e.target.value})}
                            />
                            <Button
                                component="label"
                                role={undefined}
                                variant="contained"
                                tabIndex={-1}
                                startIcon={<CloudUpload />}

                            >
                                Choose Logo
                                <VisuallyHiddenInput type="file" accept="image/*" max={1} onInput={async (e) => {
                                    const file = e.target.files[0];
                                    // console.log(file.name,file)
                                    try {
                                        const url = await convertBase64(file)
                                        file['url'] = url
                                        // console.log(url)
                                        setEditFields({ ...editFields, logo: { filename: file.name, url: url } })
                                    }
                                    catch (err) {
                                        // console.log(err)
                                    }


                                }} />
                            </Button>
                            <Collapse in={editFields.logo.url !== ''} unmountOnExit timeout={'auto'} >
                                <Typography component={'h5'} variant='p'>File: {editFields.logo.filename}<IconButton size='small' onClick={() => setEditFields({ ...editFields, logo: { filename: '', url: '' } })}><Cancel fontSize='12px' color='error' /></IconButton></Typography>
                            </Collapse>

                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Stack spacing={1} direction={'row'}>
                        <Button  color='error' onClick={handleClose}>cancel</Button>
                        <LoadingButton loading={loadButton}  color='success' form='editclientform' type='submit'  >Save</LoadingButton>
                        </Stack>
                    </DialogActions>
                </Dialog>

            </>
        )
    }, [editFields, open,prevEditFields,loadButton])


    const renderHeader = () => {


        return (
            <>
                <Stack spacing={2}>
                    <Typography component={'h1'} variant='p' textAlign={'center'} >Client Details</Typography>
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'right' }}>
                        <TextField
                            label='Search Client Name'
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
                                const filter = clientData.filter(data => data.client_name.toLowerCase().includes(val))
                                setFilterdClientData(filter)
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
                            <DataTable value={filterdClientData} header={header} size='small' paginator rows={10} paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                rowsPerPageOptions={[10, 25, 50]} scrollHeight='350px' scrollable   >
                                <Column headerStyle={{ backgroundColor: '#00A4CC', color: '#ffffff' }} align={'center'} field="client_name" header="Client Name"></Column>
                                <Column headerStyle={{ backgroundColor: '#00A4CC', color: '#ffffff', maxWidth:'150px' }}  field="username" header="Username" align={'center'}></Column>
                                <Column headerStyle={{ backgroundColor: '#00A4CC', color: '#ffffff' }} field="email" header="Email" align={'center'}></Column>
                                <Column headerStyle={{ backgroundColor: '#00A4CC', color: '#ffffff' }} field="date_of_joining" header="Date of joining" align={'center'}></Column>
                                <Column headerStyle={{ backgroundColor: '#00A4CC', color: '#ffffff' }} header="Company Logo" align={'center'} body={imageBodyTemplate} />
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

export default ClientDetails