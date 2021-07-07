// import all svgs
import bishopDark from './../../../styles/assets/images/bishop-dark.svg';
import kingDark from './../../../styles/assets/images/king-dark.svg';
import knightDark from './../../../styles/assets/images/knight-dark.svg';
import pawnDark from './../../../styles/assets/images/pawn-dark.svg';
import queenDark from './../../../styles/assets/images/queen-dark.svg';
import rookDark from './../../../styles/assets/images/rook-dark.svg';
import bishopLight from './../../../styles/assets/images/bishop-light.svg';
import kingLight from './../../../styles/assets/images/king-light.svg';
import knightLight from './../../../styles/assets/images/knight-light.svg';
import pawnLight from './../../../styles/assets/images/pawn-light.svg';
import queenLight from './../../../styles/assets/images/queen-light.svg';
import rookLight from './../../../styles/assets/images/rook-light.svg';

// define intermediate variables for this file
const backRow = [
  'rook',
  'knight',
  'bishop',
  'queen',
  'king',
  'bishop',
  'knight',
  'rook',
];

const pawnRow = Array(8).fill('pawn');

const pieces = {
  bishopDark,
  kingDark,
  knightDark,
  pawnDark,
  queenDark,
  rookDark,
  bishopLight,
  kingLight,
  knightLight,
  pawnLight,
  queenLight,
  rookLight,
};

// -------------------------- EXPORTS --------------------------

const isOutOfBounds = (row, col) => {
  return row < 0 || row >= 8 || col < 0 || col >= 8;
};

export const isValidPiece = (piece) => {
  return (
    piece !== null && [...backRow, ...pawnRow].includes(piece.split('-')[0])
  );
};

// default board layout
export const DEFAULT = [
  backRow.map((pieces) => pieces + '-dark'),
  pawnRow.map((pieces) => pieces + '-dark'),
  ...Array(4)
    .fill()
    .map(() => Array(8).fill(null)),
  pawnRow.map((pieces) => pieces + '-light'),
  backRow.map((pieces) => pieces + '-light'),
];

// get tile color
export const getTileColor = ([row, col]) => {
  const name = 'tile';
  const color = (row + col) % 2 ? 'tile-dark' : 'tile-light';
  return `${name} ${color}`;
};

// get whether or not this tile is active
export const isActiveTile = (
  [activeRow, activeCol],
  [row, col],
  availableMoves
) => {
  return (
    (row === activeRow && col === activeCol) ||
    availableMoves.some(([x, y]) => x === row && y === col)
  );
};

// get image source for pieces
export const getImageSrc = (piece, color) => {
  const key = piece + color.charAt(0).toUpperCase() + color.slice(1);
  return pieces[key];
};

// get available moves for any piece (wrapper)
const getAvailableMoves = (piece, row, col, color, board) => {
  switch (piece) {
    case 'bishop':
      return availableBishopMoves(row, col, color, board);
    case 'king':
      return availableKingMoves(row, col, color, board);
    case 'knight':
      return [];
    case 'pawn':
      return availablePawnMoves(row, col, color, board);
    case 'queen':
      return availableQueenMoves(row, col, color, board);
    case 'rook':
      return availableRookMoves(row, col, color, board);
    default:
      return [];
  }
};

// select a piece to move if possible
export const choosePiece = ([row, col], props) => {
  // destructuring
  const board = props.boardHandler[0];
  const isWhiteMove = props.turnHandler[0];
  const setActiveTile = props.activeHandler[1];
  const setAvailableMoves = props.previewHandler[1];

  // if no piece at this location, stop
  if (!isValidPiece(board[row][col])) return;

  // if user selects one of their pieces, make it active
  const [piece, color] = board[row][col].split('-');
  const targetColor = isWhiteMove ? 'light' : 'dark';
  if (color === targetColor) {
    setActiveTile([row, col]);
    setAvailableMoves(getAvailableMoves(piece, row, col, color, board));
  }
};

// move pieces according to individual logic
export const movePiece = ([rowInit, colInit], [rowDest, colDest], props) => {
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

  // get movable piece's name + color
  const [piece, color] = boardState[rowInit][colInit].split('-');

  // get available moves for this piece
  const availableMoves = getAvailableMoves(
    piece,
    rowInit,
    colInit,
    color,
    boardState
  );

  // if clicked spot is available, move there
  if (availableMoves.some(([x, y]) => x === rowDest && y === colDest)) {
    // change a copy of the board
    const copy = boardState.map((row) => [...row]);
    copy[rowDest][colDest] = copy[rowInit][colInit];
    copy[rowInit][colInit] = null;

    // invert copy for next player
    copy.reverse();
    copy.forEach((row) => row.reverse());

    // change state
    setActiveTile(null);
    setAvailableMoves([]);
    setBoardState(copy);
    setIsWhiteMove(!isWhiteMove);
  }
};

// a pawn can move:
// - forward twice at the start
// - forward once normally
// - diagonally to take
// - TODO: enpassant (diagonal if opponent pawn moved forward twice)
// - TODO: promotion
const availablePawnMoves = (row, col, color, board) => {
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
    if (board[x][y] === null) return;

    // if color is opposite, it means available
    const targetColor = board[x][y].split('-')[1];
    if (targetColor !== color) possible.push([x, y]);
  });

  // handle forward
  const forward = [[row + direction, col]];
  if (notMoved) forward.push([row + 2 * direction, col]);
  forward.forEach(([x, y]) => {
    if (!isOutOfBounds(x, y) && !isValidPiece(board[x][y]))
      possible.push([x, y]);
  });

  // return possible moves
  return possible;
};

// bishops can move diagonally
const availableBishopMoves = (row, col, color, board) => {
  // possible moves
  const possible = [];

  // go through all four diag directions
  [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ].forEach(([dx, dy]) => {
    for (let i = 1; i < 8; i++) {
      const [x, y] = [row + dx * i, col + dy * i];

      // stop when out of bounds
      if (isOutOfBounds(x, y)) return;

      // add if not blocked
      if (!isValidPiece(board[x][y])) {
        possible.push([x, y]);
      }
      // stop when blocked
      else {
        const targetColor = board[x][y].split('-')[1];
        if (targetColor !== color) possible.push([x, y]);
        return;
      }
    }
  });

  // return possible moves
  return possible;
};

// rooks can move vertically + horizontally
const availableRookMoves = (row, col, color, board) => {
  // possible moves
  const possible = [];

  // go through all four directions
  [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ].forEach(([dx, dy]) => {
    for (let i = 1; i < 8; i++) {
      const [x, y] = [row + dx * i, col + dy * i];

      // stop when out of bounds
      if (isOutOfBounds(x, y)) return;

      // add if not blocked
      if (!isValidPiece(board[x][y])) {
        possible.push([x, y]);
      }
      // stop when blocked
      else {
        const targetColor = board[x][y].split('-')[1];
        if (targetColor !== color) possible.push([x, y]);
        return;
      }
    }
  });

  // return possible moves
  return possible;
};

// queen can do bishop + rook moves
const availableQueenMoves = (row, col, color, board) => {
  // possible moves
  const possible = [];

  // go through all eight directions
  [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ].forEach(([dx, dy]) => {
    for (let i = 1; i < 8; i++) {
      const [x, y] = [row + dx * i, col + dy * i];

      // stop when out of bounds
      if (isOutOfBounds(x, y)) return;

      // add if not blocked
      if (!isValidPiece(board[x][y])) {
        possible.push([x, y]);
      }
      // stop when blocked
      else {
        const targetColor = board[x][y].split('-')[1];
        if (targetColor !== color) possible.push([x, y]);
        return;
      }
    }
  });

  // return possible moves
  return possible;
};

// king moves around in all directions
const availableKingMoves = (row, col, color, board) => {
  // possible moves
  const possible = [];

  // go through all eight directions
  [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ].forEach(([dx, dy]) => {
    const [x, y] = [row + dx, col + dy];

    // can't be out of bounds
    if (isOutOfBounds(x, y)) return;

    // add if not blocked
    if (!isValidPiece(board[x][y])) {
      possible.push([x, y]);
    }
    // stop when blocked
    else {
      const targetColor = board[x][y].split('-')[1];
      if (targetColor !== color) possible.push([x, y]);
    }
  });

  // return possible moves
  return possible;
};
