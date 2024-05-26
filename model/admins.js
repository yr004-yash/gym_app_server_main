const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config({ path: './config.env' });

const earningSchema = new mongoose.Schema({
    month: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
});
const Inventory = new mongoose.Schema({
    Inventoryname: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
});
// const blogSchema = new mongoose.Schema({
//     title: {
//         type: String,
//         required: true,
//     },
//     content: {
//         type: String,
//         required: true,
//     },
//     image: {
//         type: String,
//         required:false
//     },
// });

const trainerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    rating:{
        type: String,
        required: true,
    },
    image: {
        type: String, 
        required: false,
    },
});

const adminSchema = new mongoose.Schema({
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
        minlength: 6
    },
    earnings: [
        earningSchema
    ],
    trainers: [
        trainerSchema,
    ],
    Inventories: [
        Inventory,
    ],
    // tokens: [
    //     {
    //         token: {
    //             type: String,
    //             required: true
    //         }
    //     }
    // ]
});

adminSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
        console.log("here ", this.password)
    }
    next();
});

// adminSchema.methods.generateAuthToken = async function () {
//     try {
//         let tokenss = jwt.sign({ _id: this._id }, process.env.SECRET_KEY);

//         this.tokens = this.tokens.concat({ token: tokenss })

//         await this.save();
//         return tokenss
//     } catch (error) {

//     }
// };


const Admin = new mongoose.model('Registration', adminSchema);
module.exports = Admin;
