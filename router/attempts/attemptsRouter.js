const router = require('express').Router();
const database = require("../../config/knex-config");
const axios = require('axios').default;
var FormData = require('form-data');


require('dotenv').config();



/**
 * @param {req.body} 2 fields numOfSuccessfulAttempts and numOfAttempts
 * The purpose of this endpoint is the intitalize the attempts router
 */
router.post("/",(req,res) =>{
database.insert({...req.body})
.from("attempts")
.returning("*")
.then(responseData => {
res.status(201).json({responseMessage:responseData})
}).catch(err =>{
    res.status(500).json({errorMessage:err,errText:"Sorry for some reason your post did not work"})
})
})
/**
 * Here is the plan
 * We verify both patterns.
 * If either spits out a rejection we send a resonse of failure
 * if both are verified they beat the system
 */
router.put("/",(req,res) => {
    var apiKey = `${process.env.typingDnaApiKey}`
    var apiSecret = `${process.env.typingDnaSecret}`;
    var options = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cache-Control': 'no-cache',
            'Authorization': 'Basic ' + new Buffer.from(apiKey + ':' + apiSecret).toString('base64'),
        },
    };

//=============First pattern
let emailData = {tp :req.body.emailPattern}
let emailFormBody = [];
for(let prop in emailData){
    const encodedKey = encodeURIComponent(prop);
    const encodedValue = encodeURIComponent(emailData[prop])
    emailFormBody.push(encodedKey + "=" + encodedValue);
}
emailFormBody = emailFormBody.join("&");

//========= Password Pattern
let passwordData = {tp:req.body.passwordPattern}
let passwordFormBody = []
for(let prop in passwordData){
    const encodedKey = encodeURIComponent(prop)
    const encodedValue = encodeURIComponent(passwordData[prop])
    passwordFormBody.push(encodedKey + "=" + encodedValue)
}
passwordFormBody = passwordFormBody.join("&")




axios.post(`https://api.typingdna.com/auto/durdurdur`,
emailFormBody,options).then(results => {
    
    if(results.data.result === 1){
        //We want to post a successful login attempt
        //So we update numOfSuccessfulAttempts and numOfAttempts
        //First we want to fetch our current data
        axios.post(`https://api.typingdna.com/auto/durdurdur`,passwordFormBody,options).then(res =>{
            // If both are valid we can update the database 
            if(res.data.result === 1){
                axios.get(`${process.env.requiredUrl}`)
                .then(data => {
                let requestBody = {
                    "numOfSuccessfulAttempts":data.data.responseMessage[0].numOfSuccessfulAttempts + 1,
                    "numOfAttempts":data.data.responseMessage[0].numOfAttempts + 1
                }
        
                    database.update(requestBody)
                    .where({id:1})
                    .returning("*")
                    .from("attempts")
                    .then(promiseResolved => {
                        res.status(200).json({responseMessage:promiseResolved})
                    }).catch(err => {
                        res.status(500).json({errorMessage:err,errText:"Sorry for some reason your put request did not work"})
        
                    })
                }).catch(err => {
                    res.status(500).json({errorMessage:err,errText:"Failed to retrieve data from the table"})
                })
            }else{
                axios.get(`${process.env.requiredUrl}`)
                .then(data => {
                let requestBody = {
                    "numOfSuccessfulAttempts":data.data.responseMessage[0].numOfSuccessfulAttempts,
                    "numOfAttempts":data.data.responseMessage[0].numOfAttempts + 1
                }
        
                    database.update(requestBody)
                    .where({id:1})
                    .returning("*")
                    .from("attempts")
                    .then(promiseResolved => {
                        res.status(200).json({responseMessage:promiseResolved})
                    }).catch(err => {
                        res.status(500).json({errorMessage:err,errText:"Sorry for some reason your put request did not work"})
        
                    })
                }).catch(err => {
                    res.status(500).json({errorMessage:err,errText:"Failed to retrieve data from the table"})
                })
            }
        }).catch(err => {
            res.status(500).json({errorMessage:err,errText:"Failed to retrieve data from the table"})
        })
    //Email was invalid pattern so we update the database and send back request 
    }else{
    
        //We want to update numOfAttempts to add one value to the column
        axios.get(`${process.env.requiredUrl}`)
        .then(data => {
        let requestBody = {
            "numOfSuccessfulAttempts":data.data.responseMessage[0].numOfSuccessfulAttempts,
            "numOfAttempts":data.data.responseMessage[0].numOfAttempts + 1
        }

            database.update(requestBody)
            .where({id:1})
            .returning("*")
            .from("attempts")
            .then(promiseResolved => {
                res.status(200).json({responseMessage:promiseResolved})
            }).catch(err => {
                res.status(500).json({errorMessage:err,errText:"Sorry for some reason your put request did not work"})

            })
        }).catch(err => {
            res.status(500).json({errorMessage:err,errText:"Failed to retrieve data from the table"})
        })

    }
}).catch(err =>{
res.status(500).json({errorMessage:`Failed to make a request to the typingdna api`,err:err})
})
})

/**
 * This endpoint fetches the number of attempts tables data
 */
router.get("/",(req,res) => {
    database.select("*").from("attempts").where({id:1})
    .then(data => {
        res.status(200).json({message:"Successfully fetched data", responseMessage:data})
    }).catch(err => {
        res.status(500).json({errorMessage:err,errText:"Sorry for some reason your get request did not work"})

    })
})

module.exports = router