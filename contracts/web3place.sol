// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Counters.sol";

//optimism goerli address = 0xa1f6018492897903085af7192a8bB8feD9333F7B

contract web3Place is ERC721Enumerable, Ownable {
    uint256 constant square_size = 1600;
    uint256 public default_price = 1 ether;
    uint256 public canvasId;

    // using Counters for Counters.Counter;
    // Counters.Counter private _tokenIds;

    // struct NftMetaData{
    //     string image;
    // }

    struct Square {
        uint256 id;
        string color; // the index of the color (0 means no color)
        uint256 price; // the current price to paint the square
        address painter; // the address of the last user who painted the square
    }

    struct Canvas {
        uint256 canvasId;
        bool isLive;
        uint256 startTime;
        uint256 deadline;
        uint256 canvasBalance;
        address[] painters;
        address host;
        address[] prizeWinners;
        uint256 prizeAmount;
        mapping(uint256=>Square) idToSquare;
    }

    struct CanvasReturn {
        uint256 canvasId;
        bool isLive;
        uint256 startTime;
        uint256 deadline;
        uint256 canvasBalance;
        address[] painters;
        address host;
        address[] prizeWinners;
        uint256 prizeAmount;
    }

    bool public isLive;
    uint256 public donationBalance;

    mapping(uint256=>Canvas) public idToCanvas;
    mapping(address=>mapping(uint256=>int256)) public userToSquares;
    // mapping(uint256=> mapping(address => NftMetaData)) private _tokenMetadata;

    constructor() payable ERC721("Web3Place", "WEP") {}

    function createCanvas(uint256 _deadline) public {
        require(!isLive, "Canvas already created");
        //The deadline should be between 1 week and 1 month
        require(_deadline - block.timestamp >= 604800  && _deadline - block.timestamp <= 2419200 , "The deadline should be greater than 1 week and less than 1 month");  
        require(_deadline>block.timestamp, "The time is not of future");
        Canvas storage currCanvas = idToCanvas[canvasId];
        address[] memory empty;
        currCanvas.canvasId = canvasId;
        currCanvas.isLive = true;
        currCanvas.startTime = block.timestamp;
        currCanvas.deadline = _deadline;
        currCanvas.painters = empty;
        currCanvas.host = msg.sender;
        currCanvas.prizeWinners = empty;
        currCanvas.prizeAmount = 0;
        isLive = true;
        canvasId++;
    }

    function _paint(Canvas storage _currCanvas, uint256 _squareId, string memory _color, uint256 _price, address _painter) internal {
        _currCanvas.idToSquare[_squareId].id = _squareId;
        _currCanvas.idToSquare[_squareId].color = _color;
        _currCanvas.idToSquare[_squareId].price = _price;
        userToSquares[_currCanvas.idToSquare[_squareId].painter][_currCanvas.canvasId]--;
        _currCanvas.idToSquare[_squareId].painter = _painter;
        userToSquares[_painter][_currCanvas.canvasId]++;
    }

    function _check(address _address, address[] memory _arrayOfAddress) internal pure returns (bool) {
        bool addressExists = false;

        for (uint i = 0; i < _arrayOfAddress.length; i++) {
            if (_arrayOfAddress[i] == _address) {
                addressExists = true;
                break;
            }
        }

        return addressExists;
    }

    function paintMultiple(uint256 _canvasId, uint256[] memory _squareIds, string[] memory _colors, uint256[] memory _prices) external payable {
        uint256 _priceSum = 0;
        for(uint256 i=0; i<_prices.length; i++){
            _priceSum += _prices[i];
        }
        Canvas storage currCanvas = idToCanvas[_canvasId];
        require(isLive, "No canvas is Live");
        require(currCanvas.isLive, "No canvas is Live");
        require(msg.value >= _priceSum, "Insufficient Price Sum");
        require(_squareIds.length == _colors.length && _colors.length == _prices.length, "Array length of Input is not same");
        require(block.timestamp<=currCanvas.deadline, "Time is over");
        for(uint256 i=0; i<_squareIds.length; i++){
            require(_squareIds[i]>=0 && _squareIds[i]<square_size, "Square Id doesnot exist");
            require(_prices[i]>currCanvas.idToSquare[_squareIds[i]].price, "Insufficent amount");
            if(!_check(msg.sender, currCanvas.painters)){
                currCanvas.painters.push(msg.sender);
            }
            _paint(currCanvas, _squareIds[i], _colors[i], _prices[i], msg.sender);
        }
        donationBalance += msg.value - _priceSum;
        currCanvas.canvasBalance += _priceSum;
    }

    function getTimeStamp() public view returns(uint256) {
        return block.timestamp;
    }

    function getSquareData(uint256 _canvasId, uint256 _squareId) public view returns(Square memory) {
        Canvas storage currCanvas = idToCanvas[_canvasId];
        return currCanvas.idToSquare[_squareId];
    }

    function getAllCanvas() public view returns(CanvasReturn[] memory) {
        CanvasReturn[] memory allCanvas = new CanvasReturn[](canvasId);
        for(uint256 i=0; i<canvasId; i++){
            Canvas storage currCanvas = idToCanvas[i];
            allCanvas[i].canvasId = currCanvas.canvasId;
            allCanvas[i].isLive = currCanvas.isLive;
            allCanvas[i].startTime = currCanvas.startTime;
            allCanvas[i].deadline = currCanvas.deadline;
            allCanvas[i].canvasBalance = currCanvas.canvasBalance;
            allCanvas[i].painters = currCanvas.painters;
            allCanvas[i].host = currCanvas.host;
            allCanvas[i].prizeWinners = currCanvas.prizeWinners;
            allCanvas[i].prizeAmount = currCanvas.prizeAmount;
        }

        return allCanvas;
    }

    function getAllSquares(uint256 _canvasId) public view returns(Square[] memory) {
        Square[] memory allSquares = new Square[](square_size);
        for(uint256 i=0; i<square_size; i++){
            Canvas storage currCanvas = idToCanvas[_canvasId];
            allSquares[i] = currCanvas.idToSquare[i];
        }
        return allSquares;
    }

    function _max(uint256 _canvasId) internal view returns(address[] memory winners){
       int256 max = 0;
    uint256 numWinners = 0;
    Canvas storage currCanvas = idToCanvas[_canvasId];
    address[] memory tempWinners = new address[](currCanvas.painters.length);
    for (uint256 i = 0; i < currCanvas.painters.length; i++) {
        int256 numSquares = userToSquares[currCanvas.painters[i]][currCanvas.canvasId];
        if (numSquares > max) {
            max = numSquares;
            tempWinners[0] = currCanvas.painters[i];
            numWinners = 1;
        } else if (numSquares == max) {
            tempWinners[numWinners] = currCanvas.painters[i];
            numWinners++;
        }
    }
    winners = new address[](numWinners);
    for (uint256 i = 0; i < numWinners; i++) {
        winners[i] = tempWinners[i];
    }
    }

    function endCanvas(uint256 _canvasId) public payable {
        Canvas storage currCanvas = idToCanvas[_canvasId];
        require(isLive, "The canvas is not live");
        require(currCanvas.isLive, "The canvas is not live");
        require(block.timestamp>=currCanvas.deadline, "The time is not over");
        require(currCanvas.canvasBalance>0, "Insufficient Canvas Balance");
        uint256 prizeAmountRatio = (currCanvas.canvasBalance * 8) / 10;
        require(prizeAmountRatio>0, "Prize amount is too low");
        require(address(this).balance>=prizeAmountRatio, "Contract Balance is not enough");
        address[] memory winners = _max(_canvasId);
        uint256 numWinners = winners.length;
        uint256 prizeAmount = prizeAmountRatio/numWinners;
        currCanvas.prizeWinners = winners;
        currCanvas.prizeAmount = prizeAmount;
        for(uint256 i=0; i<numWinners; i++)
        {
             
            address winner = payable(winners[i]);
        (bool success, ) = winner.call{value: prizeAmount}("");
        require(success, "Transfer Failed");
        // _tokenIds.increment();
        //      uint256 newItemId = _tokenIds.current();
        //      _mint(winner, newItemId);
        //       _tokenMetadata[newItemId][winner] = NftMetaData({
        //     image: image
        // });
        }
        isLive = false;
        currCanvas.isLive = false;
    }
}