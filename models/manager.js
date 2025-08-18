const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt=require("jsonwebtoken")
const managerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Manager name is required"],
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
  employees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
  ],
});


managerSchema.methods.getJWT = async function () {
  const manager = this;
  const token =await jwt.sign({ _id: manager._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return token;
};

managerSchema.methods.validatePassword = async function (inputPassword) {
  const manager = this;
  const password = manager.password;
  const isPasswordValid = await bcrypt.compare(inputPassword, password);
  return isPasswordValid;
};

const managerModel = mongoose.model("Manager", managerSchema);

module.exports = managerModel;
