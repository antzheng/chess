/*
--------------------------------------------------------------------------------------
--------------------------------------- IMAGES ---------------------------------------
--------------------------------------------------------------------------------------
*/

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

export const SVGMap = {
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

/*
--------------------------------------------------------------------------------------
------------------------------------- CONSTANTS --------------------------------------
--------------------------------------------------------------------------------------
*/

export const ChessEnum = {
  ROOK: 'rook',
  KNIGHT: 'knight',
  BISHOP: 'bishop',
  QUEEN: 'queen',
  KING: 'king',
  PAWN: 'pawn',
  LIGHT: 'light',
  DARK: 'dark',
};

export const SIZE = 8;

/*
--------------------------------------------------------------------------------------
----------------------------------- DEFAULT BOARD ------------------------------------
--------------------------------------------------------------------------------------
*/

const pawnRow = Array(SIZE).fill(ChessEnum.PAWN);
const backRow = [
  ChessEnum.ROOK,
  ChessEnum.KNIGHT,
  ChessEnum.BISHOP,
  ChessEnum.QUEEN,
  ChessEnum.KING,
  ChessEnum.BISHOP,
  ChessEnum.KNIGHT,
  ChessEnum.ROOK,
];

export const DEFAULT = [
  backRow.map((pieces) => pieces + '-dark'),
  pawnRow.map((pieces) => pieces + '-dark'),
  ...Array(SIZE - 4)
    .fill()
    .map(() => Array(SIZE).fill(null)),
  pawnRow.map((pieces) => pieces + '-light'),
  backRow.map((pieces) => pieces + '-light'),
];
