import React, { useState } from 'react';
import * as ChessPageUtils from './utils/ChessPageUtils';
import { ChessEnum } from './utils/ChessPageConstants';

const ChessPiece = ({ piece, color, isDraggable }) => {
  if (!ChessPageUtils.isValidPiece(piece)) return null;
  return (
    <img
      className="chess-piece"
      draggable={isDraggable}
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
  const [hoveredTile, setHoveredTile] = useState(null);

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
          {pieces.map((_, col) => {
            // get info about this tile
            const currentTile = [row, col];
            const [name, color] = ChessPageUtils.getPieceFromXY(
              ...currentTile,
              boardState
            );
            const isActive =
              activeTile &&
              ChessPageUtils.isActiveTile(
                activeTile,
                currentTile,
                availableMoves
              );
            const isHovered =
              hoveredTile &&
              ChessPageUtils.isActiveTile(hoveredTile, currentTile, []);
            const isDraggable =
              (isWhiteMove && color === ChessEnum.LIGHT) ||
              (!isWhiteMove && color === ChessEnum.DARK);

            // define handlers for this tile
            const clickHandler = () => {
              activeTile
                ? ChessPageUtils.movePiece(activeTile, currentTile, props)
                : ChessPageUtils.choosePiece(currentTile, props);
            };
            const dragStartHandler = () => {
              ChessPageUtils.choosePiece(currentTile, props);
            };
            const dragEnterHandler = () => {
              setHoveredTile(currentTile);
            };
            const dragEndHandler = () => {
              if (activeTile && hoveredTile) {
                ChessPageUtils.movePiece(activeTile, hoveredTile, props);
                setHoveredTile(null);
              }
            };

            // check if checkmated
            if (name === ChessEnum.KING) {
              if (ChessPageUtils.isInCheck(color, boardState)) {
                const checkmate = ChessPageUtils.isCheckMate(color, boardState);
                console.log('checking if checkmated: ', checkmate);
              }
            }

            // render actual tile
            return (
              <div
                key={col}
                className={ChessPageUtils.getTileColor(currentTile)}
                onClick={clickHandler}
                onDragStart={dragStartHandler}
                onDragEnter={dragEnterHandler}
                onDragEnd={dragEndHandler}
                onDragOver={(e) => e.preventDefault()}
              >
                {isActive && <div className="active"></div>}
                {isHovered && <div className="hovered"></div>}
                <ChessPiece
                  piece={name}
                  color={color}
                  isDraggable={isDraggable}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Board;
