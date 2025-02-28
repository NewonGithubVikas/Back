const mongoose = require('mongoose')
const cron = require("node-cron");
// const usermodel = require('./userModel');
const gameModel = require('./gameModel');
const wallet = require('./wallet');
const currentGame = mongoose.Schema({
    fixed_id: {
        type: Number,
        default: 1
    },
    game_name: {
        type: String,
        default: "RedGreen"
    },
    created_At: {
        type: Date,
        default: Date.now()
    },
    end_At: {
        type: Date,
        default: () => new Date(Date.now() + 60 * 1000)
    },
    game_Status: {
        type: Boolean,
        default: true
    }
})
const which_Game_is_running = mongoose.model("currentGame", currentGame);
module.exports = which_Game_is_running;

//After each 1 minut gameModel all collection will cleared and create same name collection with different
//game_id in gameModel collections..
//And this module currentGame also will cleared their own collection entry................

cron.schedule('* * * * *', async () => {
    try {
        //This line of code written for to check which was the latest game , because we want to change the latest game status.
        const newly_Game_Status = await which_Game_is_running.findOne({ fixed_id: 1, game_Status: true }).sort({ created_At: -1 }).exec();

        if (newly_Game_Status) {
            console.log('check 1')
            const result = await gameModel.aggregate([
                {
                    $match: { game_Status: true } // Match documents where game_Status is true
                },
                {
                    $group: {
                        _id: null, // Group by null to aggregate over all documents
                        totalRedBet: { $sum: "$red_bet" },
                        totalGreenBet: { $sum: "$green_bet" },
                    },
                },
            ]);
            console.log("check result",result)
            if(result.length > 0){
                console.log("check 2")
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
            console.log(`total amout bet at red button is ${result[0].totalRedBet} and green button is ${result[0].totalGreenBet}`)
            const updateColor = await gameModel.updateMany({ game_id: newly_Game_Status._id }, { $set: { winner_color: winnerColor } }, { new: true });
            console.log("check 5");
            if (updateColor) {
                console.log(`winning color has been updated or set ${winnerColor}`);
            }
            //------------------------------------------------------------------------------------------------------------------------------------
            //Here we write money return code according to user_choice color and  winner_color
            //If user_choice color is equal to winner_color then we calculate winning amount on the basis of 
            //winning_Amount=user_amount+(user_amount/2) and then we add this money in user wallet with the help of 
            //user_id.
            // Find all users who placed bets
            const current_Game = await gameModel.find({ game_Status: true, game_id: newly_Game_Status._id })
            //wallet
            if (current_Game) {
                //Iterate through users and update wallets if they won
                for (const user of current_Game) {
                    if (user.user_choice === user.winner_color) {
                        // Update user's wallet with winning amount
                        console.log("user Amount in this game..", user.user_amount)
                        const winning_Amount = user.user_amount + ((user.user_amount) / 2)
                        //updating the wallet model on the basis of current_Game user_id
                        console.log("check N")
                        let walletDoc = await wallet.findOne({ user_id: user.user_id });

                        if (!walletDoc) {
                            console.log(`No wallet found for user with ID ${user_id}`);
                            return;
                        }

                        const updatedWallet = await wallet.findOneAndUpdate(
                            { user_id: user.user_id },
                            { $set: { wallet: walletDoc.wallet + winning_Amount } },
                            { new: true } // Return the updated document
                        ).populate('user_id', 'email');

                        // console.log(`user ${updatedWallet.user_id.email} wallet has been updated by winning amount`);
                        console.log("check N last", updatedWallet)

                    }
                }
                await gameModel.updateMany({ game_id: newly_Game_Status._id }, { $set: { game_Status: false } })
                console.log({ "total_user": current_Game })
            }
            
            //Want to change last created game status has been changed in both model gameModel and which_Game_is_running.
            console.log(`current game id is newly_Game_Status ${newly_Game_Status}`)
           }
            try {
                
                await which_Game_is_running.findOneAndUpdate({ _id: newly_Game_Status._id }, { $set: { game_Status: false } });
            } catch {
                console.log('there is some error in the above code.........')
            }


            console.log("last created game status has been changed");

        }
        const newGame = await which_Game_is_running.create({});
        if (newGame) {
            console.log("New Game is started...........")
        }
        else {
            console.log("New game is not created.........")
        }
    } catch (error) {

        console.log("Internal Server error");
    }


    console.log('running a task every minute');
});

