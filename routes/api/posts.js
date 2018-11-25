const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const multer = require('multer');
// const btoa = require('btoa');
// const fs = require('file-system');


//Post Model
const Post = require('../../models/Post');
//Profile Model
const Profile = require('../../models/Profile');

// Validation
const validatePostInput = require('../../validation/post');


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


//multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + file.originalname);
    }
});
const upload = multer({storage: storage});




// @ Route POST api/posts
// @desc Create post
// @access Private

router.post('/',upload.single('images'), passport.authenticate('jwt', { session : false }), (req, res ) => {
   console.log('hello');
    console.log(req.file);
    const acceptedFileTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif'];
    if (!acceptedFileTypes.includes(req.file.mimetype)) {
        return res.sendStatus(404);
    }

    const { errors, isValid } = validatePostInput(req.body);
    // chaeck validation
    if(!isValid){
        return res.status(400).json(errors);
    }
    console.log(req.file.path);
    // fs.readFile(req.file.path, (error, data) => {
    //     if (error) throw error;
    //     let b64Val = btoa(data);
    //      console.log(b64Val);

        const newPost = new Post({
            images: req.file.path,
     
            category : req.body.category,
            title: req.body.title,
            description: req.body.description,
            price : req.body.price,
            user_name: req.body.user_name,
            avatar: req.body.avatar,
            user: req.user.id
    });
    newPost.save().then( post => res.json(post))
    .catch(err => res.status(404).json({ postnotfound: 'no catogery found'}));
    
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

// @ Route Post api/posts/comment/:id
// @desc Add comment to post
// @access Private

router.post('/comment/:id', passport.authenticate('jwt', { session:false }),
(req, res) => {
    const {errors, isValid } = validatePostInput(req.body);

    //check validation
    if(!isValid) {
        return res.status(400).json(errors);
    }

    Post.findById(req.params.id)
    .then(post => {
        const newComment = {
            text : req.body.text,
            user_name: req.body.user_name,
            avatar: req.body.avatar,
            user: req.user.id
        } 
        post.comments.unshift(newComment);

        //save
        post.save().then(post => res.json(post));
    })
    .catch(err => res.status(404).json({ postnotfound: 'No post found'}));
});

router.get('/category/:category', passport.authenticate('jwt', {session:false}), (req, res) => {
    Post.find({category: req.params.category})
    .then(post => res.json(post))
    .catch(err => res.status(404).json({ nopostfound : 'no posts found'}));
});

module.exports = router;