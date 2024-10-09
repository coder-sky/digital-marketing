import { Backdrop, CircularProgress } from '@mui/material'
import React from 'react'

function Loader(props) {
    const { loader } = props
    return (
        <>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loader}

            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </>
    )
}

export default Loader