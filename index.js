const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// require dotenv 
require('dotenv').config();
// import 'dotenv/config'
const port = process.env.PORT || 5000;


const app = express();

// middle ware 
app.use(express.json());
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://hirespheree.netlify.app',
    ],
    credentials: true,
}));
// cookie parser use 
app.use(cookieParser());


// logger function 
const logger = (req, res, next) => {
    console.log("Inside the logger");
    next();
}

const verifyToken = (req, res, next) => {
    console.log("Inside the verify token");
    const token = req?.cookies?.authToken;
    // console.log(token);
    if (!token) {
        return res.status(401).json({ message: "Unauthorized Access!" });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: err.message });
        }
        req.user = decoded;
        next();
    })
}


// mongo db connection 
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@cluster0.4ayta.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
async function run() {
    try {
        console.log("successfully connected to MongoDB!");

        // Database 
        const database = client.db("HireSphere");

        // Jobs Collection 
        const jobsCollection = database.collection("Jobs");

        // Jobs Application Collection 
        const jobsApplicationCollection = database.collection("JobsApplication");

        // user token auth APIS 
        // user token sign API 
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' })

            res
                .cookie('authToken', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict"
                })
                .json({
                    status: true,
                })
        })

        // user token sign out API 
        app.post('/jwt/logout', async (req, res) => {
            res
                .clearCookie('authToken', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
                })
                .json({ message: "logout successfully!" })
        })

        // Jobs related APIS 
        // Jobs Manipulation APIS 

        // Get All jobs API 
        app.get('/jobs', logger, async (req, res) => {
            console.log("Now inside the api callback");
            const result = await jobsCollection.find().toArray();
            res.json({
                status: true,
                message: "Hello this is the jobs router!",
                result
            })
        })

        // User Posted Jobs API 
        app.get('/posted-jobs', async (req, res) => {
            const email = req.query.email;
            const result = await jobsCollection.find({ hr_email: email }).toArray();
            res.json({
                status: true,
                email,
                data: result
            })
        })

        // Job Insert API 
        app.post('/jobs', async (req, res) => {
            const body = req.body;
            // console.log(body);
            const result = await jobsCollection.insertOne(body);
            res.json({
                result: true,
                result,
                data: body
            })
        })

        // GET one Job API 
        app.get('/job/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(req.params.id);
            const data = await jobsCollection.findOne({ _id: new ObjectId(id) });

            res.json({
                status: true,
                id,
                data
            })
        })

        // Jobs Application related APIS 
        // Insert user Jobs Application API 
        app.post('/jobs-application', async (req, res) => {
            const body = req.body;
            // console.log(body);
            const find = await jobsApplicationCollection.find({ job_id: body.job_id, applicant_email: body.applicant_email }).toArray();
            if (find.length > 0) {
                res.json({
                    status: false,
                    message: "Already applied in this job!"
                })
            }
            else {
                const result = await jobsApplicationCollection.insertOne(body);
                res.json({
                    status: true,
                    body,
                    result
                })
            }
        })

        // User All Jobs Application API
        app.get('/job-application', verifyToken, async (req, res) => {
            const email = req.query.email;
            // console.log(req.cookies);
            if (req.user.email !== req.query.email) {
                return res.status(403).json({ message: "Forbidden Access" });
            }
            const result = await jobsApplicationCollection.find({ applicant_email: email }).toArray();
            res.json({
                status: true,
                query: email,
                data: result
            })
        })

        // Count Application Each Job API 
        app.get('/job-application-count', async (req, res) => {
            const id = req.query.id;
            // console.log(req.query.id);
            const result = await jobsApplicationCollection.find({ job_id: id }).toArray();
            res.json({
                status: true,
                id,
                data: result,
                count: result.length
            })
        })


    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', async (req, res) => {
    res.send("Jaber Ahmed Riyan");
})

app.listen(port, () => {
    console.log("App Running on port ", port);
})