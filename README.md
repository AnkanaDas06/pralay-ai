# PRALAY AI — Global Disaster Intelligence & Emergency Response Platform

![PRALAY AI Operations Center](/public/favicon.svg)

> **College Hackathon Project 2026** — Autonomous Multi-Hazard Disaster Resilience & Early Response System.

PRALAY AI is a unified geospatial intelligence and emergency operations platform designed for monitoring global natural hazards, assessing localized risk vulnerabilities, issuing timely multi-channel alerts, and organizing life-saving emergency response resources.

---

## ⚡ Quickstart

### Prerequisites
- Node.js `v18+` or `v22+` (Recommended)
- npm or pnpm

### Run Locally
```bash
# Navigate to the project directory
cd pralay-ai

# Install dependencies (already prepared)
npm install

# Start the development server
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

### 1. Operations Center Dashboard
- **Live System Telemetry Clock**: Synchronized with user local timezone (`IST` / international).
- **Active Incident Metrics**: Total geo-incidents, critical red alerts, multi-hazard risk score, official bulletins count.
- **Centerpiece Interactive Leaflet Map**: Smooth pan/zoom, custom SVG hazard icons, radar pulsing rings for critical alerts, and tactical impact radius buffer zones.
- **Live Incident Activity Feed**: Filter by All, Critical, India Sector, or Seismic. Click to inspect or center map.
- **Multi-Hazard Filtering**: Filter by Earthquakes, Cyclones, Floods, Wildfires, Landslides, Extreme Temperatures, and time windows (24h, 72h, 7d, 30d).

### 2. Live Telemetry & Upstream Data Ingestion
- **USGS Real-Time Earthquake Hazards Program**: Live GeoJSON feed for global earthquakes ($M \ge 2.5$).
- **NASA EONET v3 (Earth Observatory Natural Event Tracker)**: Satellites tracking active wildfires, severe storms, volcanoes, and sea/ice shifts.
- **Open-Meteo Severe Weather Grid**: High-resolution meteorological parameter sampling (precipitation, wind velocity, gust factor).
- **IMD & NDMA Guidelines**: Canonical Indian disaster management early warning standards and vulnerability matrices.
- **Zero-Downtime Demo Mode**: High-fidelity scenario dataset available with a single click if testing offline or in restrictive network environments.

### 3. Mathematical Risk Intelligence (P-MHRS v2.4)
Deterministic composite risk score calculated from 0 to 100 with zero speculative fabrication:
$$\text{Risk Score } R = 0.35 \cdot S_{\text{severity}} + 0.25 \cdot M_{\text{compound}} + 0.25 \cdot E_{\text{exposure}} + 0.15 \cdot A_{\text{meteo}}$$
- **Factor 1 ($w=0.35$)**: Peak Physical Magnitude & Severity (Richter magnitude, storm categories).
- **Factor 2 ($w=0.25$)**: Multi-Hazard Concurrency (density of co-occurring hazards within 500km).
- **Factor 3 ($w=0.25$)**: Regional Geomorphic Exposure Index (coastal surge belts, seismic zones).
- **Factor 4 ($w=0.15$)**: Atmospheric Amplification (heavy antecedent rainfall, dry gust fronts).

### 4. India Disaster Monitoring Mode
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

### 5. Emergency Resource & Response Directory
- Searchable database of **Apex Trauma Hospitals**, **NDRF Battalion Bases** (2nd, 3rd, 1st, 8th), **Multi-Purpose Cyclone Shelters**, and **Fire & Rescue Directorates**.
- Instant telephone dialing capability and **Locate on Map** buttons.
- Actionable Standard Operating Protocols:
  - **Earthquake**: Drop, Cover, and Hold On checklist.
  - **Cyclone**: 72-hour Go-Bag & eye-wall transit safety rules.
  - **Flood**: "Turn Around, Don't Drown" and water sanitation directives.
  - **Wildfire**: Level 3 evacuation preparedness and PM2.5 respiratory defense.

### 6. Interactive Hackathon Demonstration Controls
- **"Simulate Incoming Alert" Button**: Instantly triggers a simulated critical M7.3 Nicobar Arc undersea earthquake to demonstrate Web Audio acoustic chimes, toast alerts, browser notifications, and tactical map recentering in real time.
- **Audio Chime Toggle**: Synthesizes a high-tech dual-frequency acoustic pulse (880Hz $\to$ 587Hz) using Web Audio API without needing external sound files.
- **Web Notification Support**: Integrates native browser desktop notifications when permitted.

---

## 🏛️ Scientific Integrity & Disclaimers

> [!IMPORTANT]
> **No Spurious Predictions**: Science cannot deterministically predict the exact date, time, and epicenter of an earthquake. PRALAY AI reports observed seismological events and historical vulnerability classifications.
>
> **Public Emergency Notice**: PRALAY AI is a hackathon prototype designed for situational awareness. In active life-threatening emergencies, always follow instructions issued by local municipal emergency services, police, and national civil protection agencies (NDMA/IMD).

---

## 📦 Project Structure

```
pralay-ai/
├── public/
│   └── favicon.svg           # PRALAY AI radar shield icon
├── src/
│   ├── types/
│   │   └── disaster.ts       # Canonical incident, risk & filter schemas
│   ├── data/
│   │   ├── demoIncidents.ts  # Curated multi-hazard demonstration scenarios
│   │   ├── emergencyResources.ts # Hospitals, NDRF bases, shelters & checklists
│   │   └── indiaStateData.ts # Indian state vulnerability & agency links
│   ├── services/
│   │   ├── apiService.ts     # Live USGS, NASA EONET & Open-Meteo fetchers
│   │   ├── riskEngine.ts     # Transparent P-MHRS v2.4 scoring engine
│   │   ├── audioService.ts   # Web Audio synthesizer acoustic chime
│   │   └── notificationService.ts # Web Notification API wrapper
│   ├── components/
│   │   ├── common/           # Header, Sidebar, Footer, Toasts
│   │   ├── dashboard/        # StatCard, IncidentFeed, QuickFilter
│   │   ├── map/              # DisasterMap, IncidentDetailModal
│   │   └── views/            # Dashboard, Map, Alerts, Risk, India, Resources, About, Settings
│   ├── App.tsx               # Main application controller
│   └── index.css             # Tailwind + Leaflet dark theme styling
├── tailwind.config.js        # Command-center dark navy color palette
└── package.json
```

---

*PRALAY AI — Preparedness. Resilience. Awareness. Logistics. Analytics. Yield.*
