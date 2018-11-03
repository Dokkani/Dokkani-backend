const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// create schema

const PostSchema = new Schema ({
     user : {
         type: Schema.Types.ObjectId,
         ref : 'users'
     },
     images: [{
        filename: {
            type: String,
            required: true,
        },
        source: {
            type: String,
            required: true
        },
        mime_type: {
            type: String,
            required: true
        },
        original_name: {
            type: String,
            required: true
        }
     }],
     title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required : true
    },
    price : {
        type: Number,
        required : true
    },
     user_name : {
         type: String
     },
     avatar: {
         type: String
     },
     likes : [
         {
             user: {
                 type : Schema.Types.ObjectId,
                 ref : 'users'
             }
         }
     ], 
     comments : [
         {
            user: {
                type : Schema.Types.ObjectId,
                ref: 'users'
            },
            text: {
                type: String,
                required: true
            },
            user_name: {
                type: String
            },
            avatar: {
                type: String
            },
            date:{
                type: Date,
                default : Date.now
            }
         }
         
     ],
     date: {
         type: Date,
         default: Date.now
     }
});

module.exports = Post = mongoose.model('post', PostSchema);