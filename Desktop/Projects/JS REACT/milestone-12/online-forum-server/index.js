// const express = require("express");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const { MongoClient, ServerApiVersion } = require('mongodb');

// dotenv.config();

// const app = express();
// const port = process.env.PORT || 5000;

// // Middleware
// app.use(cors());
// app.use(express.json());




// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vsdmkoq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();

//       // All collections
//         const postsCollection = client.db("forumDB").collection("posts");
//         const usersCollection = client.db("forumDB").collection("users");
//         const commentsCollection = client.db("forumDB").collection("comments");
//         const announcementsCollection = client.db("forumDB").collection("announcements");
//         const tagsCollection = client.db("forumDB").collection("tags");

        

// // Add post related
// app.post("/posts", async (req, res) => {
//   const post = req.body;
//   const result = await postsCollection.insertOne(post);
//   res.send(result);
// });



// // GET post count for a user
// app.get("/posts/user/count", async (req, res) => {
//   const email = req.query.email;
//   const count = await postsCollection.countDocuments({ authorEmail: email });
//   res.send({ count });
// });



// app.get("/posts", async (req, res) => {
//   try {
//     const { email } = req.query;

//     // Debug log (you can remove later)
//     console.log("Filtering by email:", email);

//     let query = {};
//     if (email) {
//       query = { authorEmail: email }; // ⚠️ Must match exactly
//     }

//     const posts = await postsCollection
//       .find(query)
//       .sort({ createdAt: -1 })
//       .toArray();

//     res.send(posts);
//   } catch (err) {
//     console.error("Error fetching posts:", err);
//     res.status(500).send({ message: "Internal Server Error" });
//   }
// });


// // 📁 backend/routes/posts.js
// app.get("/posts", async (req, res) => {
//   const page = parseInt(req.query.page) || 1;
//   const limit = parseInt(req.query.limit) || 5;
//   const skip = (page - 1) * limit;

//   const posts = await postsCollection
//     .find()
//     .sort({ createdAt: -1 })
//     .skip(skip)
//     .limit(limit)
//     .toArray();

//   const total = await postsCollection.estimatedDocumentCount();
//   res.send({ posts, total });
// });

// app.get("/posts/popular", async (req, res) => {
//   const page = parseInt(req.query.page) || 1;
//   const limit = parseInt(req.query.limit) || 5;
//   const skip = (page - 1) * limit;

//   const posts = await postsCollection.aggregate([
//     {
//       $addFields: {
//         voteDifference: { $subtract: ["$upVote", "$downVote"] },
//       },
//     },
//     { $sort: { voteDifference: -1 } },
//     { $skip: skip },
//     { $limit: limit },
//   ]).toArray();

//   const total = await postsCollection.countDocuments();
//   res.send({ posts, total });
// });











//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     // await client.close();
//   }
// }
// run().catch(console.dir);







// // ✅ Simple root route
// app.get("/", (req, res) => {
//   res.send("✅ Online Forum is running");
// });

//   app.listen(port, () => {
//       console.log(`🚀 Server running on port ${port}`);
//     });





const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vsdmkoq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db("forumDB");
    const postsCollection = db.collection("posts");
    const usersCollection = db.collection("users");
    const commentsCollection = db.collection("comments");
    const announcementsCollection = db.collection("announcements");
    const tagsCollection = db.collection("tags");

    // ✅ Add new post
    app.post("/posts", async (req, res) => {
      const post = req.body;
      const result = await postsCollection.insertOne(post);
      res.send(result);
    });

    // ✅ Get post count for specific user
    app.get("/posts/user/count", async (req, res) => {
      const email = req.query.email;
      const count = await postsCollection.countDocuments({ authorEmail: email });
      res.send({ count });
    });

    // ✅ Get posts with optional email filter + pagination
    app.get("/posts", async (req, res) => {
      try {
        const { email, page = 1, limit = 5 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        let query = {};

        if (email) {
          query = { authorEmail: email };
        }

        const posts = await postsCollection
          .find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .toArray();

        const total = await postsCollection.countDocuments(query);
        res.send({ posts, total });
      } catch (err) {
        console.error("Error fetching posts:", err);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    // ✅ Popular posts sorted by vote difference
    app.get("/posts/popular", async (req, res) => {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const skip = (page - 1) * limit;

      const posts = await postsCollection.aggregate([
        {
          $addFields: {
            voteDifference: { $subtract: ["$upVote", "$downVote"] },
          },
        },
        { $sort: { voteDifference: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]).toArray();

      const total = await postsCollection.countDocuments();
      res.send({ posts, total });
    });

    // ✅ Root route
    app.get("/", (req, res) => {
      res.send("✅ Online Forum is running");
    });

    // ✅ Post details (optional)
    app.get("/post/:id", async (req, res) => {
      const id = req.params.id;
      const post = await postsCollection.findOne({ _id: new ObjectId(id) });
      const comments = await commentsCollection.find({ postId: id }).toArray();
      res.send({ ...post, comments });
    });

    // ✅ Voting API
    app.patch("/post/vote/:id", async (req, res) => {
      const { type } = req.body; // "up" or "down"
      const update = type === "up" ? { $inc: { upVote: 1 } } : { $inc: { downVote: 1 } };
      const result = await postsCollection.updateOne({ _id: new ObjectId(req.params.id) }, update);
      res.send(result);
    });

    // ✅ Add comment
    app.post("/comments", async (req, res) => {
      const comment = req.body; // postId, text, userEmail, userName, time
      const result = await commentsCollection.insertOne(comment);
      await postsCollection.updateOne(
        { _id: new ObjectId(comment.postId) },
        { $inc: { commentCount: 1 } }
      );
      res.send(result);
    });

    // ✅ Confirm MongoDB connection
    await client.db("admin").command({ ping: 1 });
    console.log("✅ MongoDB Connected");
  } finally {
    // Do not close client if server is still running
  }
}

run().catch(console.dir);

// ✅ Start Express server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
