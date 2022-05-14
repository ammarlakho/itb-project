// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";


contract ICO {
	address public owner;
	address public tokenAddress;
	uint public startTime;
	uint public endTime;
	uint public price = 0.001 ether;
	uint public raisedAmount;
	uint public hardCap = 1 ether;
	uint public minInvestment = 0.01 ether;
	uint public maxInvestment = 0.2 ether;
	
	constructor(address tokenAddress_ , uint startTime_, uint endTime_) {
		require(startTime_ < endTime_, "Start time must be before end time");
		require(startTime_ >= block.timestamp, "ICO: Start time cannot be in the past");
		owner = msg.sender;
		tokenAddress = tokenAddress_;	
		startTime = startTime_;
		endTime = endTime_;
	}
	
	modifier onlyOwner {
		require(owner == msg.sender, "Ownable: caller is not the owner");
        _;
	}

	modifier activeSale() {
		require(block.timestamp >= startTime, "ICO: sale has not started yet");
		require(block.timestamp <= endTime, "ICO: sale has ended");
		require(raisedAmount < hardCap, "ICO: hard cap reached");
		_;
	}

	modifier validAmount {
		require(msg.value >= minInvestment, "ICO: minimum investment is not met");
		require(msg.value <= maxInvestment, "ICO: maximum investment is exceeded");
		_;
	}

	function buy() activeSale validAmount external payable {
		uint amountOfTokens = (10**(IERC20Metadata(tokenAddress).decimals())) * (msg.value / price);
		require(msg.value < hardCap, "ICO: amount exceeds hard cap");
		IERC20(tokenAddress).transfer(msg.sender, amountOfTokens);
		raisedAmount += msg.value;
	}

	// Owner can withdraw deposited ether
	function withdrawEther() external onlyOwner {
		require(block.timestamp >= endTime, "ICO: cannot withdraw ether before end time");
        uint balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }
}
