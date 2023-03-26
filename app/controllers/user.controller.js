const {genSaltSync, hashSync, compareSync} = require("bcrypt")
const db = require("../models")
const User = db.User
const Op = db.Sequelize.Op

exports.create = (req, res) => {
  if (!req.body.username
      || !req.body.email
      || !req.body.password
      || !req.body.phoneNumber) {
    res.status(400).send({
      message: "Content cannot be empty"
    })
    return
  }

  const salt = genSaltSync(10)
  const user = {
    id: req.body.id,
    username: req.body.username,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    password: hashSync(req.body.password, salt)
  }

  User.findOne({
    where: {
      [Op.or]: [
        {
          username: {
            [Op.eq]: user.username
          }
        },
        {
          email: {
            [Op.eq]: user.email
          }
        }
      ]
    }
  }).then(data => {
    if(data) {
      res.send({
        status: 0,
        message: "Email/Username already present"
      })
      return
    } else {
        User.create(user)
      .then(data => {
        res.send(data)
      })
      .catch(err => {
        res.status(500).send({
          message: err.message || "Something went wrong while creating the user"
        })
      })
    }
  })
}

exports.getUserByLogin = (req, res) => {
  const username = req.body.username
  const password = req.body.password

  if(!username || !password) {
    res.send({
      status: 0,
      message: "Both username and password are required"
    })
  }

  User.findOne({
    where: {
      username: {
        [Op.eq]: username
      }
    }
  }).then(data => {
    if (!data) {
      res.send({
        status: 0,
        message: "User not found with username: " + username
      })
      return
    }

    const pwdCheck = compareSync(password, data.password)
    if (pwdCheck) {
      data.password = undefined
      res.send({
        status: 1,
        message: "login successfully",
        username: username
      })
      return
    } else {
      return res.send({
        status: 2,
        message: "Invalid username or password"
      })
    }
  }).catch(err => {
    res.status(500).send({
      message: err.message || "Something went wrong please try again"
    })
  })
}
