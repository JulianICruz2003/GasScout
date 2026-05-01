const express = require('express');
const router = express.Router();
const { getCheapest, getClosest, getMostAffordable } = require('./logic');

// Route to get the most affordable option
router.post('/calculate-best', (req, res) => {
    const { lat, lng, mpg, needed } = req.body;
    
    const bestOption = getMostAffordable(lat, lng, mpg, needed);
    
    res.json({
        success: true,
        recommendation: bestOption
    });
});

module.exports = router;