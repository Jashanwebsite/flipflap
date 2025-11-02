import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import BirdFlipFlap from './components/component.jsx';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <BirdFlipFlap />
      </div>
    </Provider>
  );
}

export default App;