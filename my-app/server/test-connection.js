const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not set in .env file');
    }
    
    console.log('Connection string preview:', process.env.MONGODB_URI.substring(0, 30) + '...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connected successfully!');
    
    // Test creating a simple document
    const testSchema = new mongoose.Schema({
      message: String,
      createdAt: { type: Date, default: Date.now }
    });
    
    const TestModel = mongoose.model('Test', testSchema);
    const testDoc = new TestModel({ message: 'Connection test successful' });
    await testDoc.save();
    
    console.log('✅ Test document created successfully!');
    
    // Clean up test document
    await TestModel.deleteOne({ _id: testDoc._id });
    console.log('✅ Test document cleaned up!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.error('\n🔧 Fix: Check your username and password in the .env file');
      console.error('Make sure you\'re using DATABASE USER credentials, not Atlas account credentials');
    }
    
    if (error.message.includes('ENOTFOUND')) {
      console.error('\n🔧 Fix: Check your cluster URL in the connection string');
    }
    
    if (error.message.includes('URI must include hostname')) {
      console.error('\n🔧 Fix: Your MongoDB URI is malformed. Check the format in .env file');
      console.error('Correct format: mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority');
    }
    
    process.exit(1);
  }
}

testConnection();