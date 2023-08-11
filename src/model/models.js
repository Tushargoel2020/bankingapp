const mongoose= require('mongoose');

const userSchema=new mongoose.Schema({
    accountno:{
        type:Number,
        unique: true
    },
    firstname:{
        type: String,
        required: true
    },
    lastname:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique : true
        
    },
    gender:{
        type: String,
        required: true
    },
    
    DOB:{
        type:Date,
        required:true,
    },
    Mobile:{
        type: Number,
        required: true,
        unique:true
    },
    amount:{
        type:Number,
        default:0
    }
})

const Register= new mongoose.model("account",userSchema);
module.exports=Register;