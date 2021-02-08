const router = require('express').Router();
const database = require("../../config/knex-config");



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

router.put("/",(req,res) => {

    if(req.body.isSuccessful === true){
        //We want to post a successful login attempt
        //So we update numOfSuccessfulAttempts and numOfAttempts

    }else{
        //We want to update numOfAttempts to add one value to the column
    }
})

/**
 * This endpoint fetches the number of attempts tables data
 */
router.get("/",(req,res) => {
    database.select("*").from("attempts")
    .then(data => {
        res.status(200).json({message:"Successfuly fetched data", responseMessage:data})
    }).catch(err => {
        res.status(500).json({errorMessage:err,errText:"Sorry for some reason your get request did not work"})

    })
})

module.exports = router