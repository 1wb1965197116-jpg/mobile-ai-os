'use strict';
require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const aiorchestrator = require('../aiorchestrator');

const app = express();
const PORT = Number(process.env.PORT || 10000);
const frontendDir = path.join(__dirname, '../Front end');
app.disable('x-powered-by');
app.use(bodyParser.json({ limit: '10mb' }));
app.use(fileUpload({ limits: { fileSize: 10 * 1024 * 1024 }, abortOnLimit: true, responseOnLimit: 'File exceeds 10 MB limit.' }));
app.use(express.static(frontendDir));

const requests = new Map();
function aiRateLimit(maxRequests = 12, windowMs = 15 * 60 * 1000) {
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    let bucket = requests.get(key);
    if (!bucket || now >= bucket.resetAt) bucket = { count: 0, resetAt: now + windowMs };
    bucket.count += 1;
    requests.set(key, bucket);
    if (bucket.count > maxRequests) return res.status(429).json({ error: 'Too many AI requests. Please wait and try again.' });
    next();
  };
}

app.get('/health', (_req, res) => res.status(200).json({ ok: true, app: 'Mobile AI OS' }));
app.get('/', (_req, res) => res.sendFile(path.join(frontendDir, 'index.html')));

app.post('/predict', aiRateLimit(12), async (req, res) => {
  try {
    const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
    if (!text) return res.status(400).json({ error: 'Text is required.' });
    if (text.length > 12000) return res.status(413).json({ error: 'Text is too long.' });
    const response = await aiorchestrator.orchestrateAI('chat', text);
    return res.json({ response });
  } catch (error) {
    console.error('Prediction failed:', error.message);
    return res.status(503).json({ error: 'AI service is not configured or is temporarily unavailable.' });
  }
});

app.post('/ocr', aiRateLimit(6), async (req, res) => {
  try {
    if (!req.files?.image) return res.status(400).json({ error: 'No image uploaded.' });
    if (!String(req.files.image.mimetype || '').startsWith('image/')) return res.status(415).json({ error: 'Only image uploads are supported.' });
    const response = await aiorchestrator.orchestrateAI('image', req.files.image);
    return res.json({ response });
  } catch (error) {
    console.error('Image processing failed:', error.message);
    return res.status(503).json({ error: 'Image AI is not configured or is temporarily unavailable.' });
  }
});

app.listen(PORT, '0.0.0.0', () => console.log('Mobile AI OS listening on ' + PORT));
