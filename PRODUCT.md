# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Anyone who needs to transfer text, links, or files between their own devices — typically between a phone and a PC — without relying on cloud services, cables, or platform-specific tools like AirDrop or Nearby Share. No technical skill required.

## Product Purpose

Ledger makes cross-device clipboard and file transfer instant, encrypted, and browser-based. Users create a short-lived session on their PC, scan or enter a code on their phone, and relay content in real time over an encrypted WebSocket connection. The server acts as a pure relay — it never reads payloads. Success means a user can move a link, snippet, or file between devices in under 10 seconds, with zero install on the sending side and confidence that the content is private.

## Positioning

End-to-end encrypted, zero-knowledge relay that works entirely in the browser — no native app install required on either device. Sessions are ephemeral, expire automatically, and the server never has access to decrypted content. Unlike AirDrop/Nearby Share, it is cross-platform and works across networks; unlike Pushbullet or cloud sync, it stores nothing.

## Operating Context

- A user opens Ledger on their PC browser, authenticates, and creates a session (generates an 8-character hex session code and a 256-bit encryption key).
- On their phone (or second device), they open Ledger's mobile-optimized web view, authenticate or use a session token, and enter/scan the session code.
- Once paired, content flows in real time via Socket.IO: clipboard text, links, and files.
- Sessions have a configurable time limit (default 5 minutes) and are stored in Redis for TTL enforcement plus MongoDB for audit/history.
- "Fastlane" mode provides a lighter-weight channel for quick clipboard and file sends.

## Capabilities and Constraints

### Confirmed capabilities
- User authentication with JWT (access + refresh tokens), bcrypt password hashing
- Session creation, pairing, and lifecycle management (active → paired → ended)
- Real-time clipboard relay (encrypted payload, server never reads)
- Fastlane mode for quick clipboard and file transfer
- Role-based socket connections (sender vs. receiver)
- Redis for session TTL, MongoDB (Mongoose) for persistence
- Spaces (user-owned data containers — purpose undecided)

### Technical stack
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Backend:** Express 5, Socket.IO, Mongoose 9 (MongoDB), Redis 6, JWT auth
- **Infra:** Node.js, nodemon for dev

### Undecided
- File size limits and transfer chunking strategy
- Whether "Spaces" will evolve into a persistent clipboard history, a workspace concept, or something else
- Mobile app vs. PWA vs. browser-only for the phone side

## Evidence on Hand

No marketing copy, testimonials, case studies, or press. No logo or brand assets beyond the project name "Ledger." The frontend is currently the default Next.js scaffold — no custom UI has been built yet.

## Product Principles

1. **Privacy by architecture** — The server is a relay, never a reader. Encryption keys never leave the session participants.
2. **Friction-free pairing** — A session code and a browser are all you need. No installs, no accounts on the second device.
3. **Ephemeral by default** — Sessions expire. Nothing persists unless explicitly saved. The user is in control of the data lifecycle.
4. **Cross-platform without compromise** — Works on any device with a modern browser, regardless of OS or network.
5. **Speed over ceremony** — Moving content between devices should take seconds, not workflows.
