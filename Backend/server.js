'use strict';
require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
// The orchestrator is stored at the repository root, one level above Backend/.
const aiorchestrator = require('../aiorchestrator');

const app = express();
const PORT = Number(process.env.PORT || 10000);
const frontendDir = path.join(__dirname, '../Front end');
app.disable('x-powered-by');
app.use(bodyParser.json({ limit: '10mb' }));
app.use(fileUpload({ limits: { fileSize: 10 * 1024 * 1024 }, abortOnLimit: true, responseOnLimit: 'File exceeds 10 MB limit.' }));
app.use(express.static(frontendDir));

app.get('/health', (_req, res) => res.json({ ok: true, app: 'Mobile AI OS' }));
app.get('/', (_req, res) => res.sendFile(path.join(frontendDir, 'index.html')));
app.post('/predict', async (req, res) => {
  try {
    const text = String(req.body?.text || '').trim();
    if (!text) return res.status(400).json({ error: 'Text is required.' });
    const response = await aiorchestrator.orchestrateAI('chat', text);
    return res.json({ response });
  } catch (error) {
    console.error('Prediction failed:', error.message);
    return res.status(500).json({ error: 'Unable to process the request.' });
  }
});
app.post('/ocr', async (req, res) => {
  try {
    if (!req.files?.image) return res.status(400).json({ error: 'No image uploaded.' });
    const response = await aiorchestrator.orchestrateAI('image', req.files.image);
    return res.json({ response });
  } catch (error) {
    console.error('Image processing failed:', error.message);
    return res.status(500).json({ error: 'Unable to process the image.' });
  }
});
app.listen(PORT, '0.0.0.0', () => console.log('Mobile AI OS listening on ' + PORT));
