const EDUCATION_LEVELS = {
    any: 0,
    high_school: 1,
    bachelors: 2,
    masters: 3,
    phd: 4
};

const SKILL_WEIGHT = 60;
const EXPERIENCE_WEIGHT = 25;
const EDUCATION_WEIGHT = 10;
const LOCATION_WEIGHT = 5;

const normalize = (value = "") => String(value).trim().toLowerCase();

export const matchProfileToJob = (job, profile) => {
    const jobSkills = (job.skills || []).map(normalize).filter(Boolean);
    const profileSkills = new Set((profile.skills || []).map(normalize).filter(Boolean));

    const matchedSkills = [];
    const missingSkills = [];

    jobSkills.forEach((skill) => {
        if (profileSkills.has(skill)) {
            matchedSkills.push(skill);
        } else {
            missingSkills.push(skill);
        }
    });

    const skillScore = jobSkills.length === 0
        ? SKILL_WEIGHT
        : (matchedSkills.length / jobSkills.length) * SKILL_WEIGHT;

    const requiredExperience = job.experienceYears || 0;
    const actualExperience = profile.experienceYears || 0;
    let experienceScore = 0;
    if (requiredExperience === 0) {
        experienceScore = EXPERIENCE_WEIGHT;
    } else if (actualExperience >= requiredExperience) {
        experienceScore = EXPERIENCE_WEIGHT;
    } else {
        experienceScore = (actualExperience / requiredExperience) * EXPERIENCE_WEIGHT;
    }

    const requiredEducation = EDUCATION_LEVELS[job.education || "any"] ?? 0;
    const actualEducation = EDUCATION_LEVELS[profile.education || "any"] ?? 0;
    let educationScore = 0;
    if (requiredEducation === 0) {
        educationScore = EDUCATION_WEIGHT;
    } else if (actualEducation >= requiredEducation) {
        educationScore = EDUCATION_WEIGHT;
    } else {
        educationScore = (actualEducation / requiredEducation) * EDUCATION_WEIGHT;
    }

    let locationScore = LOCATION_WEIGHT;
    if (job.location && profile.location) {
        locationScore = normalize(job.location) === normalize(profile.location)
            ? LOCATION_WEIGHT
            : LOCATION_WEIGHT * 0.3;
    }

    const score = Math.round(skillScore + experienceScore + educationScore + locationScore);

    return {
        score,
        matchedSkills,
        missingSkills
    };
};

export const findMatches = (job, profiles) => {
    const threshold = job.matchThreshold ?? 50;

    return profiles
        .map((profile) => {
            const result = matchProfileToJob(job, profile);
            return { profile, ...result };
        })
        .filter((entry) => entry.score >= threshold)
        .sort((a, b) => b.score - a.score);
};

export default findMatches;
