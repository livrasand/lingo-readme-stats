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
    const cacheSeconds = parseInt((q.cache_seconds || process.env.CACHE_SECONDS || '1800').toString(), 10);

    if (!username) {
      res.status(400).send('Missing "username" query parameter. Example: /api/lingo?username=your_duo_username');
      return;
    }

    // Fetch Duolingo profile (with caching inside)
    const profile = await fetchDuolingoProfile(username);

    // render SVG
    const svg = renderDuolingoCard(profile, {
      theme: theme as keyof Themes,
    });

    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    // Cache-Control: public caching, allow override by query param cache_seconds or env CACHE_SECONDS
    res.setHeader('Cache-Control', `public, max-age=${Math.max(0, cacheSeconds)}`);
    res.status(200).send(svg);
  } catch (err: any) {
    console.error('API error', err);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(500).send(`Error fetching Duolingo data: ${err?.message || String(err)}`);
  }
}
