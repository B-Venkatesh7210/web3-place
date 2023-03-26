import React, { useState, useEffect } from "react";
import { ISelectedSquare, ISquareData } from "../utils/types";
import { SketchPicker } from "react-color";
import ColorizeIcon from "@mui/icons-material/Colorize";
import { BigNumber, ethers } from "ethers";
import { useAccount, useSigner } from "wagmi";


const SelectedSquare: React.FC<ISelectedSquare> = ({
  key1,
  selectedSquares,
  selectedSquare,
  setSelectedSquares,
  allCheck,
}) => {
  const [colorPicker, setColorPicker] = useState<boolean>(false);
  const [color, setColor] = useState<string>(selectedSquare.color);
    // selectedSquare.color == "" ? "#FFFFFF" : selectedSquare.color

  const [price, setPrice] = useState<BigNumber>(BigNumber.from(0));
  const [prevPrice, setPrevPrice] = useState<BigNumber>(selectedSquare.price);
  const { address, isConnected } = useAccount();


  function handleChangeComplete(selectedColor: any) {
    let arr = selectedSquares;
    arr[key1] = {
      id: selectedSquare.id,
      color: selectedColor.hex,
      price: price,
      painter: address,
    };
    setColor(selectedColor.hex);
    setSelectedSquares(arr);
    allCheck();
  }

  function handleChangePrice(e: any) {
    let arr = selectedSquares;
    let priceBig = BigNumber.from((e * 10 ** 18).toFixed(0));
    arr[key1] = {
      id: selectedSquare.id,
      color: color,
      price: priceBig,
      painter: address,
    };
    setPrice(priceBig);
    setSelectedSquares(arr);
    allCheck();
  }

  return (
    <div className="w-[18rem] h-[10rem] flex-shrink-0 rounded-xl bg-cyan2 border-black border-2 flex flex-col justify-start items-start py-2 px-4 mb-4">
      <span className="flex flex-row justify-start items-end w-full">
        <span className="text-[1.2rem] font-bold">Id :</span>
        <span className="text-[1.2rem] font-bold ml-2">#{selectedSquare.id.toString()}</span>
      </span>
      <span className="flex flex-row justify-start items-end w-full">
        <span className="text-[1.2rem] font-bold">Color :</span>
        <span className="h-[1.6rem] w-[30%] ml-4 bg-white">{color !== "" ? color : "#FFFFFF"}</span>
        <div
          className="w-[1.5rem] h-[1.5rem] border-black border-2 ml-2"
          style={{
            background: color !== "" ? color : "#FFFFFF",
          }}
        ></div>
      </span>
      <ColorizeIcon
        className="cursor-pointer"
        onClick={() => {
          setColorPicker(!colorPicker);
        }}
      ></ColorizeIcon>
      {colorPicker && (
        <SketchPicker
          className="z-50"
          color={"#FFFFFF"}
          onChangeComplete={handleChangeComplete}
        />
      )}
      <span className="flex flex-row justify-start items-end w-full">
        <span className="text-[1.2rem] font-bold">Price :</span>
        <input
          type="number"
          min="0"
          step="1"
          className="w-[60%] ml-4"
          onChange={(e) => {
            handleChangePrice(e.target.value);
          }}
        ></input>
      </span>
      {price.lte(prevPrice) && (
        <span className="text-[0.8rem] font text-red-700 mt-2">
          *Price should be greater than {ethers.utils.formatEther(prevPrice)}
        </span>
      )}
    </div>
  );
};

export default SelectedSquare;
