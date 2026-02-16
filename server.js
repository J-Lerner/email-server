import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Allowed origins for CORS
const allowedOrigins = [
  "http://127.0.0.1:3000",
  "http://localhost:3000",
  "https://yourdomain.com" // replace with your live site domain
];

// CORS setup
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// Signup route
app.post("/signup", async (req, res) => {
  const {
    name,
    email,
    phone,
    year,
    skill,
    position,
    message,
    program
  } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // STARTTLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Email to you
    await transporter.sendMail({
      from: `"Course Signup" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "New Signup",
      html: `
        <h2>New Signup</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Grad Year:</b> ${year}</p>
        <p><b>Playing Level:</b> ${skill}</p>
        <p><b>Position:</b> ${position}</p>
        <p><b>Program:</b> ${program}</p>
        <p><b>Message:</b><br>${message}</p>
      `
    });

    // Confirmation email to user
    await transporter.sendMail({
      from: `"Ilya Soccer" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "You're Signed Up ⚽",
      html: `
        <h1>Welcome, ${name}!</h1>
        <p>Thanks for signing up for <b>${program}</b>.</p>
        <p>I’ll personally reach out within 24 hours.</p>
      `
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Email sending failed:", err);
    res.status(500).json({ success: false, error: "Email sending failed" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});