import { Agent } from "@blockfold/blockflow-agent";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { BlockflowHRE } from "blockflow-hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { BlockFlowERC20 } from "../typechain";
import { getERC20Reference } from "./helpers/getERC20Reference";
import { grantRole } from "./helpers/grantRole";
import { revokeRole } from "./helpers/revokeRole";
import {
  AgentStateResult,
  startAgentFixture,
} from "./helpers/startAgentFixture";

let bfHRE: BlockflowHRE;
let agent: Agent;

let erc20: BlockFlowERC20;
let ONE: BigNumber;

const agentTxSignerId = "fiona";
const roleRecipientSignerId = "alex";
let roleRecipientAddress: string;

describe("actionRoleRevoke", function () {
  beforeEach(async function () {
    // Load the fixture and get a reference to our agent and
    // Blockflow Hardhat Runtime Environment (bfHRE)
    ({ bfHRE, agent } = await loadFixture<AgentStateResult>(startAgentFixture));

    // Get a reference to our ERC20 contract and decimal multiplier
    // decimals = 6; ONE = 10^6 = 1_000_000
    ({ ONE, erc20 } = await getERC20Reference(agent));

    roleRecipientAddress = await bfHRE
      .blockflowSignerGet(roleRecipientSignerId)
      .then((v) => v.getAddress());

    return;
  });

  it("Should be able to revoke the BURNER_ROLE", async function () {
    const role = "BURNER_ROLE";

    // Now grant the role.
    let response = await grantRole(
      agent,
      bfHRE,
      agentTxSignerId,
      roleRecipientSignerId,
      role
    );

    // Confirm that the role was granted.
    expect(await erc20.hasRole(await erc20.BURNER_ROLE(), roleRecipientAddress))
      .to.be.true;

    response = await revokeRole(
      agent,
      bfHRE,
      agentTxSignerId,
      roleRecipientSignerId,
      role
    );

    // Confirm that the role was revoked.
    expect(await erc20.hasRole(await erc20.BURNER_ROLE(), roleRecipientAddress))
      .to.be.false;

    // False positive check
    // throw new Error("Not a false positive test");
  });

  it("Should be able to revoke the PAUSER_ROLE", async function () {
    const role = "PAUSER_ROLE";

    // Now grant the role.
    let response = await grantRole(
      agent,
      bfHRE,
      agentTxSignerId,
      roleRecipientSignerId,
      role
    );

    // Confirm that the role was granted.
    expect(response.success, "Grant role response successful").to.be.true;
    expect(await erc20.hasRole(await erc20.PAUSER_ROLE(), roleRecipientAddress))
      .to.be.true;

    response = await revokeRole(
      agent,
      bfHRE,
      agentTxSignerId,
      roleRecipientSignerId,
      role
    );

    // Confirm that the role was revoked.
    expect(await erc20.hasRole(await erc20.PAUSER_ROLE(), roleRecipientAddress))
      .to.be.false;

    // False positive check
    // throw new Error("Not a false positive test");
  });

  it("Should be able to revoke the MINTER_ROLE", async function () {
    const role = "MINTER_ROLE";

    // Now grant the role.
    let response = await grantRole(
      agent,
      bfHRE,
      agentTxSignerId,
      roleRecipientSignerId,
      role
    );

    // Confirm that the role was granted.
    expect(response.success, "Grant role response successful").to.be.true;
    expect(await erc20.hasRole(await erc20.MINTER_ROLE(), roleRecipientAddress))
      .to.be.true;

    response = await revokeRole(
      agent,
      bfHRE,
      agentTxSignerId,
      roleRecipientSignerId,
      role
    );

    // Confirm that the role was revoked.
    expect(await erc20.hasRole(await erc20.MINTER_ROLE(), roleRecipientAddress))
      .to.be.false;

    // False positive check
    // throw new Error("Not a false positive test");
  });

  it("Should be able to revoke the DEFAULT_ADMIN_ROLE", async function () {
    const role = "DEFAULT_ADMIN_ROLE";

    // Now grant the role.
    let response = await grantRole(
      agent,
      bfHRE,
      agentTxSignerId,
      roleRecipientSignerId,
      role
    );

    // Confirm that the role was granted.
    expect(response.success, "Grant role response successful").to.be.true;
    expect(
      await erc20.hasRole(
        await erc20.DEFAULT_ADMIN_ROLE(),
        roleRecipientAddress
      )
    ).to.be.true;

    response = await revokeRole(
      agent,
      bfHRE,
      agentTxSignerId,
      roleRecipientSignerId,
      role
    );

    // Confirm that the role was revoked.
    expect(
      await erc20.hasRole(
        await erc20.DEFAULT_ADMIN_ROLE(),
        roleRecipientAddress
      )
    ).to.be.false;

    // False positive check
    // throw new Error("Not a false positive test");
  });
});
