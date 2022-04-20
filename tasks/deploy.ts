import { task } from "hardhat/config";
import { AssetLock__factory, MockToken__factory } from "../typechain";
import { saveContractAddress } from "./utils";

task("deploy-all")
  .addParam("amountA", "amount of tokenA to add as liquidity")
  .addParam("amountB", "amount of ETH to add as liquidity")
  .setAction(async (taskArgs, hre) => {
    const signers = await hre.ethers.getSigners();
    const networkName = hre.network.name;

    const IUniswapV2Router02 = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const lockTime = 300;

    const MockToken = await new MockToken__factory(signers[0]).deploy(
      "MockToken",
      "MKT"
    );

    console.log(`MockToken deployed to ${MockToken.address}`);

    saveContractAddress(networkName, "MockToken", MockToken.address);

    const AssetLock = await new AssetLock__factory(signers[0]).deploy(
      IUniswapV2Router02,
      MockToken.address,
      lockTime
    );

    console.log(`AssetLock deployed to ${AssetLock.address}`);

    saveContractAddress(networkName, "AssetLock", AssetLock.address);

    const poolAddress = await hre.run("create-uniswap-pair", {
      tokenB: MockToken.address,
    });

    await hre.run("add-liquidity", {
      tokenA: MockToken.address,
      amountA: taskArgs.amountA,
      amountB: taskArgs.amountB,
    });
  });
