# Technical Documentation

##  Architecture

The system consists of five smart contracts:

### 1. MyToken
- ERC20 platform token
- Used for staking and incentives

### 2. StakingRewards
- Allows staking of platform token
- Rewards based on duration

### 3. NDASoulBoundToken
- ERC721 non-transferable token
- Represents NDA lifecycle
- Handles business and freelancer signatures
- Auto-burn on completion or expiration

### 4. FreelancerSoulBoundToken
- Non-transferable reputation NFT
- Tracks freelancer credibility

### 5. FreelancerContract
- Core business logic integration

---

##  Security Design

- AccessControl for role-based permissions
- ReentrancyGuard for protection
- State machine-based lifecycle
- Transfer override for SoulBound behavior
- Event logging for monitoring

---

##  Local Setup

### 1. Install Foundry
curl -L https://foundry.paradigm.xyz
 | bash
foundryup

## 
### 2. Install Dependencies

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell

forge script script/DeployAll.s.sol:DeployAll
--rpc-url <RPC_URL>
--private-key <PRIVATE_KEY>
--broadcast


RPC_URL=https://bnb-testnet.g.alchemy.com/v2/Your_Key