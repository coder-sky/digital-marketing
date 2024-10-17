import { Box, Button, Container, Fade, FormControl, FormControlLabel, FormLabel, Grid, IconButton, Paper, Radio, RadioGroup, Stack, TextField, Typography, styled } from '@mui/material'
import React, { useState } from 'react'
import Navbar from '../NavBar/Navbar'
import { VisibilityOff, RotateLeft, Visibility, CloudUpload, Cancel, } from '@mui/icons-material';
import { generate } from '@wcj/generate-password';
import swal from 'sweetalert';
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

function ClientForm() {
    const [fields, setFields] = useState({ clientName: '', clientUserName: '', password: '', clientEmail: '', dateOfJoining: '', logo: { filename: '', url: '' }, sendMail: 'no' })
    const [visibility, setVisibility] = useState(false)
    const [loadButton, handleLoadButton] = useState(false)

    const handlePasswordGenerate = () => {
        const pass = generate({ length: 8, special: false })
        setFields({ ...fields, password: pass })
    }

    const handleFieldsChange = (e) => {
        setFields({ ...fields, [e.target.name]: e.target.value })
    }

    const handleClear = () => {
        setFields({ clientName: '', clientUserName: '', password: '', clientEmail: '', dateOfJoining: '', logo: { filename: '', url: '' }, sendMail: 'no' })
    }

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

    const handleSubmit = (e) => {
        e.preventDefault()
        // console.log(fields)
        handleLoadButton(true)
        const api = Instance()
        api.post('/api/addclientdetails', fields)
            .then(res => {
                handleClear()
                handleLoadButton(false)
                swal({
                    title: "Success",
                    text: res.data,
                    icon: 'success'
                })
            })
            .catch(err => {
                handleLoadButton(false)
                swal({
                    title: "Error Occured!",
                    text: err.response.data,
                    icon: 'error'
                })
            })
    }
    return (
        <Box sx={{ width: '100%', height: '100vh', backgroundImage: 'url(12244.jpg)', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}>

            <Navbar />
            <Grid container>
                <Container sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', mt: { xl: 3 } }}>
                    <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
                        <Paper sx={{ p: 3, }} elevation={20}  >
                            <Stack component={'form'} onSubmit={handleSubmit} spacing={{ xs: 2, xl: 3 }}>
                                <Typography component={'h1'} variant='p' textAlign={'center'} >Client Form</Typography>
                                <TextField
                                    label='Client Name'
                                    required
                                    type='text'
                                    size={'small'}
                                    name='clientName'
                                    value={fields.clientName}
                                    onChange={handleFieldsChange}
                                />
                                <TextField
                                    label='Client User Name'
                                    required
                                    type='text'
                                    size='small'
                                    name='clientUserName'
                                    value={fields.clientUserName}
                                    onChange={handleFieldsChange}
                                />
                                <Stack direction={'row'} spacing={2}>
                                    <TextField

                                        label='Password'
                                        required
                                        type={visibility ? 'text' : 'password'}
                                        size='small'
                                        name='password'
                                        value={fields.password}
                                        onChange={handleFieldsChange}
                                        InputProps={{
                                            endAdornment: <IconButton size='small' edge="end" onClick={() => setVisibility(!visibility)}>{visibility ? <VisibilityOff /> : <Visibility />}</IconButton>
                                        }}
                                    />
                                    <Typography component={'h5'} variant='p' display={'flex'} alignItems={'center'}>generate password  <IconButton size='small' color='info' onClick={handlePasswordGenerate}><RotateLeft /></IconButton></Typography>

                                </Stack>

                                <TextField
                                    label='Client Email'
                                    required
                                    type='email'
                                    size='small'
                                    name='clientEmail'
                                    value={fields.clientEmail}
                                    onChange={handleFieldsChange}
                                />
                                <TextField
                                    label='Date of joining'
                                    required
                                    type='date'
                                    size='small'
                                    InputLabelProps={{ shrink: true }}
                                    name='dateOfJoining'
                                    value={fields.dateOfJoining}
                                    onChange={handleFieldsChange}
                                />
                                <Stack spacing={2} sx={{ width: '100%' }} direction={'row'} display={'flex'} alignItems={'center'}>
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
                                                setFields({ ...fields, logo: { filename: file.name, url: url } })
                                            }
                                            catch (err) {
                                                // console.log(err)
                                            }


                                        }} />
                                    </Button>
                                    <Fade in={fields.logo.url !== ''} timeout={'auto'}>
                                        <Typography component={'h5'} variant='p'>File: {fields.logo.filename}<IconButton size='small' onClick={() => setFields({ ...fields, logo: { filename: '', url: '' } })}><Cancel fontSize='12px' color='error' /></IconButton></Typography>
                                    </Fade>
                                </Stack>
                                <FormControl >
                                    <RadioGroup
                                        row
                                        name="controlled-radio-buttons-group"
                                        value={fields.sendMail}
                                        onChange={e => setFields({ ...fields, sendMail: e.target.value })}
                                    >
                                        <FormLabel sx={{ m: 1, }}  >Do you want send login details through mail:</FormLabel>
                                        <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                                        <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                                    </RadioGroup>
                                </FormControl>
                                <Stack spacing={4} direction={'row'} display={'flex'} justifyContent={'center'}>
                                    <LoadingButton loading={loadButton} variant='contained' color='success' type='submit'>Submit</LoadingButton>
                                    <Button variant='contained' color='error' type='clear' onClick={handleClear}> Clear</Button>
                                </Stack>
                            </Stack>

                        </Paper>

                    </Grid>
                </Container>
            </Grid>
        </Box>
    )
}

export default ClientForm