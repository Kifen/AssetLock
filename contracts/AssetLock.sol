//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./AssetLockUniswapRouter.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AssetLock is AssetLockUniswapRouter {
    address public executor;
    address public unlocker;
    uint256 public lockTime;
    uint256 public unlockDate;

    event NewLockTime(uint256 indexed oldLockTime, uint256 indexed newLockTime);

    event Lock(
        uint256 indexed duration,
        uint256 indexed lockedAt,
        address indexed unlocker
    );

    event WithdrawEth(address indexed to, uint256 indexed amount);

    event WithdrawTokens(address indexed to, uint256 indexed amount);

    constructor(
        ISwapRouter _swapRouter,
        IQuoter _quoter,
        address _token,
        address _weth9,
        uint256 _lockTime
    ) AssetLockUniswapRouter(_swapRouter, _quoter, _token, _weth9) {
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
        require(
            msg.sender == executor || msg.sender == unlocker,
            "UniswapRouter: cannot withdraw"
        );
        _;
    }

    modifier t() {
        require(unlockDate > 0, "AssetLock: nothing to withdraw");
        require(block.timestamp >= unlockDate, "AssetLock: not time to unlock");
        _;
    }

    modifier lockInactive() {
        require(block.timestamp >= unlockDate, "AssetLock: lock is active");
        _;
    }

    function swapEthToExactToken(uint256 _amountOutMinimum, address _unlocker)
        external
        payable
        lockInactive
        onlyExecutor
    {
        _swapEthToExactToken(_amountOutMinimum);
        _lock(_unlocker);
    }

    function swapTokenToExactEth(
        uint256 _amountIn,
        uint256 _amountOutMinimum,
        address _unlocker
    ) external lockInactive onlyExecutor {
        _swapTokenToExactEth(_amountIn, _amountOutMinimum);
        _lock(_unlocker);
    }

    function withdrawEth() external payable t canWithdraw {
        uint256 amount = address(this).balance;
        payable(msg.sender).transfer(amount);

        emit WithdrawEth(msg.sender, amount);
    }

    function withdrawTokens() external payable t canWithdraw {
        IERC20 erc20Token = IERC20(token);
        uint256 amount = erc20Token.balanceOf(address(this));
        erc20Token.transfer(msg.sender, amount);

        emit WithdrawTokens(msg.sender, amount);
    }

    function _setLockTime(uint256 _newLockTime) external onlyExecutor {
        uint256 oldLockTime = lockTime;
        lockTime = _newLockTime;

        emit NewLockTime(oldLockTime, _newLockTime);
    }

    function _lock(address _unlocker) internal {
        uint256 now = block.timestamp;
        unlockDate = now + lockTime;
        unlocker = _unlocker;

        emit Lock(lockTime, now, _unlocker);
    }
}
