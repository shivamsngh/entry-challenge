var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ResponseSchema = new Schema({ 
    Text: String,
    CandidateID:String,
    QuestionID: String,
    Timestamp: {type: Date, required:false}
});

module.exports = mongoose.model('Response', ResponseSchema);        