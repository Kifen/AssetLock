import { task } from "hardhat/config";
import UniswapV2FactoryABI from "@uniswap/v2-core/build/UniswapV2Factory.json";
import UniV2RouterABI from "@uniswap/v2-periphery/build/UniswapV2Router02.json";
import { signer } from "./utils";

task("create-uniswap-pair", "create a uniswap v3 pool")
  .addParam("tokenB", "One of the two tokens in the desired pool")
  .setAction(async (taskArgs, { ethers }) => {
    const Signer = await signer();

    const UniV2Router = await new ethers.Contract(
      "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
      UniV2RouterABI.abi,
      Signer
    );

    const UniswapV2Factory = await new ethers.Contract(
      "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
      UniswapV2FactoryABI.abi,
      await signer()
    );

    const WETH = await UniV2Router.WETH();
    console.log("Creating a new uniswap pair...");

    await (await UniswapV2Factory.createPair(WETH, taskArgs.tokenB)).wait(3);

    const newPair = await UniswapV2Factory.getPair(WETH, taskArgs.tokenB);

    console.log(`New pair created - ${newPair}`);

    return newPair;
  });
