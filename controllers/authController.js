const User = require('../models/User')
const jwt = require('jsonwebtoken')

// handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code)
  let errors = { email:'', password:'' }

  //incorrect email
  if(err.message === 'incorrect email') {
    errors.email = 'This email is not registered'
  }

  //incorrect password
  if(err.message === 'incorrect password') {
    errors.password = 'This password is incorrect'
  }

  // duplicate error code
  if(err.code === 11000) {
    errors.email = 'This email is already registered'
    return errors
  }

  // validation errors
  if(err.message.includes('user validation failed')) {
    // console.log(Object.values(err.errors))
    Object.values(err.errors).forEach(({properties}) => {
      // console.log(properties)
      // console.log(properties.path)
      // console.log(properties.message)
      
      errors[properties.path] = properties.message
    })
    
  }
  return errors
}

// create jwt token
const maxAge = 3*24*60*60
const createToken = (id) => {
  let token = jwt.sign({ id }, 'some jwt secret', {
    expiresIn: maxAge
  })
  // console.log('token', token)
  return token
}

module.exports.signup_get = (req, res) => {
  res.render('signup')
}

module.exports.login_get = (req, res) => {
  res.render('login')
}

module.exports.signup_post = async (req, res) => {
  const { email, password} = req.body
  try {
    // const user = await User.create({ email, password })
    // res.status(201).json(user)

    const user = await User.create({ email, password })
    const token = createToken(user._id)
    res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000})
    res.status(201).json({user: user._id})
  } catch (err) {
    // console.log(err)
    
    // handleErrors(err)
    // res.status(400).send('error, user not created')
    
    const errors = handleErrors(err)
    res.status(400).json({ errors })
  }
  // res.send('new signup')
}

module.exports.login_post = async (req, res) => {
  const { email, password} = req.body
  // console.log(req.body)
  // console.log(email, password)
  // res.send('user login')

  try {
    const user = await User.login(email, password)
    const token = createToken(user._id)
    res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000})
    
    res.status(200).json({user: user._id})
  } 
  catch (err) {
    const errors = handleErrors(err)
    res.status(400).json({ errors })  
  }
}

module.exports.logout_get = (req, res) => {
  res.cookie('jwt', '', { maxAge:1 })
  res.redirect('/')  
}