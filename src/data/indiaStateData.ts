export interface IndiaStateProfile {
  id: string;
  name: string;
  capital: string;
  coordinates: { lat: number; lng: number; zoom: number };
  seismicZones: ('Zone V (Very High)' | 'Zone IV (High)' | 'Zone III (Moderate)' | 'Zone II (Low)')[];
  primaryHazards: string[];
  coastalLengthKm?: number;
  sdmaName: string;
  sdmaWebsite: string;
  sdmaHelpline: string;
  keyDistricts: {
    district: string;
    vulnerability: 'High Cyclone' | 'Severe Flood' | 'Landslide Prone' | 'Seismic Zone IV/V' | 'Drought & Heatwave';
    recentStatus: 'Advisory Active' | 'Normal Telemetry' | 'Elevated Watch';
    details: string;
  }[];
  ndrfBattalionAssigned: string;
}

export const INDIA_STATES_DATA: IndiaStateProfile[] = [
  {
    id: 'west-bengal',
    name: 'West Bengal',
    capital: 'Kolkata',
    coordinates: { lat: 22.9868, lng: 87.855, zoom: 7 },
    seismicZones: ['Zone IV (High)', 'Zone III (Moderate)'],
    primaryHazards: ['Tropical Cyclones', 'Sundarbans Riverine Inundation', 'Darjeeling Landslides', 'Ganga-Padma Erosion'],
    coastalLengthKm: 157,
    sdmaName: 'West Bengal State Disaster Management Authority (WBSDMA)',
    sdmaWebsite: 'http://wbdmd.gov.in',
    sdmaHelpline: '1070 / 033-22143526',
    keyDistricts: [
      {
        district: 'South 24 Parganas (Sundarbans)',
        vulnerability: 'High Cyclone',
        recentStatus: 'Elevated Watch',
        details: 'Tidal mangrove channels susceptible to cyclonic surge >3m during depression transit.'
      },
      {
        district: 'Purba Medinipur (Digha/Contai)',
        vulnerability: 'High Cyclone',
        recentStatus: 'Elevated Watch',
        details: 'Coastal sea dykes and tourism corridor facing heavy sea swell.'
      },
      {
        district: 'Darjeeling & Kalimpong',
        vulnerability: 'Landslide Prone',
        recentStatus: 'Advisory Active',
        details: 'NH-10 vulnerable to slope instability during heavy monsoon spells.'
      },
      {
        district: 'Kolkata Urban Core',
        vulnerability: 'Severe Flood',
        recentStatus: 'Normal Telemetry',
        details: 'Drainage lock during high tide coincidence with convective downpours.'
      },
      {
        district: 'Malda & Murshidabad',
        vulnerability: 'Severe Flood',
        recentStatus: 'Normal Telemetry',
        details: 'Ganga riverbank scour and embankment displacement.'
      }
    ],
    ndrfBattalionAssigned: '2nd Battalion NDRF (Haringhata / Nadia)'
  },
  {
    id: 'odisha',
    name: 'Odisha',
    capital: 'Bhubaneswar',
    coordinates: { lat: 20.9517, lng: 85.0985, zoom: 7 },
    seismicZones: ['Zone III (Moderate)', 'Zone II (Low)'],
    primaryHazards: ['Bay of Bengal Cyclones', 'Mahanadi Basin Flooding', 'Summer Extreme Heatwaves'],
    coastalLengthKm: 480,
    sdmaName: 'Odisha State Disaster Management Authority (OSDMA)',
    sdmaWebsite: 'https://www.osdma.org',
    sdmaHelpline: '1070 / 0674-2534177',
    keyDistricts: [
      {
        district: 'Puri & Jagatsinghpur',
        vulnerability: 'High Cyclone',
        recentStatus: 'Normal Telemetry',
        details: 'Dense network of 800+ automated cyclone shelters along low-elevation coastline.'
      },
      {
        district: 'Kendrapara',
        vulnerability: 'High Cyclone',
        recentStatus: 'Normal Telemetry',
        details: 'Bhitarkanika estuary storm buffer and mangrove reserve.'
      },
      {
        district: 'Cuttack (Mahanadi Delta)',
        vulnerability: 'Severe Flood',
        recentStatus: 'Normal Telemetry',
        details: 'Hirakud Dam discharge management zone.'
      }
    ],
    ndrfBattalionAssigned: '3rd Battalion NDRF (Mundali)'
  },
  {
    id: 'assam',
    name: 'Assam',
    capital: 'Dispur / Guwahati',
    coordinates: { lat: 26.2006, lng: 92.9376, zoom: 7 },
    seismicZones: ['Zone V (Very High)'],
    primaryHazards: ['Brahmaputra Annual Inundation', 'Major Seismic Threat (Zone V)', 'Hill Cut Landslides'],
    sdmaName: 'Assam State Disaster Management Authority (ASDMA)',
    sdmaWebsite: 'https://asdma.assam.gov.in',
    sdmaHelpline: '1070 / 1079 / 0361-2237011',
    keyDistricts: [
      {
        district: 'Dhemaji & Lakhimpur',
        vulnerability: 'Severe Flood',
        recentStatus: 'Elevated Watch',
        details: 'Braided river breaches and flash sedimentation from Himalayan tributaries.'
      },
      {
        district: 'Majuli Island',
        vulnerability: 'Severe Flood',
        recentStatus: 'Advisory Active',
        details: 'World\'s largest river island undergoing continuous geo-textile reinforced bank defense.'
      },
      {
        district: 'Kamrup Metro (Guwahati)',
        vulnerability: 'Seismic Zone IV/V',
        recentStatus: 'Normal Telemetry',
        details: 'Zone V high-density building vulnerability requiring strict IS 1893 seismic retrofits.'
      }
    ],
    ndrfBattalionAssigned: '1st Battalion NDRF (Patgaon)'
  },
  {
    id: 'uttarakhand',
    name: 'Uttarakhand',
    capital: 'Dehradun',
    coordinates: { lat: 30.0668, lng: 79.0193, zoom: 7 },
    seismicZones: ['Zone V (Very High)', 'Zone IV (High)'],
    primaryHazards: ['Glacial Lake Outburst Floods (GLOF)', 'Cloudbursts', 'Slope Landslides', 'High Seismicity'],
    sdmaName: 'Uttarakhand State Disaster Management Authority (USDMA)',
    sdmaWebsite: 'https://usdma.uk.gov.in',
    sdmaHelpline: '1070 / 0135-2710334',
    keyDistricts: [
      {
        district: 'Chamoli & Rudraprayag',
        vulnerability: 'Landslide Prone',
        recentStatus: 'Elevated Watch',
        details: 'Alaknanda & Mandakini steep valleys with frequent monsoon slope detachment.'
      },
      {
        district: 'Pithoragarh',
        vulnerability: 'Seismic Zone IV/V',
        recentStatus: 'Normal Telemetry',
        details: 'Main Central Thrust (MCT) active fault zone proximity.'
      }
    ],
    ndrfBattalionAssigned: '15th Battalion NDRF (Gadarpur / Dehradun Team)'
  },
  {
    id: 'gujarat',
    name: 'Gujarat',
    capital: 'Gandhinagar',
    coordinates: { lat: 22.2587, lng: 71.1924, zoom: 7 },
    seismicZones: ['Zone V (Very High)', 'Zone IV (High)', 'Zone III (Moderate)'],
    primaryHazards: ['Arabian Sea Cyclones', 'Kutch Intraplate Seismicity', 'Industrial Chemical Safety'],
    coastalLengthKm: 1600,
    sdmaName: 'Gujarat State Disaster Management Authority (GSDMA)',
    sdmaWebsite: 'https://gsdma.org',
    sdmaHelpline: '1070 / 079-23259283',
    keyDistricts: [
      {
        district: 'Kutch (Bhuj / Gandhidham)',
        vulnerability: 'Seismic Zone IV/V',
        recentStatus: 'Normal Telemetry',
        details: 'Site of catastrophic 2001 M7.7 intraplate earthquake; highest seismic hazard.'
      },
      {
        district: 'Jamnagar & Porbandar',
        vulnerability: 'High Cyclone',
        recentStatus: 'Normal Telemetry',
        details: 'Saurashtra coast vulnerability to recurving Arabian Sea severe storms.'
      }
    ],
    ndrfBattalionAssigned: '6th Battalion NDRF (Vadodara)'
  },
  {
    id: 'kerala',
    name: 'Kerala',
    capital: 'Thiruvananthapuram',
    coordinates: { lat: 10.8505, lng: 76.2711, zoom: 7 },
    seismicZones: ['Zone III (Moderate)'],
    primaryHazards: ['Western Ghats Debris Flow / Landslides', 'Dam Inflow Floods', 'Coastal High-Swell Inundation & Rough Sea'],
    coastalLengthKm: 580,
    sdmaName: 'Kerala State Disaster Management Authority (KSDMA)',
    sdmaWebsite: 'https://sdma.kerala.gov.in',
    sdmaHelpline: '1070 / 1077 / 0471-2364424',
    keyDistricts: [
      {
        district: 'Wayanad (Meppadi / Chooralmala)',
        vulnerability: 'Landslide Prone',
        recentStatus: 'Elevated Watch',
        details: 'Precipitous tea plantation slopes with high soil moisture saturation index.'
      },
      {
        district: 'Idukki',
        vulnerability: 'Landslide Prone',
        recentStatus: 'Normal Telemetry',
        details: 'Major reservoir cascades (Mullaperiyar, Idukki Arch) requiring dam release coordination.'
      }
    ],
    ndrfBattalionAssigned: '4th Battalion NDRF (Arakkonam Regional Response Centre / Thrissur)'
  }
];

export const INDIA_OFFICIAL_LINKS = [
  { name: 'National Disaster Management Authority (NDMA)', url: 'https://ndma.gov.in', desc: 'Apex statutory body for disaster policy and planning' },
  { name: 'India Meteorological Department (IMD Mausam)', url: 'https://mausam.imd.gov.in', desc: 'Official cyclone tracks, monsoon bulletins & nowcasting' },
  { name: 'Central Water Commission (CWC Flood)', url: 'https://cwc.gov.in', desc: 'Real-time telemetry of river levels, dam storage and danger marks' },
  { name: 'National Disaster Response Force (NDRF)', url: 'https://www.ndrf.gov.in', desc: 'Specialized central multi-skilled humanitarian response force' },
  { name: 'INCOIS (Ocean Information & Tsunami Watch)', url: 'https://incois.gov.in', desc: 'High-wave alerts, storm surge advisories & Indian Ocean tsunami watch' },
  { name: 'Geological Survey of India (GSI Landslide)', url: 'https://www.gsi.gov.in', desc: 'Himalayan and Western Ghats landslide early warning experiments' }
];
