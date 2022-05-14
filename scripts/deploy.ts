import { ethers } from "hardhat";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import { ICO, LakhoToken } from "../typechain"
import { BigNumber, utils } from "ethers";
import { getContractAddress } from "ethers/lib/utils";

async function main() {
	const signers: SignerWithAddress[] = await ethers.getSigners();
	console.log("Balance for", signers[0].address, ":", (await signers[0].getBalance()).toString(), '\n');
	const supply = utils.parseEther("2000")
	const nonce = await signers[0].getTransactionCount();
	const icoAddress = await getAddress(signers[0], nonce+1);
	const tokenInstance = await deployToken(signers[0], supply, icoAddress);

	const currentTime = Math.round(new Date().getTime() / 1000);
	const startTime = currentTime + 1*60;
	const endTime = startTime + 2*60; 
	const icoInstance = await deployICO(signers[0], tokenInstance.address, startTime, endTime);
	console.log(icoAddress === icoInstance.address);
	
}

async function deployToken(
  deployer: SignerWithAddress,
  supply: BigNumber,
  icoAddress: string
) {
  const factory = await ethers.getContractFactory("LakhoToken");
  let instance = (await factory
    .connect(deployer)
    .deploy("LakhoToken", "LT", supply, icoAddress, {
      gasPrice: ethers.utils.parseUnits("1", "gwei"),
    })) as LakhoToken;
  await instance.deployed();

  console.log("LakhoToken address: ", instance.address);
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
    .deploy(tokenAddress, startTime, endTime, {
      gasPrice: ethers.utils.parseUnits("1", "gwei"),
    })) as ICO;
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

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });

