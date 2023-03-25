import { BigNumber } from "ethers";

export interface IContractConfig {
  address: string;
  abi: any[];
}

export interface ICanvasData {
  canvasId: BigNumber;
  isLive: boolean;
  startTime: string;
  deadline: string;
  canvasBalance: BigNumber;
  painters: string[];
  host: string;
  prizeWinners: string[];
  prizeAmount: BigNumber;
}

export interface ISquareData {
  id: BigNumber;
  color: string;
  price: BigNumber;
  painter: string;
}

export interface IButtonData {
  h: string;
  w: string;
  label: string;
  size: string;
  disabled: boolean;
  action: any;
}

export interface ITimerData {
  deadline: number;
}

export interface ISquareCompData {
  key: number;
  square: ISquareData;
  selectedSquares: ISquareData[];
  setSelectedSquares: any;
}

export interface ISelectedSquare {
  key: number;
  selectedSquare: ISquareData;
}
