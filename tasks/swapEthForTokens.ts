import { task } from "hardhat/config";
import { AssetLock__factory, MockToken__factory } from "../typechain";
import addresses from "../contract-addresses.json";
import UniV2RouterABI from "@uniswap/v2-periphery/build/UniswapV2Router02.json";
import { parseBN, ethersProvider, signer } from "./utils";
import { Contract, BigNumber } from "ethers";

const ETH = "ETH";
const TOKEN = "TOKEN";

task("swap")
  .addParam("amountIn", "amount to swap")
  .addParam("unlocker", "account that can withdraw amount")
  .addParam("to", "ETH or TOKEN")
  .setAction(async (taskArgs, hre) => {
    const signers = await hre.ethers.getSigners();
    const contractAddresses: any = addresses;

    const networkName = hre.network.name;

    const MockTokenAddress = contractAddresses[networkName]["MockToken"];
    const AssetLockAddress = contractAddresses[networkName]["AssetLock"];

    const Token = await new MockToken__factory(signers[0]).attach(
      MockTokenAddress
    );

    // run check
    console.log("Running quick check...");
    await quickChecks(taskArgs.to);
    console.log("Check successfull...");

    const Provider = ethersProvider();
    const ethBalanceBeforeSwapping = await Provider.getBalance(
      AssetLockAddress
    );

    const tokenBalanceBeforeSwapping = await Token.balanceOf(AssetLockAddress);

    const AssetLock = await new AssetLock__factory(signers[0]).attach(
      AssetLockAddress
    );

    console.log(
      `AssetLock ETH balance before swapping: ${hre.ethers.utils.formatEther(
        ethBalanceBeforeSwapping
      )}`
    );

    console.log(
      `AssetLock Token balance before swapping: ${hre.ethers.utils.formatEther(
        tokenBalanceBeforeSwapping
      )}`
    );

    const UniV2Router = await new hre.ethers.Contract(
      "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
      UniV2RouterABI.abi,
      await signer()
    );

    const WETH = await UniV2Router.WETH();

    const path =
      taskArgs.to == ETH ? [MockTokenAddress, WETH] : [WETH, MockTokenAddress];

    const amountOutMins = await UniV2Router.getAmountsOut(
      parseBN(taskArgs.amountIn),
      path
    );

    const amountOutMin = amountOutMins[path.length - 1];

    const options = {
      gasPrice: hre.ethers.utils.parseUnits("100", "gwei"),
      gasLimit: 5000000,
    };

    if (taskArgs.to === TOKEN) {
      console.log(
        `Swapping ${taskArgs.amountIn} ETH <-> ${hre.ethers.utils.formatEther(
          amountOutMin
        )} ${await Token.symbol()}`
      );

      await (
        await AssetLock.swapEthForExactTokens(amountOutMin, taskArgs.unlocker, {
          value: parseBN(taskArgs.amountIn),
        })
      ).wait(3);
    } else if (taskArgs.to === ETH) {
      console.log(
        `Swapping ${
          taskArgs.amountIn
        } ${await Token.symbol()} <-> ${hre.ethers.utils.formatEther(
          amountOutMin
        )} ETH`
      );

      await (
        await AssetLock.swapExactTokensForEth(
          parseBN(taskArgs.amountIn),
          amountOutMin,
          taskArgs.unlocker,
          options
        )
      ).wait(3);
    }

    console.log("Swap complete...");

    const ethBalanceAfterSwapping = await Provider.getBalance(AssetLockAddress);

    const tokenBalanceAfterSwapping = await Token.balanceOf(AssetLockAddress);

    console.log(
      `AssetLock ETH balance after swapping: ${hre.ethers.utils.formatEther(
        ethBalanceAfterSwapping
      )}`
    );

    console.log(
      `AssetLock Token balance after swapping: ${hre.ethers.utils.formatEther(
        tokenBalanceAfterSwapping
      )}`
    );
  });

const quickChecks = async (to: string) => {
  if (to != ETH && to != TOKEN) {
    throw new Error(`to must be ${ETH} or ${TOKEN}`);
  }
};
