var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var QuestionSchema = new Schema({
    ID: String,
    Text: String,
    SequenceNum: Number
});

module.exports = mongoose.model('Question', QuestionSchema);        