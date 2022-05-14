import { ethers } from "hardhat";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import { ICO, LakhoToken } from "../typechain"
import { BigNumber, utils } from "ethers";
import { formatEther, getContractAddress } from "ethers/lib/utils";

async function main() {
	const signers: SignerWithAddress[] = await ethers.getSigners();
	console.log("Balance for", signers[0].address, ":", formatEther(await signers[1].getBalance()), '\n');
	const tokenAddress = "0x518BDE4152C36Ba21455AA5a189bE982ED03D3DB";
	const icoAddress = "0xEcF1809484140e6083a791FbA7927dD3D8B05a04";

	// const { tokenInstance, icoInstance } = await deployBoth(signers[1]);
	// await buy(signers, icoAddress);
	// await withdraw(signers[1], icoAddress);


	// await getTokenBalances(signers, tokenInstance.address, icoInstance.address);
	// await getEtherBalances(signers, tokenInstance.address, icoInstance.address);
	// await printTokenBalances(signers, tokenAddress, icoAddress);
	// await printEtherBalances(signers, tokenAddress, icoAddress);
}

async function deployBoth(signer: SignerWithAddress) {
	const supply = utils.parseEther("2000")
	const nonce = await signer.getTransactionCount();
	const predictedICOAddress = await getAddress(signer, nonce+1);
	const tokenInstance = await deployToken(signer, supply, predictedICOAddress);

	const currentTime = Math.round(new Date().getTime() / 1000);
	const startTime = currentTime + 1*60;
	const endTime = startTime + 5*60; 
	const icoInstance = await deployICO(signer, tokenInstance.address, startTime, endTime);
	console.log(predictedICOAddress === icoInstance.address);
	return {
		tokenInstance,
		icoInstance
	}
}

async function buy(signers: SignerWithAddress[], icoAddress: string) {
	const buyers = [signers[0], signers[2], signers[3], signers[4], signers[5], signers[6], signers[7], signers[8], signers[9]];
	const amountsStr = ['0.05', '0.15', '0.2', '0.16', '0.04', '0.1', '0.1', '0.12', '0.08'];
	if (buyers.length !== amountsStr.length) {
		throw new Error("Buyers and amounts must be the same length");
	}
	const amounts = amountsStr.map(amount => ethers.utils.parseUnits(amount, "ether"));
	const icoInstance = await getICOInstance(icoAddress);
	const sum = amounts.reduce((a, b) => a.add(b), ethers.constants.Zero);
	console.log(await icoInstance.endTime())
	const hardCap = await icoInstance.hardCap();
	console.log(sum, formatEther(sum));
	console.log(hardCap, formatEther(hardCap))
	if (!sum.eq(hardCap)) {
		throw new Error("Total amount is not equal to cap");
	}
	for (let i=0; i<buyers.length; i++) {
		const tx = await icoInstance.connect(buyers[i]).buy({value: amounts[i]})
		await tx.wait();
		console.log("Buy tx:", tx.hash);
	}
}

async function withdraw(signer: SignerWithAddress, icoAddress: string) {
	const icoInstance = await getICOInstance(icoAddress);
	const tx = await icoInstance.connect(signer).withdrawEther({});
	await tx.wait();
	console.log("Withdraw tx:", tx.hash);
}

async function deployToken(
  deployer: SignerWithAddress,
  supply: BigNumber,
  icoAddress: string
) {
	console.log('hi');
  const factory = await ethers.getContractFactory("LakhoToken");
	console.log('got factory');
  let instance = (await factory
    .connect(deployer)
    .deploy("LakhoToken", "LT", supply, icoAddress, 
		{maxFeePerGas: utils.parseUnits('15', 'gwei'), maxPriorityFeePerGas: utils.parseUnits('10', 'gwei')})) as LakhoToken;
	console.log('Token address(not mined):', instance.address);
  await instance.deployed();

  console.log("LakhoToken address:", instance.address);
  return instance;
}

async function deployICO(
  deployer: SignerWithAddress,
  tokenAddress: string,
  startTime: BigNumber | number,
  endTime: BigNumber | number
) {
  const factory = await ethers.getContractFactory("ICO");
  let instance = (await factory
    .connect(deployer)
    .deploy(tokenAddress, startTime, endTime, 
			{maxFeePerGas: utils.parseUnits('15', 'gwei'), maxPriorityFeePerGas: utils.parseUnits('10', 'gwei')})) as ICO;
	console.log('ICO address(not mined):', instance.address);
  await instance.deployed();

  console.log("ICO address: ", instance.address);
  return instance;
}

async function getAddress(deployer: SignerWithAddress, nonce: number) {
	const futureAddress = getContractAddress({
	  from: deployer.address,
	  nonce: nonce
	});
	return futureAddress;
}

async function getTokenInstance(address: string) {
	const factory = await ethers.getContractFactory("LakhoToken");
	const instance = (factory.attach(address)) as LakhoToken;
	return instance;
}

async function getICOInstance(address: string) {
	const factory = await ethers.getContractFactory("ICO");
	const instance = (factory.attach(address)) as ICO;
	return instance;
}

async function printTokenBalances(signers: SignerWithAddress[], tokenAddress: string, icoAddress: string) {
	const deployer = signers[1];
	const buyers = [signers[0], signers[2], signers[3], signers[4], signers[5], signers[6], signers[7], signers[8], signers[9]];
	const tokenInstance = await getTokenInstance(tokenAddress);
	const icoInstance = await getICOInstance(icoAddress);
	for (let i=0; i<buyers.length; i++) {
		const balance = await tokenInstance.balanceOf(buyers[i].address);
		console.log('Buyer:', buyers[i].address, formatEther(balance));
	}
	const icoBalance = await tokenInstance.balanceOf(icoAddress);
	console.log('ICO:', icoAddress, formatEther(icoBalance));
	const deployerBalance = await tokenInstance.balanceOf(deployer.address);
	console.log('Deployer:', deployer.address, formatEther(deployerBalance));
}

async function printEtherBalances(signers: SignerWithAddress[], tokenAddress: string, icoAddress: string) {
	const deployer = signers[1];
	const buyers = [signers[0], signers[2], signers[3], signers[4], signers[5], signers[6], signers[7], signers[8], signers[9]];
	for (let i=0; i<buyers.length; i++) {
		console.log('Buyer:', buyers[i].address, formatEther(await buyers[i].getBalance()));
	}
	const provider = signers[0].provider;
	if (provider) {
		console.log('ICO:', icoAddress, formatEther(await provider.getBalance(icoAddress)));
	}
	console.log('Deployer:', deployer.address, formatEther(await deployer.getBalance()));

}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });

