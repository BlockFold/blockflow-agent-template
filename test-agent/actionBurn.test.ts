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

  it.only("Fiona burns 123", async function () {
    const { bfHRE, agent } = (await loadFixture(
      startAgentFixture
    )) as AgentStateResult;

    // Get a reference to our ERC20 contract
    const contractAddress = await agent.getState("contractAddress");
    const erc20 = (await agent.getContract(
      contractAddress,
      "BlockFlowERC20"
    )) as BlockFlowERC20;
    const decimals = await erc20.decimals();
    const ONE = BigNumber.from(10).pow(decimals);

    const mintAmountHuman = 123;
    const mintAmountEther = ONE.mul(mintAmountHuman);

    const alex = await bfHRE.blockflowSignerGet("alex");
    const alexAddress = await alex.getAddress();
    let response = await bfHRE.blockflowAgentCall(
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

    const agentAction = "Grant role";
    response = await bfHRE.blockflowAgentCall(
      agent.deployment.name,
      agentAction,
      "fiona",
      {
        to: alexAddress,
        role: "BURNER_ROLE",
      }
    );

    expect(response.success, "Grant role response successful").to.be.true;
    expect(await erc20.hasRole(await erc20.BURNER_ROLE(), alexAddress)).to.be
      .true;

    response = await bfHRE.blockflowAgentCall(
      agent.deployment.name,
      "Burn",
      "alex",
      {
        amount: mintAmountHuman,
      }
    );

    expect(response.success, "Burn NFT response successful").to.be.true;
    expect(alexRawBalance.eq(BigNumber.from(0)));

    ethers.BigNumber.from(0);

    // throw new Error("Not implemented");
  });
});
