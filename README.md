# PRALAY AI — Global Disaster Intelligence & Emergency Response Platform

![PRALAY AI Operations Center](/public/favicon.svg)

> **College Hackathon Project 2026** — Autonomous Multi-Hazard Disaster Resilience, Historical Intelligence & Early Response Platform.

PRALAY AI is a unified geospatial intelligence and emergency operations platform designed for monitoring global natural hazards, assessing localized risk vulnerabilities, retrieving deep historical disaster benchmarks, issuing timely multi-channel alerts, and organizing life-saving emergency response resources.

---

## 🌐 Live Access & Deployment Links

| Access Channel | Link / Endpoint | Status | Description |
| :--- | :--- | :--- | :--- |
| **⚡ Live Production (Vercel)** | [**pralay-ai.vercel.app**](https://pralay-ai.vercel.app/) | ✅ **Audited & Active** | Primary official production deployment with client-side CORS telemetry & fallback. |
| **🚀 GitHub Pages (Cloud)** | [**GitHub Pages Deployment**](https://ankanadas06.github.io/pralay-ai/) | ⚙️ **CI/CD Ready** | 24/7 cloud hosting powered by GitHub Actions. |
| **📶 Local Wi-Fi Network** | `http://10.60.155.253:5173` | ✅ **Active on LAN** | Ultra-low latency access on any device on the same local Wi-Fi. |
| **💻 Localhost** | `http://localhost:5173` | ✅ **Active** | Local development and testing environment with SQLite backend. |
| **🛡️ Scientific Audit Report** | Inside App (`/` -> `Data Accuracy Audit` tab) | ✅ **Audited v2.4** | Full academic review answering questions on prediction claims & data provenance. |

---

## ⚡ Quickstart

### Prerequisites
- Node.js `v18+` or `v22+` (Recommended)
- npm or pnpm

### Run Locally
```bash
# Clone the repository
git clone https://github.com/AnkanaDas06/pralay-ai.git
cd pralay-ai

# Install dependencies
npm install

# Start development server (with full SQLite historical API & Vite)
npm run dev
```

Visit the live platform at: **`http://localhost:5173/`**

To produce a production build:
```bash
npm run build
npm run preview
```

---

## 🛡️ Key Features

### 1. Operations Center Dashboard & Tactical Cartography
- **Atmospheric Satellite Command Center**: High-resolution NASA Earth Observatory satellite photography of a tropical cyclone with deep navy-blue translucent glassmorphism (`backdrop-blur-md`).
- **Interactive Light World Map Cartography**: Smooth pan/zoom, custom SVG hazard icons, radar pulsing rings for critical alerts, tactical impact radius buffer zones, and country/city labels using OpenStreetMap / CartoDB Positron tiles.
- **Live System Telemetry Clock**: Synchronized with user local timezone (`IST` / international).
- **Active Incident Metrics**: Total geo-incidents, critical red alerts, multi-hazard risk score, official bulletins count.
- **Live Incident Activity Feed**: Filter by All, Critical, India Sector, or Seismic. Click to inspect or center map.
- **Multi-Hazard Filtering**: Filter by Earthquakes, Cyclones, Floods, Wildfires, Landslides, Extreme Temperatures, and time windows (24h, 72h, 7d, 30d).

### 2. Multi-Hazard Historical Intelligence Database
- **Persistent SQLite Database (`data/pralay_disasters.db`)**: Stores hundreds of historical benchmarks and active telemetry events with indexes on hazard type, severity, lifecycle, and date.
- **Historical Analysis View**: Deep search across historical disasters with filters for event status (Active, Monitoring, Resolved, Historical), casualties, affected populations, and magnitude.
- **Built-in REST API**:
  - `GET /api/disasters`: Paginated and filtered disaster intelligence records.
  - `GET /api/stats`: Real-time aggregated statistics across severities and hazard types.
  - `POST /api/sync`: On-demand synchronization engine pulling upstream data from USGS and NASA EONET.

### 3. Live Telemetry & Upstream Data Ingestion
- **USGS Real-Time Earthquake Hazards Program**: Live GeoJSON feed for global earthquakes ($M \ge 2.5$).
- **NASA EONET v3 (Earth Observatory Natural Event Tracker)**: Satellites tracking active wildfires, severe storms, volcanoes, and sea/ice shifts.
- **Open-Meteo Severe Weather Grid**: High-resolution meteorological parameter sampling (precipitation, wind velocity, gust factor).
- **IMD & NDMA Guidelines**: Canonical Indian disaster management early warning standards and vulnerability matrices.
- **Zero-Downtime Demo Mode**: High-fidelity scenario dataset available with a single click if testing offline or in restrictive network environments.

### 4. Mathematical Risk Intelligence (P-MHRS v2.4)
Deterministic composite risk score calculated from 0 to 100 with zero speculative fabrication:
$$\text{Risk Score } R = 0.35 \cdot S_{\text{severity}} + 0.25 \cdot M_{\text{compound}} + 0.25 \cdot E_{\text{exposure}} + 0.15 \cdot A_{\text{meteo}}$$
- **Factor 1 ($w=0.35$)**: Peak Physical Magnitude & Severity (Richter magnitude, storm categories).
- **Factor 2 ($w=0.25$)**: Multi-Hazard Concurrency (density of co-occurring hazards within 500km).
- **Factor 3 ($w=0.25$)**: Regional Geomorphic Exposure Index (coastal surge belts, seismic zones).
- **Factor 4 ($w=0.15$)**: Atmospheric Amplification (heavy antecedent rainfall, dry gust fronts).

### 5. India Disaster Monitoring Mode
- Dedicated India-focused operational picture.
- Interactive state profiles: **West Bengal**, **Odisha**, **Assam**, **Uttarakhand**, **Gujarat**, **Kerala**.
- Detailed geomorphic breakdown:
  - **West Bengal**: Sundarbans tidal surge channels, Digha sea dykes, Darjeeling NH-10 landslide vulnerability.
  - **Odisha**: 800+ multi-purpose cyclone shelters across Puri and Kendrapara coastal belts.
  - **Assam**: Brahmaputra braided river basin flooding & Majuli Island geo-textile defense.
  - **Uttarakhand**: Alaknanda/Mandakini steep talus landslides & Main Central Thrust (MCT) seismic hazard.
  - **Gujarat**: Kutch intraplate seismic fault zone (2001 M7.7 legacy) & Saurashtra cyclone corridor.
  - **Kerala**: Wayanad tea estate slope saturation & Western Ghats debris flow monitoring.
- Direct links to **NDMA**, **IMD Mausam**, **CWC Flood Forecasting**, **NDRF**, **INCOIS**, and **GSI**.

### 6. Emergency Resource & Response Directory
- Searchable database of **Apex Trauma Hospitals**, **NDRF Battalion Bases** (2nd, 3rd, 1st, 8th), **Multi-Purpose Cyclone Shelters**, and **Fire & Rescue Directorates**.
- Instant telephone dialing capability and **Locate on Map** buttons.
- Actionable Standard Operating Protocols:
  - **Earthquake**: Drop, Cover, and Hold On checklist.
  - **Cyclone**: 72-hour Go-Bag & eye-wall transit safety rules.
  - **Flood**: "Turn Around, Don't Drown" and water sanitation directives.
  - **Wildfire**: Level 3 evacuation preparedness and PM2.5 respiratory defense.

### 7. Interactive Demonstration Controls
- **"Simulate Incoming Alert" Button**: Instantly triggers a simulated critical M7.3 Nicobar Arc undersea earthquake to demonstrate Web Audio acoustic chimes, toast alerts, browser notifications, and tactical map recentering in real time.
- **Audio Chime Toggle**: Synthesizes a high-tech dual-frequency acoustic pulse (880Hz $\to$ 587Hz) using Web Audio API without needing external sound files.
- **Web Notification Support**: Integrates native browser desktop notifications when permitted.

---

## 🏛️ Scientific Integrity, Epistemic Boundaries & Academic Audit

### 1. Epistemic Boundary on Earthquake Prediction
> [!IMPORTANT]
> **Deterministic Earthquake Prediction is Scientifically Impossible**: According to the international seismological consensus (USGS, IASPEI, and National Earthquake Information Center), no scientific methodology or sensor array can predict the exact timing, location, and magnitude of an earthquake prior to rupture.
> 
> PRALAY AI **never claims to predict earthquakes**. Earthquakes displayed on the platform are **post-rupture physical sensor observations** fetched live from the USGS Global Seismographic Network.

### 2. Multi-Hazard Risk Scoring (P-MHRS v2.4 Formulation)
The PRALAY composite risk score is an empirical, transparent decision-support heuristic, **not a black-box speculative model**:
$$R = 0.35 \cdot S_{\text{severity}} + 0.25 \cdot C_{\text{compound}} + 0.25 \cdot E_{\text{exposure}} + 0.15 \cdot M_{\text{meteo}}$$
- Evaluates active physical measurements, multi-hazard concurrence within 150 km, geomorphic demographic exposure, and ambient meteorology.
- Used strictly for operational response prioritization and civil defense resource staging.

### 3. Upstream API Verification & Access Policies
| Source Name | Provider | Protocol / Endpoint | Access Policy | Status in PRALAY AI |
| :--- | :--- | :--- | :--- | :--- |
| **USGS Earthquakes** | USGS Hazards Program | `earthquake.usgs.gov/earthquakes/feed/v1.0/` | Public Open (CORS) | ✅ **Live Ingestion** |
| **NASA EONET v3** | NASA Earth Observatory | `eonet.gsfc.nasa.gov/api/v3/events` | Public Open (CORS) | ✅ **Live Ingestion** |
| **Open-Meteo NWP** | Open-Meteo Weather | `api.open-meteo.com/v1/forecast` | Public Open (CORS) | ✅ **Live Atmospheric Sampling** |
| **NOAA IBTrACS** | NOAA NCEI | NetCDF / WMO Archive | Public Open | ✅ **Verified Benchmark Archive** |
| **IMD Warning API** | India Meteorological Dept | `api.imd.gov.in/api/v1/districtwarning` | Requires API Key (`HTTP 401`) | ⚠️ **Audited Key Requirement** (Seeded Archives) |
| **NDEM Geoportal** | ISRO NRSC | `ndem.in` | Restricted (Nodal Officers) | 🔒 **Institutional Only** (Official Citations) |

### 4. Record-Level Provenance & Diagnostic Probes
- Every incident card and modal features an **audited provenance badge**: `OBSERVED`, `WARNING`, `FORECAST`, `ARCHIVE`, `MODEL`, or `DRILL`.
- The in-app **Data Accuracy Audit View** provides a **Live Diagnostic Ping tool** that executes live HTTP requests against all upstream APIs in the user's browser, displaying real-time latency, HTTP status codes, and raw JSON payloads.

---

## 📦 Project Structure

```
pralay-ai/
├── .github/
│   └── workflows/
│       └── deploy.yml            # Automated CI/CD GitHub Pages deployment
├── data/
│   └── pralay_disasters.db       # Persistent SQLite historical disaster store
├── public/
│   ├── assets/
│   │   └── cyclone_satellite_bg.jpg # NASA satellite cyclone background
│   └── favicon.svg               # PRALAY AI radar shield icon
├── src/
│   ├── types/
│   │   └── disaster.ts           # Canonical incident, risk & filter schemas
│   ├── data/
│   │   ├── demoIncidents.ts      # Curated multi-hazard demonstration scenarios
│   │   ├── emergencyResources.ts # Hospitals, NDRF bases, shelters & checklists
│   │   └── indiaStateData.ts     # Indian state vulnerability & agency links
│   ├── server/
│   │   ├── db.mjs                # SQLite schema and query methods
│   │   ├── seeds.mjs             # Benchmark historical events seeder
│   │   ├── ingest.mjs            # Live USGS and NASA EONET sync engine
│   │   └── apiHandler.mjs        # Vite middleware API handler
│   ├── services/
│   │   ├── dbClient.ts           # Frontend SQLite API client
│   │   ├── apiService.ts         # Live USGS, NASA EONET & Open-Meteo fetchers
│   │   ├── riskEngine.ts         # Transparent P-MHRS v2.4 scoring engine
│   │   ├── audioService.ts       # Web Audio synthesizer acoustic chime
│   │   └── notificationService.ts # Web Notification API wrapper
│   ├── components/
│   │   ├── common/               # Header, Sidebar, Footer, Toasts
│   │   ├── dashboard/            # StatCard, IncidentFeed, QuickFilter
│   │   ├── map/                  # DisasterMap, IncidentDetailModal
│   │   └── views/                # Dashboard, Map, Historical, Alerts, Risk, India, Resources, About, Settings
│   ├── App.tsx                   # Main application controller
│   ├── index.css                 # Command-center styling & Leaflet map theme
│   └── vite.config.ts            # Vite config with API server middleware
├── LIVE_ACCESS.md                # Platform access guide, tunnel & Wi-Fi instructions
├── tailwind.config.js            # Command-center dark navy color palette
└── package.json
```

---

*PRALAY AI — Preparedness. Resilience. Awareness. Logistics. Analytics. Yield.*
