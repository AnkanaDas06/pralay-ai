import { EmergencyResource } from '../types/disaster';

export const EMERGENCY_RESOURCES: EmergencyResource[] = [
  // Helplines & Authorities
  {
    id: 'res-hlp-112',
    name: 'National Emergency Response Support System (ERSS)',
    category: 'helpline',
    location: 'Pan-India Single Emergency Service',
    country: 'India',
    coordinates: { lat: 28.6139, lng: 77.209 },
    contactNumber: '112',
    is24x7: true,
    capabilities: ['Police Dispatch', 'Fire Support', 'Medical Emergency', 'Disaster Routing'],
    verifiedDate: '2026-10-01'
  },
  {
    id: 'res-hlp-ndma',
    name: 'National Disaster Management Authority (NDMA) Control Room',
    category: 'helpline',
    location: 'NDMA Bhawan, A-1, Safdarjung Enclave, New Delhi',
    state: 'Delhi',
    country: 'India',
    coordinates: { lat: 28.5665, lng: 77.1932 },
    contactNumber: '1078 / 011-26701728',
    is24x7: true,
    capabilities: ['National Disaster Coordination', 'NDRF Deployment Request', 'Early Warning Dissemination'],
    verifiedDate: '2026-10-01'
  },
  {
    id: 'res-hlp-cwc',
    name: 'Central Water Commission (CWC) Flood Forecasting Cell',
    category: 'helpline',
    location: 'Sewa Bhawan, R.K. Puram, New Delhi',
    state: 'Delhi',
    country: 'India',
    coordinates: { lat: 28.5694, lng: 77.1865 },
    contactNumber: '011-26106523',
    is24x7: true,
    capabilities: ['River Discharge Telemetry', 'Basin Inundation Bulletins', 'Dam Inflow Warnings'],
    verifiedDate: '2026-09-15'
  },

  // NDRF Battalions
  {
    id: 'res-ndrf-02',
    name: '2nd Battalion NDRF (Haringhata / Nadia)',
    category: 'ndrf_base',
    location: 'Haringhata, Nadia, West Bengal',
    state: 'West Bengal',
    country: 'India',
    coordinates: { lat: 22.956, lng: 88.564 },
    contactNumber: '033-25870020 / +91-9434742830',
    is24x7: true,
    capabilities: ['Flood & Cyclone Water Rescue (IRB Boat Teams)', 'Collapsed Structure Search & Rescue (CSSR)', 'CBRN Tactical Team'],
    verifiedDate: '2026-09-20'
  },
  {
    id: 'res-ndrf-03',
    name: '3rd Battalion NDRF (Mundali / Cuttack)',
    category: 'ndrf_base',
    location: 'Mundali, Cuttack, Odisha',
    state: 'Odisha',
    country: 'India',
    coordinates: { lat: 20.442, lng: 85.789 },
    contactNumber: '0671-2879711',
    is24x7: true,
    capabilities: ['Coastal Cyclone Evacuation Units', 'Deep Diving Search', 'Canine Search Units'],
    verifiedDate: '2026-09-20'
  },
  {
    id: 'res-ndrf-08',
    name: '8th Battalion NDRF (Ghaziabad / NCR)',
    category: 'ndrf_base',
    location: 'Govindpuram, Ghaziabad, Uttar Pradesh',
    state: 'Uttar Pradesh',
    country: 'India',
    coordinates: { lat: 28.694, lng: 77.472 },
    contactNumber: '0120-2766013',
    is24x7: true,
    capabilities: ['Heavy Urban Search & Rescue (USAR)', 'Earthquake Heavy Machinery Clearing', 'Air-Droppable First Responder'],
    verifiedDate: '2026-09-20'
  },
  {
    id: 'res-ndrf-01',
    name: '1st Battalion NDRF (Guwahati / Patgaon)',
    category: 'ndrf_base',
    location: 'Patgaon, Rani, Kamrup Rural, Assam',
    state: 'Assam',
    country: 'India',
    coordinates: { lat: 26.078, lng: 91.615 },
    contactNumber: '0361-2849005',
    is24x7: true,
    capabilities: ['Himalayan Riverine Flood Operations', 'Landslide Excavation Teams', 'Mountain Rescue Specialists'],
    verifiedDate: '2026-09-20'
  },

  // Major Tertiary Hospitals & Trauma Centers
  {
    id: 'res-hosp-aiims-delhi',
    name: 'AIIMS Apex Trauma Centre, New Delhi',
    category: 'hospital',
    location: 'Ch. Dilip Singh Marg, Safdarjung Enclave, New Delhi',
    state: 'Delhi',
    country: 'India',
    coordinates: { lat: 28.5672, lng: 77.21 },
    contactNumber: '011-26731000 / 102',
    is24x7: true,
    capabilities: ['Level 1 Polytrauma Surgery', 'Mass Casualty Decontamination', 'Helipad Facility', 'Critical Care ICU'],
    verifiedDate: '2026-10-01'
  },
  {
    id: 'res-hosp-sskm-kolkata',
    name: 'SSKM Hospital & IPGME&R Super Specialty Block',
    category: 'hospital',
    location: '244, AJC Bose Road, Bhowanipore, Kolkata',
    state: 'West Bengal',
    country: 'India',
    coordinates: { lat: 22.5392, lng: 88.3426 },
    contactNumber: '033-22231589 / 102',
    is24x7: true,
    capabilities: ['Regional Level-1 Trauma Centre', 'Burn Unit', 'Emergency Blood Bank', 'Disaster Triage Zone'],
    verifiedDate: '2026-10-01'
  },
  {
    id: 'res-hosp-scb-cuttack',
    name: 'SCB Medical College & Hospital Emergency Centre',
    category: 'hospital',
    location: 'Manglabag, Cuttack, Odisha',
    state: 'Odisha',
    country: 'India',
    coordinates: { lat: 20.478, lng: 85.885 },
    contactNumber: '0671-2414080',
    is24x7: true,
    capabilities: ['Coastal Cyclone Trauma Ward', 'Snakebite Envenomation Center', '24x7 Emergency Dialysis'],
    verifiedDate: '2026-09-25'
  },

  // Multi-Hazard Shelters & Coastal Shelters
  {
    id: 'res-shel-digha',
    name: 'Multi-Purpose Cyclone Shelter - New Digha',
    category: 'shelter',
    location: 'Near Foreshore Road, New Digha, Purba Medinipur',
    state: 'West Bengal',
    country: 'India',
    coordinates: { lat: 21.625, lng: 87.514 },
    contactNumber: '03220-266222',
    is24x7: true,
    capabilities: ['Capacity: 2,500 Persons', 'Solar Power Backed Water Filtration', 'Elevated Livestock Deck', 'First Aid Post'],
    verifiedDate: '2026-09-18'
  },
  {
    id: 'res-shel-gosaba',
    name: 'Sundarbans Riverine Cyclone & Flood Safe Shelter',
    category: 'shelter',
    location: 'Gosaba Island, South 24 Parganas',
    state: 'West Bengal',
    country: 'India',
    coordinates: { lat: 22.164, lng: 88.808 },
    contactNumber: '03218-236202',
    is24x7: true,
    capabilities: ['Reinforced Concrete Piles', 'Rainwater Harvesting Plant', 'Satellite VHF Link', 'Capacity: 1,800'],
    verifiedDate: '2026-09-18'
  },
  {
    id: 'res-shel-puri',
    name: 'OSDMA Model Multi-Purpose Cyclone Shelter - Puri Coastal Belt',
    category: 'shelter',
    location: 'Konark Marine Drive, Puri District',
    state: 'Odisha',
    country: 'India',
    coordinates: { lat: 19.821, lng: 85.845 },
    contactNumber: '06752-222384',
    is24x7: true,
    capabilities: ['Cat 5 Wind Resistant (260 km/h)', 'Emergency Rations Stock', 'Disaster Ham Radio Station'],
    verifiedDate: '2026-09-18'
  },

  // Fire & Rescue Stations
  {
    id: 'res-fire-kolkata-hq',
    name: 'West Bengal Fire & Emergency Services Directorate HQ',
    category: 'fire_station',
    location: '13D, Mirza Ghalib Street, Free School Street, Kolkata',
    state: 'West Bengal',
    country: 'India',
    coordinates: { lat: 22.556, lng: 88.354 },
    contactNumber: '101 / 033-22521165',
    is24x7: true,
    capabilities: ['Hydraulic Skylifts (68m)', 'High-Pressure Pumping Units', 'Hazmat Containment Tender'],
    verifiedDate: '2026-10-01'
  },
  {
    id: 'res-fire-delhi-hq',
    name: 'Delhi Fire Service Headquarters',
    category: 'fire_station',
    location: 'Connaught Place, Barakhamba Road, New Delhi',
    state: 'Delhi',
    country: 'India',
    coordinates: { lat: 28.631, lng: 77.228 },
    contactNumber: '101 / 011-23414000',
    is24x7: true,
    capabilities: ['Special Rescue Tenders', 'Thermal Imaging Drones', 'Chemical Foam Extinguishers'],
    verifiedDate: '2026-10-01'
  }
];

export const SAFETY_CHECKLISTS = [
  {
    hazard: 'Earthquake',
    type: 'earthquake' as const,
    immediateSteps: [
      'DROP to your hands and knees.',
      'COVER your head and neck under a sturdy table or desk.',
      'HOLD ON to your shelter until shaking completely stops.',
      'Stay away from windows, hanging objects, mirrors, and tall bookcases.'
    ],
    aftermathSteps: [
      'Expect aftershocks within minutes to hours.',
      'Check for gas leaks: do not turn on switches or light lighters if you smell gas.',
      'Wear sturdy shoes to protect against shattered glass.',
      'Monitor PRALAY AI and official broadcast channels for building safety advisories.'
    ]
  },
  {
    hazard: 'Cyclone & Extreme Storm',
    type: 'cyclone' as const,
    immediateSteps: [
      'Secure loose outdoor items: tin roofs, corrugated sheets, potted plants.',
      'Board up or tape glass window panes diagonally.',
      'Keep mobile phones, power banks, and flashlights fully charged.',
      'Do not venture outside during the lull when the eye passes over.'
    ],
    aftermathSteps: [
      'Avoid downed electric wires and inundated poles.',
      'Drink only boiled or treated water to prevent cholera and gastroenteritis.',
      'Do not enter partially collapsed buildings until cleared by engineers.'
    ]
  },
  {
    hazard: 'Flood & Flash Inundation',
    type: 'flood' as const,
    immediateSteps: [
      'Move to higher ground immediately; do not wait for instructions if water is rising.',
      'Turn off main electrical breaker and gas cylinders before evacuating.',
      'Never drive or wade through floodwater: 15cm of flowing water can knock an adult down, and 30cm can float a vehicle.',
      'Keep your emergency Go-Bag in a waterproof sealed plastic pouch.'
    ],
    aftermathSteps: [
      'Beware of snakes and dangerous wildlife seeking refuge on higher structures.',
      'Throw away food that has come into contact with floodwater.',
      'Clean and disinfect everything that got wet to prevent mold and bacterial contamination.'
    ]
  },
  {
    hazard: 'Wildfire',
    type: 'wildfire' as const,
    immediateSteps: [
      'Evacuate immediately if an evacuation order or warning is issued.',
      'Shut off propane tanks and turn off air conditioning units.',
      'Wear N95 masks to protect lungs from fine particulate matter (PM2.5).',
      'Keep car fuel tank full and back into driveway for rapid exit.'
    ],
    aftermathSteps: [
      'Do not return home until emergency officials declare it safe.',
      'Check attic and eaves for hidden burning embers or smoke.',
      'Wet down debris and perimeter hot spots if safe to do so.'
    ]
  }
];
