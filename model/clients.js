const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config({ path: './config.env' });

const clientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    purchasedProducts: [{
        _id: false,
        products: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Products',
            required: true,
        },
        quantity: {
            type: Number,
            default: 0,
        }
    }],
    purchasedClasses: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Classes',
    },
    purchasedMembership: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Membership',
    },
});

clientSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
        console.log("here ", this.password)
    }
    next();
});

const Client = new mongoose.model('Client', clientSchema);
module.exports = Client;
