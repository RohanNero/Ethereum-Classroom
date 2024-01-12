//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

// import "../../../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**@notice The purpose of this contract is to allow users to test ERC 20's approve -> transferFrom flow 
  *@dev The one function allows users to swap their Silver token for Gold 
  *@dev I wanted the price to be based on today's (2024/1/9) gold/silver ratio of ~88 
  *@dev But 1:10 will suffice for learning purposes s*/
contract SimpleSwap is ERC20 {

    address public silverContract;

    constructor(address _silverContract) ERC20("Gold", "GLD") {
        silverContract = _silverContract;
    }

    /**@notice Swaps `amount` of Silver token for 1/10th of the amount of Gold */
    function swap(uint amount) public returns (uint) {
        ERC20(silverContract).transferFrom(msg.sender, address(this), amount);
        _mint(msg.sender, amount / 10);
        return amount / 10;
    }
}