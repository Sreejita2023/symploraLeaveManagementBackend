const express = require('express')
const app = express()
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config()

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://symplora-leave-management-frontend.vercel.app",
    ], // allowed origins
    methods: ["GET", "POST", "PUT", "DELETE"], // allowed HTTP methods
    credentials: true, // allow cookies/auth headers
  })
);

app.use(express.json())
app.use(cookieParser())

const authRouter=require("./routes/auth")
const managerRouter = require("./routes/manager");
const leaveRouter = require("./routes/leave");
const employeeRouter=require("./routes/employee")

app.use("/", authRouter)
app.use("/", managerRouter);
app.use("/", leaveRouter);
app.use("/", employeeRouter);


const connectDb = require("./config/database");

const PORT = process.env.PORT || 3000;
connectDb().then(() => {
    console.log("Database is connected")
    app.listen(process.env.PORT, () => {
        console.log("Server is conneceted")
    })

})
    .catch((error) => {
    console.log("Database is not connected")
})