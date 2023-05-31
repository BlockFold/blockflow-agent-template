import { Agent } from "@blockfold/blockflow-agent";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { BlockflowHRE } from "blockflow-hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { BlockFlowERC20 } from "../typechain";
import { getERC20Reference } from "./helpers/getERC20Reference";
import { grantRole } from "./helpers/grantRole";
import { mintTokens } from "./helpers/mintTokens";
import {
  AgentStateResult,
  startAgentFixture,
} from "./helpers/startAgentFixture";

let bfHRE: BlockflowHRE;
let agent: Agent;

let erc20: BlockFlowERC20;
let ONE: BigNumber;

describe("actionBurn", function () {
  beforeEach(async function () {
    // Load the fixture and get a reference to our agent and
    // Blockflow Hardhat Runtime Environment (bfHRE)
    ({ bfHRE, agent } = await loadFixture<AgentStateResult>(startAgentFixture));

    // Get a reference to our ERC20 contract and decimal multiplier
    // decimals = 6; ONE = 10^6 = 1_000_000
    ({ ONE, erc20 } = await getERC20Reference(agent));
    return;
  });

  it("Should be able to burn tokens", async function () {
    // Must mint some tokens first
    const mintAmountHuman = 123;
    const mintAmountEther = ONE.mul(mintAmountHuman);

    const agentTxSignerId = "fiona";
    const recipientSignerId = "alex";
    const recipientAddress = await bfHRE
      .blockflowSignerGet(recipientSignerId)
      .then((v) => v.getAddress());

    let response = await mintTokens(
      agent,
      bfHRE,
      agentTxSignerId,
      mintAmountHuman,
      recipientSignerId
    );

    expect(response.success, "Mint to alex Success").to.be.true;

    const agentName = agent.deployment.name;

    // Confirming that Alex now has a balance of 123 tokens.
    const recipientRawBalance = await erc20.balanceOf(recipientAddress);
    expect(recipientRawBalance.eq(mintAmountEther)).to.be.true;

    // Now grant the Burner role.
    await grantRole(
      agent,
      bfHRE,
      agentTxSignerId,
      recipientSignerId,
      "BURNER_ROLE"
    );

    // Now burn the tokens.
    const agentAction = "Burn";
    const agentCallData = {
      amount: mintAmountHuman,
    };

    response = await bfHRE.blockflowAgentCall(
      agentName,
      agentAction,
      recipientSignerId,
      agentCallData
    );

    // Confirm that the tokens were burned.
    expect(response.success, "Burn NFT response successful").to.be.true;
    expect(recipientRawBalance.eq(BigNumber.from(0)));

    // False positive check
    // throw new Error("Not a false positive test");
  });
});
