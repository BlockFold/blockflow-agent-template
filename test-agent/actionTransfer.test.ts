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

describe("actionTransfer", function () {
  beforeEach(async function () {
    // Load the fixture and get a reference to our agent and
    // Blockflow Hardhat Runtime Environment (bfHRE)
    ({ bfHRE, agent } = await loadFixture<AgentStateResult>(startAgentFixture));

    // Get a reference to our ERC20 contract and decimal multiplier
    // decimals = 6; ONE = 10^6 = 1_000_000
    ({ ONE, erc20 } = await getERC20Reference(agent));
    return;
  });

  it("Should be able to transfer tokens", async function () {
    // Mint some tokens to transfer
    const mintAmountHuman = 123;
    const mintAmountEther = ONE.mul(mintAmountHuman);

    const fionaAgentSignerId = "fiona";
    const alexRecipientId = "alex";

    const fionaAddress = await bfHRE
      .blockflowSignerGet(fionaAgentSignerId)
      .then((v) => v.getAddress());
    const alexAddress = await bfHRE
      .blockflowSignerGet(alexRecipientId)
      .then((v) => v.getAddress());

    let response = await mintTokens(
      agent,
      bfHRE,
      fionaAgentSignerId,
      mintAmountHuman,
      alexRecipientId
    );

    expect(response.success, "Mint to Alex Success").to.be.true;

    // Confirming that Alex now has a balance of 123 tokens.
    const alexRawBalance = await erc20.balanceOf(alexAddress);
    expect(alexRawBalance.eq(mintAmountEther)).to.be.true;

    // transfer the tokens
    const agentName = agent.deployment.name;
    let agentAction = "Transfer";
    let agentCallData = {
      amount: mintAmountHuman,
      to: fionaAddress,
    };

    response = await bfHRE.blockflowAgentCall(
      agentName,
      agentAction,
      alexRecipientId,
      agentCallData
    );

    // Confirm that the tokens were transfered.
    expect(response.success, "Transfer ERC20 response successful").to.be.true;
    expect(alexRawBalance.eq(BigNumber.from(0)));

    const fionaRawBalance = await erc20.balanceOf(fionaAddress);
    console.log(`fionaRawBalance`, fionaRawBalance.toString());
    expect(fionaRawBalance.eq(mintAmountEther)).to.be.true;

    // False positive check
    // throw new Error("Not implemented");
  });
});
