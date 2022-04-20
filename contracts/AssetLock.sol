//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./AssetLockUniswapV2Router.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AssetLock is AssetLockUniswapV2Router {
    address public executor;
    address public unlocker;
    uint256 public lockTime;
    uint256 public lockTimeOut;
    uint256 public swapedEth;
    uint256 public swapedToken;

    event NewLockTime(uint256 indexed oldLockTime, uint256 indexed newLockTime);

    event Lock(uint256 indexed timeOut, address indexed unlocker);

    event WithdrawEth(address indexed to, uint256 indexed amount);

    event WithdrawTokens(address indexed to, uint256 indexed amount);

    event Received(address sender, uint256 amount);

    error UnAuthorized();

    constructor(
        IUniswapV2Router02 _uniV2Router,
        IERC20 _token,
        uint256 _lockTime
    ) AssetLockUniswapV2Router(_uniV2Router, _token) {
        executor = msg.sender;
        lockTime = _lockTime;
    }

    modifier onlyExecutor() {
        require(
            msg.sender == executor,
            "UniswapRouter: caller is not the executor"
        );
        _;
    }

    modifier canWithdraw() {
        if (msg.sender == unlocker) {
            require(block.timestamp <= lockTimeOut, "AssetLock: ");
            _;
        } else if (msg.sender == executor) {
            require(block.timestamp > lockTimeOut, "AssetLock: ");
            _;
        } else {
            revert UnAuthorized();
            _;
        }
    }

    modifier lockInactive() {
        require(block.timestamp > lockTimeOut, "AssetLock: lock is active");
        _;
    }

    function swapExactETHForTokens(uint256 _amountOut, address _unlocker)
        external
        payable
        onlyExecutor
        lockInactive
    {
        uint256 outputAmount = _swapExactETHForTokens(_amountOut);
        swapedToken = swapedToken + outputAmount;

        _setTimeout(_unlocker);
    }

    function swapExactTokensForEth(
        uint256 _amountIn,
        uint256 _amountOut,
        address _unlocker
    ) external onlyExecutor lockInactive {
        uint256 outputAmount = _swapExactTokensForEth(_amountIn, _amountOut);
        swapedEth = swapedEth + outputAmount;

        _setTimeout(_unlocker);
    }

    function withdrawEth() external payable canWithdraw {
        uint256 amount = swapedEth;
        require(amount > 0, "AssetLock: ZERO ETH to withdraw");
        swapedEth = 0;

        payable(msg.sender).transfer(amount);

        emit WithdrawEth(msg.sender, amount);
    }

    function withdrawTokens() external payable canWithdraw {
        IERC20 erc20Token = IERC20(TOKEN);
        uint256 amount = swapedToken;
        require(amount > 0, "AssetLock: ZERO TOKENS to withdraw");

        swapedToken = 0;

        erc20Token.transfer(msg.sender, amount);

        emit WithdrawTokens(msg.sender, amount);
    }

    function _setLockTime(uint256 _newLockTime) external onlyExecutor {
        uint256 oldLockTime = lockTime;
        lockTime = _newLockTime;

        emit NewLockTime(oldLockTime, _newLockTime);
    }

    function _setTimeout(address _unlocker) internal {
        uint256 now = block.timestamp;
        lockTimeOut = now + lockTime;
        unlocker = _unlocker;

        emit Lock(lockTimeOut, _unlocker);
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}
