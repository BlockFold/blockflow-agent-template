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
const toParam: ActionField = {
	id: "to",
	name: "To account",
	description: `Select the account which you would like to credit with 
        the transfer amount. This may either be an existing signer, an
        address of an Externally Owned Account (EOA), or even a smart-contract.`,
	type: "Address",
};

export function bindActionTransfer(agent: Agent, erc20: BlockFlowERC20, ONE: BigNumber) {
	console.log(`bindActionTransfer: agent`, agent.agentCode);
	const config: ActionConfig = {
		name: "Transfer",
		description: `Transfer tokens from the senders address to another`,
		icon: "fa-solid fa-message-dollar",
		actionGroup: "Transfers",
		fields: [toParam, amountParam],
		signerRequired: true,
	};

	agent.addAction(config, async (msg, signer) => {
		var to = msg.data.to;
		var amount = BigNumber.from(parseFloat(msg.data.amount) * ONE.toNumber());
		const receipt = await agent.confirmTx(erc20.connect(signer!).transfer(to, amount));
		return { success: true };
	});
}
