// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

import {
  AssetLock__factory,
  MockToken__factory,
  MockToken,
} from "../typechain";
import { saveContractAddress } from "./utils";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const signers = await ethers.getSigners();
  const network = await ethers.getDefaultProvider().getNetwork();

  const IUniswapV2Router02 = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  const lockTime = 86400;

  const MockToken = await new MockToken__factory(signers[0]).deploy(
    "MockToken",
    "MKT"
  );

  console.log(`MockToken deployed to ${MockToken.address}`);

  saveContractAddress(network.chainId, "MockToken", MockToken.address);

  const AssetLock = await new AssetLock__factory(signers[0]).deploy(
    IUniswapV2Router02,
    MockToken.address,
    lockTime
  );

  console.log(`AssetLock deployed to ${AssetLock.address}`);

  saveContractAddress(network.chainId, "AssetLock", AssetLock.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
