import React from "react";
import { IButtonData } from "../utils/types";

const Button: React.FC<IButtonData> = ({
  h,
  w,
  label,
  size,
  disabled,
  action,
}) => {
  return (
    <div
      className={`button ${disabled ? "bg-slate-400" : "bg-[#d0d408]  "} flex flex-row justify-center items-center font-guava cursor-pointer ${w} ${h} ${size}`}
      onClick={!disabled ? action : (e: any)=>{e.preventDefault()}}
    >
      {label}
    </div>
  );
};

export default Button;
