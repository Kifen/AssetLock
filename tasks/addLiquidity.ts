import { task } from "hardhat/config";
import ContractAddresses from "../contract-addresses.json";
import UniswapV3FactoryABI from "@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json";
import { ethersProvider, signer, parseBN } from "./utils";
import { AlphaRouter } from "@uniswap/smart-order-router";
import { Token, CurrencyAmount, Percent, TradeType } from "@uniswap/sdk-core";
import { JSBI } from "@uniswap/sdk";
import Web3 from "web3";

const web3Provider = new Web3(process.env.RINKEBY_URL);

const router = new AlphaRouter({
  chainId: 4,
  provider: web3Provider,
});

task("add-liquidity", "add liquidity to pool")
  .addParam("tokenB", "The other of the two tokens in the desired pool")
  .addParam("tokenB_symbol", "")
  .addParam("tokenB_name", "")
  .addParam("fee", "The desired fee for the pool")
  .setAction(async (taskArgs, { ethers }) => {
    const [deployer] = await ethers.getSigners();

    const WETH = new Token(4, taskArgs.tokenA, 18, "WETH", "Wrapped Ether");

    const token = new Token(
      4,
      taskArgs.tokenB,
      18,
      taskArgs.tokenB_symbol,
      taskArgs.tokenB_name
    );

    const typedValueParsed = "10000000000000000000";
    const wethAmount = CurrencyAmount.fromRawAmount(
      WETH,
      JSBI.BigInt(typedValueParsed)
    );

    const route = await router.route(wethAmount, token, TradeType.EXACT_INPUT, {
      recipient: deployer.address,
      slippageTolerance: new Percent(5, 100),
      deadline: Math.floor(Date.now() / 1000 + 1800),
    });

    console.log(`Quote Exact In: ${route.quote.toFixed(2)}`);
    console.log(`Gas Adjusted Quote In: ${route.quoteGasAdjusted.toFixed(2)}`);
    console.log(`Gas Used USD: ${route.estimatedGasUsedUSD.toFixed(6)}`);

    const transaction = {
      data: route.methodParameters.calldata,
      to: 0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45,
      value: ethers.BigNumber.from(route.methodParameters.value),
      from: deployer.address,
      gasPrice: ethers.BigNumber.from(route.gasPriceWei),
    };

    await web3Provider.eth.sendTransaction(transaction);
  });
