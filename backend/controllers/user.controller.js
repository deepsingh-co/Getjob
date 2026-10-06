import User from "../models/user.model.js"
import Profile from "../models/profile.model.js"

export const getCurrentUser = async (req , res) =>{
    try{
        const userId = req.userId
        const user = await User.findById(userId)
        if(!user){
            return res.status(404).json({message: "User not found"})
        }
        return res.status(200).json( user)
    }catch(error){  
        return res.status(500).json({message: `Failed to get current user ${error}`})
}
}

export const getProfile = async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.userId }).populate("user", "name email")
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" })
        }
        return res.status(200).json(profile)
    } catch (error) {
        return res.status(500).json({ message: `Failed to get profile ${error.message}` })
    }
}

export const upsertCompanyProfile = async (req, res) => {
    try {
        const { companyName, website, about } = req.body

        if (!companyName) {
            return res.status(400).json({ message: "companyName is required" })
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            {
                $set: {
                    role: "company",
                    companyName,
                    website: website || "",
                    about: about || ""
                }
            },
            { new: true, select: "-__v" }
        )

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({ message: `Failed to save company profile ${error.message}` })
    }
}

export const upsertProfile = async (req, res) => {
    try {
        const { phone, headline, skills, experienceYears, education, location, summary, openToWork } = req.body

        if (!phone) {
            return res.status(400).json({ message: "phone is required for interview calls" })
        }

        const profile = await Profile.findOneAndUpdate(
            { user: req.userId },
            {
                $set: {
                    phone,
                    headline: headline || "",
                    skills: Array.isArray(skills)
                        ? skills
                        : String(skills || "").split(",").map((skill) => skill.trim()).filter(Boolean),
                    experienceYears: Number(experienceYears) || 0,
                    education: education || "any",
                    location: location || "",
                    summary: summary || "",
                    openToWork: openToWork !== false,
                    user: req.userId
                }
            },
            { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
        )

        return res.status(200).json(profile)
    } catch (error) {
        return res.status(500).json({ message: `Failed to save profile ${error.message}` })
    }
}
