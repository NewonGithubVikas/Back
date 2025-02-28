const mongoose = require('mongoose');
const { Schema } = mongoose;  // Destructure Schema from mongoose

const walletSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'user',  // The model name should match the referenced model's name
    },
    wallet: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Wallet', walletSchema);
