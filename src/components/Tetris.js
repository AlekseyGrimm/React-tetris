import React, { useState } from 'react';

import { createStage, checkCollision } from '../gameHelpers';
import { StyledTetrisWrapper, StyledTetris } from './styles/StyledTetris';
import { FullScreen, useFullScreenHandle } from "react-full-screen";

// Custom Hooks
import { useInterval } from '../useInterval';
import { usePlayer } from '../hooks/usePlayer';
import { useStage } from '../hooks/useStage';
import { useGameStatus } from '../hooks/useGameStatus';

// Components
import Stage from './Stage';
import Display from './Display';
import StartButton from './StartButton';
import AudioControl from './Audio/AudioControl';
import full from './styles/full.css'
import score from './styles/score.css'

const Tetris = () => {
  const [dropTime, setDropTime] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  const [player, updatePlayerPos, resetPlayer, playerRotate] = usePlayer();
  const [stage, setStage, rowsCleared] = useStage(player, resetPlayer);
  const [score, setScore, rows, setRows, level, setLevel] = useGameStatus(
    rowsCleared
  );

  const handle = useFullScreenHandle();

  const movePlayer = dir => {
    if (!checkCollision(player, stage, { x: dir, y: 0 })) {
      updatePlayerPos({ x: dir, y: 0 });
    }
  };

  const keyUp = ({ keyCode }) => {
    if (!gameOver) {
      // Activate the interval again when user releases down arrow.
      if (keyCode === 40) {
        setDropTime(1000 / (level + 1));
      }
    }
  };

  let bestScores = JSON.parse(localStorage.getItem("score")) || [];

  function getLocalStore() {
    bestScores.push(score);
    bestScores.sort((a, b) => b - a);
    bestScores.splice(10);
    let uniqueArray = bestScores.filter(function (item, pos) {
      return bestScores.indexOf(item) == pos;
    });
    localStorage.setItem("score", JSON.stringify(uniqueArray));
  }


  getLocalStore();
  let scores = JSON.parse(localStorage.getItem("score"));
  let i = 0;
  let tenScore = scores.map((score) => {
    return (
      <div key={i++}>
        <li>{score}</li>
      </div>
    );
  });

  const startGame = () => {
    // Reset everything
    setStage(createStage());
    setDropTime(1000);
    resetPlayer();
    setScore(0);
    setLevel(0);
    setRows(0);
    setGameOver(false);
  };

  const drop = () => {
    // Increase level when player has cleared 10 rows
    if (rows > (level + 1) * 10) {
      setLevel(prev => prev + 1);
      // Also increase speed
      setDropTime(1000 / (level + 1) + 200);
    }

    if (!checkCollision(player, stage, { x: 0, y: 1 })) {
      updatePlayerPos({ x: 0, y: 1, collided: false });
    } else {
      // Game over!
      if (player.pos.y < 1) {
        setGameOver(true);
        setDropTime(null);
      }
      updatePlayerPos({ x: 0, y: 0, collided: true });
    }
  };

  const dropPlayer = () => {
    // We don't need to run the interval when we use the arrow down to
    // move the tetromino downwards. So deactivate it for now.
    setDropTime(null);
    drop();
  };

  // This one starts the game
  // Custom hook by Dan Abramov
  useInterval(() => {
    drop();
  }, dropTime);

  const move = ({ keyCode }) => {
    if (!gameOver) {
      if (keyCode === 37) {
        movePlayer(-1);
      } else if (keyCode === 39) {
        movePlayer(1);
      } else if (keyCode === 40) {
        dropPlayer();
      } else if (keyCode === 38) {
        playerRotate(stage, 1);
      }
    }
  };

  return (

    <FullScreen handle={handle}>
      <StyledTetrisWrapper
        role="button"
        tabIndex="0"
        onKeyDown={e => move(e)}
        onKeyUp={keyUp}
      >
        <StyledTetris>
          <Stage stage={stage} />
          <aside>
            {gameOver ? (
              <Display gameOver={gameOver} text="Game Over" />
            ) : (
                <div>
                  <Display text={`Score: ${score}`} />
                  <Display text={`rows: ${rows}`} />
                  <Display text={`Level: ${level}`} />
                </div>
              )}
            <StartButton callback={startGame} />
            <div>
              <AudioControl />
              <button className='full' onClick={handle.enter}>FullScreen</button>
              <div className='score'>Best Scores:{tenScore}</div>
            </div>
          </aside>
        </StyledTetris>
      </StyledTetrisWrapper>
    </ FullScreen>
  );
};

export default Tetris;