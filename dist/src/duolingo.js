"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.duolingo = void 0;
exports.translateXpToLevels = translateXpToLevels;
exports.addLevelToCourses = addLevelToCourses;
exports.translateAchievements = translateAchievements;
exports.getRawData = getRawData;
exports.getProcessedData = getProcessedData;
exports.getDataByFields = getDataByFields;
exports.fetchDuolingoProfile = fetchDuolingoProfile;
const node_fetch_1 = __importDefault(require("node-fetch"));
/**
 * Simple in-memory cache to avoid hitting Duolingo on every request.
 * Note: Vercel serverless instances are ephemeral — cache lives per instance/process.
 */
const CACHE = new Map();
const DEFAULT_TTL = 60 * 30 * 1000; // 30 minutes
function isStale(entryTs, ttl = DEFAULT_TTL) {
    return Date.now() - entryTs > ttl;
}
/**
 * Identifies which level based on xp.
 */
function translateXpToLevels(xp) {
    const xpNum = typeof xp === 'string' ? parseInt(xp, 10) : xp;
    if (xpNum < 0)
        return 0;
    // Duolingo levels: each level requires 100 XP more than the previous
    // Level 1: 0-99 XP, Level 2: 100-299 XP, etc.
    // Formula: level = floor((sqrt(1 + 8*xp/100) - 1)/2) + 1
    const level = Math.floor((Math.sqrt(1 + 8 * xpNum / 100) - 1) / 2) + 1;
    return Math.max(1, level);
}
/**
 * Adds a "level" property to a list of objects, as long as "xp" field is present.
 */
function addLevelToCourses(courses) {
    return courses.map(course => ({
        ...course,
        level: course.xp !== undefined ? translateXpToLevels(course.xp) : undefined
    }));
}
/**
 * Adds a "displayName" property to a list of objects, as long as "name" field is present.
 */
function translateAchievements(achievements) {
    return achievements.map(achievement => ({
        ...achievement,
        displayName: achievement.name ? achievement.name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : undefined
    }));
}
/**
 * Gets raw metadata from duolingo. No pre/post-processing
 */
async function getRawData(username) {
    return await fetchDuolingoProfile(username);
}
/**
 * Gets processed metadata from duolingo. Post-processing of adding display name for achievements,
 * Adding level for each course and adding total level based on XP.
 */
async function getProcessedData(username) {
    const profile = await fetchDuolingoProfile(username);
    const processedProfile = {
        ...profile,
        courses: profile.courses ? addLevelToCourses(profile.courses) : [],
        totalLevel: translateXpToLevels(profile.totalXp || 0),
        achievements: profile.achievements ? translateAchievements(profile.achievements) : []
    };
    return processedProfile;
}
/**
 * Gets selected fields metadata
 */
async function getDataByFields(username, fields) {
    const profile = await fetchDuolingoProfile(username);
    const result = {};
    fields.forEach(field => {
        if (profile.hasOwnProperty(field)) {
            result[field] = profile[field];
        }
    });
    return result;
}
exports.duolingo = {
    getRawData,
    getProcessedData,
    getDataByFields,
    translateXpToLevels,
    addLevelToCourses,
    translateAchievements
};
/**
 * Fetch Duolingo public profile using their public endpoint.
 * Endpoint used: https://www.duolingo.com/2017-06-30/users?username={username}
 */
async function fetchDuolingoProfile(username) {
    const key = `duo:${username.toLowerCase()}`;
    const cached = CACHE.get(key);
    if (cached && !isStale(cached.ts)) {
        return cached.data;
    }
    // endpoint discovered in community projects and public traffic analysis
    const endpoint = `https://www.duolingo.com/2017-06-30/users?username=${encodeURIComponent(username)}`;
    // DUO servers may require a common user-agent
    const resp = await (0, node_fetch_1.default)(endpoint, {
        headers: {
            'User-Agent': 'lingo-readme-stats/1.0 (+https://github.com/livrasand/lingo-readme-stats)',
            Accept: 'application/json'
        },
        // timeout not built into node-fetch v2; keep simple
    });
    if (!resp.ok) {
        throw new Error(`Duolingo responded with ${resp.status} ${resp.statusText}`);
    }
    const json = await resp.json();
    // The unauth response may return either an array or an object. Normalize.
    // Common structure: { users: [...] } or it's directly an object; check and adapt.
    let raw = json;
    // some endpoints return { users: [ ... ] }
    if (Array.isArray(json) && json.length > 0) {
        raw = json[0];
    }
    else if (json && json.users && Array.isArray(json.users) && json.users.length > 0) {
        raw = json.users[0];
    }
    // Map fields we care about
    const id = raw?.id ?? raw?.user_id ?? raw?.username ?? username;
    const pictureRaw = raw?.picture ?? raw?.avatar;
    let picture;
    if (pictureRaw) {
        if (pictureRaw.startsWith('http')) {
            picture = pictureRaw;
        }
        else if (pictureRaw.startsWith('//')) {
            picture = 'https:' + pictureRaw + '/large';
        }
        else {
            picture = `https://simg-ssl.duolingo.com/ssr-avatars/${id}/${pictureRaw}/large`;
        }
    }
    const profile = {
        id: id,
        username: raw?.username ?? username,
        name: raw?.name ?? raw?.fullname ?? raw?.display_name ?? raw?.username ?? username,
        totalXp: parseInt(raw?.totalXp ?? raw?.total_xp ?? raw?.stats?.totalXp ?? raw?.total_xp ?? 0, 10) || 0,
        learningLanguage: raw?.learningLanguage ?? raw?.learning_language ?? raw?.language,
        picture: picture,
        streak: raw?.streakData?.currentStreak?.length ?? raw?.streakData?.currentStreak ?? raw?.streak ?? raw?.streak_extended ?? raw?.site_streak ?? raw?.streak_count ?? 0,
        courses: raw?.courses ?? raw?.language_details ?? [],
        // keep raw object for advanced fields if needed:
        _raw: raw
    };
    CACHE.set(key, { ts: Date.now(), data: profile });
    return profile;
}
