import { task } from "hardhat/config";
import UniV2RouterABI from "@uniswap/v2-periphery/build/UniswapV2Router02.json";
import UniswapV2FactoryABI from "@uniswap/v2-core/build/UniswapV2Factory.json";
import { signer, parseBN, ethersProvider } from "./utils";

task("add-liquidity", "create a uniswap v2 pair")
  .addParam("tokenA", "ERC20 token to add to pool")
  .addParam("amountA", "amount of tokenA to add as liquidity")
  .addParam("amountB", "amount of ETH to add as liquidity")
  .setAction(async (taskArgs, { ethers }) => {
    const [deployer] = await ethers.getSigners();

    const UniswapV2Factory = await new ethers.Contract(
      "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
      UniswapV2FactoryABI.abi,
      await signer()
    );

    const UniV2Router = await new ethers.Contract(
      "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
      UniV2RouterABI.abi,
      await signer()
    );

    const WETH = await UniV2Router.WETH();

    const LP = await UniswapV2Factory.getPair(WETH, taskArgs.tokenA);

    const amountTokenDesired = taskArgs.amountA;
    const amountTokenMin = amountTokenDesired;
    const amountETHMin = taskArgs.amountB;
    const to = deployer.address;
    const deadline = Math.floor(Date.now());

    const Provider = ethersProvider();
    const ethBalanceBeforeAddingLiquidity = await Provider.getBalance(
      deployer.address
    );

    const TokenA = await ethers.getContractFactory("MockToken");
    const tokenA = await TokenA.attach(taskArgs.tokenA);
    const tokenBalanceBeforeAddingLiquidity = await tokenA.balanceOf(
      deployer.address
    );

    console.log("Approving token transfer...");

    await (
      await tokenA.approve(
        "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        parseBN(taskArgs.amountA)
      )
    ).wait(3);

    console.log(
      `ETH balance before adding liquidity: ${ethers.utils.formatEther(
        ethBalanceBeforeAddingLiquidity
      )}`
    );

    console.log(
      `Token balance before adding liquidity: ${ethers.utils.formatEther(
        tokenBalanceBeforeAddingLiquidity
      )}`
    );

    console.log("Adding liquidity...");

    await (
      await UniV2Router.addLiquidityETH(
        taskArgs.tokenA,
        parseBN(amountTokenDesired),
        parseBN(amountTokenMin),
        parseBN(amountETHMin),
        to,
        deadline,
        {
          value: parseBN(taskArgs.amountB),
          gasPrice: ethers.utils.parseUnits("100", "gwei"),
          gasLimit: 5000000,
        }
      )
    ).wait(3);

    console.log("Liquidity added..");

    const ethBalanceAfterAddingLiquidity = await Provider.getBalance(
      deployer.address
    );
    const tokenBalanceAfterAddingLiquidity = await tokenA.balanceOf(
      deployer.address
    );
    console.log(
      `ETH balance after adding liquidity: ${ethers.utils.formatEther(
        ethBalanceAfterAddingLiquidity
      )}`
    );
    console.log(
      `Token balance after adding liquidity: ${ethers.utils.formatEther(
        tokenBalanceAfterAddingLiquidity
      )}`
    );

    const ERC20 = await ethers.getContractFactory("ERC20");
    const lp = await ERC20.attach(LP);
    const balance = await lp.balanceOf(deployer.address);
    console.log(`UNI-V2 token balance: ${ethers.utils.formatEther(balance)}`);
  });
