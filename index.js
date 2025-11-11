const express = require("express");
const app = express();
const cors = require("cors");
const port = 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://CleanCityPortalDB:DIKZ1iaVKnMFaK8e@cluster0.phhktud.mongodb.net/?appName=Cluster0";

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
    const db = client.db("issues-db");
    const issuesCollection = db.collection("issues");

    app.get("/allIssues", async (req, res) => {
      const result = await issuesCollection.find().toArray();
      res.send(result);
    });

    app.post("/allIssues", async (req, res) => {
      const date = req.body;
      const result = await issuesCollection.insertOne(date);
      res.send(result);
    });

    app.get("/allIssues/:id", async (req, res) => {
      const { id } = req.params;
      // console.log(id);
      const objectId = new ObjectId(id);
      const result = await issuesCollection.findOne({ _id: objectId });
      res.send(result);
    });

    app.get("/latest-issues", async (req, res) => {
      const result = await issuesCollection
        .find()
        .sort({ date: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //     await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
