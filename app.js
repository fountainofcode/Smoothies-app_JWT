const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')

const authRoutes = require('./routes/authRoutes')
const { requireAuth, checkUser } = require('./middleware/authMiddleware')

const app = express()

// middleware
app.use(express.static('public'))
app.use(express.json())
app.use(cookieParser())

// view engine
app.set('view engine', 'ejs')

// DB and Server Connection
const dbURI = "mongodb://localhost:25254/node_awt_smoothies" //port no. needed here 'coz I had changed my laptop's mongoDB port to this

mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
  .then(() => {
    console.log('connected to database')  
    app.listen(4000)
  })
  .then(() => console.log('server listening for request on port 4000'))
  .catch((err) => console.log(err))

// routes
app.get('*', checkUser)
app.get('/', (req, res) => res.render('home'))
app.get('/smoothies', requireAuth, (req, res) => res.render('smoothies'))
app.use(authRoutes)

// cookies
app.get('/set-cookies', (req, res) => {
  // res.setHeader('Set-Cookie', 'newUser=true')

  //With cookie-parser
  res.cookie('newUser', false)
  res.cookie('isEmployee', true, { maxAge: 1000*60*60*24})
  // more options with cookie-parser
  // res.cookie('isEmployee', true, { maxAge: 1000*60*60*24, secure: true})
  // res.cookie('isEmployee', true, { maxAge: 1000*60*60*24, httpOnly: true})

  res.send('you got cookies!')
})

app.get('/read-cookies', (req, res) => {
  const cookies = req.cookies
  console.log(cookies)
  console.log(cookies.newUser)
  res.json(cookies)
  
})
