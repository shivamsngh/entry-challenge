# Entry Challenge
The application is a scalable solution to most of the entry challenges(quiz types) and uses MongoDB, and NodeJS. The front-end is designed using jQuery and HTML5 which can be modified as per usage.
The DB path should correspond to the DB folder of the project.

The NODE based API also contains APi calls for DB CRUD operations,

Candidates,
Questions,
Possible answers.

Example Call or Insertion

//Method(url, body, header)
Candidate-
post('http://localhost/api/create_candidate', {}, {"Content-Type":"application/x-www-form-urlencoded"}, {"ques":"abcdef`Question id of  the question which it is an answer`","text":"Answer`possible answer`","id":"`only to track your candidate by numbers // you can make it optional in mongo as it already generates object ID as _id`"});

The challenge is inspired by http://www.codewithtarget.com. 
Fork it as you like.



