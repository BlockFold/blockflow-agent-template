import { Agent } from "@blockfold/blockflow-agent";
import { BlockflowHRE } from "blockflow-hardhat";

export async function grantRole(
  agent: Agent,
  bfHRE: BlockflowHRE,
  agentTxSignerId: string,
  roleRecipientId: string,
  role: string
) {
  const recipientAddress = await bfHRE
    .blockflowSignerGet(roleRecipientId)
    .then((v) => v.getAddress());

  // Now grant the role.
  const agentName = agent.deployment.name;
  const agentAction = "Grant role";
  const agentCallData: any = {
    to: recipientAddress,
    role,
  };

  const response = await bfHRE.blockflowAgentCall(
    agentName,
    agentAction,
    agentTxSignerId,
    agentCallData
  );

  if (!response.success) {
    throw new Error(
      `Grant role: ${role}, using signer: ${agentTxSignerId}, to recipient: ${roleRecipientId} failed`
    );
  }

  return response;
}
