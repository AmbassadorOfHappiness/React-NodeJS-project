const bcryptjs = require("bcryptjs");
const bcrypt = require("bcryptjs/dist/bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
const { Router } = require("express");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");

const routes = Router();

// /api/auth/register
routes.post(
  '/register',
  [
    check('email', 'Incorrect email').isEmail(), 
    check('password', 'Minimal password length 6 characters').isLength({min: 6}) 
  ],
  async(req, res) => {
  try {
    const errors = validationResult(req);
    if(!error.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: 'Incorrect data during registration'
      })
    }
    const {email, password} = req.body;
    const candidate = await User.findOne({email});
    if (candidate) {
      return res.status(400).json({message: 'User already exists'})
    }

    const hashedPassword = await bcryptjs.hash(password, 12);
    const user = new User({ email, password: hashedPassword });

    await user.save();

    res.status(201).json({message: 'User created'})

  } catch (error) {
    res.status(500).json({ message: 'Something wrong'})
  }
});

// /api/auth/login
routes.post(
  '/login', 
  [
    check('email', 'Please enter a valid email').normalizeEmail().isEmail(), 
    check('password', 'Enter password').exists() 
  ],
  async(req, res) => {
  try {
    const errors = validationResult(req);
    if(!error.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: 'Incorrect login details'
      })
    }
    
    const {email, password} = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({message: 'User is not found'})
    };

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) {
      return res.status(400).json({ message: 'Wrong password, please try again'})
    };

    const token = jwt.sign(
      {userId: user.id},
      config.get('jwtSecret'),
      { expiresIn: '3h'}
    )

    res.json({ token, userId: user.id});
    
  } catch (error) {
    res.status(500).json({ message: 'Something wrong'})
  }
});

module.exports = routes;