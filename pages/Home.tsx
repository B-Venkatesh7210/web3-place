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
import { useRouter } from "next/router";
import Modal from "react-modal";
import Image from "next/image";
import Logo from "../assets/logos/Logo.png";
import LogoText from "../assets/logos/LogoText.png";
import { useNetwork } from "wagmi";

const Home = () => {
  const router = useRouter();

  const [currCanvas, setCurrCanvas] = useState<ICanvasData>();
  const [selectedSquares, setSelectedSquares] = useState<ISquareData[]>([]);
  const [allSquares, setAllSquares] = useState<ISquareData[]>();
  const [isLive, setIsLive] = useState<boolean>(false);
  const [deadline, setDeadline] = useState<number>();
  const [selectedDate, setSelectedDate] = useState<Date>(null);
  const [buttonCheck, setButtonCheck] = useState<boolean>(false);
  const context: any = useContext(Context);
  const { data: signer, isError, isLoading } = useSigner();
  const { chain, chains } = useNetwork();
  const { address, isConnected } = useAccount();
  const [allCheckStatus, setAllCheckStatus] = useState<boolean>(false);
  const [yourSquares, setYourSquares] = useState<string>("0");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    context.setSigner(signer);
    const getContractData = async () => {
      setLoading(true);
      const contractEthers = new ethers.Contract(
        contractConfig.address,
        contractConfig.abi,
        signer
      );
      context.setContractEthers(contractEthers);
      const isLive: boolean = await contractEthers.isLive();
      console.log(isLive);
      setIsLive(isLive);
      context.setIsLive(isLive);
      const canvasIdBig = await contractEthers.canvasId();
      const canvasId: number = canvasIdBig.toNumber() - 1;
      if (canvasId >= 0 && isLive) {
        const canvas = await contractEthers.idToCanvas(canvasId);
        console.log(canvas);
        context.setEndTime(canvas.deadline.toNumber());
        const yourSquares: BigNumber = await contractEthers.userToSquares(
          address,
          BigNumber.from(canvasId)
        );
        console.log(yourSquares);
        setYourSquares(yourSquares.toString());
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
      setLoading(false);
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
    setLoading(true);
    console.log("Clicked");
    const txn = await context.contractEthers.createCanvas(deadline);
    await txn.wait();
    router.reload();
    setLoading(false);
  };

  const paintCanvas = async () => {
    setLoading(true);
    let squareIdArr: BigNumber[] = [];
    let colorArr: string[] = [];
    let priceBigArr: BigNumber[] = [];
    let priceBigSum: BigNumber = BigNumber.from(0);
    for (let i = 0; i < selectedSquares.length; i++) {
      squareIdArr.push(selectedSquares[i].id);
      colorArr.push(selectedSquares[i].color);
      priceBigArr.push(selectedSquares[i].price);
      priceBigSum = priceBigSum.add(selectedSquares[i].price);
    }

    console.log(
      context.canvas.canvasId,
      squareIdArr,
      colorArr,
      priceBigArr,
      priceBigSum.toString()
    );
    const txn = await context.contractEthers.paintMultiple(
      context.canvas.canvasId,
      squareIdArr,
      colorArr,
      priceBigArr,
      {
        from: address,
        value: priceBigSum,
      }
    );
    await txn.wait();
    router.reload();
    setLoading(false);
  };

  const endCanvas = async () => {
    setLoading(true);
    const txn = await context.contractEthers.endCanvas(context.canvas.canvasId);
    await txn.wait();
    router.reload();
    setLoading(false);
  };

  function dateToTimestamp(date: Date) {
    return Math.floor(date.getTime() / 1000);
  }

  function allCheck() {
    let _allCheck = false;
    for (let i = 0; i < selectedSquares.length; i++) {
      if (
        selectedSquares[i].color != "" &&
        selectedSquares[i].price.gt(
          allSquares[selectedSquares[i].id.toNumber()].price
        )
      ) {
        _allCheck = true;
      } else {
        _allCheck = false;
        break;
      }
    }
    setAllCheckStatus(_allCheck);
  }

  return (
    <div>
      <ClientOnly>
        <Modal
          className="z-50 h-screen w-screen flex flex-row justify-center items-center"
          style={{
            overlay: {
              backgroundColor: "rgb(228, 179, 229, 0.45)",
              backdropFilter: "blur(8px)",
            },
          }}
          isOpen={loading}
        >
          <Image alt="logo" src={Logo} height={80} className="mb-4"></Image>
          <Image
            alt="logo"
            src={LogoText}
            height={120}
            className="ml-8"
          ></Image>
        </Modal>
        <Navbar></Navbar>
        <div className="flex flex-col justify-start items-center h-[70vh] w-full">
          {isLive ? (
            <div className="flex flex-row justify-start items-center w-full h-full">
              <div className="h-auto w-[20%] rounded-xl bg-cyan2 border-black border-2 flex flex-col justify-start items-start py-4 px-6 ml-4 font-guava">
                <span className="font-gunplay text-[1.2rem]">Welcome Note</span>
                <br></br>
                Hey, welcome to Web3 place, paint the canvas by selecting the
                squares and rule the world of web3 place. Remember the more
                squares you paint, the greater is your chance to win bounty from
                the total canvas pot.
                <br></br>
                Only one Canvas can be live at a time.
                <br></br>
                You can only end the canvas after the deadline is over.
                <br></br>
                <span className="text-[1.5rem] mt-4">Enjoy Playing!!</span>
              </div>
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
                  <div className="flex flex-row justify-evenly items-center text-[0.8rem] w-[65%] font-gunplay">
                    <span>Days</span>
                    <span>Mon</span>
                    <span>Min</span>
                    <span>Sec</span>
                  </div>
                  <span className="font-guava text-[1.5rem] mt-2">Host</span>
                  <span className="font-gunplay text-[1.5rem]">
                    {getEllipsisTxt(currCanvas?.host)}
                  </span>
                  <span className="font-guava text-[1.5rem] mt-2">Pot</span>
                  <div className="flex flex-row justify-start items-end">
                    <span className="font-gunplay text-[1.5rem]">
                      {ethers.utils.formatEther(
                        currCanvas
                          ? currCanvas.canvasBalance
                          : BigNumber.from(0)
                      )}
                    </span>
                    <span className="font-guava text-[1.5rem] ml-4">ETH</span>
                  </div>

                  <span className="font-guava text-[1.5rem] mt-2">
                    Your Squares
                  </span>
                  <span className="font-gunplay text-[1.5rem]">
                    {yourSquares}
                  </span>
                </div>
                <div className="w-[32rem]">
                  <div
                    className="w-[32rem] grid grid-flow-row gap-0"
                    style={{
                      gridTemplateColumns: "repeat(40, minmax(0, 1fr))",
                    }}
                  >
                    {allSquares?.map((square: ISquareData, index: number) => (
                      <Square
                        key={index}
                        key1={index}
                        square={square}
                        selectedSquares={selectedSquares}
                        setSelectedSquares={setSelectedSquares}
                        setAllCheckStatus={setAllCheckStatus}
                      ></Square>
                    ))}
                  </div>
                </div>

                {/* </div> */}
                {/* </div> */}
                <div className="flex flex-col justify-between items-center h-full w-full">
                  <div className="flex flex-col justify-start items-center overflow-y-auto overflow-x-hidden h-[80%]">
                    {selectedSquares.map(
                      (selectedSquare: ISquareData, index: number) => {
                        return (
                          <SelectedSquare
                            key={index}
                            key1={index}
                            selectedSquares={selectedSquares}
                            selectedSquare={selectedSquare}
                            setSelectedSquares={setSelectedSquares}
                            allCheck={allCheck}
                          ></SelectedSquare>
                        );
                      }
                    )}
                  </div>
                  <div>
                    <Button
                      h="h-[3.5rem]"
                      w="w-[14rem]"
                      size="text-[1.5rem]"
                      label="Paint Canvas"
                      action={() => {
                        paintCanvas();
                      }}
                      disabled={!allCheckStatus}
                    ></Button>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-4 left-[45%]">
                <Button
                  h="h-[3rem]"
                  w="w-[14rem]"
                  size="text-[1.4rem]"
                  label="End Canvas"
                  action={() => {
                    endCanvas();
                  }}
                  disabled={
                    !(isLive &&
                    parseInt((Date.now() / 1000).toString()) > context.endTime)
                  }
                ></Button>
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
