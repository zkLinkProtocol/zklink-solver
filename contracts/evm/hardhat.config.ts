import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const isTest = process.env.IS_TEST === "true" || process.env.CI === "true";
const solcVersion = "0.8.23";

// Compilation settings are overridden for large contracts to allow them to compile without going over the bytecode
// limit.
const LARGE_CONTRACT_COMPILER_SETTINGS = {
  version: solcVersion,
  settings: {
    optimizer: { enabled: true, runs: 1000 },
    viaIR: true,
    debug: { revertStrings: isTest ? "default" : "strip" },
  },
};
const DEFAULT_CONTRACT_COMPILER_SETTINGS = {
  version: solcVersion,
  settings: {
    optimizer: { enabled: true, runs: 1000000 },
    viaIR: true,
    // Only strip revert strings if not testing or in ci.
    debug: { revertStrings: isTest ? "default" : "strip" },
  },
};

const config: HardhatUserConfig = {
  solidity: {
    compilers: [DEFAULT_CONTRACT_COMPILER_SETTINGS],
    overrides: {
      "contracts/ZKLinkAcross.sol": LARGE_CONTRACT_COMPILER_SETTINGS,
    },
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    }
  }
};

// custom hardhat user config for different net
if (process.env.NET !== undefined) {
  const netName = process.env.NET;
  config.defaultNetwork = netName;

  const netConfig = require(`./etc/${netName}.json`);
  // @ts-ignore
  config.networks[netName] = netConfig.network;

  // config contract verify key if exist
  if (netConfig.etherscan !== undefined) {
    config.etherscan = netConfig.etherscan;
  }
}

export default config;
