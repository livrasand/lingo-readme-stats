"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const duolingo_1 = require("../src/duolingo");
const svg_1 = require("../src/svg");
// Vercel / @vercel/node handlers export default (req, res)
async function handler(req, res) {
    try {
        const q = req.query || {};
        const username = (q.username || q.user || q.u || '').toString().trim();
        const theme = (q.theme || 'default').toString();
        const format = (q.format || '').toString().toLowerCase();
        const cacheSeconds = parseInt((q.cache_seconds || process.env.CACHE_SECONDS || '1800').toString(), 10);
        if (!username) {
            res.status(400).send('Missing "username" query parameter. Example: /api/lingo?username=your_duo_username');
            return;
        }
        // Fetch Duolingo profile (with caching inside)
        const profile = await (0, duolingo_1.fetchDuolingoProfile)(username);
        // If format=json, return raw JSON data
        if (format === 'json') {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('Cache-Control', `public, max-age=${Math.max(0, cacheSeconds)}`);
            return res.status(200).json(profile);
        }
        // Otherwise, render and return SVG
        const svg = await (0, svg_1.renderDuolingoCard)(profile, {
            theme: theme,
            convertToDataUrl: true // Enable data URL conversion for avatars
        });
        res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
        res.setHeader('Cache-Control', `public, max-age=${Math.max(0, cacheSeconds)}`);
    }
    catch (err) {
        console.error('API error', err);
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.status(500).send(`Error fetching Duolingo data: ${err?.message || String(err)}`);
    }
}
