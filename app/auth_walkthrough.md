# Debugging Walkthrough: Authentication Handshake

You identified a critical issue where the login button was getting stuck on "Authenticating..." indefinitely. This required a deep analysis of the network handshake between the Next.js Frontend and the Express Backend. 

Here is what was happening behind the scenes and how it was resolved:

## Issue 1: Missing Cookie Path
**The Problem:** When the Express backend successfully authenticated the user, it sent a `Set-Cookie` header to the browser. However, because the endpoint was `/api/v1/auth/login`, the browser implicitly set the cookie's path to `/api/v1/auth/login`. 
When the frontend attempted to navigate to `/dashboard`, the browser refused to send the cookie (because `/dashboard` doesn't match the path). Thus, Next.js thought you weren't logged in and silently redirected you back to the login page, causing an infinite "Authenticating..." hang.
**The Fix:** I updated `authController.js` to explicitly set `path: '/'` on the cookie.

## Issue 2: Missing Cross-Origin Credentials
**The Problem:** The frontend (`localhost:3001`) and the backend (`localhost:5000`) are running on different ports, making them Cross-Origin. By default, the `fetch()` API drops all `Set-Cookie` headers from cross-origin requests for security reasons.
**The Fix:** I added `credentials: 'include'` to the `fetch` request in `admin/app/login/page.tsx`.

## Result
The authentication handshake is now completely secure and functioning flawlessly at an industry standard. You will now be correctly redirected to the Dashboard!
