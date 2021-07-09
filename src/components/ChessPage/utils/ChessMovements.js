/*
--------------------------------------------------------------------------------------
-------------------------------------- IMPORTS ---------------------------------------
--------------------------------------------------------------------------------------
*/

import {
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
const getAvailableMoves = (piece, row, col, color, board, initial = true) => {
  const moveHandler = {
    bishop: availableBishopMoves,
    king: availableKingMoves,
    knight: availableKnightMoves,
    pawn: availablePawnMoves,
    queen: availableQueenMoves,
    rook: availableRookMoves,
  };
  return moveHandler[piece](row, col, color, board, initial);
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

  // see if any of the moves will put the king in check
  for (const [x, y] of possible) {
    const newBoard = generateNewBoard(row, col, x, y, board);
    if (isInCheck(color, newBoard)) return [];
  }

  // return possible moves
  return possible;
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
  if (notMoved) forward.push([row + 2 * direction, col]);
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

  // see if any of the moves will put the king in check
  for (const [x, y] of possible) {
    const newBoard = generateNewBoard(row, col, x, y, board);
    if (isInCheck(color, newBoard)) return [];
  }

  // return possible moves
  return possible;
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
const availableKingMoves = (row, col, color, board, initial) => {
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
    false,
    initial
  );
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
