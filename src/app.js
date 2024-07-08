import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}    
))

//cors configuration
app.use(express.json({limit:"16kB"}))
app.use(express.urlencoded({extended:true, limit:"16kb"}))
app.use(express.static("public"))
//now for coookie parser config
app.use(cookieParser())


// router import
import userRouter from './routes/user.router.js'


// router deceleraation
app.use("/api/v1/users", userRouter)

export { app }