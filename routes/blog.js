const { Router } = require("express");
const multer = require("multer");
const path = require("path");

const Blog = require("../models/blog");
const Comment = require("../models/comment");

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads/`));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });



router.get("/add-new", (req, res) => {
  return res.render("addBlog", {
    user: req.user,
  });
});

router.get("/search", async (req, res) => {
  try {
    const query = req.query.q; // Get the search query from the request query parameters
    const regex = new RegExp(query, "i"); // Create a case-insensitive regular expression for searching
    const blogs = await Blog.find({ title: regex }); // Search for blogs with titles matching the regex

    // Send the search results as JSON
    res.json(blogs);
  } catch (error) {
    // Handle errors if any
    console.error('Error searching titles:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("createdBy");
  const comments = await Comment.find({ blogId: req.params.id }).populate(
    "createdBy"
  );
  const blogcreatedbyuser=await Blog.findById(req.params.id);
  const actualuser_id=blogcreatedbyuser.createdBy.toString();
  let currentuser_id="xyz";
  if(req.user){
    currentuser_id=req.user._id;
  }
  return res.render("blog", {
    actualuser_id,
    currentuser_id,
    user: req.user,
    blog,
    comments,
  });
});
router.get("/delete/:blogId",async(req,res)=>{
  await Blog.findByIdAndDelete(req.params.blogId);
  const blogId=req.params.blogId;
 
  await Comment.deleteMany({blogId});
  const updatedBlogs=await Blog.find({});
  return res.render("home",{
    user: req.user,
    blogs:updatedBlogs
  });
});
router.post("/comment/:blogId", async (req, res) => {
  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
});

router.post("/", upload.single("coverImage"), async (req, res) => {
  const { title, body } = req.body;
  console.log(req.file);
  const blog = await Blog.create({
    body,
    title,
    createdBy: req.user._id,
    coverImageURL: `/uploads/${req.file.filename}`,
  });
  return res.redirect(`/blog/${blog._id}`);
});
module.exports = router;
