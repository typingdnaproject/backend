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

module.exports = router