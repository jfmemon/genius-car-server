const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.qp55ast.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const verifyJWT = (req, res, next) => {
    const authHeader = req.body.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decode) {
        if (err) {
            return res.status(403).send({ message: 'unauthorized access' })
        }
        req.decode = decode;
        next();
    })
}

async function run() {
    try {
        const serviceCollection = client.db('geniusCar').collection('services');
        const ordersCollection = client.db('geniusCar').collection('orders');

        app.post('/jwt',verifyJWT, (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            res.send({ token });
        })

        // db theke data(all) read korbe and api create korbe
        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })


        // db theke data(one) read korbe and api create korbe
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })


        app.get('/orders', verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            if (decoded.email !== req.query.email) {
                res.status(403).send({ message: 'unauthorized access' })
            }


            let query = {};

            if (req.query.email) {
                query = {
                    email: req.query.email,
                }
            }

            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
        })


        // client site theke data anbe and POST API create korbe
        app.post('/orders', async (req, res) => {
            const orders = req.body;
            const result = await ordersCollection.insertOne(orders);
            res.send(result);
        })

        // delete order from order list of db and selected order
        app.delete('/orders/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.send(result);
        })

        // update order approval status
        app.patch('/orders/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const status = req.body.status;
            const updateOrder = {
                $set: {
                    status: status
                }
            }
            const result = await ordersCollection.updateOne(query, updateOrder);
            res.send(result);
        })
    }

    finally {

    }
}

run().catch();

app.get('/', (req, res) => {
    res.send('Genius car server is running.');  // it will show on browser (http://localhost:5000/)
})

app.listen(port, () => {
    console.log(`Genius car server is running on port ${port}`)  // it will show on cmd
})