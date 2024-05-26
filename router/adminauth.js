const express = require('express');
const router = express.Router();
const authenticate = require('../Middleware/authenticateAdmins');
const AdminController = require('../Controllers/AdminsController');

// const { google } = require('googleapis');
// const CLIENT_ID = '1035114720658-os83srdr4ffqp750h7as3u4oporb06js.apps.googleusercontent.com'
// const CLIENT_SECRET = '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'
// const REDIRECT_URI = 'https://developers.google.com/oauthplayground'
// const REFRESH_TOKEN = '1//042wjE0-h2KnqCgYIARAAGAQSNwF-L9IrsptJhbRuCkK9c8VQBi6JHWeFLvepTNNlESzaXY9M1AIDKqSXnhqtHOHdP_8JCRl59ek'
// const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN);
// oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const multer = require('multer');
// const fs = require('fs');
// const dir = './uploads';

// if (!fs.existsSync(dir)) {
//     fs.mkdirSync(dir);
// }
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, './uploads/');
//     },
//     filename: (req, file, cb) => {
//         cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
//     }
// });

// const upload = multer({ storage: storage });
// router.post("/register", upload.single('profileImage'), userController.register);



// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, "uploads/"); // Make sure to create a 'uploads' folder in your project directory
//     },
//     filename: function (req, file, cb) {
//       const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//       cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
//     },
//   });

  
//   const upload = multer({ storage: storage });


  const fs = require('fs');
const dir = './uploads';

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        const sanitizedOriginalname = file.originalname.replace(/\\/g, '_');
        cb(null, new Date().toISOString().replace(/:/g, '-') + sanitizedOriginalname);
    }
    
});

const upload = multer({ storage: storage });


//add or remove events
router.post("/api/saveEvent", AdminController.saveEvent);
//get events
router.get("/api/events", AdminController.events);
//delete events
router.delete("/api/deleteevent", AdminController.deleteEvent);

//add products
router.post("/api/addproduct",upload.single("image"), AdminController.addproduct);
//get products
router.get("/api/getAllProducts", AdminController.getAllProducts);
//delete products
router.delete("/deleteproduct/:productId", AdminController.deleteproduct);
//Add blogs
router.post('/addblog',upload.single("image"), AdminController.Addblog);
//Add comments in blogs
router.post("/api/saveComment/:id", AdminController.addcomment);
//get comments of a blog
router.get("/api/getComments/:id", AdminController.getcomment);
//get blogs
router.get("/api/getAllBlogs", AdminController.getAllBlogs);
//get a blog
router.get("/api/getAblog/:id", AdminController.getAblog);
//delete blogs
router.delete("/deleteblog/:blogId", AdminController.deleteblog);
//Add contact
router.post("/api/contactus", AdminController.addcontactus);
//get contacts
router.get("/api/getAllContacts", AdminController.getAllContacts);


//ADD CLASS
router.post("/api/addclass", AdminController.addclass);
//GET CLASS
router.get("/api/getAllClasses", AdminController.getAllClasses);
//DELETE CLASS
router.delete("/deleteclass/:classId", AdminController.deleteclass);
//Update state of order
router.post("/api/updateOrderStatus", AdminController.updateOrderStatus);




router.post("/register", AdminController.register);
router.post("/signin", AdminController.signIn);

router.get("/monthlyEarnings/:adminId", AdminController.getMonthlyEarnings);
router.get("/users", AdminController.getAllUsers);
router.post("/edituser/:userid", AdminController.edituser);
router.delete("/deleteuser/:userId", AdminController.deleteuser);

// router.post("/addblog", AdminController.Addblog);
// router.get("/getAllBlogs", AdminController.getAllBlogs);

// router.delete("/deleteblog/:blogId", AdminController.deleteblog);
router.get("/getblogbyid/:blogId", AdminController.getblogbyid);

router.post("/updateblog/:blogId", AdminController.updateblog);

router.post("/addtrainer",upload.single("image"), AdminController.addtrainer);
router.get("/getAllTrainers", AdminController.getAllTrainers);
router.delete("/deletetrainer/:trainerId", AdminController.deletetrainer);
router.get("/gettrainerbyid/:editId", AdminController.gettrainerbyid);
router.post("/edittrainer/:editId",upload.single("image"), AdminController.edittrainer);

router.post("/AddInverntory", AdminController.AddInverntory);
router.delete("/deleteInventory/:delid", AdminController.deleteInventory);
router.get("/getAllInventory", AdminController.getAllInventory);

router.get("/getAllOrderDetails", AdminController.getAllOrderDetails);
router.get("/getAllMembersDetails", AdminController.getAllMembersDetails);

router.get("/logout", authenticate, AdminController.logout);
// router.get("/contact", authenticate, userController.getContact);
// router.post("/contact", authenticate, userController.postContact);
// router.post("/sendEmail", authenticate, userController.sendEmail)
// router.get("/getAll", authenticate, userController.getAllUsers);
// router.get("/edituser", authenticate, userController.editUser);
// router.get("/likedBlogs", authenticate, userController.likedBlogs);
// router.post("/likeBlog/:blogId", authenticate, userController.likeBlogbyId);
// router.delete("/unlikeBlog/:blogId", authenticate, userController.unlikeBlogbyblogID);
// router.patch("/editdata/:id", authenticate,upload.single('profileImage'), userController.updatedata);
module.exports = router;