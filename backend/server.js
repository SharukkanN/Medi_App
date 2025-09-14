import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import './config/db.js';   // Import DB connection to show message
import './config/cloudinary.js';   // Import Cloudinary configuration
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

// App config
const app = express();
const port = process.env.PORT || 4000;

// Middlewares
app.use(express.json());
app.use(cors());


app.use("/api/users", userRoutes);

app.use("/api/doctor", doctorRoutes);

app.use("/api/bookings", bookingRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/upload", uploadRoutes);
// API endpoint
app.get('/', (req, res) => {
    res.send('🚀 API WORKING');
});

// Start server
app.listen(port, () => console.log(`🚀 Server Started on port ${port}`));
