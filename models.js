//this stores the user info in the session
var mongoose = require('mongoose');

mongoose.model('User', new mongoose.Schema({
    email: String,
    passwordHash: String,
    subscriptionActive: {type: Boolean, default: false},
    customerId: String, //if customer makes multiple purchases recognise same acc
    subscriptionId: String //if customer wants to change plan or cancel it
}))