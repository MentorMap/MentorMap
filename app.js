const
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	devDBUrl = require('./passport/config/database.js').url,
	express = require('express'),
	favicon = require('serve-favicon'),
	flash = require('connect-flash'),
	logger = require('morgan'),
	mailjet = require('node-mailjet').connect('ec64965cdf208fb3897abc986fe6b36b', 'ed1ab3ce9f19eaa293436bd774809eb2'),
	mongoose = require('mongoose'),
	morgan = require('morgan'),
	passport = require('passport'),
	path = require('path'),
	session = require('express-session'),
	app = express(),
	PORT = process.env.PORT || 3000

// DEVELOPMENT VARIABLES
process.env.NODE_ENV = 'development'

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// serve statics
app.use(express.static(path.join(__dirname, 'public')))
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

// setup middleware
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(morgan('dev')) // log every request to the console

// ======passport configuration ===============================================================
mongoose.connect(process.env.MONGODB_URI || devDBUrl, { useMongoClient: true }) // connect to our database

require('./passport/config/passport')(passport, mailjet) // pass passport for configuration

// required for passport
app.use(session({
	secret: 'ilovescotchscotchyscotchscotch',
	resave: true,
	saveUninitialized: false,
})) // session secret
app.use(passport.initialize())
app.use(passport.session()) // persistent login sessions
app.use(flash()) // use connect-flash for flash messages stored in session
// ======end passport=========================================================================================

// route handlers
app.use('/auth', require('./routes/authentication.js'))
app.use('/mentee', require('./routes/mentee.js'))
app.use('/mentor', require('./routes/mentor.js'))
app.use('/db', require('./routes/db.js'))
app.use('/', require('./routes/index.js'))



// catch 404 and forward to error handler
app.use((req, res, next) => {
	var err = new Error('Not Found')
	err.status = 404
	next(err)
})

// error handler
app.use((err, req, res, next) => {
	console.log(err)

	// set locals, only providing error in development
	res.locals.message = err.message
	res.locals.error = req.app.get('env') === 'development' ? err : {}

	// render the error page
	res.status(err.status || 500)
	res.render('404')
})

app.listen(PORT)
