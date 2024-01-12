//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

contract Delegatecall {

    uint public x;

    function delegate(address y, uint z) public returns(uint) {
            y.delegatecall(abi.encode(z));
            return x;
    }
}
