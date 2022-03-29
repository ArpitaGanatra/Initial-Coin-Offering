// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface ICryptoDevs {
    // call a function from cryptodevs nft contract
    // which would return the token of nft owned by the wallet
    function tokenOfOwnerByIndex(address owner, uint256 index) external view returns(uint256 tokenId);

    //check the balance of tokens present in the wallet
    function balanceOf(address owner) external view returns(uint256 balance);
}
