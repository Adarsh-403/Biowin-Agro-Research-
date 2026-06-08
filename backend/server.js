const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB URI
const uri = "mongodb+srv://mathrivedhipalankara_db_user:Qxnd5HVjDmsj28Xd@biowin.kbivdhi.mongodb.net/?appName=BioWin";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // Start Express server after successful DB connection
    app.listen(port, () => {
      console.log(`Backend server is running on port: ${port}`);
    });

  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
  }
}
run().catch(console.dir);

// Placeholder route for Admin Authentication (as mentioned in previous context)
app.post('/api/auth/admin-login', async (req, res) => {
  const { username, password } = req.body;
  // TODO: Implement actual validation logic against MongoDB here
  if (username === 'admin' && password === 'admin123') { // Example only
      res.status(200).json({ success: true, message: "Login successful" });
  } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});
