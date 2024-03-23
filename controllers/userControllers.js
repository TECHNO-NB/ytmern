const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/userModel");
const uploadOnCloudinary = require("../utils/cloudnary");
const ApiResponse = require("../utils/apiResonse");
const jwtVerify = require("../middlewares/authMiddleware");
const jwt = require("jsonwebtoken");

const createAccessAndRefreshToken = async (userId) => {
  try {
    const newUser = await User.findById(userId);
    if (!newUser) {
      throw new ApiError(400, "User Not Found");
    }
    const accessToken = await newUser.generateAccessToken();
    const refreshToken = await newUser.generateAccessToken();

    newUser.refreshToken = refreshToken;
    await newUser.save();

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, error);
  }
};

exports.registerControler = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  if (!fullName || !email || !username || !password) {
    throw new ApiError(400, "All fields are required");
  }
  const existsUser = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (existsUser) {
    throw new ApiError(409, "User Already Exists");
  }

  const avatarFilePath = req.files?.avatar[0]?.path;
  const coverImageFilePath = req.files?.coverImage[0]?.path;

  if (!avatarFilePath) {
    throw new ApiError(400, "Avatar image is required");
  }
  const avatar = await uploadOnCloudinary(avatarFilePath);
  const coverImage = await uploadOnCloudinary(coverImageFilePath);

  if (!avatar) {
    throw new ApiError(500, "Avatar upload failed");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || " ",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something Went Wrong while registering the user");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered Successfully"));
});

exports.loginControler = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Email And Password Is Required");
  }
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new ApiError(400, "Please Add Valid Email And Password");
  }
  if (user.password) {
    const isCorrectPss = await user.isPasswordCorrect(password);
    if (isCorrectPss) {
      const { refreshToken, accessToken } = await createAccessAndRefreshToken(
        user._id
      );
      const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
      );
      const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      };
      res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(
          new ApiResponse(
            200,
            {
              user: loggedInUser,
              refreshToken,
              accessToken,
            },
            "User LogIn SuccessFully"
          )
        );
    } else {
      throw new ApiError(400, "please enter correct password");
    }
  }
});

exports.userLogOut = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: "" },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User LogOut Successfully"));
});

exports.userProfile = asyncHandler(async (req, res) => {
  const userData = await User.findById(req.user?._id).select("-password");
  console.log("hello");
  res.status(200).json(new ApiResponse(200, { userData }, "User Profile"));
});

exports.generateAccessRefreshToken = asyncHandler(async (req, res) => {
  const { accessTOKEN } = req.body;
  if (!accessTOKEN) {
    new ApiError(400, "No Access Token");
  }
  const jwtverfiytoken = await jwt.verify(accessTOKEN, process.env.JWT_SECRET);
  if (!jwtverfiytoken) {
    new ApiError(400, "Invalid Access Token");
  }

  const user = await User.findById(jwtverfiytoken._id).select("-password");
  if (!user) {
    new ApiError(400, "user not exist");
  }

  const { accessToken, refreshToken } = await createAccessAndRefreshToken(
    user._id
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user,
          refreshToken,
          accessToken,
        },
        "Success"
      )
    );
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    new ApiError(400, "Please FIll oldPassword And New Password");
  }
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(400, "Password incorrect");
  }

  let isPasswordRight = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordRight) {
    throw new ApiError(400, "Enter Correct Password");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Password Change Succesfully"));
});

exports.changeAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.avatar;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Not Images Path Found");
  }
  const avatarUrl = await uploadOnCloudinary(avatarLocalPath);
  if (!avatarUrl.url) {
    throw new ApiError(400, "Not Images Saved At cloudnary");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { avatar: avatarUrl.url },
    },
    {
      new: true,
    }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "successfully change avatar"));
});

exports.changeCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalpath = req.file?.path;
  if (!coverImageLocalpath) {
    throw new ApiError(400, "coverImage Path not found");
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalpath);
  if (!coverImage.url) {
    throw new ApiError(400, "coverImage not upload at cloudnary");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { coverImage: coverImage.url } },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Successfully change coverImage"));
});

exports.updateUsernameFullname = asyncHandler(async (req, res) => {
  const { fullName, username } = req.body;
  if (!fullName || !username) {
    throw new ApiError(400, "Please Fill FullName And Username");
  }
  const user = await User.findByIdAndUpdate(req.user?._id, {
    $set: { fullName, username },
  }).select("-password");
  if (!user) {
    throw new ApiError(400, "User Not Found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Change Successfully"));
});

exports.getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username) {
    throw new ApiError(400, "username not found");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if(!channel?.length){
    throw new ApiError(404,"channel doest not exists")
  }

  return res
  .status(200)
  .json(new ApiResponse(200,channel[0],"User Channel fetched successfully"))
});
