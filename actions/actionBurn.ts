import { BlockFlowERC20 } from "../typechain";
import { Agent, ActionField, ActionConfig } from "@blockfold/blockflow-agent";
import { BigNumber } from "@ethersproject/bignumber";

const amountParam: ActionField = {
	id: "amount",
	name: "Burn amount",
	description: `Please enter the number of new tokens to burn. This number 
		should not be adjusted for the precision of the token (e.g.
		decimals: 6 or 18), as this will be managed for you.`,
	type: "Number",
};

export function bindActionBurn(agent: Agent, erc20: BlockFlowERC20, ONE: BigNumber) {
	console.log(`bindActionBurn: agent`, agent.agentCode, ONE);
	const config: ActionConfig = {
		name: "Burn",
		description: `Burn (destroy) tokens from your account`,
		icon: "fa-solid fa-burn",
		actionGroup: "Supply control",
		fields: [amountParam],
		signerRequired: true,
	};

	agent.addAction(config, async (msg, signer) => {
		var amount = BigNumber.from(parseFloat(msg.data.amount) * ONE.toNumber());
		const receipt = await agent.confirmTx(erc20.connect(signer!).burn(amount));
		return { success: true };
	});
}
