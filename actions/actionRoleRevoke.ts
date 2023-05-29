import { BlockFlowERC20 } from "../typechain";
import { Agent, ActionField, ActionConfig } from "@blockfold/blockflow-agent";
import { BigNumber } from "@ethersproject/bignumber";

const grantToParam: ActionField = {
	id: "from",
	name: "Revoke address",
	description: `Select the address of the account or smart-contract to revoke
		the role from.`,
	type: "Address",
};

const amountParam: ActionField = {
	id: "role",
	name: "Role to revoke",
	description: `Please select the role you would like to revoke`,
	type: "RoleList",
	properties: {
		PAUSER_ROLE: "Enable Pausing and Unpausing of the contract (emergency response).",
		MINTER_ROLE: "Enable Minting (creating) of new tokens.",
		BURNER_ROLE: "Enable Burning (destruction) of tokens from an account.",
		DEFAULT_ADMIN_ROLE: "Enable Grant / Revoke roles (superuser).",
	},
};

export function bindActionRoleRevoke(agent: Agent, erc20: BlockFlowERC20) {
	console.log(`bindActionTransfer: agent`, agent.agentCode);
	const config: ActionConfig = {
		name: "Revoke role",
		description: `Revoke a role from a specific address (reduce permissions)`,
		icon: "fa-solid fa-shield-xmark",
		actionGroup: "Access control",
		fields: [grantToParam, amountParam],
		signerRequired: true,
	};

	agent.addAction(config, async (msg, signer) => {
		var to = msg.data.from;
		var roleKeccak = agent.getKeccak256(msg.data.role);
		const receipt = await agent.confirmTx(erc20.connect(signer!).revokeRole(roleKeccak, to));
		return { success: true };
	});
}
