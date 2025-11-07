# Lingo Readme Stats

A dynamic SVG card generator to display public Duolingo stats in your GitHub README.

## Description

This project creates customizable SVG images showing public Duolingo profile stats like XP, current streak, learned languages, etc. Perfect for GitHub profiles or repos to share language learning progress.

Built in TypeScript using Duolingo's unofficial public API. No authentication required, completely free.

## Features

- Dynamic SVG generation
- Customizable themes
- Hideable fields
- Configurable caching
- Easy deployment on Vercel or Docker

## Usage

The main endpoint is `/api/lingo` with these parameters:

- `username` (required): Duolingo username
- `theme` (optional): Card theme (`default`, `light`, `duo`). Default: `default`
- `hide` (optional): Fields to hide, comma-separated (e.g., `xp,streak,language`)
- `cache_seconds` (optional): Cache-Control header seconds. Default: 1800
- `format` (optional): Set to `json` to get raw JSON data instead of SVG

## Examples

### Default Theme

```markdown
![Duolingo Stats](https://lingo-readme-stats.vercel.app/api/lingo?username=your_username)
```

![Default Theme](https://lingo-readme-stats.vercel.app/api/lingo?username=christi3&theme=default)

### Light Theme

```markdown
![Duolingo Stats](https://lingo-readme-stats.vercel.app/api/lingo?username=your_username&theme=light)
```

![Light Theme](https://lingo-readme-stats.vercel.app/api/lingo?username=christi3&theme=light)

### Duo Theme

```markdown
![Duolingo Stats](https://lingo-readme-stats.vercel.app/api/lingo?username=your_username&theme=duo)
```

![Duo Theme](https://lingo-readme-stats.vercel.app/api/lingo?username=christi3&theme=duo)

### JSON Response

Get raw JSON data by adding `format=json` parameter:

```bash
curl "https://lingo-readme-stats.vercel.app/api/lingo?username=your_username&format=json"
```

Example response:
```json
{
  "id": "12345678",
  "username": "duo_user",
  "name": "Duo User",
  "totalXp": 12345,
  "learningLanguage": "Spanish",
  "picture": "https://...",
  "streak": 42,
  "courses": [
    {
      "title": "Spanish",
      "xp": 10000,
      "level": 15
    }
  ]
}
```

## Copyright

This project is not affiliated with, endorsed by, or approved by Duolingo, Inc. Duolingo is a registered trademark of Duolingo, Inc. All rights reserved to their respective owners. Use at your own risk and comply with Duolingo's terms.

---

Developed by [Livrädo Sandoval](https://github.com/livrasand).
