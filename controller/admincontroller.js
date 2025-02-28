//updated today
const bcrypt = require('bcrypt');
const users = require("../model/userModel");
const walletModel = require('../model/wallet');
const user_request = require("../model/userRequestForMoney");
const Transaction = require('../model/transactionModel');
const jwt = require("jsonwebtoken");
const secretKey = "secretkey";
module.exports = {

    login: async (req, res) => {
        try {
            const { email, password } = req.body

            if (!email || !password) {
                return res.json({responseCode:400,responseMessage: "Email and Password are required" })
            }
            const foundUser = await users.findOne({ $and: [{ email: email }, { userType: "ADMIN" }] })
          
            if (!foundUser) {
                return res.json({responseCode:401,responseMessage: "User not found" })
            }

            if (foundUser.userType !== "ADMIN") {
                return res.json({responseCode:404,responseMessage: "Unauthorized Access" })
            }

            const isCorrectPassword = await bcrypt.compare(password, foundUser.pass)

            if (!isCorrectPassword) {
                return res.json({responseCode:401,responseMessage: "password not matched" })
            }
            console.log("id of founded user",foundUser._id)
            const data = {
                id: foundUser.id,
                userType:foundUser.userType
              };
              console.log("login successfully user", foundUser);
    
              jwt.sign({ data }, secretKey, { expiresIn: "300s" }, (err, token) => {
                return res.json({
                  responseCode: 200,
                  responseMessage: "Successfully login",
                  token: token,
                  _id: foundUser.id,
                });
              });
        }
        catch (error) {
            console.error(error)
            return res.json({responseCode:500,responseMessage: "Internal Server Error" })
        }
    },


    getAllUser: async (req, res) => {
        // return res.json("ehelloekek");
        try {
            if (!req.user || !req.user.data.userType == "ADMIN") {
                return res.status(403).json({ message: 'Unauthorized' });
            }

            const allUsers = await users.find({ $and: [{ userType: "USER" }, { statusCode: "ACTIVE" }] })

            return res.json({responseCode:201,responseMessage: "All Users are fetched successfully", allUsers })
        }
        catch (error) {
            console.error(error)
            res.json({responseCode:500,responseMessage: "Error in fetching Users" })
        }
    },

    changeUserStatus: async (req, res) => {
        try {
            const { id } = req.query;
            console.log(req.user.data.userType)
            if (!req.user || req.user.data.userType!== "ADMIN") {
                return res.json({responseCode:403,responseMessage: 'Unauthorized, only admin are allowed to update or change the user status' });
            }

            if (!req.body.hasOwnProperty('statusCode')) {
                return res.json({responseCode:400,responseMessage: 'status not found' });
            }

            const newStatus = req.body.statusCode.toUpperCase();
            if (!['ACTIVE', 'BLOCK'].includes(newStatus)) {
                return res.json({responseCode:400,responseMessage: 'Invalid status, must be ACTIVE or BLOCK only' });
            }

            const foundUser = await users.findById({ _id: id });

            if (!foundUser) {
                return res.json({responseCode:404,responseMessage: 'User not found' });
            }

            if (foundUser.status === newStatus) {
                return res.json({responseCode:400,responseMessage: 'User already has the requested status' });
            }

            foundUser.statusCode = newStatus;
            await foundUser.save();
            return res.json({responseCode:200,responseMessage: `User status updated to ${newStatus}` });
        } catch (error) {
            console.error(error);
            return res.json({responseCode:500,responseMessage: 'Internal Server Error' });
        }
    },

    getUserById: async (req, res) => {
        const { id } = req.query
        try {

            if (!req.user || req.user.data.userType !== "ADMIN") {
                return res.json({responseCode:403,responseMessage: 'Unauthorized' });
            }

            const user = await users.findOne({ _id: id, statusCode: "ACTIVE" })
            if (!user) {
                return res.json({responseCode:404,responseMessage: "not found" })
            }
            return res.json({responseCode:200,responseMessage: "User data fetched successfully", user })
        }
        catch (error) {
            return res.json({responseCode:500,responseMessage: "Internal Server Error" })
        }
    },

    createUser: async (req, res) => {
        const { firstName, lastName, email, password, phoneNo, isVerified, status, userType } = req.body

        try {

            if (!req.user || req.user.data.userType !== "ADMIN") {
                return res.json({responseCode:403,responseMessage: 'Unauthorized' });
            }

            if (!firstName || !lastName || !email || !password) {
                return res.json({responseCode:400,responseMessage: "Please fill the required fields" })
            }

            const existingUser = await users.findOne({ $and: [{ email: email }, { statusCode: "ACTIVE" }] })

            if (existingUser) {
                return res.sjson({responseCode:400,responseMessage: 'Email already exists' });
            }

            const newUser = new users({
                firstName: firstName,
                lastName: lastName,
                email: email,
                countryCode:"+91",
                mobile: phoneNo,
                pass: password,
                statusCode:status,
                userType: userType,
                otpVarify:isVerified,
            })
            if (newUser.userType == "ADMIN") {
                return res.json({responseCode:403,responseMessage: "You are not authorized to create users with the ADMIN role" })
            }
            const savedUser = await newUser.save();
            return res.json({responseCode:200,responseMessage: "User created Successfully", savedUser })
        }
        catch (error) {
            console.error(error);
            res.json({responseCode:500,responseMessage: 'Internal Server Error' });
        }
    },

    getAdmin: async (req, res) => {

        try {
            if (!req.user || req.user.data.userType !== "ADMIN") {
                return res.json({responseCode:403,responseMessage: 'Unauthorized, only admin are allowed to update or change the user status' });
            }

            const admin = await users.find({ $and: [{ userType: "ADMIN" }, { statusCode: "ACTIVE" }] })
            return res.json({responseCode:200,responseMessage: "Admin fetched successfully", admin })
        }
        catch (err) {
            console.error(err)
            return res.json({responseCode:500,responseMessage: "Internal Server Error" })
        }
    },
    //Admin can see the user request for adding and withdrawing money ........ from given below two controller 
    watchAddRequest: async (req, res) => {
        console.log("Watch Add Request hit successfully============================>");
        try {
            const transactions = await user_request.find({status:"pending",transaction_id:{$ne:null},transactionType:"add"});
            console.log("your request for see number of pending request",transactions);
            res.status(200).json({ transactions });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching add requests', error });
        }
    },
    watchWithdrawRequest: async (req, res) => {
        console.log("Watch Add Request hit successfully============================>");
        try {
            const transactions = await user_request.find({ status: 'pending', transaction_id: null ,transactionType:"withdraw"});
            res.status(200).json({ transactions });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching add requests', error });
        }
    },
    changeWithdrawStatus: async (req, res) => {
        console.log("status-withdraw-change hit successfully============================>");
        try {
                  const userid = req.body.id;
                  console.log("userid will",userid);
                  // Change the status of the specific transaction in user_requests
                  const changeStatus = await user_request.updateOne(
                    { userId: userid, status: "pending",transactionType:"withdraw",amount:req.body.amount }, // Ensure only pending requests are updated
                    { $set: { status: "approved" } }
                  );
                  if(changeStatus){
                    return res.status(200).json({message:`successfully updated id ${userid} `});
                  }
                  return res.status(401).json({message:`something is bad`});
        } catch (error) {
           return res.status(500).json({ message: 'Error fetching add requests', error });
        }
    },
    Dashboard: async (req, res) => {
        console.log('Dashboard hit successfully')
        try {
            
            const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
  
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
  
      // Aggregation to calculate total credited amount & total transactions
      const totalCreditResult = await Transaction.aggregate([
        {
          $match: {
            transaction_type: "credit",
            transaction_date: { $gte: startOfDay, $lte: endOfDay },
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
            totalTransactions: { $count: {} },
          },
        },
      ]);
      console.log(totalCreditResult);
      const totalCredit =totalCreditResult[0].totalAmount;
      

       // Get first day of the current month
       const startOfMonth = new Date(startOfDay.getFullYear(), startOfDay.getMonth(), 1);

       // Aggregate total credit for today
            // Aggregate total withdrawal for today
            const totalWithdrawResult = await user_request.aggregate([
                { $match: { transactionType: "withdraw", status: "approved", createdAt: { $gte: startOfDay } } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]);
            const totalWithdraw = totalWithdrawResult.length ? totalWithdrawResult[0].total : 0;

            
            
            res.json({
                responseCode: 200,
                responseMessage: "Dashboard data fetched successfully",
                totalCredit,
                totalWithdraw,
              
            });
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            res.status(500).json({ responseCode: 500, responseMessage: "Internal Server Error" });
        }
    }
      , add: async (req, res) => {
        console.log("add balance API hit =============================================>", req.body);
        
        try {
          const userid = req.body.id;
          const user = await walletModel.findOne({ user_id: userid });
          
          if (!user) {
            return res.json({ responseCode: 400, responseMessage: "User not found" });
          }
    
          // Update wallet balance
          const update = await walletModel.findByIdAndUpdate(
            { _id: user._id },
            { $set: { wallet: Number(user.wallet) + Number(req.body.balance) } },
            { new: true }
          );
    
       
    
          console.log("Updated User Wallet:", update);
    
          return res.json({
            responseCode: 200,
            responseMessage: "Successfully added balance",
            OldBalance: user.wallet,
            UpdatedBalance: update.wallet,
          });
    
        } catch (error) {
          console.error("Error in add balance API:", error);
          return res.json({
            responseCode: 500,
            responseMessage: "Internal Server Error",
          });
        }
      }
    ,
    
      withdrawBalance: async (req, res) => {
        console.log("hello from withdraw money",req.body);
        try {
          const userid = req.body.id;
          const amountToWithdraw = Number(req.body.balance);
    
          if (!userid || !amountToWithdraw) {
            return res.json({
              responseCode: 400,
              responseMessage: "User ID and withdrawal amount are required",
            });
          }
    
          const user = await walletModel.findOne({ user_id: userid });
          console.log("your user details are========================================>",user);
          if (!user) {
            return res.json({ responseCode: 400, responseMessage: "User not found" });
          }
    
          if (user.wallet < amountToWithdraw) {
            return res.json({
              responseCode: 400,
              responseMessage: "Insufficient balance",
            });
          }
    
          const update = await walletModel.findByIdAndUpdate(
            { _id: user._id },
            { $set: { wallet: Number(user.wallet) - amountToWithdraw } },
            { new: true }
          );
    
         
          return res.json({
            responseCode: 200,
            responseMessage: "Successfully withdrew balance",
            OldBalance: user.wallet,
            UpdatedBalance: update.wallet,
          });
        } catch (error) {
          return res.json({
            responseCode: 500,
            responseMessage: "Internal Server Error",
          });
        }
      },
}
// module.exports=adminController;




