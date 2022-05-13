import { ethers } from "hardhat";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import { Greeter } from "../typechain"
import { BigNumber, Contract, Signer, utils, Wallet } from "ethers";

async function main() {
	const signers: SignerWithAddress[] = await ethers.getSigners();
	console.log("Balance:", await signers[0].getBalance());
	const a = await deployGreeter(signers[0], "NOOOO");
	const b = await getInstance(a.address);
	console.log(await a.greet());
	console.log(await b.greet());
  
}

export async function getInstance(address: string) {
	const factory = await ethers.getContractFactory("Greeter");
	const instance = (factory.attach(address)) as Greeter;
	return instance;
}


export async function deployGreeter(deployer: SignerWithAddress | Wallet, greetingArg: string) {
	const factory = await ethers.getContractFactory("Greeter");
  let instance = (await factory.connect(deployer).deploy(
                    greetingArg, {gasPrice: ethers.utils.parseUnits("1", "gwei")})
								 ) as Greeter;
  await instance.deployed();
  console.log("Greeter address: ", instance.address);
  return instance;
}


main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });

