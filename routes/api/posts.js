const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
let btoa = require('btoa');
let fs = require('fs');
let multer = require('multer');
//Post Model
const Post = require('../../models/Post');
//Profile Model
const Profile = require('../../models/Profile');

// Validation
const validatePostInput = require('../../validation/post');

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

//image upload route
router.post('/upload', upload.single('image'), (req, res, next) => {
    console.log(req.file);
    const acceptedFileTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif'];
    if (!acceptedFileTypes.includes(req.file.mimetype)) {
        return res.sendStatus(404);
    }
    fs.readFile(req.file.path, (error, data) => {
        if (error) throw error;
        let b64Val = btoa(data);
        // console.log(b64Val);
        Post.findByIdAndUpdate(req.body.id, 
            {$push: 
                {images: 
                    {
                        filename: req.file.filename, 
                        source: b64Val, 
                        mime_type: req.file.mimetype, 
                        original_name: req.file.originalname
                    }
                }
            }, 
            (err, data) => {
                if (err) {
                    res.json(err);
                    return res.sendStatus(500);
                }
                console.log(data);
                res.send('<img src=data:image;base64,' + b64Val + '>');
        });
    });
})




// @ Route GET api/posts
// @desc Get Post
// @access Public
router.get('/', (req, res) => {
    Post.find()
    .sort({ date : -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(401).json({ nopostfound : 'no posts found'}));
});

// @ Route GET api/posts/:id
// @desc Get Post by id
// @access Public
router.get('/:id', (req, res) => {
    Post.findById( req.params.id)
    .then(post => res.json(post))
    .catch(err => res.status(404).json({ nopostfound : 'no posts found With That Id'}));
});

// @ Route POST api/posts
// @desc Create post
// @access Private

router.post('/', passport.authenticate('jwt', { session : false }), (req, res ) => {
    const { errors, isValid } = validatePostInput(req.body);
    // chaeck validation
    if(!isValid){
        return res.status(400).json(errors);
    }

    const newPost = new Post({
        text: req.body.text,
        user_name: req.body.user_name,
        avatar: req.body.avatar,
        user: req.user.id
    });

    newPost.save().then( post => res.json(post));
});
// @ Route Delete api/posts/:id
// @desc Delete post
// @access Private

router.delete('/:id', passport.authenticate('jwt', { session : false }), (req, res) =>{
    Profile.findOne({ user: req.user.id })
    .then(profile => {
        Post.findById(req.params.id)
        .then(post => {
            //Check for post owner
            if(post.user.toString() !== req.user.id ) {
                return res.status(401).json({ notauthorized: 'User not authorized'});
            }

            //Delete
            post.remove().then(() => res.json({ success: true }));
        })
        .catch(err => res.status(404).json({ postnotfound: 'no post found'}))
    });
});

// @ Route Post api/posts/like/:id
// @desc like post
// @access Private

router.post('/like/:id', passport.authenticate('jwt', { session : false }), (req, res) =>{
    Profile.findOne({ user: req.user.id })
    .then(profile => {
        Post.findById(req.params.id)
        .then(post => {
            if (
                post.likes.filter(like => like.user.tostring() === req.user.id).lenght >0
            )
            {
                return res.status(400)
                .json({ alreadyliked : 'user already liked this post'})
            }

            //add user id to likes array
            post.likes.unshift({ user: req.user.id });
            post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: 'no post found'}))
    });
});

// @ Route Post api/posts/unlike/:id
// @desc unlike post
// @access Private

router.post('/unlike/:id', passport.authenticate('jwt', { session : false }), (req, res) =>{
    Profile.findOne({ user: req.user.id })
    .then(profile => {
        Post.findById(req.params.id)
        .then(post => {
            if (
                post.likes.filter(like => like.user.toString() === req.user.id).lenght === 0
            )
            {
                return res.status(400)
                .json({ notliked : 'You have no liked this post'})
            }

            // Get remove index
            const removeIndex = post.likes.map(item => item.user.toString())
                .indexOf(req.user.id);

                //splice out of array
                post.likes.splice(removeIndex, 1);

                //save
                post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: 'no post found'}))
    });
});
module.exports = router;