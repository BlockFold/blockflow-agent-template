import { BlockFlowERC20 } from "../typechain";
import { Agent, ActionField, ActionConfig } from "@blockfold/blockflow-agent";
import { BigNumber } from "@ethersproject/bignumber";

const amountParam: ActionField = {
  id: "amount",
  name: "Mint amount",
  description: `Please enter the number of new tokens to mint. This number 
		should not be adjusted for the precision of the token (e.g.
		decimals: 6 or 18), as this will be managed for you.`,
  type: "Number",
};
const toParam: ActionField = {
  id: "to",
  name: "To account",
  description: `Select the account which you would like to credit with the newly 
		minted tokens. This may either be an existing signer, an address of an Externally
	 	Owned Account (EOA), or even a smart-contract.`,
  type: "Address",
};

export function bindActionMint(agent: Agent, erc20: BlockFlowERC20, ONE: BigNumber) {
  console.log(`bindActionMint: agent`, agent.agentCode, ONE);
  const config: ActionConfig = {
    name: "Mint",
    description: `Mint new tokens and transfer them to a chosen account`,
    icon: "fa-solid fa-print",
    actionGroup: "Supply control",
    fields: [toParam, amountParam],
    outputFields: ["txHash", "amountRaw"],
    signerRequired: true,
  };

  agent.addAction(config, async (msg, signer) => {
    var to = msg.data.to;
    var amount = BigNumber.from(parseFloat(msg.data.amount) * ONE.toNumber());
    const receipt = await agent.confirmTx(erc20.connect(signer!).mint(to, amount));
    return {
      txHash: receipt.transactionHash,
      amountRaw: amount,
      success: true,
    };
  });
}
