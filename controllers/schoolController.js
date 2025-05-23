const pool = require('../models/db');

// Input validation
function validateSchoolInput(data) {
  const { name, address, latitude, longitude } = data;
  if (!name || typeof name !== 'string') return "Invalid or missing 'name'";
  if (!address || typeof address !== 'string') return "Invalid or missing 'address'";
  if (latitude === undefined || typeof latitude !== 'number' || latitude < -90 || latitude > 90) return "Invalid or missing 'latitude'";
  if (longitude === undefined || typeof longitude !== 'number' || longitude < -180 || longitude > 180) return "Invalid or missing 'longitude'";
  return null;
}

// Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  function toRad(x) { return x * Math.PI / 180; }

  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// POST /addSchool
exports.addSchool = async (req, res) => {
  const error = validateSchoolInput(req.body);
  if (error) return res.status(400).json({ error });

  const { name, address, latitude, longitude } = req.body;

  try {
    const [result] = await pool.execute(
      'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
      [name, address, latitude, longitude]
    );

    res.status(201).json({ message: 'School added successfully', schoolId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// GET /listSchools
exports.listSchools = async (req, res) => {
  const userLat = parseFloat(req.query.latitude);
  const userLon = parseFloat(req.query.longitude);

  if (isNaN(userLat) || userLat < -90 || userLat > 90)
    return res.status(400).json({ error: "Invalid or missing 'latitude'" });

  if (isNaN(userLon) || userLon < -180 || userLon > 180)
    return res.status(400).json({ error: "Invalid or missing 'longitude'" });

  try {
    const [schools] = await pool.query('SELECT * FROM schools');

    const sorted = schools.map(school => ({
      ...school,
      distance_km: calculateDistance(userLat, userLon, school.latitude, school.longitude)
    })).sort((a, b) => a.distance_km - b.distance_km);

    res.json(sorted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};
