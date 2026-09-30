import "dotenv/config";
import mongoose from "mongoose";
import { connectDatabase } from "./config/db.js";
import User from "./models/User.js";

const employeeNames = [
  "Aarav Sharma", "Ananya Rao", "Arjun Nair", "Diya Menon", "Ishaan Kapoor",
  "Kavya Iyer", "Manav Gupta", "Meera Joshi", "Neel Reddy", "Nisha Verma",
  "Rohan Das", "Saanvi Patel", "Siddharth Jain", "Tara Krishnan", "Varun Bhat",
  "Zoya Khan", "Aditya Bose", "Ira Sen", "Kiran Thomas", "Maya Pillai",
];

await connectDatabase();
const existingEmails = new Set((await User.find({
  email: { $in: employeeNames.map((name) => `${name.toLowerCase().replaceAll(" ", ".")}@cirruslabs.io`) },
}).select("email").lean()).map(({ email }) => email));

const employees = employeeNames
  .map((name, index) => ({
    name,
    email: `${name.toLowerCase().replaceAll(" ", ".")}@cirruslabs.io`,
    password: "employee123",
    role: "employee",
    employeeCode: `EMP-${String(index + 1004).padStart(4, "0")}`,
    department: "Technology",
  }))
  .filter(({ email }) => !existingEmails.has(email));

if (employees.length) await User.create(employees);
console.log(`Added ${employees.length} employees. Employee total: ${await User.countDocuments({ role: "employee", status: "active" })}`);
await mongoose.disconnect();
