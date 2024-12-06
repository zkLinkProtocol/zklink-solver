# zkLink-solver

zkLink-solver is a comprehensive cross-chain bridging solution that enables secure and efficient token transfers between different blockchain networks. Built on the ERC7683 standard, it consists of smart contracts and a relayer network working together to facilitate seamless cross-chain transactions.

## Contracts

The core contract for cross-chain token transfers using the ERC7683 standard:

- Cross-chain token transfers with order opening/filling
- Permit2 integration for gasless transactions
- Role-based access control
- Security measures with reentrancy protection


## Relayer
The relayer node responsible for:

- Message relaying between different blockchain networks
- Cross-chain transaction processing
- Block production and validation
- State synchronization


## Getting Started

For detailed setup and deployment instructions, please refer to:
- [Contracts Documentation](./contracts/README.md)
- [Relayer Documentation](./relayer/README.md)