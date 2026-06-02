const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const multer = require('multer');

const dataPath = path.join(__dirname, '../data/ioTable.json');
const upload = multer({ dest: 'uploads/' });

router.get('/', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    res.json(data.ioPoints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const ioPoint = data.ioPoints.find(i => i.id === req.params.id);
    if (ioPoint) {
      res.json(ioPoint);
    } else {
      res.status(404).json({ error: 'IO点未找到' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const newIoPoint = {
      ...req.body,
      id: req.body.id || generateIoId(data.ioPoints)
    };
    data.ioPoints.push(newIoPoint);
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    res.json(newIoPoint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const index = data.ioPoints.findIndex(i => i.id === req.params.id);
    if (index !== -1) {
      data.ioPoints[index] = { ...data.ioPoints[index], ...req.body };
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
      res.json(data.ioPoints[index]);
    } else {
      res.status(404).json({ error: 'IO点未找到' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    data.ioPoints = data.ioPoints.filter(i => i.id !== req.params.id);
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    res.json({ message: 'IO点已删除' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/import', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传文件' });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    const ioPoints = jsonData.map(row => ({
      id: row['地址'] || row['ID'] || row['Address'],
      name: row['名称'] || row['Name'] || row['名称'],
      type: row['类型'] || row['Type'] || row['类型'],
      description: row['描述'] || row['Description'] || row['描述'] || '',
      station: row['工位'] || row['Station'] || row['工位'] || '',
      module: row['模块'] || row['Module'] || row['模块'] || ''
    })).filter(item => item.id);

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    data.ioPoints = ioPoints;
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

    fs.unlinkSync(req.file.path);
    res.json({ message: 'IO表导入成功', count: ioPoints.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/export', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const worksheet = xlsx.utils.json_to_sheet(data.ioPoints);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'IO表');
    
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="io_table.xlsx"');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function generateIoId(existingPoints) {
  const maxNum = existingPoints.reduce((max, p) => {
    const match = p.id.match(/[IQ](\d+)\.(\d+)/);
    if (match) {
      const val = parseInt(match[1]) * 10 + parseInt(match[2]);
      return Math.max(max, val);
    }
    return max;
  }, 0);
  const newNum = maxNum + 1;
  return `I${Math.floor(newNum / 10)}.${newNum % 10}`;
}

module.exports = router;