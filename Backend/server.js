require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const aiorchestrator = require('./aiorchestrator');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '10mb' }));
app.use(fileUpload());
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../frontend/index.html')));
app.post('/predict', async (req, res) => {
    const { text } = req.body;
    const response = await aiorchestrator.orchestrateAI('chat', text);
    res.json({ response });
});
app.post('/ocr', async (req, res) => {
    if (!req.files || !req.files.image) return res.status(400).send('No file uploaded');
    const image = req.files.image;
    const response = await aiorchestrator.orchestrateAI('image', image);
    res.json({ response });
});

app.listen(PORT, () => console.log("Server running on port " + PORT));
