import multer from 'multer';
import { randomUUID } from 'crypto';
import cloudinary from 'cloudinary';

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Upload image to Cloudinary
const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Generate unique name
        const uniqueName = randomUUID() + '-' + req.file.originalname;

        // Upload to Cloudinary
        const result = await cloudinary.v2.uploader.upload_stream(
            {
                public_id: uniqueName,
                resource_type: 'image',
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return res.status(500).json({ success: false, message: 'Upload failed' });
                }
                res.json({
                    success: true,
                    message: 'Image uploaded successfully',
                    imageUrl: result.secure_url,
                    publicId: result.public_id,
                });
            }
        );

        // Pipe the buffer to Cloudinary
        result.end(req.file.buffer);
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export { upload, uploadImage };