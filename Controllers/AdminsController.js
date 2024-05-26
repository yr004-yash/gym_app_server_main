const admin = require('../model/admins');
const Calendar = require('../model/events');
const Product = require('../model/products');
const Blog = require('../model/blogs');
const Contactus=require('../model/contactus');
const Order=require('../model/order');
const Membership=require('../model/membership');

// const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config({ path: './config.env' });
const Class= require('../model/classes');
// const { google } = require('googleapis');
// const CLIENT_ID = '1035114720658-os83srdr4ffqp750h7as3u4oporb06js.apps.googleadmincontent.com'
// const CLIENT_SECRET = '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'
// const REDIRECT_URI = 'https://developers.google.com/oauthplayground'
// const REFRESH_TOKEN = '1//042wjE0-h2KnqCgYIARAAGAQSNwF-L9IrsptJhbRuCkK9c8VQBi6JHWeFLvepTNNlESzaXY9M1AIDKqSXnhqtHOHdP_8JCRl59ek'
// const CLIENT_ID = process.env.CLIENT_ID;
// const CLIENT_SECRET = process.env.CLIENT_SECRET;
// const REDIRECT_URI = process.env.REDIRECT_URI;
// const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

// const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN);
// oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// const fs=require('fs');
const mongoose = require("mongoose");
const DB1 =process.env.DATABASE;
const mongooseInstance2 = mongoose.createConnection(DB1, {});

mongooseInstance2.on("connected", () => {
  console.log("Connection to DB2 is successfull");
});

mongooseInstance2.on("error", (err) => {
  console.log(err);
});


//save events
exports.saveEvent = async (req, res) => {
  const eventData = req.body;
  const newEvent = new Calendar({
      title: eventData.title,
      start: eventData.start,
      end: eventData.end,
      extra: eventData.extra
  });
  newEvent.save()
      .then(savedEvent => {
          console.log('Event saved to the database:', savedEvent);
          res.status(200).send(savedEvent);
      })
      .catch(error => {
          console.error('Error saving event:', error);
          res.status(500).send('Error saving event');
      });
}
exports.addcontactus = async (req, res) => {
    try {
        
        const { dzFirstName, dzLastName, dzEmail, dzPhoneNumber, dzMessage } = req.body;
       
        const newContact = new Contactus({
            fname: dzFirstName,
            lname: dzLastName,
            email: dzEmail,
            phone: dzPhoneNumber,
            message: dzMessage
        });
        await newContact.save();
        res.status(200).json({ message: "Contact details saved successfully." });
    } catch (error) {
        // Handle error
        console.error("Error saving contact details:", error);
        res.status(500).json({ error: "An error occurred while saving contact details." });
    }
}


//updateOrderStatus
exports.updateOrderStatus = async (req, res) => {
  const { orderId, newStatus } = req.body;
  
  try {
    if (!orderId || !newStatus) {
      return res.status(400).send({ message: 'Order ID and new status are required' });
    }

    const order = await Order.findOne({OrderId: orderId }); // Use findOne with OrderId

    if (!order) {
      return res.status(404).send({ message: 'Order not found' });
    }
    console.log(order);
    order.PaymentStatus = newStatus;
    await order.save();

    res.status(200).send({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).send({ message: 'Failed to update order status' });
  }
}


//get events
exports.events = async (req, res) => {
  try {
      const events = await Calendar.find();
      res.status(200).json(events);
  } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
}
//delete events
exports.deleteEvent = async (req, res) => {
    const { st, extra } = req.body;
    try {
        // Find the event in the database using the provided data
        const deletedEvent = await Calendar.findOneAndDelete({ start: st, extra: extra });

        if (!deletedEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

//Add blogs


exports.register = async (req, res) => {
    try {
        console.log('coned')
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(422).json({ error: "Please fill all the fields" });
        }

        const existingAdmin = await admin.findOne({ email: email });

        if (existingAdmin && existingAdmin.email === email) {
            return res.status(422).json({ error: 'admin Already exists' });
        } else {
            const admin1 = new admin({
                name: username,
                email: email,
                password: password,
            });

            await admin1.save();

            const data = { username, email, password };

            if (admin1) {
                return res.status(201).json({ message: 'admin Registered Successfully', data });
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.signIn = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        console.log(email);
        console.log(password);
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Please fill all the fields' });
        }
        
        const response = await admin.findOne({ email: email });

        if (!response) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        console.log("response:", response);
        const ismatch = await bcrypt.compare(password, response.password);

        if (response && response.email === email && ismatch) {
            // Wait for the token to be generated
            const token = jwt.sign({ _id: response._id }, process.env.SECRET_KEY);
            console.log('The token is ', token);
            
            res.cookie('jwtoken', token, {
                expires: new Date(Date.now() + 200000000),
                httpOnly: true
            })

            console.log(response.name);
            res.status(201).json({
                message: "you are logged in successfully",
                adminName: response.name,
                adminId: response._id,
                token: token,
            });
        } else {
            res.status(500).json({ message: "invalid credentials" });
        }
    } catch (error) {
        console.log(error);
    }
}


exports.logout = (req, res) => {

    res.clearCookie('jwtoken', { path: '/' });
    res.send('admin Logout');

}
exports.getMonthlyEarnings = async (req, res) => {
    try {
      // Retrieve adminId from the request parameters
      const adminId = req.params.adminId;
  
      // Fetch monthly earnings for the specific admin
      const monthlyEarnings = await admin.find({ admin: adminId }, 'month amount');
  console.log(monthlyEarnings)
      res.status(200).json({ monthlyEarnings });
    } catch (error) {
      console.error("Error fetching monthly earnings:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  
  exports.getAllUsers = async (req, res) => {
    try {
      const db2 = mongooseInstance2.useDb('NodeGymApp');
  
      const usersCursor = await db2.collection('user1').find({});
      const usersArray = await usersCursor.toArray();
  
    //   console.log(usersArray);
  
      res.status(200).json({ users: usersArray });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };


  exports.edituser = async (req, res) => {
    try {
      console.log('comed here')
      const db2 = mongooseInstance2.useDb('NodeGymApp');
      const { userId, name, email } = req.body;

      console.log(userId,name,email)
  
      // Validate user ID
      if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
  
      const updatedUser = await db2.collection('user1').findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(userId) },
        { $set: { name, email } },
        { returnDocument: 'after' }
      );
      
  
      if (!updatedUser.value) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.status(200).json({ user: updatedUser.value });
    } catch (error) {
      console.error("Error updating users:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.deleteuser = async (req, res) => {
    try {
        console.log('comed in delete');
        const db2 = mongooseInstance2.useDb('NodeGymApp');
        const { userId } = req.params;
        console.log(userId);

        // Validate user ID
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Find and delete the user by ID
        const deletedUser = await db2.collection('user1').findOneAndDelete({ _id: new mongoose.Types.ObjectId(userId) });

        // Check if the user was found and deleted
        if (!deletedUser ) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully', user: deletedUser.value });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



exports.Addblog = async (req, res) => {
    
  const { author, title, content,tags } = req.body;
  const imagePath = req.file ? req.file.path : null;
  // Check if an image file was uploaded

  try {
      // Create a new blog instance using the Blog model
      const newBlog = new Blog({
          author,
          title,
          content,
          image:imagePath,
          tags,
          date: new Date()
      });

      // Save the new blog to the database
      await newBlog.save();

      res.status(201).json({ message: 'Blog added successfully' });
  } catch (error) {
      console.error('Error adding blog:', error);
      res.status(500).json({ error: 'Failed to add blog' });
  }
  };
  
  



  


  exports.getblogbyid = async (req, res) => {
    try {
      // Assuming you have only one admin
      const admin1 = await admin.findOne();
      console.log("came here to byid the blog");
  
      if (!admin1) {
        return res.status(404).json({ error: 'Admin not found' });
      }
  
      const { blogId } = req.params;
  
      // Find the index of the blog with the specified ID

      console.log(blogId);
    
    //  console.log(admin1.blogs[admin1.blogs.findIndex(blog => blog._id)])
     
console.log(admin1.blogs);


   

      const length = admin1.blogs.length;
console.log(length);

for (let index = 0; index < admin1.blogs.length; index++) {
    if (admin1.blogs[index]._id.toString() === blogId) {
      const matchedBlog = admin1.blogs[index];
      return res.status(200).json({ message: 'Blog found successfully', blog: matchedBlog });
    }
  }
       
  
       
      
    } catch (error) {
      console.error('Error deleting blog:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  

  exports.updateblog = async (req, res) => {
    try {
      // Assuming you have only one admin
      const admin1 = await admin.findOne();
      console.log("came here to updating the blog the blog");
      const { data } = req.body;
      console.log(" datatatatatatt", { data });

      if (!admin1) {
        return res.status(404).json({ error: 'Admin not found' });
      }
  

      
      const { blogId } = req.params;
  
      // Find the index of the blog with the specified ID

      console.log(blogId);



    
    //  console.log(admin1.blogs[admin1.blogs.findIndex(blog => blog._id)])
     
console.log(admin1.blogs);


   

      const length = admin1.blogs.length;
console.log(length);

for (let index = 0; index < admin1.blogs.length; index++) {
    if (admin1.blogs[index]._id.toString() === blogId) {
      const matchedBlog = admin1.blogs[index];


      console.log("this is the matched blog",matchedBlog);
      console.log(data.title);
      console.log(data.content);
      admin1.blogs[index].title=data.title;
      admin1.blogs[index].content=data.content;


      admin1.save();



   


 
      return res.status(200).json({ message: 'Blog updated successfully' });
    }
  }
       
  
       
      
    } catch (error) {
      console.error('Error deleting blog:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  


  exports.addtrainer = async (req, res) => {
    try {
      const { name, description, rating } = req.body;
  
      // Assuming you store the image path in the 'uploads' folder
      const imagePath = req.file ? req.file.path : null;
  
      const newTrainer = {
        name,
        description,
        rating,
        image: imagePath,
      };
  
      
      const admin1 = await admin.findOne();
      if (!admin1) {
        return res.status(404).json({ error: "Admin not found" });
      }
  
      admin1.trainers.push(newTrainer);
      await admin1.save();
  
      res.status(201).json({ message: "Trainer added successfully!" });
    } catch (error) {
      console.error("Error adding trainer:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
    


  }

  exports.addproduct = async (req, res) => {
    try {
        const { name, description, rating, money, availability, code, tags, size ,brand } = req.body;
        const imagePath = req.file ? req.file.path : null;
        const newProduct = new Product({
            name,
            description,
            rating,
            image: imagePath,
            money,
            availability,
            code,
            tags,
            size,
            brand,
        });
        // console.log(newProduct);
        await newProduct.save();
        res.status(201).json({ message: 'Product added successfully' });
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  exports.addclass = async (req, res) => {
    try {
      // Extract class data from the request body
      const { instructor, rating, topic, money, tags, date, starttime, endtime, Capacity } = req.body;

      // Create a new instance of the Class model with the extracted data
      const newClass = new Class({
          instructor,
          rating,
          topic,
          money,
          tags,
          date,
          starttime,
          endtime,
          Capacity
      });

      // Save the new class to the database
      await newClass.save();

      // Respond with a success message
      res.status(201).json({ message: 'Class added successfully' });
  } catch (error) {
      // If there's an error, respond with an error message
      console.error('Error adding class:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
  }

  exports.addcomment = async (req, res) => {
    const { id } = req.params;
    const { user, comment } = req.body;

    try {
        // Find the blog by ID
        const blog = await Blog.findOne({ _id: id }); 
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const date = new Date();
        // Add the comment to the comments array
        blog.comments.push({ user, comment, date: date });

        // Save the updated blog
        await blog.save();

        res.status(201).json({ message: 'Comment added successfully', blog });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
  }

  exports.getcomment = async (req, res) => {
    try {
        const blogId = req.params.id;
        // Find the blog post by ID and populate its comments
        const blog = await Blog.findOne({ _id: blogId }).populate('comments');
        if (!blog) {
            return res.status(404).json({ message: 'Blog post not found' });
        }
        // Extract and send the comments array from the blog object
        const comments = blog.comments;
        res.status(200).json(comments);
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
  }


  
  exports.getAllTrainers = async (req, res) => {
    try {
      // Assuming you have the admin ID in the request
  
      // Find the admin by ID
      const admin1 = await admin.findOne();
  
      if (!admin1) {
        return res.status(404).json({ error: "Admin not found" });
      }
  
      const trainers = admin1.trainers;
  
      res.status(200).json({ trainers });
    } catch (error) {
      console.error("Error fetching trainers:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  exports.getAllClasses = async (req, res) => {
    try {
      const classes = await Class.find();
      res.status(200).json(classes);
  } catch (error) {
      console.error('Error fetching classes:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
  };

  exports.getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find();
        res.json(blogs);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  exports.getAllContacts = async (req, res) => {
    try {
        const contactus = await Contactus.find();
        res.json(contactus);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  exports.getAblog = async (req, res) => {
    try {
      const blogId = req.params.id; // Retrieve blog ID from URL parameter
      // Fetch the blog from the database based on the blogId
    //   console.log(blogId);
      const blog = await Blog.findOne({ _id: blogId }); // Assuming you're using Mongoose
      
      if (!blog) {
          return res.status(404).json({ message: "Blog not found" });
      }
      
      res.status(200).json(blog);
  } catch (error) {
      console.error("Error fetching blog:", error);
      res.status(500).json({ error: "Internal server error" });
  }
  };
  
  


  exports.deletetrainer = async (req, res) => {
    try {
      // Assuming you have only one admin

      
      const admin1 = await admin.findOne();
      console.log("came here to delete the trainer");
  
      if (!admin1) {
        return res.status(404).json({ error: 'Admin not found' });
      }
  
      const { trainerId } = req.params;
  
      // Find the index of the blog with the specified ID

      console.log(trainerId);
    
    //  console.log(admin1.blogs[admin1.blogs.findIndex(blog => blog._id)])
     
// console.log(admin1.trainers);


    

      const length = admin1.trainers.length;
console.log(length);

for (let index = 0; index < admin1.trainers.length; index++) {
    if (admin1.trainers[index]._id.toString() === trainerId) {
        // Match found, delete the blog
        const deletedtrainer = admin1.trainers.splice(index, 1);
        await admin1.save();
        return res.status(200).json({ message: 'Blog deleted successfully', deletedtrainer });
    }
}

       
  
       
      
    } catch (error) {
      console.error('Error deleting blog:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  exports.deleteproduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        // Find the product by ID and delete it
        await Product.findByIdAndDelete(productId);
        res.status(200).json({ message: 'Product deleted successfully' });
      } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
  };
  exports.deleteclass = async (req, res) => {
    try {
        const classId = req.params.classId;
        // Find the product by ID and delete it
        await Class.findByIdAndDelete(classId);
        res.status(200).json({ message: 'Class deleted successfully' });
      } catch (error) {
        console.error('Error deleting class:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
  };
  exports.deleteblog = async (req, res) => {
    try {
        const blogId = req.params.blogId;
        // Find the product by ID and delete it
        await Blog.findByIdAndDelete(blogId);
        res.status(200).json({ message: 'Blog deleted successfully' });
      } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
  };


  exports.gettrainerbyid = async (req, res) => {
    try {
      // Assuming you have only one admin
      const admin1 = await admin.findOne();
      console.log("came here to byid the blog");
  
      if (!admin1) {
        return res.status(404).json({ error: 'Admin not found' });
      }
  
      const { editId } = req.params;
  
      // Find the index of the blog with the specified ID

      console.log(editId);
    
    //  console.log(admin1.blogs[admin1.blogs.findIndex(blog => blog._id)])
     
// console.log(admin1.trainers);


   

      const length = admin1.trainers.length;
console.log(length);

for (let index = 0; index < admin1.trainers.length; index++) {
    if (admin1.trainers[index]._id.toString() === editId) {
      const matchedBlog = admin1.trainers[index];
      return res.status(200).json({ message: 'Blog found successfully', blog: matchedBlog });
    }
  }
       
  
       
      
    } catch (error) {
      console.error('Error deleting blog:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };







  exports.edittrainer = async (req, res) => {
    try {
      const { name, description, rating } = req.body;
  
      // Assuming you store the image path in the 'uploads' folder
      const imagePath = req.file ? req.file.path : null;

      image=imagePath;
      console.log("the data hereis ",name, description, rating );
  
      // const newTrainer = {
      //   name,
      //   description,
      //   rating,
      //   image: imagePath,
      // };
  
      
      const admin1 = await admin.findOne();
      if (!admin1) {
        return res.status(404).json({ error: "Admin not found" });
      }
      const { editId } = req.params;


      for (let index = 0; index < admin1.trainers.length; index++) {
        if (admin1.trainers[index]._id.toString() === editId) {
          const matchedBlog = admin1.trainers[index];
    
    
          console.log("this is the matched blog",matchedBlog);
          
          admin1.trainers[index].name=name;
          admin1.trainers[index].description=description;
          admin1.trainers[index].rating=rating;
          admin1.trainers[index].image=image;

    
          admin1.save();
          return res.status(200).json({ message: 'Trainer updated successfully' });
        }
      }
  
          } catch (error) {
      console.error("Error adding trainer:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  


  exports.AddInverntory=async(req,res)=>{
try {




  
  const { Inventoryname, quantity} = req.body;

  const admin1 = await admin.findOne();
    if (!admin1) {
      return res.status(404).json({ error: "Admin not found" });
    }



    const newTrainer = {
      Inventoryname,
      quantity
    };

    admin1.Inventories.push(newTrainer);

    await admin1.save();
  
      res.status(201).json({ message: "Inventory added successfully!" });
    } catch (error) {
      console.error("Error adding Inventory:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }


  }
  exports.getAllInventory=async(req,res)=>{
    try {
      // Assuming you have the admin ID in the request
  
      // Find the admin by ID
      const admin1 = await admin.findOne();
  
      if (!admin1) {
        return res.status(404).json({ error: "Admin not found" });
      }
  
      const Inventories = await admin1.Inventories;

      console.log(Inventories);
  
      res.status(200).json(Inventories);
    } catch (error) {
      console.error("Error fetching trainers:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
    
    
      }



      exports.deleteInventory = async (req, res) => {
        try {
    
          
          const admin1 = await admin.findOne();
          console.log("came here to delete the Inventory");
      
          if (!admin1) {
            return res.status(404).json({ error: 'Admin not found' });
          }
      
          const { delid } = req.params;
      
          // Find the index of the blog with the specified ID
    
          console.log(delid);
     
    
    for (let index = 0; index < admin1.Inventories.length; index++) {
        if (admin1.Inventories[index]._id.toString() === delid) {
            // Match found, delete the blog
            const deletedtrainer = admin1.Inventories.splice(index, 1);
            await admin1.save();
            return res.status(201).json({ message: 'Blog deleted successfully', deletedtrainer });
        }
    }
    
           
      
           
          
        } catch (error) {
          console.error('Error deleting blog:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      };

      exports.getAllOrderDetails = async (req, res) => {
        try {
    
          
          const allOrders = await Order.find();

          res.status(200).json({
            success: true,
            allOrderDetails: allOrders,
          })
          
        } catch (error) {
          console.error('Error deleting blog:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      };
      exports.getAllMembersDetails = async (req, res) => {
        try {
    
          
          const allOrders = await Membership.find();

          res.status(200).json({
            success: true,
            allOrderDetails: allOrders,
          })
          
        } catch (error) {
          console.error('Error deleting blog:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      };

// exports.getContact = (req, res) => {
//     console.log("admin authenticated. Sending admin data.");
//     console.log('This is rootadmin', req.rootadmin);
//     res.send(req.rootadmin);

// }
// exports.postContact = async (req, res) => {
//     const { name, email, message } = req.body;
//     if (!name || !email || !message) {
//         return res.json({ message: 'Invalid Credentials' });
//     }

//     const data = await admin.findOne({ _id: req.adminID });

//     if (data) {
//         await data.addmessage(name, email, message);
//         await data.save();
//         res.status(200).json('Message sent successfully')
//     }

// }
// exports.sendEmail = async (req, res) => {

//     const { name, email, message, bloggeremail } = req.body;
//     console.log(bloggeremail);
//     console.log(name, email, message, bloggeremail);
//     if (!name || !message || !email || !bloggeremail) {
//         return res.json({ message: "please fill all fields" });
//     }
//     else {
//         const accessToken = await oAuth2Client.getAccessToken();
//         console.log(email, message, bloggeremail);
//         const transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//                 type: 'OAuth2',
//                 admin: 'faizanazam6980@gmail.com',
//                 clientId: CLIENT_ID,
//                 clientSecret: CLIENT_SECRET,
//                 refreshToken: REFRESH_TOKEN,
//                 accessToken: accessToken
//             }
//         });
//         const mailOptions = {
//             from: '"BlogAPP📑"<faizanazam6980@gmail.com>',
//             to: bloggeremail,
//             subject: `${name} sends you this message Through Blog App`,
//             text: message,
//         };
//         try {
//             await transporter.sendMail(mailOptions);

//             res.status(200).json({ message: 'Email sent!' });
//         } catch (error) {
//             console.error('Failed to send the email:', error);
//             res.status(500).json({ error: 'Failed to send the email.' });
//         }
//     }
// }
// exports.getAlladmins = async (req, res) => {
//     let admins;
//     try {
//         admins = await admin.find();


//     } catch (error) {
//         console.log(error)
//     }
//     if (!admins) {
//         return res.status(404).json({ message: "no admin found" })
//     }
//     return res.status(200).json({ admins });
// }



// exports.editadmin = (req, res) => {
//     console.log("admin authenticated. Sending admin data.");
//     console.log('This is rootadmin', req.rootadmin);
//     res.send(req.rootadmin);

// }
// exports.likedBlogs = async (req, res) => {
//     try {
//         const adminData = await admin.findById(req.adminID).populate('likedBlogs');
//         if (!adminData) {
//             return res.status(404).json({ message: "admin not found" });
//         }
//         res.status(200).json(adminData.likedBlogs);
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// }

// exports.likeBlogbyId = async (req, res) => {
//     try {
//         console.log("Comed here")

//         const { blogId } = req.params;
//         console.log(blogId);
//         const adminData = await admin.findById(req.adminID);
//         if (!adminData) {
//             return res.status(404).json({ message: "admin not found" });
//         }
//         await adminData.addliked(blogId);
//         await adminData.save();
//         res.status(200).json({ message: 'Blog liked successfully' });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// }
// exports.unlikeBlogbyblogID = async (req, res) => {
//     try {
//         console.log("comed here in delete")
//         const { blogId } = req.params;
//         const adminData = await admin.findById(req.adminID);
//         if (!adminData) {
//             return res.status(404).json({ message: "admin not found" });
//         }
//         await adminData.unlikeBlog(blogId);
//         await adminData.save();
//         res.status(200).json({ message: 'Blog unliked successfully' });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// }

// exports.updatedata = async (req, res) => {
//     try {
//         const { name, email, phone, education, password } = req.body;
//         if (!name || !email || !phone || !education || !password) {
//             return res.status(422).json({ error: "Please fill all the fields" });
//         }
//         const profileImage = req.file ? req.file.path : undefined;

//         const currentadmin = await admin.findById(req.params.id);
//         if (!currentadmin) {
//             return res.status(404).json({ error: "admin not found" });
//         }
//         console.log(currentadmin)

//         currentadmin.name = name;
//         currentadmin.email = email;
//         currentadmin.phone = phone;
//         currentadmin.education = education;
//         console.log(currentadmin.profileImage);
//         if (profileImage) {
//             if (currentadmin.profileImage) {
//                 fs.unlinkSync(currentadmin.profileImage);
//             }
            
//         currentadmin.profileImage = profileImage;
//         }
//         currentadmin.password = password;

//         await currentadmin.save();

//         res.status(200).json({ message: 'admin updated successfully' });

//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// }