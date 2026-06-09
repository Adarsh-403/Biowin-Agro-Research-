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

// Helper function to generate 3-digit ID
function generate3DigitId() {
  return Math.floor(100 + Math.random() * 900).toString();
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

    // Database and collections will be auto-created lazily on first insertion.

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
    
    // Drop the entire Database dedicated to this unit
    const unit = await db.collection("units_metadata").findOne({ unitId });
    if (unit) {
      try {
        await client.db(`Unit_${unit.unitId}`).dropDatabase();
      } catch (e) {
        console.warn(`Could not drop Database for unit ${unit.unitId}:`, e.message);
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

// Unit Login
app.post('/api/auth/unit-login', async (req, res) => {
  const { unitId, password } = req.body;
  if (!unitId || !password) {
    return res.status(400).json({ success: false, message: "Unit ID and password are required" });
  }
  try {
    const db = client.db("Units");
    const unit = await db.collection("units_metadata").findOne({ unitId });
    if (!unit) {
      return res.status(401).json({ success: false, message: "Invalid Unit ID" });
    }
    if (unit.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }
    // Remove password from response
    const { password: _, ...unitResponse } = unit;
    res.status(200).json({ success: true, unit: unitResponse, message: "Login successful" });
  } catch (err) {
    console.error("Error during unit login:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get products for a unit
app.get('/api/units/:unitId/products', async (req, res) => {
  const { unitId } = req.params;
  try {
    const db = client.db("Units");
    const unit = await db.collection("units_metadata").findOne({ unitId });
    if (!unit) {
      return res.status(404).json({ success: false, message: "Unit not found" });
    }
    const unitDb = client.db(`Unit_${unitId}`);
    const products = await unitDb.collection("stocks").find({}).toArray();
    res.status(200).json({ success: true, products });
  } catch (err) {
    console.error("Error fetching unit products:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Helper function to generate a 5-digit hex ID
function generate5DigitHex() {
  return Math.floor(Math.random() * 0xFFFFF).toString(16).padStart(5, '0').toUpperCase();
}

// Add or stock up a product in unit from global catalog
app.post('/api/units/:unitId/products', async (req, res) => {
  const { unitId } = req.params;
  const { productId, quantity } = req.body;

  if (!productId || quantity === undefined) {
    return res.status(400).json({ success: false, message: "Product ID and quantity required" });
  }

  try {
    const db = client.db("Units");
    const unit = await db.collection("units_metadata").findOne({ unitId });
    if (!unit) {
      return res.status(404).json({ success: false, message: "Unit not found" });
    }

    // Lookup official product in Warehouses global catalog
    const warehouseDb = client.db("Warehouses");
    const globalProduct = await warehouseDb.collection("products").findOne({ productId });
    if (!globalProduct) {
      return res.status(404).json({ success: false, message: "Product not found in warehouse catalog" });
    }

    const unitDb = client.db(`Unit_${unitId}`);
    const qty = Number(quantity);

    let existingProduct = await unitDb.collection("stocks").findOne({ productId });

    if (existingProduct) {
      await unitDb.collection("stocks").updateOne(
        { _id: existingProduct._id },
        { 
          $inc: { quantity: qty },
          $set: { price: globalProduct.price, name: globalProduct.name } // Always sync latest official name/price
        }
      );
      res.status(200).json({ success: true, message: "Product stock updated successfully" });
    } else {
      const newStock = {
        productId: globalProduct.productId,
        name: globalProduct.name,
        quantity: qty,
        price: globalProduct.price,
        createdAt: new Date()
      };
      await unitDb.collection("stocks").insertOne(newStock);
      res.status(201).json({ success: true, product: newStock, message: "Product added to unit stock" });
    }
  } catch (err) {
    console.error("Error adding product to unit:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Edit a product's price in unit stock
app.put('/api/units/:unitId/products/:productId', async (req, res) => {
  const { unitId, productId } = req.params;
  const { price } = req.body;

  if (price === undefined || isNaN(Number(price))) {
    return res.status(400).json({ success: false, message: "Valid price is required" });
  }

  try {
    const db = client.db("Units");
    const unit = await db.collection("units_metadata").findOne({ unitId });
    if (!unit) {
      return res.status(404).json({ success: false, message: "Unit not found" });
    }

    const unitDb = client.db(`Unit_${unitId}`);
    const result = await unitDb.collection("stocks").updateOne(
      { productId },
      { $set: { price: Number(price) } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Product not found in unit stock" });
    }

    res.status(200).json({ success: true, message: "Product price updated successfully" });
  } catch (err) {
    console.error("Error updating unit product price:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete a product from unit stock
app.delete('/api/units/:unitId/products/:productId', async (req, res) => {
  const { unitId, productId } = req.params;

  try {
    const db = client.db("Units");
    const unit = await db.collection("units_metadata").findOne({ unitId });
    if (!unit) {
      return res.status(404).json({ success: false, message: "Unit not found" });
    }

    const unitDb = client.db(`Unit_${unitId}`);
    const result = await unitDb.collection("stocks").deleteOne({ productId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Product not found in unit stock" });
    }

    res.status(200).json({ success: true, message: "Product deleted from stock successfully" });
  } catch (err) {
    console.error("Error deleting unit product from stock:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Process a sale (billing)
app.post('/api/units/:unitId/sell', async (req, res) => {
  const { unitId } = req.params;
  const { items, paymentMethod } = req.body; // Array of { productName, quantity, price } and paymentMethod string

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: "No items provided for sale" });
  }

  try {
    const db = client.db("Units");
    const unit = await db.collection("units_metadata").findOne({ unitId });
    if (!unit) {
      return res.status(404).json({ success: false, message: "Unit not found" });
    }

    const unitDb = client.db(`Unit_${unitId}`);

    // 1. Verify stock before proceeding
    for (const item of items) {
      const product = await unitDb.collection("stocks").findOne({
        name: item.productName
      });
      if (!product || product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.productName}. Available: ${product ? product.quantity : 0}`
        });
      }
    }

    // 2. Reduce stock
    for (const item of items) {
      await unitDb.collection("stocks").updateOne(
        { name: item.productName },
        { $inc: { quantity: -item.quantity } }
      );
    }

    // 3. Record the sale document
    let saleId;
    let isUnique = false;
    while (!isUnique) {
      saleId = generate5DigitHex();
      const check = await unitDb.collection("sales").findOne({ receiptId: saleId });
      if (!check) isUnique = true;
    }

    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const saleRecord = {
      receiptId: saleId,
      timestamp: new Date(),
      items,
      totalAmount,
      paymentMethod: paymentMethod || 'Cash'
    };
    await unitDb.collection("sales").insertOne(saleRecord);

    // 4. Update unit's metadata
    await db.collection("units_metadata").updateOne(
      { unitId },
      { 
        $inc: { 
          totalSales: 1, 
          revenue: totalAmount 
        } 
      }
    );

    res.status(200).json({ success: true, sale: saleRecord, message: "Sale processed successfully" });
  } catch (err) {
    console.error("Error processing sale:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get sales history for a unit
app.get('/api/units/:unitId/sales', async (req, res) => {
  const { unitId } = req.params;
  try {
    const db = client.db("Units");
    const unit = await db.collection("units_metadata").findOne({ unitId });
    if (!unit) {
      return res.status(404).json({ success: false, message: "Unit not found" });
    }
    const unitDb = client.db(`Unit_${unitId}`);
    const sales = await unitDb.collection("sales")
      .find({})
      .sort({ timestamp: -1 })
      .toArray();
    res.status(200).json({ success: true, sales });
  } catch (err) {
    console.error("Error fetching unit sales:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- WAREHOUSES ---

// Route to create a new warehouse
app.post('/api/warehouses', async (req, res) => {
  const { name, region, address, password, status } = req.body;
  if (!name || !region || !address || !password) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }
  try {
    const db = client.db("Warehouses");
    let warehouseId;
    let isUnique = false;
    while (!isUnique) {
      warehouseId = generate3DigitId();
      const existing = await db.collection("warehouses_metadata").findOne({ warehouseId });
      if (!existing) isUnique = true;
    }
    const newWarehouse = {
      warehouseId,
      name,
      region,
      address,
      password,
      capacity: 0,
      utilization: 0,
      status: status || 'Active',
      createdAt: new Date()
    };
    await db.collection("warehouses_metadata").insertOne(newWarehouse);
    const { password: _, ...warehouseResponse } = newWarehouse;
    res.status(201).json({ success: true, warehouse: warehouseResponse, message: "Warehouse created successfully" });
  } catch (err) {
    console.error("Error creating warehouse:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Route to get all warehouses
app.get('/api/warehouses', async (req, res) => {
  try {
    const db = client.db("Warehouses");
    const warehouses = await db.collection("warehouses_metadata").find({}, { projection: { password: 0 } }).toArray();
    res.status(200).json({ success: true, warehouses });
  } catch (err) {
    console.error("Error fetching warehouses:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Route to edit a warehouse
app.put('/api/warehouses/:warehouseId', async (req, res) => {
  const { warehouseId } = req.params;
  const { name, region, address, status, capacity, utilization } = req.body;
  try {
    const db = client.db("Warehouses");
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (region !== undefined) updateData.region = region;
    if (address !== undefined) updateData.address = address;
    if (status !== undefined) updateData.status = status;
    if (capacity !== undefined) updateData.capacity = Number(capacity);
    if (utilization !== undefined) updateData.utilization = Number(utilization);

    const result = await db.collection("warehouses_metadata").updateOne(
      { warehouseId },
      { $set: updateData }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Warehouse not found" });
    }
    res.status(200).json({ success: true, message: "Warehouse updated successfully" });
  } catch (err) {
    console.error("Error updating warehouse:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Route to delete a warehouse
app.delete('/api/warehouses/:warehouseId', async (req, res) => {
  const { warehouseId } = req.params;
  try {
    const db = client.db("Warehouses");
    const result = await db.collection("warehouses_metadata").deleteOne({ warehouseId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Warehouse not found" });
    }
    res.status(200).json({ success: true, message: "Warehouse deleted successfully" });
  } catch (err) {
    console.error("Error deleting warehouse:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- CONVOYS ---

// Route to create a new convoy
app.post('/api/convoys', async (req, res) => {
  const { name, region, address, password, status } = req.body;
  if (!name || !region || !address || !password) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }
  try {
    const db = client.db("Convoys");
    let convoyId;
    let isUnique = false;
    while (!isUnique) {
      convoyId = generate3DigitId();
      const existing = await db.collection("convoys_metadata").findOne({ convoyId });
      if (!existing) isUnique = true;
    }
    const newConvoy = {
      convoyId,
      name,
      region,
      address,
      password,
      vehicles: 0,
      activeRoutes: 0,
      status: status || 'Active',
      createdAt: new Date()
    };
    await db.collection("convoys_metadata").insertOne(newConvoy);
    const { password: _, ...convoyResponse } = newConvoy;
    res.status(201).json({ success: true, convoy: convoyResponse, message: "Convoy created successfully" });
  } catch (err) {
    console.error("Error creating convoy:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Route to get all convoys
app.get('/api/convoys', async (req, res) => {
  try {
    const db = client.db("Convoys");
    const convoys = await db.collection("convoys_metadata").find({}, { projection: { password: 0 } }).toArray();
    res.status(200).json({ success: true, convoys });
  } catch (err) {
    console.error("Error fetching convoys:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Route to edit a convoy
app.put('/api/convoys/:convoyId', async (req, res) => {
  const { convoyId } = req.params;
  const { name, region, address, status, vehicles, activeRoutes } = req.body;
  try {
    const db = client.db("Convoys");
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (region !== undefined) updateData.region = region;
    if (address !== undefined) updateData.address = address;
    if (status !== undefined) updateData.status = status;
    if (vehicles !== undefined) updateData.vehicles = Number(vehicles);
    if (activeRoutes !== undefined) updateData.activeRoutes = Number(activeRoutes);

    const result = await db.collection("convoys_metadata").updateOne(
      { convoyId },
      { $set: updateData }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Convoy not found" });
    }
    res.status(200).json({ success: true, message: "Convoy updated successfully" });
  } catch (err) {
    console.error("Error updating convoy:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Route to delete a convoy
app.delete('/api/convoys/:convoyId', async (req, res) => {
  const { convoyId } = req.params;
  try {
    const db = client.db("Convoys");
    const result = await db.collection("convoys_metadata").deleteOne({ convoyId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Convoy not found" });
    }
    res.status(200).json({ success: true, message: "Convoy deleted successfully" });
  } catch (err) {
    console.error("Error deleting convoy:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Warehouse Login
app.post('/api/auth/warehouse-login', async (req, res) => {
  const { warehouseId, password } = req.body;
  if (!warehouseId || !password) {
    return res.status(400).json({ success: false, message: "Warehouse ID and password are required" });
  }
  try {
    const db = client.db("Warehouses");
    const warehouse = await db.collection("warehouses_metadata").findOne({ warehouseId });
    if (!warehouse) {
      return res.status(401).json({ success: false, message: "Invalid Warehouse ID" });
    }
    if (warehouse.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }
    const { password: _, ...warehouseResponse } = warehouse;
    res.status(200).json({ success: true, warehouse: warehouseResponse, message: "Login successful" });
  } catch (err) {
    console.error("Error during warehouse login:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Convoy Login
app.post('/api/auth/convoy-login', async (req, res) => {
  const { convoyId, password } = req.body;
  if (!convoyId || !password) {
    return res.status(400).json({ success: false, message: "Convoy ID and password are required" });
  }
  try {
    const db = client.db("Convoys");
    const convoy = await db.collection("convoys_metadata").findOne({ convoyId });
    if (!convoy) {
      return res.status(401).json({ success: false, message: "Invalid Convoy ID" });
    }
    if (convoy.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }
    const { password: _, ...convoyResponse } = convoy;
    res.status(200).json({ success: true, convoy: convoyResponse, message: "Login successful" });
  } catch (err) {
    console.error("Error during convoy login:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get products for warehouse
app.get('/api/warehouses/products', async (req, res) => {
  try {
    const db = client.db("Warehouses");
    const products = await db.collection("products").find({}).toArray();
    res.status(200).json({ success: true, products });
  } catch (err) {
    console.error("Error fetching warehouse products:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Add new product to warehouse collection
app.post('/api/warehouses/products', async (req, res) => {
  const { name, price } = req.body;
  
  if (!name || price === undefined) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    const db = client.db("Warehouses");
    const normalizedName = name.trim();
    
    let newId;
    let isUnique = false;
    while (!isUnique) {
      newId = generate5DigitHex();
      const check = await db.collection("products").findOne({ productId: newId });
      if (!check) isUnique = true;
    }

    const newProduct = {
      productId: newId,
      name: normalizedName,
      price: Number(price),
      isAvailable: true,
      createdAt: new Date()
    };
    
    await db.collection("products").insertOne(newProduct);
    res.status(201).json({ success: true, product: newProduct, message: "Product added successfully" });
  } catch (err) {
    console.error("Error adding warehouse product:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Edit a warehouse product
app.put('/api/warehouses/products/:productId', async (req, res) => {
  const { productId } = req.params;
  const { name, price, isAvailable } = req.body;
  
  try {
    const db = client.db("Warehouses");
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (price !== undefined) updateData.price = Number(price);
    if (isAvailable !== undefined) updateData.isAvailable = Boolean(isAvailable);

    const result = await db.collection("products").updateOne(
      { productId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, message: "Product updated successfully" });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete a warehouse product
app.delete('/api/warehouses/products/:productId', async (req, res) => {
  const { productId } = req.params;
  
  try {
    const db = client.db("Warehouses");
    const result = await db.collection("products").deleteOne({ productId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
