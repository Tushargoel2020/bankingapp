const express=require('express');
const path=require('path'); 
const hbs=require('hbs');
require('./db/conn');
const accounts= require('./model/models');
// require("./db/conn");
// const register=require("./model/registers");
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:false}))

const publicPath = path.join(__dirname, '../public')
const tempPath = path.join(__dirname, '../templates/views');
const PartialsPath = path.join(__dirname, '../templates/partials');

const port= process.env.PORT|| 3000;
app.use(express.static(publicPath));
app.set('view engine', 'hbs');
app.set('views',tempPath);
hbs.registerPartials(PartialsPath);
app.get('',(req,resp)=>{
    //resp.send("Hello how are you")
    resp.render("index")
})


app.get('/account_open',(req,resp)=>{
    //resp.send("my registeration")
    resp.render('account_open')
})
app.post('/account_open',async (req,resp)=>{

   try{
    console.log(req.body.phone);
      let ID= parseInt(Math.random().toFixed(10).replace("0.",""));

              const reg= new accounts({
                    accountno:ID,
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    email: req.body.email,
                    gender: req.body.gender,
                    DOB: req.body.DOB,
                    Mobile :req.body.phone,
                    //confirrmpassword: cpassword
                })
                const registered= await reg.save();
                resp.render("detail",{
                    accountid: ID
                });
   }
     
          catch(error){
            resp.status(400).send(error);
          }
})

app.get('/closed',(req,resp)=>{
    resp.render("closed");
})

app.post('/closed',async (req,resp)=>{
    let accountid=req.body.account_id;
    console.log(accountid);
    try{
        let result=await accounts.deleteOne({accountno:accountid});
    if(result.acknowledged){
        console.log("deleted");
    }
    else{
        console.log("no deleted");
    }
    }
    catch(e){
        console.log(e.message);
    }

    resp.send("Hello");
    

});



app.get('/details',async(req,resp)=>{
    try{
         
        resp.render('details')

    }
    catch(e){

    }
})

app.post('/details', async (req,resp)=>{
    let cname= req.body.cname;
    let accountID= req.body.account_id;
    console.log(cname + " " + accountID);

    let result= await accounts.find({accountno : accountID});

     resp.send(result);
    //resp.send("Hello");
})


app.listen(port,()=>{
    console.log(`server is running at port np ${port}`);
});