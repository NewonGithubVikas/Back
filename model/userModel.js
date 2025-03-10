const mongoose = require("mongoose");

const userSignup = new mongoose.Schema({
    firstName: {
        type: String,
        default:""
    },
    lastName: {
        type: String,
        default:""
    },
    email: {
        type: String,
        unique: true,
    },
    mobile: { 
        type: Number,
        required: true,
        unique: true,
    },  
    pass: {
        type: String,
        required: true,
    },
   
    userType: {
        type: String,
        enum: ["ADMIN", "USER"],
        default: "USER",
    },
    statusCode: {
        type: String,
        enum: ["ACTIVE", "BLOCK", "DELETE"],
        default: "ACTIVE",
    },
    otp: {
        type: Number,
    },
    otpTime: {
        type: Number,
    },
    otpVarify: {
        type: Boolean,
        enum: [true, false],
        default: false,
    },
});

// Create User Model
const usermodel = mongoose.model("user", userSignup);
module.exports = usermodel;
