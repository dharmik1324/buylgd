const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
require("dotenv").config({ path: "../.env" });

const mongoURI = "mongodb+srv://diamond-firevy:diamond123@cluster0.hrqrxxb.mongodb.net/diamondDB";

const seedUsers = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log("Connected to MongoDB for seeding");

        // Seed Admin
        const adminEmail = "patelzarana14@gmail.com";
        const adminPassword = "firevy";
        const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

        const adminUser = await User.findOneAndUpdate(
            { email: adminEmail },
            {
                name: "Administrator",
                email: adminEmail,
                password: hashedAdminPassword,
                role: "admin",
                isApproved: true,
            },
            { upsert: true, new: true }
        );
        console.log(`Admin user seeded: ${adminUser.email}`);

        // Seed Demo User
        const demoEmail = "demo@gmail.com";
        const demoPassword = "demo";
        const hashedDemoPassword = await bcrypt.hash(demoPassword, 10);

        const demoUser = await User.findOneAndUpdate(
            { email: demoEmail },
            {
                name: "Demo User",
                email: demoEmail,
                password: hashedDemoPassword,
                role: "user",
                isApproved: true,
            },
            { upsert: true, new: true }
        );
        console.log(`Demo user seeded: ${demoUser.email}`);

        process.exit(0);
    } catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
};

seedUsers();
