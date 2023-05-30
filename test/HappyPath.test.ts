import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { BlockFlowERC20 } from '../typechain/contracts';

describe('HappyPath', function () {
  let blockFlowERC20: BlockFlowERC20;
  let deployer: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;

  before(async function () {
    const signers = await ethers.getSigners();
    const contractName = 'BlockFlowERC20';
    const tokenName = 'BlockFlowERC20';
    const tokenSymbol = 'BF-ERC20';

    deployer = signers[0];
    alice = signers[1];
    bob = signers[2];

    const BlockFlowERC20 = await ethers.getContractFactory(contractName, deployer);
    blockFlowERC20 = await BlockFlowERC20.deploy(tokenName, tokenSymbol);
    await blockFlowERC20.deployed();
    await blockFlowERC20.mint(bob.address, ethers.utils.parseEther('1000'));
  });

  it('Deployer mints some tokens to Alice', async function () {
    let txn = await blockFlowERC20.mint(alice.address, ethers.utils.parseEther('1000'));
    await txn.wait();
  });

  it('Alice sends some tokens to Bob', async function () {
    let txn = await blockFlowERC20.connect(alice).transfer(bob.address, ethers.utils.parseEther('100'));
    await txn.wait();
  });

  it('Deployer grants BURNER_ROLE to Bob', async function () {
    let txn = await blockFlowERC20.grantRole(await blockFlowERC20.BURNER_ROLE(), bob.address);
    await txn.wait();
  });

  it('Bob burns some tokens', async function () {
    let txn = await blockFlowERC20.connect(bob).burn(ethers.utils.parseEther('100'));
    await txn.wait();
  });
});
