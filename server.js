// Imports
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb'); // See https://www.mongodb.com/docs/drivers/node/current/quick-start/
const cors = require('cors')
const http = require('http');
const bodyParser = require('body-parser');

// Set up App
const app = express();
app.use(cors()); // Allow all cross-origing requests. More information: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
app.use(express.static('public')); // Host all static files in the folder /public
app.use(bodyParser.json()); // Support json encoded bodies
const port = process.env.PORT || '3001'; // Use the PORT variable if set (e.g., when deploying to Heroku)
app.set('port', port);

const server = http.createServer(app);

// TODO: Use your MongoDB Connection String here
const uri = "...";

// Create the client and connect to the database
let database;
const client = new MongoClient(uri);
client.connect((error, db) => {
    if (error || !db) {
        console.log("Could not connect to MongoDB:")
        console.log(error.message);
    }
    else {
        database = db.db('music');
        console.log("Successfully connected to MongoDB.");
    }
})

//##################################################################################################
// ENDPOINTS 
//##################################################################################################

//--------------------------------------------------------------------------------------------------
// Welcome message
//--------------------------------------------------------------------------------------------------
app.get('/api', async (req, res) => {
    res.send("Welcome to the Music Database");
})

//--------------------------------------------------------------------------------------------------
// Get all albums
//--------------------------------------------------------------------------------------------------
app.get('/api/albums', async (req, res) => {
    try {
        const collection = database.collection('albums');

        // You can specify a query/filter here
        // See https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/query-document/
        const query = {};
        // Example: Filter for a label, e.g. http://localhost:3001/api/albums?label=Columbia
        if (req.query.label) {
            query.label = req.query.label;
        }

        // Get all objects that match the query
        const result = await collection.find(query).toArray();
        res.send(result);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

//--------------------------------------------------------------------------------------------------
// Get an album by its id
//--------------------------------------------------------------------------------------------------
app.get('/api/albums/:id', async (req, res) => {

    // read the path parameter :id
    let id = req.params.id;

    try {
        const collection = database.collection('albums');
        const query = { _id: ObjectId(id) }; // filter by id
        const result = await collection.findOne(query);

        if (!result) {
            let responseBody = {
                status: "No object with id " + id
            }
            res.status(404).send(responseBody);
        }
        else {
            res.send(result);
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

//--------------------------------------------------------------------------------------------------
// Update an album
//--------------------------------------------------------------------------------------------------
app.put('/api/albums/:id', async (req, res) => {

    // read the path parameter :id
    let id = req.params.id;
    let album = req.body;
    delete album._id; // delete the _id from the object, because the _id cannot be updated

    try {
        const collection = database.collection('albums');
        const query = { _id: ObjectId(id) }; // filter by id
        const result = await collection.updateOne(query, { $set: album });

        if (result.matchedCount === 0) {
            let responseBody = {
                status: "No object with id " + id
            }
            res.status(404).send(responseBody);
        }
        else {
            res.send({ status: "Object with id " + id + " has been updated." });
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

//--------------------------------------------------------------------------------------------------
// Get all artists
//--------------------------------------------------------------------------------------------------
app.get('/api/artists', async (req, res) => {
    try {
        const collection = database.collection('artists');

        // You can specify a query/filter here
        // See https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/query-document/
        const query = {};

        // Get all objects that match the query
        const result = await collection.find(query).toArray();
        res.send(result);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

//--------------------------------------------------------------------------------------------------
// Get an artist by their id
//--------------------------------------------------------------------------------------------------
app.get('/api/artists/:id', async (req, res) => {

    // read the path parameter :id
    let id = req.params.id;

    try {
        const collection = database.collection('artists');
        const query = { _id: ObjectId(id) }; // filter by id
        const result = await collection.findOne(query);

        if (!result) {
            let responseBody = {
                status: "No object with id " + id
            }
            res.status(404).send(responseBody);
        }
        else {
            res.send(result);
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

//--------------------------------------------------------------------------------------------------
// Create a new artist
//--------------------------------------------------------------------------------------------------
app.post('/api/artists', async (req, res) => {

    try {
        const collection = database.collection('artists');

        var artist = {
            name: req.body.name,
            origin: req.body.origin
        };
        const result = await collection.insertOne(artist);

        res.status(201).send({ _id: result.insertedId });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

//--------------------------------------------------------------------------------------------------
// Start the server
//--------------------------------------------------------------------------------------------------
server.listen(port, () => console.log("app listening on port " + port));
