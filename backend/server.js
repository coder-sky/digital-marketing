import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import cookieParser from 'cookie-parser'
import db from './config/mysqlconnection.js'
import {checkAuthentication} from './middleware/authUsers.js'
//routes
import authRoute from './routes/auth.js'
import clientFormRoute from './routes/clientform.js'
import campaignFormRoute from './routes/campaignform.js'
import reportFormRoute  from './routes/reportform.js'


const app = express()

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200
}))

app.use(cookieParser())
app.use(express.json({limit:'50mb'}))
app.use(express.static('public'));
app.use(express.urlencoded({limit:'50mb',extended:true}))

app.use(checkAuthentication)

app.use('/api/',authRoute)
app.use('/api/', clientFormRoute)
app.use('/api/', campaignFormRoute)
app.use('/api/', reportFormRoute)

const port = process.env.PORT || 8000
db.connect((err)=>{
    if (err){
        console.log(err)
    }
    else {
        console.log('db connected')
    }
})

app.listen(8000,()=>{
    console.log(`Backend running at ${port}`)
})