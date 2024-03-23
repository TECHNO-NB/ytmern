const cloudinary = require("cloudinary");
const fs = require("fs");

cloudinary.v2.config({
  cloud_name: "nareshnb",
  api_key: "714937436462499",
  api_secret: "dgwUI8fw8z3x3Yf6dMqx-1xbXj8",
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.v2.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};

module.exports = uploadOnCloudinary;
