// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


interface IERC165 {
    function supportsInterface(bytes4 interfaceID) external view returns (bool);
}

interface IERC721 is IERC165 {
    function balanceOf(address owner) external view returns (uint balance);

    function ownerOf(uint tokenId) external view returns (address owner);

    function safeTransferFrom(address from, address to, uint tokenId) external;

    function safeTransferFrom(
        address from,
        address to,
        uint tokenId,
        bytes calldata data
    ) external;

    function transferFrom(address from, address to, uint tokenId) external;

    function approve(address to, uint tokenId) external;

    function getApproved(uint tokenId) external view returns (address operator);

    function setApprovalForAll(address operator, bool _approved) external;

    function isApprovedForAll(
        address owner,
        address operator
    ) external view returns (bool);
}

interface IERC721Receiver {
    function onERC721Received(
        address operator,
        address from,
        uint tokenId,
        bytes calldata data
    ) external returns (bytes4);
}

/// @title ERC-721 Non-Fungible Token Standard, optional metadata extension
/// @dev See https://eips.ethereum.org/EIPS/eip-721
///  Note: the ERC-165 identifier for this interface is 0x5b5e139f.
interface IERC721Metadata is IERC721  {
    /// @notice A descriptive name for a collection of NFTs in this contract
    function name() external view returns (string memory _name);

    /// @notice An abbreviated name for NFTs in this contract
    function symbol() external view returns (string memory _symbol);

    /// @notice A distinct Uniform Resource Identifier (URI) for a given asset.
    /// @dev Throws if `_tokenId` is not a valid NFT. URIs are defined in RFC
    ///  3986. The URI may point to a JSON file that conforms to the "ERC721
    ///  Metadata JSON Schema".
    function tokenURI(uint256 _tokenId) external view returns (string memory);
}

// NFT Contract
contract NFT is IERC721, IERC721Metadata {
    event Transfer(address indexed from, address indexed to, uint indexed tokenId);
    event Approval(address indexed owner, address indexed spender, uint indexed tokenId);
    event ApprovalForAll(
        address indexed owner,
        address indexed operator,
        bool approved
    );

    // Mapping from token ID to owner address
    mapping(uint tokenId => address owner) internal _ownerOf;

    // Mapping owner address to token count
    mapping(address owner => uint tokenCount) internal _balanceOf;

    // Mapping from token ID to approved address
    mapping(uint tokenId => address approved) internal _approvals;

    // Mapping from owner to operator approvals
    mapping(address owner => mapping(address operator => bool isApproved)) public isApprovedForAll;

    // Metadata extension variables
    mapping(uint tokenId => string uri) private tokenURIs;
    
    string private constant NAME = "Ethereum Classroom NFT Collection";
    string private constant SYMBOL = "ECNC";

    string[3] internal _UriOptions;

    address private _goldContract;

    // Tracks which tokenId should be minted/how many have been minted
    uint private _mintCounter;

    // Sets the Gold address and NFT URI options
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
    /// @dev Throws if `_tokenId` is not a valid NFT. URIs are defined in RFC
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
        tokenURIs[_mintCounter] = _UriOptions[key];
        _mintCounter++;
        return _mintCounter - 1;
    }

    /**@notice burns the token */
    function burn(uint tokenId) public {
        _burn(tokenId);
        tokenURIs[tokenId] = "";
    }


    // Extra/Custom internal functions

    function _mint(address to, uint tokenId) internal {
        require(to != address(0), "mint to zero address");
        require(_ownerOf[tokenId] == address(0), "already minted");
        _balanceOf[to]++;
        _ownerOf[tokenId] = to;
        emit Transfer(address(0), to, tokenId);
    }

    function _burn(uint tokenId) internal {
        address owner = _ownerOf[tokenId];
        require(owner != address(0), "not minted");
        _balanceOf[owner] -= 1;
        delete _ownerOf[tokenId];
        delete _approvals[tokenId];
        emit Transfer(owner, address(0), tokenId);
    }

    function getMintCounter() public view returns(uint) {
        return _mintCounter;
    }
}


