// Example Backend Implementation for Wallet Authentication
// This is a reference implementation for the /auth/wallet-login endpoint

// Node.js/Express Example
/*
const express = require('express');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');

const router = express.Router();

// Middleware to validate wallet signature (optional, more secure approach)
router.post('/auth/wallet-login', async (req, res) => {
  try {
    const { walletAddress, chainId } = req.body;

    // Validate wallet address format
    if (!ethers.isAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    // Check if user exists or create new user
    let user = await User.findOne({ walletAddress });

    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        walletAddress: walletAddress.toLowerCase(),
        email: null, // Can be updated later
        displayName: `User ${walletAddress.substring(0, 6)}`,
        type: 'freelancer', // Default type, can be changed by user
        emailVerified: false,
        createdAt: new Date(),
      });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        walletAddress: user.walletAddress,
        type: user.type,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Prepare user data response
    const userData = {
      uid: user._id,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL || null,
      phoneNumber: user.phoneNumber || null,
      emailVerified: user.emailVerified,
      type: user.type,
    };

    res.json({
      token,
      user: userData,
    });
  } catch (error) {
    console.error('Wallet login error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

module.exports = router;
*/

// More Secure Approach with Message Signing
/*
This approach requires the user to sign a message to prove ownership of the wallet.

// Frontend:
// 1. Request a message to sign
// 2. User signs with their wallet
// 3. Send signed message to backend
// 4. Backend verifies signature

// Backend verification example:
const { ethers } = require('ethers');

function verifySignature(message, signature, address) {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    return false;
  }
}

router.post('/auth/wallet-login', async (req, res) => {
  try {
    const { walletAddress, signature, message } = req.body;

    // Verify signature
    if (!verifySignature(message, signature, walletAddress)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Continue with user lookup/creation...
  } catch (error) {
    console.error('Wallet login error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});
*/

// User Model Schema Example (Mongoose)
/*
const userSchema = new Schema({
  walletAddress: {
    type: String,
    lowercase: true,
    index: true,
  },
  email: {
    type: String,
    lowercase: true,
    index: true,
    sparse: true,
  },
  displayName: String,
  photoURL: String,
  phoneNumber: String,
  type: {
    type: String,
    enum: ['freelancer', 'business'],
    default: 'freelancer',
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  kycStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});
*/

// Python/FastAPI Example
/*
from fastapi import APIRouter, HTTPException
from eth_account.messages import encode_defunct
from eth_keys.backends import BaseECBackend
import jwt
from typing import Optional

router = APIRouter()

@router.post("/auth/wallet-login")
async def wallet_login(walletAddress: str, chainId: int):
    # Validate wallet address
    if not is_valid_ethereum_address(walletAddress):
        raise HTTPException(status_code=400, detail="Invalid wallet address")
    
    # Check or create user
    user = await User.find_one({"walletAddress": walletAddress.lower()})
    
    if not user:
        user = User(
            walletAddress=walletAddress.lower(),
            displayName=f"User {walletAddress[:6]}",
            type="freelancer",
        )
        await user.insert()
    
    # Generate JWT token
    token = jwt.encode(
        {
            "userId": str(user.id),
            "walletAddress": user.walletAddress,
            "type": user.type,
        },
        settings.JWT_SECRET,
        algorithm="HS256",
    )
    
    return {
        "token": token,
        "user": {
            "uid": str(user.id),
            "email": user.email,
            "displayName": user.displayName,
            "photoURL": user.photoURL,
            "phoneNumber": user.phoneNumber,
            "emailVerified": user.emailVerified,
            "type": user.type,
        },
    }
*/

// Endpoint Security Considerations:
/*
1. Rate Limiting: Implement rate limiting to prevent brute force attacks
   - Use packages like express-rate-limit or similar for your framework
   - Limit to 5-10 requests per minute per IP

2. CORS: Configure CORS properly
   - Only allow requests from your frontend domain
   - Set appropriate headers

3. Input Validation: Always validate inputs
   - Check wallet address format (must be valid Ethereum address)
   - Check chainId is in supported list

4. Message Signing (Advanced): For additional security
   - Have users sign a message with their wallet
   - Verify the signature on the backend
   - This proves ownership of the wallet

5. JWT Tokens: Secure token generation
   - Use strong secret key (at least 32 characters)
   - Set appropriate expiration (7-30 days recommended)
   - Use HTTPS only in production

6. Database Security:
   - Hash sensitive data if applicable
   - Use environment variables for secrets
   - Implement proper access controls

Example Rate Limit Middleware (Express):
const rateLimit = require('express-rate-limit');

const walletLoginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  message: 'Too many wallet login attempts, please try again later',
});

router.post('/auth/wallet-login', walletLoginLimiter, async (req, res) => {
  // ... implementation
});
*/
