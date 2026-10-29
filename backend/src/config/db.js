import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/crm_backend';
  await mongoose.connect(uri);
  console.log(`[db] connected: ${mongoose.connection.name}`);
}
