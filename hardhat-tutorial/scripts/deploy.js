const {ethers} = require("hardhat")
const { CRYPTO_DEVS_NFT_CONTRACT_ADDRESS } = require("../constants")

async function main(){
    const cryptoDevsNFTContract = CRYPTO_DEVS_NFT_CONTRACT_ADDRESS;

    const cryptoDevsTokenContract = await ethers.getContractFactory("CryptoDevToken");

    const deployedCryptoDevsTokenContract = await cryptoDevsTokenContract.deploy(cryptoDevsNFTContract);

    await deployedCryptoDevsTokenContract.deployed();

    console.log("Crypto Devs Token Contract Address:", deployedCryptoDevsTokenContract.address);
    //Crypto Devs Token Contract Address: 0x1ec1eC99B6DD7911AF0dE0A12AB553f48Bb27016
    // New Crypto Devs Token Contract Address: 0x01666d002aCDB2dC807d363904eAE86068c513ca
}



main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});