const usermodel = require("../model/userModel");
const user_request = require("../model/userRequestForMoney");
const domail = require("../Common/mail");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const otpgeneration = require("../Common/otpgeneration");
const secretKey = "secretkey";
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
const fs = require('fs');
const path = require('path');
dotenv.config();

const walletModel=require('../model/wallet');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = {
  SignIn: async (req, res) => {
    try {
      console.log("where is this code.......................",req.body.mobile);
      let oneuser = await usermodel.findOne({ mobile: req.body.mobile });
      console.log("login unsuccessfullll...",oneuser);
      if (!oneuser) {
         console.log("login fxxgdullll...");
        return res.json({
          responseCode: 404,
          responseMessage: "Data not exist",
        });
      }else {
        console.log("it is  runnning ...........................",oneuser.pass,req.body.password);
        const passwordMatch = bcrypt.compareSync(req.body.password, oneuser.pass);
        console.log("password match",passwordMatch);
        if (passwordMatch) {
          const data = {
            id: oneuser.id,
          };
          console.log("login successfully user", oneuser);

          jwt.sign({ data }, secretKey, { expiresIn: "1200s" }, (err, token) => {
            return res.json({
              responseCode: 200,
              responseMessage: "Successfully login",
              token: token,
              _id: oneuser.id,
            });
          });
        } else {
          return res.json({
            responseCode: 401,
            responseMessage: "Invalid email or password",
          });
        }
      }
    } catch (error) {
      return res.json({
        responseCode: 500,
        responseMessage: "Internal Server Error",
        responseResult: error,
      });
    }
  },
    SignUp: async (req, res) => {
    try {
      console.log("Incoming request body:", req.body);
  
      // Assign default email if not provided
      if (!req.body.email) {
        req.body.email = `user_${Date.now()}@example.com`;
        console.log("No email provided. Assigned default email:", req.body.email);
      }
  
      // Check if the email already exists (to avoid duplicate email errors)
      const existingEmail = await usermodel.findOne({ email: req.body.email });
      if (existingEmail) {
        return res.status(400).json({
          responseCode: 400,
          responseMessage: "Email already exists",
        });
      }
  
      // Check if mobile number is already registered
      const query = {
        $and: [{ mobile: req.body.mobile }, { statusCode: { $ne: "DELETE" } }],
      };
  
      const existingUser = await usermodel.findOne(query);
      if (existingUser) {
        console.log("User already exists with mobile:", req.body.mobile);
        return res.json({
          responseCode: 404,
          responseMessage: "Mobile number already exists",
        });
      }
  
      // Generate OTP and hash password
      req.body.otp = otpgeneration.otpgeneration();
      req.body.otpTime = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
  
      console.log("Generated OTP:", req.body.otp);
  
      // Ensure password is provided before hashing
      if (!req.body.pass) {
        console.error("Error: Password is missing in request body.");
        return res.status(400).json({
          responseCode: 400,
          responseMessage: "Password is required",
        });
      }
  
      req.body.pass = bcrypt.hashSync(req.body.pass, 10);
      console.log("Hashed password:", req.body.pass);
  
      console.log("Final req.body before saving:", req.body);
  
      // Create new user
      const saveUser = await usermodel.create(req.body).catch((err) => {
        console.error("Error saving user:", err);
        return null;
      });
  
      if (!saveUser) {
        return res.status(500).json({
          responseCode: 500,
          responseMessage: "User registration failed",
        });
      }
  
      console.log("User saved successfully:", saveUser);
  
      // Create wallet for the user
      const walletBalance = await walletModel
        .create({ user_id: saveUser._id })
        .catch((err) => {
          console.error("Wallet creation error:", err);
          return null;
        });
  
      if (!walletBalance) {
        console.log("Warning: Wallet creation failed for user:", saveUser._id);
      } else {
        console.log("Wallet created successfully:", walletBalance);
      }
  
      return res.status(200).json({
        responseCode: 200,
        responseMessage: "Signup successful",
        responseResult: saveUser,
        wallet: walletBalance,
      });
    } catch (error) {
      console.error("Unexpected error in signup:", error);
      return res.status(500).json({
        responseCode: 500,
        responseMessage: "Something went wrong",
        responseResult: error.message,
      });
    }
  }
,
  
  otpVarify: async (req, res) => {
    console.log("hellow worl");
    try {
      const userfind = await usermodel.findOne({
         mobile: req.body.mobile 
      });
      if (!userfind) {
        return res.json({
          responseCode: 404,
          responseMessage: "User does not Exist!",
        });
      } else {
        const curTime = Date.now();
        if (curTime > userfind.otpTime) {
          return res.json({
            responseCode: 400,
            responseMessage: "OTP Expired",
          });
          //here we give New otp generation resend functionality
        } else {
          // console.log((Number(req.body.otp))===(Number(userfind.otp)));
          if (Number(req.body.otp) == Number(userfind.otp)) {
            //then do otpVarify status True in the database
            const update = await usermodel.findByIdAndUpdate(
              { _id: userfind._id },
              { $set: { otpVarify: true } },
              { new: true }
            );
            if (update) {
              return res.json({
                responseCode: 200,
                responseMessage: "OTP successfully verify.",
              });
            }
            // res.send('hello from matched');
          } else {
            //Otherwise provided otp not matched to generated otp
            //And give Resend option to resend otp at the gmail
            return res.json({
              responseCode: 400,
              responseMessage: "OTP does not matched",
            });
          }
        }
      }
    } catch {
      return res.json({
        responseCode: 500,
        responseMessage: "Internal Server Error!",
      });
    }
  },

  resendOtp: async (req, res) => {
    try {
      const userfind = await usermodel.findOne({
        $or: [{ email: req.body.email }, { mobile: req.body.mobile }],
      });
      if (!userfind) {
        return res.json({
          responseCode: 404,
          responseMessage: "User does not Exist!",
        });
      } else {
        const otp = otpgeneration.otpgeneration();
        const info = domail(
          req.body.email,
          "Otp verification",
          `Your otp is ${otp}`
        );
        const otpTime = Date.now() + 10 * 50 * 1000;
        const update = await usermodel.findByIdAndUpdate(
          { _id: userfind._id },
          { $set: { otp: otp, otpTime: otpTime } }
        );
        return res.json({
          responseCode: 200,
          responseMessage: "Again Otp send successfully",
          responseResult: update,
        });
      }
    } catch {
      return res.json({
        responseCode: 500,
        responseMessage: "Internal Server Error!",
      });
    }
  },

  deleteUser: async (req, res) => {
    //This module related to soft deletetion of user..................................................................
    try {
      let deleteuser = await usermodel.updateOne(
        { _id: req.query._id },
        { statusCode: "DELETE" }
      );
      if (deleteuser) {
        console.log("deletion successfully....");
        return res.json({ responseCode: 200, responseMessage: "successfulll" });
      } else {
        console.log("deletion unsuccessfullll");
        return res.json({
          responseCode: 500,
          responseMessage: "there is something error.",
        });
      }
    } catch (error) {
      return res.json({
        responseCode: 500,
        responseMessage: "Internal Server Error",
      });
    }
  },

  updateUser: async (req, res) => {
    const newdata = { firstName: req.query.name };
    const filter = { mobile: req.query.mobile };
    let search = await usermodel.findOneAndUpdate(filter, newdata, {
      new: true,
    });
    if (search) {
      return res.json({
        responseCode: 200,
        responseMessage: `user ${search.firstName} data updated successfully`,
      });
    } else {
      return res.json({
        responseCode: 500,
        responseMessage: "there is some error in updating data of user data",
      });
    }
  },

 

updatePassword: async (req, res) => {
  console.log("update passowrd hit successfullly................>")
  try {
    const { oldPassword, newPassword,userId} = req.body;

    // Find user by email or mobile
    const user = await usermodel.findOne({_id:userId});

    if (!user) {
      return res.json({
        responseCode: 404,
        responseMessage: "User not found",
      });
    }

    // Check if old password matches stored password
    const isMatch = await bcrypt.compare(oldPassword, user.pass);
    if (!isMatch) {
      return res.json({
        responseCode: 400,
        responseMessage: "Old password is incorrect",
      });
    }

      
    // Hash the new password before storing
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password in the database
    const update = await usermodel.updateOne(
      { _id: user._id },
      { $set: { pass: hashedPassword } }
    );

    if (!update.modifiedCount) {
      return res.json({
        responseCode: 500,
        responseMessage: "Failed to update password",
      });
    }

    return res.json({
      responseCode: 200,
      responseMessage: "Password updated successfully",
    });

  } catch (error) {
    console.error(error);
    return res.json({
      responseCode: 500,
      responseMessage: "Internal Server Error",
    });
  }
},

  Profile: async (req, res) => {
    try {
      const profile = await usermodel.findOne({ _id: req.user.data.id });
      return res.json({
        responseCode: 200,
        responseMessage: "successfully fetched",
        responseResult: profile,
      });
    } catch {
      return res.json({
        responseCode: 500,
        responseMessage: "Internal Server Error",
      });
    }
  },

  Forget: async (req, res) => {
    try {
      const email = req.body.email;
      const search = await usermodel.findOne({ email: email });
      console.log("it is working");
      if (!search) {
        return res.json({
          responseCode: 400,
          responseMessage: "Email does not Exist!",
        });
      } else {
        const link =
          "http://localhost:4500/user/resetPassword?id=" + search._id;
        const info = domail(
          email,
          "Reset Your Password",
          `use this link ${link}`
        );
        return res.json({
          responseCode: 200,
          responseMessage: "Link Sent successfully",
          userid: search._id,
        });
      }
    } catch {
      return res.json({
        responseCode: 500,
        responseMessage: "Internal Server Error",
      });
    }
  },
  Reset: async (req, res) => {
    try {
      const id = req.body.id;
      const search = await usermodel.findById({ _id: id });
      if (!search) {
        return res.json({
          responseCode: 400,
          responseMessage: "Id is not valid!",
        });
      } else {
        if (req.body.pass === req.body.cpass) {
          req.body.pass = bcrypt.hashSync(req.body.pass, 10);
          const update = await usermodel.updateOne(
            { _id: id },
            { $set: { pass: req.body.pass } }
          );
          if (!update) {
            return res.json({
              responseCode: 400,
              responseMessage: "Password Not updated",
            });
          } else {
            return res.json({
              responseCode: 200,
              responseMessage: "Password updated successfully",
            });
          }
        }
      }
    } catch {
      return res.json({
        responseCode: 500,
        responseMessage: "Internal Server Error",
      });
    }
  },
  //all userRequestForMoney model related controller description will write below
  addRequest: async (req, res) => {
    console.log("add Request hit successfully .............................>")
    try {
        const { userId, amount, transaction_id } = req.body;
        const newTransaction = new user_request({
            userId,
            amount,
            transaction_id,
            transactionType: 'add',
        });
        await newTransaction.save();
        res.status(201).json({ message: 'Add request submitted successfully', transaction: newTransaction });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting add request', error });
    }
},

withdrawRequest: async (req, res) => {
    try {
        const { userId, amount } = req.body;
        const newTransaction = new user_request({
            userId,
            amount,
            transactionType: 'withdraw',
        });
        await newTransaction.save();
        res.status(201).json({ message: 'Withdraw request submitted successfully', transaction: newTransaction });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting withdraw request', error });
    }
},

};
