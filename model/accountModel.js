const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    accountNumber: {
        type: String,
        required: true,
        unique: true
    },
    ifscCode: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    accountHolderName: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Account', AccountSchema);
