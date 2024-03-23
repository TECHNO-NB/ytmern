const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const controllers = require("../controllers/userControllers");
const upload = require("../middlewares/multerMid");
const jwtVerify = require("../middlewares/authMiddleware");

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  controllers.registerControler
);
router.route("/login").post(controllers.loginControler);
router.route("/logout").post(jwtVerify, controllers.userLogOut);
router.route("/profile").get(jwtVerify, controllers.userProfile);
router
  .route("/refreshaccesstoken")
  .post(controllers.generateAccessRefreshToken);
router.route("/changepassword").patch(jwtVerify, controllers.changePassword);
router
  .route("/changeavatar")
  .patch(jwtVerify, upload.single("avatar"), controllers.changeAvatar);
router
  .route("/changecoverimg")
  .patch(jwtVerify, upload.single("coverImage"), controllers.changeCoverImage);

router
  .route("/changefullusername")
  .patch(jwtVerify, controllers.updateUsernameFullname);

router
  .route("/userchannel/:username")
  .post(jwtVerify, controllers.getUserChannelProfile);

module.exports = router;
