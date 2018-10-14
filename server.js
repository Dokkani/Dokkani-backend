const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

if (process.env.NODE_ENV === "production") {
    app.use(express.static("client/build"));
}

//routes


const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/dokkani";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {useNewUrlParser: true});

// Send every request to the React app
// Define any API routes before this runs
app.get("*", function(req, res) {
    res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

app.listen(PORT, function() {
console.log(`🌎 ==> Server now on port ${PORT}!`);
});
  