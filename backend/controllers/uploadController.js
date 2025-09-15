import multer from 'multer';
import { randomUUID } from 'crypto';
import path from 'path';
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

        // Generate unique name without extension
        const parsedName = path.parse(req.file.originalname);
        const uniqueName = randomUUID() + '-' + parsedName.name;

        // Determine resource type based on mimetype
        const isImage = req.file.mimetype.startsWith('image/');
        const resourceType = isImage ? 'image' : 'raw';

        // For images, use uniqueName without extension (Cloudinary will handle the extension)
        // For non-images, include the extension
        const publicId = isImage ? uniqueName : uniqueName + parsedName.ext;

        // Upload to Cloudinary
        const result = await cloudinary.v2.uploader.upload_stream(
            {
                public_id: publicId,
                resource_type: resourceType,
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return res.status(500).json({ success: false, message: 'Upload failed' });
                }
                
                // For publicId: add extension manually for consistent naming in your records
                // For imageUrl: use Cloudinary's URL as-is (clean, no double extension)
                const responsePublicId = isImage ? 
                    result.public_id + parsedName.ext : 
                    result.public_id;
                
                res.json({
                    success: true,
                    message: 'File uploaded successfully',
                    imageUrl: result.secure_url, // Clean Cloudinary URL
                    publicId: responsePublicId,  // Your custom format with extension
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