const http = require('http');
const { gatherData, generateIndex } = require('./lib');
const fs = require('fs');
const path = require('path');

const style = fs.readFileSync(path.join(__dirname, 'style.css'));

const server = http.createServer((req, res) => {
  if (req.url === '/style.css') {
    res.writeHead(200, { 'Content-Type': 'text/css' });
    res.end(style);
    return;
  }

  const data = gatherData();
  const html = generateIndex(data);
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
