const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(
  cors({
    origin: [
      // "http://localhost:5173",
      "https://scc-technovision-c.web.app",
      "https://scc-technovision-c.firebaseapp.com",
       
    ],
    credentials: true,
  })
);
app.use(express.json());

// connect mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3hdabzk.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // collections
    const usersCollection = client.db("scc-technovision").collection("users");
    const tasksCollection = client.db("scc-technovision").collection("tasks");

    // Save or modify user email, status in DB
    app.put("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const query = { email: email };
      const options = { upsert: true };
      const isExist = await usersCollection.findOne(query);
      console.log("User found?----->", isExist);
      if (isExist) return res.send(isExist);
      const result = await usersCollection.updateOne(
        query,
        {
          $set: { ...user, timestamp: Date.now() },
        },
        options
      );
      res.send(result);
    });

    // task collection 
    app.post('/create-task', async (req, res) => {
      const task = req.body;
      const result = await tasksCollection.insertOne(task)
      res.send(result)
    })

    // get task collection data
    app.get('/create-task', async (req, res) => {
      const email = req.query.email;
      const result = await tasksCollection.find({email}).toArray()
      res.send(result)
    })

     // find single id data for updating purpose
     app.get("/create-task/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tasksCollection.findOne(query);
      res.send(result);
    });

    // update class collection data
    app.patch("/create-task/:id", async (req, res) => {
      const item = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          title: item.title,
          priority: item.priority,
          details: item.details,
          deadline: item.deadline,
        },
      };
      const result = await tasksCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });


     // delete  task collection data
     app.delete("/create-task/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tasksCollection.deleteOne(query);
      res.send(result);
    });


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("SCC Teachnovision is running!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
