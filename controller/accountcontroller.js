const Account = require("../model/accountModel");

module.exports = {
    accountDetails : async (req, res) => {
        console.log("Account Details API hit successfully...");
    
        try {
            const { userId } = req.body;
            console.log("user id is", userId);
            // Validate userId
            if (!userId) {
                return res.status(400).json({
                    statusCode: 400,
                    responseMessage: "User ID is required",
                });
            }
    
            // Fetch all accounts associated with the userId
            const accounts = await Account.find({ userId });
    
            if (!accounts.length) {
                return res.status(404).json({
                    statusCode: 404,
                    responseMessage: "No account details found",
                });
            }
    
            return res.json({
                statusCode: 200,
                responseMessage: "Successfully fetched account details",
                data: accounts, // Returning all accounts
            });
    
        } catch (error) {
            console.error("Error fetching account details:", error);
            return res.status(500).json({
                statusCode: 500,
                responseMessage: "Internal server error",
                error: error.message, // Send only the message for security reasons
            });
        }
    },
    

    addAccount: async (req, res) => {
        console.log("this is addAccount api hit successfully...........>");
        try {
            console.log(req.body);
            const { accountNumber, ifscCode, branch, accountHolderName } = req.body;
            const newAccount = new Account({
                userId: req.body.userId,
                accountNumber,
                ifscCode,
                branch,
                accountHolderName
            });
            await newAccount.save();
            return res.json({ statusCode: 200, responseMessage: "Successfully added account", data: newAccount });
        } catch (error) {
            return res.status(500).json({ statusCode: 500, responseMessage: "Internal server error", error });
        }
    },
    // ✅ Edit Account
        editAccount: async (req, res) => {
            console.log("edit Account api hit successfully");
            try {
                const { accountNumber, ifscCode, branch, accountHolderName } = req.body;
                const { accountId } = req.params; // Get accountId from URL params
                console.log("account id", accountId);
                if (!accountId) {
                    return res.status(400).json({ statusCode: 400, responseMessage: "Account ID is required" });
                }
    
                const updatedAccount = await Account.findOneAndUpdate(
                    { _id: accountId, userId: req.body.userId }, // Ensure only the logged-in user can edit
                    { accountNumber, ifscCode, branch, accountHolderName },
                    { new: true }
                );
    
                if (!updatedAccount) {
                    return res.status(404).json({ statusCode: 404, responseMessage: "Account not found" });
                }
    
                return res.json({ statusCode: 200, responseMessage: "Successfully updated account", data: updatedAccount });
    
            } catch (error) {
                return res.status(500).json({ statusCode: 500, responseMessage: "Internal server error", error: error.message });
            }
        },
    
        // ✅ Delete Account
        deleteAccount: async (req, res) => {
            console.log("deleteAccount Account api hit successfully");
            try {
                const { accountId } = req.params; // Get accountId from URL params
                
                if (!accountId) {
                    return res.status(400).json({ statusCode: 400, responseMessage: "Account ID is required" });
                }
                console.log("account id", accountId);
                const deletedAccount = await Account.findOneAndDelete({ _id: accountId });
    
                if (!deletedAccount) {
                    return res.status(404).json({ statusCode: 404, responseMessage: "Account not found" });
                }
    
                return res.json({ statusCode: 200, responseMessage: "Successfully deleted account" });
    
            } catch (error) {
                return res.status(500).json({ statusCode: 500, responseMessage: "Internal server error", error: error.message });
            }
        }
    
    
};
