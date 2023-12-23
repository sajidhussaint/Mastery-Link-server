import express from 'express';
import dotenv from "dotenv";
import dbConnection from "./config/db.js";
const app = express()
const PORT = process.env.PORT || 3000
import cors from 'cors'
import studentRoute from "./src/routes/StudentRouter.js"
import adminRoute from"./src/routes/AdminRouter.js"
import instructorRoute from"./src/routes/InstructorRouter.js"

dotenv.config();
dbConnection();

app.use(cors({
  origin:"http://localhost:5173",
  methods:['GET','POST','PUT','PATCH'],
  credentials:true
}))

app.use(express.json({limit:"50mb"}))
app.use(express.urlencoded({limit:'50mb',extended:true}))


app.use("/",studentRoute)
app.use("/admin",adminRoute)
app.use("/instructor",instructorRoute)





app.listen(PORT,()=>{
  console.log(`server running on port http://localhost:${PORT}`);
})






