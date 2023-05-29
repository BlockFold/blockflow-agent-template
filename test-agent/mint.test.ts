import { expect } from "chai";
import hre from "hardhat";
import { BigNumber } from "@ethersproject/bignumber";
import type { HardhatRuntimeEnvironment } from "hardhat/types";
import { Agent } from "@blockfold/blockflow-agent";
import { BlockflowHRE } from "blockflow-hardhat";
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
import { BlockFlowERC20 } from "../typechain";

type AgentStateResult = {
  bfHRE: BlockflowHRE;
  agent: Agent;
};

describe("startup.test", function () {
  async function startAgentFixture(): Promise<AgentStateResult> {
    let devSigners = await hre.ethers.getSigners();

    const bfHRE = hre as BlockflowHRE;

    // Name our signers so that we can use them in the same way that
    // Blockflow signers will come to us when deployed.
    const fiona = await bfHRE.blockflowSignerSet("fiona", devSigners[0]);
    const alex = await bfHRE.blockflowSignerSet("alex", devSigners[1]);
    const ivan = await bfHRE.blockflowSignerSet("ivan", devSigners[2]);
    const charlotte = await bfHRE.blockflowSignerSet("charlotte", devSigners[3]);

    expect(fiona, `Fiona is not null`).to.not.be.null;

    const config: any = {
      protocolName: "Test coin",
      protocolSymbol: "$TC",
    };

    // Create the agent and start it up (triggering an initial deployment)
    let agent = await bfHRE.blockflowAgentCreate("TezCoin", ".", config, {}, fiona);
    return {
      bfHRE,
      agent,
    };
  }

  it.only("Fiona mints 123 to alex", async function () {
    const { bfHRE, agent } = (await loadFixture(startAgentFixture)) as AgentStateResult;

    // Get a reference to our ERC20 contract
    const contractAddress = await agent.getState("contractAddress");
    const erc20 = (await agent.getContract(contractAddress, "BlockFlowERC20")) as BlockFlowERC20;
    const decimals = await erc20.decimals();
    const ONE = BigNumber.from(10).pow(decimals);

    const mintAmountHuman = 123;
    const mintAmountEther = ONE.mul(mintAmountHuman);

    const alex = await bfHRE.blockflowSignerGet("alex");
    const alexAddress = await alex.getAddress();
    const response = await bfHRE.blockflowAgentCall(agent.deployment.name, "Mint", "fiona", {
      to: alexAddress,
      amount: mintAmountHuman,
    });
    console.log("callResponse", response);
    expect(response.success, "Mint to alex Success").to.be.true;

    let alexRawBalance = await erc20.balanceOf(alexAddress);
    console.log("Alex Raw alexRawBalance", alexRawBalance);

    expect(alexRawBalance.eq(mintAmountEther));
  });
});
