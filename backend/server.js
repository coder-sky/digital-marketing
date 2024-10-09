import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import 'dotenv/config'

import db from './config/mysqlconnection.js'
import {checkAuthentication} from './middleware/authUsers.js'
//routes
import authRoute from './routes/auth.js'
import clientFormRoute from './routes/clientform.js'
import campaignFormRoute from './routes/campaignform.js'
import reportFormRoute  from './routes/reportform.js'


const app = express()

app.use(cors())
app.use(express.json({limit:'50mb'}))
app.use(cookieParser())
app.use(express.static('public'));
app.use(express.urlencoded({limit:'50mb',extended:true}))

app.use(checkAuthentication)

app.use('/api/',authRoute)
app.use('/api/', clientFormRoute)
app.use('/api/', campaignFormRoute)
app.use('/api/', reportFormRoute)


db.connect((err)=>{
    if (err){
        console.log(err)
    }
    else {
        console.log('connected')
    }
})

app.listen(8000,()=>{
    console.log('Backend running at http://localhost:8000')
})