const http = require('http');
const fs = require('fs');
const path = require('path');

const rootDirectory = __dirname;
const port = 8080;
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};

function send(response, statusCode, body, type = 'text/plain; charset=utf-8') {
  response.writeHead(statusCode, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  response.end(body);
}

http.createServer((request, response) => {
  let requestedPath;
  try {
    requestedPath = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
  } catch (_) {
    send(response, 400, 'Đường dẫn không hợp lệ.');
    return;
  }

  const relativePath = requestedPath === '/' ? 'index.html' : requestedPath.replace(/^\/+/, '');
  const filePath = path.resolve(rootDirectory, relativePath);
  if (filePath !== rootDirectory && !filePath.startsWith(`${rootDirectory}${path.sep}`)) {
    send(response, 403, 'Không có quyền truy cập.');
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      send(response, 404, 'Không tìm thấy tệp.');
      return;
    }
    const type = mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    response.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
    fs.createReadStream(filePath).on('error', () => send(response, 500, 'Không thể đọc tệp.')).pipe(response);
  });
}).listen(port, () => {
  console.log(`VN/34 đang chạy tại http://localhost:${port}`);
  console.log('Giữ cửa sổ này mở khi đang thử gửi đơn. Nhấn Ctrl+C để dừng.');
});
