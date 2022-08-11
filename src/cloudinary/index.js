const cloudinary = require('cloudinary').v2
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = require('../config')

//config cloudinary
cloudinary.config({
	cloud_name: CLOUDINARY_CLOUD_NAME,
	api_key: CLOUDINARY_API_KEY,
	api_secret: CLOUDINARY_API_SECRET,
	secure: true,
})

const uploadAudio = async (base64) => {
	try {
		const response = await cloudinary.uploader.upload(base64, {
			resource_type: 'video',
			overwrite: true,
			folder: 'whatsClon/audio',
			video_metadata: true,
		})
		return response
	} catch (error) {
		console.log(error)
	}
}

module.exports = { uploadAudio }
