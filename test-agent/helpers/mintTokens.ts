import { Agent } from "@blockfold/blockflow-agent";
import { BlockflowHRE } from "blockflow-hardhat";

export async function mintTokens(
  agent: Agent,
  bfHRE: BlockflowHRE,
  signerId: string,
  amount: number,
  recipientId: string
) {
  const agentAction = "Mint";
  const agentName = agent.deployment.name;
  const agentTxSignerId = signerId;
  const recipientAddress = await bfHRE
    .blockflowSignerGet(recipientId)
    .then((v) => v.getAddress());
  const agentCallData = {
    to: recipientAddress,
    amount: amount,
  };

  const response = await bfHRE.blockflowAgentCall(
    agentName,
    agentAction,
    agentTxSignerId,
    agentCallData
  );

  if (!response.success) {
    throw new Error(
      `Mint ${amount} tokens using signer ${signerId} to recipient ${recipientId} failed`
    );
  }

  return response;
}
