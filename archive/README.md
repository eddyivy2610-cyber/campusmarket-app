# Campus Hive Express Backend Archive (Decommissioned)

## Overview
As part of **Phase 5 (Messaging & Realtime Migration: Stage D Decommissioning)**, the legacy Express + Socket.IO backend service (`campus-hive-backend`) has been formally decommissioned and replaced by canonical Next.js route handlers and the hosted realtime provider layer.

## Remote Repository & Tag
- **Repository**: `https://github.com/eddyivy2610-cyber/campus-hive-backend.git`
- **Pushed Branch**: `main` (commit `bdf5344`)
- **Archival Tag**: `v1.0.0-archived`
- **Local Zip Archive**: [`archive/campus-hive-backend-archived.zip`](./campus-hive-backend-archived.zip)

## Decommissioning Summary
1. **Realtime**: Migrated from Socket.IO to Pusher/Soketi protocol with authenticated private channels (`private-user-[id]`, `private-conversation-[id]`), presence, typing indicators, and reconnect catchup via cursor (`?sinceId=[id]`).
2. **Persistence Guarantee**: All messages strictly persist to MongoDB with `realtimePublished` status prior to triggering realtime provider events.
3. **API Client**: `app/lib/apiClient.ts` configured for relative URLs (`""`) by default in browser environments, directing all client calls to Next.js canonical routes.
4. **Mock Data Cleaned**: Removed development mock reviews and listings; listings and seller profiles strictly source from live collections.
5. **Security**: Centralized on `app/lib/authTokens.ts` and `app/lib/authServer.ts` with HS256 HMAC tokens, cookie security, and participant validation.

## Restoration Instructions (If Needed)
To inspect or restore the legacy service:
```bash
# Option 1: Clone from GitHub
git clone https://github.com/eddyivy2610-cyber/campus-hive-backend.git
cd campus-hive-backend
git checkout v1.0.0-archived

# Option 2: Extract local zip archive
Expand-Archive -Path archive/campus-hive-backend-archived.zip -DestinationPath campus-hive-backend
```
