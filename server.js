require('dotenv').config();
const express = require('express');
const upload = require('./utlis/upload.js');
require('colors');
const pool = require('./db/db.js');

const app = express();
const port = process.env.PORT || 8000;
app.use(express.static('public'));

function errorHandler(err, req, res, next) {
  console.log(err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).send(err.message);
}

app.post('/upload-profile-pic', upload.single('profile_pic'), async (req, res) => {
  console.log('hit endpoint single upload!');
  console.log(req.file);
  if (!req.file) return res.status(400).send(`<p>No file sent.</p><p><a href="/">Back</a></p>`);

  const name = req.file.originalname;
  const properFilePath = req.file.path.replaceAll('\\', '/').replace('public/', '');
  try {
    // Saving to db
    const results = await pool.query('INSERT INTO pictures(name, path) VALUES($1, $2)', [name, properFilePath]);
    if (results.rowCount === 1)
      return res.send(`<div><h2>Here's the picture:</h2><img width=250 src='${properFilePath}'/></div>`);
    else {
      throw new Error('Saving image failed');
    }
  } catch (error) {
    throw new Error(error);
  }
});

// app.post('/upload-cat-pics', upload.array('cat_pics'), (req, res) => {
//   console.log('hit multiple upload');
//   console.log(req.files);
//   if (req.files.length === 0) return res.status(400).send(`<p>No files sent.</p><p><a href="/">Back</a></p>`);

//   const images = req.files
//     .map((image) => `<img width=250 src='${image.path.replaceAll('\\', '/').replace('public/', '')}'/>`)
//     .join('');
//   res.send(`<div><h2>Here are the pictures:</h2>${images}</div>`);
// });
app.post('/upload-cat-pics', upload.array('cat_pics'), async (req, res) => {
  console.log('hit multiple upload');
  console.log(req.files);
  if (req.files.length === 0) return res.status(400).send(`<p>No files sent.</p><p><a href="/">Back</a></p>`);

  try {
    // Better solution possible with query construction -> https://vitaly-t.github.io/pg-promise/helpers.html
    const images = [];
    for (let file of req.files) {
      const name = file.originalname;
      const properFilePath = file.path.replaceAll('\\', '/').replace('public/', '');
      const results = await pool.query('INSERT INTO pictures(name, path) VALUES($1, $2)', [name, properFilePath]);
      if (results.rowCount !== 1) {
        throw new Error(`Saving image ${name} failed`);
      }
      images.push(`<img width=250 src='${properFilePath}'/>`);
    }
    const imagesHTML = images.join('');

    res.send(`<div><h2>Here are the pictures:</h2>${imagesHTML}</div>`);
  } catch (error) {
    throw new Error(error);
  }
});

app.get('/get-pics', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM pictures');
    console.log(rows);
    if (rows.length === 0) return res.status(404).send('No pictures found');

    const html = rows.map((pic) => `<p><a href="${pic.path}">${pic.name}</a></p>`).join('');

    res.send(`<h1>All pics</h1>${html}<a href="/">Back</a>`);
  } catch (error) {
    throw new Error(error);
  }
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(` Multer upload server listening on http://localhost:${port} `.bgGreen);
});
