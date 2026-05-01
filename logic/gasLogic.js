const fs = require('fs');
const path = require('path');

// Helper to load the JSON data
const getStations = () => {
    const data = fs.readFileSync(path.join(__dirname, '../stations.json'), 'utf8');
    return JSON.parse(data); //
};

// Haversine Formula to calculate distance in miles
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3958.8; // Radius of Earth in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * 1. Find the absolute cheapest petrol in town
 */
const getCheapest = (fuelType = 'regular_petrol') => {
    const stations = getStations();
    return stations
        .filter(s => s.prices[fuelType] !== null)
        .sort((a, b) => a.prices[fuelType] - b.prices[fuelType])[0];
};

/**
 * 2. Find the closest station to the user
 */
const getClosest = (userLat, userLng) => {
    const stations = getStations();
    return stations.map(s => ({
        ...s,
        distance: calculateDistance(userLat, userLng, s.lat, s.lng)
    })).sort((a, b) => a.distance - b.distance)[0];
};

/**
 * 3. Calculate most "Affordable" (Price vs. Distance)
 * Formula: Cost to fill = (Gallons Needed * Price) + (Distance * 2 / MPG * Price)
 */
const getMostAffordable = (userLat, userLng, userMpg, gallonsNeeded, fuelType = 'regular_petrol') => {
    const stations = getStations();
    return stations
        .filter(s => s.prices[fuelType] !== null)
        .map(s => {
            const distance = calculateDistance(userLat, userLng, s.lat, s.lng);
            const travelCost = (distance * 2 / userMpg) * s.prices[fuelType];
            const fillCost = gallonsNeeded * s.prices[fuelType];
            return { ...s, totalProjectedCost: fillCost + travelCost, distance };
        })
        .sort((a, b) => a.totalProjectedCost - b.totalProjectedCost)[0];
};

module.exports = { getCheapest, getClosest, getMostAffordable };