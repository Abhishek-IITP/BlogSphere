const cloudinary= require('cloudinary').v2;
require ('dotenv').config()

async function cloudinaryConfig() {
  try {
    await cloudinary.config(
        {
            cloud_name: process.env.CLOUDE_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        }
    )
    
    console.log("Cloudinary Config Successfull")
  } catch (error) {
    console.log("error occur while config cloundinary")
    console.log(error.message)
    
  }
}

module.exports = cloudinaryConfig