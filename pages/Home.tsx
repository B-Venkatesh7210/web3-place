import React, { useState, useEffect, useContext } from "react";
import Navbar from "../components/Navbar";
import Context from "../context";
import { useAccount, useSigner } from "wagmi";
import contractConfig from "../contractConfig";
import { ethers } from "ethers";
import { BigNumber } from "ethers";
import moment from "moment";
import { ICanvasData, ISquareData } from "../utils/types";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getEllipsisTxt } from "../utils/formatters";
import Button from "../components/Button";
import ClientOnly from "./clientOnly";
import Countdown from "react-countdown";
import Square from "../components/Square";
import SelectedSquare from "../components/SelectedSquare";

const Home = () => {
  const [currCanvas, setCurrCanvas] = useState<ICanvasData>();
  const [selectedSquares, setSelectedSquares] = useState<ISquareData[]>([]);
  const [selectedSquareInputs, setSelectedSquareInputs] = useState<ISquareData[]>([])
  const [allSquares, setAllSquares] = useState<ISquareData[]>();
  const [isLive, setIsLive] = useState<boolean>(false);
  const [deadline, setDeadline] = useState<number>();
  const [selectedDate, setSelectedDate] = useState<Date>(null);
  const [buttonCheck, setButtonCheck] = useState<boolean>(false);
  const context: any = useContext(Context);
  const { data: signer, isError, isLoading } = useSigner();
  const { address, isConnected } = useAccount();

  useEffect(() => {
    context.setSigner(signer);
    const getContractData = async () => {
      const contractEthers = new ethers.Contract(
        contractConfig.address,
        contractConfig.abi,
        signer
      );
      context.setContractEthers(contractEthers);
      const isLive: boolean = await contractEthers.isLive();
      setIsLive(isLive);
      context.setIsLive(isLive);
      const canvasIdBig = await contractEthers.canvasId();
      const canvasId: number = canvasIdBig.toNumber() - 1;
      if (canvasId >= 0 && isLive) {
        const canvas = await contractEthers.idToCanvas(canvasId);
        console.log(canvas);
        const currCanvas: ICanvasData = {
          canvasId: BigNumber.from(canvas.canvasId),
          isLive: canvas.isLive,
          startTime: moment(
            new Date(canvas.startTime.toNumber() * 1000)
          ).format("LL"),
          deadline: moment(new Date(canvas.deadline.toNumber() * 1000)).format(
            "LL"
          ),
          canvasBalance: BigNumber.from(canvas.canvasBalance),
          painters: canvas.painters,
          host: canvas.host,
          prizeWinners: canvas.prizeWinners,
          prizeAmount: BigNumber.from(canvas.prizeAmount),
        };
        setCurrCanvas(currCanvas);
        context.setCanvas(currCanvas);
        console.log(currCanvas);
        const squares = await contractEthers.getAllSquares(canvasId);
        context.setSquares(squares);
        setAllSquares(squares);
        console.log(squares);
      }
    };
    if (signer) {
      getContractData();
    }
  }, [signer]);

  const minDate: Date = new Date();
  minDate.setDate(minDate.getDate() + 7);

  const maxDate: Date = new Date();
  maxDate.setDate(maxDate.getDate() + 28);

  const createCanvas = async () => {
    console.log("Clicked");
    const txn = await context.contractEthers.createCanvas(deadline);
    await txn.wait();
  };

  function dateToTimestamp(date: Date) {
    return Math.floor(date.getTime() / 1000);
  }

  return (
    <div>
      <ClientOnly>
        <Navbar></Navbar>
        <div className="flex flex-col justify-start items-center h-[70vh] w-full">
          {isLive ? (
            <div className="flex flex-row justify-start items-center w-full h-full">
              <div className="h-full w-[20%] bg-rose-400"></div>
              <div className="h-full flex flex-row justify-start items-start w-[80%] mx-[2rem]">
                <div className="w-[25%] h-full flex flex-col justify-start items-start px-4 py-2">
                  <div className="justify-center items-end">
                    <span className="font-guava text-[1rem]">Canvas Id : </span>
                    <span className="font-gunplay text-[1.2rem] ml-2">
                      {currCanvas?.canvasId.toNumber()}
                    </span>
                  </div>
                  <span className="font-guava text-[1.5rem] mt-2">Started</span>
                  <span className="font-gunplay text-[1.5rem]">
                    {currCanvas?.startTime}
                  </span>
                  <span className="font-guava text-[1.5rem] mt-2">
                    Deadline
                  </span>
                  {currCanvas?.deadline && (
                    <Countdown
                      className="font-gunplay text-[1.5rem]"
                      date={moment(currCanvas?.deadline, "LL")
                        .toDate()
                        .getTime()}
                    ></Countdown>
                  )}
                  <span className="font-guava text-[1.5rem] mt-2">Host</span>
                  <span className="font-gunplay text-[1.5rem]">
                    {getEllipsisTxt(currCanvas?.host)}
                  </span>
                  <span className="font-guava text-[1.5rem] mt-2">Pot</span>
                  <span className="font-gunplay text-[1.5rem]">
                    {parseFloat(currCanvas?.canvasBalance.toString()) /
                      10 ** 18}
                  </span>
                </div>

                {/* <div className="absolute w-[60rem] h-[50rem] bg-slate-800 -z-50"> */}
                {/* <div className="absolute right-[12rem] top-[14rem] top w-[32rem]"> */}
                <div className="w-[32rem] overflow-x-visible overflow-y-visible">
                  <div className="bg-red-600grid grid-flow-row columns-[40] rows-[40] gap-0">
                    {allSquares?.map((square: ISquareData, index: number) => (
                      <Square
                        key={square.id.toNumber()}
                        square={square}
                        selectedSquares={selectedSquares}
                        setSelectedSquares={setSelectedSquares}
                      ></Square>
                    ))}
                  </div>
                </div>
                {/* </div> */}
                {/* </div> */}
                <div className="flex flex-col justify-between items-center h-full w-full">
                  <div className="flex flex-col justify-start items-center overflow-y-auto overflow-x-hidden h-[80%]">
                    {selectedSquares.map((selectedSquare) => {
                      return (
                        <SelectedSquare key={selectedSquare.id.toNumber()} selectedSquare={selectedSquare}></SelectedSquare>
                      );
                    })}
                  </div>
                  <div>
                    <Button
                      h="h-[3.5rem]"
                      w="w-[14rem]"
                      size="text-[1.5rem]"
                      label="Create Canvas"
                      action={() => {}}
                      disabled={false}
                    ></Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-start items-center w-[40%]">
              <span className="text-[3rem] textCyan font-guava">
                No Canvas Live
              </span>
              <span className="text-[1.2rem] font-gunplay text-center mt-8">
                The Canvas has a total of 1600 squares, only one Canvas can be
                alive at one time. Create a Canvas by selecting a deadline and{" "}
              </span>
              <form className="flex flex-col justify-start items-start mt-6">
                <div className="flex flex-row justify-start items-center">
                  <span className="text-[2rem] textCyan font-guava">Host</span>
                  <span className="text-[2rem] font-gunplay ml-8">
                    {address ? getEllipsisTxt(address) : "Connect Wallet"}
                  </span>
                </div>
                <div className="flex flex-row justify-start items-center">
                  <span className="text-[2rem] textCyan font-guava">
                    Deadline
                  </span>
                  <DatePicker
                    className="ml-8 text-gunplay"
                    selected={selectedDate}
                    onChange={(date) => {
                      setSelectedDate(date);
                      setButtonCheck(true);
                      setDeadline(dateToTimestamp(date));
                      console.log(date);
                    }}
                    minDate={minDate}
                    maxDate={maxDate}
                    dateFormat="dd/MM/yyyy"
                    placeholderText=" Select a date"
                  />
                </div>
                <button
                  type="submit"
                  className="flex flex-row justify-center items-center w-full mt-4"
                >
                  <Button
                    h="h-[3.5rem]"
                    w="w-[14rem]"
                    size="text-[1.5rem]"
                    label="Create Canvas"
                    action={(e: any) => {
                      e.preventDefault();
                      createCanvas();
                    }}
                    disabled={!(buttonCheck && isConnected)}
                  ></Button>
                </button>
              </form>
            </div>
          )}
        </div>
      </ClientOnly>
    </div>
  );
};

export default Home;
