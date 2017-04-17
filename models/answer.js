var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AnswerSchema = new Schema({
    ID: String,
    QuestionID: String,
    PossibleAnswer: String
});

module.exports = mongoose.model('Answer', AnswerSchema);

