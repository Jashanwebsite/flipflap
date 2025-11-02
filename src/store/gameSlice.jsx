import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  gameStarted: false,
  gameOver: false,
  score: 0,
  highScore: 0,
  birdPosition: 250,
  birdVelocity: 0,
  pipes: [],
  lastPipeSpawn: 0
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    startGame: (state) => {
      state.gameStarted = true;
      state.gameOver = false;
      state.score = 0;
      state.birdPosition = 200;
      state.birdVelocity = 0;
      state.pipes = [];
      state.lastPipeSpawn = 0;
    },
    endGame: (state) => {
      state.gameOver = true;
      state.gameStarted = false;
      if (state.score > state.highScore) {
        state.highScore = state.score;
      }
    },
    jump: (state) => {
      if (state.gameStarted && !state.gameOver) {
        state.birdVelocity = -3;
      }
    },
    updateBird: (state) => {
      if (state.gameStarted && !state.gameOver) {
        state.birdPosition += state.birdVelocity;
        state.birdVelocity += 0.1;
        
        // Check boundaries
        if (state.birdPosition <= 0 || state.birdPosition >= 550) {
          state.gameOver = true;
          state.gameStarted = false;
          if (state.score > state.highScore) {
            state.highScore = state.score;
          }
        }
      }
    },
    spawnPipe: (state, action) => {
      if (state.gameStarted && !state.gameOver) {
        const pipeHeight = Math.floor(Math.random() * 100) + 70;
        state.pipes.push({
          x: 500,
          topHeight: pipeHeight,
          bottomHeight: 500 - pipeHeight - 200,
          passed: false,
          id: Date.now() + Math.random()
        });
        state.lastPipeSpawn = action.payload.currentTime;
      }
    },
    updatePipes: (state) => {
      if (state.gameStarted && !state.gameOver) {
        // Move pipes
        state.pipes = state.pipes.map(pipe => ({
          ...pipe,
          x: pipe.x - 2
        })).filter(pipe => pipe.x > -60);
        
        // Check for score and collisions
        state.pipes.forEach(pipe => {
          // Score
          if (!pipe.passed && pipe.x < 100) {
            pipe.passed = true;
            state.score += 1;
          }
          
          // Collision detection
          const birdLeft = 100;
          const birdRight = 140;
          const birdTop = state.birdPosition;
          const birdBottom = state.birdPosition + 40;
          
          const pipeLeft = pipe.x;
          const pipeRight = pipe.x + 60;
          const pipeTopTop = 0;
          const pipeBottomTop = pipe.topHeight;
          const pipeTopBottom = 500 - pipe.bottomHeight;
          const pipeBottomBottom = 600;
          
          // Check collision with top pipe
          if (birdRight > pipeLeft && 
              birdLeft < pipeRight && 
              birdTop < pipeBottomTop) {
            state.gameOver = true;
            state.gameStarted = false;
            if (state.score > state.highScore) {
              state.highScore = state.score;
            }
          }
          
          // Check collision with bottom pipe
          if (birdRight > pipeLeft && 
              birdLeft < pipeRight && 
              birdBottom > pipeTopBottom) {
            state.gameOver = true;
            state.gameStarted = false;
            if (state.score > state.highScore) {
              state.highScore = state.score;
            }
          }
        });
      }
    },
    resetGame: (state) => {
      return initialState;
    }
  }
});

export const { 
  startGame, 
  endGame, 
  jump, 
  updateBird, 
  spawnPipe, 
  updatePipes, 
  resetGame 
} = gameSlice.actions;

export default gameSlice.reducer;