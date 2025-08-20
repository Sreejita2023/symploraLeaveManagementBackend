const express = require('express')
const Employee=require("../models/employee")
const Manager=require("../models/manager")
const authRouter = express.Router()
const bcrypt = require("bcrypt");
authRouter.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashPassword = await  bcrypt.hash(password, 10)
        console.log(hashPassword)
        const manager = new Manager({
            name,
            email,
            password:hashPassword
        })
        console.log("manager",manager)
        const savedManager = await manager.save()
        console.log("savedManager", savedManager);
        const token = await savedManager.getJWT()
        res.cookie("token", token, {
          httpOnly: true, 
          secure: true, 
          sameSite: "None",
          expires: new Date(Date.now() + 8 * 3600000),
        });
        res.json({message:"Manager added successfully",data:savedManager})
    }
    catch (error) {
        console.log("error",error)
        res.status(400).send("error message",error)
  }
})

authRouter.post("/login/:role", async (req, res) => {
    try {
        const { email, password } = req.body;
        const { role } = req.params;
        const user= role==="manager"?await Manager.findOne({email:email}): await Employee.findOne({email:email})
        if (!user) {
            throw new Error("Invalid Credentials")
        }
        const isPasswordValid = await user.validatePassword(password);
        if (!isPasswordValid) {
             throw new Error("Invalid Credentials");
        }
        const token = await user.getJWT()
        res.cookie("token", token, {
          httpOnly: true, 
          secure: true, 
          sameSite: "None",
          expires: new Date(Date.now() + 8 * 3600000),
        });
        res.json({message:"Login successfully",data:user})
    } catch (error) {
      res.status(400).send("error message", error.message);
    }
})

authRouter.post("/logout", async (req, res) => {
    res.cookie("token", null, {
      httpOnly: true, 
      secure: true, 
      sameSite: "None",
      expires: new Date(Date.now() + 8 * 3600000),
    });
     res.send("Logout Successful!!");
})

module.exports=authRouter