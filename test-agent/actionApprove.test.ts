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

describe("actionApprove", function () {
  beforeEach(async function () {
    // Load the fixture and get a reference to our agent and
    // Blockflow Hardhat Runtime Environment (bfHRE)
    ({ bfHRE, agent } = await loadFixture<AgentStateResult>(startAgentFixture));

    // Get a reference to our ERC20 contract and decimal multiplier
    // decimals = 6; ONE = 10^6 = 1_000_000
    ({ ONE, erc20 } = await getERC20Reference(agent));
    return;
  });

  it("Should be able to 'Approve' a non-owner EOA", async function () {
    // Must mint some tokens first
    const mintAmountHuman = 123;
    const mintAmountEther = ONE.mul(mintAmountHuman);

    const agentSignerId = "fiona";
    const recipientId = "alex";
    const alexAddress = await bfHRE
      .blockflowSignerGet(recipientId)
      .then((v) => v.getAddress());

    let response = await mintTokens(
      agent,
      bfHRE,
      agentSignerId,
      mintAmountHuman,
      recipientId
    );

    expect(response.success, "Mint to alex Success").to.be.true;

    // Confirming that Alex now has a balance of 123 tokens.
    const alexRawBalance = await erc20.balanceOf(alexAddress);
    expect(alexRawBalance.eq(mintAmountEther)).to.be.true;

    // Now approve a non-owner EOA to spend Alex's tokens.
    const agentName = agent.deployment.name;
    const agentAction = "Approve";
    const spenderAddress = await bfHRE
      .blockflowSignerGet("ivan")
      .then((v) => v.getAddress());
    const spenderAllowanceAmountHuman = 100;
    const spenderAllowanceAmountEther = ONE.mul(spenderAllowanceAmountHuman);

    const agentCallData: any = {
      spender: spenderAddress,
      amount: spenderAllowanceAmountHuman,
    };

    response = await bfHRE.blockflowAgentCall(
      agentName,
      agentAction,
      recipientId, // Alex is the owner and must sign this transaction
      agentCallData
    );

    // Confirm that the spender was approved for the correct amount.
    expect(response.success, "Approve response successful").to.be.true;

    const spenderAllowance = await erc20.allowance(alexAddress, spenderAddress);
    expect(spenderAllowance.eq(spenderAllowanceAmountEther)).to.be.true;

    // False positive check
    // throw new Error("Not implemented");
  });
});
