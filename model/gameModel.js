const mongoose=require('mongoose');
const  gameSchema=mongoose.Schema({
    game_id:{
        type:String,
        required:true        
    },
    user_id:{
        type:String,
        // required:true
    },
    user_choice:{
        type:String,
        enum:['red','green'],
        // required:true
    }
    ,
    user_amount:{
        type:Number,
        // required:true,
    },
    green_bet:{
        type:Number
    },
    red_bet:{
        type:Number
    },
    winner_color:{
        type:String,
        enum:["red","green"],
        default:null
    },
    created_At: {
        type: Date,
        default: Date.now
    }
    ,
    game_Status:{
        type:Boolean,
        default:true
    }
})
module.exports = mongoose.model('game', gameSchema);