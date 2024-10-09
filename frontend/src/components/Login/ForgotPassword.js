import { ArrowBack, LockReset, Visibility, VisibilityOff } from '@mui/icons-material'
import { Box,  Fade, FormControl, Grid, IconButton, InputAdornment, InputLabel, OutlinedInput, Paper, Stack, Typography, } from '@mui/material'
import axios from 'axios'
import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OtpInput from 'react-otp-input';
import LoadingButton from '@mui/lab/LoadingButton'
import swal from 'sweetalert'

function ForgotPassword() {
  const [forgotPasswordFields, setForgotPasswordFields] = useState({username:'',email:''})
  const [activeView, setActiveView] = useState(0)

  const [clientOtp, setClientOtp] = useState('')
  const [showPassword, setShowPassword] = useState({ newPass: false, confirmPass: false });
  const [password, setPassword] = useState({ newPass: '', confirmPass: '' })
  const [loadSubmit, setLoadSubmit] = useState(false)
  const [loadReset, setLoadReset] = useState(false)
  const [otpRef, setOtpRef] = useState('')

  const navigate = useNavigate()

  const ForgotPassView = () => {

    const handleForgotPassword = async (e) => {
      e.preventDefault()
      //console.log(email)
      setLoadSubmit(true)
      try {
        const result = await axios.post('/api/forgotpassword', forgotPasswordFields)
        //console.log(result)
      
        swal({
          title: "Succeed",
          text: result.data.msg,
          icon: "success",
          button:'Procced'
        });
        
        setOtpRef(result.data.ref)
        setActiveView(1)
        setLoadSubmit(false)


      }
      catch (err) {
        //console.log(err)
        setLoadSubmit(false)
        //toast.error(err.response.data)
        swal({
          title: "Error Occured!",
          text: err.response.data,
          icon: "error",
          
        });
      }
    }


    return (
      <Paper square={false} elevation={10} sx={{ p: 2, maxHeight: '450px', width:'100%',  display: 'flex', flexDirection: 'column', justifyContent:'flex-start' }}>
        <Stack direction={'row'} display={'flex'} justifyContent={'flex-start'}>
          <IconButton title='back' onClick={() => navigate('/login')}>
            <ArrowBack />
          </IconButton>
        </Stack>
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <img style={{ marginLeft: '10px', width: '80px', height: '80px' }} src='LOCK2.gif' alt='lock' />
          <Typography mt={2} variant='h5' component={'h5'}>Forgot Password ?</Typography>

          <Box component={'form'} onSubmit={handleForgotPassword} mt={1} sx={{ width:'80%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Typography mb={2} variant='p' sx={{ color: 'gray' }} component={'p'}>Please enter your username and email address and we'll send you otp to registered email to reset your password.</Typography>
            <FormControl  fullWidth sx={{mb:2}} >
              <InputLabel size='small' required>Username</InputLabel>
              <OutlinedInput
                fullWidth
                type='text'
                label='Username'
                value={forgotPasswordFields.username}
                required
                size='small'
                onInput={e => setForgotPasswordFields({...forgotPasswordFields,username:e.target.value})}
              />
            </FormControl>
            <FormControl fullWidth >
            
              <InputLabel size='small' required>Email</InputLabel>
              <OutlinedInput
                fullWidth
                type='email'
                label='Email'
                value={forgotPasswordFields.email}
                required
                size='small'
                onInput={e => setForgotPasswordFields({...forgotPasswordFields,email:e.target.value})}
              />
            </FormControl>
            {/* </Box></Box><Button type='submit' color='info' sx={{ mt: 2, mb: 5 }} variant='contained'>Submit</Button> */}
            <LoadingButton
              sx={{ mt: 2, mb: 5 }}
              color='info'
              type='submit'
              loading={loadSubmit}


              variant="contained"
            >
              Submit
            </LoadingButton>
          </Box>
        </Box>
      </Paper>

    )
  }


  const OtpView = useMemo(() => {
    const handleSubmitOTP = async(e) => {
      e.preventDefault()
      setLoadSubmit(true)
      try{
        await axios.post('/api/verifycode', { ...forgotPasswordFields, ref:otpRef, clientOtp:clientOtp })
        setActiveView(2)
        //console.log(result)
        setLoadSubmit(false)

      }
      catch(err){
        setLoadSubmit(false)
        swal({
          title: "Error Occured!",
          text: err.response.data,
          icon: "error",
          
        });
      }
  
      }



    return (

      <Paper square={false} elevation={10} sx={{ p: 2, maxHeight: '350px', flexGrow: 0.1, display: 'flex', flexDirection: 'column' }}>
        <Stack direction={'row'} display={'flex'} justifyContent={'flex-start'}>
          <IconButton title='back' onClick={() => {
            setActiveView(0)
            setClientOtp('')
            setOtpRef('')
          }} >
            <ArrowBack />
          </IconButton>
        </Stack>
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

          <Typography mt={2} variant='p' component={'h5'} sx={{ fontSize: { xs: '12px', lg: '20px' } }}>Enter Your 6-Digit Validation Code.</Typography>

          <Box component={'form'} onSubmit={handleSubmitOTP} mt={5} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <OtpInput
              value={clientOtp}
              onChange={setClientOtp}
              numInputs={6}
              renderSeparator={<span>-</span>}
              renderInput={(props) => <input {...props} />}
              inputStyle={{ width: '25px', height: '25px', margin: '3px' }}

            />
            <LoadingButton
              sx={{ mt: 2, mb: 5 }}
              color='success'
              type='submit'
              loading={loadSubmit}
              variant="contained"
            >
              Submit
            </LoadingButton>
            
          </Box>


        </Box>
      </Paper>


    );

  }, [clientOtp, forgotPasswordFields, loadSubmit, otpRef])


  const ResetView = () => {

    const handleResetPassword = async (e) => {
      e.preventDefault()
      if (password.newPass !== '' && password.confirmPass !== '' && password.newPass !== password.confirmPass) {
        //toast.warning('confirm password must match with new password!')
        swal({
          title: "Passowrd Not Matched",
          text: 'confirm password must match with new password!',
          icon: "error",
          
        });
      }
      else {
        setLoadReset(true)

        //console.log(email, password)
        try {
          const result = await axios.put('/api/resetpassword', { ...forgotPasswordFields, password: password.confirmPass })
          swal({
            title: "Succeed",
            text: result.data,
            icon: "success",
          });
          setLoadReset(false)
          setActiveView(0)
          setClientOtp('')
          setOtpRef('')
          setPassword('')
          setShowPassword('')
          navigate('/login')


        }
        catch (err) {
          //console.log(err)
          setLoadReset(false)
          swal({
            title: "Error Occured!",
            text: err.response.data,
            icon: "error",
            
          });
        }
      }


    }

    return (
      <Box sx={{width:'100%', }}>
      <Fade in={activeView === 2} timeout={2000}>
        <Paper  elevation={10} sx={{ p: 2, maxHeight: '400px', flexGrow: 0.1, display: 'flex', flexDirection: 'column', width:'100%', }}>
          <Stack  direction={'row'} display={'flex'} justifyContent={'flex-start'} width={'100%'}>
            <IconButton title='back' size='small' onClick={() => {
              setActiveView(0)
              setClientOtp('')
              setOtpRef('')
              setPassword({ newPass: '', confirmPass: '' })
              setShowPassword({ newPass: false, confirmPass: false });
            }} >
              <ArrowBack />
            </IconButton>
          </Stack>
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width:'100%' }}>

            <svg
              width='60px'
              height='60px'
            >
              <LockReset sx={{ color: '#00ACFF', fontSize: 40 }} />
            </svg>

            <Typography mt={1} variant='p' component={'h5'} sx={{ fontSize: { xs: '12px', lg: '20px' } }}>Reset Your Password</Typography>

            <Box component={'form'} onSubmit={handleResetPassword} mt={2} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width:'100%', }}>
              <Stack spacing={2} width={'80%'}>
                <FormControl fullWidth>
                  <InputLabel>New Password</InputLabel>
                  <OutlinedInput
                    name='newPass'
                    fullWidth
                    required={true}
                    value={password.newPass}
                    onInput={e => setPassword({ ...password, newPass: e.target.value })}
                    type={showPassword.newPass ? 'text' : 'password'}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword({ ...showPassword, newPass: !showPassword.newPass })}
                          onMouseDown={() => setShowPassword({ ...showPassword, newPass: !showPassword.newPass })}
                          edge="end"
                        >
                          {showPassword.newPass ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    }
                    label="New Password"
                  />
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel error={password.newPass !== '' && password.confirmPass !== '' && password.newPass !== password.confirmPass}>Confirm Password</InputLabel>
                  <OutlinedInput
                    error={password.newPass !== '' && password.confirmPass !== '' && password.newPass !== password.confirmPass}
                    name='confirmPass'
                    value={password.confirmPass}
                    onInput={e => setPassword({ ...password, confirmPass: e.target.value })}
                    required={true}
                    type={showPassword.confirmPass ? 'text' : 'password'}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword({ ...showPassword, confirmPass: !showPassword.confirmPass })}
                          onMouseDown={() => setShowPassword({ ...showPassword, confirmPass: !showPassword.confirmPass })}
                          edge="end"
                        >
                          {showPassword.confirmPass ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    }
                    label="Confirm Password"
                  />
                </FormControl>
              </Stack>

              <LoadingButton

                type='submit'
                loading={loadReset}
                color='info'
                sx={{ mt: 2, mb: 5 }}
                variant="contained"

              >
                Submit
              </LoadingButton>

            </Box>
          </Box>
        </Paper>
      </Fade>
      </Box>
    )
  }


  //views
  const views = [ForgotPassView(), OtpView, ResetView()]

  return (
    <>
      <Box component='main' sx={{ flexGrow: 1, }}>
        <Box sx={{ height: '100vh', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundImage: 'url(12244.jpg)', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}>
          <Grid container sx={{display: 'flex', justifyContent: 'center',}}>
            <Grid item xs={12} lg={5} xl={4}>
              
              {
                views[activeView]
              }
              
            </Grid>
            
          </Grid>

        </Box>
      </Box>


    </>
  )
}

export default ForgotPassword