
const express = require("express");
const bcrypt = require("bcryptjs");

const db = require("../database/dbConfig");
const Users = require("./users-model");

const router = express.Router();

router.get("/", restricted, (req, res) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});


router.post("/login", (req, res) => {
  let { username, password } = req.body;
  Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user = user;
        res.status(200).json({ message: `Welcome ${user.username}!` });
      } else {
        res.status(401).json({ message: "Invalid Credentials" });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});


router.post("/register", (req, res) => {
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, 10);
  user.password = hash;
  Users.add(user)
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});


router.get('/logout', (req, res) => {
  if(req.session) { // if someone is login then destory
    req.session.destroy(err => {
      if(err) { // if err exist or you can not destroy then do this
        res.send('you can checkout but you cannot leave....')
      } else{ //if destoryed then do this
        res.send('bye, thanks for playing')
      }
    })
  } else { // if there is no session then end request
    res.end();
  }
})

function restricted(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ message: "Not authorized" });
  }
}

module.exports = router;