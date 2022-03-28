//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract DripToken {
    using SafeMath for uint256;

    mapping(address => uint256) private startTime;

    string private _name;
    string private _symbol;

    uint256 private tokenPerSecond = 1;

    constructor() {
        _name = "DripToken";
        _symbol = "DRIP";
    }

    function register() public {
        startTime[msg.sender] = block.timestamp;
    }

    function isRegistered(address account) public view returns (bool) {
        return startTime[account] != 0;
    }

    function balanceOf(address account) public view returns (uint256) {
        // if registered, return balance
        if (isRegistered(account)) {
            uint256 timeSinceStart = block.timestamp.sub(
                startTime[account],
                "Subtraction cannot overflow"
            );
            uint256 tokensInBalance = timeSinceStart.mul(tokenPerSecond);
            return tokensInBalance;
        }
        // if not registered, return 0
        return 0;
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }
}
