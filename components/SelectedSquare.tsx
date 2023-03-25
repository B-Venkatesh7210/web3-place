import React, { useState } from "react";
import { ISelectedSquare } from "../utils/types";
import { SketchPicker } from "react-color";
import ColorizeIcon from "@mui/icons-material/Colorize";

const SelectedSquare: React.FC<ISelectedSquare> = ({ key, selectedSquare }) => {
  const [colorPicker, setColorPicker] = useState<boolean>(false);
  const [color, setColor] = useState("#ffffff");

  return (
    <div
      key={key}
      className="w-[18rem] h-[10rem] flex-shrink-0 rounded-xl bg-cyan2 border-black border-2 flex flex-col justify-start items-start p-4 mb-4"
    >
      <span className="flex flex-row justify-start items-end w-full">
        <span className="text-[1.2rem] font-bold">Color :</span>
        <span className="h-[1.6rem] w-[60%] ml-4 bg-slate-300">{selectedSquare.color}</span>
      </span>
      <ColorizeIcon
        className="cursor-pointer"
        onClick={() => {
          setColorPicker(!colorPicker);
        }}
      ></ColorizeIcon>
      {colorPicker && (
        <SketchPicker color={"#FFFFFF"} onChangeComplete={() => {}} />
      )}
    </div>
  );
};

export default SelectedSquare;
