import { task } from "hardhat/config";
import ContractAddresses from "../contract-addresses.json";
import UniswapV3FactoryABI from "@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json";
import { signer, parseBN } from "./utils";

task("create-uniswap-pool", "create a uniswap v3 pool")
  .addParam("tokenA", "One of the two tokens in the desired pool")
  .addParam("tokenB", "The other of the two tokens in the desired pool")
  .addParam("fee", "The desired fee for the pool")
  .setAction(async (taskArgs, { ethers }) => {
    const UniswapV3Factory = await new ethers.Contract(
      "0x1F98431c8aD98523631AE4a59f267346ea31F984",
      UniswapV3FactoryABI.abi,
      await signer()
    );

    const address = await (
      await UniswapV3Factory.createPool(
        taskArgs.tokenA,
        taskArgs.tokenB,
        parseBN(taskArgs.fee)
      )
    ).wait(3);

    console.log(`New pool created - ${address}`);
  });
