import '@nomicfoundation/hardhat-chai-matchers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import '@nomiclabs/hardhat-ethers';
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('BlockFlowERC20', function () {
  async function deployBlockFlowERC20() {
    const signers = await ethers.getSigners();
    const contractName = 'BlockFlowERC20';
    const tokenName = 'BlockFlowERC20';
    const tokenSymbol = 'BF-ERC20';

    const deployer = signers[0];
    const alice = signers[1];
    const bob = signers[2];

    const BlockFlowERC20 = await ethers.getContractFactory(contractName, deployer);
    let blockFlowERC20 = await BlockFlowERC20.deploy(tokenName, tokenSymbol);
    await blockFlowERC20.deployed();
    await blockFlowERC20.mint(bob.address, ethers.utils.parseEther('1000'));

    return {
      deployer,
      alice,
      bob,
      blockFlowERC20,
      tokenName,
      tokenSymbol,
      contractName,
    };
  }

  describe('constructor', function () {
    it('Creates a new ERC20 token with provided `name` and `symbol`.', async function () {
      const { blockFlowERC20 } = await loadFixture(deployBlockFlowERC20);
      expect(await blockFlowERC20.name()).to.equal('BlockFlowERC20');
      expect(await blockFlowERC20.symbol()).to.equal('BF-ERC20');
    });

    it('Must grant DEFAULT_ADMIN_ROLE, PAUSER_ROLE, MINTER_ROLE and BURNER_ROLE to caller.', async function () {
      const { blockFlowERC20, deployer } = await loadFixture(deployBlockFlowERC20);
      expect(await blockFlowERC20.hasRole(await blockFlowERC20.DEFAULT_ADMIN_ROLE(), deployer.address));
      expect(await blockFlowERC20.hasRole(await blockFlowERC20.PAUSER_ROLE(), deployer.address));
      expect(await blockFlowERC20.hasRole(await blockFlowERC20.MINTER_ROLE(), deployer.address));
      expect(await blockFlowERC20.hasRole(await blockFlowERC20.BURNER_ROLE(), deployer.address));
    });
  });

  describe('decimals', function () {
    it('Must return number of decimals.', async function () {
      const { blockFlowERC20 } = await loadFixture(deployBlockFlowERC20);
      expect(await blockFlowERC20.decimals()).to.equal(6);
    });
  });

  describe('pause', function () {
    it('Caller must have the PAUSER_ROLE.', async function () {
      const { alice, deployer, blockFlowERC20 } = await loadFixture(deployBlockFlowERC20);
      await expect(blockFlowERC20.connect(alice).pause()).to.be.reverted;
      let txn = await blockFlowERC20.connect(deployer).pause();
      await txn.wait();
    });

    it('Must pause the contract.', async function () {
      const { deployer, blockFlowERC20 } = await loadFixture(deployBlockFlowERC20);
      let txn = await blockFlowERC20.connect(deployer).pause();
      await txn.wait();
    });

    it('Must fail if the contract is already paused.', async function () {
      const { deployer, blockFlowERC20 } = await loadFixture(deployBlockFlowERC20);
      let txn = await blockFlowERC20.connect(deployer).pause();
      await txn.wait();
      await expect(blockFlowERC20.connect(deployer).pause()).to.be.revertedWith('Pausable: paused');
    });
  });

  describe('unpause', function () {
    it('Caller must have the PAUSER_ROLE.', async function () {
      const { alice, deployer, blockFlowERC20 } = await loadFixture(deployBlockFlowERC20);
      let txn = await blockFlowERC20.connect(deployer).pause();
      await txn.wait();
      await expect(blockFlowERC20.connect(alice).unpause()).to.be.reverted;
      txn = await blockFlowERC20.connect(deployer).unpause();
      await txn.wait();
    });

    it('Contract must be usable after calling unpause', async function () {
      const { alice, deployer, blockFlowERC20 } = await loadFixture(deployBlockFlowERC20);
      let txn = await blockFlowERC20.connect(deployer).pause();
      await txn.wait();
      txn = await blockFlowERC20.connect(deployer).unpause();
      await txn.wait();
      txn = await blockFlowERC20.connect(deployer).mint(alice.address, ethers.utils.parseEther('100'));
      await txn.wait();
    });

    it('Must fail if the contract is not paused.', async function () {
      const { deployer, blockFlowERC20 } = await loadFixture(deployBlockFlowERC20);
      await expect(blockFlowERC20.connect(deployer).unpause()).to.be.revertedWith('Pausable: not paused');
    });
  });

  describe('mint', function () {
    it('Caller must have the MINTER_ROLE.', async function () {
      const { alice, deployer, blockFlowERC20 } = await loadFixture(deployBlockFlowERC20);
      await expect(blockFlowERC20.connect(alice).mint(alice.address, ethers.utils.parseEther('100'))).to.be.reverted;
      let txn = await blockFlowERC20.connect(deployer).mint(alice.address, ethers.utils.parseEther('100'));
      await txn.wait();
    });

    it('Must fail when contract is paused.', async function () {
      const { alice, deployer, blockFlowERC20 } = await loadFixture(deployBlockFlowERC20);
      let txn = await blockFlowERC20.connect(deployer).pause();
      await txn.wait();
      await expect(
        blockFlowERC20.connect(deployer).mint(alice.address, ethers.utils.parseEther('100')),
      ).to.be.revertedWith('Pausable: paused');
    });

    it('Must mint a token to `to`.', async function () {
      const { alice, deployer, blockFlowERC20 } = await loadFixture(deployBlockFlowERC20);
      let txn = await blockFlowERC20.connect(deployer).mint(alice.address, ethers.utils.parseEther('100'));
      await txn.wait();
      let balance = await blockFlowERC20.balanceOf(alice.address);
      expect(balance).to.equal(ethers.utils.parseEther('100'));
    });
  });

  describe('burn', function () {
    it('Caller must have the BURNER_ROLE.', async function () {
      const { alice, deployer, blockFlowERC20 } = await loadFixture(deployBlockFlowERC20);
      let txn = await blockFlowERC20.connect(deployer).mint(alice.address, ethers.utils.parseEther('100'));
      await txn.wait();
      await expect(blockFlowERC20.connect(alice).burn(ethers.utils.parseEther('100'))).to.be.reverted;
      txn = await blockFlowERC20.connect(deployer).grantRole(await blockFlowERC20.BURNER_ROLE(), alice.address);
      await txn.wait();
      txn = await blockFlowERC20.connect(alice).burn(ethers.utils.parseEther('100'));
      await txn.wait();
    });

    it('Must fail when contract is paused.', async function () {
      const { alice, deployer, blockFlowERC20 } = await loadFixture(deployBlockFlowERC20);
      let txn = await blockFlowERC20.connect(deployer).mint(alice.address, ethers.utils.parseEther('100'));
      await txn.wait();
      await expect(blockFlowERC20.connect(alice).burn(ethers.utils.parseEther('100'))).to.be.reverted;
      txn = await blockFlowERC20.connect(deployer).grantRole(await blockFlowERC20.BURNER_ROLE(), alice.address);
      await txn.wait();
      txn = await blockFlowERC20.connect(deployer).pause();
      await txn.wait();
      await expect(blockFlowERC20.connect(alice).burn(ethers.utils.parseEther('100'))).to.be.revertedWith(
        'Pausable: paused',
      );
    });

    it('Must burn `amount` of tokens from the caller.', async function () {
      const { bob, deployer, blockFlowERC20 } = await loadFixture(deployBlockFlowERC20);
      let amountToBurn = ethers.utils.parseEther('100');
      let bobBlanceBefore = await blockFlowERC20.balanceOf(bob.address);
      let txn = await blockFlowERC20.connect(deployer).grantRole(await blockFlowERC20.BURNER_ROLE(), bob.address);
      await txn.wait();
      txn = await blockFlowERC20.connect(bob).burn(amountToBurn);
      await txn.wait();
      let bobBlanceAfter = await blockFlowERC20.balanceOf(bob.address);
      expect(bobBlanceAfter).to.equal(bobBlanceBefore.sub(amountToBurn));
    });
  });
});
