/*
--------------------------------------------------------------------------------------
-------------------------------------- IMPORTS ---------------------------------------
--------------------------------------------------------------------------------------
*/

import { SVGMap, ChessEnum, DEFAULT, SIZE } from './ChessPageConstants';
import { getAvailableMoves } from './ChessMovements';

/*
--------------------------------------------------------------------------------------
-------------------------------------- UTILITY ---------------------------------------
--------------------------------------------------------------------------------------
*/

// given a coordinate, returns whether it is out of bounds
const isOutOfBounds = (row, col) => {
  return row < 0 || row >= SIZE || col < 0 || col >= SIZE;
};

// given a coordinate, returns name and color of the piece there
const getPieceFromXY = (x, y, board) => {
  if (board[x][y] === null) return [null, null];
  return board[x][y].split('-');
};

// given piece name, check if valid piece
const isValidPiece = (piece) => {
  return piece !== null && Object.values(ChessEnum).includes(piece);
};

// given start and end coords to move a piece
// return new board (flipped)
const generateNewBoard = (startX, startY, endX, endY, board) => {
  const copy = board.map((row) => [...row]);
  copy[endX][endY] = copy[startX][startY];
  copy[startX][startY] = null;
  copy.reverse();
  copy.forEach((row) => row.reverse());
  return copy;
};

/*
if can't move:
  if more than 1 checking: checkmate
  if can't take and can't block: checkmate
*/

// given a color and the board
// return if the king of that color is in check
const isInCheck = (color, board) => {
  let kingCoords = null;
  const availableMoves = [];

  // iterate through whole board
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const [targetPiece, targetColor] = getPieceFromXY(i, j, board);

      // skip blank tiles
      if (!isValidPiece(targetPiece)) continue;

      // check opponent moves
      if (color !== targetColor) {
        availableMoves.push(
          ...getAvailableMoves(targetPiece, i, j, targetColor, board, false)
        );
      }
      // check for our king's position
      else if (targetPiece === ChessEnum.KING) {
        kingCoords = [i, j];
      }
    }
  }
  return availableMoves.some(
    ([x, y]) => x === kingCoords[0] && y === kingCoords[1]
  );
};

/*
--------------------------------------------------------------------------------------
------------------------------------ UI HELPERS --------------------------------------
--------------------------------------------------------------------------------------
*/

// given a coordinate, return the classname for tile color
const getTileColor = ([row, col]) => {
  const name = 'tile';
  const color = (row + col) % 2 ? 'tile-dark' : 'tile-light';
  return `${name} ${color}`;
};

// given active piece coordinates, current coordinates, and available moves
// return whether this tile should be highlighted
const isActiveTile = ([activeRow, activeCol], [row, col], availableMoves) => {
  return (
    (row === activeRow && col === activeCol) ||
    availableMoves.some(([x, y]) => x === row && y === col)
  );
};

// given piece name and color, return the src for associated svg
const getImageSrc = (piece, color) => {
  const key = piece + color.charAt(0).toUpperCase() + color.slice(1);
  return SVGMap[key];
};

/*
--------------------------------------------------------------------------------------
---------------------------------- MOVEMENT LOGIC ------------------------------------
--------------------------------------------------------------------------------------
*/

// given coordinates, select piece if possible
const choosePiece = ([row, col], props) => {
  // destructuring
  const [board] = props.boardHandler;
  const [isWhiteMove] = props.turnHandler;
  const [, setActiveTile] = props.activeHandler;
  const [, setAvailableMoves] = props.previewHandler;
  const [piece, color] = getPieceFromXY(row, col, board);

  // if no piece at this location, stop
  if (!isValidPiece(piece)) {
    setActiveTile(null);
    setAvailableMoves([]);
    return;
  }

  // if user selects one of their pieces, make it active
  const targetColor = isWhiteMove ? ChessEnum.LIGHT : ChessEnum.DARK;
  if (color === targetColor) {
    setActiveTile([row, col]);
    setAvailableMoves(getAvailableMoves(piece, row, col, color, board));
  }
};

// given coordinates, try to move piece if possible
const movePiece = ([rowInit, colInit], [rowDest, colDest], props) => {
  // destructuring
  const [isWhiteMove, setIsWhiteMove] = props.turnHandler;
  const [boardState, setBoardState] = props.boardHandler;
  const [, setActiveTile] = props.activeHandler;
  const [, setAvailableMoves] = props.previewHandler;

  // deselect if choosing same highlighted piece
  if (rowInit === rowDest && colInit === colDest) {
    setActiveTile(null);
    setAvailableMoves([]);
    return;
  }

  // TODO: check if moving this piece puts us in check

  // check if valid move for this piece
  const [piece, color] = getPieceFromXY(rowInit, colInit, boardState);
  const availableMoves = getAvailableMoves(
    piece,
    rowInit,
    colInit,
    color,
    boardState
  );
  const isValidMove = availableMoves.some(
    ([x, y]) => x === rowDest && y === colDest
  );

  // if valid, change board, else deselect
  if (isValidMove) {
    // get new updated board
    const newBoard = generateNewBoard(
      rowInit,
      colInit,
      rowDest,
      colDest,
      boardState
    );

    // change state
    setActiveTile(null);
    setAvailableMoves([]);
    setBoardState(newBoard);
    setIsWhiteMove(!isWhiteMove);
  } else {
    choosePiece([rowDest, colDest], props);
  }
};

/*
--------------------------------------------------------------------------------------
-------------------------------------- EXPORTS ---------------------------------------
--------------------------------------------------------------------------------------
*/

export {
  // CONSTANTS
  ChessEnum,
  DEFAULT,
  // FUNCTIONS
  isActiveTile,
  isInCheck,
  isOutOfBounds,
  isValidPiece,
  getImageSrc,
  getPieceFromXY,
  getTileColor,
  generateNewBoard,
  // MOVEMENT
  choosePiece,
  movePiece,
};
