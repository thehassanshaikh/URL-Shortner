const express = require('express');
const app = express();
const { MongoClient, ObjectId } = require('mongodb'); // Import ObjectId from 'mongodb'

//environment variables
require('dotenv').config();

const shortid = require('shortid');

const PORT = process.env.PORT || 4000;
const MONGODB_URL = process.env.ATLAS_URI;
const DB_NAME = 'testurls'; //Users

let db;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', async (req, res) => {
  try {
    const urls = await db.collection('urls').find({}).toArray();
    const baseUrl = req.protocol + '://' + req.get('host');
    res.render('index', { urls, baseUrl });
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

  if (!originalUrl.trim()) {
    // Return an error response
    return res.status(400).send('Please enter a valid URL');
  }

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

//for deleting the data
app.post('/delete/:id', async (req, res) => {
    const urlId = req.params.id;
  
    try {
      const result = await db.collection('urls').deleteOne({ _id: new ObjectId(urlId) });
      if (result.deletedCount === 1) {
        console.log('URL deleted successfully');
      } else {
        console.log('URL not found');
      }
      res.redirect('/');
    } catch (error) {
      console.error('Error deleting URL:', error);
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