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
        enum:['red','green','number'],
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
        enum : ["red","green"],
        default:null
    },
    user_choice_number:{
        type:Number,
        enum : [1,2,3,4,5,6,7,8,9],
        default:null
    },
    winner_number:{
        type:Number,
        enum : [1,2,3,4,5,6,7,8,9],
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