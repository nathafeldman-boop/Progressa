import { test } from "node:test";
import assert from "node:assert/strict";
import { detectInAppBrowser } from "../lib/in-app-browser";

const TIKTOK_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) musical_ly_2024 BytedanceWebview/d8a21c6";
const INSTAGRAM_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 302.0.0.23.114";
const FACEBOOK_UA =
  "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/122.0.0.0 Mobile Safari/537.36 [FBAN/FB4A;FBAV/450.0.0.0]";
const REGULAR_CHROME_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1";

test("detects TikTok's in-app webview", () => {
  const result = detectInAppBrowser(TIKTOK_UA);
  assert.equal(result.detected, true);
  assert.equal(result.appLabel, "TikTok");
});

test("detects Instagram's in-app webview", () => {
  const result = detectInAppBrowser(INSTAGRAM_UA);
  assert.equal(result.detected, true);
  assert.equal(result.appLabel, "Instagram");
});

test("detects Facebook's in-app webview", () => {
  const result = detectInAppBrowser(FACEBOOK_UA);
  assert.equal(result.detected, true);
  assert.equal(result.appLabel, "Facebook");
});

test("a regular mobile Safari user agent is never flagged", () => {
  const result = detectInAppBrowser(REGULAR_CHROME_UA);
  assert.equal(result.detected, false);
  assert.equal(result.appLabel, null);
});

test("a missing user agent is never flagged", () => {
  assert.equal(detectInAppBrowser(null).detected, false);
  assert.equal(detectInAppBrowser(undefined).detected, false);
});
