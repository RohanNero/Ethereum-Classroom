//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

// import "../../../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**@notice The purpose of this contract is to allow users to play with EIP 191 personal messages
  *@dev Thanks to SMP for his code which this is based upon */
contract Recover is ERC20 {
    using Strings for uint;

    constructor() ERC20("Ruby", "RBY") {
    }

    // Sends 1 Ruby to the signer if the message matches the magic words
    function recover(
        string memory message,
        bytes memory signature

    ) public returns(bool){
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
        bytes32 messageHash = keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n", bytes(message).length.toString(), message)
            );
        address signer = ecrecover(messageHash, v, r, s);
       if(keccak256(abi.encodePacked(message)) == keccak256(abi.encodePacked("1 Ruby Please")) && signer == msg.sender) {
            _mint(signer, 1e18); 
            return true;
       }
        return false;
    }

    // Sends `amount` of Ruby tokens to the signer if the message matches the magic words
    function recoverAmount(
        string memory message,
        uint amount,
        bytes memory signature
    ) public returns(bool){
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
        // Hash the message and the amount
        bytes32 messageHash = keccak256(abi.encodePacked(message, amount));
        // hash the data according to EIP 191
         bytes32 signedMsgHash = keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
            );
        // Recover the signer and save the address to a local variable
        address signer = ecrecover(signedMsgHash, v, r, s);
       // Mint `amount` of Ruby tokens to the signer if they ask nicely and are the signer
       if(keccak256(abi.encodePacked(message)) == keccak256(abi.encodePacked("Ruby Please")) && signer == msg.sender) {
            _mint(signer, amount); 
            return true;
       }
        return false;
    }

    // Handles splitting the signature into v, r, and s values
    function splitSignature(
        bytes memory sig
    ) public pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "invalid signature length");

        assembly {
            /*
            First 32 bytes stores the length of the signature

            add(sig, 32) = pointer of sig + 32
            effectively, skips first 32 bytes of signature

            mload(p) loads next 32 bytes starting at the memory address p into memory
            */

            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }

        // implicitly return (r, s, v)
    }
}