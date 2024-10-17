import axios from "axios"
import Cookies from 'js-cookie'

const Instance = () =>{
    //console.log(Cookies.get('ssid'))
    return axios.create({
        withCredentials: true,
        baseURL: process.env.REACT_APP_BACKEND_SERVER,
        headers: {
            'Authorization':`Bearer ${Cookies.get('ssid')}`
          },
     })

}


 export default Instance

