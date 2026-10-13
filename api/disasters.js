// Vercel Serverless Function: /api/disasters
// Provides verified disaster intelligence records when hosted on Vercel

const VERIFIED_SEEDS = [
  {
    id: "hist-cyclone-amphan-2020",
    title: "Super Cyclonic Storm Amphan (Category 5 Equivalent)",
    hazardType: "cyclone",
    severity: "critical",
    status: "historical",
    lifecycle: "historical",
    provenanceType: "historical_archive",
    location: "Bay of Bengal, West Bengal & Odisha Coastal Belt",
    country: "India",
    state: "West Bengal",
    district: "South 24 Parganas, North 24 Parganas, East Medinipur",
    region: "South Asia",
    coordinates: [21.65, 88.35],
    timestamp: "2020-05-20T12:00:00.000Z",
    startDate: "2020-05-16",
    endDate: "2020-05-21",
    magnitudeOrIntensity: "260 km/h (3-min sustained) • 907 hPa",
    windSpeedKmh: 260,
    affectedPopulation: 18000000,
    casualties: 128,
    impactRadiusKm: 320,
    source: "NOAA IBTrACS & IMD Official Best-Track Archive",
    sourceUrl: "https://www.ncei.noaa.gov/products/international-best-track-archive",
    verificationStatus: "verified_official",
    originalProviderId: "IBTrACS:2020139N09088",
    observationTime: "2020-05-20T12:00:00.000Z",
    lastSyncTime: "2026-10-13T00:00:00.000Z",
    dataUncertaintyNotes: "NOAA IBTrACS validated post-season reanalysis. Best-track center location uncertainty: ±15 km; peak sustained wind uncertainty: ±5 kt.",
    description: "Extremely destructive Category 5-equivalent Super Cyclonic Storm. Landfall near Bakkhali, West Bengal with widespread inundation across the Sundarbans mangrove delta.",
    safetyGuidance: [
      "Follow mandatory coastal storm surge evacuation directives.",
      "Seek refuge in designated cyclone relief shelters.",
      "Isolate main power switches to prevent electrocution during storm surges."
    ],
    lastUpdated: "2020-05-21T06:00:00.000Z",
    isDemo: false
  },
  {
    id: "hist-cyclone-fani-2019",
    title: "Extremely Severe Cyclonic Storm Fani (Category 4 Equivalent)",
    hazardType: "cyclone",
    severity: "critical",
    status: "historical",
    lifecycle: "historical",
    provenanceType: "historical_archive",
    location: "Puri Coast, Odisha",
    country: "India",
    state: "Odisha",
    district: "Puri, Khordha, Cuttack",
    region: "South Asia",
    coordinates: [19.81, 85.83],
    timestamp: "2019-05-03T08:00:00.000Z",
    startDate: "2019-04-26",
    endDate: "2019-05-05",
    magnitudeOrIntensity: "215 km/h sustained • 932 hPa",
    windSpeedKmh: 215,
    affectedPopulation: 16500000,
    casualties: 89,
    impactRadiusKm: 280,
    source: "NOAA IBTrACS & IMD Report on Cyclone Fani",
    sourceUrl: "https://rsmcnewdelhi.imd.gov.in",
    verificationStatus: "verified_official",
    originalProviderId: "IBTrACS:2019116N02086",
    observationTime: "2019-05-03T08:00:00.000Z",
    lastSyncTime: "2026-10-13T00:00:00.000Z",
    dataUncertaintyNotes: "Validated best-track archive data. Landfall timing confirmed by Paradip and Gopalpur Doppler Weather Radars.",
    description: "Extremely destructive cyclone making landfall south of Puri, Odisha. Mass evacuation of over 1.2 million citizens conducted within 24 hours.",
    safetyGuidance: [
      "Comply promptly with institutional evacuation orders.",
      "Store potable drinking water and emergency non-perishable rations.",
      "Avoid post-storm fallen electrical wires and waterlogged streets."
    ],
    lastUpdated: "2019-05-04T12:00:00.000Z",
    isDemo: false
  },
  {
    id: "hist-quake-bhuj-2001",
    title: "2001 Bhuj Intraplate Earthquake (M 7.7)",
    hazardType: "earthquake",
    severity: "critical",
    status: "historical",
    lifecycle: "historical",
    provenanceType: "historical_archive",
    location: "Kutch District, Gujarat",
    country: "India",
    state: "Gujarat",
    district: "Kutch, Ahmedabad, Rajkot",
    region: "South Asia",
    coordinates: [23.41, 70.23],
    timestamp: "2001-01-26T03:16:40.000Z",
    startDate: "2001-01-26",
    endDate: "2001-02-15",
    magnitudeOrIntensity: "Mw 7.7 • Depth 16.0 km",
    affectedPopulation: 15000000,
    casualties: 20085,
    impactRadiusKm: 400,
    source: "USGS Earthquake Catalog (Comprehensive Catalog)",
    sourceUrl: "https://earthquake.usgs.gov/earthquakes/eventpage/usp000a89d/executive",
    verificationStatus: "verified_official",
    originalProviderId: "usp000a89d",
    observationTime: "2001-01-26T03:16:40.000Z",
    lastSyncTime: "2026-10-13T00:00:00.000Z",
    dataUncertaintyNotes: "USGS ComCat official solution. Epicenter uncertainty ±5.4 km; hypocentral depth uncertainty ±3.2 km.",
    description: "Massive intraplate blind-thrust fault rupture occurring on India's 52nd Republic Day. Catastrophic structural destruction across Bhuj, Anjar, and Bachau.",
    safetyGuidance: [
      "Drop, Cover, and Hold On during active ground shaking.",
      "Evacuate multi-story buildings via stairs once primary tremors subside.",
      "Inspect for severed domestic gas lines and shorted electrical circuits."
    ],
    lastUpdated: "2001-02-01T00:00:00.000Z",
    isDemo: false
  },
  {
    id: "hist-quake-nepal-2015",
    title: "2015 Gorkha Nepal Earthquake (M 7.8)",
    hazardType: "earthquake",
    severity: "critical",
    status: "historical",
    lifecycle: "historical",
    provenanceType: "historical_archive",
    location: "Gorkha District & Kathmandu Valley",
    country: "Nepal",
    region: "South Asia",
    coordinates: [28.23, 84.73],
    timestamp: "2015-04-25T06:11:26.000Z",
    startDate: "2015-04-25",
    endDate: "2015-05-15",
    magnitudeOrIntensity: "Mw 7.8 • Depth 15.0 km",
    affectedPopulation: 8000000,
    casualties: 8964,
    impactRadiusKm: 350,
    source: "USGS Earthquake Catalog (ComCat)",
    sourceUrl: "https://earthquake.usgs.gov/earthquakes/eventpage/us20002926/executive",
    verificationStatus: "verified_official",
    originalProviderId: "us20002926",
    observationTime: "2015-04-25T06:11:26.000Z",
    lastSyncTime: "2026-10-13T00:00:00.000Z",
    dataUncertaintyNotes: "USGS ComCat official centroid moment tensor. Strong shaking registered across Northern India including Bihar, UP, and West Bengal.",
    description: "Continental collision megathrust rupture along the Main Himalayan Thrust. Triggered avalanches on Mount Everest and widespread destruction of UNESCO heritage structures.",
    safetyGuidance: [
      "Do not enter structurally compromised masonry structures.",
      "Be prepared for energetic aftershocks over following days.",
      "Assemble at designated open municipal muster grounds."
    ],
    lastUpdated: "2015-05-01T00:00:00.000Z",
    isDemo: false
  },
  {
    id: "hist-landslide-wayanad-2024",
    title: "2024 Wayanad Catastrophic Debris Flows",
    hazardType: "landslide",
    severity: "critical",
    status: "historical",
    lifecycle: "historical",
    provenanceType: "historical_archive",
    location: "Chooralmala, Meppadi, Wayanad District, Kerala",
    country: "India",
    state: "Kerala",
    district: "Wayanad",
    region: "South Asia",
    coordinates: [11.53, 76.13],
    timestamp: "2024-07-30T01:00:00.000Z",
    startDate: "2024-07-30",
    endDate: "2024-08-05",
    magnitudeOrIntensity: "572 mm/48h Rainfall • 86,000 m³ Debris",
    affectedPopulation: 45000,
    casualties: 420,
    impactRadiusKm: 25,
    source: "Geological Survey of India (GSI) & Kerala State Disaster Management Authority",
    sourceUrl: "https://sdma.kerala.gov.in",
    verificationStatus: "verified_official",
    originalProviderId: "GSI-KL-WYD-2024",
    observationTime: "2024-07-30T01:00:00.000Z",
    lastSyncTime: "2026-10-13T00:00:00.000Z",
    dataUncertaintyNotes: "GSI post-disaster field inspection report. Rain-induced slope saturation trigger confirmed by CWC Iruvanjippuzha river station gauge.",
    description: "Catastrophic nocturnal multi-stage debris flow and mudslide triggered by unprecedented monsoon downpours across the fragile Western Ghats.",
    safetyGuidance: [
      "Immediately evacuate high-slope escarpments following orange/red monsoon alerts.",
      "Listen for unusual rumbling ground sounds or sudden water muddiness.",
      "Stay away from drainage gullies and natural torrent paths."
    ],
    lastUpdated: "2024-08-05T00:00:00.000Z",
    isDemo: false
  }
];

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const { hazardTypes, severities, country, searchQuery, q, limit = 250, offset = 0 } = req.query || {};

  let filtered = [...VERIFIED_SEEDS];

  if (country) {
    filtered = filtered.filter(d => d.country.toLowerCase() === country.toLowerCase());
  }

  const query = searchQuery || q;
  if (query) {
    const qLower = query.toLowerCase();
    filtered = filtered.filter(d => 
      d.title.toLowerCase().includes(qLower) || 
      d.location.toLowerCase().includes(qLower) ||
      d.country.toLowerCase().includes(qLower)
    );
  }

  const paginated = filtered.slice(Number(offset), Number(offset) + Number(limit));

  res.status(200).json({
    success: true,
    count: paginated.length,
    total: filtered.length,
    disasters: paginated,
    serverEnvironment: 'vercel-serverless-endpoint',
    auditNotes: 'Direct client CORS fetch to USGS and NASA EONET is also active on the frontend.'
  });
}
