let mysql = require('mysql');
let config = require('./config.js');
const fetch = require('node-fetch');
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount)
});

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(express.static(path.join(__dirname, "client/build")));


// Allow localhost to make calls to API
app.use((req, res, next) => {
	console.log(req.headers.origin)
	if (req.headers.origin?.includes('://localhost:')) {
		console.log('Accepted')
		res.header('Access-Control-Allow-Origin', req.headers.origin)
		res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
	}
	next()
})

app.use(decodeIDToken);
// Middleware to decode Bearer Token 
// if logged in, Firebase user added to req['currentUser']
async function decodeIDToken(req, res, next) {
	if (req.headers?.authorization?.startsWith('Bearer ')) {
		const idToken = req.headers.authorization.split('Bearer ')[1];

		try {
			const decodedToken = await admin.auth().verifyIdToken(idToken);
			req['currentUser'] = decodedToken;
		} catch (err) {
			console.log(err);
		}
	}

	next();
}

/** Example of using user authentication: */
app.get('/hello', (req, res) => {

	const user = req['currentUser'];

	if (!user) {
		res.status(403).send('You must be logged in to say hello!');
	} else {
		console.log(`${user.name} said hello`)
		res.header('Access-Control-Allow-Origin: ').send(`Hello ${user.name}!`)
	}
})

app.put('/api/login', (req, res) => {
	
	const user = req['currentUser'];

	if (!user) {
		res.status(403).send('You are not logged in');
	} else {
		// Initialize connection to db
		let connection = mysql.createConnection(config);


		// SQL Query to upsert user in database
		const {uid, name, email} = user;

		console.log(`User: ${name} logged in`);
		
		const sql =
		`
		INSERT INTO users (uid, name, email)
		VALUES (?, ?, ?)
		ON DUPLICATE KEY 
		UPDATE name = ?, email = ?;
		`;
		const data = [uid, name, email, name, email]

		connection.query(sql, data, (error, results, fields) => {
			if (error) {
				res.status(500).send('could not make database request');
				return console.error(error.message);
			}
			res.status(201).send('Logged in, user updated');
		})
		connection.end();

	}
}
)


app.post('/api/loadUserSettings', (req, res) => {

	let connection = mysql.createConnection(config);
	let userID = req.body.userID;

	let sql = `SELECT mode FROM user WHERE userID = ?`;
	console.log(sql);
	let data = [userID];
	console.log(data);

	connection.query(sql, data, (error, results, fields) => {
		if (error) {
			return console.error(error.message);
		}

		let string = JSON.stringify(results);
		//let obj = JSON.parse(string);
		res.send({ express: string });
	});
	connection.end();
});

app.post('/api/getClubs', (req, res) => {

	let connection = mysql.createConnection(config)
	let clubID = req.body.clubID

	let sql = `SELECT name, description
	FROM clubs
	WHERE clubs.id = ${clubID}`;

	console.log(sql);

	connection.query(sql, (error, results, fields) => {
		if (error) {
			return console.error(error.message);
		}
		let string = result
		res.send({ express: string })
	});
	connection.end();
});


app.post('/api/getAllClubs', (req, res) => {
	// Query all clubs from the clubs table
	let connection = mysql.createConnection(config)
	const query = `SELECT * FROM clubs`;
	console.log(query)
	connection.query(query, (error, results, fields) => {
	  if (error) {
		// Return an error if the query failed
		res.status(500).json({ error: error.message });
	  } else {
		// Return the results as JSON
		let string = JSON.stringify(results);
		res.setHeader('Content-Type', 'application/json');
		res.send({express: string});
		//res.send( results);
	  }
	});
	connection.end();
  });

  app.get('/api/testing', (req, res) => {
	res.send('This is a test API endpoint');
  });

app.listen(port, () => console.log(`Listening on port ${port}`)); //for the dev version
//app.listen(port, '129.97.25.211'); //for the deployed version, specify the IP address of the server