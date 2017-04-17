///////////////////////////////////////////////////////////
//
// H4CK 1T 1F U C4N!
//
// Anurag Bhandari
// Accenture Technology Labs Gurgaon
// April 14, 2017
//
///////////////////////////////////////////////////////////

var SITEROOT = "/";

$(document).ready(function () {

    //
    // Candidate input form handler
    //
    $("form").submit(function (e) {
        e.preventDefault(); // suppress the default form submission behavior

        var candidateInput = $("input#candidateInput").val();

        // Candidate is on the welcome screen and has yet to start the challenge
        if ($("input#candidateInput").attr("placeholder").toLowerCase() === "passcode") {
            var passcode = candidateInput; // passcode entered by candidate
            // Fetch candidate details based on passcode (which actually is candidate id)
            GetCandidateDetails(passcode);
        }
        // Candidate has logged in and working with questions
        else {
            // Build the response object
            var response = {
                CandidateID: window.localStorage.getItem("candidate-id"),
                QuestionID: $('div.jumbotron h1').data('question-id'),
                Text: candidateInput
            };
            // Submit the response for verification
            SubmitResponse(response);
        }
    });

});

/**
 * Get candidate details by id.
 * @param {any} candidateId
 */
function GetCandidateDetails(candidateId) {
    var jqXHR = $.get(`${SITEROOT}api/candidates/${candidateId}`, function (candidate, status, xhr) {
        // Save fetched candidate details in localstorage
        window.localStorage.setItem("candidate-id", candidate.ID);
        window.localStorage.setItem("candidate-name", candidate.Name);
        window.localStorage.setItem("candidate-email", candidate.Email);
        // Set candidate name in top-right corner
        $("#candidateName").text(candidate.Name);
        // Show the first question
        GetQuestion("6b50c164");
    });
    // Error handler for candidate details get
    jqXHR.fail(function (error) {
        alert(error.responseText);
    });
}

/**
 * Get question details by id.
 * @param {string} questionId
 */
function GetQuestion(questionId) {
    var jqXHR = $.get(`${SITEROOT}api/questions/${questionId}`, function (question, status, xhr) {

        // Show the question in DOM
        $('div.jumbotron h1').text(`${question.SequenceNum}.`).data('question-id', question.ID);
        $('div.jumbotron p').text("");
        $('div.jumbotron p:first').text(question.Text);

        // Reset question related elements
        $("form #candidateInput").attr("placeholder", "Your answer").val("");
        $("form button[type=submit]").text("Submit");
        $('div#message').text("");

        // Question-level customizations
        if (question.SequenceNum === 2) {
            $('div.jumbotron').addClass('hidden'); // hide the question
            $('div#message').text("Find the hidden question. Unhide and answer it."); // show a hint
        }
        else if (question.SequenceNum === 5) {
            $('div.jumbotron p:first').css("word-wrap", "break-word"); // add word wrap to question text
            $('div.jumbotron').append("<!-- DID IT SHAKE YOUR BASE? -->"); // add a hint comment
        }

    });
    // Error handler for question details get
    jqXHR.fail(function (error) {
        alert(error.responseText);
    });
}

/**
 * Send response to server for saving and verificiation.
 * @param {any} response
 */
function SubmitResponse(response) {
    var jqXHR = $.post(`${SITEROOT}api/responses/`, response, function (result, status, xhr) {
        // Candidate got answered incorrectly
        if (result === false) {
            // Notify the candidate that they weren't right
            alert("That's not right. Try again.");
        }
        // Candidate answered correctly
        // and unlocked the basic survey url
        // (This happens after the last question)
        else if (result.indexOf("http") != -1) {
            // Redirect the candidate to basic survey page
            window.location.href = result;
        }
        // Candidate answered correctly
        // and received the next question's id
        else {
            // Load the next question
            GetQuestion(result);
        }
    });
    // Error handler for submit response
    jqXHR.fail(function (error) {
        alert(error.responseText);
    });
}