const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UsersDb = require("../users/users-model.js");
const secrets = require("../config/secrets.js");

router.post("/register", (req, res) => {
  let user = req.body;

  const hash = bcrypt.hashSync(user.password, 8);
  user.password = hash;

  UsersDb.add(user)
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

router.post("/login", (req, res) => {
  let { username, password } = req.body;

  UsersDb.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = generateToken(user);

        res.status(200).json({ message: `Welcome ${user.username}!`, token });
      } else {
        res.status(401).json({ message: "Invalid Credentials" });
      }
    })
    .catch(error => {
      res.status(500).json({ message: "Error logging in!" });
    });
});

function generateToken(user) {
  const payload = {
    subject: user.id, // sub
    username: user.username
    // ...any other data
  };
  const options = {
    expiresIn: "8h"
  };

  return jwt.sign(payload, secrets.jwtSecret, options);
}

module.exports = router;
