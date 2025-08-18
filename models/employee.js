const mongoose=require("mongoose")
const validator = require("validator")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");
const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Employee name is required"],
    trim: true,
    validate(value) {
      if (!validator.isAlpha(value.replace(/\s/g, ""), "en-US")) {
        throw new Error("Name must contain only alphabets");
      }
    },
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Invalid email format");
      }
    },
  },
  password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Password must be at least 8 characters");
        }
      },
    },
  department: {
    type: String,
    enum: ["Engineering", "HR", "Sales"],
    required: [true, "Department is required"],
    validate(value) {
      if (!["Engineering", "HR", "Sales"].includes(value)) {
        throw new Error("Gender data is not valid");
      }
    },
  },
  noOfLeaves: {
    type: Number,
    default:20,
    validate(value) {
      if (!Number.isInteger(value) || value < 0) {
        throw new Error("Number of leaves must be a non-negative integer");
      }
    },
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Manager",
    required: [true, "Manager reference is required"],
  },
});

employeeSchema.methods.getJWT = async function () {
  const employee = this;
  const token = await jwt.sign({ _id: employee._id }, process.env.JWT_SECRET, {
    expiresIn:"7d"
  })
  return token;
}

employeeSchema.methods.validatePassword = async function (inputPassword) {
  const employee = this;
  const password = employee.password
  const isPasswordValid = await bcrypt.compare(inputPassword, password)
  return isPasswordValid;
}

const employeeModel = mongoose.model("Employee", employeeSchema)

module.exports=employeeModel