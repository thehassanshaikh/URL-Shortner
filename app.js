const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
const shortid = require('shortid');

const PORT = 4000;
const MONGODB_URL = 'mongodb+srv://hassansh:Website123@cluster0.k72knya.mongodb.net/';
const DB_NAME = 'User';

let db;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', async (req, res) => {
  try {
    const urls = await db.collection('urls').find({}).toArray();
    res.render('index', { urls });
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

app.post('/shorten', async (req, res) => {
  const originalUrl = req.body.url;
  const shortCode = shortid.generate();

  const urlData = {
    originalUrl,
    shortCode,
  };

  try {
    await db.collection('urls').insertOne(urlData);
    res.redirect('/');
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});
  

app.post('/shorten', async (req, res) => {
  const originalUrl = req.body.url;
  const shortCode = shortid.generate();

  const urlData = {
    originalUrl,
    shortCode,
  };

  try {
    await db.collection('urls').insertOne(urlData);
    res.redirect('/');
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

app.get('/:shortCode', async (req, res) => {
  const shortCode = req.params.shortCode;
  const urlData = await db.collection('urls').findOne({ shortCode });

  if (!urlData) {
    res.status(404).send('URL not found');
  } else {
    res.redirect(urlData.originalUrl);
  }
});

async function connectDB() {
  const client = new MongoClient(MONGODB_URL, { useUnifiedTopology: true });

  try {
    await client.connect();
    db = client.db(DB_NAME);
    console.log('Connected to the database');
  } catch (error) {
    console.error('Error connecting to the database', error);
  }
}

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
