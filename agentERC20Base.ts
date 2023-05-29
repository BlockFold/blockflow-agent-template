import { IAccessControlWatcher, IERC20TransferWatcher, Agent, ContractEvent, BlockflowSigner } from "@blockfold/blockflow-agent";
import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";
// import { ethers } from "hardhat";
import { BlockFlowERC20 } from "./typechain";

import { bindActionTransfer } from "./actions/actionTransfer";
import { bindActionTransferFrom } from "./actions/actionTransferFrom";
import { bindActionApprove } from "./actions/actionApprove";

import { bindActionMint } from "./actions/actionMint";
import { bindActionBurn } from "./actions/actionBurn";

import { bindActionRoleGrant } from "./actions/actionRoleGrant";
import { bindActionRoleRevoke } from "./actions/actionRoleRevoke";

import { erc20 } from "./typechain/@openzeppelin/contracts/token";

let agent = new Agent();

let protocolName = agent.config?.protocolName as string;
let protocolSymbol = agent.config?.protocolSymbol as string;

const factoryName = "BlockFlowERC20";

var _roleGrants: IAccessControlWatcher;
var _balances: IERC20TransferWatcher;
var _decimals: number;
var _erc20: BlockFlowERC20;
var ONE: BigNumber;

agent.onStartup("erc20-init", async (deploySigner?: BlockflowSigner) => {
  agent.logInfo(`Initialize: ${protocolName} (${protocolSymbol}) using ${deploySigner?.meta?.signerId}`, {});
  if (!deploySigner) throw `Invalid Admin / Deployment account`;

  if (!protocolName) throw `Invalid protocol name`;
  if (!protocolSymbol) throw `Invalid protocol symbol`;

  let existingAddress = await agent.getState("contractAddress");
  // I need a way to check to see if my contract has been deployed or not....
  let existing = existingAddress ? await agent.getAgentSmartContractByAddress(existingAddress, factoryName) : null;

  if (existing != null) {
    agent.logInfo(`BlockFlow.ERC20 has already been deployed: ${existing!.address}`, {});
    _erc20 = existing.contract as BlockFlowERC20;
  } else {
    agent.logInfo(`Deploying contract ${protocolName} (${protocolSymbol}) using ${deploySigner.meta.name} to chain ${deploySigner.meta.chainId}`, {});
    _erc20 = (await agent.deployContract(deploySigner, protocolName, factoryName, [protocolName, protocolSymbol])) as BlockFlowERC20;
  }

  _decimals = await _erc20.decimals();
  ONE = BigNumber.from(10).pow(_decimals);

  // Set up our state watchers
  const roleNames = ["PAUSER_ROLE", "MINTER_ROLE", "BURNER_ROLE", "DEFAULT_ADMIN_ROLE"];

  agent.setState("contractAddress", _erc20.address);

  _balances = await agent.watchERC20Transfers(_erc20, protocolName);
  _roleGrants = await agent.watchAccessControl(_erc20, protocolName, roleNames);

  // Bind my actions
  bindActionTransfer(agent, _erc20, ONE);
  bindActionTransferFrom(agent, _erc20, ONE);
  bindActionApprove(agent, _erc20, ONE);

  bindActionMint(agent, _erc20, ONE);
  bindActionBurn(agent, _erc20, ONE);

  bindActionRoleGrant(agent, _erc20);
  bindActionRoleRevoke(agent, _erc20);
});

export default agent;
