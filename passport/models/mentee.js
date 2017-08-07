const mongoose = require('mongoose'),
	bcrypt = require('bcrypt-nodejs'),
	random = require('mongoose-random'),
	sessionSchema = require('./session'),
	userSchema = new mongoose.Schema({
		email: String,
		password: String,
		completed: Boolean,
		creation_date: Date,
		upcomingSessions: [ sessionSchema ],
		mentors: [ {
			type: mongoose.Schema.ObjectId,
			ref: 'userSchema',
		} ],

		profile: {
			// common info

			gender: String,
			first_name: String,
			last_name: String,
			phone: String,
			age: Number,
			linkedin: String,
			high_school_program: [ String ],
			skills: [ String ],
			paragraphs: [ String ],


			// mentee
			avg_11: Number,
			avg_12: Number,
			high_school: String,
			grade: Number,
			preferred_school: [ String ],
			preferred_program: [ String ],
		},
	}).plugin(random, { path: 'r' })

// methods ======================
// generating a hash
userSchema.methods.generateHash = function (password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
}

// checking if password is valid
userSchema.methods.validPassword = function (password) {
	return bcrypt.compareSync(password, this.password)
}

// create the model for users and expose it to our app
module.exports = mongoose.model('Mentee', userSchema)
