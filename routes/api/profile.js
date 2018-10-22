const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load validation
const validateProfilenput = require('../../validation/profile');

// load profile modal
const Profile = require('../../models/Profile');
// load user modal
const Users = require('../../models/Users');

// @ Route Get api/profile/test
// @desc Tests profile route
// @access Public
router.get('/test', (req, res) => res.json({ msg : "profile Works"}));

// @ Route Get api/profile
// @desc get current user profile
// @access Private

router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {

    const errors = {};

    Profile.findOne({ user : req.user.id })
    .populate('user', ['first_name', 'last_name', 'avatar', 'address', 'phone'])
    .then(profile => {
        if(!profile) {
            errors.noprofile = 'There is no profile for this user';
            return res.status(404).json(errors);  
        }
        res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

// @ Route Get api/profile/handle/:handle
// @desc get profile by handle
// @access Public

router.get('/handle/:handle', (req, res) => {

    const errors = {};

    Profile.findOne({ handle : req.params.handle })
    .populate('user', ['first_name', 'last_name', 'avatar', 'address', 'phone'])
    .then(profile => {
        if(!profile) {
            errors.noprofile = 'There is no profile for this user';
            return res.status(404).json(errors);  
        }
        res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

// @ Route Get api/profile/user/:user_id
// @desc get profile by user id
// @access Public

router.get('/user/:user_id', (req, res) => {

    const errors = {};

    Profile.findOne({  user : req.params.user_id })
    .populate('user', ['first_name', 'last_name', 'avatar', 'address', 'phone'])
    .then(profile => {
        if(!profile) {
            errors.noprofile = 'There is no profile for this user';
            return res.status(404).json(errors);  
        }
        res.json(profile);
    })
    .catch(err => res.status(404).json({ profile : 'There is no profile for this user'}));
});

// @ Route Post api/profile
// @desc create user profile
// @access Private

router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {

    const { errors, isValid } = validateProfilenput(req.body);

    // check validation
    if(!isValid) {
        // return any errors with 400 status
        return res.status(400).json(errors);
    }

    // Get Fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if(req.body.handle) profileFields.handle = req.body.handle;

    Profile.findOne({ user : req.user.id})
        .then(profile => {
            if(profile) {
                //update
                Profile.findOneAndUpdate({ user : req.user.id },
                { $set : profileFields },
                { new : true }).then(profile => res.json(profile));
            } else {
                //check if handle exist
                Profile.findOne({ handle : profileFields.handle }).then(profile => {
                    if(profile) {
                        errors.handle = 'That handle already exists';
                        res.status(400).json(errors);
                    }
                    // save

                    new Profile(profileFields).save().then(profile => res.json(profile));
                });

                

            }
        });
});


module.exports = router;