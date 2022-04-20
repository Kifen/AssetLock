import { task } from "hardhat/config";
import { AssetLock__factory, MockToken__factory } from "../typechain";
import { saveContractAddress } from "./utils";

task("deploy-all")
  .addParam("amountA", "amount of tokenA to add as liquidity")
  .addParam("amountB", "amount of ETH to add as liquidity")
  .setAction(async (taskArgs, { run, ethers }) => {
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

    const poolAddress = await run("create-uniswap-pair", {
      tokenB: MockToken.address,
    });

    await run("add-liquidity", {
      tokenA: MockToken.address,
      amountA: taskArgs.amountA,
      amountB: taskArgs.amountB,
      lp: poolAddress,
    });
  });