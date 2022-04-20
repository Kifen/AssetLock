//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./interfaces/IUniswapV2Router02.sol";

contract AssetLockUniswapV2Router {
    IUniswapV2Router02 public immutable uniswapV2Router;
    IERC20 public immutable TOKEN;

    event SwapEthForTokens(uint256 indexed input, uint256 indexed output);

    event SwapTokensForEth(uint256 indexed input, uint256 indexed output);

    constructor(IUniswapV2Router02 _uniV2Router, IERC20 _token) {
        uniswapV2Router = _uniV2Router;
        TOKEN = _token;
    }

    function _swapEthForExactTokens(uint256 _amountOut) internal {
        address[] memory path = new address[](2);
        path[0] = uniswapV2Router.WETH();
        path[1] = address(TOKEN);

        uint256[] memory amounts = uniswapV2Router.swapETHForExactTokens(
            _amountOut,
            path,
            address(this),
            block.timestamp
        );

        emit SwapEthForTokens(msg.value, amounts[1]);
    }

    function _swapExactTokensForEth(uint256 _amountIn, uint256 _amountOut)
        internal
    {
        address[] memory path = new address[](2);
        path[0] = address(TOKEN);
        path[1] = uniswapV2Router.WETH();

        TOKEN.approve(address(uniswapV2Router), _amountIn);

        uint256[] memory amounts = uniswapV2Router.swapExactTokensForETH(
            _amountIn,
            _amountOut,
            path,
            address(this),
            block.timestamp
        );

        emit SwapTokensForEth(_amountIn, amounts[1]);
    }
}
