import React, { useState } from "react";
import { ISquareCompData } from "../utils/types";
import { getEllipsisTxt } from "../utils/formatters";

const Square: React.FC<ISquareCompData> = ({
  key,
  square,
  selectedSquares,
  setSelectedSquares,
}) => {
  const [isSelected, setIsSelected] = useState<boolean>(false);

  return (
    <div
      key={key}
      className={`group w-[0.8rem] h-[0.8rem] hover:opacity-95 border-black border-[1px] cursor-pointer ${
        isSelected && "square border-[3px]"
      }`}
      style={{
        background:
          square.color == "" ? "#D9D9D9" : isSelected ? "black" : square.color,
      }}
      onClick={() => {
        setIsSelected(!isSelected);
        if (!isSelected) {
          setSelectedSquares([
            ...selectedSquares,
            {
              id: square.id,
              color: square.color,
              price: square.price,
              painter: square.painter,
            },
          ]);
        } else if (isSelected) {
          setSelectedSquares(
            selectedSquares.filter(
              (arraySquare) => arraySquare.id !== square.id
            )
          );
        }
      }}
    >
      <div
        className="hidden group-hover:block w-[10rem] h-[6rem] rounded-[0_1rem_1rem_1rem] border-2 border-black bg-[#FFFFFF]"
        style={{ overflow: "visible" }}
      >
        {square.color == "" ? (
          <div className="w-full h-full flex flex-row justify-center items-center text-[1rem] font-bold">
            Paint Now
          </div>
        ) : (
          <div className="flex flex-col justify-start items-start p-2">
            <div className="flex flex-row justify-center items-baseline">
              <span className="text-[0.8rem] font-bold">color :</span>
              <span className="text-[1rem] font-bold ml-2">{square.color}</span>
              <div
                className="w-[0.8rem] h-[0.8rem] ml-2 border-black border-[1px]"
                style={{ background: square.color }}
              ></div>
            </div>
            <div className="flex flex-row justify-center items-baseline">
              <span className="text-[0.8rem] font-bold">price :</span>
              <span className="text-[1rem] font-bold ml-2">
                {parseFloat(square?.price.toString()) / 10 ** 18}
              </span>
            </div>
            <div className="flex flex-row justify-center items-baseline">
              <span className="text-[0.8rem] font-bold">address :</span>
              <span className="text-[1rem] font-bold ml-2">
                {getEllipsisTxt(square.painter, 3)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Square;
