import { BlockFlowERC20 } from "../typechain";
import { Agent, ActionField, ActionConfig } from "@blockfold/blockflow-agent";
import { BigNumber } from "@ethersproject/bignumber";

const amountParam: ActionField = {
	id: "amount",
	name: "Transfer amount",
	description: `Please enter the number of tokens to transfer from 
        your account. This number should should not be adjusted for 
        the precision of the token (e.g. decimals: 6 or 18), as this 
        will be managed for you.`,
	type: "Number",
};
const fromParam: ActionField = {
	id: "from",
	name: "From account",
	description: `Select the account which you would like to withdraw
		the funds from.  The signer executing this transaction must have
		been pre-approved for at-least this amount`,
	type: "Address",
};
const toParam: ActionField = {
	id: "to",
	name: "To account",
	description: `Select the account which you would like to credit with 
        the transfer amount. This may either be an existing signer, an
        address of an Externally Owned Account (EOA), or even a smart-contract.`,
	type: "Address",
};

export function bindActionTransferFrom(agent: Agent, erc20: BlockFlowERC20, ONE: BigNumber) {
	console.log(`bindActionTransferFrom: agent`, agent.agentCode);
	const config: ActionConfig = {
		name: "Transfer from account",
		description: `Transfer funds from a pre-approved account to another account`,
		icon: "fa-solid fa-message-dollar",
		actionGroup: "Transfers",
		fields: [fromParam, amountParam, toParam],
		signerRequired: true,
	};

	agent.addAction(config, async (msg, signer) => {
		var to = msg.data.to as string;
		var from = msg.data.from as string;
		var amount = BigNumber.from(parseFloat(msg.data.amount) * ONE.toNumber());
		const receipt = await agent.confirmTx(erc20.connect(signer!).transferFrom(from, to, amount));
		return { success: true };
	});
}
