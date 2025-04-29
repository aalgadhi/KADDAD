const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();


const app = express();

app.use(cors());
app.use(express.json());


//user routes
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

//trip routes
const tripRoutes = require('./routes/tripRoutes');
app.use('/api/trips', tripRoutes);
// Example route
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.post('/trips', (req, res) => {
  const trip = req.body;
  console.log('Trip received:', trip);
  // You can save to database here
  res.status(201).json({ message: 'Trip saved successfully!' });
});




// Connect MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB connection failed:', err));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));