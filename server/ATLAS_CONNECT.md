# Fixing MongoDB Atlas "queryTxt ETIMEOUT"

The error means DNS lookup for `cluster0.6myj8ay.mongodb.net` is timing out (often due to firewall, VPN, or DNS blocking SRV records).

## 1. Use the Standard Connection String (no SRV DNS)

1. In **MongoDB Atlas**: go to **Database** → click **Connect** on your cluster.
2. Choose **"Drivers"** (Connect your application).
3. Look for **"Use a standard connection string"** or switch the driver version to **2.12 or earlier** to see the standard URI.
4. Copy the **standard** URI. It looks like:
   ```text
   mongodb://USER:PASS@cluster0-shard-00-00.6myj8ay.mongodb.net:27017,cluster0-shard-00-01.6myj8ay.mongodb.net:27017,cluster0-shard-00-02.6myj8ay.mongodb.net:27017/TRACKER?ssl=true&replicaSet=atlas-XXXXX-shard-0
   ```
5. Replace `USER` and `PASS` with your database user (URL-encode password: `@` → `%40`, `#` → `%23`).
6. Put that full URI in `server/.env` as `MONGODB_URI=...` (replace the current `mongodb+srv://...` line).
7. Restart the server: `cd server && npm run dev`.

## 2. If you don't see "standard connection string" in Atlas

- Try **MongoDB Compass** as the connection method; sometimes it shows a non-SRV URI you can copy.
- Or try the network/DNS steps below first.

## 3. Check your network / DNS

- **VPN**: Turn off VPN and try again.
- **Firewall / antivirus**: Temporarily allow Node.js or try with them disabled.
- **Different network**: Try from a **mobile hotspot** to see if it’s your ISP/router.
- **DNS**: Set your PC to use **Google DNS (8.8.8.8)** or **Cloudflare (1.1.1.1)** and retry:
  - Windows: Settings → Network & Internet → Ethernet/Wi‑Fi → your connection → Edit DNS → Manual → Preferred: `8.8.8.8`, Alternate: `1.1.1.1`.

After changing `.env`, always restart the server.
