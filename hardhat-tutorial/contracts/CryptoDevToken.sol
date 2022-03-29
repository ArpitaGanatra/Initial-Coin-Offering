// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ICryptoDevs.sol";

contract CryptoDevToken is ERC20, Ownable {
    //price of 1 token
    //give it in constant, so it cant be changedd
    uint256 public constant tokenPrice = 0.001 ether;

    // max token supply
    //give it in constant, so it cant be changedd
    uint256 public constant maxTotalSupply = 10000 * 10**18;

    //total free tokens per nft
    uint256 public constant tokensPerNFT = 10 * 10**18;

    //instance of CryptoDevs contract
    //to find which address owns the NFT
    ICryptoDevs CryptoDevsNFT;

    // mapping to which tokenIds have been claimed
    mapping(uint256 => bool) public tokenIdsClaimed;


    //constructor
    //give the address of CryptoDevsContract

    constructor(address _cryptoDevsContract) ERC20("Crypto Dev Token", "CD") {
        CryptoDevsNFT = ICryptoDevs(_cryptoDevsContract);
    }

    //mint function
    // amount is num of cryptoDevs Tokens a user wants to mint
    function mint(uint256 amount) public payable {
        uint256 _requiredAmount = amount * tokenPrice;
        require(msg.value >= _requiredAmount, "Ether sent is incorrect");
        uint256 amountWithDecimals = amount * 10**18;
        require(totalSupply() + amountWithDecimals <= maxTotalSupply, "Exceeds the max total supply available");

        _mint(msg.sender, amountWithDecimals);
    }




    //free token claiming for nft holders function 
    function claim() public{
        //sender
        address sender = msg.sender;

        //num of CryptoDev NFT's the user has
        uint256 balance = CryptoDevsNFT.balanceOf(sender);
        require(balance > 0, "You dont own any Crypto Dev NFT's");
        // amount to keep track of unclaimed tokens
        uint256 amount = 0;
        //loop over balance and get the tokenId owined by sender at a particular index.
        for (uint256 i=0; i< balance; i++) {
            uint256 tokenId = CryptoDevsNFT.tokenOfOwnerByIndex(sender, i);
            if(!tokenIdsClaimed[tokenId]) {
                amount += 1;
                tokenIdsClaimed[tokenId] = true;
            }
        }
        require(amount > 0, "You have already claimed all tokens");
        _mint(sender, amount * tokensPerNFT);

    }

    // function to receive when Ether.msg.data is empty
    receive() external payable {}

    //fallback function is called when msg.data is not emptỳ
    fallback() external payable {}
}