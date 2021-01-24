import './styles/fonts.css';
import './styles/app.sass';
import './styles/graph.sass';
import './styles/table.sass';
import './styles/control.sass';
import './styles/garland.css';

import React from 'react';
import ReactDOM from 'react-dom';

import { G, GraphComponent, Step, Mark, Vector2f, ShowPathsPack } from './graph.js';
import { ControlComponent, ControlState } from './control';
import TableComponent from './table.js';
import Garland from './garland.js';

/** @type{Number} */
var gControlTimeout = 0;

/** @type {Function} */
var gInputPromise = () => {};

/** @type {Array<Step>} */
var gSteps = new Array();

/** @type {Array<Array<Vector2f>>} */
var gPaths = new Array();

function getSign(expr_1, expr_2) {
  if (expr_1 > expr_2) {
    return '>';
  } else if (expr_1 < expr_2) {
    return '<';
  }
  return '=';
}

/** 
 * @param {Number} outVertice
 * @param {Array<Array<Boolean>>} adjMatrix
 * @param {Array<Array<Number>>} weightMatrix
 * @return {Array<Step>} */
function DijsktraAlgorithm(outVertice, adjMatrix, weightMatrix) {
  const verticesCount = adjMatrix.length;
  gPaths = new Array(verticesCount).fill(0).map(() => new Array());

  /** @type {Array<Step>} */
  const result = new Array();

  /** @type {Array<Boolean>} */
  const visited = new Array(verticesCount).fill(false);

  /** @type {Array<Number>} */
  const marks = new Array(verticesCount).fill(Infinity);
  marks[outVertice] = 0;

  /** @type {Array<Number>} */
  const prevV = new Array(verticesCount).fill('');


  /** @type {Step} */
  var step;

  result.push(new Step(marks.map((v, i) => new Mark("∞", "red")), -1, visited.slice(), 1000));

  var nextVertice = outVertice;
  while (nextVertice != -1) {
    const currVertice = nextVertice;
    visited[currVertice] = true;

    // Current vertice state
    step = new Step(marks.map((v, i) => new Mark(v.toString() != "Infinity" ? '' + v + prevV[i] : "∞", v.toString() != "Infinity" ? "#0d47a1" : (visited[i] ? "white" : "red"))), currVertice, visited.slice(), 700);
    result.push(step);
    // ---------------------

    if (marks[currVertice].toString() != "Infinity") {
      for (let j = 0; j < verticesCount; ++j) {
        if (!adjMatrix[currVertice][j] || currVertice == j || visited[j]) continue;
  
        // Highlighting the path
        step = new Step(marks.map((v, i) => new Mark(v.toString() != "Infinity" ? '' + v + prevV[i] : "∞", v.toString() != "Infinity" ? "#0d47a1" : (visited[i] ? "white" : "red"))), currVertice, visited.slice(), 700, new Vector2f(currVertice, j));
        result.push(step);
        // -----------------------
  
        if (marks[j].toString() != "Infinity") {
          // Showing calculating
          step = new Step(marks.map((v, i) => new Mark(v.toString() != "Infinity" ? '' + v + prevV[i] : "∞", v.toString() != "Infinity" ? "#0d47a1" : (visited[i] ? "white" : "red"))), currVertice, visited.slice(), 1500, new Vector2f(currVertice, j));
          let sign = getSign(marks[j], weightMatrix[currVertice][j] + marks[currVertice]);
          step.marks[j].text = '' + marks[j] + ' ' + sign + ' ' + (weightMatrix[currVertice][j] + marks[currVertice]);
          step.marks[j].color = (sign == '=') ? "#e65100" : (sign == '<' ? "red" : "green");
          result.push(step);
          // ---------------------
        }
  
        if (marks[j] > weightMatrix[currVertice][j] + marks[currVertice]) {
          gPaths[j] = gPaths[currVertice].slice();
          gPaths[j].push(new Vector2f(currVertice, j));
          marks[j] = weightMatrix[currVertice][j] + marks[currVertice];
          prevV[j] = ", " + (currVertice + 1);
        }
  
        // Highlighting the path
        step = new Step(marks.map((v, i) => new Mark(v.toString() != "Infinity" ? '' + v + prevV[i] : "∞", v.toString() != "Infinity" ? "#0d47a1" : (visited[i] ? "white" : "red"))), currVertice, visited.slice(), 700, new Vector2f(currVertice, j));
        result.push(step);
        // -----------------------
  
        result.push(new Step(marks.map((v, i) => new Mark(v.toString() != "Infinity" ? '' + v + prevV[i] : "∞", v.toString() != "Infinity" ? "#0d47a1" : (visited[i] ? "white" : "red"))), currVertice, visited.slice(), 700));
      }
    }


    
    // Visited vertice state
    result.push(new Step(marks.map((v, i) => new Mark(v.toString() != "Infinity" ? '' + v + prevV[i] : "∞", v.toString() != "Infinity" ? "#0d47a1" : (visited[i] ? "white" : "red"))), -1, visited.slice(), 700));
    // ---------------------

    nextVertice = -1;
    for (let i = 0; i < verticesCount; ++i) {
      if (visited[i]) continue;
      if (nextVertice == -1 || marks[i] < marks[nextVertice]) {
        nextVertice = i;
      }
    }
  }

  result.forEach(v => {
    v.marks[outVertice].text = "OUT";
    v.marks[outVertice].color = "red";
  })

  return result;
}

function App() {
  const [_key_g, forceGraphUpdate] = React.useReducer(x => x + 1, 0);
  const [_key_wt, forceWTUpdate] = React.useReducer(x => x + 1, 0);
  
  const [g, updateG] = React.useState(new G());
  const [adjMatrix, setAMatrix] = React.useState([
    [false,  true,  true, false, false,  true],
    [ true, false,  true,  true, false, false],
    [ true,  true, false,  true, false,  true],
    [false,  true,  true, false,  true, false],
    [false, false, false,  true, false,  true],
    [ true, false,  true, false,  true, false]
  ]);
  const [weightMatrix, setWMatrix] = React.useState([
    [ 1,  7,  9,  1,  1, 14],
    [ 7,  1, 10, 15,  1,  1],
    [ 9, 10,  1, 11,  1,  2],
    [ 1, 15, 11,  1,  6,  1],
    [ 1,  1,  1,  6,  1,  9],
    [14,  1,  2,  1,  9,  1]
  ]);
  
  const [controlState, setControlState] = React.useState(new ControlState());
  const [outVertice, setOutVertice] = React.useState(-1);
  const [activeVertice, setActiveVertice] = React.useState(0);


  //   <GRAPH>   //
  React.useEffect(() => {
    g.vertices.forEach((v, i) => {
      for (let j = 0; j < g.vertices.length; ++j) {
        if (adjMatrix[i][j]) {
          v.neighbours.push(j);
        }
      }
    });

    forceGraphUpdate();
  }, []);

  function weightChangeHandle(val, u, v, weightMatrix) {
    val = Math.max(0, Math.min(99, val));
    var newWMatrix = weightMatrix.slice();
    newWMatrix[u][v] = val;
    newWMatrix[v][u] = val;
    setWMatrix(newWMatrix);
    forceGraphUpdate();
    forceWTUpdate();
  }

  function adjChangeHandle(val, u, v, adjMatrix) {
    if (adjMatrix[u][v] == val) return;
    var newAMatrix = adjMatrix.slice();
    newAMatrix[u][v] = val;
    newAMatrix[v][u] = val;
    setAMatrix(newAMatrix);
    if (val) {
      g.vertices[u].neighbours.push(v);
      g.vertices[v].neighbours.push(u);
    } else {
      g.vertices[u].neighbours = g.vertices[u].neighbours.filter(val => val != v);
      g.vertices[v].neighbours = g.vertices[v].neighbours.filter(val => val != u);
    }
    forceGraphUpdate();
  }

  function createVertice(posX, posY, adjMatrix, weightMatrix) {
    if (g.vertices.length >= 12) return;
    g.addNewVertice(posX, posY);
    var newAMatrix = [...adjMatrix   .map(v => [...v, false]), new Array(adjMatrix.length + 1).fill(false)];
    var newWMatrix = [...weightMatrix.map(v => [...v, 1]), new Array(adjMatrix.length + 1).fill(1)];
    setAMatrix(newAMatrix);
    setWMatrix(newWMatrix);
    forceGraphUpdate();
  }

  function removeVertice(verticeIndex, adjMatrix, weightMatrix) {
    if (g.vertices.length <= 2) return;
    g.removeVertice(verticeIndex);
    var newAMatrix = adjMatrix.slice();
    var newWMatrix = weightMatrix.slice();

    newAMatrix.splice(verticeIndex, 1);
    newWMatrix.splice(verticeIndex, 1);
    newAMatrix.forEach(v => v.splice(verticeIndex, 1));
    newWMatrix.forEach(v => v.splice(verticeIndex, 1));
    setAMatrix(newAMatrix);
    setWMatrix(newWMatrix);
    forceGraphUpdate();
  }
  //   </GRAPH>   //

  //   <SLIDES CONTROLLING>   //
  function pause(controlState) {
    if (controlState.running && !controlState.paused) {
      clearTimeout(gControlTimeout);
      const newControlState = controlState.clone();
      newControlState.paused = true;
      setControlState(newControlState);
    }
  }

  function start(controlState, adjMatrix, weightMatrix, outVertice) {
    if (controlState.running && controlState.paused) {
      const newControlState = controlState.clone();
      newControlState.paused = false;
      if (newControlState.currentFrame == newControlState.framesCount - 1) {
        newControlState.currentFrame = 0;
        setActiveVertice(outVertice);
      }
      setControlState(newControlState);
      gControlTimeout = setTimeout(() => updateControlState(newControlState), 1000);
    } else {
      const newControlState = controlState.clone();
      newControlState.running = false;
      newControlState.compiling = true;
      newControlState.paused = false;
      newControlState.inputWaiting = true;
      
      new Promise((resolve) => {
        gInputPromise = resolve;
        setControlState(newControlState);
      }).then((outVerticeIndex) => {
        gInputPromise = () => {};

        setOutVertice(outVerticeIndex);
        gSteps = DijsktraAlgorithm(outVerticeIndex, adjMatrix, weightMatrix);

        const controlState = newControlState.clone();
        controlState.compiling = false;
        controlState.running = true;
        controlState.inputWaiting = false;
        controlState.currentFrame = 0;
        controlState.framesCount = gSteps.length;
        setControlState(controlState);
        gControlTimeout = setTimeout(() => updateControlState(controlState), 1000);
      });
    }
  }

  function updateControlState(controlState) {
    if (controlState.currentFrame + 1 < controlState.framesCount) {
      var newControlState = controlState.clone();
      ++newControlState.currentFrame;
      newControlState.paused = controlState.currentFrame + 2 >= controlState.framesCount;
      setControlState(newControlState);
      if (!newControlState.paused) {
        gControlTimeout = setTimeout(() => updateControlState(newControlState), gSteps[newControlState.currentFrame].duration / newControlState.rate);
      }
    } else {
      var newControlState = controlState.clone();
      newControlState.paused = true;
      setControlState(newControlState);
    }
  }

  function stop(controlState) {
    if (controlState.running) {
      clearTimeout(gControlTimeout);
      const newControlState = controlState.clone();
      newControlState.running = false;
      newControlState.paused  = false;
      setControlState(newControlState);
    }
  }

  function setFrame(controlState, frameNumber, outVertice) {
    clearTimeout(gControlTimeout);
    let newControlState = controlState.clone();
    newControlState.currentFrame = frameNumber;
    setControlState(newControlState);
    setActiveVertice(outVertice);
    if (controlState.running && !controlState.paused) {
      gControlTimeout = setTimeout(() => updateControlState(newControlState), 1000);
    }
  }

  function setRate(controlState, newRate) {
    if (controlState.rate == newRate) return null;
    clearTimeout(gControlTimeout);
    var newControlState = controlState.clone();
    newControlState.rate = newRate;
    setControlState(newControlState);
    gControlTimeout = setTimeout(() => updateControlState(newControlState), gSteps[newControlState.currentFrame].duration / newControlState.rate);
  }
  //   </SLIDES CONTROLLING>   //

  function vClickHandler(vIndex, controlState) {
    if (controlState.inputWaiting) {
      gInputPromise(vIndex);
    } else if (controlState.currentFrame == controlState.framesCount - 1) {
      setActiveVertice(vIndex);
    }
  }

  
  return (
    <React.Fragment>
      <main id="app"> 
        <div id="left-column">
          <Garland />
          <TableComponent editable={ !controlState.compiling && !controlState.running }
            matrix={ adjMatrix }
            onChange={ (val, u, v) => adjChangeHandle(val, u, v, adjMatrix)}
            isBool={ true }
            descr="Матрица смежности"
          />
          <TableComponent key={ _key_wt } editable={ !controlState.compiling && !controlState.running }
            matrix={ weightMatrix }
            onChange={ (val, u, v) => weightChangeHandle(val, u, v, weightMatrix)}
            descr="Матрица весов"
          />
        </div>
        <div className="divider" />
        <div id="right-column">
          <div className="control-panel">
            <ControlComponent controlState={ controlState } start={ () => start(controlState, adjMatrix, weightMatrix, outVertice) } stop={ () => stop(controlState) }
              setFrame={ (frameNumber) => setFrame(controlState, frameNumber, outVertice) } pause={ () => pause(controlState) }
              setRate={ (newRate) => setRate(controlState, newRate) } />
          </div>
          <div className="graph-constructor">
            <div className="cell-bg"></div>
            <GraphComponent key={_key_g} g={ g } createVertice={ (x, y) => createVertice(x, y, adjMatrix, weightMatrix) }
              editable={ !controlState.compiling && !controlState.running }
              onWeightChange={ (val, u, v) => weightChangeHandle(val, u, v, weightMatrix) }
              adjMatrix={ adjMatrix }
              weightMatrix={ weightMatrix }
              changeAdj={ (val, u, v) => adjChangeHandle(val, u, v, adjMatrix) }
              removeVertice={ (index) => removeVertice(index, adjMatrix, weightMatrix) }
              needVertice={ controlState.inputWaiting }
              isPlaying={ controlState.running && !controlState.inputWaiting && !controlState.compiling }
              renderState={ gSteps[controlState.currentFrame] }
              outVertice={ outVertice }
              onClick={ vIndex => vClickHandler(vIndex, controlState) }
              showPathsPack={ new ShowPathsPack(controlState.running && controlState.currentFrame == controlState.framesCount - 1, gPaths[activeVertice]) }
            />
          </div>
        </div>
      </main>
    </React.Fragment>
  )
}

console.clear();
ReactDOM.render(<App />, document.getElementById('root'));