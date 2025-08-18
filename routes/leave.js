const express = require("express");

const leaveRouter = express.Router();

const { EmployeeAuth, ManagerAuth } = require("../middleware/auth");

const Employee = require("../models/employee");
const Manager = require("../models/manager");
const Leave = require("../models/leave");

leaveRouter.post("/request/send/:status", EmployeeAuth, async (req, res) => {
  try {
    const managerId = req.employee.managerId;
    const employeeId = req.employee._id;
    const { startDate, endDate } = req.body;
    const { status } = req.params;

    const allowedStatus = ["applied", "deleted"];
    if (!allowedStatus.includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid status type: " + status });
    }

    const start = new Date(startDate); // from req.body
    const end = new Date(endDate);
    const now = new Date();

    if (start < now) {
      throw new Error("Start date must be today or in the future");
    }

    if (end < start) {
      throw new Error("End date must be after or equal to start date");
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found!" });
    }

    const manager = await Manager.findById(managerId);
    if (!manager) {
      return res.status(404).json({ message: "Manager not found!" });
    }
    const existingLeave = await Leave.findOne({
      $or: [
        { managerId, employeeId, status: "applied" },
        {
          managerId,
          employeeId,
          status: "accepted",
          $or: [
            {
              // Existing leave starts before or on new endDate
              startDate: { $lte: endDate },
              // and ends after or on new startDate
              endDate: { $gte: startDate },
            },
          ],
        },
      ],
    });

    if (existingLeave) {
      return res.status(400).send({ message: "Already leave requested" });
    }
    const leave = new Leave({
      managerId,
      employeeId,
      startDate,
      endDate,
      status,
    });

    const savedLeave = await leave.save();

    res.json({
      message: employee.name + " is " + status + " to " + manager.name,
      data: savedLeave,
    });
  } catch (error) {
    res.status(400).send("ERROR: " + error);
  }
});

leaveRouter.post("/request/review/:status", ManagerAuth, async (req, res) => {
  try {
    const manager = req.manager;
    const { leaveId } = req.body;
    const { status } = req.params;

    const allowedStatus = ["approved", "rejected"];
    if (!allowedStatus.includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid status type: " + status });
    }

    const leave = await Leave.findById(leaveId);

    const employee = await Employee.findById(leave.employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found!" });
    }

    if (!manager) {
      return res.status(404).json({ message: "Manager not found!" });
    }

    const start = new Date(leave.startDate); // e.g. "2025-08-18"
    const end = new Date(leave.endDate); // e.g. "2025-08-20"

    const diffTime = end - start; // difference in ms
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    console.log("days", days);

    if (employee.noOfLeaves - days < 0) {
      return res.status(400).send("Leaves not available");
    }

    leave.status = status;

    const savedLeave = await leave.save();
    if (status === "approved") {
      employee.noOfLeaves -= days;
      await employee.save();
    }

    res.json({
      message: employee.name + " is " + status + " to " + manager.name,
      data: savedLeave,
    });
  } catch (error) {
    res.status(400).send("ERROR: " + error);
  }
});

leaveRouter.delete("/delete/:leaveId", EmployeeAuth, async (req, res) => {
  try {
    const deletedLeave = await Leave.findByIdAndDelete(req.params.leaveId);
    if (!deletedLeave) {
      return res.status(404).json({ message: "Leave not found" });
    }
    res.json({ message: "Leave deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = leaveRouter;
