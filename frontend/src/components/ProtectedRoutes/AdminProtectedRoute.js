import { Navigate, useLocation } from 'react-router-dom'
import Cookies from 'js-cookie'
import UserContext from '../Context/UserContext'
import { useContext, } from 'react'
import { Backdrop, CircularProgress } from '@mui/material'

//import axios from 'axios'


function AdminProtectedRoute(props) {
  const { component } = props
  const { userDetails } = useContext(UserContext)
  const location = useLocation();

  const path = location.pathname.replace('/','').replace(/-/g,'').toLowerCase()
  
  if (Cookies.get('ssid') === undefined) {
    return <Navigate to='/login' />
  }
  
  else if(userDetails.role==='superadmin'){
    return component
  }
  else if(userDetails.role==='user'&&['home', 'campaignform', 'reportform'].includes(path)){
    
    return component
  }
  else if(userDetails.role===''){
    return(
    <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={userDetails.role===''}
        
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    )
  }
  else if(userDetails.role==='client'){
    return <Navigate to='/dashboard' />
  }
  else{
    return <Navigate to='/home' />
  }
}

export default AdminProtectedRoute