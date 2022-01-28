const express = require('express');
const config = require ('config');
const mongoose = require('mongoose');

const app = express();

app.use('/api/auth', require('./routes/auth.routes'))

const PORT = config.get('PORT') || 3001;

async function start() {
  try {
    await mongoose.connect(config.get('mongoUri'), {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
  } catch (error) {
    console.log('Server Error', error.message);
    process.exit(1)
  }
}

start()

app.listen(PORT, () => console.log(`App has been started on port ${PORT}!`))