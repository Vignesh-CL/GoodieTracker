import "dotenv/config";
import mongoose from "mongoose";
import { connectDatabase } from "./config/db.js";
import User from "./models/User.js";
import Goodie from "./models/Goodie.js";
import Event from "./models/Event.js";

await connectDatabase();
await User.deleteMany({});
await Goodie.deleteMany({});
await Event.deleteMany({});
const employeeNames = [
  "Aarav Sharma", "Ananya Rao", "Arjun Nair", "Diya Menon", "Ishaan Kapoor",
  "Kavya Iyer", "Manav Gupta", "Meera Joshi", "Neel Reddy", "Nisha Verma",
  "Rohan Das", "Saanvi Patel", "Siddharth Jain", "Tara Krishnan", "Varun Bhat",
  "Zoya Khan", "Aditya Bose", "Ira Sen", "Kiran Thomas", "Maya Pillai",
];
await User.create([
  { name: "Admin", email: "admin@cirruslabs.io", password: "admin123", role: "admin", employeeCode: "ADM-0001", department: "Operations" },
  { name: "Vignesh D D", email: "vignesh.dd@cirruslabs.io", password: "employee123", role: "employee", employeeCode: "EMP-1001", department: "Technology" },
  { name: "Prajwal K M", email: "prajwal.km@cirruslabs.io", password: "employee123", role: "employee", employeeCode: "EMP-1002", department: "Technology" },
  { name: "Subham Singh", email: "subham.singh@cirruslabs.io", password: "employee123", role: "employee", employeeCode: "EMP-1003", department: "Technology" },
  ...employeeNames.map((name, index) => ({ name, email: `${name.toLowerCase().replaceAll(" ", ".")}@cirruslabs.io`, password: "employee123", role: "employee", employeeCode: `EMP-${String(index + 1004).padStart(4, "0")}`, department: "Technology" })),
]);
const goodies = await Goodie.create([{ name: "CirrusLabs T-shirt", description: "A T-shirt with logo of cirruslab.", stock: 120 }, { name: "Cirrus Book", description: "A TO-DO book to track our activity", stock: 80 }]);
await Event.create({ name: "September Welcome Kit", date: "2026-09-26", status: "active", goodies: goodies.map(({ _id }) => _id) });
console.log("Seed complete");
await mongoose.disconnect();
