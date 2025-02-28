const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
// const uri="mongodb://localhost:27017/New_game";
const userSignup = new mongoose.Schema({
    mobile: {
        type: Number,
        required: true,
        unique: true,
    },  
    pass: {
        type: String,
        required: true,
    },
    statusCode:{
        type:String,
        enum:["ACTIVE","BLOCK","DELETE"],
        default:"ACTIVE"
    },
  
    otp:{
        type:Number
    },
    otpTime:{
        type:Number
    },
    otpVarify:{
        type:Boolean,
        enum:[true,false],
        default:false
    }
});
const usermodel = mongoose.model("user", userSignup);
module.exports = usermodel;
// async function createDefaultAdmin() {
//     try {
//         await mongoose.connect(uri);
//         console.log('Database connection successful');

//         const adminUser = await usermodel.findOne({ userType: "ADMIN" });

//         if (adminUser) {
//             console.log('Default admin already created');
//         } else {
//             const adminDefault = {
//                 firstName: "vikas",
//                 lastName: "agrahari",
//                 email: "hackmobile63@gmail.com",
//                 pass: bcrypt.hashSync("vikas",10),
//                 mobile: 7237890694,
//                 countryCode:"+91",
//                 userType: "ADMIN",
//                 otpVarify: true,
//                 statusCode: "ACTIVE",
//             };

//             const  Admin = new usermodel(adminDefault);
//             await  Admin.save();
//             console.log("Default admin created",  Admin);
//         }
//     } catch (error) {
//         console.error('Database connection error', error);
//     } 
// }

// createDefaultAdmin()