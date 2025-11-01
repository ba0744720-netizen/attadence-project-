// ========================================
// 🔐 AUTHENTICATION ROUTES
// ========================================
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

// ========================================
// 📝 LOGIN ENDPOINT (WITH DETAILED LOGGING)
// ========================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log("\n🔐 ===== LOGIN ATTEMPT =====");
    console.log("📧 Email:", email);
    console.log("🔑 Password length:", password ? password.length : 0);

    // Validate input
    if (!email || !password) {
      console.log("❌ Missing email or password");
      return res.status(400).json({ 
        success: false,
        message: "Email and password are required" 
      });
    }

    // Find user by email
    console.log("🔍 Searching for user in database...");
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    console.log("✅ User found:", {
      id: user.id,
      email: user.email,
      role: user.role,
      hasPassword: !!user.password
    });

    // Check if password exists
    if (!user.password) {
      console.log("❌ User has no password in database!");
      return res.status(500).json({ 
        success: false,
        message: "Account configuration error. Please contact admin." 
      });
    }

    // Compare password
    console.log("🔐 Comparing passwords...");
    console.log("   Stored hash:", user.password.substring(0, 20) + "...");
    
    let isValidPassword;
    try {
      isValidPassword = await bcrypt.compare(password, user.password);
      console.log("   Password valid:", isValidPassword);
    } catch (bcryptError) {
      console.error("❌ Bcrypt error:", bcryptError.message);
      return res.status(500).json({ 
        success: false,
        message: "Password verification error" 
      });
    }
    
    if (!isValidPassword) {
      console.log("❌ Invalid password for:", email);
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    // Check JWT secret
    if (!process.env.JWT_SECRET) {
      console.log("❌ JWT_SECRET not found in environment!");
      return res.status(500).json({ 
        success: false,
        message: "Server configuration error" 
      });
    }

    // Generate JWT token
    console.log("🎫 Generating JWT token...");
    let token;
    try {
      token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role,
          staffId: user.staffId 
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
      console.log("   Token generated successfully");
    } catch (jwtError) {
      console.error("❌ JWT error:", jwtError.message);
      return res.status(500).json({ 
        success: false,
        message: "Token generation error" 
      });
    }

    console.log("✅ Login successful for:", email, "| Role:", user.role);
    console.log("===========================\n");

    // Send response
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        staffId: user.staffId,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("\n❌ ===== LOGIN ERROR =====");
    console.error("Error type:", error.name);
    console.error("Error message:", error.message);
    console.error("Stack trace:", error.stack);
    console.error("===========================\n");
    
    res.status(500).json({ 
      success: false,
      message: "Server error during login",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ========================================
// 🔓 LOGOUT ENDPOINT
// ========================================
router.post("/logout", (req, res) => {
  console.log("👋 User logged out");
  res.json({ 
    success: true, 
    message: "Logged out successfully" 
  });
});

// ========================================
// ✅ VERIFY TOKEN ENDPOINT
// ========================================
router.get("/verify", (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ 
        valid: false, 
        error: "No token provided" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    res.json({ 
      valid: true, 
      user: decoded 
    });

  } catch (error) {
    res.status(401).json({ 
      valid: false, 
      error: "Invalid token" 
    });
  }
});

// ========================================
// 📝 REGISTER ENDPOINT
// ========================================
router.post("/register", async (req, res) => {
  try {
    const { staffId, name, email, password } = req.body;

    console.log("📝 Registration attempt for:", email);

    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "Email already registered" 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "teacher", // Default role
      staffId
    });

    console.log("✅ New user registered:", email);

    // Generate token for auto-login
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error("❌ Registration error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Registration failed" 
    });
  }
});

module.exports = router;