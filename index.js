const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const fs = require('fs')
const app = express()
const port = 9000
require('dotenv').config()
app.use(cors())    //middleware
app.use(bodyParser.json())  //middleware
//file upload
const fileUpload = require('express-fileupload');
app.use(express.static('doctors'));   //doctors name folder create hbe jekhane upload kora pic gulu takhbe
app.use(fileUpload());
const MongoClient = require('mongodb').MongoClient;

const ObjectId = require('mongodb').ObjectId

// const ObjectId = require('mongodb').ObjectId
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p0lzm.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
console.log(process.env.DB_USER);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


client.connect(err => {
    const serviceCollection = client.db("taste-bud").collection("serviceCollection");
    const adminCollection = client.db("taste-bud").collection("admin");

    app.get('/extra', (req, res) => {
        console.log(req.body);
        res.send("ok ")
    })

    app.post('/addService', (req, res) => {
        const file = req.files.file  //file means => type=file => client site
        const price = req.body.price
        const title = req.body.title
        const meal = req.body.male
        const description = req.body.description

        console.log(price, title, description, meal, file);


        // uploadPath = __dirname + '/doctors' + file.name;
        const filePath = `${__dirname}/doctors/${file.name}`
        file.mv(filePath, (err) => {
            if (err) {
                res.status(500).send({ msg: "failed to upload" });
            }
            // res.status(200).send({ name: file.name });
        });

        const newImg = file.data;
        // const newImg = fs.readFileSync(filePath)
        const encImg = newImg.toString('base64');
        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        serviceCollection.insertOne({ price, title, meal, description, image })
            .then(result => {
                fs.rm(filePath, err => {
                    if (err) {
                        console.log(err);
                        res.status(500).send({ msg: "failed to upload" })
                    }
                    res.send(result.insertedCount > 0);

                })
            })
    })

    app.get('/service', (req, res) => {
        // res.send("data")
        serviceCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.delete('/delete/:id', (req, res) => {
        console.log(req.params.id);
        serviceCollection.deleteOne({
            _id: ObjectId(req.params.id)
            // status: "D"
        })
            .then((result) => {
                console.log(result);
                res.send(result.deletedCount > 0)
            })
    })


    app.get('/service/:id', (req, res) => {
        serviceCollection.find({ _id: ObjectId(req.params.id) })
            .toArray((err, documents) => {
                res.send(documents[0])
            })
    })
    //make admin
    app.post('/makeAdmin', (req, res) => {
        const user = req.body;
        console.log(user);
        adminCollection.insertOne(user)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, admins) => {
                console.log("admin check", admins)
                res.send(admins.length > 0)
            })
    })




   





})

app.get('/', (req, res) => {
    res.send('GET request to the homepage')
})

app.listen(process.env.PORT || port)