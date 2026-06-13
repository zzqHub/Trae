const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

const dataDir = './data';
const uploadDir = './uploads';

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const plcopenRoutes = require('./routes/plcopen');
const ioTableRoutes = require('./routes/ioTable');
const stationRoutes = require('./routes/station');
const moduleRoutes = require('./routes/controlModule');

app.use('/api/plcopen', plcopenRoutes);
app.use('/api/io', ioTableRoutes);
app.use('/api/station', stationRoutes);
app.use('/api/module', moduleRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function startServer(startPort) {
  const server = app.listen(startPort, '0.0.0.0', () => {
    console.log(`服务器运行在 http://0.0.0.0:${startPort} (http://localhost:${startPort})`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`端口 ${startPort} 被占用，尝试 ${startPort + 1}...`);
      startServer(startPort + 1);
    } else {
      console.error('服务器启动错误:', err);
    }
  });
}
startServer(port);