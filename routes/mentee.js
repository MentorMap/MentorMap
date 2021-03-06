const
	express = require('express'),
	router = express.Router(),
	User = require('../passport/models/user'),
	Session = require('../passport/models/session'),
	mailjet = require('../email_templates/email'),
	Mentorship = require('../passport/models/mentorship')

router.use('*', isLoggedIn, isEmailVerified, isMentee)

router.get('/register', (req, res, next) => {
	if (req.user.completed) return res.redirect('/mentee/dashboard')
	res.render('mentee/register', { user: req.user })
})

router.post('/register', (req, res, next) => {

	if (req.user.completed) return res.redirect('/dashboard')

	req.body.skills = req.body.skills.split(',')

	if (!(req.body.high_school_program instanceof Array))
		req.body.high_school_program = [ req.body.high_school_program ]
	if (!(req.body.preferred_program instanceof Array))
		req.body.preferred_program = [ req.body.preferred_program ]

	User.findByIdAndUpdate(req.user._id, {
		$set:
			{
				completed: true,
				'profile.gender': req.body.gender,
				'profile.phone': req.body.phone,
				'profile.age': req.body.age,
				'profile.avg_11': parseInt(req.body.avg_11),
				'profile.avg_12': parseInt(req.body.avg_12),
				'profile.high_school': req.body.high_school,
				'profile.grade': parseInt(req.body.grade),
				'profile.skills': req.body.skills,
				'profile.linkedin': req.body.linkedin,
				'profile.paragraphs': req.body.paragraphs,
				'profile.high_school_program': req.body.high_school_program,
				'profile.preferred_program': req.body.preferred_program,
				'profile.preferred_school': req.body.preferred_school,
			},
	})
		.then(() => {
			res.redirect('/dashboard')
		})
		.catch(err => {
			next(err)
		})


})

router.use('*', isRegCompleted, isTutorialComplete)

router.get('/dashboard', (req, res, next) => {
	res.render('mentee/dashboard', { user: req.user })
})

router.get('/my-mentors', (req, res, next) => {
	Mentorship.find({ mentee: req.user._id })
		.populate('mentor')
		.exec()
		.then(mentorships => {
			const mentorsArr = []
			for (var i = 0; i < mentorships.length; i++)
				mentorsArr.push(mentorships[i].mentor)
			res.render('common/profile_list', {
				user: req.user,
				profiles: mentorsArr,
				title: 'My Mentors',
			})
		})
		.catch(err => {
			next(err)
		})
})

router.get('/new-mentors', (req, res, next) => {
	Mentorship.find({ mentee: req.user._id }).exec()
		.then(mentorships => {
			const mentorsArr = [ ]
			for (var i = 0; i < mentorships.length; i++)
				mentorsArr.push(mentorships[i].mentor)
			return User.findRandom({
				role: 'mentor',
				completed: true,
				verified: true,
				$or: [ { mentorsArr: { $size: 0 } }, { _id: { $nin: mentorsArr } } ],
			}).limit(8)
		})
		.then(mentors => {
			res.render('common/profile_list', {
				user: req.user,
				profiles: mentors,
				title: 'Mentor Search',
			})
		})
		.catch(err => {
			next(err)
		})
})

router.get('/mentor-profile/:id', (req, res, next) => {
	let temp
	User.findOne({
		_id: req.params.id,
		completed: true,
		verified: true,
		role: 'mentor',
	}).exec()
		.then(mentor => {
			if (!mentor) return res.status(404).send('Mentor Not Found')
			temp = mentor
			return Mentorship.findOne({
				mentee: req.user._id,
				mentor: mentor._id,
			}).exec()
		})
		.then(mentorship => {
			var matched = !!mentorship
			res.render('common/mentor_profile_details', {
				user: req.user,
				mentor: temp,
				matched,
			})
		})
		.catch(err => {
			next(err)
		})
})

router.get('/mentor-availability/:id', (req, res, next) => {
	let temp
	User.findOne({
		_id: req.params.id,
		role: 'mentor',
	}).exec()
		.then(mentor => {
			if (!mentor) return res.status(404).send('Mentor Not Found')
			temp = mentor
			return Mentorship.findOne({
				mentor: mentor._id,
				mentee: req.user._id,
			}).exec()
		})
		.then(mentorship => {
			if (!mentorship) return res.status(400).send('You Are Not In A Mentorship with this mentor!')
			res.render('mentee/mentor_availability', {
				user: req.user,
				mentor: temp,
			})
		})
		.catch(err => {
			next(err)
		})
})

router.get('/sessionByMentorId/:id', (req, res) => {
	Session.find({
		mentor: req.params.id,
		$or: [ { type: 'available' }, { mentee: req.user._id } ],
		start: { $gte: new Date(req.query.start) },
		end: { $lte: new Date(req.query.end) },
	}, '-creation_date -paymentMethodToken -transaction_id -startURL')
		.populate('mentor', 'profile.first_name profile.last_name')
		.populate('mentee', 'profile.first_name profile.last_name')
		.then(sessions => {
			res.status(200).json(sessions)
		})
		.catch(err => {
			console.log(err)
			res.status(500).send(err)
		})
})

router.get('/my-sessions', (req, res) => {
	Session.find({
		mentee: req.user._id,
		type: { $ne: 'available' },
		start: { $gte: new Date(req.query.start) },
		end: { $lte: new Date(req.query.end) },
	}, '-creation_date -paymentMethodToken -transaction_id -startURL')
		.populate('mentor', 'profile.first_name profile.last_name')
		.populate('mentee', 'profile.first_name profile.last_name')
		.then(sessions => {
			res.status(200).json(sessions)
		})
		.catch(err => {
			console.log(err)
			res.status(500).send(err)
		})
})

router.post('/choose-mentor', (req, res, next) => {
	User.findById(req.body.mentor_id)
		.then(mentor => {
			if (!mentor.completed || !mentor.verified) return res.status(400).send()
			return Mentorship.findOne({
				mentee: req.user._id,
				mentor: req.body.mentor_id,
			}).exec()
		})
		.then(mentorship => {
			if (mentorship) return res.status(400).send('already in mentorship')
			const newMentorship = new Mentorship()
			newMentorship.mentor = req.body.mentor_id
			newMentorship.mentee = req.user._id
			return newMentorship.save()
		})
		.then(() => {
			res.status(200).send()
		})
		.catch(err => {
			next(err)
		})
})

router.post('/cancel-mentor', (req, res, next) => {
	Session.find({
		mentee: req.user._id,
		mentor: req.body.mentor_id,
		type: { $in: [ 'available', 'requested', 'processing', 'scheduled' ] },
	})
		.then(sessions => {
			if (sessions.length > 0) return res.status(400).send('You have outstanding sessions with this mentor. Cannot cancel.')
			return 	Mentorship.findOneAndRemove({
				mentee: req.user._id,
				mentor: req.body.mentor_id,
			})
		})
		.then(mentor => {
			if (!mentor) return res.status(400).send()
			res.status(200).send()
		})
		.catch(err => {
			next(err)
		})
})

router.put('/session/cancel/:id', (req, res, next) => {
	Session.findOneAndUpdate({
		_id: req.params.id,
		mentee: req.user._id,
	}, {
		color: 'green',
		mentee: undefined,
		type: 'available',
	})
		.then(updated => {
			if (!updated) return res.status(404).send()
			res.status(200).send()
		})
		.catch(err => {
			next(err)
		})
})

router.put('/session/choose/:id', (req, res, next) => {

	Session.findByIdAndUpdate(req.params.id, {
		mentee: req.user._id,
		color: 'orange',
		type: 'requested',
	})
		.populate('mentor')
		.then(updated => {
			if (!updated) res.status(404).send()
			var hostname = req.hostname
			return mailjet
				.post('send')
				.request(require('../email_templates/new_session')(updated.mentor, req.user, updated, hostname))
		})
		.then(() => {
			res.status(200).send()
		})
		.catch(err => {
			next(err)
		})
})

router.get('/review', (req, res, next) => {
	res.render('common/review', { user: req.user })
})

router.get('/help', (req, res, next) => {
	res.render('mentee/help', { user: req.user })
})

router.get('/inquery', (req, res, next) => {
	res.render('common/inquery', { user: req.user })
})

function isTutorialComplete (req, res, next) {
	if (req.user.tutorial)
		return next()
	User.findByIdAndUpdate(req.user._id, { tutorial: true })
		.then(() => {
			res.redirect('/mentee/help')
		})
		.catch(() => {
			res.redirect('/mentee/dashboard')
		})

}

function isMentee (req, res, next) {
	if (req.user.role === 'mentee')
		return next()
	res.redirect('/mentor/dashboard')
}


function isEmailVerified (req, res, next) {
	if (req.user.verified)
		return next()
	res.redirect('/auth/email-confirm')
}

// checks if registration is completed
function isRegCompleted (req, res, next) {
	if (req.user.completed)
		return next()
	res.redirect('/mentee/register')
}

function isLoggedIn (req, res, next) {
	if (req.isAuthenticated())
		return next()
	res.redirect('/auth/login')
}

module.exports = router
