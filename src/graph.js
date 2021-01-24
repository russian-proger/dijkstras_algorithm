import React from 'react';

var randomKey = 0;

// ==================== //
//      COMPONENTS      //
// ==================== //


/**
 * 
 * @param {Object} props
 *  @param {Number} props.outVertice
 *  @param {Array<Array<Number>>} props.weightMatrix
 *  @param {Function} props.onWeightChange
 *  @param {Function} props.createVertice
 *  @param {Array<Array<Number>>} props.adjMatrix
 *  @param {Function} props.changeAdj
 *  @param {Boolean} props.editable
 *  @param {Boolean} props.needVertice
 *  @param {Function} props.onClick
 *  @param {Boolean} props.isPlaying
 *  @param {Step} props.renderState
 *  @param {ShowPathsPack} props.showPathsPack
 */
function GraphComponent(props) {
  /** @type {G} */
  const g = props.g;
  const graphContainer = React.useRef();
  const vLayer = React.useRef();
  const [edges, updateEdges] = React.useState([]);
  const [_, forceUpdate] = React.useReducer(x => x + 1, 0);
  const [grabVert, setGrabVert] = React.useState({ grabbing: false, id: 0, firPos: new Vector2f() });
  const [grabEdge, setGrabEdge] = React.useState({ grabbing: false, id: 0 });
  const [mousePos, setMousePos] = React.useState(new Vector2f());
  
  /**
   * 
   * @param {G} g 
   */
  function calcEdges(g) {
    var edges = [];
    for (var i = 0; i < g.vertices.length; ++i) {
      for (var j = i + 1; j < g.vertices.length; ++j) {
        if (g.vertices[i].isNeighbour(j)) {
          edges.push(new Vector2f(i, j));
        }
      }
    }
    updateEdges(edges);
  }

  React.useLayoutEffect(function() {
    calcEdges(g);
  }, []);

  function onMouseUp(ev, mousePos, grabVert, grabEdge) {
    let cx = ev.clientX - graphContainer.current.getBoundingClientRect().x;
    let cy = ev.clientY - graphContainer.current.getBoundingClientRect().y;

    if (grabVert.grabbing) {
      var v = g.vertices.findIndex((v) => v.ID == grabVert.id);
      g.vertices[v].position.x += mousePos.x - grabVert.firPos.x;
      g.vertices[v].position.y += mousePos.y - grabVert.firPos.y;
      setGrabVert({ ...grabVert, grabbing: false});
    } else if (grabEdge.grabbing) {
      var v = g.vertices.findIndex((v) => v.ID == grabEdge.id);
      if (props.editable) {
        for (var i = 0; i < g.vertices.length; ++i) {
          if (i == v) continue;
          if (Math.pow(g.vertices[i].position.x - cx, 2) + Math.pow(g.vertices[i].position.y - cy, 2) <= 600) {
            props.changeAdj(!props.adjMatrix[v][i], v, i);
            break;
          }
        }
      }
      setGrabEdge({ grabbing: false, id: -1 });
    }
  }

  function onMouseMove(ev, grabVert) {
    if (grabVert.grabbing || grabEdge.grabbing) {
      let cx = Math.max(grabVert.grabbing ? grabVert.firPos.x - props.g.vertices.find(v => v.ID == grabVert.id).position.x + 27: 0, ev.clientX - graphContainer.current.getBoundingClientRect().x);
      let cy = Math.max(grabVert.grabbing ? grabVert.firPos.y - props.g.vertices.find(v => v.ID == grabVert.id).position.y + 27: 0, ev.clientY - graphContainer.current.getBoundingClientRect().y);
      setMousePos(new Vector2f(cx, cy));
    }
  }

  function onGrabbingVStart(ev, id) {
    let cx = ev.clientX - graphContainer.current.getBoundingClientRect().x;
    let cy = ev.clientY - graphContainer.current.getBoundingClientRect().y;
    setMousePos(new Vector2f(cx, cy));
    if (ev.button == 0) {
      if (props.needVertice) return null;
      setGrabVert({ grabbing: true, id: id, firPos: new Vector2f(cx, cy) });
    } else {
      if (!props.editable) return null;
      ev.preventDefault();
      setGrabEdge({ grabbing: true, id: id });
    } 
  }

  function createVertice(ev) {
    if (ev.target != vLayer.current || !props.editable) return;
    let cx = ev.clientX - graphContainer.current.getBoundingClientRect().x;
    let cy = ev.clientY - graphContainer.current.getBoundingClientRect().y;
    props.createVertice(cx, cy);
  }

  return (
    <div ref={ graphContainer } onContextMenu={ ev => ev.preventDefault && ev.preventDefault() }
      className={ ["g-container", (grabVert.grabbing ? "grabbing" : "non-grabbing"), (props.needVertice ? "blink-vertice" : "")].join(' ') }
      onMouseMove={ (ev) => onMouseMove(ev, grabVert, grabEdge) }
      onMouseUp={ (ev) => onMouseUp(ev, mousePos, grabVert, grabEdge) }>
      <div className="g-e-layer">
        {
          edges.map((v, i) => (
            <EdgeComponent key={ '' + v.x + v.y } vertices={[g.vertices[v.x], g.vertices[v.y]]}
              weight={ props.weightMatrix[v.x][v.y] } grabVert={ grabVert } mousePos={ mousePos }
              editable={ props.editable }
              isPlaying={ props.isPlaying }
              step={ props.renderState }
              onWeightChange={ (val) => props.editable && props.onWeightChange(val, v.x, v.y) }
              vIndices={ v }
              forcedHighlighting={ props.showPathsPack.toShow && props.showPathsPack.isInclude(v) }
            />
          ))
        }
        { grabEdge.grabbing &&
          <LineComponent a={ g.vertices.find(v => v.ID == grabEdge.id).position } b={ mousePos } />
        }
      </div>
      <div ref={ vLayer } className="g-v-layer" onDoubleClick={ (ev) => createVertice(ev) }>
        {
          g.vertices.map((v, i) => (
            <VerticeComponent key={ v.ID } vertice={ v } index={ i }
              removeVertice={ () => props.editable && props.removeVertice(i) }
              onGrabbindStart={ (...args) => onGrabbingVStart(...args) }
              onClick={ () => props.onClick(i) }
              isPlaying={ props.isPlaying }
              step={ props.renderState }
              outVertice={ props.outVertice }
              inVertice={ props.showPathsPack.toShow && props.showPathsPack.paths.length ? props.showPathsPack.paths.slice(-1)[0].y : -1 }
              isGrabbing={ grabVert.grabbing && grabVert.id == v.ID }
              deltaPosition={ grabVert.grabbing && grabVert.id == v.ID ? new Vector2f(mousePos.x - grabVert.firPos.x, mousePos.y - grabVert.firPos.y) : new Vector2f } />
          ))
        }
      </div>
    </div>
  )
}

/**
 * 
 * @param {Object} props
 *  @param {V} props.vertice
 *  @param {Step} props.step
 *  @param {Vector2f} props.deltaPosition
 *  @param {Number} props.index
 *  @param {Number} props.outVertice
 *  @param {Number} props.inVertice
 *  @param {Function} props.onGrabbindStart
 *  @param {Function} props.removeVertice
 *  @param {Function} props.onClick
 *  @param {Boolean} props.isGrabbing
 *  @param {Boolean} props.isPlaying
 */
function VerticeComponent(props) {
  let rootStyles = ({
    left: props.vertice.position.x + props.deltaPosition.x,
    top: props.vertice.position.y + props.deltaPosition.y,
  });
  const mark = new Mark();
  if (props.isPlaying) {
    mark.text = props.step.marks[props.index].text;
    mark.color = props.step.marks[props.index].color;

    const isVisited = props.step.visited[props.index];
    const isPivot = props.step.pivot == props.index;
    rootStyles.background = isPivot ? "#388e3c" : (isVisited ? "#D32F2F" : "white");
    if (props.step.activePath.y == props.index && props.step.activePath.x != props.step.activePath.y) {
      rootStyles.background = "#ddd";
    }
    rootStyles.color = isPivot || isVisited ? "white" : "black";
    rootStyles.borderColor = props.outVertice == props.index || props.inVertice == props.index ? (isPivot ? "#1b5e20" : "#b71c1c") : "black";

    if (props.inVertice == props.index) {
      mark.text = "IN (" + props.step.marks[props.index].text.split(',')[0] + ")";
      mark.color = "red";
    }
  }

  function onDbClick(ev) {
    props.removeVertice();
  }

  return (
    <div className={ ["g-vertice", (props.isGrabbing ? "grabbing" : "")].join(' ') }
      onMouseDown={ (ev) => props.onGrabbindStart(ev, props.vertice.ID) } style={ rootStyles }
      onClick={ () => props.onClick() }
      onDoubleClick={ onDbClick }
    >
      <div className="g-vertice-wrapper">
        <div className="g-vertice-index">
          { props.index + 1 }
        </div>
        { props.isPlaying &&
          <div className={["g-vertice-mark", mark.text == "∞" ? "inf" : ""].join(" ")} style={{ color: mark.color }}>
            { mark.text }
          </div>
        }
      </div>
    </div>
  )
}

/**
 * 
 * @param {Object} props
 *  @param {Step} props.step
 *  @param {Array<V>} props.vertices
 *  @param {Number} props.weight
 *  @param {Function} props.onWeightChange
 *  @param {Boolean} props.editable
 *  @param {Boolean} props.isPlaying
 *  @param {Vector2f} props.vIndices
 *  @param {Boolean} props.forcedHighlighting
 */
function EdgeComponent(props) {
  var {x: px1, y: py1} = props.vertices[0].position;
  var {x: px2, y: py2} = props.vertices[1].position;

  var highlighted = props.forcedHighlighting || props.isPlaying && ((props.vIndices.x == props.step.activePath.x && props.vIndices.y == props.step.activePath.y) || (props.vIndices.x == props.step.activePath.y && props.vIndices.y == props.step.activePath.x))

  if (props.grabVert.grabbing) {
    if (props.vertices[0].ID == props.grabVert.id) {
      px1 += props.mousePos.x - props.grabVert.firPos.x;
      py1 += props.mousePos.y - props.grabVert.firPos.y;
    } else if (props.vertices[1].ID == props.grabVert.id) {
      px2 += props.mousePos.x - props.grabVert.firPos.x;
      py2 += props.mousePos.y - props.grabVert.firPos.y;
    }
  }

  const a = new Vector2f(1, 0);
  const b = new Vector2f(px2 - px1, py2 - py1);
  const angle = Math.acos((a.x * b.x + a.y * b.y) / Math.sqrt(b.x ** 2 + b.y ** 2)) * 180 / Math.PI * (b.y > 0 ? 1 : -1);

  const rootStyles = ({
    left: (px1 + px2) / 2,
    top: (py1 + py2) / 2,
    width: Math.sqrt((px1 - px2) ** 2 + (py1 - py2) ** 2),
  });

  const lineStyles = ({
    transform: "translate(-50%, -50%) rotate(" + angle + "deg)"
  });

  function weightChangeHandle(ev) {
    if (ev.target.textContent == props.weight.toString()) return;
    props.onWeightChange(parseInt(ev.target.textContent));
  }

  return (
    <div className="g-edge" style={ rootStyles }>
      <div className={["g-edge-wrapper", (highlighted ? "highlighted" : "")].join(" ")}>
        <div className="g-edge-line" style={ lineStyles } />
        <div className="g-edge-weight" onBlur={ ev => weightChangeHandle(ev) } contentEditable={ props.editable } suppressContentEditableWarning={ true }>{ props.weight }</div>
      </div>
    </div>
  )
}

/**
 * @param {Object} props
 * @param {Vector2f} props.a
 * @param {Vector2f} props.b
 * @param {Weight} props.weight
 */
function LineComponent(props) {
  const a = new Vector2f(1, 0);
  const b = new Vector2f(props.b.x - props.a.x, props.b.y - props.a.y);
  const angle = Math.acos((a.x * b.x + a.y * b.y) / Math.sqrt(b.x ** 2 + b.y ** 2)) * 180 / Math.PI * (b.y > 0 ? 1 : -1);
  const rootStyles = ({
    left: (props.a.x + props.b.x) / 2,
    top: (props.a.y + props.b.y) / 2,
    width: Math.sqrt((props.a.x - props.b.x) ** 2 + (props.a.y - props.b.y) ** 2),
    transform: "translate(-50%, -50%) rotate(" + angle + "deg)"
  });

  
  return (
    <div className="line" style={ rootStyles }>

    </div>
  )
}


// ==================== //
//        CLASSES       //
// ==================== //

function G() {
  /**
   * @type {Array<V>}
   */
  this.vertices = new Array(new V(106, 489), new V(281, 597), new V(314, 283), new V(649, 241), new V(444, 128), new V(157, 110));
  this.addNewVertice = (posX = 0, posY = 0) => {
    this.vertices.push(new V(posX, posY));
  }

  this.removeVertice = (index) => {
    this.vertices.splice(index, 1);
    this.vertices.forEach(v => {
      let i = v.neighbours.indexOf(index);
      if (i != -1) {
        v.neighbours.splice(i, 1);
      }

      v.neighbours = v.neighbours.map(v => (v > index ? v - 1 : v));
    })
  }
}

function V(_pos_x = 0, _pos_y = 0) {
  /**
   * @type {Vector2f}
   */
  this.position = new Vector2f(_pos_x, _pos_y);
  
  /**
   * @type {Array<Number>}
   */
  this.neighbours = new Array();

  this.ID = ++randomKey;

  this.isNeighbour = (neighbourID) => {
    return this.neighbours.indexOf(neighbourID) !== -1;
  }
}

/**
 * @param {Array<Mark>} _marks 
 * @param {Number} _pivot 
 * @param {Vector2f} _activePath 
 * @param {Number} _duration 
 */
function Step(_marks=[], _pivot=-1, _visited=[], _duration=1000, _activePath=new Vector2f()) {
  /** @type {Array<Mark>} */
  this.marks = _marks;

  /** @type {Array<Boolean} */
  this.visited = _visited;
  
  /** @type {Number} */
  this.pivot = _pivot;

  /** @type {Number} */
  this.duration = _duration;

  /** @type {Vector2f} */
  this.activePath = _activePath;
}

/**
 * @param {String} _text 
 * @param {String} _color 
 */
function Mark(_text = "", _color = "blue") {
  /** @type {String} */
  this.text = _text;

  /** @type {String} */
  this.color = _color;
}

/**
 * 
 * @param {Number} _x 
 * @param {Number} _y 
 */
function Vector2f(_x = 0, _y = 0) {
  this.x = _x;
  this.y = _y;

  /**
   * @param {Vector2f} other 
   * @returns {Boolean}
   */
  this.isEqual = (other) => {
    return this.x == other.x && this.y == other.y || this.x == other.y && this.y == other.x;
  }
}

function ShowPathsPack(_toShow = false, _paths = []) {
  /** @type {Boolean} */
  this.toShow = _toShow;
  
  /** @type {Array<Vector2f>} */
  this.paths = _paths;

  /**
   * @param {Vector2f} edge 
   * @returns {Boolean}
   */
  this.isInclude = (edge) => {
    return this.paths.findIndex(v => v.isEqual(edge)) !== -1;
  }
}

export { G, GraphComponent, Step, Mark, Vector2f, ShowPathsPack };
