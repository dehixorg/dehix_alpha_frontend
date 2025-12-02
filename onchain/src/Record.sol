// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DehixRecordID is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;

    constructor() ERC721("DehixIdentityRecord", "DIDR") Ownable(msg.sender) {}

    function mintIdentity(address to, string memory _tokenURI) external onlyOwner {
        uint256 tokenId = nextTokenId++;
        _mint(to, tokenId);
        _setTokenURI(tokenId, _tokenURI);
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721)
        returns (address)
    {
        address from = _ownerOf(tokenId);

        if (from != address(0) && to != address(0)) {
            revert("DehixID: This identity is Soulbound and cannot be transferred.");
        }

        return super._update(to, tokenId, auth);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
