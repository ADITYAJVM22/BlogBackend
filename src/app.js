import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

const app=express()
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

import userRouter from "./route/user.routes.js"

app.use("/api/v1/user",userRouter)
// will redirect to http://localhost:8000/api/v1/user and will add as prefix and gives acces to further routes
export {app}