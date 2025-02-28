const mongoose = require('mongoose');

const UserRequestSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user', // Assuming a User model exists
            required: true,
        },
        transaction_id:{
            type: String,
            default:null
        },
        amount: {
            type: Number,
            required: true,
            min: 0.01, // Ensure a valid positive amount
        },
        transactionType: {
            type: String,
            enum: ['add', 'withdraw'],
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        adminResponse: {
            type: String,
            default: '',
        },
    },
    { timestamps: true } // Automatically manages createdAt and updatedAt fields
);

module.exports = mongoose.model('UserRequest', UserRequestSchema);
