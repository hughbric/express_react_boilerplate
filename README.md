# Express/React App
Initial setup for an Express/React app.

### How to use

- #### Server

  Navigate to the root file and run `node server/index.js` to start the server.

  For development it's better to run `npm run dev` so that the server is automatically restarted when file changes are made.

- #### Client

  Navigate into the client folder and start the `create-react-app` with `npm start`

### About the Architecture

On production, `"heroku-postbuild": "cd client && yarn && yarn run build"` is run, switching to the client and creating a build folder.

This build folder contains an optimised `index.html` which will be used as the client and which is loaded onto a route in the `server/index.js` with this:
```
app.get('/*', (req, res) => {
  res
    .set('Content-Security-Policy', "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
    .sendFile(path.join(__dirname, '../client/build', 'index.html'));
});
```

The server is the run with `npm start` which executes `"start": "node server/index.js"` - running the server and loading the express server in `sever/index.js`. 

Any path, other than defined paths, will have the React client index displayed.

### Quick-setup: Setting up your own Express/React app?

Navigate into your project folder.

terminal:
```
npm init -y

npm i express

npx create-react-app client

npm install -D nodemon

npm install morgan
npm install --save helmet
npm install --save cors
npm install --save express-rate-limit
npm install serve-favicon

```

client/package.json:
```
“proxy”: “http://localhost:8080”,
```

/package.json:
```
{
  "name": "Express/React App",
  "version": "1.0.0",
  "description": "Express/React App",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node server/index.js",
	  "heroku-postbuild": "cd client && yarn && yarn run build",
    "dev": "nodemon server/index.js",
    "server": "node server/index.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "nodemon": "^2.0.7"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.17.1",
    "express-rate-limit": "^5.2.6",
    "helmet": "^4.4.1",
    "morgan": "^1.10.0",
    "serve-favicon": "^2.5.0"
  },
  "engines": {
    "node": ">= 6.0.0"
  }
}

```


Run dev in root folder:
`npm run dev`

server/index.js:
```
const express = require('express');
const morgan = require('morgan')
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
var favicon = require('serve-favicon')
var path = require('path')

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100
});

const app = express();

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// Serve Favicon
app.use(favicon(path.join(__dirname, '../client/public', 'favicon.ico')))

// Whitelist
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
app.use(morgan('common'))
app.use(helmet());
app.use(cors(corsOptions));
app.use(limiter);

app.get('/', (req, res) => {
  res.json({
    message: 'Hello Stranger! How are you?',
  });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

// Port
const port = process.env.PORT ||8080;

// Listen
app.listen(port, ()=>{
    console.log(`Listening on port: ${port}`)
})

```