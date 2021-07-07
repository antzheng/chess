import React, { useState } from 'react';
import * as ChessPageUtils from './utils/ChessPageUtils';

const ChessPiece = ({ name }) => {
  if (!ChessPageUtils.isValidPiece(name)) return null;
  const [piece, color] = name.split('-');
  return (
    <img
      className="chess-piece"
      src={ChessPageUtils.getImageSrc(piece, color)}
      alt="chess piece"
    />
  );
};

const Board = () => {
  const [isWhiteMove, setIsWhiteMove] = useState(true);
  const [boardState, setBoardState] = useState(ChessPageUtils.DEFAULT);
  const [activeTile, setActiveTile] = useState(null);
  const [availableMoves, setAvailableMoves] = useState([]);

  const props = {
    turnHandler: [isWhiteMove, setIsWhiteMove],
    boardHandler: [boardState, setBoardState],
    activeHandler: [activeTile, setActiveTile],
    previewHandler: [availableMoves, setAvailableMoves],
  };

  return (
    <div className="board">
      <div className="turn-text">
        <span>{isWhiteMove ? 'WHITE' : 'BLACK'}</span> to move!
      </div>

      {boardState.map((pieces, row) => (
        <div key={row} className="board-row">
          {pieces.map((piece, col) => {
            // define variables and handlers
            const currentTile = [row, col];
            const clickHandler = () => {
              activeTile
                ? ChessPageUtils.movePiece(activeTile, currentTile, props)
                : ChessPageUtils.choosePiece(currentTile, props);
            };

            // render actual tile
            return (
              <div
                key={col}
                className={ChessPageUtils.getTileColor(currentTile)}
                onClick={clickHandler}
              >
                {activeTile &&
                  ChessPageUtils.isActiveTile(
                    activeTile,
                    currentTile,
                    availableMoves
                  ) && <div className="active"></div>}
                <ChessPiece name={piece} />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Board;
