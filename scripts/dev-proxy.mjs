/**
 * Dev proxy "satu origin" untuk monorepo BacaYuk.
 *
 * Berdiri di port 8081 dan memisahkan dua aplikasi web:
 *   - /admin/*  ->  Portal Admin      (Vite dev server, port 5173)
 *   - /*        ->  Aplikasi Siswa    (Expo web dev server, port 8082)
 *
 * Contoh:
 *   http://localhost:8081/           -> aplikasi siswa
 *   http://localhost:8081/admin/login-> login admin
 *   http://localhost:8081/admin      -> dashboard admin
 *
 * WebSocket (HMR milik Vite maupun Expo) ikut diteruskan.
 * Tanpa dependensi eksternal — hanya modul bawaan Node.
 */

import http from 'node:http';

const HOST = 'localhost';
const PORT = Number(process.env.PROXY_PORT ?? 8081);
const ADMIN_PORT = Number(process.env.ADMIN_PORT ?? 5173);
const STUDENT_PORT = Number(process.env.STUDENT_PORT ?? 8082);
const SERVER_PORT = Number(process.env.SERVER_PORT ?? 5000);
const ADMIN_PREFIX = '/admin';
const API_PREFIX = '/api';

const isApiRequest = (url = '/') =>
  url === API_PREFIX ||
  url.startsWith(`${API_PREFIX}/`) ||
  url.startsWith(`${API_PREFIX}?`);

const isAdminRequest = (url = '/') =>
  url === ADMIN_PREFIX ||
  url.startsWith(`${ADMIN_PREFIX}/`) ||
  url.startsWith(`${ADMIN_PREFIX}?`);

const targetPort = (url) => {
  if (isApiRequest(url)) return SERVER_PORT;
  if (isAdminRequest(url)) return ADMIN_PORT;
  return STUDENT_PORT;
};

const targetName = (url) => {
  if (isApiRequest(url)) return 'backend API server';
  if (isAdminRequest(url)) return 'portal admin';
  return 'aplikasi siswa';
};

/**
 * Vite dengan base '/admin/' hanya menyajikan index di '/admin/' (dengan slash),
 * sehingga '/admin' akan 404. Kita tulis ulang path secara internal agar URL di
 * browser tetap persis '/admin' (tanpa redirect, tanpa reload).
 */
const forwardPath = (url = '/') => {
  if (!isAdminRequest(url)) return url;
  const queryIndex = url.indexOf('?');
  const path = queryIndex === -1 ? url : url.slice(0, queryIndex);
  const query = queryIndex === -1 ? '' : url.slice(queryIndex);
  return path === ADMIN_PREFIX ? `${ADMIN_PREFIX}/${query}` : url;
};

/* ----------------------------- HTTP proxy ----------------------------- */

const server = http.createServer((req, res) => {
  const port = targetPort(req.url);

  const proxyReq = http.request(
    {
      host: HOST,
      port,
      method: req.method,
      path: forwardPath(req.url),
      headers: { ...req.headers, host: `${HOST}:${port}` },
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
      proxyRes.pipe(res);
    },
  );

  proxyReq.on('error', (err) => {
    if (res.headersSent) {
      res.end();
      return;
    }
    res.writeHead(502, { 'content-type': 'text/html; charset=utf-8' });
    res.end(
      `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="2">
  <title>Menghubungkan ke BacaYuk...</title>
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; background: #f5efe3; color: #3b1710; text-align: center; }
    .card { max-width: 480px; margin: 70px auto; background: #ffffff; padding: 36px 28px; border-radius: 20px; box-shadow: 0 8px 30px rgba(59,23,16,0.08); border: 1px solid #ebdcb8; }
    .spinner { width: 40px; height: 40px; border: 4px solid #ebdcb8; border-top-color: #a8823a; border-radius: 50%; animation: spin 0.9s linear infinite; margin: 0 auto 20px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    h2 { margin: 0 0 8px; font-size: 20px; color: #3b1710; }
    p { color: #7a6a5a; font-size: 14px; margin: 0 0 16px; line-height: 1.5; }
    .badge { display: inline-block; padding: 4px 12px; background: #fbf7ef; color: #a8823a; border-radius: 999px; font-size: 12px; font-weight: bold; border: 1px solid #ebdcb8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <h2>Menghubungkan ke ${targetName(req.url)}...</h2>
    <p>Aplikasi sedang booting di latar belakang. Halaman ini akan <b>otomatis terbuka</b> dalam 2 detik begitu layanan siap.</p>
    <div class="badge">Menunggu port ${port}</div>
  </div>
</body>
</html>`,
    );
  });

  req.pipe(proxyReq);
});

/* --------------------------- WebSocket (HMR) --------------------------- */

server.on('upgrade', (req, socket, head) => {
  socket.on('error', () => {});

  const port = targetPort(req.url);

  const proxyReq = http.request({
    host: HOST,
    port,
    method: req.method,
    path: req.url,
    headers: { ...req.headers, host: `${HOST}:${port}` },
  });

  proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
    const headerLines = Object.entries(proxyRes.headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\r\n');

    try {
      socket.write(
        `HTTP/1.1 101 Switching Protocols\r\n${headerLines}\r\n\r\n`,
      );
    } catch {
      try { proxySocket.destroy(); } catch {}
      return;
    }

    if (proxyHead?.length) {
      try { proxySocket.unshift(proxyHead); } catch {}
    }
    proxySocket.on('error', () => {
      try { socket.destroy(); } catch {}
    });
    socket.on('error', () => {
      try { proxySocket.destroy(); } catch {}
    });
    proxySocket.pipe(socket).pipe(proxySocket);
  });

  proxyReq.on('error', () => {
    try { socket.destroy(); } catch {}
  });
  if (head?.length) {
    try { proxyReq.write(head); } catch {}
  }
  proxyReq.end();
});

/* -------------------------------- Start -------------------------------- */

server.listen(PORT, () => {
  console.log(`\n  BacaYuk dev proxy  ->  http://localhost:${PORT}`);
  console.log(`    ${ADMIN_PREFIX}/*   ->  portal admin    (127.0.0.1:${ADMIN_PORT})`);
  console.log(`    ${API_PREFIX}/*     ->  backend API     (127.0.0.1:${SERVER_PORT})`);
  console.log(`    /*         ->  aplikasi siswa  (127.0.0.1:${STUDENT_PORT})\n`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}
