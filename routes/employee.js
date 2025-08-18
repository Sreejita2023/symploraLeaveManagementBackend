const express = require("express");
const employeeRouter = express.Router();
const Employee = require("../models/employee");
const Leave=require("../models/leave")
const { EmployeeAuth } = require("../middleware/auth");
employeeRouter.get("/profile", EmployeeAuth, async (req, res) => {
  try {
    const employeeId = req.employee._id;
    const employee = await Employee.findById(employeeId).populate(
      "managerId",
      "name email"
    );
    if (!employee) {
      return res.status(404).json({ message: "Employee not found!" });
    }
    res.json({ message: "Employee details shown sucessfully", data: employee });
  } catch (error) {
    console.log("error", error);
    res.status(400).send("error message", error.message);
  }
});

employeeRouter.get("/leave/request",EmployeeAuth, async (req, res) => {
    try {
        const employeeId = req.employee._id;
        const leave =await Leave.find({
          employeeId:employeeId,
          status: "applied",
        });
        res.json({message:"Requested leaves",data:leave})
        
    } catch (error) {
      console.log("error", error);
      res.status(400).send("error message", error.message);
    }

})

employeeRouter.get("/leave/review", EmployeeAuth, async (req, res) => {
  try {
    const employeeId = req.employee._id;
    const leave = await Leave.find({
      employeeId: employeeId,
      $or: [{ status: "approved" }, { status: "rejected" }],
    });
    res.json({ message: "Reviewed leaves", data: leave });
  } catch (error) {
    console.log("error", error);
    res.status(400).send("error message", error.message);
  }
});

module.exports = employeeRouter;
