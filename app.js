const express=require("express");
const app=express();
const userRoute=require("./routes/user");
const blogRoute=require("./routes/blog");
const path=require("path");
const bodyParser = require('body-parser');
const cookiePaser=require('cookie-parser')
const mongoose=require("mongoose");
const Blog = require("./models/blog");
const User=require("./models/user");
const {
    checkForAuthenticationCookie,
  } = require("./middlewares/authentication");
mongoose.connect("mongodb://127.0.0.1:27017/blogify").then((e)=>{
    console.log("mongodb connected")
    console.log(mongoose.modelNames());
}).catch((e)=>{
    console.log("errror occured",e);
});
app.set("view engine","ejs");
app.set("views",path.resolve("./views"));

app.use(cookiePaser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));
const PORT=8001;
app.get("/",async(req,res)=>{
    const allBlogs=await Blog.find({});
   
    let username = "Guest"; // Default value if user is not authenticated

    if (req.user) {
        const email = req.user.email;
        const user = await User.findOne({ email });

        if (user) {
            username = user.fullName;
            console.log(username);
        } else {
            console.log("User not found");
            // Handle the case where the user is not found
        }
    }

    
    console.log(req.user);
    res.render("home",{
        username,
        user:req.user,
        blogs:allBlogs,
    });
})
app.use("/user",userRoute);
app.use("/blog",blogRoute);
app.listen(PORT,console.log("server started at port 8001"));