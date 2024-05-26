const express = require('express');
const Blogrouter = express.Router();
const Blog = require('../model/blogs')
const users = require('../model/users');
const mongoose = require("mongoose");
exports.getBlogs = async (req, res) => {
    let blogs;
    try {
        blogs = await Blog.find().populate('user');
    } catch (error) {
        console.log(error);
    }
    if (!blogs) {
        return res.status(404).json(
            { message: "No Blog Found" })
    }
    return res.status(200).json({ blogs })

}
exports.getBlogsbyId = async (req, res) => {
    const id = req.params.id;
    let blog;
    try {
        blog = await Blog.findById(id).populate('user').populate('comments.user');;

    } catch (err) {
        return console.log(err);
    }
    if (!blog) {
        return res.status(404).json({ message: "No Blog Found" });
    }
    return res.status(200).json({ blog });
}

exports.UserbyId = async (req, res) => {
    const userId = req.params.id;

    try {
        const userBlogs = await users.findById(userId).populate("blogs");

        if (!userBlogs || userBlogs.blogs.length === 0) {
            return res.status(404).json({ message: "No Blog Found for the given user ID" });
        }

        return res.status(200).json({ user: userBlogs });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.ClapBlogsbyId = async (req, res) => {
    const { userId } = req.body;
    const blogId = req.params.id;

    if (!blogId || !userId) {
        return res.status(400).json({ message: "Blog ID or User ID is missing" });
    }
    console.log("COMED HERE");
    console.log("B:", blogId, "U:", userId);
    const blog = await Blog.findById({ _id: blogId });
    const allblogs = await Blog.find();

    if (!blog) {
        return res.status(404).json({ message: "No Blog Found" });
    }

    const updatedClaps = await blog.addclap(userId);

    return res.status(200).json({ claps: updatedClaps, allblogs: allblogs });
}

exports.Addblog = async (req, res) => {
    const { author, title, content } = req.body;
    let image = '';

    // Check if an image file was uploaded
    if (req.file) {
        image = req.file.path; // Assuming the file path is stored in req.file.path
    }

    try {
        // Create a new blog instance using the Blog model
        const newBlog = new Blog({
            author,
            title,
            content,
            image
        });

        // Save the new blog to the database
        await newBlog.save();

        res.status(201).json({ message: 'Blog added successfully' });
    } catch (error) {
        console.error('Error adding blog:', error);
        res.status(500).json({ error: 'Failed to add blog' });
    }
}

exports.SaveThecomment = async (req, res) => {
    const { blogId, commentInput, userId } = req.body;

    if (!commentInput || !blogId || !userId) {
        return res.status(400).json({ message: 'Invalid Credentials' }); 
    }

    console.log("This is userId", userId);
    console.log("THIS IS THE BLOG ID", blogId, "THIS IS THE INPUT", commentInput);

    try {
        const data = await Blog.findOne({ _id: blogId });

        if (!data) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        console.log("Blog found, attempting to add comment...");

        await data.addcomment(commentInput, userId);
        await data.save();

        res.status(200).json({ message: 'Comment Added successfully'});
    } catch (error) {
        console.error('Error saving comment:', error);
        res.status(500).json({ message: 'Server error' });
    }
}
