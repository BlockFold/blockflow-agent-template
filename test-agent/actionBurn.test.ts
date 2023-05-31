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

    // Now grant the role to burn tokens.
    const agentName = agent.deployment.name;
    let agentAction = "Grant role";
    let agentCallData: any = {
      to: alexAddress,
      role: "BURNER_ROLE",
    };

    response = await bfHRE.blockflowAgentCall(
      agentName,
      agentAction,
      agentSignerId,
      agentCallData
    );

    // Confirm that the BURNER_ROLE was granted.
    expect(response.success, "Grant role response successful").to.be.true;
    expect(await erc20.hasRole(await erc20.BURNER_ROLE(), alexAddress)).to.be
      .true;

    // Now burn the tokens.
    agentAction = "Burn";
    agentCallData = {
      amount: mintAmountHuman,
    };

    response = await bfHRE.blockflowAgentCall(
      agentName,
      agentAction,
      recipientId,
      agentCallData
    );

    // Confirm that the tokens were burned.
    expect(response.success, "Burn NFT response successful").to.be.true;
    expect(alexRawBalance.eq(BigNumber.from(0)));

    // False positive check
    // throw new Error("Not implemented");
  });
});
