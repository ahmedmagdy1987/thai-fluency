#!/usr/bin/env node

const ROUTES = [
  { path: '/', type: 'html' },
  { path: '/learn', type: 'html' },
  { path: '/cards', type: 'html' },
  { path: '/challenge', type: 'html' },
  { path: '/shop', type: 'html' },
  { path: '/privacy', type: 'html' },
  { path: '/terms', type: 'html' },
  { path: '/support', type: 'html' },
  { path: '/feedback', type: 'html' },
  { path: '/plans', type: 'html' },
  { path: '/premium', type: 'html' },
  { path: '/delete-account', type: 'html' },
  { path: '/OneSignalSDKWorker.js', type: 'script' },
  { path: '/manifest.webmanifest', type: 'manifest', optional: true },
];

const baseArg = process.argv[2];

if (!baseArg) {
  console.error('Usage: node scripts/smoke-production-routes.mjs https://tuktalkthai.com');
  process.exit(1);
}

let baseUrl;
try {
  baseUrl = new URL(baseArg);
} catch {
  console.error(`Invalid base URL: ${baseArg}`);
  process.exit(1);
}

if (!/^https?:$/.test(baseUrl.protocol)) {
  console.error(`Base URL must start with http:// or https://: ${baseArg}`);
  process.exit(1);
}

function routeUrl(path) {
  return new URL(path, `${baseUrl.origin}/`).toString();
}

function isHtmlFallback(text) {
  return /^\s*<!doctype html/i.test(text) || /^\s*<html/i.test(text);
}

async function checkRoute(route) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const url = routeUrl(route.path);

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': 'tuk-talk-thai-production-smoke/1.0',
        accept: route.type === 'manifest'
          ? 'application/manifest+json, application/json, */*'
          : '*/*',
      },
    });

    const contentType = response.headers.get('content-type') || '';
    const text = await response.text();
    let ok = response.status >= 200 && response.status < 400;
    let detail = '';

    if (route.optional && response.status === 404) {
      ok = true;
      detail = 'optional missing';
    } else if (route.type === 'script' && isHtmlFallback(text)) {
      ok = false;
      detail = 'returned HTML fallback, expected worker script';
    } else if (route.optional && route.type === 'manifest' && isHtmlFallback(text)) {
      ok = true;
      detail = 'optional missing; returned HTML fallback';
    } else if (route.type === 'manifest' && isHtmlFallback(text)) {
      ok = false;
      detail = 'returned HTML fallback, expected manifest';
    }

    return {
      path: route.path,
      status: response.status,
      ok,
      contentType,
      finalUrl: response.url,
      detail,
    };
  } catch (error) {
    return {
      path: route.path,
      status: 'ERR',
      ok: false,
      contentType: '',
      finalUrl: url,
      detail: error.name === 'AbortError'
        ? 'request timed out'
        : (error.message || 'request failed'),
    };
  } finally {
    clearTimeout(timeout);
  }
}

console.log(`Smoke testing ${baseUrl.origin}`);

const results = [];
for (const route of ROUTES) {
  const result = await checkRoute(route);
  results.push(result);

  const status = String(result.status).padEnd(3, ' ');
  const verdict = result.ok ? 'OK  ' : 'FAIL';
  const type = result.contentType ? ` content-type=${result.contentType}` : '';
  const redirected = result.finalUrl !== routeUrl(result.path) ? ` final=${result.finalUrl}` : '';
  const detail = result.detail ? ` ${result.detail}` : '';
  console.log(`${verdict} ${status} ${result.path}${type}${redirected}${detail}`);
}

const failed = results.filter(result => !result.ok);
if (failed.length > 0) {
  console.error(`Smoke test failed: ${failed.length} route(s) did not pass.`);
  process.exit(1);
}

console.log('Smoke test passed.');
