const express = require('express');
const path = require('path');
const hbs = require('hbs');
require('./db/conn');
const accounts = require('./model/models');
const transact = require('./model/transaction');
const { request } = require('http');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const publicPath = path.join(__dirname, '../public');
const tempPath = path.join(__dirname, '../templates/views');
const PartialsPath = path.join(__dirname, '../templates/partials');
const port = process.env.PORT || 3000;
app.use(express.static(publicPath));
app.set('view engine', 'hbs');
app.set('views', tempPath);
hbs.registerPartials(PartialsPath);
app.get('', (req, resp) => {
    resp.render("index")
})



// *****************Open account *****************************
app.get('/account_open', (req, resp) => {
    resp.render('account_open')
})
app.post('/account_open', async (req, resp) => {

    try {
        let ID = parseInt(Math.random().toFixed(10).replace("0.", ""));
        const reg = new accounts({
            accountno: ID,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            gender: req.body.gender,
            DOB: req.body.DOB,
            Mobile: req.body.phone,
        })
        const registered = await reg.save();
        let Date1 = new Date();
        let amt = 0;
        let arr = [{ date: Date1,detail: "Debit", amount: amt }];
        const transopen = new transact({
            accountno: ID,
            tranhistory: arr,
            total: 0
        })
        let res = transopen.save();
        resp.render("detail", {
            accountid: ID
        });
    }

    catch (error) {
        resp.status(400).send(error);
    }
})
// ***********************closed account ******************************
app.get('/closed', (req, resp) => {
    resp.render("closed");
})

app.post('/closed', async (req, resp) => {
    let accountid = req.body.account_id;
    let cname = req.body.cname;
    try {
        let result = await accounts.deleteOne({
            $and: [
                { accountno: accountid },
                { firstname: cname }
            ]

        }
        );

        
        if (result.deletedCount > 0) {
            let dlt= await transact.deleteOne({ accountno: accountid });
            resp.render("dltstatus",{
                status: "Your account is successfully deleted",
                thank: "Thank you for using us  !................."
            });
        }
        else {
            resp.send("no deleted");
        }
    }
    catch (e) {
        console.log(e.message);
    }


});


// **************************account details***********************
app.get('/details', async (req, resp) => {
    try {
        resp.render('details')
    }
    catch (e) {

    }
})

app.post('/details', async (req, resp) => {
    let cname = req.body.cname;
    let accountID = req.body.account_id;
    let result = await accounts.find({ accountno: accountID });
    console.log(result[0]);
    if (result === 0) {
        console.log('No matching document found.');
    } else {
        
        resp.render("accountdetail",result[0]);
    }

})

// **********************************Deposite money ***********************

app.get('/deposit', (req, resp) => {
    resp.render('deposit');
})
app.post('/deposite', async(req, resp) => {
    let accountID=req.body.account;
    let result = await accounts.find({ accountno: accountID });
    if (result.length === 0) {
       resp.render('pay_detail',{
        feature:"Payment failed",
        details: "No account found"
       })
    } else {
        let amt=req.body.amount;
        // work on account details
        let res = await accounts.find({ accountno: accountID },'amount');
        let totalamt= (res[0].amount )*1+ amt*1;
        let result1= await accounts.updateOne(
            { accountno: accountID},
            {
                $set :{amount:totalamt}
            }
        )

        // work on transaction details 
        let tran = await  transact.find({ accountno: accountID });
        let arr = tran[0].tranhistory;
        
        let obj={
            date: req.body.date,
            detail: "credit",
            amount:amt
        }
        arr.push(obj);
        console.log(arr);

        let result2= await transact.updateOne(
            { accountno: accountID},
            {
                $set :{tranhistory:arr}
            }
        )
        resp.render('pay_detail',{
            feature:"Payment successful",
            details: `your final amount are ${totalamt}`
        })
    }
})




/*  ****************************************withdraw money ******************************** */


app.get('/withdraw', (req, resp) => {
    resp.render('withdraw');
})
app.post('/withdraw', async(req, resp) => {
    let accountID=req.body.account;
    let result = await accounts.find({ accountno: accountID });
    if (result.length === 0) {
       resp.render('pay_detail',{
        feature:"Payment failed",
        details: "No account found"
       })
    } else {
        let amt=req.body.amount;
        // work on account details
        let res = await accounts.find({ accountno: accountID },'amount');
        if(res[0].amount<amt){
            resp.render('pay_detail',{
                feature:"Check your Balance",
                details: `Your balance is low `
            })
        }
        else{
            let totalamt= (res[0].amount )*1- amt*1;
            let result1= await accounts.updateOne(
                { accountno: accountID},
                {
                    $set :{amount:totalamt}
                }
            )
    
            // work on transaction details 
            let tran = await  transact.find({ accountno: accountID });
            let arr = tran[0].tranhistory;
            
            let obj={
                date: req.body.date,
                detail: "Debit",
                amount:amt
            }
            arr.push(obj);
            console.log(arr);
    
            let result2= await transact.updateOne(
                { accountno: accountID},
                {
                    $set :{tranhistory:arr}
                }
            )
            resp.render('pay_detail',{
                feature:"Payment successful",
                details: `your final amount are ${totalamt}`
            })
        }
       
    }
})




/***********************************transaction history *************************************** */
app.get('/transhistory',async (req,resp)=>{
    resp.render('transdetail');
    
});
app.post('/transhistory', async(req,resp)=>{
    let accountID= req.body.account_id;
    let tran = await  transact.find({ accountno: accountID });
    console.log(tran[0].tranhistory);
    if(tran==0){
        resp.send("not found");
    }
    else{
       
        resp.render("transhistory",{
            header: tran[0].accountno,
            arr: tran[0].tranhistory
        });
    }

})



/*   **************************Loan *********************************************************** */



app.get('/loan',(req,resp)=>{
    resp.render('loan');
})



/* ********************************List*********************** */

app.get('/list',async(req,resp)=>{
    let result = await accounts.find();
    console.log(result);
    resp.render('list',{data:result});
})

app.listen(port, () => {
    console.log(`server is running at port np ${port}`);
});

