const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

const MEDIA_DIR = path.join(__dirname, '../data/media');
const DB_PATH = path.join(__dirname, '../data/letty.db');
const dbModule = require('./db');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

// ensure and init the SQLite DB (async startup)
dbModule.init().catch(err => { console.error('Failed to init DB', err); });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

ensureDir(MEDIA_DIR);
ensureDir(path.dirname(DB_PATH));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, MEDIA_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  }
});

const upload = multer({ storage });

// Serve a minimal UI from frontend/public
app.use('/', express.static(path.join(__dirname, '../frontend/public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// Upload endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  const { course, semester, year, materialType } = req.body;
  const file = req.file;
  if (!file) return res.status(400).json({ ok: false, error: 'No file uploaded' });
  const db = dbModule.db;
  const id = uuidv4();
  const ext = path.extname(file.originalname).toLowerCase();
  let content = '';
  // Naive text extraction for text-like files
  try {
    if (['.txt', '.md', '.mdx', '.json'].includes(ext)) {
      content = fs.readFileSync(file.path, 'utf8');
    }
  } catch (e) {
    console.warn('Text extraction skipped for', file.originalname, e.message);
  }

  const material = {
    id,
    filename: file.filename,
    originalname: file.originalname,
    path: file.path,
    course,
    semester,
    year,
    type: materialType || 'unknown',
    content,
    uploadedAt: new Date().toISOString()
  };

  // insert into SQLite
  await db.runAsync(
    `INSERT INTO materials (id, filename, originalname, path, course, semester, year, type, content, uploadedAt) VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [material.id, material.filename, material.originalname, material.path, material.course, material.semester, material.year, material.type, material.content, material.uploadedAt]
  );
  res.json({ ok: true, material });
});

// List materials
app.get('/api/materials', async (req, res) => {
  try {
    const materials = await dbModule.db.allAsync(`SELECT * FROM materials`);
    res.json({ ok: true, materials });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Simple QA over uploaded content (naive keyword search)
app.post('/api/qa', async (req, res) => {
  const { query } = req.body || {};
  const q = (query || '').toLowerCase();
  const words = q.split(/\s+/).filter(Boolean);
  try {
    const materials = await dbModule.db.allAsync(`SELECT * FROM materials`);
    const candidates = materials.map((m) => {
      const t = (m.content || '').toLowerCase();
      let score = 0;
      words.forEach((w) => { if (w && t.includes(w)) score += 1; });
      if (q && t.includes(q)) score += 2;
      return { m, score };
    }).filter(x => x.score > 0);

    candidates.sort((a, b) => b.score - a.score);
    const results = candidates.slice(0, 3).map(({ m, score }) => {
      const snippet = (m.content || '').slice(0, 200);
      return { id: m.id, title: m.originalname, snippet, score };
    });
    res.json({ ok: true, results });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Letty MVP backend listening on http://localhost:${PORT}`);
});
