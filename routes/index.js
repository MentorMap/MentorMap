const express = require('express'),
	router = express.Router()


router.get('/', (req, res, next) => {
	res.render('index/index', {
		authenticated: req.isAuthenticated(),
		user: req.user,
	})

})

router.get('/dashboard', isLoggedIn, (req, res, next) => {
	if (req.user.role === 'mentor')
		res.redirect('/mentor/dashboard')
	else
		res.redirect('/mentee/dashboard')
})

router.get('/mentor-signup-request', (req, res, next) => {
	res.render('index/mentor_signup_request')
})

function isLoggedIn (req, res, next) {
	if (req.isAuthenticated())
		return next()
	res.redirect('/auth/login')
}

module.exports = router
