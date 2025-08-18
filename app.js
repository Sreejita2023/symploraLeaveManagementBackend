const express = require('express')
const app = express()
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config()

app.use(express.json())
app.use(cookieParser())

app.use(
  cors({
    origin: ["http://localhost:3000", "https://yourdomain.com"], // allowed origins
    methods: ["GET", "POST", "PUT", "DELETE"], // allowed HTTP methods
    credentials: true, // allow cookies/auth headers
  })
);

const authRouter=require("./routes/auth")
const managerRouter = require("./routes/manager");
const leaveRouter = require("./routes/leave");
const employeeRouter=require("./routes/employee")

app.use("/", authRouter)
app.use("/", managerRouter);
app.use("/", leaveRouter);
app.use("/", employeeRouter);


const connectDb = require("./config/database");


connectDb().then(() => {
    console.log("Database is connected")
    app.listen(process.env.PORT, () => {
        console.log("Server is conneceted")
    })

})
    .catch((error) => {
    console.log("Database is not connected")
})