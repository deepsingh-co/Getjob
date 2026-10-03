import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    headline: {
        type: String,
        default: ""
    },
    skills: [{
        type: String
    }],
    experienceYears: {
        type: Number,
        default: 0
    },
    education: {
        type: String,
        enum: ["any", "high_school", "bachelors", "masters", "phd"],
        default: "any"
    },
    location: {
        type: String,
        default: ""
    },
    summary: {
        type: String,
        default: ""
    },
    openToWork: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Profile = mongoose.model("Profile", profileSchema);

export default Profile;
