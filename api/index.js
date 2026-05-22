// Vercel Node.js Serverless Function — SSR handler for TanStack Start
let _server;
async function getServer() {
  if (!_server) {
    const mod = await import('../dist/server/server.js');
    _server = mod.default;
  }
  return _server;
}

export default async function handler(req, res) {
  const server = await getServer();
  const proto = req.headers['x-forwarded-proto'] ?? 'https';
  const host = req.headers['x-forwarded-host'] ?? req.headers.host ?? 'localhost';
  const url = new URL(req.url, `${proto}://${host}`);

  const fetchReq = new Request(url.toString(), {
    method: req.method,
    headers: req.headers,
  });

  try {
    const fetchRes = await server.fetch(fetchReq, {}, {});
    res.status(fetchRes.status);
    fetchRes.headers.forEach((v, k) => {
      if (k.toLowerCase() !== 'content-encoding') res.setHeader(k, v);
    });
    res.end(Buffer.from(await fetchRes.arrayBuffer()));
  } catch (err) {
    console.error('[SSR]', err);
    res.status(500).end('Internal Server Error');
  }
}
