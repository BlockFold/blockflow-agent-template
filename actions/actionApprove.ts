import { BlockFlowERC20 } from "../typechain";
import { Agent, ActionField, ActionConfig } from "@blockfold/blockflow-agent";
import { BigNumber } from "@ethersproject/bignumber";

const amountParam: ActionField = {
	id: "amount",
	name: "Transfer amount",
	description: `Please enter the number of tokens to approve for transfer from 
        your account. This number should should not be adjusted for 
        the precision of the token (e.g. decimals: 6 or 18), as this 
        will be managed for you.`,
	type: "Number",
};
const spenderParam: ActionField = {
	id: "spender",
	name: "Spender account",
	description: `Select the address of the account or smart-contract to allow it
		to withdraw funds from the signer's account`,
	type: "Address",
};

export function bindActionApprove(agent: Agent, erc20: BlockFlowERC20, ONE: BigNumber) {
	console.log(`bindActionTransfer: agent`, agent.agentCode);
	const config: ActionConfig = {
		name: "Approve",
		description: `Pre-approve an account to withdraw funds`,
		icon: "fa-solid fa-shield-check",
		actionGroup: "Transfers",
		fields: [spenderParam, amountParam],
		outputFields: ["txHash", "amountRaw"],
		signerRequired: true,
	};

	agent.addAction(config, async (msg, signer) => {
		var spender = msg.data.spender;
		var amount = BigNumber.from(parseFloat(msg.data.amount) * ONE.toNumber());
		var receipt = await agent.confirmTx(erc20.connect(signer!).approve(spender, amount));
		return {
			txHash: receipt.transactionHash,
			amountRaw: amount,
		};
	});
}
