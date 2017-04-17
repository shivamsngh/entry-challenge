

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CandidateSchema = new Schema({
    ID: String,
    Name: String,
    Email: String,
    accessStartDate: {type: Date, required:false},
    accessEdndDate: {type: Date, required:false},
    isChallengeCompleted: Boolean
});

module.exports = mongoose.model('Candidate', CandidateSchema);        