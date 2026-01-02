const express = require("express");
const app = express();
const cors = require("cors");

require("dotenv").config();
const port = 3000;

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}@cluster0.phhktud.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    const db = client.db("issues-db");
    const issuesCollection = db.collection("issues");
    const ContributionCollection = db.collection("Contribution");

    app.get("/community-stats", async (req, res) => {
      try {
        const issueEmails = await issuesCollection.distinct("email");
        const contribEmails = await ContributionCollection.distinct("email");

        const allEmails = new Set([...issueEmails, ...contribEmails]);

        const totalEngagedUsers = allEmails.size;

        const issuesResolved = await issuesCollection.countDocuments({
          status: "resolved",
        });

        const issuesPending = await issuesCollection.countDocuments({
          status: "pending",
        });
        const stats = {
          totalUsers: totalEngagedUsers,
          issuesResolved: issuesResolved,
          issuesPending: issuesPending,
        };

        res.send(stats);
      } catch (err) {
        console.error("Error fetching community stats:", err);
        res.status(500).send("Server error while fetching community stats");
      }
    });

    app.get("/myContribution", async (req, res) => {
      const email = req.query.email;

      if (!email) {
        return res.send([]);
      }

      const result = await ContributionCollection.find({ email })
        .sort({ date: -1 })
        .toArray();

      res.send(result);
    });

    app.get("/allContribution", async (req, res) => {
      const result = await ContributionCollection.find().toArray();
      res.send(result);
    });

    app.post("/allContribution", async (req, res) => {
      const contribution = req.body;
      const result = await ContributionCollection.insertOne(contribution);
      res.send(result);
    });

    app.get("/community-stats", async (req, res) => {
      try {
        const issueEmails = await issuesCollection.distinct("email");
        const contribEmails = await ContributionCollection.distinct("email");

        const totalUsers = new Set([...issueEmails, ...contribEmails]).size;

        const issuesResolved = await issuesCollection.countDocuments({
          status: "Resolved",
        });

        const issuesPending = await issuesCollection.countDocuments({
          status: "Pending",
        });

        res.send({
          totalUsers,
          issuesResolved,
          issuesPending,
        });
      } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
      }
    });

    app.get("/myIssue", async (req, res) => {
      const email = req.query.email;
      const result = await issuesCollection.find({ email: email }).toArray();
      res.send(result);
    });

    app.get("/allIssues", async (req, res) => {
      const result = await issuesCollection.find().toArray();
      res.send(result);
    });

    // app.post("/allIssues", async (req, res) => {
    //   const date = req.body;
    //   const result = await issuesCollection.insertOne(date);
    //   res.send(result);
    // });

    app.post("/allIssues", async (req, res) => {
      const issue = {
        ...req.body,
        date: new Date(),
      };

      const result = await issuesCollection.insertOne(issue);
      res.send(result);
    });

    app.get("/allIssues/:id", async (req, res) => {
      const { id } = req.params;

      const objectId = new ObjectId(id);
      const result = await issuesCollection.findOne({ _id: objectId });
      res.send(result);
    });

    app.delete("/allIssues/:id", async (req, res) => {
      const { id } = req.params;
      console.log(id);
      const objectId = new ObjectId(id);
      const filter = { _id: objectId };
      const result = await issuesCollection.deleteOne(filter);
      res.send(result);
    });

    app.put("/allIssues/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const objectId = new ObjectId(id);
      const filter = { _id: objectId };
      const updateData = {
        $set: data,
      };
      const result = await issuesCollection.updateOne(filter, updateData);
      res.send(result);
    });

    app.get("/latest-issues", async (req, res) => {
      const result = await issuesCollection
        .find()
        .sort({ _id: -1 })
        .limit(8)
        .toArray();

      res.send(result);
    });

    app.get("/debug-total", async (req, res) => {
      const total = await issuesCollection.countDocuments();
      res.send({ total });
    });

    // await client.db("admin").command({ ping: 1 });
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
