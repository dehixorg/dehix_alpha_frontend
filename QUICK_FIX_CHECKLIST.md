# Quick Fix Checklist for SBT Minting Not Working

## ⚡ Fastest Way to Diagnose the Issue

### 1️⃣ Open Browser Console (F12)
```
What to look for:
✅ Blue logs = Good
❌ Red logs = Problem
```

### 2️⃣ Try Submitting Form and Watch For These Logs

#### Expected sequence:
```
===== PROJECT FORM SUBMISSION STARTED =====  ← Form was clicked
✅ Wallet connected                            ← Wallet is connected
✅ Correct network (Sepolia)                   ← On right network
===== handleMintSBT CALLED =====               ← Smart contract function starting
Calling addFreelancer...                       ← First blockchain call
addFreelancer transaction hash: 0x...         ← Got transaction back
Calling mintFreelancerToken...                ← Second blockchain call
mintFreelancerToken transaction hash: 0x...   ← Got transaction back
✅ SBT minting completed successfully         ← ALL DONE!
```

#### If you see ERROR instead:
Go to **Section 3** below

---

## 2️⃣ Missing Logs?

### If you DON'T see "===== PROJECT FORM SUBMISSION STARTED =====" 
**The form click isn't being registered**

Try:
1. Make sure you're on **Step 2** (you should see the back button)
2. Make sure wallet is **connected** (green checkmark in footer)
3. Try clicking **"Add Project & Mint SBT"** again
4. If still nothing, **refresh page** (Ctrl+R) and try again

### If you see the log but form data is empty
**Form didn't capture data properly**

Try:
1. Go back to **Step 1** (click "Back")
2. Fill all fields again
3. Click **"Next"** to go to Step 2
4. Fill **all Step 2** fields (especially thumbnail!)
5. Click **"Add Project & Mint SBT"** again

---

## 3️⃣ Fixing Common Errors

### ❌ "Wallet not connected"
```
Fix:
1. Look for wallet connect button (top right area)
2. Click it
3. Approve connection in MetaMask
4. Try form again
```

### ❌ "Wrong network. Please switch to Sepolia"
```
Fix:
1. Open MetaMask
2. Top right: Click network name
3. Select "Sepolia"
4. Try form again
```

### ❌ "Form validation errors"
```
Fix:
Check you filled BOTH steps:

STEP 1:
- Project Name ✅
- Description ✅
- Start Date ✅
- End Date ✅ (at least 1 month after start date)
- At least 1 Skill ✅

STEP 2:
- Live Demo Link ✅ (must be valid URL)
- Reference ✅
- Role ✅
- Thumbnail ✅ (must upload image file!)
- GitHub (optional)
```

### ❌ "Missing contract addresses" or "Invalid contract address"
```
Fix:
Check .env.local file has:
NEXT_PUBLIC_FREELANCER_CONTRACT_SEPOLIA=0xcEb98b9E4773dF57b5dB1cB9e097404b684FeE5A
NEXT_PUBLIC_SBT_CONTRACT_SEPOLIA=0x73b8Ecfd44DA278f856E50e6A328c13bC8F5A5e3
```

### ❌ MetaMask popup doesn't appear
```
Fix:
1. Click MetaMask extension icon
2. Check for pending approval
3. Approve the transactions
4. If nothing appears, you may have rejected it
5. Refresh page and try again
```

### ❌ "No public client found"
```
Fix:
Your wallet is probably not connected to Sepolia yet.
1. Disconnect wallet (click wallet button → disconnect)
2. Switch MetaMask to Sepolia
3. Reconnect wallet
4. Try form again
```

---

## 🎯 The Nuclear Option (If All Else Fails)

```bash
# 1. Stop the app
Ctrl+C

# 2. Clear everything
rm -rf node_modules
rm -rf .next

# 3. Reinstall
npm install

# 4. Start again
npm run dev

# 5. Open http://localhost:3000
# 6. Try the form again
```

---

## 🔍 Manual Testing

### To manually test smart contract calls:

1. Open browser console (F12)
2. Go to http://sepolia.etherscan.io
3. Paste your transaction hash there
4. Should show: ✅ Success transaction

If it shows ❌ Failed, the contract call failed.

---

## 📊 Diagnostic Command

Run this in your terminal to check setup:

```bash
cd dehix_alpha_frontend
echo "Checking environment variables..."
grep -E "(FREELANCER_CONTRACT|SBT_CONTRACT|SOUL_BOUND)" .env.local || echo "❌ Variables not found!"
echo ""
echo "Checking Node modules..."
npm ls wagmi viem 2>/dev/null | head -10 || echo "❌ Dependencies not installed!"
```

---

## 💡 Pro Tips

1. **Always keep DevTools open** (F12) while testing
2. **Don't refresh** while transaction is pending
3. **Wait 30+ seconds** for MetaMask to appear
4. **Check Etherscan** to see if transaction actually sent
5. **Use Sepolia faucet** if you need test ETH: https://sepoliafaucet.com

---

## 🆘 Still Not Working?

Collect this info for support:

```
1. Browser console errors (screenshot everything red/pink)
2. Your wallet address (from MetaMask)
3. Last transaction hash (if any appeared)
4. Network you're on (should be Sepolia)
5. Steps you took exactly
6. Whether clicking button does ANYTHING at all
```

Then share with development team!
