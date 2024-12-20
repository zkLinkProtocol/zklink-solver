# zkLink-solver evm contracts

## ZKLinkAcross Contract Overview

The `ZKLinkAcross` contract is a core component of the zkLink-solver system, designed to facilitate cross-chain token transfers using the ERC7683 standard. It leverages the UUPS (Universal Upgradeable Proxy Standard) pattern for upgradeability and integrates with OpenZeppelin's Access Control and Reentrancy Guard for enhanced security and role management.

### Key Features:
- **Cross-Chain Transfers**: Supports opening and filling cross-chain orders, allowing users to transfer tokens between different blockchain networks.
- **Permit2 Integration**: Utilizes the Permit2 standard for gasless transactions, enabling users to authorize token transfers without needing to send a separate approval transaction.
- **Role-Based Access Control**: Implements a robust access control mechanism, allowing only authorized roles to perform critical operations like setting destination settlers and enabling deposit routes.
- **Security Measures**: Includes reentrancy protection and various checks to ensure the integrity and security of cross-chain operations.

### Usage:
The contract provides functions to open orders on behalf of users (`openFor`) or directly by users (`open`), resolve orders, and fill orders on the destination chain. It also supports administrative functions to manage deposit routes and destination settlers.

For more detailed information on how to interact with the `ZKLinkAcross` contract, refer to the contract's source code and the provided command-line scripts in the `scripts` directory.

## Deploy
1. clone repo
```sh
git clone https://github.com/zkLinkProtocol/across.git
```

2. installation of dependencies
```sh
cd across/contracts/evm

yarn
```

3. network config
```sh
cp etc/EXAMPLE.json etc/networkName.json
```

4. compile
```sh
npx hardhat compile
```

5. constructor parameters
```sh
cp ignition/parameters/EXAMPLE.json ignition/parameters/networkName.json
```

6. deploy
```shell
NET=bnb-testnet npx hardhat --network bnb-testnet ignition deploy ./ignition/modules/ZKLinkAcross.ts --parameters ignition/parameters/bnb-testnet.json --verify
```

## Deployed contracts

### ZKLinkAcross

| Chain        | Chain Id | Address                                                      |
| ------------ | -------- | ------------------------------------------------------------ |
| BSC Mainnet  | 56       | [0x94F2EbE929FE948f960908ec57e5D7792fAcAc07](https://bscscan.com/address/0x94F2EbE929FE948f960908ec57e5D7792fAcAc07) |
| Base Mainnet | 8453     | [0x7Ae0563553008a45d91555f66B2Ab34800A74040](https://basescan.org/address/0x7Ae0563553008a45d91555f66B2Ab34800A74040) |
| BSC Test     | 97       | [0x7393Ad72e87A0Ec51Bc9fCB783DBc8F24FE63847](https://testnet.bscscan.com/address/0x7393Ad72e87A0Ec51Bc9fCB783DBc8F24FE63847) |
| Base Sepolia | 84532    | [0xd1Cd760135F6f58b6466B95651a97eFcF52Ab2C3](https://sepolia.basescan.org/address/0xd1Cd760135F6f58b6466B95651a97eFcF52Ab2C3) |

### ERC20 Token

| Chain        | Symbol | Address                                                      |
| ------------ | ------ | ------------------------------------------------------------ |
| BSC Test     | ZKL    | [0xb94474abf18b215281969b8300d3066497f5024d](https://testnet.bscscan.com/address/0xb94474abf18b215281969b8300d3066497f5024d) |
| Base Sepolia | ZKL    | [0x66f4166e79cf480512f8b2178a287d7db0a71efd](https://sepolia.basescan.org/address/0x66f4166e79cf480512f8b2178a287d7db0a71efd) |

## Usage

### Opening an Order

The `open.ts` script allows you to create a new order in the ZKLinkAcross system. Here's how to use it:

#### Command
```sh
ts-node scripts/open.ts [options]
```

#### Required Options
- `--rpc-url`: The RPC URL of the source chain
- `--private-key`: Your wallet's private key
- `--across`: The ZKLinkAcross contract address
- `--destination-chain-id`: Target chain ID for the cross-chain transfer
- `--recipient`: Recipient address on the destination chain
- `--input-token`: Token address to send
- `--output-token`: Token address to receive
- `--input-amount`: Amount to send
- `--output-amount`: Amount to receive

#### Optional Options
- `--gas-price`: Gas price in gwei (default: current network gas price)
- `--fill-expire`: Order expiration time in seconds (default: 86400 - 24 hours)
- `--input-token-decimals`: Decimals of the input token (default: 18)
- `--output-token-decimals`: Decimals of the output token (default: 18)

#### Example
```sh
ts-node scripts/open.ts \
  --rpc-url "https://data-seed-prebsc-1-s1.binance.org:8545" \
  --private-key "your-private-key" \
  --across "0x7393Ad72e87A0Ec51Bc9fCB783DBc8F24FE63847" \
  --destination-chain-id 84532 \
  --recipient "0xYourRecipientAddress" \
  --input-token "0xb94474abf18b215281969b8300d3066497f5024d" \
  --output-token "0x66f4166e79cf480512f8b2178a287d7db0a71efd" \
  --input-amount "1.0" \
  --output-amount "1.0"
```

This example creates an order to transfer 1.0 ZKL token from BSC Test network to Base Sepolia network.

#### Notes
- Make sure you have sufficient token balance and native tokens for gas
- The recipient address will receive the tokens on the destination chain
- All amounts should be specified in decimal format (e.g., "1.0" for 1 token)
- The private key should be kept secret and never committed to version control
- **Important**: Before opening an order, you must first approve the ZKLinkAcross contract to spend your tokens. Use the token's `approve()` function to grant sufficient allowance to the ZKLinkAcross contract address.
