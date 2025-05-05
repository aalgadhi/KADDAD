const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

const createAdmin = async () => {
  try {
    const dbConnectionString = await new Promise((resolve) => {
      readline.question('Enter MongoDB connection string: ', (connectionString) => {
        resolve(connectionString.trim());
      });
    });

    const email = await new Promise((resolve) => {
      readline.question('Enter admin email: ', (email) => {
        resolve(email.trim());
      });
    });

    const password = await new Promise((resolve) => {
      readline.question('Enter admin password: ', (password) => {
        resolve(password.trim());
      });
    });

    await mongoose.connect(dbConnectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const existingAdmin = await User.findOne({ email: email, isAdmin: true });
    if (existingAdmin) {
      console.log('An admin user with this email already exists. Exiting.');
      readline.close();
      mongoose.disconnect();
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      phone: '123-456-7890',
      email: email,
      password: hashedPassword,
      address: '',
      isAdmin: true,
      paymentMethods: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      __v: 0,
    });

    await adminUser.save();
    console.log('Admin user created successfully!');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    readline.close();
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createAdmin();