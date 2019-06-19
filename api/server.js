const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);


const usersRouter = require('../users/users-router.js');

const server = express();

const sessionConfig = {
  name: 'monkey', 
  secret: 'banana, foobar, hello world', 
  cookie: {
    maxAge: 1000 * 60 * 60, 
    secure: false, 
    httpOnly: true 
  },
  resave: false,
  saveUninitialized: true, 

 
  store: new KnexSessionStore({
    knex: require('../database/dbConfig'),
    tableName: 'sessions',
    sidfieldname: 'sid',
    createTable: true,
    clearInterval: 1000 * 60 * 60 
  })
};


server.use(session(sessionConfig));
server.use(helmet());
server.use(express.json());
server.use(cors());


server.use('/api/users', usersRouter);

server.get('/', (req, res) => {
  res.json('API WORKING' );
});

module.exports = server;
