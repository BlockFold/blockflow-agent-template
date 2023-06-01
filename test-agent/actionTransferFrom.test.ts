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

describe("actionTransferFrom", function () {
  beforeEach(async function () {
    // Load the fixture and get a reference to our agent and
    // Blockflow Hardhat Runtime Environment (bfHRE)
    ({ bfHRE, agent } = await loadFixture<AgentStateResult>(startAgentFixture));

    // Get a reference to our ERC20 contract and decimal multiplier
    // decimals = 6; ONE = 10^6 = 1_000_000
    ({ ONE, erc20 } = await getERC20Reference(agent));
    return;
  });

  it("Should be able to transferFrom one user to another", async function () {
    // Mint some tokens to transfer
    const mintAmountHuman = 100;
    const mintAmountEther = ONE.mul(mintAmountHuman);

    const fionaAgentSignerId = "fiona";
    const ownerOliverId = "oliver";
    const spenderSamId = "sam";

    const ownerOliverAddress = await bfHRE
      .blockflowSignerGet(ownerOliverId)
      .then((v) => v.getAddress());
    const samSpenderAddress = await bfHRE
      .blockflowSignerGet(spenderSamId)
      .then((v) => v.getAddress());

    let response = await mintTokens(
      agent,
      bfHRE,
      fionaAgentSignerId,
      mintAmountHuman,
      ownerOliverId
    );

    expect(response.success, "Mint to Oliver Success").to.be.true;

    // Confirming that Oliver now has a balance of 123 tokens.
    let ownerOliverRawBalance = await erc20.balanceOf(ownerOliverAddress);
    expect(ownerOliverRawBalance).to.equal(mintAmountEther);

    // Now approve a non-owner EOA to spend Oliver's tokens.
    const agentName = agent.deployment.name;
    const agentAction = "Approve";

    const spenderAllowanceHuman = 80;
    const spenderAllowanceEther = ONE.mul(spenderAllowanceHuman);
    const agentCallData: any = {
      spender: samSpenderAddress,
      amount: spenderAllowanceHuman,
    };

    response = await bfHRE.blockflowAgentCall(
      agentName,
      agentAction,
      ownerOliverId, // The owner must sign this transaction
      agentCallData
    );

    // Confirm that the spender was approved for the correct amount.
    expect(response.success, "Approve response successful").to.be.true;
    const spenderAllowance = await erc20.allowance(
      ownerOliverAddress,
      samSpenderAddress
    );
    expect(spenderAllowance).to.equal(spenderAllowanceEther);

    let agentActionTransferFrom = "Transfer from account";
    let agentCallDataForTransferFrom = {
      amount: spenderAllowanceHuman,
      to: samSpenderAddress,
      from: ownerOliverAddress,
    };

    response = await bfHRE.blockflowAgentCall(
      agentName,
      agentActionTransferFrom,
      spenderSamId,
      agentCallDataForTransferFrom
    );

    // Confirm that the tokens were transfered.
    expect(response.success, "TransferFrom ERC20 response successful").to.be
      .true;
    ownerOliverRawBalance = await erc20.balanceOf(ownerOliverAddress);
    expect(ownerOliverRawBalance).to.equal(
      mintAmountEther.sub(spenderAllowanceEther)
    );
    const spenderSamRawBalance = await erc20.balanceOf(samSpenderAddress);
    expect(spenderSamRawBalance).to.equal(spenderAllowanceEther);

    // False positive check
    // throw new Error("Not implemented");
  });
});
