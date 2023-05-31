import { Agent } from "@blockfold/blockflow-agent";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { BlockflowHRE } from "blockflow-hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { BlockFlowERC20 } from "../typechain";
import { getERC20Reference } from "./helpers/getERC20Reference";
import {
  AgentStateResult,
  startAgentFixture,
} from "./helpers/startAgentFixture";

let bfHRE: BlockflowHRE;
let agent: Agent;

let erc20: BlockFlowERC20;
let ONE: BigNumber;

describe("actionMint", function () {
  beforeEach(async function () {
    // Load the fixture and get a reference to our agent and
    // Blockflow Hardhat Runtime Environment (bfHRE)
    ({ bfHRE, agent } = await loadFixture<AgentStateResult>(startAgentFixture));

    // Get a reference to our ERC20 contract and decimal multiplier
    // decimals = 6; ONE = 10^6 = 1_000_000
    ({ ONE, erc20 } = await getERC20Reference(agent));
    return;
  });

  it.only("Fiona mints 123 to alex", async function () {
    const mintAmountHuman = 123;
    const mintAmountEther = ONE.mul(mintAmountHuman);

    const alex = await bfHRE.blockflowSignerGet("alex");
    const alexAddress = await alex.getAddress();
    const response = await bfHRE.blockflowAgentCall(
      agent.deployment.name,
      "Mint",
      "fiona",
      {
        to: alexAddress,
        amount: mintAmountHuman,
      }
    );
    console.log("callResponse", response);
    expect(response.success, "Mint to alex Success").to.be.true;

    let alexRawBalance = await erc20.balanceOf(alexAddress);
    console.log("Alex Raw alexRawBalance", alexRawBalance);

    expect(alexRawBalance.eq(mintAmountEther));
  });
});
