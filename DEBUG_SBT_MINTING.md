# Smart Contract Call Debugging Guide

## 🔍 How to Debug the SBT Minting Issue

### Step 1: Open Browser Developer Tools
1. Press **F12** to open Developer Tools
2. Go to the **Console** tab
3. Keep it open while testing

### Step 2: Fill the Form and Click "Add Project & Mint SBT"

### Step 3: Look for Console Logs

You should see a sequence of logs that looks like this:

```
===== PROJECT FORM SUBMISSION STARTED =====
Form Data: {...}
Current Skills: [...]
Is Connected: true/false
Address: 0x...
Chain ID: 11155111 (or different number)
SEPOLIA_CHAIN_ID constant: 11155111
✅ Wallet connected
✅ Correct network (Sepolia)
Formatted Data for Backend: {...}
Saving project to backend...
✅ Project saved to backend successfully
Starting blockchain SBT minting...
===== handleMintSBT CALLED =====
Project Data received: {...}
✅ Wallet connected: 0x...
Contract Addresses:
  Freelancer: 0xcEb98b9E4773dF57b5dB1cB9e097404b684FeE5A
  SBT: 0x73b8Ecfd44DA278f856E50e6A328c13bC8F5A5e3
Starting SBT minting process...
Freelancer ID: freelancer_0x...
```

---

## 🚨 If You See These Errors:

### Error: "Wallet not connected. Please connect your wallet first."
**Problem**: Wallet is not connected
**Solution**: 
1. Click the wallet connect button
2. Approve the connection in MetaMask
3. Try again

### Error: "Wrong network. Please switch to Sepolia"
**Problem**: Not on Sepolia testnet
**Solution**:
1. Open MetaMask
2. Click on network selector (top right)
3. Switch to "Sepolia"
4. Try again

### Error: "Form validation errors"
**Problem**: Some required fields are missing or invalid
**Solution**:
Look at the error message to see which field:
- **Step 1**: Project Name, Description, Start Date, End Date, At least 1 Skill
- **Step 2**: Live Demo Link (required), Reference, Role, Thumbnail (required)

### Error in Console: "❌ ERROR in project submission"
**Problem**: Something failed during submission
**Solution**:
1. Read the error message below it
2. Check if it mentions:
   - "Backend" → Database save failed
   - "Blockchain" → Smart contract call failed
   - "Gas" → Not enough gas or estimation issue

---

## 🔧 Checking Environment Variables

If you see "Invalid contract address format in .env.local", check:

```bash
cd dehix_alpha_frontend
grep -i "FREELANCER_CONTRACT\|SBT_CONTRACT\|SOUL_BOUND" .env.local
```

The output should show addresses like:
```
NEXT_PUBLIC_FREELANCER_CONTRACT_SEPOLIA=0xcEb98b9E4773dF57b5dB1cB9e097404b684FeE5A
NEXT_PUBLIC_SBT_CONTRACT_SEPOLIA=0x73b8Ecfd44DA278f856E50e6A328c13bC8F5A5e3
```

---

## 📋 Complete Check List

Before clicking "Add Project & Mint SBT":

- [ ] Open **Developer Console** (F12)
- [ ] **Wallet connected** (green status shows in footer)
- [ ] **Correct network**: Sepolia (Chain ID: 11155111)
- [ ] **Step 1 fields filled**:
  - [x] Project Name
  - [x] Description
  - [x] Start Date (not in future)
  - [x] End Date (at least 1 month after start)
  - [x] At least 1 Skill selected
- [ ] **Step 2 fields filled**:
  - [x] Live Demo Link (required - must be valid URL)
  - [x] Reference (required)
  - [x] Role (required)
  - [x] Thumbnail (required - must upload image)
- [ ] **GitHub Link**: Empty or valid GitHub URL (optional)

---

## 📊 What Should Happen on Submit

1. **Button changes** to "Saving & Minting..."
2. **Console logs** show "===== PROJECT FORM SUBMISSION STARTED ====="
3. **Logs continue** with each step
4. **MetaMask popup** appears asking for transaction approval (appears twice)
5. **Success message** appears with transaction hash
6. **Dialog closes** automatically

---

## ⏱️ Timing

The whole process typically takes:
- **5-10 seconds** for console logs to show up
- **10-20 seconds** for MetaMask popup to appear
- **30-60 seconds** for transactions to be confirmed
- **Total**: 1-2 minutes

**Be patient!** Don't close the dialog or click the button again.

---

## 🐛 If Nothing Happens

1. **Check Console** - look for errors starting with `❌`
2. **Check MetaMask** - approve any pending popups
3. **Check Network** - confirm you're on Sepolia
4. **Check Form** - make sure all fields are filled
5. **Refresh page** - `F5` and try again
6. **Check fees** - do you have enough test ETH on Sepolia?

Get Sepolia testnet ETH from: https://sepoliafaucet.com

---

## 🔗 Useful Links

- **Sepolia Faucet**: https://sepoliafaucet.com
- **Sepolia Etherscan**: https://sepolia.etherscan.io
- **Check TX Status**: Paste your transaction hash in Etherscan

---

## 📞 Getting Help

Share these details with support:
1. Screenshot of console errors (`F12` → Console)
2. Your wallet address (from MetaMask)
3. The transaction hash (if transaction was sent)
4. Steps you took right before the error

```
Transaction Hash Example: 0xabc123def456...
Check status: https://sepolia.etherscan.io/tx/0xabc123def456...
```
