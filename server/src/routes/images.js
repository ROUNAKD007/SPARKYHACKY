import express from "express";
import cloudinary from "../cloudinary.js";
import { upload } from "../upload.js";

const router = express.Router();

/**
 * POST /api/images/upload
 * form-data: image=<file>
 */
router.post("/upload", upload.single("image"), (req, res) => {
    if (!req.file?.path) {
        return res.status(400).json({ error: "Upload failed (no file path)" });
    }
    return res.json({ url: req.file.path });
});

/**
 * GET /api/images
 * returns: [secure_url...]
 */
router.get("/", async (req, res) => {
    try {
        const folder = process.env.CLOUDINARY_FOLDER || "sparkyhacky";
        const result = await cloudinary.search
            .expression(`folder:${folder}`)
            .sort_by("created_at", "desc")
            .max_results(90)
            .execute();

        const urls = (result.resources || []).map((r) => r.secure_url);
        return res.json(urls);
    } catch (err) {
        console.error("Cloudinary fetch error:", err);
        return res.status(500).json({ error: "Failed to fetch images" });
    }
});

export default router;
