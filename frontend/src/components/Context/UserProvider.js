import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import UserContext from './UserContext';
import swal from 'sweetalert';
import CryptoJS from 'crypto-js';
import Instance from '../../api/apiInstance';


function UserProvider(props) {
  const [userDetails, setUserDetails] = useState({id:'', client_name:'', username:'', email:'', company_logo:'', role:''})
  const [unAuth, setUnAuth] = useState(false)
  const navigate = useNavigate()


  useEffect(() => {
    if (Cookies.get('ssid') !== undefined ) {
      const api = Instance()
      api.get('/api/checkuser')
        .then(res => { 
          // console.log(res.data)   
          const decrypted = JSON.parse(CryptoJS.AES.decrypt(res.data,process.env.REACT_APP_DATA_ENCRYPTION_SECRETE).toString(CryptoJS.enc.Utf8))      
          setUserDetails(decrypted)
        })
        .catch(err => {

          if (err.response.data === "Unauthorized") {
            // console.log('hey', err)
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
          // console.log(err)
        })
    }

  }, [])
  // console.log('context called')

  if (unAuth) {
    setUnAuth(false)
    // console.log('coming')

    return navigate('/login', { replace: true })
  }


  const handleUserDetails = (data) => {
    //console.log(data)
    setUserDetails(data)
  }

  return (
    <UserContext.Provider value={{ userDetails, handleUserDetails }}>

      {props.children}
      
    </UserContext.Provider>

  )
}

export { UserProvider };


