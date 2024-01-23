import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";

// Code blocks \u005Cn \u005Cx19
const recoverContract = `
contract PatrickCollins is ERC20 {

  struct EIP712Domain {
      string  name;
      string  version;
      uint256 chainId;
      address verifyingContract;
  }

  struct Info {
      address student;
      uint256 amount;
      string patricksFavAnimal;
  }

  bytes32 constant EIP712DOMAIN_TYPEHASH = keccak256(
      "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
  );
 
  bytes32 constant INFO_TYPEHASH = keccak256(
      "Info(address student,uint256 amount,string patricksFavAnimal)"
  );

  bytes32 public DOMAIN_SEPARATOR;
  bytes32 public test;
  bytes32 constant cat = keccak256(abi.encodePacked("cat"));
  bytes32 constant frog = keccak256(abi.encodePacked("frog"));
  bytes32 constant hawk = keccak256(abi.encodePacked("hawk"));
  uint public chainId;

  constructor() ERC20("Knowledge", "KNO") {
       DOMAIN_SEPARATOR = keccak256(abi.encode(
          EIP712DOMAIN_TYPEHASH,
          keccak256(bytes("Ethereum Classroom")),
          keccak256(bytes('1')),
          block.chainid,
          address(this)
      ));
  }

  function recover(uint amount, string memory patricksFavAnimal, bytes memory signature) public returns (bool) {
      bytes32 digest = hash(msg.sender, amount, patricksFavAnimal);
      ( bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
      address signer =  ecrecover(digest, v, r, s);
      bytes32 animalInput = keccak256(abi.encodePacked(patricksFavAnimal));
      // Companies with two of them and a matching outfit with the other, safe to say he likes these at least
      bool animalCheck = animalInput == cat || animalInput == frog || animalInput == hawk; 
      if(signer == msg.sender  && animalCheck) {
          _mint(signer, amount);
          return true;
      }
      return false;
  }
 
  function hash(address student, uint amount, string memory patricksFavAnimal) public view returns(bytes32) {
      bytes32 structHash = keccak256(abi.encode(
          INFO_TYPEHASH,
          student,
          amount,
          keccak256(abi.encodePacked(patricksFavAnimal))
      ));
      bytes32 Hash = keccak256(abi.encodePacked("\u005Cx19\u005Cx01", DOMAIN_SEPARATOR, structHash));
      return Hash;
  }

  /**@notice Splits a signature and returns its r,s and v values */
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
