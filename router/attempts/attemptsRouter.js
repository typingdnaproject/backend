const router = require('express').Router();
const database = require("../../config/knex-config");
const axios = require('axios').default;
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
    console.log(err)
    res.status(500).json({errorMessage:err,errText:"Sorry for some reason your post did not work"})
})
})

router.put("/",(req,res) => {
const config ={
    headers:{
        "Authorization": `${process.env.typingDnaApiKey}${process.env.typingDnaSecret}`,
        "Content-type": "application/json; charset=UTF-8",
    }
}
const postBody = {
    "id":process.env.typingdnaId,
    "tp":req.body.tp
}

axios.post(`https://api.typingdna.com/auto/${process.env.typingdnaSecret}`,
postBody,
config
).then(results => {
    if(results.enrollment === 1){
        //We want to post a successful login attempt
        //So we update numOfSuccessfulAttempts and numOfAttempts
        //First we want to fetch our current data
        
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
                res.status(200).json({resonseMessage:promiseResolved})
            }).catch(err => {
                res.status(500).json({errorMessage:err,errText:"Sorry for some reason your put request did not work"})

            })
        }).catch(err => {
            res.status(500).json({errorMessage:err,errText:"Failed to retrieve data from the table"})
        })
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
                res.status(200).json({resonseMessage:promiseResolved})
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
        res.status(200).json({message:"Successfuly fetched data", responseMessage:data})
    }).catch(err => {
        res.status(500).json({errorMessage:err,errText:"Sorry for some reason your get request did not work"})

    })
})

module.exports = router