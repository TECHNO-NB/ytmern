const express=require("express");
const router=express.Router();
const { subscriptionsControler } = require("../controllers/subControllers");


router.route("/subscriptions").post(subscriptionsControler);

module.exports=router;

