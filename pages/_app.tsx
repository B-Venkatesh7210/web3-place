import "../styles/globals.css";
import React,{useEffect, useState} from "react";
import type { AppProps } from "next/app";
import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createClient, useAccount, useContract, useProvider, useSigner, WagmiConfig } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum, optimismGoerli } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import Context from "../context";
import contractConfig from "../contractConfig"
import { ethers } from "ethers";

const { chains, provider } = configureChains(
  [mainnet, polygon, optimism, arbitrum, optimismGoerli],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "My RainbowKit App",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

function MyApp({ Component, pageProps }: AppProps) {
  
  const currProvider = useProvider();
  const address = useAccount();
  const [signer, setSigner] = useState();
  const [contractEthers, setContractEthers] = useState();



  useEffect(() => {
    const settingContract = async () => {
      const contractEthers: any = new ethers.Contract(
        contractConfig.address,
        contractConfig.abi,
        signer
      );
      setContractEthers(contractEthers);
    };
    if ((signer)) {
      settingContract();
    }
  }, [currProvider, signer]);

  const contract = useContract({
    address: contractConfig.address,
    abi: contractConfig.abi,
    signerOrProvider: currProvider,
  })

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
      <Context.Provider value={{contract, contractEthers, setContractEthers, signer, setSigner}}>
        <Component {...pageProps} />
        </Context.Provider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
