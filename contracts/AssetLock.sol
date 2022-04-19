//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

contract AssetLock {
  ISwapRouter public immutable swapRouter;
  address public executor;
  address public unlocker;

  constructor(ISwapRouter _swapRouter) {
    swapRouter = _swapRouter;
    executor = msg.sender;
  }
}