import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import UserContext from './UserContext';
import swal from 'sweetalert';

function UserProvider(props) {
  const [userDetails, setUserDetails] = useState({id:'', client_name:'', username:'', email:'', company_logo:'', role:''})
  const [unAuth, setUnAuth] = useState(false)
  const navigate = useNavigate()
  //console.log(context)

  useEffect(() => {

    if (Cookies.get('ssid') !== undefined ) {
      axios.get('/api/checkuser')
        .then(res => { 
          //console.log(res.data)         
          setUserDetails(res.data)
        })
        .catch(err => {

          if (err.response.data === "Unauthorized") {
            //console.log('hey', err)
            Cookies.remove('ssid')
            swal({
              title:'Unauthorized User',
              icon: "error",
            })
            setUnAuth(true)
          }
          else if(err.response.status===504){
            swal({
              title:'Error occured!',
              text:"Not able get data contact admin!",
              icon: "error",
            })
            
          }
          //console.log(err)
        })
    }

  }, [])
  //console.log('context called')

  if (unAuth) {
    setUnAuth(false)
    //console.log('coming')

    return navigate('/login', { replace: true })
  }


  const handleUserDetails = (data) => {
    setUserDetails(data)
  }

  return (
    <UserContext.Provider value={{ userDetails, handleUserDetails }}>

      {props.children}
      
    </UserContext.Provider>

  )
}

export { UserProvider };


