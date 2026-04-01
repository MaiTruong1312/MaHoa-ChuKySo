const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/css', express.static(path.join(__dirname, '../frontend/css')));
app.use('/js', express.static(path.join(__dirname, '../frontend/js')));
app.use('/assets', express.static(path.join(__dirname, '../frontend/assets')));

// Require routes
const apiRoutes = require('./routes/api');
const pageRoutes = require('./routes/pages');

app.use('/api', apiRoutes);
app.use('/', pageRoutes);

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Simple Mode URL: http://localhost:${PORT}/`);
    console.log(`Advanced Mode URL: http://localhost:${PORT}/advanced`);
  });
}

module.exports = app;
