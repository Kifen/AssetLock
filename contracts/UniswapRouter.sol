//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

contract UniswapRouter {
    ISwapRouter public immutable swapRouter;
    address public immutable token;
    address public immutable WETH9;
    address public executor;

    uint24 public constant poolFee = 3000;

    event SwapEthToToken(uint256 indexed input, uint256 indexed output);

    event SwapTokenToEth(uint256 indexed input, uint256 indexed output);

    constructor(
        ISwapRouter _swapRouter,
        address _token,
        address _weth9
    ) {
        swapRouter = _swapRouter;
        executor = msg.sender;
        token = _token;
        WETH9 = _weth9;
    }

    modifier onlyExecutor() {
        require(
            msg.sender == executor,
            "UniswapRouter: caller is not the executor"
        );
        _;
    }

    function swapEthToExactToken(uint256 _amountOutMinimum)
        external
        payable
        onlyExecutor
    {
        require(msg.value > 0, "AssetLock: ZERO value");

        uint256 amountOut = _swap(msg.value, _amountOutMinimum, WETH9, token);

        emit SwapEthToToken(msg.value, amountOut);
    }

    function swapTokenToExactEth(uint256 _amountIn, uint256 _amountOutMinimum)
        external
        payable
        onlyExecutor
    {
        uint256 amountOut = _swap(_amountIn, _amountOutMinimum, token, WETH9);

        emit SwapTokenToEth(_amountIn, amountOut);
    }

    function _swap(
        uint256 _amountIn,
        uint256 _amountOutMinimum,
        address _tokenIn,
        address _tokenOut
    ) internal returns (uint256 amountOut) {
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: _tokenIn,
                tokenOut: _tokenOut,
                fee: poolFee,
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: _amountIn,
                amountOutMinimum: _amountOutMinimum,
                sqrtPriceLimitX96: 0
            });

        if (_tokenOut == WETH9) {
            amountOut = swapRouter.exactInputSingle(params);
        } else {
            amountOut = swapRouter.exactInputSingle{value: msg.value}(params);
        }
    }
}
