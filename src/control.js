import React from 'react';

/**
 * 
 * @param { Object } props
 * @param { ControlState } props.controlState 
 * @param { Function } props.pause
 * @param { Function } props.start
 * @param { Function } props.stop
 * @param { Function } props.setFrame
 * @param { Function } props.setRate
 */
function ControlComponent(props) {
  const state = props.controlState;
  const { pause, start, stop, setFrame } = props;

  return (
    <div className="control-c">

      {/* Play button */}
      { (!state.running || state.paused) &&
        <button disabled={ state.compiling } className="c-btn" onClick={ () => start() }>
          <svg width="21" height="21" fill={ state.compiling ? "#969696" : (state.running ? "rgb(230, 74, 25)" : "#388e3c")}>
            <polygon points="5,3 18,10.5 5,18" />
          </svg>
        </button>
      }

      {/* Pause button */}
      { state.running && !state.paused &&
        <button className="c-btn" onClick={ () => pause() }>
          <svg width="21" height="21" fill="#e64a19">
            <rect x="4" y="3" width="5" height="15" />
            <rect x="12" y="3" width="5" height="15" />
          </svg>
        </button>
      }

      {/* Stop button */}
      <button disabled={ !state.running } className="c-btn" onClick={ () => stop() }>
        <svg width="21" height="21" fill={ state.running ? "#d32f2f" : "#969696" }>
          <rect x="5" y="5" width="11" height="11" />
        </svg>

      </button>

      <input className="c-scroll-bar" disabled={ !state.running } type="range" min="0" max={ state.framesCount - 1 } step="1" onChange={ ev => setFrame(parseInt(ev.target.value)) } value={ state.currentFrame } />

      { state.running &&
        <div className="frame-state">
            <span>{ parseInt(state.currentFrame) + 1 } / { state.framesCount }</span>
        </div>
      }

      {/* First frame button */}
      <button disabled={ !state.running || state.currentFrame <= 0 } className="c-btn" onClick={ () => setFrame(0) }>
        <svg width="21" height="21" fill={ state.running && state.currentFrame > 0 ? "#000000" : "#aaaaaa" }>
          <rect x="4" y="5" width="2" height="11" />
          <polygon points="5,10.5 14,5 14,16"></polygon>
        </svg>
      </button>

      {/* Previous frame button */}
      <button disabled={ !state.running || state.currentFrame <= 0 } className="c-btn" onClick={ () => setFrame(state.currentFrame - 1) }>
        <svg width="21" height="21" fill={ state.running && state.currentFrame > 0 ? "#000000" : "#aaaaaa" }>
          <polygon points="5,10.5 14,5 14,16"></polygon>
        </svg>
      </button>

      {/* Next frame button */}
      <button disabled={ !state.running || state.currentFrame >= state.framesCount - 1 } className="c-btn" onClick={ () => setFrame(state.currentFrame + 1) }>
        <svg width="21" height="21" fill={ state.running && state.currentFrame < state.framesCount - 1 ? "#000000" : "#aaaaaa" }>
          <polygon points="16,10.5 7,5 7,16"></polygon>
        </svg>
      </button>

      {/* Last frame button */}
      <button disabled={ !state.running || state.currentFrame >= state.framesCount - 1 } className="c-btn" onClick={ () => setFrame(state.framesCount - 1) }>
        <svg width="21" height="21" fill={ state.running && state.currentFrame < state.framesCount - 1 ? "#000000" : "#aaaaaa" }>
          <polygon points="16,10.5 7,5 7,16"></polygon>
            <rect x="15" y="5" width="2" height="11" />
        </svg>
      </button>

      <select value={ props.controlState.rate } className="c-rate" onChange={ (ev) => props.setRate(ev.target.value) } disabled={ !state.running }>
        <option value={  0.5 }>0.5x</option>
        <option value={ 0.75 }>0.75x</option>
        <option value={  1.0 }>1.0x</option>
        <option value={  1.5 }>1.5x</option>
        <option value={ 1.75 }>1.75x</option>
        <option value={  2.0 }>2.0x</option>
        <option value={  2.5 }>2.5x</option>
      </select>
    </div>
  )
}

function ControlState(_running = false, _paused = false, _framesCount = 10, _currentFrame = 0, _compiling = false, _inputWaiting = false, _rate = 1.0) {
  this.running = _running;
  this.paused = _paused;
  this.framesCount = _framesCount;
  this.currentFrame = _currentFrame;
  this.compiling = _compiling;
  this.inputWaiting = _inputWaiting;
  this.rate = _rate;

  this.clone = () => {
    return new ControlState(this.running, this.paused, this.framesCount, this.currentFrame, this.compiling, this.inputWaiting, this.rate);
  }
}

export { ControlComponent, ControlState };