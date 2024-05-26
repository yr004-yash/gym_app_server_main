const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config({ path: './config.env' });

const orderSchema = new mongoose.Schema({
    ClientId: {
        type: String,
        required: true,
    },
    TransactionId: {
        type: String,
        required: true,
    },
    OrderId: {
        type: String,
        required: true,
    },
    PaymentStatus: {
        type: String,
        default: 'Pending',
    },
    Amount: {
        type: Number,
        default: 0,
    },
    CurrencyCode: {
        type: String,
    },
    ResponseMsg: {
        type: String,
        default: "",
    },
    OrderReceiptLink: {
        type: String,
    },
    CustomMessage: {
        type: String,
        default: "",
    },
    CardToken: {
        type: String,
    },
    FirstName: {
        type: String,
    },
    Email: {
        type: String,
    },  
    StreetAddress: {
        type: String,
    },
    CountryAddress: {
        type: String,
    },
    StateAddress: {
        type: String,
    },
    City:{
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

const Order = new mongoose.model('Order', orderSchema);
module.exports = Order;
