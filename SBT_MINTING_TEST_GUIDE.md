# SBT Minting Integration - Test Guide

## ✅ What Was Fixed in addProject.tsx

### Problem
- Standalone "Mint Project SBT" button was bypassing form submission
- Smart contract wasn't being called because backend save wasn't happening first
- Users couldn't complete the full flow

### Solution
- **Removed** the standalone "Mint Project SBT" button
- **Updated** the "Add Project" button to handle both backend save AND SBT minting
- **Added** wallet connection warnings and validation
- **Improved** error handling to distinguish blockchain vs backend errors

---

## 🔄 Complete Workflow

### Step 1: Fill Basic Project Information
Required fields:
- ✅ Project Name
- ✅ Description  
- ✅ Start Date
- ✅ End Date
- ✅ At least 1 Technology/Skill

Click **Next** to proceed to Step 2

### Step 2: Fill Additional Information
Required fields:
- ✅ Live Demo Link
- ✅ Reference
- ✅ Role
- ✅ Project Thumbnail (upload image)

Optional fields:
- GitHub Link (optional)
- Project Type (optional)
- Comments (optional)

### Step 3: Submit & Mint SBT
1. Make sure your **wallet is connected** (status shown in footer)
2. Make sure you're on **Sepolia testnet**
3. Click **"Add Project & Mint SBT"** button

---

## 📋 What Happens on Submit

### When you click "Add Project & Mint SBT":

1. **Form Validation** - All required fields are validated
2. **Backend Save** - Project data is saved to database
   ```
   POST /freelancer/projects
   ```
3. **Blockchain Registration** - Freelancer is registered on-chain
   ```
   Function: addFreelancer(freelancerId, address)
   Contract: 0xcEb98b9E4773dF57b5dB1cB9e097404b684FeE5A
   ```
4. **SBT Minting** - Soul Bound Token is minted
   ```
   Function: mintFreelancerToken(address, freelancerId)
   Contract: 0x73b8Ecfd44DA278f856E50e6A328c13bC8F5A5e3
   ```
5. **Success** - You'll see the transaction hash

---

## 🐛 Debugging Checklist

If the smart contract isn't being called:

- [ ] **Wallet Connected?** Check green status at bottom right
- [ ] **Correct Network?** Must be on Sepolia testnet (Chain ID: 11155111)
- [ ] **All Fields Filled?** Check for red error messages
- [ ] **Image Uploaded?** Thumbnail is required
- [ ] **Check Browser Console** (F12) for detailed logs:
  - `Starting SBT minting process...`
  - `Calling addFreelancer...`
  - `Calling mintFreelancerToken...`
  - Transaction hashes should appear

---

## 📊 Contract Details

| Item | Value |
|------|-------|
| **Freelancer Contract** | `0xcEb98b9E4773dF57b5dB1cB9e097404b684FeE5A` |
| **SBT Contract** | `0x73b8Ecfd44DA278f856E50e6A328c13bC8F5A5e3` |
| **Network** | Sepolia (Chain ID: 11155111) |
| **Gas Buffer** | 120% of estimated gas |

---

## ✨ Key Changes Made

### addProject.tsx
- ✅ Removed standalone "Mint Project SBT" button
- ✅ Updated footer with wallet connection status
- ✅ Button now shows "Add Project & Mint SBT"
- ✅ Form validates all required fields before submission
- ✅ Debug console logging added throughout the flow
- ✅ Error handling distinguishes blockchain vs backend errors

### addEducation.tsx
- ✅ Same improvements applied
- ✅ Throws errors properly for error handling
- ✅ Debug console logging
- ✅ Wallet connection validation

### addExperiences.tsx  
- ✅ Same improvements applied
- ✅ Throws errors properly for error handling
- ✅ Debug console logging
- ✅ Wallet connection validation

---

## 🚀 Testing Steps

1. **Connect Wallet**
   - Click wallet button
   - Connect MetaMask
   - Switch to Sepolia testnet

2. **Open Add Project Dialog**
   - Click the "+" button

3. **Step 1 - Fill Basic Info**
   - Enter project name
   - Enter description
   - Select start date (today or earlier)
   - Select end date (at least 1 month later)
   - Select at least 1 skill
   - Click **Next**

4. **Step 2 - Fill Additional Info**
   - Enter live demo URL (https://...)
   - Enter reference
   - Enter role
   - **Upload thumbnail image** ⚠️ REQUIRED
   - Click **Add Project & Mint SBT**

5. **Verify**
   - Check success notification
   - Open browser DevTools (F12)
   - Look for transaction hash in console
   - Verify transaction on Sepolia Etherscan

---

## 🔍 Console Expected Output

```
Saving project to backend...
Project saved to backend successfully
Starting blockchain SBT minting...
Starting SBT minting process...
Freelancer ID: freelancer_0x1234...
Freelancer Contract: 0xcEb98b9E4773dF57b5dB1cB9e097404b684FeE5A
SBT Contract: 0x73b8Ecfd44DA278f856E50e6A328c13bC8F5A5e3
Estimating gas for addFreelancer...
Calling addFreelancer...
addFreelancer transaction hash: 0xabc...
Waiting for addFreelancer receipt...
addFreelancer transaction confirmed
Estimating gas for mintFreelancerToken...
Calling mintFreelancerToken...
mintFreelancerToken transaction hash: 0xdef...
Waiting for mint receipt...
Mint transaction confirmed: 0xghi...
SBT minting completed successfully
```

---

## ❌ Common Issues & Solutions

### "Connect wallet to mint SBT" message
- **Issue**: Wallet not connected
- **Solution**: Click wallet button and connect MetaMask

### Form won't submit
- **Issue**: Missing required fields in Step 2
- **Solution**: Fill: Live Demo Link, Reference, Role, Thumbnail (required)

### "Wrong Network" error
- **Issue**: Not on Sepolia testnet
- **Solution**: Switch MetaMask to Sepolia testnet

### "Blockchain Error" notification
- **Check Console** for specific error details
- Usually means contract call reverted on-chain

---

## ✅ Verification Success

You'll know it's working when:
1. ✅ No standalone "Mint" button exists
2. ✅ "Add Project & Mint SBT" button appears on Step 2
3. ✅ Wallet status shows in footer
4. ✅ Clicking button saves to backend AND calls smart contract
5. ✅ Success message includes transaction hash
6. ✅ Transaction is visible on Sepolia Etherscan
