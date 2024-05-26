const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: './config.env' });


const contactusSchema = new mongoose.Schema({
    fname:{
        type:String,
        required:true,
    },
    lname:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    phone:{
        type:String,
        required:true,
    },
    message:{
        type:String,
        required:true,
    }
    
});

const Contactus=new mongoose.model('Contactus',contactusSchema);

module.exports=Contactus;