/*
--------------------------------------------------------------------------------------
-------------------------------------- IMPORTS ---------------------------------------
--------------------------------------------------------------------------------------
*/

import { SIZE } from './ChessPageConstants';
import {
  flipBoard,
  isInCheck,
  isOutOfBounds,
  isValidPiece,
  generateNewBoard,
  getPieceFromXY,
} from './ChessPageUtils';

/*
--------------------------------------------------------------------------------------
------------------------------------ GENERALIZED -------------------------------------
--------------------------------------------------------------------------------------
*/

// given a piece, position, color, and the board
// return an array of coordinates representing available moves
const getAvailableMoves = (
  piece,
  row,
  col,
  color,
  board,
  initial = true,
  checkCastle = true
) => {
  const moveHandler = {
    bishop: availableBishopMoves,
    king: availableKingMoves,
    knight: availableKnightMoves,
    pawn: availablePawnMoves,
    queen: availableQueenMoves,
    rook: availableRookMoves,
  };
  return moveHandler[piece](row, col, color, board, initial, checkCastle);
};

// given directions, a starting position, the color, and the board,
// return a list of possible moves for this piece
const generatePossibleMoves = (
  directions,
  row,
  col,
  color,
  board,
  expand,
  initial
) => {
  // possible moves
  const possible = [];

  // number of moves before stopping
  const upperBound = expand ? 8 : 2;

  // expand in each direction until hit piece or bounds
  directions.forEach(([dx, dy]) => {
    for (let i = 1; i < upperBound; i++) {
      const [x, y] = [row + dx * i, col + dy * i];

      // stop when out of bounds
      if (isOutOfBounds(x, y)) return;

      const [piece, targetColor] = getPieceFromXY(x, y, board);
      const isBlocked = isValidPiece(piece);

      // stop when blocked
      if (isBlocked) {
        if (targetColor !== color) possible.push([x, y]);
        return;
      }
      possible.push([x, y]);
    }
  });

  // prevent recursively checking
  if (!initial) return possible;

  // filter out all moves that would expose king to check
  return possible.filter(([x, y]) => {
    const newBoard = generateNewBoard(row, col, x, y, board);
    return !isInCheck(color, newBoard);
  });
};

/*
--------------------------------------------------------------------------------------
-------------------------------------- SPECIFIC --------------------------------------
--------------------------------------------------------------------------------------
*/

// a pawn can move:
// - forward twice at the start
// - forward once normally
// - diagonally to take
// - TODO: enpassant (diagonal if opponent pawn moved forward twice)
// - TODO: promotion
const availablePawnMoves = (row, col, color, board, initial) => {
  // possible moves
  const possible = [];

  // determine if still at beginning
  const notMoved = row === 6;

  // moving up (decreasing row index)
  const direction = -1;

  // handle diags
  [
    [row + direction, col - 1],
    [row + direction, col + 1],
  ].forEach(([x, y]) => {
    // if out of bounds or empty, skip
    if (isOutOfBounds(x, y)) return;

    // if no pieces, can't move diagonally
    const [targetPiece, targetColor] = getPieceFromXY(x, y, board);
    if (targetPiece === null) return;

    // if color is opposite, it means available
    if (targetColor !== color) possible.push([x, y]);
  });

  // handle forward
  const forward = [[row + direction, col]];

  // can move twice if not moved and not blocked
  if (notMoved) {
    const [piece] = getPieceFromXY(...forward[0], board);
    const blocked = isValidPiece(piece);
    if (!blocked) forward.push([row + 2 * direction, col]);
  }

  // filter valid moves
  forward.forEach(([x, y]) => {
    // if out of bounds or empty, skip
    if (isOutOfBounds(x, y)) return;

    // if there is a piece, it is blocked
    const [targetPiece] = getPieceFromXY(x, y, board);
    if (targetPiece !== null) return;

    // if not blocked, add
    possible.push([x, y]);
  });

  // prevent recursively checking
  if (!initial) return possible;

  // filter out all moves that would expose king to check
  return possible.filter(([x, y]) => {
    const newBoard = generateNewBoard(row, col, x, y, board);
    return !isInCheck(color, newBoard);
  });
};

// bishops can move diagonally
const availableBishopMoves = (row, col, color, board, initial) => {
  const directions = [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ];
  return generatePossibleMoves(
    directions,
    row,
    col,
    color,
    board,
    true,
    initial
  );
};

// rooks can move vertically + horizontally
const availableRookMoves = (row, col, color, board, initial) => {
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  return generatePossibleMoves(
    directions,
    row,
    col,
    color,
    board,
    true,
    initial
  );
};

// queen can do bishop + rook moves
const availableQueenMoves = (row, col, color, board, initial) => {
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ];
  return generatePossibleMoves(
    directions,
    row,
    col,
    color,
    board,
    true,
    initial
  );
};

// king moves around in all directions
const availableKingMoves = (
  row,
  col,
  color,
  board,
  initial,
  checkCastle = true
) => {
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ];
  const possible = generatePossibleMoves(
    directions,
    row,
    col,
    color,
    board,
    false,
    initial
  );

  // deal with castling
  const [, , kingUnmoved] = getPieceFromXY(row, col, board);

  // generate simulated board
  const flipped = flipBoard(board);

  if (checkCastle && kingUnmoved && !isInCheck(color, flipped)) {
    if (isValidCastlePosition(row, col, board, true, flipped))
      possible.push([row, col - 2]);
    if (isValidCastlePosition(row, col, board, false, flipped))
      possible.push([row, col + 2]);
  }

  return possible;
};

const isValidCastlePosition = (row, col, board, isLeftSide, flipped) => {
  const rookCol = isLeftSide ? 0 : SIZE - 1;
  const [, color, unmoved] = getPieceFromXY(row, rookCol, board);

  // if rook is moved, can't castle this way
  if (!unmoved) return false;

  // define directions
  const direction = isLeftSide ? -1 : 1;
  const once = [row, col + direction];
  const twice = [row, col + 2 * direction];

  // spots must be empty
  const occupied = [once, twice].some(([x, y]) => {
    const [piece] = getPieceFromXY(x, y, board);
    return isValidPiece(piece);
  });
  if (occupied) return false;

  // can't move through check
  const availableMoves = [];
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const [targetPiece, targetColor] = getPieceFromXY(i, j, flipped);

      // skip blank tiles
      if (!isValidPiece(targetPiece)) continue;

      // check opponent moves
      if (color !== targetColor) {
        availableMoves.push(
          ...getAvailableMoves(
            targetPiece,
            i,
            j,
            targetColor,
            flipped,
            false,
            false
          )
        );
      }
    }
  }

  // check if spots are in check
  const spotInCheck = availableMoves.some(([x, y]) => {
    x = SIZE - 1 - x;
    y = SIZE - 1 - y;
    return (
      (x === once[0] && y === once[1]) || (x === twice[0] && y === twice[1])
    );
  });

  // can castle if spots aren't in check
  return !spotInCheck;
};

// knight moves in an L
const availableKnightMoves = (row, col, color, board, initial) => {
  const directions = [
    [-2, -1],
    [-2, 1],
    [-1, -2],
    [-1, 2],
    [1, -2],
    [1, 2],
    [2, -1],
    [2, 1],
  ];
  return generatePossibleMoves(
    directions,
    row,
    col,
    color,
    board,
    false,
    initial
  );
};

/*
--------------------------------------------------------------------------------------
-------------------------------------- EXPORTS ---------------------------------------
--------------------------------------------------------------------------------------
*/

export { getAvailableMoves };
