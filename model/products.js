const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: './config.env' });


const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    rating:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
    money:{
        type:String,
        required:true,
    },
    availability:{
        type:String,
        required:true,
    },
    code:{
        type:String,
        required:true,
    },
    tags:{
        type:[String],
        default:[],
    },
    size:{
        type:String,
        required:true,
    },
    brand:{
        type:String,
        required:true,
    }
});

const Product=new mongoose.model('Product',productSchema);

module.exports=Product;