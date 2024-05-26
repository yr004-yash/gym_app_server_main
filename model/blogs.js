const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: './config.env' });

const commentSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    date:{
        type: Date,
        required: true,
    }
});

const blogSchema = new mongoose.Schema({
    author: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: false
    },
    tags: {
        type: [String],
        default: [],
    },
    date: {
        type: Date,
        required: true,
    },
    comments: [commentSchema] // Array of comments
});

const Blog = new mongoose.model('Blog', blogSchema);

module.exports = Blog;
