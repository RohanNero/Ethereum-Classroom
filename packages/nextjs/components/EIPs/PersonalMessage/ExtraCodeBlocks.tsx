import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";

// Code blocks \u005Cn \u005Cx19
const recoverContract = `
// Code based upon: https://solidity-by-example.org/signature/
contract Recover is ERC20 {
  using Strings for uint;

  constructor() ERC20("Ruby", "RBY") {
  }

  // Sends 1 Ruby to the signer if the message matches the magic words
  function recover(string memory message, bytes memory signature) public returns(bool) {
      (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
      bytes32 messageHash = keccak256(
              abi.encodePacked("\u005Cx19Ethereum Signed Message:\u005Cn", bytes(message).length.toString(), message)
          );
      address signer = ecrecover(messageHash, v, r, s);
      if(keccak256(abi.encodePacked(message)) == keccak256(abi.encodePacked("1 Ruby Please")) && signer == msg.sender) {
          _mint(signer, 1e18); 
          return true;
      }
      return false;
  }

  // Sends 'amount' of Ruby tokens to the signer if the message matches the magic words
  function recoverAmount(string memory message, uint amount, bytes memory signature) public returns(bool) {
      (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
      bytes32 messageHash = keccak256(abi.encodePacked(message, amount));
       bytes32 signedMsgHash = keccak256(
              abi.encodePacked("\u005Cx19Ethereum Signed Message:\u005Cn", messageHash)
          );
      address signer = ecrecover(signedMsgHash, v, r, s);
      if(keccak256(abi.encodePacked(message)) == keccak256(abi.encodePacked("Ruby Please")) && signer == msg.sender) {
          _mint(signer, amount); 
          return true;
      }
      return false;
  }

  // Handles splitting the signature into v, r, and s values
  function splitSignature(bytes memory sig) public pure returns (bytes32 r, bytes32 s, uint8 v) {
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
}`;

// This code displays all code blocks for EIP 7 - Delegatecall except for the main code block
const ExtraCodeBlocks = () => {
  return (
    <div className="mb-4 flex flex-row gap-5 justify-center">
      <SyntaxHighlighter className="border rounded-2xl" language="typescript" style={atomOneDark}>
        {recoverContract}
      </SyntaxHighlighter>
    </div>
  );
};

export default ExtraCodeBlocks;
