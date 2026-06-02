const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/stations.json');

router.get('/', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    res.json(data.stations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const station = data.stations.find(s => s.id === req.params.id);
    if (station) {
      res.json(station);
    } else {
      res.status(404).json({ error: '工位未找到' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const newStation = {
      id: `ST${String(data.stations.length + 1).padStart(3, '0')}`,
      ...req.body,
      order: data.stations.length + 1
    };
    data.stations.push(newStation);
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    res.json(newStation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const index = data.stations.findIndex(s => s.id === req.params.id);
    if (index !== -1) {
      data.stations[index] = { ...data.stations[index], ...req.body };
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
      res.json(data.stations[index]);
    } else {
      res.status(404).json({ error: '工位未找到' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    data.stations = data.stations.filter(s => s.id !== req.params.id);
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    res.json({ message: '工位已删除' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/order', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const { newOrder } = req.body;
    const stationIndex = data.stations.findIndex(s => s.id === req.params.id);
    
    if (stationIndex === -1) {
      return res.status(404).json({ error: '工位未找到' });
    }

    const station = data.stations.splice(stationIndex, 1)[0];
    data.stations.splice(newOrder - 1, 0, station);
    
    data.stations.forEach((s, i) => {
      s.order = i + 1;
    });

    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    res.json(data.stations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;