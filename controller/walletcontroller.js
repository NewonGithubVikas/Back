const walletModel = require('../model/wallet');
const Transaction = require('../model/transactionModel');
const user_request = require("../model/userRequestForMoney");
module.exports = {
  balance: async (req, res) => {
    try {
      console.log("hello from e wallet");
      const userid = req.body.id;
      const user = await walletModel.findOne({ user_id: userid });
      if (!user) {
        return res.json({ responseCode: 400, responseMessage: "User not found" });
      }
      return res.json({
        responseCode: 200,
        responseMessage: "Successfully fetched balance",
        Balance: user.wallet,
      });
    } catch (error) {
      return res.json({
        responseCode: 500,
        responseMessage: "Internal Server Error",
      });
    }
  },

  // add: async (req, res) => {
  //    console.log("add balance api hit=============================================>",req.body);
  //   try {
  //     const userid=req.body.id
  //     const user=await walletModel.findOne({user_id: userid})
  //     console.log("upadate variable value",user);
  //     if (!user) {
  //       return res.json({ responseCode: 400, responseMessage: "User not found" });
  //     }
  //     const update = await walletModel.findByIdAndUpdate(
  //       { _id: user._id },
  //       { $set: { wallet: Number(user.wallet) + Number(req.body.balance) } },
  //       { new: true }
  //     );
  //     //change the status of that transaction in userrequests, in which we are going to add balance.
  //     const changeStatus = await user_request.updateOne({userId:user._id},$set:{status:"approved"})
  //     console.log("upadate variable value",update);
  //     // Add transaction record
  //     const addTrans=await Transaction.create({
  //       user_id: userid,
  //       amount: req.body.balance,
  //       transaction_type: "credit",
  //       transaction_date: new Date(),
  //     });
  //     console.log(addTrans,"=======================================>");
  //     if(!addTrans){
  //       return res.json({
  //         responseCode: 500,
  //         responseMessage: "failed to  added balance history in Transaction list",
  //       })
  //     }
      
  //     return res.json({
  //       responseCode: 200,
  //       responseMessage: "Successfully added balance",
  //       OldBalance: user.wallet,
  //       UpdatedBalance: update.wallet,
  //     });
  //   } catch (error) {
  //     return res.json({
  //       responseCode: 500,
  //       responseMessage: "Internal Server Error",
  //     });
  //   }
  // },
  add: async (req, res) => {
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

      // Change the status of the specific transaction in user_requests
      const changeStatus = await user_request.updateOne(
        { userId: userid, status: "pending" }, // Ensure only pending requests are updated
        { $set: { status: "approved" } }
      );

      console.log("Updated User Wallet:", update);

      // Add transaction record
      const addTrans = await Transaction.create({
        user_id: userid,
        amount: req.body.balance,
        transaction_type: "credit",
        transaction_date: new Date(),
      });

      if (!addTrans) {
        return res.json({
          responseCode: 500,
          responseMessage: "Failed to add balance history in Transaction list",
        });
      }

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

      // Add transaction record
      await Transaction.create({
        user_id: userid,
        amount: amountToWithdraw,
        transaction_type: "withdraw",
        transaction_date: new Date(),
      });

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

  creditHistory: async (req, res) => {
    console.log("credit histroy api =====================================>",req.body);
    try {
      const user_id  = req.body.id;

      if (!user_id) {
        return res.json({
          responseCode: 400,
          responseMessage: "User ID is required",
        });
      }

      const withdrawTransactions = await Transaction.find({
        user_id,
        transaction_type: "credit",
      }).sort({ transaction_date: -1 }); // Sort by latest transaction
      console.log("fetch transaction history data",withdrawTransactions);
      if (withdrawTransactions.length === 0) {
        return res.json({
          responseCode: 404,
          responseMessage: "No credit transactions found",
        });
      }

      return res.json({
        responseCode: 200,
        responseMessage: "credit history fetched successfully",
        transactions: withdrawTransactions,
      });
    } catch (error) {
      return res.json({
        responseCode: 500,
        responseMessage: "Internal Server Error",
      });
    }
  },

  withdrawHistory: async (req, res) => {
    console.log("withdraw histroy api =====================================>",req.body);
    try {
      const user_id  = req.body.id;

      if (!user_id) {
        return res.json({
          responseCode: 400,
          responseMessage: "User ID is required",
        });
      }

      const withdrawTransactions = await Transaction.find({
        user_id,
        transaction_type: "withdraw",
      }).sort({ transaction_date: -1 }); // Sort by latest transaction
      console.log("fetch transaction history data",withdrawTransactions);
      if (withdrawTransactions.length === 0) {
        return res.json({
          responseCode: 404,
          responseMessage: "No withdraw transactions found",
        });
      }

      return res.json({
        responseCode: 200,
        responseMessage: "Withdraw history fetched successfully",
        transactions: withdrawTransactions,
      });
    } catch (error) {
      return res.json({
        responseCode: 500,
        responseMessage: "Internal Server Error",
      });
    }
  },
  totalCreditHistory:async (req, res) => {
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
  
      // Fetch individual transactions for today
      const transactions = await Transaction.find({
        transaction_type: "credit",
        transaction_date: { $gte: startOfDay, $lte: endOfDay },
      }).select("user_id amount transaction_date");
  
      // Extract totals from aggregation result
      const totalAmount = totalCreditResult.length > 0 ? totalCreditResult[0].totalAmount : 0;
      const totalTransactions = totalCreditResult.length > 0 ? totalCreditResult[0].totalTransactions : 0;
  
      res.json({
        responseCode: 200,
        totalCredit: totalAmount,
        totalTransactions,
        transactions, // List of today's transactions
      });
    } catch (error) {
      console.error("Error fetching total credit history:", error);
      res.status(500).json({ responseCode: 500, responseMessage: "Server error" });
    }
  },

  totalWithdrawHistory: async (req, res) => {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
  
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
  
      // Aggregation to calculate total credited amount & total transactions
      const totalCreditResult = await Transaction.aggregate([
        {
          $match: {
            transaction_type: "withdraw",
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
  
      // Fetch individual transactions for today
      const transactions = await Transaction.find({
        transaction_type: "withdraw",
        transaction_date: { $gte: startOfDay, $lte: endOfDay },
      }).select("user_id amount transaction_date");
  
      // Extract totals from aggregation result
      const totalAmount = totalCreditResult.length > 0 ? totalCreditResult[0].totalAmount : 0;
      const totalTransactions = totalCreditResult.length > 0 ? totalCreditResult[0].totalTransactions : 0;
  
      res.json({
        responseCode: 200,
        totalCredit: totalAmount,
        totalTransactions,
        transactions, // List of today's transactions
      });
    } catch (error) {
      console.error("Error fetching total credit history:", error);
      res.status(500).json({ responseCode: 500, responseMessage: "Server error" });
    }
  },
};
