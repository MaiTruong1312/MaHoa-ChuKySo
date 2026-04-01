const express = require('express');
const path = require('path');

const router = express.Router();

// Route xử lý Simple Mode
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

// Route xử lý Advanced Mode
router.get('/advanced', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/advanced.html'));
});

// Route xử lý Tamper Lab (Hacker Mode)
router.get('/tamper-lab', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/tamper-lab.html'));
});

module.exports = router;
