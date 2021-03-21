require('dotenv').config()
const express = require('express')
const { nanoid } = require("nanoid");
const cors = require("cors")
const MongoClient = require('mongodb').MongoClient

const DB_USERNAME = process.env.DB_USERNAME
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_NAME = process.env.DB_NAME
const PORT = 8082

const DATABASE_URL = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@cluster0.yqxu2.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }));

MongoClient.connect(DATABASE_URL,{useUnifiedTopology: true})
.then((client) => {
    const db = client.db(DB_NAME)
    const messagesCollection = db.collection('newCollection')
    console.log('Connected to the Database - SUCCESS!')

    /**
     * 1. Post to get the URL/text from the user
     *  sample structure of the request
     *  {
     *      message: "May the force be with you",
     *      time: 100 (seconds)
     *  }
     * 
     *  sample response
     *  {
     *      "uniqueUrl": "cHiJ4SD",
     *      "expireAt": "2021-03-20T04:24:32.292Z"
     *  }
     * 
     */
    app.post("/add",(req,res) => {
        const uuid = nanoid(7)
        const insertDate = new Date() 
        const millisSecondsFromNow = req.body.time * 1000
        const expireAt = new Date(insertDate.getTime() + millisSecondsFromNow)
        const newMessageDocument = {...req.body, expireAt, insertDate, _id: uuid}
        messagesCollection.insertOne(newMessageDocument)
        .then(result => {
            console.log("INSERT SUCCESS!")
            return res.status(201).send({ uniqueUrl : uuid, expireAt})
        }).catch(error => {
            console.log("INSERT FAILED!")
            return res.status(503).send(error)
        })
    })

    /**
     * 2. Get the data from the database if its alive
     *  sample structure of the request (params):  localhost/:uuid
     * 
     * sample response:
     * {
     *     "_id": "odHppG4",
     *     "message": "Hello, old friend!",
     *     "time": 1000,
     *     "insertDate": "2021-03-19T13:09:19.144Z"
     * }
     */
    app.get("/retrieve/:uuid",(req,res) => {
        const uuid = req.params.uuid
        messagesCollection.findOne({_id: uuid})
        .then(result => {
            if (result === null) {
                console.log("RECORD NOT FOUND!")
                return res.status(404).end()
            }
            else
                console.log("RECORD FOUND!")
                return res.status(302).send(result)
        }).catch(err => {
            console.log(err)
            return res.status(503).send(error)
        })
    })
}).catch((err) => {
    console.log(err)
})


app.listen(process.env.PORT || PORT, () => {
    console.log(`Backend is running on port ${process.env.PORT || PORT}`)
})