# URL Generator - Backend
This is a Node/Express microservice with MongoDB serving as a Database

## Endpoints in the microservice
1. `/add` method - `POST`

    This route is responsible for persisting the data from the front-end to the MongoDB database 

    Sample Request payload 

    `{
        message: "May the force be with you",
        time: 100 (seconds)
    }`

    Sample response

    `{  "uniqueUrl": "cHiJ4SD",
        "expireAt": "2021-03-20T04:24:32.292Z"
    }`

2. `/retrieve/:uuid` method - `GET`

    This route is responsible for getting the records which have been inserted to the database.

    The details of the message to be received from the database as sent through query params `uuid`

    Eg. `http://localhost/retrieve/:cHiJ4SD`

    Sample Response

     `{
          "_id": "odHppG4",
          "message": "Hello, old friend!",
          "time": 1000,
          "insertDate": "2021-03-19T13:09:19.144Z"
     }`

## How is the short id generated?
Using `nanoid` (Example `nanoid(7)`) 

## How is the self destruction of messages achieved? 
Using MongoDB's inbuilt [Time To Live](https://docs.mongodb.com/manual/tutorial/expire-data/)

For creating a TTL based on an index - 
`db.<collection_name>.createIndex( {"expireAt": 1}, {expireAfterSeconds: 0} )`
