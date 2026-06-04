import http from 'http';
import querystring from 'querystring';

function parseSetCookie(setCookieHeaders) {
  const cookies = {};
  if (!setCookieHeaders) return cookies;
  setCookieHeaders.forEach(h => {
    const [pair] = h.split(';');
    const idx = pair.indexOf('=');
    const name = pair.substring(0, idx);
    const val = pair.substring(idx + 1);
    cookies[name] = val;
  });
  return cookies;
}

function get(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'localhost',
      port: 8000,
      path,
      method: 'GET',
      headers,
    };
    const req = http.request(opts, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        resolve({ res, body: Buffer.concat(chunks).toString() });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function postForm(path, form, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = Object.keys(form).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(form[k])}`).join('&');
    const opts = {
      hostname: 'localhost',
      port: 8000,
      path,
      method: 'POST',
      headers: Object.assign({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
      }, headers),
    };

    const req = http.request(opts, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ res, body: Buffer.concat(chunks).toString() }));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

(async () => {
  try {
    console.log('GET /sanctum/csrf-cookie');
    const first = await get('/sanctum/csrf-cookie');
    const setCookie = first.res.headers['set-cookie'] || [];
    console.log('set-cookie headers:', setCookie);
    const cookies = parseSetCookie(setCookie);
    console.log('parsed cookies:', cookies);
    const xsrf = cookies['XSRF-TOKEN'];
    const laravel = cookies['laravel_session'];
    const decodedXsrf = xsrf ? decodeURIComponent(xsrf) : null;
    console.log('decoded XSRF-TOKEN:', decodedXsrf ? decodedXsrf.substring(0, 40) + '...' : null);

    const cookieHeader = Object.entries(cookies).map(([k,v]) => `${k}=${v}`).join('; ');

    console.log('POST /api/v1/login');
    const post = await postForm('/api/v1/login', { email: 'admin@clothify.test', password: 'Ch@ng3M3N0w!2025' }, {
      'Cookie': cookieHeader,
      ...(decodedXsrf ? { 'X-XSRF-TOKEN': decodedXsrf } : {}),
      'Accept': 'application/json'
    });

    console.log('statusCode:', post.res.statusCode);
    console.log('response headers:', post.res.headers);
    console.log('body:', post.body);
    // If server set new cookies on login, use them to GET /dashboard
    const postSetCookie = post.res.headers['set-cookie'] || [];
    if (postSetCookie.length) {
      const newCookies = parseSetCookie(postSetCookie);
      const cookieHeader2 = Object.entries(newCookies).map(([k,v]) => `${k}=${v}`).join('; ');
      console.log('GET /dashboard using login cookies');
      const dash = await get('/dashboard', { Cookie: cookieHeader2 });
      console.log('dashboard status:', dash.res.statusCode);
      console.log('dashboard headers:', dash.res.headers['content-type']);
      console.log('dashboard body snippet:', dash.body.substring(0, 240));
    }
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  }
})();
