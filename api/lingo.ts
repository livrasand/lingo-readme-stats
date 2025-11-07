import fetch from 'node-fetch';
import { IncomingMessage, ServerResponse } from 'http';
import { fetchDuolingoProfile } from '../src/duolingo';
import { renderDuolingoCard } from '../src/svg';
import { Themes } from '../src/themes';

// Vercel / @vercel/node handlers export default (req, res)
export default async function handler(req: any, res: any) {
  try {
    const q = req.query || {};
    const username = (q.username || q.user || q.u || '').toString().trim();
    const theme = (q.theme || 'default').toString();
    const format = (q.format || '').toString().toLowerCase();
    const cacheSeconds = parseInt((q.cache_seconds || process.env.CACHE_SECONDS || '1800').toString(), 10);
    const followBtn = (q.follow_btn || '').toString().toLowerCase() === 'true';
    const showDescription = (q.show_description || '').toString().toLowerCase() === 'true';
    const name = q.name ? q.name.toString() : undefined;

    if (!username) {
      res.status(400).send('Missing "username" query parameter. Example: /api/lingo?username=your_duo_username');
      return;
    }

    // Fetch Duolingo profile (with caching inside)
    const profile = await fetchDuolingoProfile(username);

    // If format=json, return raw JSON data
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', `public, max-age=${Math.max(0, cacheSeconds)}`);
      return res.status(200).json(profile);
    }

    // Otherwise, render and return SVG
    const svg = await renderDuolingoCard(profile, {
      theme: theme as keyof Themes,
      convertToDataUrl: false, // Disabled to prevent timeouts
      followBtn: followBtn,
      showDescription: showDescription,
      name: name
    });

    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', `public, max-age=${Math.max(0, cacheSeconds)}`);
    return res.status(200).send(svg);
  } catch (err: any) {
    console.error('API error', err);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(500).send(`Error fetching Duolingo data: ${err?.message || String(err)}`);
  }
}
