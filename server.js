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
const uri = "mongodb+srv://admin:supersecret1@cluster0.gdnpu.mongodb.net/?maxPoolSize=20&w=majority"; 

// Create the client
const client = new MongoClient(uri);

//////////////////////////////////////
//// ENDPOINTS ///////////////////////
//////////////////////////////////////

app.get('/api', async (req, res) => {
    res.send("Welcome to the Music Database");
})


// GET /api/albums
app.get('/api/albums', async (req, res) => {
    try {
        await client.connect();
        const database = client.db('music');
        const collection = database.collection('albums');

        // You can specify a query/filter here
        // See https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/query-document/
        const query = {};
        if (req.query.label) {
            query.sender = req.query.label;
        }

        // Get all objects that match the query
        const result = await collection.find(query).toArray();
        res.send(result);
    } catch (error) {
        res.status(500).send({ error: error.message });
    } finally {
        await client.close();
    }
})

// GET /api/artists
app.get('/api/artists', async (req, res) => {
    try {
        await client.connect();
        const database = client.db('music');
        const collection = database.collection('artists');

        // You can specify a query/filter here
        // See https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/query-document/
        const query = {};

        // Get all objects that match the query
        const result = await collection.find(query).toArray();
        res.send(result);
    } catch (error) {
        res.status(500).send({ error: error.message });
    } finally {
        await client.close();
    }
})


// GET /api/artists/:id
app.get('/api/artists/:id', async (req, res) => {

    // read the path parameter :id
    let id = req.params.id;

    try {
        await client.connect();
        const database = client.db('music');
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
    } finally {
        await client.close();
    }

})

// POST /api/artists
app.post('/api/artists', async (req, res) => {

    try {
        await client.connect();
        const database = client.db('messageboard');
        const collection = database.collection('artists');

        var artist = {
            name: req.body.name,
            origin: req.body.origin
        };
        const result = await collection.insertOne(artist);

        res.status(201).send({ _id: result.insertedId });
    } catch (error) {
        res.status(500).send({ error: error.message });
    } finally {
        await client.close();
    }
})

/* // DELETE /api/messages
app.delete('/api/messages/:id', async (req, res) => {
    let id = req.params.id;

    try {
        await client.connect();
        const database = client.db('messageboard');
        const messages = database.collection('messages');
        const query = { _id: ObjectId(id) }; // filter by id
        const result = await messages.deleteOne(query);

        if (result.deletedCount === 0) {
            let responseBody = {
                status: "No message with id " + id
            }
            res.status(404).send(responseBody);
        }
        else {
            let responseBody = {
                status: "Message with id " + id + " has been successfully deleted."
            }
            res.send(responseBody);
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    } finally {
        await client.close();
    }
}) */

server.listen(port, () => console.log("app listening on port " + port));
