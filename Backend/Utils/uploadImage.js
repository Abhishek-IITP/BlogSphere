const cloudinaryConfig = require('../Config/cloudinaryConfig')

const cloudinary = require('cloudinary').v2


async function uploadImage(imagePath){
try {
    const result= await cloudinary.uploader.upload(imagePath,{
       folder: "Blog App",
    })
    console.log(result)
    return result;
} catch (error) {
    console.log(error )
    
}
}

async function  deleteImageFromCloudinary(imageId){
    try {
        await cloudinary.uploader.destroy(imageId)
    } catch (error) {
        console.log(error)
    }
}

module.exports = {uploadImage,deleteImageFromCloudinary}