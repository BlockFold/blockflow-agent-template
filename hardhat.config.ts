import "@nomicfoundation/hardhat-chai-matchers";
import "@openzeppelin/hardhat-upgrades";
import "@typechain/hardhat";
import { HardhatUserConfig } from "hardhat/config";

// This enriches the `hre` environment so we can interact with agents
import 'blockflow-hardhat';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.16',
    settings: {
      optimizer: {
        enabled: true,
        runs: 500,
      },
    },
  },
  defaultNetwork: 'localhost',
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545/',
    },
  },

  typechain: {
    outDir: 'typechain',
  },
};

export default config;
