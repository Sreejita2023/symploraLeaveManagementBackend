const express = require('express')
const app= express()
require("dotenv").config()

const connectDb = require("./config/database")

connectDb().then(() => {
    console.log("Database is connected")
    app.listen(process.env.PORT, () => {
        console.log("Server is conneceted")
    })

})
    .catch((error) => {
    console.log("Database is not connected")
})