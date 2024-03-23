const mongoose = require("mongoose");

(async () => {
  try {
    console.log("sucessfully connected to mongoDB");
    await mongoose.connect(process.env.MONGO_URL);
  } catch (error) {
    console.log(error);
  }
})();
