import { Agent } from "@blockfold/blockflow-agent";
import { BlockflowHRE } from "blockflow-hardhat";

export async function revokeRole(
  agent: Agent,
  bfHRE: BlockflowHRE,
  agentTxSignerId: string,
  revokeRoleFromSignerId: string,
  role: string
) {
  const revokeRoleFromAddress = await bfHRE
    .blockflowSignerGet(revokeRoleFromSignerId)
    .then((v) => v.getAddress());

  // Now revoke the role.
  const agentName = agent.deployment.name;
  const agentAction = "Revoke role";
  const agentCallData: any = {
    from: revokeRoleFromAddress,
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
      `Revoke role: ${role}, using signer: ${agentTxSignerId}, from account: ${revokeRoleFromSignerId} failed`
    );
  }

  return response;
}
