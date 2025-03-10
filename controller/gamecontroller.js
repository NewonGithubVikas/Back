const userWallet = require("../model/wallet");
const gameModel = require("../model/gameModel");
const which_Game_is_running = require("../model/currentModel");
module.exports = {
    timer: async (req, res) => {
        try {
            // Fetch the game details with fixed_id = 1
            const game = await which_Game_is_running.findOne({ fixed_id: 1, game_Status: true }).sort({ created_At: -1 }).exec();

            // Calculate remaining time in seconds
            const remainingTime = Math.floor((game.end_At.getTime()-Date.now()) / 1000);

            console.log('Remaining time:', remainingTime);
            if ( (Date.now() < ((game.end_At.getTime())-5*1000))) {
                console.log(`Remaining time for ending this game is ${remainingTime}`);
                return res.json({ responseCode: 200, responseMessage: 'Successfull' ,remainTime:(remainingTime)});
            }
            return res.json({ responseCode: 200, responseMessage: 'Successful' ,wait:"wait new game will start soon"});
            
        } catch (error) {
            console.error('Error:', error);
            return res.status(500).json({ responseCode: 500, responseMessage: 'Internal Server Error' });
        }
    },
    current: async (req, res) => {
      
        try {
            const result = await gameModel.aggregate([
                {
                    $group: {
                        _id: null, // Group by null to aggregate over all documents
                        totalRedBet: { $sum: "$red_bet" },
                        totalGreenBet: { $sum: "$green_bet" },
                    },
                },
            ]);

            //random color will generate................... here.....
            // console.log(result[0].totalGreenBet);
            let winnerColor = ""
            if (result[0].totalGreenBet == result[0].totalRedBet) {
                const dependcolor = (Math.random() * 10)
                console.log("check 2")
                if (dependcolor <= 5) {
                    winnerColor = "red"
                } else {
                    winnerColor = "green"
                }


            } else if (result[0].totalGreenBet > result[0].totalRedBet) {
                console.log("check 3")
                winnerColor = "red";
            }
            else {
                console.log("check 4")
                winnerColor = "greeen";
            }
            try {
                const updateColor = await gameModel.updateMany({}, { $set: { winner_color: winnerColor } }, { new: true });
                console.log("check 5");
            } catch (error) {
                console.error("Error updating documents:", error);
            }
            console.log("check 6")
            return res.json({
                responseCode: 200,
                responseMessage: "successfull",
                totalAmount: result,


            });
        } catch (error) {
            return res.json({
                responseCode: 500,
                responseMessage: "Internal Server Error",
            });
        }
    },
    Numberbet: async (req, res) => {
        // Parameter required for using this API from the frontend as - user_id, user_number, and user_amount
        console.log("Value from frontend: ", req.body);
        try {
            // Ensure user_choice is in lowercase and user_amount is numeric
            req.body.user_amount = parseFloat(req.body.user_amount);
    
            // Validate user_number is between 1-9
            if (!req.body.user_number || req.body.user_number < 1 || req.body.user_number > 9) {
                return res.json({
                    responseCode: 400,
                    responseMessage: "Select a valid number between 1 and 9",
                });
            }
    
            const user = await userWallet.findOne({ user_id: req.body.user_id });
    
            if (!user) {
                return res.json({
                    responseCode: 200,
                    responseMessage: "User does not exist",
                });
            }
    
            if (req.body.user_amount < 1) {
                return res.json({
                    responseCode: 200,
                    responseMessage: "Amount should be greater than 0",
                });
            }
    
            // Check if the user's wallet balance is sufficient
            if (user.wallet < req.body.user_amount) {
                return res.json({
                    responseCode: 400,
                    responseMessage: "Insufficient balance in wallet",
                });
            }
    
            const current_Game_id = await which_Game_is_running
                .findOne({ game_Status: true })
                .sort({ created_At: -1 })
                .exec();
    
            if (!current_Game_id) {
                return res.json({
                    responseCode: 400,
                    responseMessage: "No active game found",
                });
            }
    
            req.body.game_id = current_Game_id._id;
            req.body.green_bet = 0;
            req.body.red_bet = 0;
            req.body.user_choice_number= req.body.user_number;
            console.log("Check 1====================>");
            const status = await gameModel.create(req.body);
    
            console.log("Check 2");
            if (!status) {
                return res.json({
                    responseCode: 400,
                    responseMessage: "Try another bet",
                });
            }
    
            // Deduct amount from user's wallet
            await userWallet.findByIdAndUpdate(
                { _id: user._id },
                { $set: { wallet: user.wallet - req.body.user_amount } }
            );
    
            return res.json({
                responseCode: 200,
                responseMessage: "Bet placed successfully",
                amount: req.body.user_amount,
                user_number: req.body.user_number,
            });
        } catch (error) {
            console.error("Error in bet API: ", error);
            return res.json({
                responseCode: 500,
                responseMessage: "Internal Server Error",
            });
        }
    }
    ,
    bet: async (req, res) => {
        // Parameter required for using this API from the frontend as - user_id, user_choice, and user_amount
        console.log("Value from frontend: ", req.body);
        try {
            // Ensure user_choice is in lowercase and user_amount is numeric
            req.body.user_choice = req.body.user_choice.toLowerCase();
            req.body.user_amount = parseFloat(req.body.user_amount);
    
            const user = await userWallet.findOne({ user_id: req.body.user_id });
    
            if (!user) {
                return res.json({
                    responseCode: 200,
                    responseMessage: "User does not exist",
                });
            }
    
            if (req.body.user_amount < 1) {
                return res.json({
                    responseCode: 200,
                    responseMessage: "Amount should be greater than 0",
                });
            }
    
            // Check if the user's wallet balance is sufficient
            if (user.wallet < req.body.user_amount) {
                return res.json({
                    responseCode: 400,
                    responseMessage: "Insufficient balance in wallet",
                });
            }
    
            if (req.body.user_choice === "red") {
                req.body.red_bet = req.body.user_amount;
                req.body.green_bet = 0;
            } else if (req.body.user_choice === "green") {
                req.body.green_bet = req.body.user_amount;
                req.body.red_bet = 0;
            }
    
            console.log(req.body.green_bet, "and", req.body.red_bet);
    
            const current_Game_id = await which_Game_is_running
                .findOne({ game_Status: true })
                .sort({ created_At: -1 })
                .exec();
    
            if (!current_Game_id) {
                return res.json({
                    responseCode: 400,
                    responseMessage: "No active game found",
                });
            }
    
            req.body.game_id = current_Game_id._id;
    
            console.log("Check 1====================>");
            const status = await gameModel.create(req.body);
    
            console.log("Check 2");
            if (!status) {
                return res.json({
                    responseCode: 400,
                    responseMessage: "Try another bet",
                });
            }
    
            // Deduct amount from user's wallet
            await userWallet.findByIdAndUpdate(
                { _id: user._id },
                { $set: { wallet: user.wallet - req.body.user_amount } }
            );
    
            return res.json({
                responseCode: 200,
                responseMessage: "Bet placed successfully",
                amount: req.body.user_amount,
                user_choice: req.body.user_choice,
            });
        } catch (error) {
            console.error("Error in bet API: ", error);
            return res.json({
                responseCode: 500,
                responseMessage: "Internal Server Error",
            });
        }
    },
    
    history: async (req, res) => {
        try {
            const result = await gameModel.aggregate([
                // Match completed games
                { $match: { game_Status: false } },
                // Group by game_id
                {
                    $group: {
                        _id: "$game_id",
                        totalAmount: { $sum: "$user_amount" },
                        winnerColor: { $first: "$winner_color" }, // Get winner color
                        winnerNumber: { $first: "$winner_number" }, // Get winner number
                        createdAt: { $first: "$created_At" } // Ensure sorting works correctly
                    },
                },
                // Project the results into a cleaner format
                {
                    $project: {
                        game_id: "$_id",
                        _id: 0,
                        totalAmount: 1,
                        winnerColor: 1,
                        winnerNumber: 1,
                        createdAt: 1, // Keep createdAt for sorting
                    },
                },
                // Sort by createdAt in descending order (latest games first)
                { $sort: { createdAt: -1 } }
            ]);
    
            if (!result || result.length === 0) {
                return res.json({
                    responseCode: 401,
                    responseMessage: "There is no betting history",
                });
            }
    
            return res.json({
                responseCode: 200,
                responseMessage: "Successfully fetched bet history",
                result: result,
            });
        } catch (error) {
            console.error("Error fetching history:", error);
            return res.json({
                responseCode: 500,
                responseMessage: "Internal Server Error",
            });
        }
    },
    
    
    };
