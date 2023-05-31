import { Agent } from "@blockfold/blockflow-agent";
import { BlockflowHRE } from "blockflow-hardhat";
import Bluebird from "bluebird";
import hre from "hardhat";

export type AgentStateResult = {
  bfHRE: BlockflowHRE;
  agent: Agent;
};

export async function startAgentFixture(): Promise<AgentStateResult> {
  let devSigners = await hre.ethers.getSigners();

  const bfHRE = hre as BlockflowHRE;

  // Name our signers so that we can use them in the same way that
  // Blockflow signers will come to us when deployed.
  const bfSigners = await Bluebird.map(
    ["fiona", "alex", "ivan", "charlotte"],
    (name, i) => bfHRE.blockflowSignerSet(name, devSigners[i])
  );

  if (bfSigners.some((s) => !s)) {
    throw new Error("Some of the bfSigners are falsy");
  }

  const [fiona, alex, ivan, charlotte] = bfSigners;

  const agentName = "TezCoin";
  const agentManifestPath = ".";
  const agentSecrets = {};
  const agentDeploySigner = fiona;
  const agentConfig: any = {
    protocolName: "Test coin",
    protocolSymbol: "$TC",
  };

  // Create the agent and start it up (triggering an initial deployment)
  const agent = await bfHRE.blockflowAgentCreate(
    agentName,
    agentManifestPath,
    agentConfig,
    agentSecrets,
    agentDeploySigner
  );

  return {
    bfHRE,
    agent,
  };
}
