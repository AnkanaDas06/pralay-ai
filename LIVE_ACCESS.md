# 🌐 PRALAY AI — Live Access & Deployment Guide

This document contains all active access links, network endpoints, and deployment options for the **PRALAY AI Global Disaster Intelligence Platform**.

---

## 🔗 Active Platform Links

| Access Channel | URL / Endpoint | Availability | Description |
| :--- | :--- | :--- | :--- |
| **🌍 Live Public & Mobile Web** | [https://complex-faculty-compounds-guaranteed.trycloudflare.com](https://complex-faculty-compounds-guaranteed.trycloudflare.com) | ✅ **Active** | Full platform accessible anywhere from phones, tablets, or remote laptops via secure SSL tunnel. |
| **🚀 Permanent GitHub Pages** | [https://ankanadas06.github.io/pralay-ai/](https://ankanadas06.github.io/pralay-ai/) | ⚙️ **Configured via CI/CD** | 24/7 cloud-hosted static deployment powered by GitHub Actions. |
| **📶 Local Wi-Fi Network** | `http://10.60.155.253:5173` | ✅ **Active on LAN** | Ultra-low latency direct access on any phone or device connected to the same local Wi-Fi router. |
| **💻 Local Workstation** | `http://localhost:5173` | ✅ **Active** | Development and local testing environment on the host machine. |
| **🐙 GitHub Source Repository** | [https://github.com/AnkanaDas06/pralay-ai](https://github.com/AnkanaDas06/pralay-ai) | ✅ **Live on main** | Full source code, SQLite database schema, NASA assets, and documentation. |

---

## 📱 How to Open on Your Mobile Phone

### Method A: Anywhere via Public Tunnel (Cellular Data / Wi-Fi)
1. Open your phone's browser (Chrome, Safari, Firefox).
2. Visit: **[https://complex-faculty-compounds-guaranteed.trycloudflare.com](https://complex-faculty-compounds-guaranteed.trycloudflare.com)**
3. The complete PRALAY AI operations dashboard will load instantly with full responsive touch support.

### Method B: Directly on Same Wi-Fi (No Internet/Tunnel Required)
1. Ensure your smartphone is connected to the same Wi-Fi router as your PC (`Wi-Fi 2`).
2. Open your phone browser and navigate to: **`http://10.60.155.253:5173`**
3. This delivers instant, zero-latency streaming directly from your computer.

---

## ☁️ How to Enable 24/7 Permanent GitHub Pages Hosting

Your repository now includes an automated GitHub Actions deployment workflow at [`.github/workflows/deploy.yml`](file:///C:/Users/HP/.gemini/antigravity/scratch/pralay-ai/.github/workflows/deploy.yml).

To activate it on GitHub:
1. Go to your repository settings: **[https://github.com/AnkanaDas06/pralay-ai/settings/pages](https://github.com/AnkanaDas06/pralay-ai/settings/pages)**
2. Under **Build and deployment > Source**, select: **GitHub Actions**.
3. GitHub will automatically trigger the deployment workflow and host the platform permanently at:
   👉 **`https://ankanadas06.github.io/pralay-ai/`**

---

## 🛠️ How to Restart Tunnel If It Disconnects

Account-less tunnels on `trycloudflare.com` may automatically disconnect after long periods of inactivity or when your computer goes to sleep.

To start a fresh tunnel anytime from your terminal:
```bash
# In the project directory:
npm run dev

# In another terminal window:
.\cloudflared.exe tunnel --url http://localhost:5173
```
This generates a new public `https://*.trycloudflare.com` link immediately.

---

*PRALAY AI — Preparedness. Resilience. Awareness. Logistics. Analytics. Yield.*
