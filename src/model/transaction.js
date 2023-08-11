const mongoose = require('mongoose');
const tran= new mongoose.Schema({
    accountno :{
        type:Number,
        required : true,
        unique: true,
    },
    
    tranhistory :{
        type:Array
    },

});

const historytran=new mongoose.model('transaction',tran);
module.exports=historytran;