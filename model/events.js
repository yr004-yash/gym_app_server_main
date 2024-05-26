const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: './config.env' });


const calendarSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    start:{
        type:String,
        required:true,
    },
    end:{
        type:String,
        required:true,
    },
    extra:{
        type:String,
        required:true,
    }
});

const Calendar=new mongoose.model('Calendar',calendarSchema);

module.exports=Calendar;