const mongoose = require('mongoose')

var sessionSchema = new mongoose.Schema({
	creation_date: {
		type: Date,
		default: Date(),
		required: true,
	},
	title: {
		type: String,
		default: 'Session Slot',
	},
	type: {
		type: String,
		enum: [ 'available', 'requested', 'taken', 'finished', 'noshow' ],
		default: 'available',
	},
	confirmation_email_sent: {
		type: Boolean,
		required: true,
		default: false,
	},
	transaction_id: String,
	start: {
		type: Date,
		required: true,
	},
	end: {
		type: Date,
		required: true,
	},
	mentor: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
	},
	mentee: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
	},
	startURL: String,
	joinURL: String,
	color: {
		type: String,
		required: true,
		enum: [ 'red', 'green', 'orange', 'grey', 'yellow' ],
		default: 'green',
	},
})

module.exports = mongoose.model('Session', sessionSchema)
