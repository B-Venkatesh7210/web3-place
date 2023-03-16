import React, {useEffect, useState, useContext} from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Context from '../context';
import { useSigner } from 'wagmi';
import { BigNumber } from 'ethers';
import contractConfig from '../contractConfig';
import { ethers } from 'ethers';

const Home = () => {

  const context: any = useContext(Context);
  const { data: signer, isError, isLoading } = useSigner();
  const [canvasSize, setCanvasSize] = useState<number>(0)

  useEffect(() => {
    context.setSigner(signer)
    const getCanvasSize = async() =>{
      const contractEthers = new ethers.Contract(
        contractConfig.address,
        contractConfig.abi,
        signer
      );
      context.setContractEthers(contractEthers);
      const canvasSizeBig = await contractEthers.canvas_size();
      const canvasSize = canvasSizeBig.toNumber();
      setCanvasSize(canvasSize);
    }
    if(signer){
      getCanvasSize();
    }
    
  }, [signer])
  

  return (
    <div>
      <ConnectButton></ConnectButton>
      {canvasSize}
      <div className='bg-gray-200 m-2 grid grid-cols-10'>
        {

        }
      </div>
    </div>
  )
}

export default Home