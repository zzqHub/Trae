const express = require('express');
const router = express.Router();
const plcopenGenerator = require('../utils/plcopenGenerator');

router.post('/generate', async (req, res) => {
  try {
    const { stations, modules, ioPoints } = req.body;
    const xml = plcopenGenerator.generate(stations, modules, ioPoints);
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', 'attachment; filename="plcopen_project.xml"');
    res.send(xml);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/generateFromConfig', async (req, res) => {
  try {
    const fs = require('fs');
    const stations = JSON.parse(fs.readFileSync('./data/stations.json', 'utf8')).stations;
    const modules = JSON.parse(fs.readFileSync('./data/modules.json', 'utf8')).modules;
    const ioPoints = JSON.parse(fs.readFileSync('./data/ioTable.json', 'utf8')).ioPoints;
    
    const xml = plcopenGenerator.generate(stations, modules, ioPoints);
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', 'attachment; filename="plcopen_project.xml"');
    res.send(xml);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/preview', async (req, res) => {
  try {
    const fs = require('fs');
    const stations = JSON.parse(fs.readFileSync('./data/stations.json', 'utf8')).stations;
    const modules = JSON.parse(fs.readFileSync('./data/modules.json', 'utf8')).modules;
    const ioPoints = JSON.parse(fs.readFileSync('./data/ioTable.json', 'utf8')).ioPoints;
    
    const xml = plcopenGenerator.generate(stations, modules, ioPoints);
    res.setHeader('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;