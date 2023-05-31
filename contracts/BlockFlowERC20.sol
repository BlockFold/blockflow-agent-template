// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title BlockFlowERC20 fungible token extending OpenZeppelin contracts.
 * @author BlockFold 
 */
contract BlockFlowERC20 is ERC20, ERC20Burnable, Pausable, AccessControl {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    /**
     * @notice Construct a new BlockFlowERC20 contract.
     * 
     * Requirements:
     * - Creates a new ERC20 token with provided `name` and `symbol`.
     * 
     * State:
     * - `DEFAULT_ADMIN_ROLE` must be granted to caller.
     * - `PAUSER_ROLE` must be granted to caller.
     * - `MINTER_ROLE` must be granted to caller.
     * - `BURNER_ROLE` must be granted to caller.
     */
    constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
    }
    
    /**
     * @notice Returns the number of decimals used for arithmetic in the contract.
     * 
     * @return The number of decimals.
     */
	function decimals() public pure override returns (uint8) {
		return 6;
	}

    /**
     * @notice Adds a role check to {PausableUpgradeable-pause}.
     *
     * Requirements:
     * - Caller must have the PAUSER_ROLE.
     *
     * State:
     * - Must pause the contract.
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @notice Adds a role check to {PausableUpgradeable-pause}.
     *
     * Requirements:
     * - Caller must have the PAUSER_ROLE.
     *
     * State:
     * - Must make the contract usable again.
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @notice Implements a way to mint {BlockFlowERC20} tokens.
     * 
     * Requirements:
     * - Caller must have the MINTER_ROLE.
     * - Must fail when contract is paused.
     * 
     * State:
     * - Must mint `amount` of tokens to the `to` address.
     */
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) whenNotPaused {
        _mint(to, amount);
    }

    /**
     * @notice Implements a way to burn {BlockFlowERC20} tokens.
     * 
     * Requirements:
     * - Caller must have the BURNER_ROLE.
     * - Must fail when contract is paused.
     * 
     * State:
     * - Must burn `amount` of tokens from the caller.
     */
    function burn(uint256 amount) public onlyRole(BURNER_ROLE) whenNotPaused override {
        _burn(_msgSender(), amount);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }
}