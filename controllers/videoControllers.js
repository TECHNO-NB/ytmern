const asyncHandler = require("../utils/asyncHandler");
const Video = require("../models/videoModel");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResonse");
const uploadOnCloudinary = require("../utils/cloudnary");
const videoModel = require("../models/videoModel");

exports.uploadVideos = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "Title And Descriptions Is Required");
  }

  const videoFilePath = req.files?.video[0]?.path;
  const thumbnailFilePath = req.files?.thumbnail[0]?.path;
  if (!videoFilePath || !thumbnailFilePath) {
    throw new ApiError(400, "File Not Founds");
  }
  const videoUrl = await uploadOnCloudinary(videoFilePath);
  const thumbnailUrl = await uploadOnCloudinary(thumbnailFilePath);

  if (!videoUrl || !thumbnailUrl) {
    throw new ApiError(400, "Cloudnary File Not Founds");
  }

  if (!videoUrl.url || !thumbnailUrl.url) {
    throw new ApiError(400, "Error In Cloudnary");
  }
  const uploadVideo = await videoModel.create({
    videoFile: videoUrl?.url,
    thumbnail: thumbnailUrl?.url,
    title: title,
    description: description,
    duration: videoUrl?.duration,
  });
  if (!uploadVideo) {
    throw new ApiError(400, "Error In upload Video");
  }
  res
    .status(200)
    .json(new ApiResponse(200, uploadVideo, "Video Upload Successfully"));
});

exports.getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sortBy = -1 } = req.query;
  const skipvideos = (page - 1) * limit;
  const allVideos = await Video.find({isPublished:true})
    .limit(limit)
    .skip(skipvideos)
    .sort({ createdAt: sortBy });

  console.log(allVideos[0]);
  if (!allVideos) {
    throw new ApiError(400, "Somethings Went Wrong");
  }
  res
    .status(200)
    .json(new ApiResponse(200, allVideos, "Successfully fetch all videos"));
});

exports.publishVideo = asyncHandler(async (req, res) => {
  const { title, descriptions } = req.body;
  const allVideos = await Video.find().limit(limit).skip(skip);
  if (!allVideos) {
    throw new ApiError(400, "Somethings Went Wrong");
  }
  res
    .status(200)
    .json(new ApiResponse(200, allVideos, "Successfully fetch all videos"));
});

exports.getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const getOneVideo = await Video.findById(videoId);
  if (!getOneVideo) {
    throw new ApiError(400, "Somethings Went Wrong");
  }
  res
    .status(200)
    .json(
      new ApiResponse(200, getOneVideo, "Successfully fetch all One Video")
    );
});
