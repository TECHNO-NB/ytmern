const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const ApiError = require("../utils/apiError");

const jwtVerify = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }
    const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
    let user = await User.findById(decodeToken._id).select(
      "-password -refreshToken"
    );
    req.user = user;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
  }
};

module.exports=jwtVerify;
