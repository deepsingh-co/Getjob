import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    credits:{
        type: Number,
        default: 100
    },
    role: {
        type: String,
        enum: ["candidate", "company"],
        default: "candidate"
    },
    companyName: {
        type: String,
        default: ""
    },
    website: {
        type: String,
        default: ""
    },
    about: {
        type: String,
        default: ""
    },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;