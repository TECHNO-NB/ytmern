const express = require("express");
const cors = require("cors");
const cookieParser =require("cookie-parser");
const env=require("dotenv");
const userRoutes=require("./routes/userRoute");
const bodyParser=require("body-parser");
const subscriptionsRoute=require("./routes/subscriptionsRoute");
const videoUploadRoute =require("./routes/videoUploadRoute.js");
const path=require("path");

const app = express();

// dot env file
 env.config()

// Main App Middlewares
app.use(cors({
    origin:"*",
    credentials:true
}));
app.use(cookieParser());
app.use(express.json({limit:'100mb'}));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

// databaseConnection
require("./database/dbs");

app.use(express.static(path.join(__dirname,"./frontend/dist")))

app.get("/",(req,res)=>{
    res.sendFile(
        path.join(__dirname,"./frontend/dist/index.html")
       
    )
})
// // User Api Route
// app.use("/api/v1/users",userRoutes);

// // Subscriptions Api Route
// app.use("/api/v1",subscriptionsRoute);

// // videoUplode APi route
// app.use("/api/v1",videoUploadRoute);

// User Api Route
app.use(userRoutes);

// Subscriptions Api Route
app.use(subscriptionsRoute);

// videoUplode APi route
app.use(videoUploadRoute);



app.listen(process.env.PORT|| 8000, () => {
    console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
})


