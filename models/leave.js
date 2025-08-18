const mongoose=require("mongoose")
const validator = require("validator");

const leaveSchema = new mongoose.Schema({
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Manager",
    required: [true, "Manager ID is required"],
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: [true, "Employee ID is required"],
  },
  startDate: {
    type: String,
    required: [true, "Start date is required"],
    validate(value) {
      if (
        !validator.isDate(value, { format: "YYYY-MM-DD", strictMode: true })
      ) {
        throw new Error("Start date must be in format YYYY-MM-DD");
      }
    },
  },
  endDate: {
    type: String,
    required: [true, "End date is required"],
    validate(value) {
      if (
        !validator.isDate(value, { format: "YYYY-MM-DD", strictMode: true })
      ) {
        throw new Error("End date must be in format YYYY-MM-DD");
      }
      // compare with startDate
      if (this.startDate && value <= this.startDate) {
        throw new Error("End date must be greater than start date");
      }
    },
  },
  status: {
    type: String,
    required: [true, "Status is required"],
    enum: ["applied", "approved", "rejected","deleted"],
  },
},{timestamps:true});

const leaveModel=mongoose.model("Leave",leaveSchema)
module.exports = leaveModel;