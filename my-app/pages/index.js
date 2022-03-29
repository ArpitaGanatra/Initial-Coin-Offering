import { useState, useRef, useEffect } from 'react';
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Web3Modal from "web3modal";
import { BigNumber, Contract, providers, utils } from "ethers";
import { NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, TOKEN_CONTRACT_ADDRESS } from '../constants';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [tokensMinted, setTokensMinted] = useState(0);
  const [balanceOfCryptoDevTokens, setBalanceOfCryptoDevTokens] = useState(0);
  const [tokensToBeClaimed, setTokensToBeClaimed] = useState(0);
  const [tokenAmount, setTokenAmount] = useState(0);

  const web3ModalRef = useRef();

  const getTokensToBeClaimed = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      //get the address of currently connected metamask
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();

      //check amount of nft with the user => balance
      const balance = await nftContract.balanceOf(address);

      if(balance === 0) {
        setTokensToBeClaimed(0);
      } else {
        var amount = 0;
        for(let i=0; i<balance; i++){
          const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
          const claimed = await tokenContract.tokenIdsClaimed(tokenId);
          if(!claimed){
            amount++;
          }
        }
        setTokensToBeClaimed(BigNumber.from(amount));
      }

    } catch (error) {
      console.error(error);
    }
  }

  const getBalanceOfCryptoDevTokens = async () => {
    try {
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      // get the address of the metamask wallet connected
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();

      const balance = await tokenContract.balanceOf(address);
      setBalanceOfCryptoDevTokens(balance);
      
    } catch (error) {
      console.error(error);
    }
  }

  const mintCryptoDevToken = async (amount) => {
    try {
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );
      const value = 0.001 * amount;
      const tx = await tokenContract.mint(amount, {
        value: utils.parseEther(value.toString()),
      });
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("Sucessfully minted Crypto Dev Tokens");
      await getBalanceOfCryptoDevTokens();
      await getTotalTokensMinted();
      await getTokensToBeClaimed();
    } catch (error) {
      console.error(error);
    }
  }

  const claimCryptoDevTokens = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );
      const tx = await tokenContract.claim();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("Sucessfully claimed Crypto Dev Tokens");
      await getBalanceOfCryptoDevTokens();
      await getTotalTokensMinted();
      await getTokensToBeClaimed();
    } catch (error) {
      console.error(error);
    }
  }

  const getTotalTokensMinted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      const _tokenMinted = await tokenContract.totalSupply();
      setTokensMinted(_tokenMinted);
    } catch (error) {
      console.error(error);
    }
  }

  const getProviderOrSigner = async (needSigner=false) => {
    //connect to metamask
    const provider = await web3ModalRef.current.connect();

    //wrap the provider in web3 provider of ether
    const web3Provider = new providers.Web3Provider(provider);
    
    //check if user is connected to rinkeby
    const {chainId} = await web3Provider.getNetwork();

    if(chainId !== 4){
      window.alert("Change the network to rinkeby");
      // throw an error so that the code doesn't run further
      throw new Error("Change the network to rinkeby");
    }

    // if needSigner is true
    if(needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  }

  const connectWallet = async() => {
    try {
      // Get the provider from web3modal
      //in this case, metamask
      //prompt the user to connect wallet, when user opens website for the first time
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if(!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      getTotalTokensMinted();
      getBalanceOfCryptoDevTokens();
      getTokensToBeClaimed();
    }
  },[walletConnected])

  const renderButton = () => {
    if (loading) {
      return (
        <div>
          <button className={styles.button}>Loading...</button>
        </div>
      );
    }
    if(tokensToBeClaimed > 0) {
      return(
        <div>
          <div className={styles.description}>
            {tokensToBeClaimed * 10} Tokens to be claimed.
          </div>
          <button className={styles.button} onClick={claimCryptoDevTokens}>
            Claim Tokens
          </button>
        </div>
      )
    }
    return (
      <div style={{ display: "flex-col" }}>
        <div>
          <input
            type="number"
            placeholder='Amount of Tokens'
            className={styles.input}
            onChange={e => setTokenAmount(BigNumber.from(e.target.value))}
          />
          <button
          className={styles.button}
          disabled={!(tokenAmount > 0)}
          onClick={() => mintCryptoDevToken(tokenAmount)}
        >
          Mint Tokens
        </button>
        </div>
      </div>
    )
  }

  return (
    <div>
    <Head>
      <title>Crypto Devs</title>
      <meta name="description" content="ICO-Dapp" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <div className={styles.main}>
      <div>
        <h1 className={styles.title}>Welcome to Crypto Devs ICO!</h1>
        <div className={styles.description}>
          You can claim or mint Crypto Dev tokens here
        </div>
        {walletConnected ? (
          <div>
            <div className={styles.description}>
              {/* Format Ether helps us in converting a BigNumber to string */}
              You have minted {utils.formatEther(balanceOfCryptoDevTokens)} Crypto
              Dev Tokens
            </div>
            <div className={styles.description}>
              {/* Format Ether helps us in converting a BigNumber to string */}
              Overall {utils.formatEther(tokensMinted)}/10000 have been minted!!!
            </div>
            {renderButton()}
          </div>
        ) : (
          <button onClick={connectWallet} className={styles.button}>
            Connect your wallet
          </button>
        )}
      </div>
      <div>
        <img className={styles.image} src="./0.svg" />
      </div>
    </div>

    <footer className={styles.footer}>
      Made with &#10084; by Crypto Devs
    </footer>
  </div>
  )
}
