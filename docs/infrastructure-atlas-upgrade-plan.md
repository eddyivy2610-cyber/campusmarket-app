# Infrastructure & Atlas Production Upgrade Plan

## 1. Executive Summary & Production Topology

CampusHive utilizes a hybrid architecture:
- **Compute Layer**: Next.js 14 App Router deployed as Serverless Functions on Vercel.
- **Data Layer**: MongoDB Atlas replica set with WiredTiger storage engine.
- **Blob / Media Storage**: Cloudinary with dual authorization modes (public edge delivery + signed private business documents).
- **Edge Caching**: Vercel Edge Network CDN with partitioned `s-maxage=60, stale-while-revalidate=300` cache for anonymous traffic, with strict `private, no-cache, no-store` isolation for authenticated requests.

```mermaid
flowchart TD
    Client["Clients (Web & Mobile Browser)"]
    Edge["Vercel Edge Network (dub1)"]
    Lambda["Serverless Functions (dub1)"]
    Atlas["MongoDB Atlas M10+ (AWS eu-west-1)"]
    Cloudinary["Cloudinary Object Storage"]

    Client -->|Public Catalog GET| Edge
    Edge -->|Cache Hit (s-maxage=60)| Client
    Edge -->|Cache Miss / Authenticated Writes| Lambda
    Lambda -->|Pooled Connections (maxPoolSize=5)| Atlas
    Client -->|Direct Signed Upload| Cloudinary
    Lambda -->|Presigned Verification Signature| Cloudinary
```

---

## 2. Regional Colocation Architecture

### The Problem: Cross-Region Latency Penalty
In a serverless architecture where each request initiates or reuses a database connection, network physical distance is the dominant contributor to tail latency ($p99$):
- If Vercel functions run in default `iad1` (Washington D.C., USA) and Atlas is hosted in `eu-west-1` (Ireland), each network roundtrip costs **75–95 ms**.
- A single complex API call performing 3 sequential database operations incurs ~250 ms in pure wire latency before any query execution.

### The Solution: Colocation (`dub1` $\leftrightarrow$ `eu-west-1`)
- **Vercel Region**: Configured via `vercel.json` to `"regions": ["dub1"]` (Dublin, Ireland).
- **Atlas Region**: Provisioned in AWS `eu-west-1` (Ireland).
- **Colocated Latency**: Sub-3ms roundtrip time between Vercel Serverless execution containers and Atlas Primary/Secondary nodes.
- **Failover / Backup Region**: Frankfurt (`fra1` $\leftrightarrow$ AWS `eu-central-1`).

---

## 3. MongoDB Atlas: M0 Sandbox Limitations vs M10 Cluster

The M0 free sandbox is suitable only for early prototype verification. It is strictly unfit for production deployment due to structural limitations:

| Dimension | M0 Free Sandbox | M10 Dedicated Production Tier | Impact on CampusHive |
| :--- | :--- | :--- | :--- |
| **Max Concurrent Connections** | 500 max (shared cluster-wide) | 1,500 connections (dedicated) | Under traffic spikes, 100 lambdas easily breach 500 connections on M0, causing connection timeouts. |
| **RAM & WiredTiger Cache** | Shared 512 MB | 2.0 GB Dedicated RAM | M0 evicts index trees constantly, causing disk thrashing and degraded latency. M10 holds all ESR and text indexes in RAM. |
| **Disk Storage & IOPS** | 512 MB capped; shared IOPS | 10 GB to 4 TB auto-scaling; up to 3,000 IOPS | 30,000 listings + search index size exceeds 150 MB. M0 fills quickly and throttles writes. |
| **Point-in-Time Backups** | ❌ None (No PITR, manual export only) | ✅ Continuous cloud backups with 1-second RPO | Critical for recovering from accidental data corruption or schema migration failures. |
| **Atlas Search (Lucene)** | Shared memory (causes OOM kills) | Dedicated search daemon | Atlas Search Lucene indices require dedicated memory outside WiredTiger. |
| **Network & VPC Peering** | Public internet only | Private VPC Peering & AWS PrivateLink | Secures database traffic away from the public internet. |
| **SLA & High Availability** | Best effort (no SLA) | 99.995% uptime SLA with automated failover | 3-node replica set across distinct AWS availability zones. |

---

## 4. Serverless Connection Pool Sizing & Atlas Metrics

### Connection Math Formula
In a serverless environment, connection pooling works per container instance, not globally across instances:

$$\text{Total Active Connections} = N_{\text{concurrent lambda containers}} \times \text{maxPoolSize}$$

- If `maxPoolSize` is left at the MongoDB default of **100**, only 6 concurrent Lambdas will exhaust an M0 tier ($6 \times 100 = 600 > 500$).
- With CampusHive's serverless pooling settings:
  ```ts
  maxPoolSize: 5,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000,
  bufferCommands: false
  ```
  - **100 concurrent lambdas** consume at most $100 \times 5 = 500$ connections.
  - On **M10 (1,500 connection limit)**, this leaves a **3x safety buffer** (1,000 headroom connections) for background migration workers, cron jobs, and Express services.
  - `maxIdleTimeMS: 30000` (30 seconds) actively reaps idle sockets from lambda instances that are spun down by Vercel after request spikes.

### Atlas Monitoring & Threshold Alerts
Configure the following automated alerts in Atlas Cloud Manager:
1. **Connection Alert**:
   - Warning trigger: `connections > 70%` of tier limit (> 1,050 on M10).
   - Critical trigger: `connections > 85%` of tier limit (> 1,275 on M10).
2. **System Memory & WiredTiger Cache**:
   - Critical alert if `dirty bytes in cache > 20%`.
3. **Replication Lag**:
   - Alert if secondary oplog delay exceeds 10 seconds.

---

## 5. Storage Hardening & Serverless Durability

### Zero Local Disk Writes
Serverless execution environments (Vercel Lambdas) run on ephemeral read-only filesystems (with only a transient `/tmp` partition that does not persist across invocations). 
- All `node:fs/promises` write operations have been completely excised from `app/lib/storage.ts`.
- Attempting to store uploads on local disk causes `EROFS` errors or silent loss of seller assets.

### Direct Signed Uploads (`/api/upload/sign`)
- Instead of streaming multi-megabyte image buffers through Vercel serverless functions (which subjects the app to Vercel's 4.5 MB payload limit and increases lambda execution cost), clients request signed upload parameters via `POST /api/upload/sign`.
- Uploads transfer directly from the client's browser to Cloudinary.

### Access Control Isolation
- **Public Assets** (`store_logo`, `listing_image`, `store_cover`): Uploaded with `type: "upload"` to `campushive/uploads`. Served globally via Cloudinary CDN.
- **Private Business Verification Documents** (`business_document`): Uploaded with `type: "authenticated"` to `campushive/private_docs`. Cloudinary blocks direct URL access; files can only be accessed with time-limited signed delivery URLs generated by admin verification routes.

### Production Fallback Behavior
- In `NODE_ENV === "production"`, if Cloudinary credentials (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) are missing or unreachable, the system fails closed and throws `StorageUnconfiguredError` (HTTP 503 Service Unavailable). Mock development storage is strictly forbidden in production.

---

## 6. Zero-Downtime Cluster Upgrade Procedure (M0 $\to$ M10)

Atlas supports seamless in-place cluster tier upgrades with zero scheduled downtime through rolling replica set reconfiguration:

1. **Pre-Upgrade Snapshot**: Take a manual cluster snapshot via the Atlas UI or Atlas API.
2. **Execute Tier Change**:
   - In Atlas Console: Select Cluster $\to$ **Configuration** $\to$ Select **M10 (General)**.
   - Select Region: **AWS eu-west-1 (Ireland)**.
   - Enable **Auto-Expand Storage** (initiates at 10 GB).
   - Click **Apply Changes**.
3. **Rolling Replica Set Upgrade Execution**:
   - Atlas brings up a new M10 Secondary node and synchronizes data via oplog.
   - Once in sync, the existing Secondary nodes are upgraded sequentially.
   - A rolling primary election occurs: the old M0 Primary steps down to Secondary, and a freshly upgraded M10 node is elected Primary. The step-down takes < 2 seconds and is seamlessly retried by Mongoose via retryable writes (`retryWrites=true`).
4. **Post-Upgrade Verification**:
   - Run `npx tsx scripts/verify-production-indexes.ts` against the M10 connection string.
   - Verify connection pool gauges in the Atlas metrics dashboard.
   - Verify `test-query-plans-ci.ts` executes on the M10 instance.
