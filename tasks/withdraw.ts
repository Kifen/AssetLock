import { task } from "hardhat/config";
import { AssetLock__factory, MockToken__factory } from "../typechain";
import addresses from "../contract-addresses.json";
import {
  parseBN,
  ethersProvider,
  signer,
  ETH,
  TOKEN,
  quickChecks,
} from "./utils";

task("withdraw")
  .addParam("asset", "TOKEN or ETH")
  .setAction(async (taskArgs, hre) => {
    await quickChecks(taskArgs.asset);

    const signers = await hre.ethers.getSigners();
    const contractAddresses: any = addresses;

    const networkName = hre.network.name;
    const AssetLockAddress = contractAddresses[networkName]["AssetLock"];
    const MockTokenAddress = contractAddresses[networkName]["MockToken"];

    const AssetLock = await new AssetLock__factory(signers[0]).attach(
      AssetLockAddress
    );

    const Token = await new MockToken__factory(signers[0]).attach(
      MockTokenAddress
    );

    const options = {
      gasPrice: hre.ethers.utils.parseUnits("100", "gwei"),
      gasLimit: 5000000,
    };

    if (taskArgs.asset == ETH) {
      const Provider = ethersProvider();
      const ethBalanceBeforeWithdrawal = await Provider.getBalance(
        signers[0].address
      );

      console.log(`Withdawing ETH to account ${signers[0].address}`);
      console.log(
        `Account ETH balance ${hre.ethers.utils.formatEther(
          ethBalanceBeforeWithdrawal
        )}`
      );

      await (await AssetLock.withdrawEth(options)).wait(3);

      const ethBalanceAfterWithdrawal = await Provider.getBalance(
        signers[0].address
      );
      console.log(
        `Final account ETH balance ${hre.ethers.utils.formatEther(
          ethBalanceAfterWithdrawal
        )}`
      );
    } else if (taskArgs.asset == TOKEN) {
      console.log(`Withdawing TOKEN to account ${signers[0].address}`);
      const tokenBalanceBeforeWithdrawal = await Token.balanceOf(
        signers[0].address
      );

      console.log(
        `Account TOKEN balance ${hre.ethers.utils.formatEther(
          tokenBalanceBeforeWithdrawal
        )}`
      );

      await (await AssetLock.withdrawTokens(options)).wait(3);

      const tokenBalanceAfterWithdrawal = await Token.balanceOf(
        signers[0].address
      );

      console.log(
        `Final account TOKEN balance ${hre.ethers.utils.formatEther(
          tokenBalanceAfterWithdrawal
        )}`
      );
    }
  });
