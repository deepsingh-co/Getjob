import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import multer from "multer";
import Work from "../models/work.model.js";
import User from "../models/user.model.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadDir = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path.extname(file.originalname).toLowerCase()}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (/^image\/(png|jpe?g|webp|gif)$/.test(file.mimetype)) {
        return cb(null, true);
    }
    cb(new Error("Only image files (png, jpg, webp, gif) are allowed"));
};

const uploader = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

export const uploadWorkImage = (req, res, next) => {
    uploader.single("image")(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
};

const parseTags = (tags) => {
    if (Array.isArray(tags)) return tags;
    return String(tags || "").split(",").map((tag) => tag.trim()).filter(Boolean);
};

const publicUrl = (file) => (file ? `/uploads/${file.filename}` : "");

const removeFile = (imageUrl) => {
    if (!imageUrl || !imageUrl.startsWith("/uploads/")) return;
    const filePath = path.join(uploadDir, path.basename(imageUrl));
    fs.unlink(filePath, () => { });
};

export const createWork = async (req, res) => {
    try {
        const { title, description, category, link, tags } = req.body;

        if (!title) {
            return res.status(400).json({ message: "title is required" });
        }

        const user = await User.findById(req.userId);

        const work = await Work.create({
            title,
            description: description || "",
            category: category || "project",
            link: link || "",
            tags: parseTags(tags),
            image: publicUrl(req.file),
            companyName: user?.companyName || "",
            uploadedBy: req.userId
        });

        return res.status(201).json(work);
    } catch (error) {
        return res.status(500).json({ message: `Failed to upload work ${error.message}` });
    }
};

export const getMyWorks = async (req, res) => {
    try {
        const works = await Work.find({ uploadedBy: req.userId }).sort({ createdAt: -1 });
        return res.status(200).json(works);
    } catch (error) {
        return res.status(500).json({ message: `Failed to get works ${error.message}` });
    }
};

export const getAllWorks = async (req, res) => {
    try {
        const works = await Work.find({ status: "published" })
            .populate("uploadedBy", "name companyName")
            .sort({ createdAt: -1 })
            .limit(24);
        return res.status(200).json(works);
    } catch (error) {
        return res.status(500).json({ message: `Failed to get works ${error.message}` });
    }
};

export const updateWork = async (req, res) => {
    try {
        const work = await Work.findOne({ _id: req.params.id, uploadedBy: req.userId });
        if (!work) {
            return res.status(404).json({ message: "Work not found" });
        }

        const { title, description, category, link, tags, status } = req.body;
        if (title) work.title = title;
        if (description !== undefined) work.description = description;
        if (category) work.category = category;
        if (link !== undefined) work.link = link;
        if (tags !== undefined) work.tags = parseTags(tags);
        if (status) work.status = status;

        if (req.file) {
            removeFile(work.image);
            work.image = publicUrl(req.file);
        }

        await work.save();
        return res.status(200).json(work);
    } catch (error) {
        return res.status(500).json({ message: `Failed to update work ${error.message}` });
    }
};

export const deleteWork = async (req, res) => {
    try {
        const work = await Work.findOne({ _id: req.params.id, uploadedBy: req.userId });
        if (!work) {
            return res.status(404).json({ message: "Work not found" });
        }

        removeFile(work.image);
        await work.deleteOne();

        return res.status(200).json({ message: "Work deleted" });
    } catch (error) {
        return res.status(500).json({ message: `Failed to delete work ${error.message}` });
    }
};
