const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
require('dotenv').config();

const app = express();
const morgan = require('morgan');
app.use(morgan('dev'));
const PORT = process.env.PORT || 3000;

const MEDIA_DIR = path.join(__dirname, '../data/media');
const DB_PATH = path.join(__dirname, '../data/letty.db');

// Ensure directories exist before initializing DB
function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}
ensureDir(MEDIA_DIR);
ensureDir(path.dirname(DB_PATH));

const dbModule = require('./db');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  try {
    const { course, semester, year, materialType } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ ok: false, error: 'No file uploaded' });
    const db = dbModule.db;
    const id = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
  let content = '';
  // Text extraction for supported file types
  try {
    if (['.txt', '.md', '.mdx', '.json'].includes(ext)) {
      content = fs.readFileSync(file.path, 'utf8');
    } else if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(file.path);
      const data = await pdfParse(dataBuffer);
      content = data.text;
    } else if (['.png', '.jpg', '.jpeg'].includes(ext)) {
      const result = await Tesseract.recognize(file.path, 'eng');
      content = result.data.text;
    }
  } catch (e) {
    console.warn('Text extraction failed for', file.originalname, e.message);
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
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ ok: false, error: 'Failed to process upload' });
  }
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

// Helper function to highlight terms in text
function highlightTerms(text, terms) {
  if (!text || !terms.length) return text;
  // Escape regex special characters in terms
  const escapedTerms = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  // Create a regex that matches any of the terms (case-insensitive)
  const regex = new RegExp(`(${escapedTerms.join('|')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// Improved QA with phrase matching and highlighted snippets
app.post('/api/qa', async (req, res) => {
  const { query } = req.body || {};
  const q = (query || '').toLowerCase().trim();
  if (!q) {
    return res.json({ ok: true, results: [] });
  }
  const words = q.split(/\s+/).filter(Boolean);
  try {
    const materials = await dbModule.db.allAsync(`SELECT * FROM materials`);
    const candidates = materials.map((m) => {
      const t = (m.content || '').toLowerCase();
      let score = 0;
      // Exact phrase match (whole query) gets a high score
      if (t.includes(q)) {
        score += 10;
      }
      // Individual word matches
      words.forEach((w) => {
        if (w && t.includes(w)) {
          score += 1;
        }
      });
      return { m, score };
    }).filter(x => x.score > 0);

    // Sort by score descending
    candidates.sort((a, b) => b.score - a.score);
    // Take top 3
    const topCandidates = candidates.slice(0, 3);

    // Build results with highlighted snippets
    const results = topCandidates.map(({ m, score }) => {
      const content = m.content || '';
      // Find a snippet around the first occurrence of the query (if exists) or first word
      let snippet = '';
      const lowerContent = content.toLowerCase();
      let index = lowerContent.indexOf(q);
      if (index === -1 && words.length > 0) {
        // Fallback to first word
        index = lowerContent.indexOf(words[0]);
      }
      const start = Math.max(0, index - 100); // Show 100 chars before match
      const end = Math.min(content.length, index + 200); // Show 200 chars after match
      snippet = content.slice(start, end);
      // Add ellipsis if we cut off
      const prefix = start > 0 ? '...' : '';
      const suffix = end < content.length ? '...' : '';
      const highlightedSnippet = highlightTerms(prefix + snippet + suffix, words);
      return {
        id: m.id,
        title: m.originalname,
        snippet: highlightedSnippet, // HTML with <mark> tags
        score
      };
    });

    // Log QA to history (using the top result's material_id if available)
    const historyId = uuidv4();
    const topMaterialId = results.length > 0 ? results[0].id : null;
    const answerText = results.length > 0
      // For logging, we can store the plain text snippet (without highlights) or a summary
      ? results[0].snippet.replace(/<mark>|<\/mark>/g, '') // Strip tags for plain text
      : 'No relevant results found';
    await dbModule.db.runAsync(
      `INSERT INTO history (id, material_id, question, answer, createdAt) VALUES (?,?,?,?,?)`,
      [historyId, topMaterialId, q, answerText, new Date().toISOString()]
    );

    res.json({ ok: true, results });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Get QA history
app.get('/api/history', async (req, res) => {
  try {
    const history = await dbModule.db.allAsync(`SELECT * FROM history ORDER BY createdAt DESC`);
    res.json({ ok: true, history });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Start server (wait for DB init)
async function startServer() {
  try {
    await dbModule.init();
    app.listen(PORT, () => {
      console.log(`Letty MVP backend listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
