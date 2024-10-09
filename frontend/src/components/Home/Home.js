import React from 'react'
import Navbar from '../NavBar/Navbar'
import { Box } from '@mui/material'
import Cookies from 'js-cookie'
import { Navigate } from 'react-router-dom';

function Home() {
    if (Cookies.get('ssid') === undefined) {
        return <Navigate to="/login" replace={true} />;
    }
    return (
        <>
            <Box sx={{ width: '100%', height: '100vh', backgroundImage: 'url(https://wallpapercave.com/wp/wp3950068.jpg)', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}>
                <Navbar />
            </Box>
        </>
    )
}

export default Home