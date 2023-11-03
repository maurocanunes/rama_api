const express = require('express');
const config = require('./controllers/config');
const bodyParser = require('body-parser');
const cors = require('cors');
const pg = require('knex')({
    client: 'pg',
    connection: {
      host: config.DB_HOST,
      port: config.DB_PORT,
      user: config.DB_USER,
      database: config.DB_NAME,
      password: config.DB_PASSWORD
    }
  });

const login = require('./controllers/login');
const job = require('./controllers/job');

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/', job.handleGetJobList(pg))
app.get('/job/:id', job.handleGetJobById(pg))
app.post('/job', job.handleInsertJob(pg))
app.post('/register', login.handleRegister(pg))
app.post('/login', login.handleSignIn(pg))

app.listen(3000, () => {
    console.log('server running on port 3000');
});


/**
 * home -> get
 * signin -> post
 * register -> post
 * job -> post
 * 
 */