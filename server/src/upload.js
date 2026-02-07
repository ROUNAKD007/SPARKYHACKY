import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

const storage = new CloudinaryStorage({
    cloudinary,
    params: async () => ({
        folder: process.env.CLOUDINARY_FOLDER || "sparkyhacky",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
    }),
});

export const upload = multer({ storage });
