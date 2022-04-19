//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AssetLock {
    ISwapRouter public immutable swapRouter;
    IERC20 public immutable token;
    IERC20 public immutable WETH9;

    address public executor;
    address public unlocker;
    uint256 public lockTime;

    uint24 public constant poolFee = 3000;

    event SwapEthToToken(
        uint256 indexed input,
        uint256 indexed output,
        uint256 indexed refund
    );

    constructor(
        ISwapRouter _swapRouter,
        IERC20 _token,
        IERC20 _weth9
    ) {
        swapRouter = _swapRouter;
        executor = msg.sender;
        token = _token;
        WETH9 = _weth9;
    }
}
