const jwt=require("jsonwebtoken")
const Employee= require("../models/employee")
const Manager = require("../models/manager")

const EmployeeAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).send("Please login!")
        }
        const decodedObj = await jwt.verify(token, process.env.JWT_SECRET)
        const { _id } = decodedObj
        const employee = await Employee.findById(_id)
        req.employee = employee
        next()

    } catch (err) {
      res.status(400).send("ERROR: " + err.message);
    }
}

const ManagerAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).send("Please login!");
    }
    const decodedObj = await jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = decodedObj;
    const manager = await Manager.findById(_id);
    req.manager = manager;
    next();
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
};

module.exports={EmployeeAuth,ManagerAuth}