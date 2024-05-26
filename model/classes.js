const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: './config.env' });


const classSchema = new mongoose.Schema({
    instructor:{
        type:String,
        required:true,
    },
    rating:{
        type:String,
        required:true,
    },
    topic:{
        type:String,
        required:true,
    },
    money:{
        type:String,
        required:true,
    },
    tags:{
        type:[String],
        default:[],
    },
    date:{
        type: Date,
        required: true,
    },
    starttime:{
        type: String,
        required:true,
    },
    endtime:{
        type: String,
        required:true,
    },
    Capacity:{
        type:Number,
        required:true,
    },
    remainCapacity:{
        type:Number,
        default:0,
        required:true,
    }
});

const Class=new mongoose.model('Class',classSchema);

module.exports=Class;