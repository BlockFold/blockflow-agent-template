import { Agent } from "@blockfold/blockflow-agent";
import { BigNumber } from "ethers";
import { BlockFlowERC20 } from "../../typechain";

export async function getERC20Reference(agent: Agent) {
  const contractAddress = await agent.getState("contractAddress");
  const contractFactoryName = "BlockFlowERC20";
  const erc20 = (await agent.getContract(
    contractAddress,
    contractFactoryName
  )) as BlockFlowERC20;

  const decimals = await erc20.decimals();
  const ONE = BigNumber.from(10).pow(decimals);

  return { ONE, erc20 };
}
