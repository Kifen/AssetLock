//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./AssetLockUniswapV2Router.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AssetLock is AssetLockUniswapV2Router {
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

    event Received(address sender, uint256 amount);

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

    function swapEthForExactTokens(uint256 _amountOut, address _unlocker)
        external
        payable
        lockInactive
        onlyExecutor
    {
        _swapEthForExactTokens(_amountOut);
        _lock(_unlocker);
    }

    function swapExactTokensForEth(
        uint256 _amountIn,
        uint256 _amountOut,
        address _unlocker
    ) external lockInactive onlyExecutor {
        _swapExactTokensForEth(_amountIn, _amountOut);
        _lock(_unlocker);
    }

    function withdrawEth() external payable t canWithdraw {
        uint256 amount = address(this).balance;
        payable(msg.sender).transfer(amount);

        emit WithdrawEth(msg.sender, amount);
    }

    function withdrawTokens() external payable t canWithdraw {
        IERC20 erc20Token = IERC20(TOKEN);
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

receive() external payable {
        emit Received(msg.sender, msg.value);
    }
  }
