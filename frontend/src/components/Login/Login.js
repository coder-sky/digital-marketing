import React, { useContext, useMemo, useState } from 'react'
import { Navigate, useNavigate } from "react-router-dom";
import { Cloud, renderSimpleIcon } from 'react-icon-cloud'
import {
  siFacebook,
  siGoogleads,
  siInstagram,
  siAmazon,
  siYoutube,
  siMicrosoftbing,
  siSnapchat,
  siLinkedin,
  siReddit,
  siX,
  siSpotify,
  siPinterest,
  siAdroll,
  siQuora,
  siPandora,
  siSwiggy,
  siZomato,
  siSony,
  siUber,
  siAirtel,
  siBritishairways,
  siCocacola,
  siHyundai,
  siIcicibank,
  siIgn,
  siLenovo,
  siSuzuki,
  siVodafone,
  siUnilever,
  siSamsung,
} from 'simple-icons';

import './Login.css'
import { motion } from "framer-motion"
import { Box, Button, Container, Grid, IconButton, Paper, Stack, TextField, Typography } from '@mui/material';
import { LinearGradient } from 'react-text-gradients'
import { Visibility, VisibilityOff } from '@mui/icons-material';
import LoadingButton from '@mui/lab/LoadingButton';
import swal from 'sweetalert';
import Cookies from 'js-cookie'
import UserContext from '../Context/UserContext';
import CryptoJS from 'crypto-js';
import Instance from '../../api/apiInstance';


const Login = () => {
  const [fields, setFields] = useState({ username: '', password: '' })
  const [visibility, setVisibility] = useState(false)
  const [loadingButton, setLoadingButton] = useState(false)
  const { handleUserDetails } = useContext(UserContext)
  const navigate = useNavigate()

  const globe = useMemo(() => {
    const icons = [siFacebook, siGoogleads, siInstagram, siAmazon, siYoutube, siMicrosoftbing, siSnapchat, siLinkedin, siReddit, siX, siSpotify, siPinterest, siAdroll, siQuora, siPandora, siSwiggy, siZomato, siSony, siUber, siAirtel, siBritishairways, siCocacola, siHyundai, siIcicibank, siIgn, siLenovo, siSuzuki, siVodafone, siUnilever, siSamsung].map((icon) => {
      return renderSimpleIcon({
        icon,
        size: 80,
        aProps: {
          onClick: (e) => e.preventDefault()
        }

      })
    })
    return (
      <Cloud options={{ width: '100px', wheelZoom: false, initial: [0.2, -0.1], }}>
        {icons}
      </Cloud>
    )
  }, [])

  if (Cookies.get('ssid') !== undefined) {
    return <Navigate to="/home" replace={true} />;
  }

  const handleLogin = (e) => {
    e.preventDefault()
    setLoadingButton(true)
    const api = Instance()
    api.post('/api/login', fields,
      )
      .then(res => {
        // console.log(res)
        const {authToken, userDetails} = res.data
        Cookies.set('ssid', authToken,{secure:true, expires:30})
        const decrypted = JSON.parse(CryptoJS.AES.decrypt(userDetails,process.env.REACT_APP_DATA_ENCRYPTION_SECRETE).toString(CryptoJS.enc.Utf8))
        handleUserDetails(decrypted)
        // console.log(res.data)       
        navigate('/home')

      })
      .catch((err)=>{
        // console.log(err)
        setLoadingButton(false)
        swal({
          title:err.response.data,
          text:'Please enter valid username and password',
          icon:'error'
        })
      })

  }

  return (
    <>
      <Box sx={{ height: '100vh', width: '100%', backgroundImage: 'url(12244.jpg)', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}>
        <Grid container sx={{ height: '100%', width: '100%', }}>
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>

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
              viewport={{ once: false }}
            >

              <Typography textAlign={'center'} component={'h1'} variant='p'><LinearGradient gradient={['to left', '#17acff ,#ff68f0']}>
                Company Name Here
              </LinearGradient>
              </Typography>
            </motion.div>



          </Grid>

          <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
            <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img src='d2.gif' alt='back' style={{ maxWidth: '100%', objectFit: 'cover' }} />
            </Box>


          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
            <Paper elevation={24} sx={{ m: 2, p: 1, backgroundImage: 'linear-gradient(135deg, #FFFEFF 10%, #D7FFFE 100%);', }}>

              <Container sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', height: '80px', }}>
                  <img src='companyLogoHere.png' alt='companyLogo' style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                </Box>
                <Box sx={{ p: 'auto' }}>

                  <Stack component={'form'} onSubmit={handleLogin} direction={'column'} spacing={2}>
                    <Typography component={'h5'} variant='p'>Please login to your account</Typography>
                    <TextField
                      label='Username'
                      size='small'
                      fullWidth
                      type='text'
                      name='Username'
                      value={fields.username}
                      onChange={e => setFields({ ...fields, username: e.target.value })}
                      required />
                    <TextField
                      label='Password'
                      required
                      type={visibility ? 'text' : 'password'}
                      size='small'
                      name='password'
                      value={fields.password}
                      onChange={e => setFields({ ...fields, password: e.target.value })}
                      InputProps={{
                        endAdornment: <IconButton size='small' edge="end" onClick={() => setVisibility(!visibility)}>{visibility ? <VisibilityOff /> : <Visibility />}</IconButton>
                      }}
                    />
                    <LoadingButton

                      type='submit'
                      loading={loadingButton}
                      color='info'

                      variant="contained"

                    >
                      Submit
                    </LoadingButton>
                    <Button style={{ color: '#002db3', }} onClick={() => navigate('/forgotpassword')} >forgot password?</Button>
                  </Stack>

                </Box>
              </Container>

              <Container sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                <Grid container>
                  <Grid item xs={12} sm={12} md={12} lg={8} xl={12}>
                    <Box>
                      <Typography component={'h4'} variant='p'>We are more than just a company</Typography>
                      <Typography sx={{ textAlign: 'justify', fontSize: '14px' }}>
                        [Company Name Here] consolidates Ad-tech, New Media and IoT based businesses across the globe, primarily in the digital eco-system. Clients include leading blue chip advertisers like Airtel, British Airways, Coca-Cola, Hyundai Motors, ICICI Bank, ITC, ING, Lenovo, LIC, Maruti Suzuki, MTV, P&G, Qatar Airways, Samsung, Viacom, Sony, Star India, Vodafone, Titan, and Unilever.
                      </Typography>

                    </Box>

                  </Grid>
                  <Grid item xs={12} sm={12} md={12} lg={4} xl={12}>
                    <Box sx={{ display: 'flex', justifyItems: 'cenetr', flexDirection: 'column', alignItems: 'center' }}>
                      {globe}
                      <Typography component={'h6'} variant='p' color={'gray'} textAlign={'center'}>Clients</Typography>
                    </Box>

                  </Grid>
                </Grid>

              </Container>
            </Paper>



          </Grid>

        </Grid>


      </Box>

    </>

  )
}

export default Login