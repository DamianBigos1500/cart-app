const express = require('express')
const path = require('path')
const mongoose = require('mongoose');
const session = require('express-session')
const expressValidator = require('express-validator')
const expressMessages = require('express-messages')
const config = require('./config/database')
const fileUpload = require('express-fileupload')

// Connect to db
mongoose.connect(config.database, { useNewUrlParser: true, useUnifiedTopology: true })
.catch(err => console.log(err))
.then(() => {
  console.log('Connected to MongoDB')
})

// Init app
const app = express()

// View engine set up
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// Body parser middleware
app.use(express.urlencoded({ extended: false }))

// Set public folder
app.use(express.static(path.join(__dirname, 'public')))

// set global variable
app.locals.errors = null

// Express fileUpload middleware
app.use(fileUpload({
  limits: { fileSize: 100 * 1024 * 1024 },
}))

// Express Session middleware
//app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  // cookie: { secure: true }
}))

// Express Validator middleware

//
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Set routes
const pages = require('./routes/pages.js')
const adminPages = require('./routes/adminPages.js')
const adminCategories = require('./routes/adminCategories.js')
const adminProducts = require('./routes/adminProducts.js')

app.use('/admin/pages', adminPages)
app.use('/admin/categories', adminCategories)
app.use('/admin/products', adminProducts)
app.use('/', pages)

// Start server
const PORT = 3000
app.listen(PORT, () => console.log(`Server start on port ${PORT}`));