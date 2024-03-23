const express = require("express");
const router = express.Router();
const { uploadVideos,getAllVideos,getVideoById } = require("../controllers/videoControllers");

const upload = require("../middlewares/multerMid");

router.route("/videoupload").post(
  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    }
  ]),
  uploadVideos
);

router.route("/getallvideos").get(getAllVideos);
router.route("/getvideobyid/:videoId").get(getVideoById)

module.exports = router;
