import genToken from "../config/token.js"
import User from "../models/user.model.js";

export const googleAuth = async (req, res) => {
    try {
        const { email, name } = req.body;
        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({ email, name });
        }
        let token = await genToken(user._id);
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        });
         return res.status(200).json({ message: "User authenticated successfully", user });

    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const logout =async (req, res) => {
    try {
         await res.clearCookie("token")
         return res.status(200).json({ message: "User logged out successfully" })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}