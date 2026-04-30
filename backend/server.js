const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

const MEDIA_DIR = path.join(__dirname, '../data/media');
const DB_PATH = path.join(__dirname, '../data/db.json');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function loadDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const init = { materials: [], history: [] };
      fs.writeFileSync(DB_PATH, JSON.stringify(init, null, 2));
      return init;
    }
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('DB read error', e);
    return { materials: [], history: [] };
  }
}

function saveDB(db) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error('DB write error', e);
  }
}

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
app.post('/api/upload', upload.single('file'), (req, res) => {
  const { course, semester, year, materialType } = req.body;
  const file = req.file;
  if (!file) return res.status(400).json({ ok: false, error: 'No file uploaded' });

  const db = loadDB();
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

  db.materials.push(material);
  saveDB(db);
  res.json({ ok: true, material });
});

// List materials
app.get('/api/materials', (req, res) => {
  const db = loadDB();
  res.json({ ok: true, materials: db.materials });
});

// Simple QA over uploaded content (naive keyword search)
app.post('/api/qa', (req, res) => {
  const { query } = req.body || {};
  const db = loadDB();
  const q = (query || '').toLowerCase();
  const words = q.split(/\s+/).filter(Boolean);

  const candidates = db.materials.map((m) => {
    const t = (m.content || '').toLowerCase();
    let score = 0;
    words.forEach((w) => {
      if (w && t.includes(w)) score += 1;
    });
    if (q && t.includes(q)) score += 2;
    return { m, score };
  }).filter(x => x.score > 0);

  candidates.sort((a, b) => b.score - a.score);
  const results = candidates.slice(0, 3).map(({ m, score }) => {
    const snippet = (m.content || '').slice(0, 200);
    return { id: m.id, title: m.originalname, snippet, score };
  });

  res.json({ ok: true, results });
});

// Start server
app.listen(PORT, () => {
  console.log(`Letty MVP backend listening on http://localhost:${PORT}`);
});
