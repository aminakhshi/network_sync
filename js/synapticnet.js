// This file contains the JavaScript code for the neural network visualization. It handles the canvas rendering, neuron activation, and signal propagation.

const canvas = document.getElementById('networkCanvas');
const ctx = canvas.getContext('2d');
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let isDarkMode = document.body.classList.contains('dark-mode');

const nodeColor = isDarkMode ? "#E0E0E0" : "#2A2A2A";
const connectionColor = isDarkMode ? "rgba(150, 150, 255, 0.4)" : "rgba(100, 100, 150, 0.2)";
const activeNodeColor = isDarkMode ? "#00FFD1" : "#FF7F27";
const signalColor = isDarkMode ? "rgba(30, 30, 80, 0.8)" : "rgba(255, 200, 100, 0.3)";
const fadeColor = isDarkMode ? "#000000" : "#FFFFFF";

let numNodes = 500;
let connectionThreshold = 80;
let signalSpeed = 0.08;
let activeDuration = 1500;

let transitionPhase = "fadeIn"; 
let transitionAlpha = 0;
const fadeDuration = 2000;    

class Node {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.neighbors = [];  
    this.active = false;  
    this.activeTime = 0;  
  }
  
  update(dt) {
    if (this.active) {
      this.activeTime += dt;
      if (this.activeTime > activeDuration) {
        this.active = false;
        this.activeTime = 0;
      }
    }
  }
  
  draw() {
    ctx.save();
    if (this.active) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = activeNodeColor;
    } else {
      ctx.shadowBlur = 0;
    }
    ctx.beginPath();
    ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = this.active ? activeNodeColor : nodeColor;
    ctx.fill();
    ctx.restore();
  }
}

let nodes = [];
function initNodes() {
  nodes = [];
  for (let i = 0; i < numNodes; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    nodes.push(new Node(x, y));
  }
}

function connectNodes() {
  nodes.forEach(node => node.neighbors = []);
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < connectionThreshold) {
        nodes[i].neighbors.push(nodes[j]);
        nodes[j].neighbors.push(nodes[i]);
      }
    }
  }
}

const signals = [];

function spawnSignals(fromNode) {
  fromNode.neighbors.forEach(neighbor => {
    if (!neighbor.active) {
      signals.push({ from: fromNode, to: neighbor, progress: 0 });
    }
  });
}

function resetNetwork() {
  initNodes();
  connectNodes();
  signals.length = 0;
  const initialNode = nodes[Math.floor(Math.random() * nodes.length)];
  initialNode.active = true;
  spawnSignals(initialNode);
}

initNodes();
connectNodes();
const initialNode = nodes[Math.floor(Math.random() * nodes.length)];
initialNode.active = true;
spawnSignals(initialNode);

function updateSignals() {
  for (let i = signals.length - 1; i >= 0; i--) {
    const signal = signals[i];
    signal.progress += signalSpeed;
    if (signal.progress >= 1) {
      if (!signal.to.active) {
        signal.to.active = true;
        spawnSignals(signal.to);
      }
      signals.splice(i, 1);
    }
  }
}

function drawSignals() {
  signals.forEach(signal => {
    const { from, to, progress } = signal;
    const x = from.x + (to.x - from.x) * progress;
    const y = from.y + (to.y - from.y) * progress;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = signalColor;
    ctx.lineWidth = 3;
    ctx.stroke();
  });
}

function drawConnections() {
  ctx.strokeStyle = connectionColor;
  ctx.lineWidth = 1;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    node.neighbors.forEach(neighbor => {
      if (nodes.indexOf(neighbor) > i) {
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(neighbor.x, neighbor.y);
        ctx.stroke();
      }
    });
  }
}

let lastTimestamp = performance.now();
function animate(timestamp) {
  const dt = timestamp - lastTimestamp;
  lastTimestamp = timestamp;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  nodes.forEach(node => node.update(dt));
  
  updateSignals();
  
  drawConnections();
  
  nodes.forEach(node => node.draw());
  
  drawSignals();
  
  if (transitionPhase === "fadeOut") {
    transitionAlpha += dt / fadeDuration;
    if (transitionAlpha >= 1) {
      transitionAlpha = 1;
      resetNetwork();
      transitionPhase = "fadeIn";
    }
  } else if (transitionPhase === "fadeIn") {
    transitionAlpha -= dt / fadeDuration;
    if (transitionAlpha <= 0) {
      transitionAlpha = 0;
      transitionPhase = "none";
    }
  } else if (signals.length === 0 && transitionPhase === "none") {
    transitionPhase = "fadeOut";
    transitionAlpha = 0;
  }
  
  if (transitionPhase !== "none") {
    ctx.save();
    ctx.globalAlpha = transitionAlpha;
    ctx.fillStyle = fadeColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }
  
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

/* function to update parameters from settings box */
function updateSimulationParameters() {
  numNodes = parseInt(document.getElementById('numNodes').value);
  connectionThreshold = parseInt(document.getElementById('connectionThreshold').value);
  signalSpeed = parseFloat(document.getElementById('signalSpeed').value);
  activeDuration = parseInt(document.getElementById('activeDuration').value);
  resetNetwork();
}

/* New function to update colors based on current theme */
function updateThemeColors() {
  isDarkMode = document.body.classList.contains('dark-mode');
  nodeColor = isDarkMode ? "#E0E0E0" : "#2A2A2A";
  connectionColor = isDarkMode ? "rgba(150, 150, 255, 0.4)" : "rgba(100, 100, 150, 0.2)";
  activeNodeColor = isDarkMode ? "#00FFD1" : "#FF7F27";
  signalColor = isDarkMode ? "rgba(30, 30, 80, 0.8)" : "rgba(255, 200, 100, 0.3)";
  fadeColor = isDarkMode ? "#000000" : "#FFFFFF";
}