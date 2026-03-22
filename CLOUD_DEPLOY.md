# Deploying CIRCUIT to Oracle Cloud (Persistent Strategy)

To make your autonomous agents run 24/7 without needing your PC or terminal open, follow these steps to deploy your backend to your Oracle Cloud instance.

## 1. Prepare your Oracle Cloud Instance
1.  **OCI Console**: Go to **Compute** > **Instances** and ensure your instance is running.
2.  **VCN Security List**: Ensure **Port 3001** (Backend API) and **Port 8080** (Frontend) are open in the Ingress Rules of your VCN.
3.  **SSH**: Connect to your instance:
    ```bash
    ssh -i your-key.key opc@your-instance-ip
    ```

## 2. Install Node.js & PM2
Once logged into your Oracle instance:
```bash
# Install Node.js (v20+)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (Process Manager to keep app alive)
sudo npm install -g pm2
```

## 3. Clone and Setup
```bash
git clone https://github.com/your-repo/hero-bloom.git
cd hero-bloom

# Install dependencies (Root and Server)
npm install
cd server && npm install
```

## 4. Environment Variables
Copy your local `.env` files to the server. 
- Root `.env` (Frontend config)
- `server/.env` (Backend config + `CIRCUIT_MANAGED_AGENT_IDS`)

## 5. Start with PM2 (The "Live" Part)
Instead of `npm run dev`, use PM2 to keep the processes running in the background:

### Start Backend (with Persistent OpenClaw)
```bash
cd server
pm2 start npx --name "circuit-api" -- tsx watch src/index.ts
```

### Start Frontend (Dashboard)
```bash
cd ..
pm2 start npx --name "circuit-ui" -- vite --port 8080 --host
```

## 6. Verify
- Run `pm2 status` to see both processes running.
- Run `pm2 logs circuit-api` to see the OpenClaw agent ticking and managing your loans in real-time.

**Now you can turn off your PC!** The Oracle Cloud instance will continue to run the strategy loop persistently.
