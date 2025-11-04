const express = require('express');
const handler = require('./dist/api/lingo').default;

const app = express();
const port = process.env.PORT || 3000;

app.get('/api/lingo', async (req, res) => {
  await handler(req, res);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
