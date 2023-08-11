const mongoose=require('mongoose');
mongoose.connect('mongodb://localhost:27017/apna_bank').then(()=>{
    console.log(`connection successfull`);
}).catch((e)=>{
    console.log(`no connection`);
   
})