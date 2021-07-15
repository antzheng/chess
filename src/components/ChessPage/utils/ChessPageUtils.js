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

// given a coordinate, returns name, color, and if piece was unmoved
const getPieceFromXY = (x, y, board) => {
  if (board[x][y] === null) return [null, null, null];
  return board[x][y].split('-');
};

// given piece name, check if valid piece
const isValidPiece = (piece) => {
  return piece !== null && Object.values(ChessEnum).includes(piece);
};

// given a board, flips it
const flipBoard = (board) => {
  const flipped = board.map((row) => [...row]);
  flipped.reverse();
  flipped.forEach((row) => row.reverse());
  return flipped;
};

// given start and end coords to move a piece
// return new board (flipped)
const generateNewBoard = (startX, startY, endX, endY, board) => {
  const copy = board.map((row) => [...row]);

  // check enpassant
  const [endPiece] = getPieceFromXY(endX, endY, copy);
  if (endPiece === 'enpassant') copy[endX + 1][endY] = null;

  // get rid of unmoved flag if there
  const [startPiece, startColor] = getPieceFromXY(startX, startY, board);

  copy[endX][endY] = startPiece + '-' + startColor;
  copy[startX][startY] = null;
  copy.reverse();
  copy.forEach((row) => row.reverse());

  // clear invalid pieces, reinforce empty tiles
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const [piece] = getPieceFromXY(i, j, copy);
      if (!isValidPiece(piece)) copy[i][j] = null;
    }
  }
  return copy;
};

/*
if can't move:
  if more than 1 checking: checkmate
  if can't take and can't block: checkmate
*/
// given a color and the board
// and assuming the king is in check
// return whether or not this is checkmate
const isCheckMate = (color, board) => {
  // find the king and opposing pieces
  let kingCoords = null;
  const opposing = [];
  const supporting = [];
  const flipped = flipBoard(board);
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const [targetPiece, targetColor] = getPieceFromXY(i, j, board);

      // skip blank tiles
      if (!isValidPiece(targetPiece)) continue;

      // determine which side this piece is on
      let side = opposing;
      let simulated = board;
      let [x, y] = [i, j];
      if (targetColor === color) {
        side = supporting;
        simulated = flipped;
        [x, y] = [SIZE - 1 - x, SIZE - 1 - y];
      }

      // add pieces
      if (targetPiece !== ChessEnum.KING) {
        side.push({
          piece: targetPiece,
          coords: [x, y],
          moves: getAvailableMoves(targetPiece, x, y, targetColor, simulated),
        });
      }
      // find our king
      else if (targetColor === color) {
        kingCoords = [i, j];
      }
    }
  }

  // check if king can move
  const possible = getAvailableMoves(
    ChessEnum.KING,
    SIZE - 1 - kingCoords[0],
    SIZE - 1 - kingCoords[1],
    color,
    flipped
  );
  if (possible.length === 0) {
    // find the pieces that threaten the king
    const threatening = [];
    opposing.forEach(({ piece, coords, moves }) => {
      // if this piece can move to where king is, it is checking the king
      if (moves.some(([x, y]) => x === kingCoords[0] && y === kingCoords[1])) {
        threatening.push({ piece, coords });
      }
    });

    // checkmate if king can't move and multiple pieces check it
    if (threatening.length > 1) return true;

    // checkmate if threatening piece can't be taken or blocked
    const canRemoveObstacle = supporting.some(({ coords, moves }) => {
      const canTakeOrBlock = moves.some(([x, y]) => {
        const newBoard = generateNewBoard(...coords, x, y, flipped);
        return !isInCheck(color, newBoard);
      });
      return canTakeOrBlock;
    });
    if (!canRemoveObstacle) return true;
  }
  return false;
};

// given a color and the board
// return if the king of that color is in check
const isInCheck = (color, board) => {
  let kingCoords = null;
  const availableMoves = [];

  // create a copy
  board = board.map((row) => [...row]);

  // iterate through whole board
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const [targetPiece, targetColor] = getPieceFromXY(i, j, board);

      // skip blank tiles
      if (!isValidPiece(targetPiece)) continue;

      // get rid of unmoved flags for check
      board[i][j] = targetPiece + '-' + targetColor;

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
  const [, setPromotionTile] = props.promotionHandler;

  // deselect if choosing same highlighted piece
  if (rowInit === rowDest && colInit === colDest) {
    setActiveTile(null);
    setAvailableMoves([]);
    return;
  }

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

    // add en passant (board is now flipped)
    if (piece === ChessEnum.PAWN && rowDest === rowInit - 2) {
      newBoard[2][SIZE - 1 - colDest] = 'enpassant-' + color;
    }

    // add castling (board is now flipped)
    if (
      piece === ChessEnum.KING &&
      [colInit - 2, colInit + 2].includes(colDest)
    ) {
      const direction = colDest < colInit ? 1 : -1;
      const rookCol = colDest < colInit ? SIZE - 1 : 0;
      newBoard[0][rookCol] = null;
      newBoard[0][SIZE - 1 - (colDest + direction)] =
        ChessEnum.ROOK + '-' + color;
    }

    // add promotion (board is now flipped)
    if (piece === ChessEnum.PAWN && rowDest === 0) {
      setActiveTile(null);
      setAvailableMoves([]);
      setBoardState(flipBoard(newBoard));
      setPromotionTile([rowDest, colDest]);
      return;
    }

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
  flipBoard,
  isActiveTile,
  isCheckMate,
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
