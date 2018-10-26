const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const multer = require('multer');

// Routes
const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

const app = express();
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

// app.get('/', function(req, res) {
//     res.send('hello world');
// });

//get image type

const getImageType = (string) => {
    let array = string.split('/');
    return array[1];
}


//multer configuration
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + '.' + getImageType(file.mimetype));
    }
});
let upload = multer({storage: storage});

app.post('/file', upload.single('image'), (req, res) => {
    // console.log(req.file);
    return res.sendStatus(200)
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log('Server running on port ' + PORT));