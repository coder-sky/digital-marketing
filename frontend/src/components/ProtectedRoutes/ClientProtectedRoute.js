import { Navigate, } from 'react-router-dom'
import Cookies from 'js-cookie'
import UserContext from '../Context/UserContext'
import { useContext, } from 'react'
import { Backdrop, CircularProgress } from '@mui/material'

//import axios from 'axios'


function ClientProtectedRoute(props) {
  const { component } = props
  const { userDetails } = useContext(UserContext)
  //const location = useLocation();

  //const path = location.pathname.replace('/','').replace(/-/g,'').toLowerCase()
  
  if (Cookies.get('ssid') === undefined) {
    return <Navigate to='/login' />
  }
  else if(userDetails.role==='client'){
    return component
  }
  else if(userDetails.role==='user'||userDetails.role==='superadmin'){
    return <Navigate to='/home' />
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
 
  else{
    return <Navigate to='/dashboard' />
  }
}

export default ClientProtectedRoute