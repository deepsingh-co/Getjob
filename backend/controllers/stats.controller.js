import User from "../models/user.model.js";
import Job from "../models/job.model.js";
import Interview from "../models/interview.model.js";

export const getPublicStats = async (req, res) => {
    try {
        const [candidates, jobs, matches, confirmed] = await Promise.all([
            User.countDocuments({ role: "candidate" }),
            Job.countDocuments(),
            Interview.countDocuments(),
            Interview.countDocuments({ status: { $in: ["hr_confirmed", "candidate_called"] } })
        ]);

        return res.status(200).json({ candidates, jobs, matches, confirmed });
    } catch (error) {
        return res.status(500).json({ message: `Failed to get stats ${error.message}` });
    }
};
