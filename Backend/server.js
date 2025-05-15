const express = require("express");
const cors = require("cors");
const dbConnect = require("./Config/dbConnect")
const app = express();
const userRoutes= require("./Routes/userRoutes")
const blogRoutes= require("./Routes/blogRoutes")
const mongoose = require("mongoose");
const User=require("./models/userSchema");
const cloudinaryConfig = require("./Config/cloudinaryConfig");
require ('dotenv').config()


app.use(cors());
app.use(express.json());

app.use("/api/v1",userRoutes)
app.use("/api/v1",blogRoutes)

app.get("/",(req,res)=>{
  res.send("Hello jii...kya haal h")
})
// Server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
  dbConnect();
  cloudinaryConfig();
});
