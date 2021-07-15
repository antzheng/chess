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

const PromotionModal = ({ color, promotionClickHandler }) => {
  return (
    <div className="mask">
      <div className="promotion-modal">
        {[
          ChessEnum.QUEEN,
          ChessEnum.KNIGHT,
          ChessEnum.ROOK,
          ChessEnum.BISHOP,
        ].map((piece) => (
          <div
            className="modal-tile"
            onClick={() => promotionClickHandler(piece, color)}
          >
            <img
              className="modal-pieces"
              draggable={false}
              src={ChessPageUtils.getImageSrc(piece, color)}
              alt="chess piece"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const Board = () => {
  const [isWhiteMove, setIsWhiteMove] = useState(true);
  const [boardState, setBoardState] = useState(ChessPageUtils.DEFAULT);
  const [activeTile, setActiveTile] = useState(null);
  const [availableMoves, setAvailableMoves] = useState([]);
  const [hoveredTile, setHoveredTile] = useState(null);
  const [isCheck, setIsCheck] = useState(false);
  const [isCheckMate, setIsCheckMate] = useState(false);
  const [promotionTile, setPromotionTile] = useState(null); // CHANGE THIS

  const props = {
    turnHandler: [isWhiteMove, setIsWhiteMove],
    boardHandler: [boardState, setBoardState],
    activeHandler: [activeTile, setActiveTile],
    previewHandler: [availableMoves, setAvailableMoves],
    promotionHandler: [promotionTile, setPromotionTile],
  };

  let text = (
    <div className="turn-text">
      {isCheck && <span style={{ color: 'red' }}>CHECK: </span>}
      <span className="highlight">{isWhiteMove ? 'WHITE' : 'BLACK'}</span> to
      move!
    </div>
  );

  if (isCheckMate)
    text = (
      <div className="turn-text">
        <span style={{ color: 'CornflowerBlue' }}>
          {isWhiteMove ? 'BLACK' : 'WHITE'} WINS!
        </span>
      </div>
    );

  const promotionClickHandler = (piece, color) => {
    const [x, y] = promotionTile;
    const copy = boardState.map((row) => [...row]);
    copy[x][y] = piece + '-' + color;

    // change state
    setPromotionTile(null);
    setBoardState(ChessPageUtils.flipBoard(copy));
    setIsWhiteMove(!isWhiteMove);
  };

  return (
    <div className="board">
      {text}
      {promotionTile && (
        <PromotionModal
          color={isWhiteMove ? ChessEnum.LIGHT : ChessEnum.DARK}
          promotionClickHandler={promotionClickHandler}
        />
      )}
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

            // check if our king is checkmated
            if (!isCheckMate && name === ChessEnum.KING && isDraggable) {
              // must flip board for this
              const flipped = ChessPageUtils.flipBoard(boardState);

              // check with flipped board
              if (ChessPageUtils.isInCheck(color, flipped)) {
                const checkmate = ChessPageUtils.isCheckMate(color, flipped);
                if (checkmate) {
                  if (!isCheckMate) setIsCheckMate(true);
                } else {
                  if (!isCheck) setIsCheck(true);
                }
              }
              // not check
              else {
                if (isCheck) setIsCheck(false);
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
