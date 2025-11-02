import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import indernormal from '../components/normalpicinder.png'
import { 
  startGame, 
  jump, 
  updateBird, 
  spawnPipe, 
  updatePipes 
} from '../store/gameSlice';
import './Birdflipflap.css';

const BirdFlipFlap = () => {
  const dispatch = useDispatch();
  const {
    gameStarted,
    gameOver,
    score,
    highScore,
    birdPosition,
    pipes
  } = useSelector(state => state.game);
  
  const gameLoopRef = useRef(null);
  const lastTimeRef = useRef(0);

  // Handle game start
  const handleStartGame = () => {
    if (!gameStarted || gameOver) {
      dispatch(startGame());
    } else {
      dispatch(jump());
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        handleStartGame();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [gameStarted, gameOver]);

  // Game loop
  useEffect(() => {
    const gameLoop = (currentTime) => {
      if (!gameStarted || gameOver) return;

      // Update bird
      dispatch(updateBird());

      // Update pipes
      dispatch(updatePipes());

      // Spawn new pipes
      if (currentTime - lastTimeRef.current > 2000) {
        dispatch(spawnPipe({ currentTime }));
        lastTimeRef.current = currentTime;
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    if (gameStarted && !gameOver) {
      lastTimeRef.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameStarted, gameOver, dispatch]);

  return (
    <div className="game-container">
      <h1>Bird Flip Flap</h1>
      
      <div 
        className="game-area"
        onClick={handleStartGame}
        // tabIndex="0"
      >
        {/* Bird */}
        <div 
          className={`bird ${gameStarted && !gameOver ? 'flapping' : ''}`}
          style={{ top: `${birdPosition}px` }}
        ></div>
        
        {/* Pipes */}
        {pipes.map((pipe) => (
          <React.Fragment key={pipe.id}>
            <img 
              className="pipe top-pipe"
              src={indernormal}
              style={{
                left: `${pipe.x}px`,
                height: `${pipe.topHeight}px`
              }}
            ></img>
            <img
              src={indernormal}
              className="pipe bottom-pipe"
              style={{
                left: `${pipe.x}px`,
                height: `${pipe.bottomHeight}px`,
                bottom: '0'
              }}
            ></img>
          </React.Fragment>
        ))}
        
        {/* Game messages */}
        {!gameStarted && !gameOver && (
          <div className="message start-message">
            <h2>Click or Press Space to Start</h2>
            <p>Keep the bird flying through the pipes!</p>
          </div>
        )}
        
        {gameOver && (
          <div className="message game-over-message">
            <h2>Game Over!</h2>
            <p>Score: {score}</p>
            <p>High Score: {highScore}</p>
            <button onClick={handleStartGame}>Play Again</button>
          </div>
        )}
        
        {/* Score display */}
        {(gameStarted || gameOver) && (
          <div className="score-display">
            Score: {score}
          </div>
        )}
      </div>
      
      <div className="instructions">
        <p>Click or press SPACE to make the bird flap and avoid the pipes!</p>
        <p>High Score: {highScore}</p>
      </div>
    </div>
  );
};

export default BirdFlipFlap;