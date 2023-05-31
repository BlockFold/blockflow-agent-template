import { Agent } from "@blockfold/blockflow-agent";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { BlockflowHRE } from "blockflow-hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { BlockFlowERC20 } from "../typechain";
import { getERC20Reference } from "./helpers/getERC20Reference";
import { mintTokens } from "./helpers/mintTokens";
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

  it("Should be able to mint tokens", async function () {
    const mintAmountHuman = 123;
    const mintAmountEther = ONE.mul(mintAmountHuman);

    const recipientId = "alex";
    const alexAddress = await bfHRE
      .blockflowSignerGet(recipientId)
      .then((v) => v.getAddress());

    const agentTxSignerId = "fiona";

    /*
    const agentAction = "Mint";
    const agentName = agent.deployment.name;
    const agentCallData = {
      to: alexAddress,
      amount: mintAmountHuman,
    };

    const response = await bfHRE.blockflowAgentCall(
      agentName,
      agentAction,
      agentTxSignerId,
      agentCallData
    );
    */

    // mintTokens function does the same as the commented out code above
    const response = await mintTokens(
      agent,
      bfHRE,
      agentTxSignerId,
      mintAmountHuman,
      recipientId
    );

    // console.log("callResponse", response);
    expect(response.success, "Mint to alex Success").to.be.true;

    const alexRawBalance = await erc20.balanceOf(alexAddress);
    // console.log("Alex Raw alexRawBalance", alexRawBalance);

    expect(alexRawBalance).to.equal(mintAmountEther);

    // False positive check
    // throw new Error("Not a false positive test");
  });
});
