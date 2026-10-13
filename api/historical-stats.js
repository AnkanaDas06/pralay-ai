// Vercel Serverless Function: /api/disasters/historical-stats

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  res.status(200).json({
    success: true,
    stats: {
      totalDisasters: 26,
      criticalCount: 16,
      highCount: 8,
      moderateCount: 2,
      byHazardType: {
        cyclone: 8,
        earthquake: 8,
        flood: 5,
        landslide: 3,
        wildfire: 2
      },
      byYear: {
        "2001": 1,
        "2004": 1,
        "2011": 1,
        "2015": 1,
        "2018": 1,
        "2019": 1,
        "2020": 2,
        "2021": 1,
        "2023": 2,
        "2024": 1
      },
      totalAffectedPopulation: 385000000,
      totalCasualties: 298000
    }
  });
}
