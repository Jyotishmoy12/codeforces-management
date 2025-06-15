import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors'
import studentRoutes from './routes/studentRoutes.js';
import './cron/syncStudents.js'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

app.use('/api/students', studentRoutes);


mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected ✅");
        app.listen(PORT, () => console.log("🚀 Server at http://localhost:5000"));
    })
    .catch((err) => console.error("❌ MongoDB error: ", err));



