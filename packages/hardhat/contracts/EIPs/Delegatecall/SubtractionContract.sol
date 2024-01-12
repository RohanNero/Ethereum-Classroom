//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

contract SubtractionContract {
     uint public x;
   fallback() external {
        uint input = abi.decode(msg.data, (uint));
        x = x - input;
     }
}