const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/modules.json');

router.get('/', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    res.json(data.modules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const module = data.modules.find(m => m.id === req.params.id);
    if (module) {
      res.json(module);
    } else {
      res.status(404).json({ error: '模块未找到' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const newModule = {
      id: `M${String(data.modules.length + 1).padStart(3, '0')}`,
      ...req.body,
      functionBlocks: req.body.functionBlocks || []
    };
    data.modules.push(newModule);
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    res.json(newModule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const index = data.modules.findIndex(m => m.id === req.params.id);
    if (index !== -1) {
      data.modules[index] = { ...data.modules[index], ...req.body };
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
      res.json(data.modules[index]);
    } else {
      res.status(404).json({ error: '模块未找到' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    data.modules = data.modules.filter(m => m.id !== req.params.id);
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    res.json({ message: '模块已删除' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;