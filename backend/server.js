require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB URI from environment variables
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("Missing MONGODB_URI in .env file");
  process.exit(1);
}

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
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message);
  }
}
run().catch(console.dir);

// Start Express server independently of initial DB connection
app.listen(port, () => {
  console.log(`Backend server is running on port: ${port}`);
});

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

// Helper function to generate 4-digit ID
function generate4DigitId() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Route to create a new unit
app.post('/api/units', async (req, res) => {
  const { name, region, address, password, status } = req.body;
  
  if (!name || !region || !address || !password) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    const db = client.db("Units");
    
    // Generate unique 4 digit ID
    let unitId;
    let isUnique = false;
    while (!isUnique) {
      unitId = generate4DigitId();
      const existing = await db.collection("units_metadata").findOne({ unitId });
      if (!existing) isUnique = true;
    }

    // Create a collection with the unit name
    try {
      await db.createCollection(name);
    } catch (e) {
      console.warn(`Collection ${name} might already exist:`, e.message);
    }

    // Save unit details to a centralized metadata collection
    const newUnit = {
      unitId,
      name,
      collectionName: name, // Pointer to the unit's specific collection
      region,
      address,
      password, // In a production app, hash this password
      totalSales: 0,
      revenue: 0,
      status: status || 'Active',
      createdAt: new Date()
    };
    
    await db.collection("units_metadata").insertOne(newUnit);

    // Remove password from response
    const { password: _, ...unitResponse } = newUnit;

    res.status(201).json({ success: true, unit: unitResponse, message: "Unit created successfully" });

  } catch (err) {
    console.error("Error creating unit:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Route to get all units
app.get('/api/units', async (req, res) => {
  try {
    const db = client.db("Units");
    const units = await db.collection("units_metadata").find({}, { projection: { password: 0 } }).toArray();
    res.status(200).json({ success: true, units });
  } catch (err) {
    console.error("Error fetching units:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Route to edit a unit
app.put('/api/units/:unitId', async (req, res) => {
  const { unitId } = req.params;
  const { name, region, address, status, totalSales, revenue } = req.body;

  try {
    const db = client.db("Units");
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (region !== undefined) updateData.region = region;
    if (address !== undefined) updateData.address = address;
    if (status !== undefined) updateData.status = status;
    if (totalSales !== undefined) updateData.totalSales = Number(totalSales);
    if (revenue !== undefined) updateData.revenue = Number(revenue);

    const result = await db.collection("units_metadata").updateOne(
      { unitId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Unit not found" });
    }

    res.status(200).json({ success: true, message: "Unit updated successfully" });
  } catch (err) {
    console.error("Error updating unit:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Route to delete a unit
app.delete('/api/units/:unitId', async (req, res) => {
  const { unitId } = req.params;

  try {
    const db = client.db("Units");
    
    // Optional: drop the collection associated with this unit
    const unit = await db.collection("units_metadata").findOne({ unitId });
    if (unit && unit.name) {
      try {
        await db.collection(unit.name).drop();
      } catch (e) {
        console.warn(`Could not drop collection ${unit.name}:`, e.message);
      }
    }

    const result = await db.collection("units_metadata").deleteOne({ unitId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Unit not found" });
    }

    res.status(200).json({ success: true, message: "Unit deleted successfully" });
  } catch (err) {
    console.error("Error deleting unit:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
