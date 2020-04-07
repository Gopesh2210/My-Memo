const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const mongoose = require('mongoose');
const postRoutes = require('./routes/posts');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(cors());
app.use("/images",express.static(path.join("images")));

// Connecting to the mongoose db
mongoose.connect("mongodb+srv://gopesh:root123@cluster0-acusb.mongodb.net/mymemo?retryWrites=true&w=majority")
    .then(() => {
        console.log("Connected to database")
    })
    .catch(() => {
        console.log("Connection to database failed!")
    });

app.use('/api/posts',postRoutes);

module.exports = app;