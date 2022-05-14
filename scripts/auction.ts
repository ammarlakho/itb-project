import { ethers } from "hardhat";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import { Auction } from "../typechain"
import { BigNumber, utils } from "ethers";
import { formatEther } from "ethers/lib/utils";

async function main() {
	const signers: SignerWithAddress[] = await ethers.getSigners();
	console.log("Balance for", signers[0].address, ":", (await signers[0].getBalance()).toString(), '\n');
	const auctionAddress = "0xfEaF2b7c09b9c0383B0eeE1F768d6a4C8D6FCbf9"
	const bidders = [signers[2], signers[3], signers[4], signers[5], signers[6]];
	
	// const auctionInstance = await deployAuction(signers[1]);
	// await startAuction(signers[1], auctionInstance.address);
	// await bid(bidders, auctionInstance.address);
	// await endAuction(signers[1], auctionAddress);
	// await withdrawAll(bidders, auctionAddress);
	
	// for (let i=0; i<bidders.length; i++) {
	// 	console.log(`Balance for bidder${i}: ${bidders[i].address}: ${formatEther(await bidders[i].getBalance())}`);
	// }
	// console.log(`Balance for deployer: ${signers[1].address}: ${formatEther(await signers[1].getBalance())}`);



}

async function bid(signers: SignerWithAddress[], auctionAddress: string) {
	const amountsStr = ['0.01', '0.002', '0.1', '0.13', '0.09'];
	const amounts = amountsStr.map(amount => ethers.utils.parseUnits(amount, "ether"));
	const auctionInstance = await getAuctionInstance(auctionAddress);
	for (let i=0; i<signers.length; i++) {
		const tx = await auctionInstance.connect(signers[i]).placeBid({value: amounts[i]});
		await tx.wait();
		console.log(`Bid ${i+1} tx: ${tx.hash}`);
	}
}

async function startAuction(signer: SignerWithAddress, auctionAddress: string) {
	const currentTime = Math.round(new Date().getTime() / 1000);
	const endTime = currentTime + 5*60;
	const auctionInstance = await getAuctionInstance(auctionAddress);
	const tx = await auctionInstance.connect(signer).startAuction(endTime);
	await tx.wait();
	console.log(`Start Auction tx: ${tx.hash}`);
}

async function endAuction(signer: SignerWithAddress, auctionAddress: string) {
	const auctionInstance = await getAuctionInstance(auctionAddress);
	const tx = await auctionInstance.connect(signer).endAuction();
	await tx.wait();
	console.log(`End Auction tx: ${tx.hash}`);
}

async function withdrawAll(signers: SignerWithAddress[], auctionAddress: string) {
	const auctionInstance = await getAuctionInstance(auctionAddress);
	for (let i=0; i<signers.length; i++) {
		const tx = await auctionInstance.connect(signers[i]).withdrawBid();
		await tx.wait();
		console.log(`Withdraw ${i+1} tx: ${tx.hash}`);
	}	
}


async function deployAuction(deployer: SignerWithAddress) {
  const factory = await ethers.getContractFactory("Auction");
	const tenGwei = ethers.utils.parseUnits("10", "gwei");
	const eleven = ethers.utils.parseUnits("11", "gwei");
  let instance = (await factory.connect(deployer).deploy({ })) as Auction;
	console.log('Auction000 address: ', instance.address);
  await instance.deployed();

  console.log("Auction address: ", instance.address);
  return instance;
}

async function getAuctionInstance(address: string) {
	const factory = await ethers.getContractFactory("Auction");
	const instance = (factory.attach(address)) as Auction;
	return instance;
}


main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });

