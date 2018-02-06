const http = require('http');
const fs = require('fs');
const path = require('path');
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.map': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.svg': 'application/image/svg+xml'
};
const app = http.createServer((req, res) => {
    const filePath = path.join(process.env.FRONT_END_DIR, req.url === '/' ? '/index.html' : req.url);
    const contentType = mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    fs.readFile(filePath, (error, content) => {
        if (error) {
            const status = error.code === 'ENOENT' ? 404 : 500;
            res.writeHead(status, {'Content-Type': 'text/plain'});
            res.end(status.toString());
        } else {
            res.writeHead(200, {'Content-Type': contentType});
            res.end(content, 'utf-8');
        }
    });
});

module.exports = app;
