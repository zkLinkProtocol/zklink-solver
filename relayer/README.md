<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Requirements

Ensure the <u>_data_</u> directory is writable
The application requires the <u>_data_</u> directory to have proper write permissions for saving necessary files.

Ensure the <u>_data_</u> directory exists and is set as writable.

To Set Write Permissions:
On Unix-based systems, you can use the following commands:

```bash
mkdir -p data           # Create the data directory if it doesn't exist
chmod 775 data          # Grant read, write, and execute permissions
chown -R $USER:$USER data  # Set the directory owner to the current user
```

## Environment Configuration

This application uses several environment variables to configure the supported chains, RPC endpoints, contract addresses, and more. Below are the available configuration options:

Configuration File: _.env_

```env
# Supported Chains
SUPPORT_CHAINIDS=97, 84532

# RPC URLs for the chains
CHANIDS_RPC=https://bsc-testnet-rpc.publicnode.com, https://sepolia.base.org

# Contract Addresses deployed on the respective chains
CONTRACT_ADDRESS=0x7393Ad72e87A0Ec51Bc9fCB783DBc8F24FE63847, 0xd1Cd760135F6f58b6466B95651a97eFcF52Ab2C3

# Starting block numbers for each chain
STRART_BLOCK_NUMBER=45940422, 18388180

# Number of block confirmations for each chain
CONFIRM_BLOCKs=80, 120

# Filler private key for the operations
FILLER_PK=your_private_key_here

```

### Explanation of the Configurations:

#### SUPPORT_CHAINIDS

A comma-separated list of supported chain IDs that the application will interact with.

#### CHANIDS_RPC

A comma-separated list of RPC URLs for the chains. These URLs are used for querying the chain's state.

#### CONTRACT_ADDRESS

A comma-separated list of across contract addresses deployed on the supported chains. The application interacts with these contracts for cross-chain operations.

#### STRART_BLOCK_NUMBER

A comma-separated list of starting block numbers for each chain. These are the blocks from which the application will start monitoring.

#### CONFIRM_BLOCKs

A comma-separated list of the number of block confirmations required before considering a transaction as confirmed on each chain.

#### FILLER_PK

The private key of the filler wallet used for transactions. Important: Keep this key secure and do not expose it in public repositories.

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
