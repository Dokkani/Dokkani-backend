const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');


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
    })
})

module.exports = router;