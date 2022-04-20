//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/interfaces/IQuoter.sol";

contract AssetLockUniswapV3Router {
    ISwapRouter public immutable swapRouter;
    IQuoter public immutable quoter;
    address public immutable token;
    address public immutable WETH9;

    uint24 public constant poolFee = 3000;

    event SwapEthToToken(uint256 indexed input, uint256 indexed output);

    event SwapTokenToEth(uint256 indexed input, uint256 indexed output);

    constructor(
        ISwapRouter _swapRouter,
        IQuoter _quoter,
        address _token,
        address _weth9
    ) {
        swapRouter = _swapRouter;
        quoter = _quoter;
        token = _token;
        WETH9 = _weth9;
    }

    function _swapEthToExactToken(uint256 _amountOutMinimum) internal {
        require(msg.value > 0, "AssetLock: ZERO value");

        uint256 amountOut = _swap(msg.value, _amountOutMinimum, WETH9, token);

        emit SwapEthToToken(msg.value, amountOut);
    }

    function _swapTokenToExactEth(uint256 _amountIn, uint256 _amountOutMinimum)
        internal
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

    function estimateExactOutputSingle(
        address _tokenIn,
        address _tokenOut,
        uint24 _fee,
        uint256 _inputAmount,
        uint160 _sqrtPriceLimitX96
    ) external returns (uint256) {
        return
            quoter.quoteExactOutputSingle(
                _tokenIn,
                _tokenOut,
                _fee,
                _inputAmount,
                _sqrtPriceLimitX96
            );
    }
}
