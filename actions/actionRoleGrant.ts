import { ActionConfig, ActionField, Agent } from "@blockfold/blockflow-agent";
import { BlockFlowERC20 } from "../typechain";
import { Roles } from "./types/roles";

const revokeFromParam: ActionField = {
  id: "to",
  name: "Grant address",
  description: `Select the address of the account or smart-contract to grant
		the role to.`,
  type: "Address",
};

const amountParam: ActionField = {
  id: "role",
  name: "Role to grant",
  description: `Please select the role you would like to grant`,
  type: "RoleList",
  properties: {
    PAUSER_ROLE:
      "Enable Pausing and Unpausing of the contract (emergency response).",
    MINTER_ROLE: "Enable Minting (creating) of new tokens.",
    BURNER_ROLE: "Enable Burning (destruction) of tokens from an account.",
    DEFAULT_ADMIN_ROLE: "Enable Grant / Revoke roles (superuser).",
  },
};

export function bindActionRoleGrant(agent: Agent, erc20: BlockFlowERC20) {
  console.log(`bindActionTransfer: agent`, agent.agentCode);
  const config: ActionConfig = {
    name: "Grant role",
    description: `Grant a role to a specific address (increase permissions)`,
    icon: "fa-solid fa-shield-check",
    actionGroup: "Access control",
    fields: [revokeFromParam, amountParam],
    signerRequired: true,
  };

  agent.addAction(config, async (msg, signer) => {
    var to = msg.data.to;

    if (!Object.prototype.hasOwnProperty.call(erc20, msg.data.role)) {
      throw new Error(`Role ${msg.data.role} does not exist on contract`);
    }

    const role: Roles = msg.data.role;
    const roleKeccak = await erc20[role]();

    const receipt = await agent.confirmTx(
      erc20.connect(signer!).grantRole(roleKeccak, to),
    );

    return { success: true };
  });
}
