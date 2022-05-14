// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "hardhat/console.sol";


contract LakhoToken is IERC20Metadata {
	mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 private _totalSupply;
    string private _name;
    string private _symbol;

	constructor(string memory name_, string memory symbol_, uint256 totalSupply_, address icoAddress_) {
		_name = name_;
		_symbol = symbol_;
		_mint(msg.sender, totalSupply_/2); // Mint half tokens to token creator
		_mint(icoAddress_, totalSupply_/2); // Mint half tokens to ICO contract
	}

	function name() external override view returns (string memory) {
		return _name;
	}

    function symbol() external override view returns (string memory) {
		return _symbol;
	}

    function decimals() external override pure returns (uint8) {
		return 18;
	}

	function totalSupply() external override view returns (uint256) {
		return _totalSupply;
	}

    function balanceOf(address account) external override view returns (uint256) {
		return _balances[account];
	}

	function allowance(address owner, address spender) external override view returns (uint256) {
		return _allowances[owner][spender];
	}

	function approve(address spender, uint256 amount) external override returns (bool) {
		_allowances[msg.sender][spender] = amount;
		emit Approval(msg.sender, spender, amount);
		return true;
	}
    
    function transfer(address recipient, uint256 amount) external override returns (bool) {
		_transfer(msg.sender, recipient, amount);
		return true;
	}

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external override returns (bool) {
		require(_allowances[sender][msg.sender] >= amount, "ERC20: insufficient allowance");
		_transfer(sender, recipient, amount);
		_allowances[sender][msg.sender] -= amount;
		return true;
	}

	function _transfer(address sender, address recipient, uint256 amount) private {
		require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");
		require(_balances[sender] >= amount, "ERC20: transfer amount exceeds balance");
		_balances[sender] -= amount;
		_balances[recipient] += amount;
		emit Transfer(sender, recipient, amount);
	}

	function _mint(address account, uint256 amount) private {
        require(account != address(0), "ERC20: mint to the zero address");
        _totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);
    }
}
