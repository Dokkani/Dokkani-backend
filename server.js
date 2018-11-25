const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const morgan = require('morgan');
const cors = require('cors');


// Routes
const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use('/uploads',express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// DB Config
const db = require('./config/keys').mongoURI;

mongoose
.connect(db)
.then(() => console.log('MongoDb Connected'))
.catch(err => console.log(err));


// passport middleware
app.use(passport.initialize());

// Passport config
require('./config/passport')(passport);

// user Routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

app.get('/', function(req, res) {
    res.send('hello world');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log('Server running on port ' + PORT));