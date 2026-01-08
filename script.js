// refactor to be performant / include more squares
// add ability to move view with things like gliders?

const GRIDROWS = 35;
const GRIDCOLS = 35;
const COLORS = {
  PINK : "#FF8F8F",
  CREAM : "#FFF1CB",
  BLUE : "#C2E2FA",
  PURPLE : "#B7A3E3"
};
const STATE = {
  ALIVE: "ALIVE",
  DEAD: "DEAD"
};
const SPEEDOPTS = {
  "VERYFAST": 1,
  "FAST": 3,
  "MEDIUM": 10,
  "SLOW": 20,
  "VERYSLOW": 50
};

let canvas;
let grid;
let shouldSimulate = false;
let speedVal = null;
let presetVal = null;

function setup() {
  let width = 800;
  let height = 600;
  canvas = createCanvas(width, height);
  canvas.id("gameScreen");
  canvas.parent("canvas-wrapper");

  background(255);
  grid = new Grid(width, height);
  grid.display();
}

function draw() {
  grid.display();

  if (shouldSimulate && speedVal) {
    if (frameCount % speedVal == 0) {
      grid.simulateGame();
    }
  }
}

class Grid {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.rows = GRIDROWS;
    this.cols = GRIDCOLS;
    this.cellWidth = this.width / this.cols;
    this.cellHeight = this.height / this.rows;
    this.cells = [];
    this.populateCells();
  }

  populateCells() {
    for (let row = 0; row < this.rows; row++) {
      this.cells[row] = [];
      for (let col = 0; col < this.cols; col++) {
        this.cells[row][col] = new Cell(this, row, col, this.cellWidth, this.cellHeight);
      }
    }
  }

  display() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.cells[i][j].display();
      }
    }
  }

  simulateGame() {
    this.getNextState();
    this.updateStates();
  }

  getNextState() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.cells[i][j].getNeighborsStates();
      }
    }
  }

  updateStates() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.cells[i][j].updateState();
      }
    }
  }

  getCellFromClick(x, y) {
    if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
      let row = Math.floor(y / this.cellHeight);
      let col = Math.floor(x / this.cellWidth);
      return grid.cells[row][col];
    }

    return null;
  }
}

class Cell {
  constructor(grid, row, col, width, height) {
    this.grid = grid;
    this.row = row;
    this.col = col;
    this.width = width;
    this.height = height;
    this.x = col * width;
    this.y = row * height;
    this.state = STATE.DEAD;
    this.nextState = STATE.DEAD;
    this.setColor();
  }

  display() {
    push();
    stroke(255);
    fill(this.color);
    rect(this.x, this.y, this.width, this.height);
    pop();
  }

  getNeighborsStates() {
    let numAlive = 0;
    let states = [];
    let dirs = [[-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1]];

    for (let i = 0; i < dirs.length; i++) {
      if (this.row == 0 && dirs[i][0] == -1) {
        continue;
      }
      else if (this.row == GRIDROWS - 1 && dirs[i][0] == 1) {
        continue;
      }
      else if (this.col == 0 && dirs[i][1] == -1) {
        continue;
      }
      else if (this.col == GRIDCOLS - 1 && dirs[i][1] == 1) {
        continue;
      } else {
        states.push(this.grid.cells[this.row + dirs[i][0]][this.col + dirs[i][1]].state);
      }
    }

    for (let j = 0; j < states.length; j++) {
      if (states[j] == STATE.ALIVE) {
        numAlive += 1;
      }
    }

    if (this.state == STATE.ALIVE) {
      if (numAlive <= 1) {
        this.nextState = STATE.DEAD;
      }
      else if (numAlive >= 4) {
        this.nextState = STATE.DEAD;
      }
      else if (numAlive == 2 || numAlive == 3) {
        this.nextState = STATE.ALIVE;
      }
    }
    else if (this.state == STATE.DEAD) {
      if (numAlive == 3) {
        this.nextState = STATE.ALIVE;
      }
    }
  }

  toggleCurrState() {
    if (this.state == STATE.ALIVE) {
      this.state = STATE.DEAD;
    }
    else if (this.state == STATE.DEAD) {
      this.state = STATE.ALIVE;
    }
    this.setColor();
  }

  // toggleNextState() {
  //   if (this.nextState == STATE.ALIVE) {
  //     this.nexState = STATE.DEAD;
  //   } else if (this.nextState == STATE.DEAD) {
  //     this.nextState = STATE.ALIVE;
  //   }
  // }

  updateState() {
    this.state = this.nextState;
    this.nextState = this.state;
    this.setColor();
  }

  setColor() {
    if (this.state == STATE.ALIVE) {
      this.color = COLORS.PINK;
    }
    else if (this.state == STATE.DEAD) {
      this.color = COLORS.PURPLE;
    }
  }
}

function mouseClicked() {
  let cell = grid.getCellFromClick(mouseX, mouseY);

  if (cell) {
    cell.toggleCurrState();
  }
}

window.addEventListener("load", (event) => {
  pageSetup();
})

function pageSetup() {
  addListenerOnElt("speed-selection", "change", setSpeedVal);
  addListenerOnElt("preset-selection", "click", updateWithPreset);
}

function addListenerOnElt(eltID, eventType, callback) {
  let elt = document.getElementById(eltID);
  elt.addEventListener(eventType, (event) => {
    callback(event);
  });
}

function dummy() {
  console.log("dummy");
}

function startSimulation() {
  shouldSimulate = true;
}

function pauseSimulation() {
  shouldSimulate = false;
}

function nextGeneration() {
  grid.simulateGame();
}

function setSpeedVal(event) {
  if (event.target) {
    speedVal = SPEEDOPTS[event.target.value];
  }
}

function resetGrid() {
  pauseSimulation();
  for (let i = 0; i < GRIDROWS; i++) {
    for (let j = 0; j < GRIDCOLS; j++) {
      grid.cells[i][j].state = STATE.DEAD;
      grid.cells[i][j].nextState = STATE.DEAD;
      grid.cells[i][j].setColor();
    }
  }
}

function updateWithPreset(event) {
  resetGrid();
  runSelectedPreset(event);
}

function runSelectedPreset(event) {
  let startPosObj = getStartCell();
  sRow = startPosObj.row
  sCol = startPosObj.col

  if (event) {
    presetVal = event.target.value;
  }

  switch (presetVal) {
    case "acorn":
      acornPreset(sRow, sCol);
      break;
    case "glider":
      gliderPreset(sRow, sCol);
      break;
    case "ants":
      antsPreset(sRow, sCol);
      break;
    default:
      break;
  }
}

function getStartCell() {
  let row = Math.floor(GRIDCOLS / 3);
  let col = Math.floor(GRIDROWS / 3);

  return { row, col };
}

function acornPreset(sRow, sCol) {
  grid.cells[sRow][sCol].toggleCurrState();
  grid.cells[sRow][sCol + 1].toggleCurrState();
  grid.cells[sRow - 2][sCol + 1].toggleCurrState();
  grid.cells[sRow - 1][sCol + 3].toggleCurrState();
  grid.cells[sRow][sCol + 4].toggleCurrState();
  grid.cells[sRow][sCol + 5].toggleCurrState();
  grid.cells[sRow][sCol + 6].toggleCurrState();
}

function gliderPreset(sRow, sCol) {
  grid.cells[sRow][sCol].toggleCurrState();
  grid.cells[sRow + 1][sCol + 1].toggleCurrState();
  grid.cells[sRow + 2][sCol + 1].toggleCurrState();
  grid.cells[sRow + 2][sCol].toggleCurrState();
  grid.cells[sRow + 2][sCol - 1].toggleCurrState();
}

function antsPreset(sRow, sCol) {
  let factor = 5

  for (let i = 0; i < 4; i++) {
    makeAnt(sRow, sCol, 0, i * factor);
  }
}

function makeAnt(sRow, sCol, rowOffset, colOffset) {
  sRow += rowOffset;
  sCol += colOffset;

  grid.cells[sRow][sCol].toggleCurrState();
  grid.cells[sRow][sCol + 1].toggleCurrState();
  grid.cells[sRow + 1][sCol + 2].toggleCurrState();
  grid.cells[sRow + 1][sCol + 3].toggleCurrState();
  grid.cells[sRow + 2][sCol + 2].toggleCurrState();
  grid.cells[sRow + 2][sCol + 3].toggleCurrState();
  grid.cells[sRow + 3][sCol].toggleCurrState();
  grid.cells[sRow + 3][sCol + 1].toggleCurrState();
}
