const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3737;
const CLASSROOM_DIR = path.resolve(__dirname, '../../classroom');

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Serve the HTML interface
  if (url.pathname === '/' || url.pathname === '/index.html') {
    const html = fs.readFileSync(path.join(__dirname, 'classroom-browser.html'), 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    return res.end(html);
  }

  // API: return full classroom file tree as JSON
  if (url.pathname === '/api/tree') {
    try {
      const tree = buildTree(CLASSROOM_DIR);
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      return res.end(JSON.stringify(tree));
    } catch (e) {
      res.writeHead(500);
      return res.end(JSON.stringify({ error: e.message }));
    }
  }

  // API: return file contents
  if (url.pathname === '/api/file') {
    const filePath = url.searchParams.get('path');
    if (!filePath) { res.writeHead(400); return res.end('Missing path'); }

    const abs = path.resolve(CLASSROOM_DIR, filePath);

    // Security: ensure path stays inside classroom dir
    if (!abs.startsWith(CLASSROOM_DIR)) {
      res.writeHead(403);
      return res.end('Forbidden');
    }

    try {
      const content = fs.readFileSync(abs, 'utf8');
      res.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      });
      return res.end(content);
    } catch (e) {
      res.writeHead(404);
      return res.end('Not found');
    }
  }

  res.writeHead(404);
  res.end('Not found');
});

function buildTree(dir, relativeTo = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const result = [];

  // Folders first, then files, both alphabetical
  entries.sort((a, b) => {
    if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const abs = path.join(dir, entry.name);
    const rel = path.relative(relativeTo, abs);

    if (entry.isDirectory()) {
      result.push({
        type: 'dir',
        name: entry.name,
        path: rel,
        children: buildTree(abs, relativeTo)
      });
    } else if (entry.name.endsWith('.md')) {
      result.push({
        type: 'file',
        name: entry.name,
        path: rel
      });
    }
  }

  return result;
}

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n  Classroom Browser running at ${url}\n`);
  // Auto-open in default browser
  const { exec } = require('child_process');
  exec(`open ${url}`);
});
