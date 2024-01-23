import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";

// Silver contract
const mainDisplayCode = `contract NFT is IERC721, IERC721Metadata {
  event Transfer(address indexed from, address indexed to, uint indexed id);
  event Approval(address indexed owner, address indexed spender, uint indexed id);
  event ApprovalForAll(
      address indexed owner,
      address indexed operator,
      bool approved
  );

  mapping(uint tokenId=> address owner) internal _ownerOf;
  mapping(address owner => uint tokenCount) internal _balanceOf;
  mapping(uint tokenId => address approved) internal _approvals;
  mapping(address owner => mapping(address operator => bool isApproved)) public isApprovedForAll;
  mapping(uint tokenId => string uri) private tokenURIs;
  string private constant NAME = "Ethereum Classroom NFT Collection";
  string private constant SYMBOL = "ECNC";
  string[] internal immutable _UriOptions;
  address private _goldContract;
  uint private _mintCounter;

  constructor(address goldContract) {
      _goldContract = goldContract;
      _UriOptions = [
          "ipfs://QmddfC4y9Ro3x9QwPvqduehZCYzGwycYxdbUE5CZ5DPihy", // BAYC
          "ipfs://QmQrgTXhcVTTWho1buaHSbg4FWQ9sUq6vADGfRLwXPxKFF", // MILADY
          "ipfs://Qme3dEBs7xaLVLC97J52pchVC5AVcZYjpSEyHdi3EHG4LU"  // PUNK
      ];
  }

  // Core ERC 721 functions

  function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
      return
          interfaceId == type(IERC721).interfaceId ||
          interfaceId == type(IERC165).interfaceId;
  }

  function ownerOf(uint id) external view returns (address owner) {
      owner = _ownerOf[id];
      require(owner != address(0), "token doesn't exist");
  }

  function balanceOf(address owner) external view returns (uint) {
      require(owner != address(0), "owner = zero address");
      return _balanceOf[owner];
  }

  function setApprovalForAll(address operator, bool approved) external {
      isApprovedForAll[msg.sender][operator] = approved;
      emit ApprovalForAll(msg.sender, operator, approved);
  }

  function approve(address spender, uint id) external {
      address owner = _ownerOf[id];
      require(
          msg.sender == owner || isApprovedForAll[owner][msg.sender],
          "not authorized"
      );
      _approvals[id] = spender;
      emit Approval(owner, spender, id);
  }

  function getApproved(uint id) external view returns (address) {
      require(_ownerOf[id] != address(0), "token doesn't exist");
      return _approvals[id];
  }

  function _isApprovedOrOwner(
      address owner,
      address spender,
      uint id
  ) internal view returns (bool) {
      return (spender == owner ||
          isApprovedForAll[owner][spender] ||
          spender == _approvals[id]);
  }

  function transferFrom(address from, address to, uint id) public {
      require(from == _ownerOf[id], "from != owner");
      require(to != address(0), "transfer to zero address");
      require(_isApprovedOrOwner(from, msg.sender, id), "not authorized");
      _balanceOf[from]--;
      _balanceOf[to]++;
      _ownerOf[id] = to;
      delete _approvals[id];
      emit Transfer(from, to, id);
  }

  function safeTransferFrom(address from, address to, uint id) external {
      transferFrom(from, to, id);
      require(
          to.code.length == 0 ||
              IERC721Receiver(to).onERC721Received(msg.sender, from, id, "") ==
              IERC721Receiver.onERC721Received.selector,
          "unsafe recipient"
      );
  }

  function safeTransferFrom(
      address from,
      address to,
      uint id,
      bytes calldata data
  ) external {
      transferFrom(from, to, id);
      require(
          to.code.length == 0 ||
              IERC721Receiver(to).onERC721Received(msg.sender, from, id, data) ==
              IERC721Receiver.onERC721Received.selector,
          "unsafe recipient"
      );
  }

  // ERC721Metadata extension functions
  function name() external pure returns (string memory) {
      return NAME;
  }

  /// @notice An abbreviated name for NFTs in this contract
  function symbol() external pure returns (string memory) {
      return SYMBOL;
  }

  /// @notice A distinct Uniform Resource Identifier (URI) for a given asset.
  /// @dev Throws if '_tokenId' is not a valid NFT. URIs are defined in RFC
  ///  3986. The URI may point to a JSON file that conforms to the "ERC721
  ///  Metadata JSON Schema".
  function tokenURI(uint256 _tokenId) external view returns (string memory) {
      return tokenURIs[_tokenId];
  }


  // Extra/Custom

  /**@notice allows user to buy a random NFT for 1 Gold token */
  function buy() public returns(uint tokenId) {
      IERC20(_goldContract).transferFrom(msg.sender, address(this), 1e18);
      _mint(msg.sender, _mintCounter);
       uint psuedoRandomNum = uint(
          keccak256(abi.encodePacked(blockhash(block.number - 1), block.timestamp))
      );
      uint key = psuedoRandomNum % 3;
      tokenURI[_tokenId] = _UriOptions[key];
  }

  /**@notice burns the token */
  function burn(uint tokenId) public {
      _burn(tokenId);
  }`;

// All of the hard coded text for EIP 20 - Token as well as the main display code
const Text = () => {
  return (
    <>
      <h3 className="text-3xl mb-4 mt-4 text-center ">
        <a className="hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-721">
          EIP 721 - Non-Fungible Token{" "}
        </a>
      </h3>
      <div className="mb-4 text-gray-400 text-xl text-center">
        <div>
          A standard that outlines the foundation for core non-fungible token functionality. This standard is very
          similar to{" "}
          <a className="hover:text-gray-400 text-gray-500" href="https://eips.ethereum.org/EIPS/eip-20">
            ERC-20&apos;s Token standard
          </a>
          , however, the main difference between NFTs and fungible Tokens is that every single NFT is unique and cannot
          simply be exchanged for another NFT from the same collection. While, 1 BTC == 1 BTC, 1 Crypto Kitty !== 1
          Crypto Kitty. This standard introduces 9 essential functions that all{" "}
          <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-721">
            EIP-721
          </a>{" "}
          compliant token contract&apos;s must have: <br />
          <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-721#specification">
            ownerOf
          </a>{" "}
          returns the owner of an inputted tokenId,{" "}
          <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-721#specification">
            balanceOf
          </a>{" "}
          returns the amount of NFTs the inputted address owns,&nbsp;
          <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-721#specification">
            SafeTransferFrom
          </a>{" "}
          sends `amount` of tokens from an address to the second inputted address and checks to ensure the receiver has
          implemented{" "}
          <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-721#specification">
            ERC721TokenReceiver
          </a>
          . There are two versions of this function, one of them allows you to pass data along with the NFT to the
          receiver. &nbsp;
          <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-721#specification">
            transferFrom
          </a>{" "}
          transfers an inputted amount of tokens from one address to another address.,&nbsp;
          <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-721#specification">
            approve
          </a>{" "}
          allows the `spender` to spend `amount` of tokens on behalf of the owner,{" "}
          <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-721#specification">
            setApprovalForAll
          </a>{" "}
          allows you to set an operator&apos;s approval status for all of your NFTs,{" "}
          <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-721#specification">
            getApproved
          </a>{" "}
          allows you to view the amount of tokens one address may spend on behalf of another address, and finally{" "}
          <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-721#specification">
            isApprovedForAll
          </a>{" "}
          allows you to view if an operator has been approved for all of an owner&apos;s NFTs. Please note, there are
          also three events that must be implemented.{" "}
          <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-721#specification">
            Transfer
          </a>{" "}
          must be emitted when any NFTs are transferred,{" "}
          <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-721#specification">
            Approval
          </a>{" "}
          must be emitted when the{" "}
          <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-721#specification">
            approve
          </a>{" "}
          function is called, and{" "}
          <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-721#specification">
            ApprovalForAll
          </a>{" "}
          is called when an operator is approved to spend all tokens on behalf of a user.
        </div>
        <div className="mt-4">
          In addition to the core 9 functions,{" "}
          <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-721">
            EIP-721
          </a>{" "}
          compliant contracts must implement one additional function from{" "}
          <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-165">
            EIP 165
          </a>
          :{" "}
          <a
            className="text-gray-500 hover:text-gray-400"
            href="https://eips.ethereum.org/EIPS/eip-165#how-a-contract-will-publish-the-interfaces-it-implements"
          >
            SupportsInterface{" "}
          </a>
          , which simply allows anyone who interacts with your contract to know what interface it implements. There are
          a couple functions you can interact with on this page that I created and don&apos;t actually belong to an EIP,
          the first one is <a className="text-gray-500 hover:text-gray-400">Buy</a>. You can use this function to mint
          yourself an NFT, but you must pay 1 <span className="text-amber-300">Gold</span> token! The second one is the
          commonly used <a className="text-gray-500 hover:text-gray-400">Burn</a> function we talked about on the{" "}
          <a className="text-gray-500 hover:text-gray-400" href="./20_Token">
            EIP-20{" "}
          </a>
          page.
        </div>
      </div>
      <div className="mb-4 text-gray-400 text-xl text-center">
        To get started, <a className="text-gray-500 hover:text-gray-400">buy</a> yourself an NFT! Remember to use the{" "}
        <span className="text-gray-500">approve &rarr; transferFrom</span> flow from{" "}
        <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-20">
          EIP-20
        </a>
        . Once you&apos;ve minted yourself an NFT, try sending one to your friends or another address you have with{" "}
        <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-721#specification">
          transfer
        </a>
        .{" "}
        {/* Finally, test your understanding of the <span className="text-gray-500">approve &rarr; transferFrom</span>{" "}
        flow once again by <a className="text-gray-500 hover:text-gray-400">sell</a>ing your NFTs for some{" "}
        <span className="text-blue-300">DIA</span>! */}
        Don&apos;t forget to check out the{" "}
        <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-721">
          Official EIP 721 page{" "}
        </a>{" "}
        to see additional functions and extensions that are optional such as:{" "}
        <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-721#specification">
          name,
        </a>{" "}
        <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-721#specification">
          symbol&nbsp;
        </a>
        and{" "}
        <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-721#specification">
          totalSupply.
        </a>
      </div>{" "}
      <div className="mb-4 w-[80%] mx-auto">
        <SyntaxHighlighter className="border rounded-2xl" language="typescript" style={atomOneDark}>
          {mainDisplayCode}
        </SyntaxHighlighter>
      </div>
    </>
  );
};

export default Text;
