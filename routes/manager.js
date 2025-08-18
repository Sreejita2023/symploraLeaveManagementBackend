const express = require("express");
const bcrypt = require("bcrypt");
const managerRouter = express();
const Employee=require("../models/employee")
const Manager = require('../models/manager')
const Leave=require("../models/leave")
const {ManagerAuth}=require("../middleware/auth")
managerRouter.post("/employeeAdd",ManagerAuth, async (req, res) => {
  try {
    const { email, name, password, department } = req.body;
    const manager = req.manager;
      const hashPassword =await bcrypt.hash(password, 10);
      const employee = new Employee({
          email,
          name,
          password: hashPassword,
          department,
          managerId:manager._id
      }) 
      const savedEmployee=await employee.save()
      const token = await savedEmployee.getJWT()
      manager.employees.push(savedEmployee._id)
      const savedManager=await manager.save()
      console.log("saved",savedManager.employees)
      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000),
      });
      res.json({message:"Employee added sucessfully",data:savedEmployee})
  } catch (error) {
    console.log("error", error);
    res.status(400).send("error message", error);
  }
});


managerRouter.get("/leave/request", ManagerAuth, async (req, res) => {
  try {
    const managerId = req.manager._id;
    const leave = await Leave.find({
      managerId,
      status: "applied",
    }).populate("employeeId", "name email noOfLeaves");
    res.json({ message: "Requested leaves", data: leave });
  } catch (error) {
    console.log("error", error);
    res.status(400).send("error message", error.message);
  }
});

managerRouter.get("/leave/review", ManagerAuth, async (req, res) => {
  try {
    const managerId = req.manager._id;
    const leave = await Leave.find({
      managerId,
      $or: [{ status: "approved" }, { status: "rejected" }],
    }).populate("employeeId", "name email noOfLeaves");
    res.json({ message: "Reviewed leaves", data: leave });
  } catch (error) {
    console.log("error", error);
    res.status(400).send("error message", error.message);
  }
});

managerRouter.get("/viewEmployee", ManagerAuth, async (req, res) => {
  try {
    const managerId = req.manager._id;
    const employees = await Manager.findById(managerId)
      .select("-password")
      .populate("employees", "name email noOfLeaves");
    res.json({ message: "Employees data", data: employees });
  } catch (error) {
    console.log("error", error);
    res.status(400).send("error message", error.message);
  }
});


module.exports = managerRouter;
