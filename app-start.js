/**
 * "Get Busy Living or Get Busy Dying."
 * If Dying, This code serves your purpose
 * Shivam
 */

var express = require("express");
var app = express();
var path = require("path");
var bodyParser = require('body-parser');

var port = process.env.PORT || 8080;

//dbService
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/atlchallenge');

//models
var Candidate = require('./models/candidate');
var Question = require('./models/question');
var Response = require('./models/response');
var Answer = require('./models/answer');

//Parsing the body of incoming requests to JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Store all HTML files in view folder.
app.use(express.static(__dirname + '/Views'));
// Store all JS and CSS in Scripts folder.
app.use(express.static(__dirname + '/Scripts'));


// ROUTES FOR OUR API

// get an instance of the express Router
var router = express.Router();

// test route to make sure everything is working (accessed at GET http://localhost:8081/api)
router.use(function (req, res, next) {
    // do logging
    console.log('Magic is in the the Air.');
    next(); // make sure we go to the next routes and don't stop here
});

//Homepage Route handler
router.get('/', function (req, res) {
    res.sendFile('/index.html');
    //__dirname : It will resolve to your project folder.
});

//Candidate Verfification Route
router.route('/candidates/:passcode').get(function (req, res) {
    console.log(req.params.passcode);
    Candidate.findOne({ 'ID': req.params.passcode }, (err, candidate) => {
        console.log(candidate);
        if (err) {
            console.log(error);
            res.statusCode = 500;
            res.send(err);
        }
        else if (candidate.isChallengeCompleted === true) {
            var err = new Error();
            res.statusCode = 401;
            res.send('Already Completed.');
        }
        else
            res.json(candidate);
    });
});

//Route for fetching questions
router.route('/questions/:question_id').get(function (req, res) {
    console.log(req.params.question_id);
    if (req.params.question_id === "e789f428" && req.header('X-Terminator') !== 'hastalavista') {
        res.send('No such Question');
    }
    else {
        let question_id = req.params.question_id;
        Question.findOne({ 'ID': question_id }, (err, question) => {
            console.log(question);
            if (err) {
                res.statusCode = 500;
                console.log(err);
                res.send(err);
            }
            res.json(question);
        });
    }
});

//Route for recording responses
router.route('/responses/').post(function (req, res) {
    console.log(req.body.QuestionID);
    //get reponse based on question ID
    compareInputWithAnswer(req.body.QuestionID, req.body.Text, (err, success) => {
        if (success) {
            console.log("Compare success", success);
            var response = new Response();
            response.QuestionID = req.body.QuestionID;
            response.Text = req.body.Text;
            response.CandidateID = req.body.CandidateID;
            response.Timestamp = Date.now();
            response.save((err, success) => {
                if (err) {
                    console.log("ERROR IN SAVING", err);
                    res.send(err);
                }
                else {
                    console.log("Success in response", success);
                    Question.findOne({ 'ID': req.body.QuestionID }, (err, success) => {
                        console.log("present ques", success);
                        if (err) {
                            console.log("error in find ", err);
                        }
                        else {
                            Question.findOne({ 'SequenceNum': success.SequenceNum + 1 }, (err, question) => {
                                if (err) {
                                    console.log("Error in sequenced ques", err);
                                }
                                else {
                                    console.log("next quest", question);
                                    if (question == null) {
                                        let conditions = { ID: req.body.CandidateID },
                                            update = { isChallengeCompleted: true },
                                            options = { multi: false };
                                        Candidate.update(conditions, update, options, (err, rowsAffected) => {
                                            if (err) {
                                                res.statusCode = 500;
                                                console.log("Error in update", err);
                                                res.send('Internal Server Error');
                                            }
                                            else {
                                                res.statusCode = 200;
                                                res.send("http://www.google.com");
                                            }
                                        });
                                    }
                                    else
                                        res.json(question.ID);
                                }
                            });
                        }
                    });
                }
            });
        }
        else {
            res.statusCode = 500;
            console.log("Compare error", err);
            res.send('Wrong Answer Please Try Again!!');
        }
    });
});


/**
 * Compare user input with answer
 */
function compareInputWithAnswer(qid, ans, callback) {
    let answer = ans.toString().toLowerCase();
    Answer.findOne({ "QuestionID": qid, "PossibleAnswer": answer }, (err, success) => {
        if (err || !success) {
            console.log("Error in compare is", err);
            if (typeof callback === 'function')
                callback(err, '');
        }
        else {
            console.log("Success", success);
            callback('', true);
        }
    });
}

//Route for creating candidate **Internal use routes**
router.route('/create_candidate').post(function (req, res) {
    var candidate = new Candidate();
    candidate.ID = req.body.id;
    candidate.Name = req.body.name;
    candidate.Email = req.body.email;
    candidate.isChallengeCompleted = false;
    var resp = candidate.save(function (err, success) {
        if (err) {
            res.statusCode = 500;
            console.log(err);
            res.send(err);
        }
        res.json(success);
    });
});

//Route for creating questions **Internal use routes**
router.route('/create_question').post(function (req, res) {
    var question = new Question();
    question.ID = req.body.id;
    question.Text = req.body.text;
    question.SequenceNum = req.body.seq;
    var resp = question.save(function (err, success) {
        if (err) {
            res.statusCode = 500;
            console.log(err);
            res.send(err);
        }
        res.json(success);
    });
});

/**
 * Route handler for creating answer
 * to the corresponsing questions.
 * **Internal use routes**
 */
router.route('/create_answer').post(function (req, res) {
    var answer = new Answer();
    answer.ID = req.body.id;
    answer.PossibleAnswer = req.body.text;
    answer.QuestionID = req.body.ques;
    var resp = answer.save(function (err, success) {
        if (err) {
            res.statusCode = 500;
            console.log(err);
            res.send(err);
        }
        res.json(success);
    });
});
// --- REGISTER OUR ROUTES ---
// all of our routes will be prefixed with /api
app.use('/api', router);

var server = app.listen(8081, function () {
    var host = server.address().address;
    console.log("The app is listening at http://%s:%s", host, port)
});
// Console will print the message
console.log('Server running at http://127.0.0.1:8081/');