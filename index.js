const express = require('express');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');


const db = require('./database/dbConfig.js');
const Users = require('./users/users-model.js');

const server = express();

server.use(helmet());
server.use(express.json());


server.get('/', (req, res) => {
  res.send("API RUNNING");
});

server.post('/api/register', (req, res) => {
  let user = req.body;
  //hashing
  //generate a hash from user password, number determines how many rounds it takes to create user (how long)
  const hash = bcrypt.hashSync(user.password, 10)

  //override the user.password with the hash
  user.password = hash


  Users.add(user)
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.post('/api/login', (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        res.status(200).json({ message: `Welcome ${user.username}!` });
      } else {
        res.status(401).json({ message: 'Invalid Credentials' });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.get('/api/users', restricted,(req, res) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});


function restricted(req, res, next) {
    const { username, password } = req.headers;
  
    if (username && password) {
      Users.findBy({ username })
        .first()
        .then(user => {
          if (user && bcrypt.compareSync(password, user.password)) {
            next();
          } else {
            res.status(401).json({ message: 'You are not Authorized' });
          }
        })
        .catch(error => {
          res.status(500).json({ message: 'Unexpected Error', error });
        });
    } else {
      res.status(400).json({ message: 'No credentials provided' });
    }
  }

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));;