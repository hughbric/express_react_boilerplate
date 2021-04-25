const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
var favicon = require('serve-favicon');
var path = require('path');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100
});

const app = express();

app.use(express.static(path.join(__dirname, '../client/build')));
app.use(favicon(path.join(__dirname, '../client/public', 'favicon.ico')));

const whitelist = ['http://localhost:3000', 'http://localhost:8080'];

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) === -1 || !origin ) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
};

// Middlewares
app.use(morgan('common'));
app.use(helmet());
app.use(cors(corsOptions));
app.use(limiter);

app.get('/api/about', (req, res) => {
  res.json({
    message: 'Hello from the server.',
  });
});

app.get('/*', (req, res) => {
  res
    .set('Content-Security-Policy', "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
    .sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

const port = process.env.PORT || 8080;

app.listen(port, ()=>{
    console.log(`Listening on port: ${port}`)
});
