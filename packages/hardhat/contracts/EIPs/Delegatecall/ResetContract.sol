//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

contract ResetContract {
 uint public x;
   fallback() external {
        x = 0;
     }
}