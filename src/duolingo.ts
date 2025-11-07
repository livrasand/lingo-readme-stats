import fetch from 'node-fetch';
import { DuolingoProfile, DuolingoCourse } from './types';

/**
 * Simple in-memory cache to avoid hitting Duolingo on every request.
 * Note: Vercel serverless instances are ephemeral — cache lives per instance/process.
 */
const CACHE = new Map<string, { ts: number; data: DuolingoProfile }>();
const DEFAULT_TTL = 60 * 30 * 1000; // 30 minutes

function isStale(entryTs: number, ttl = DEFAULT_TTL) {
  return Date.now() - entryTs > ttl;
}

/**
 * Identifies which level based on xp.
 */
export function translateXpToLevels(xp: number | string): number {
  const xpNum = typeof xp === 'string' ? parseInt(xp, 10) : xp;
  if (xpNum < 0) return 0;
  // Duolingo levels: each level requires 100 XP more than the previous
  // Level 1: 0-99 XP, Level 2: 100-299 XP, etc.
  // Formula: level = floor((sqrt(1 + 8*xp/100) - 1)/2) + 1
  const level = Math.floor((Math.sqrt(1 + 8 * xpNum / 100) - 1) / 2) + 1;
  return Math.max(1, level);
}

/**
 * Adds a "level" property to a list of objects, as long as "xp" field is present.
 */
export function addLevelToCourses(courses: DuolingoCourse[]): DuolingoCourse[] {
  return courses.map(course => ({
    ...course,
    level: course.xp !== undefined ? translateXpToLevels(course.xp) : undefined
  }));
}

/**
 * Adds a "displayName" property to a list of objects, as long as "name" field is present.
 */
export function translateAchievements(achievements: any[]): any[] {
  return achievements.map(achievement => ({
    ...achievement,
    displayName: achievement.name ? achievement.name.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : undefined
  }));
}

/**
 * Gets raw metadata from duolingo. No pre/post-processing
 */
export async function getRawData(username: string): Promise<DuolingoProfile> {
  return await fetchDuolingoProfile(username);
}

/**
 * Gets processed metadata from duolingo. Post-processing of adding display name for achievements,
 * Adding level for each course and adding total level based on XP.
 */
export async function getProcessedData(username: string): Promise<DuolingoProfile> {
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
export async function getDataByFields(username: string, fields: string[]): Promise<Partial<DuolingoProfile>> {
  const profile = await fetchDuolingoProfile(username);
  const result: Partial<DuolingoProfile> = {};
  fields.forEach(field => {
    if (profile.hasOwnProperty(field)) {
      (result as any)[field] = profile[field as keyof DuolingoProfile];
    }
  });
  return result;
}

export const duolingo = {
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
export async function fetchDuolingoProfile(username: string): Promise<DuolingoProfile> {
  const key = `duo:${username.toLowerCase()}`;

  const cached = CACHE.get(key);
  if (cached && !isStale(cached.ts)) {
    return cached.data;
  }

  // endpoint discovered in community projects and public traffic analysis
  const endpoint = `https://www.duolingo.com/2017-06-30/users?username=${encodeURIComponent(username)}`;

  // DUO servers may require a common user-agent
  const resp = await fetch(endpoint, {
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
  let raw: any = json;
  // some endpoints return { users: [ ... ] }
  if (Array.isArray(json) && json.length > 0) {
    raw = json[0];
  } else if (json && json.users && Array.isArray(json.users) && json.users.length > 0) {
    raw = json.users[0];
  }

  // Map fields we care about
  const id = raw?.id ?? raw?.user_id ?? raw?.username ?? username;
  const pictureRaw = raw?.picture ?? raw?.avatar;
  let picture: string | undefined;
  if (pictureRaw) {
    if (pictureRaw.startsWith('http')) {
      picture = pictureRaw;
    } else if (pictureRaw.startsWith('//')) {
      picture = 'https:' + pictureRaw + '/large';
    } else {
      picture = `https://simg-ssl.duolingo.com/ssr-avatars/${id}/${pictureRaw}/large`;
    }
  }

  const profile: DuolingoProfile = {
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
