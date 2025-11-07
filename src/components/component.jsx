import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import indernormal from '../components/images-removebg-preview.png'
import { 
  startGame, 
  jump, 
  updateBird, 
  spawnPipe, 
  updatePipes 
} from '../store/gameSlice';
import './Birdflipflap.css';

// Import your game over sound
import gameOverSound from '../components/akali.mp3';

const BirdFlipFlap = () => {
  const [prevTopClass, setPrevTopClass] = useState("pipe");
  const [prevBottomClass, setPrevBottomClass] = useState("pipe");
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
  const lastScoreChangeRef = useRef(0);
  const audioRef = useRef(null);
  const hasPlayedGameOverSound = useRef(false);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio(gameOverSound);
    audioRef.current.volume = 0.5; // Adjust volume as needed (0.0 to 1.0)
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Play game over sound when game over state changes
  useEffect(() => {
    if (gameOver && !hasPlayedGameOverSound.current) {
      // Reset the audio to start from beginning
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(error => {
          console.log('Audio play failed:', error);
        });
      }
      hasPlayedGameOverSound.current = true;
    } else if (!gameOver) {
      // Reset the flag when starting a new game
      hasPlayedGameOverSound.current = false;
    }
  }, [gameOver]);

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

  // Change pipe class every 5 points
  useEffect(() => {
    if (score > 0 && score % 3 === 0 && score !== lastScoreChangeRef.current) {
      const newTopClass = "pipe" + (Math.floor(Math.random() * 5) + 1);
      const newBottomClass = "pipe" + (Math.floor(Math.random() * 5) + 1);
      
      // Update top pipe class
      const topPipe = document.getElementById('pipetop');
      if (topPipe) {
        topPipe.classList.remove(prevTopClass);
        topPipe.classList.add(newTopClass);
        setPrevTopClass(newTopClass);
      }

      // Update bottom pipe class
      const bottomPipe = document.getElementById('pipebot');
      if (bottomPipe) {
        bottomPipe.classList.remove(prevBottomClass);
        bottomPipe.classList.add(newBottomClass);
        setPrevBottomClass(newBottomClass);
      }
      
      lastScoreChangeRef.current = score;
    }
  }, [score, prevTopClass, prevBottomClass]);

  return (
    <div className="game-container">
      <h1>Bird Flip Flap</h1>
      
      <div 
        className="game-area"
        onClick={handleStartGame}
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
              id='pipetop'
              className={`pipe top-pipe ${prevTopClass}`}
              src={indernormal}
              style={{
                left: `${pipe.x}px`,
                height: `${pipe.topHeight}px`
              }}
              alt="Top pipe"
            />
            <img
              id='pipebot'
              src={indernormal}
              className={`pipe bottom-pipe ${prevBottomClass}`}
              style={{
                left: `${pipe.x}px`,
                height: `${pipe.bottomHeight}px`,
                bottom: '0'
              }}
              alt="Bottom pipe"
            />
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