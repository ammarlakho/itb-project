// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "hardhat/console.sol";

contract Auction {
	address public owner;
	uint public startTime;
	uint public endTime;
	uint public minPrice = 0.001 ether;
	address private highestBidder;
	address private secondHighestBidder;
	mapping(address => uint) public bids;
	
	enum AuctionStatus { InActive, Active, Cancelled, Complete }
	AuctionStatus public auctionStatus;

	constructor() {
		owner = msg.sender;
		auctionStatus = AuctionStatus.InActive;
	}

	modifier onlyOwner {
		require(owner == msg.sender, "Ownable: caller is not the owner");
        _;
	}

	function auctionWinner() external view returns (address) {
		require(auctionStatus == AuctionStatus.Complete, "Auction is not complete");
		return highestBidder;
	}

	function placeBid() external payable {
		require(msg.value >= minPrice, "Bid is too low");
		bids[msg.sender] = msg.value;
		if (highestBidder == address(0)) {
			highestBidder = msg.sender;
			secondHighestBidder = msg.sender;
		} else if (msg.value > bids[highestBidder]) {
			secondHighestBidder = highestBidder;
			highestBidder = msg.sender;
		} else if (msg.value > bids[secondHighestBidder]) {
			secondHighestBidder = msg.sender;
		}
	}

	function startAuction(uint endTime_) external onlyOwner {
		require(endTime > block.timestamp, "End time is in the past");
		require(auctionStatus == AuctionStatus.InActive, "Auction is already active");
		auctionStatus = AuctionStatus.Active;
		startTime = block.timestamp;
		endTime = endTime_;
	}

	function endAuction() external onlyOwner {
		require(auctionStatus == AuctionStatus.Active, "Auction is not active");
		require(block.timestamp >= endTime, "Auction has not ended yet");
		auctionStatus = AuctionStatus.Complete;
		uint increment = (bids[highestBidder] - bids[secondHighestBidder])/2;
		uint highestBindingBid = bids[secondHighestBidder] + increment;
        payable(msg.sender).transfer(highestBindingBid);
	}

	function cancelAuction() external onlyOwner {
		auctionStatus = AuctionStatus.Cancelled;
	}

	function withdrawBid() external {
		require(auctionStatus == AuctionStatus.Complete, "Auction is not complete");
		if (msg.sender == highestBidder) {
			uint increment = (bids[highestBidder] - bids[secondHighestBidder])/2;
			uint highestBindingBid = bids[secondHighestBidder] + increment;
			uint refundedAmount = bids[msg.sender] - highestBindingBid;
			payable(msg.sender).transfer(refundedAmount);
		} else {
			payable(msg.sender).transfer(bids[msg.sender]);
		}
	}
}