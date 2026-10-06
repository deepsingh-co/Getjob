import mongoose from "mongoose";

const workSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    category: {
        type: String,
        enum: ["project", "product", "case_study", "achievement", "other"],
        default: "project"
    },
    link: {
        type: String,
        default: ""
    },
    tags: [{
        type: String
    }],
    image: {
        type: String,
        default: ""
    },
    companyName: {
        type: String,
        default: ""
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["draft", "published"],
        default: "published"
    }
}, { timestamps: true });

const Work = mongoose.model("Work", workSchema);

export default Work;
