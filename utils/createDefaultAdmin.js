const bcrypt = require("bcrypt");
const usermodel = require("../model/userModel"); // Import user model

async function createDefaultAdmin() {
    try {
        console.log("Checking for default admin...");

        // Check if an admin already exists
        const adminUser = await usermodel.findOne({ userType: "ADMIN" });

        if (adminUser) {
            console.log("✅ Default admin already exists:", adminUser.email);
            return;
        }

        // Hash the password securely
        const hashedPassword = await bcrypt.hash("vikas", 10);

        // Create a new admin user
        const adminDefault = {
            firstName: "Vikas",
            lastName: "Agrahari",
            email: "hackmobile63@gmail.com",
            pass: hashedPassword,
            mobile: 7310370532,
            userType: "ADMIN",
            otpVarify: true,
            statusCode: "ACTIVE",
        };

        const admin = new usermodel(adminDefault);
        await admin.save();
        console.log("✅ Default ad min created successfully", admin);
    } catch (error) {
        console.error("❌ Error creating default admin:", error);
    }
}

module.exports = createDefaultAdmin;
