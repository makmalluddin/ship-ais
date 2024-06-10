const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const port = 8080;

mongoose.connect('mongodb://localhost:27017/ais', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
});

const DataSchema = new mongoose.Schema({
  mmsi: Number,
  speed: Number,
  accuracy: Boolean,
  longitude: Number,
  latitude: Number,
  course: Number,
  heading: Number
}, { collection: 'newdata' });

const Data = mongoose.model('Data', DataSchema);

// Middleware to serve static files
app.use(express.static(path.join(__dirname)));

app.get('/data', async (req, res) => {
  try {
    const data = await Data.find();
    res.json(data);
  } catch (error) {
    console.error('Error fetching data', error);
    res.status(500).send(error);
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, async () => {
  console.log(`Server running at http://localhost:${port}`);

  // Dynamically import `open`
  const { default: open } = await import('open');
  open(`http://localhost:${port}`);
});
