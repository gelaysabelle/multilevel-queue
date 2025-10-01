// ===== Global Variables =====
let processTable = document.getElementById("processTable").querySelector("tbody");
let ganttChart = document.getElementById("ganttChart");
let timeIndicators = document.getElementById("timeIndicators");
let currentTimeDisplay = document.getElementById("currentTimeDisplay");
let priorityBars = [
  document.getElementById("priority1-bar"),
  document.getElementById("priority2-bar"),
  document.getElementById("priority3-bar")
];

// Debug: Check if priority bar elements are found
console.log("Priority bars found:", priorityBars.map((bar, i) => `Level ${i+1}: ${bar ? 'Found' : 'NOT FOUND'}`));

let processes = [];
let readyQueues = [[], [], []]; // level 1, 2, 3
let simulationStarted = false;
let currentTime = 0;
let currentProcess = null;
let quantumCounters = [0, 0, 0];
let arrivedProcesses = new Set(); // Track which processes have already arrived

let ganttBlocks = []; // For merged display
let lastProcessTime = 0; // Track when last process ended
let nextProcessNumber = 8; // For automatic consecutive naming

// Default processes
const defaultProcesses = [
  { name: "P1", arrivalTime: 1, burstTime: 20, priority: 3 },
  { name: "P2", arrivalTime: 3, burstTime: 10, priority: 2 },
  { name: "P3", arrivalTime: 5, burstTime: 2,  priority: 1 },
  { name: "P4", arrivalTime: 8, burstTime: 7,  priority: 2 },
  { name: "P5", arrivalTime: 11, burstTime: 15, priority: 3 },
  { name: "P6", arrivalTime: 15, burstTime: 8,  priority: 2 },
  { name: "P7", arrivalTime: 20, burstTime: 4,  priority: 1 },
];

// ===== Settings =====
function getSettings() {
  return {
    quantum: [
      parseInt(document.getElementById("quantum1").value),
      parseInt(document.getElementById("quantum2").value),
      parseInt(document.getElementById("quantum3").value),
    ],
    agingInterval: parseInt(document.getElementById("agingInterval").value),
    starvationInterval: parseInt(document.getElementById("starvationInterval").value)
  };
}

// ===== Process Management =====
function generateNextProcessName() {
  return `P${nextProcessNumber++}`;
}

function resetProcessNumbering() {
  nextProcessNumber = 8;
}

// ===== UI Helpers =====
function addRow(name = "", at = "", bt = "", prio = "") {
  if (simulationStarted) return;
  
  // Auto-generate name if not provided
  if (!name) {
    name = generateNextProcessName();
  }
  
  let row = processTable.insertRow();

  // Process Name
  let cell1 = row.insertCell();
  let input1 = document.createElement("input");
  input1.type = "text";
  input1.value = name;
  cell1.appendChild(input1);

  // Arrival Time
  let cell2 = row.insertCell();
  let input2 = document.createElement("input");
  input2.type = "number";
  input2.value = at;
  cell2.appendChild(input2);

  // Burst Time
  let cell3 = row.insertCell();
  let input3 = document.createElement("input");
  input3.type = "number";
  input3.value = bt;
  cell3.appendChild(input3);

  // Priority
  let cell4 = row.insertCell();
  let input4 = document.createElement("input");
  input4.type = "number";
  input4.value = prio;
  cell4.appendChild(input4);
}

function resetSimulation() {
  processes = [];
  readyQueues = [[], [], []];
  simulationStarted = false;
  currentTime = 0;
  currentProcess = null;
  ganttBlocks = [];
  lastProcessTime = 0;
  arrivedProcesses = new Set();
  quantumCounters = [0, 0, 0];
  processTable.innerHTML = "";
  ganttChart.innerHTML = "";
  timeIndicators.innerHTML = "";
  
  // Clear priority bars
  priorityBars.forEach(bar => bar.innerHTML = "");
  
  // Reset time display
  currentTimeDisplay.textContent = "0";
  
  // Reset process numbering
  resetProcessNumbering();
  
  document.getElementById("nextStepBtn").disabled = true;

  // Restore default rows after reset
  defaultProcesses.forEach(p => addRow(p.name, p.arrivalTime, p.burstTime, p.priority));
}

function startSimulation() {
  if (simulationStarted) return;
  
  // Reset state
  processes = [];
  readyQueues = [[], [], []];
  arrivedProcesses = new Set();
  currentProcess = null;
  currentTime = 0;
  ganttBlocks = [];
  lastProcessTime = 0;
  quantumCounters = [0, 0, 0];
  
  // Read processes from table
  for (let row of processTable.rows) {
    let [name, at, bt, prio] = Array.from(row.cells).map(c => c.firstChild.value);
    if (!name || at === "" || bt === "" || prio === "") continue;
    
    let arrivalTime = parseInt(at);
    let burstTime = parseInt(bt);
    let priority = parseInt(prio);
    
    // Validate inputs
    if (priority < 1 || priority > 3) {
      alert(`Invalid priority for ${name}. Priority must be between 1 and 3.`);
      return;
    }
    
    processes.push({
      name,
      arrivalTime,
      burstTime,
      remainingTime: burstTime,
      priority,
      processingTime: 0,
      waitingTime: 0
    });
  }
  
  if (processes.length === 0) {
    alert("Please add at least one process before starting the simulation.");
    return;
  }
  
  simulationStarted = true;
  document.getElementById("nextStepBtn").disabled = false;
  
  // Render initial state (time 0)
  renderUI();
  
  console.log("Simulation started with processes:", processes);
}

// ===== MLQ Core Functions =====

// Round Robin Scheduling Logic
function handleRoundRobinScheduling(settings) {
  if (!currentProcess) {
    // Select next process from highest priority queue
    for (let lvl = 0; lvl < 3; lvl++) {
      if (readyQueues[lvl].length > 0) {
        currentProcess = readyQueues[lvl].shift();
        quantumCounters[lvl] = settings.quantum[lvl];
        console.log(`Selected ${currentProcess.name} from priority ${lvl + 1}, quantum: ${quantumCounters[lvl]}`);
        break;
      }
    }
  }
}

// Priority Management Functions
function handleProcessArrivals() {
  processes.forEach(p => {
    if (p.arrivalTime === currentTime && !arrivedProcesses.has(p.name)) {
      console.log(`Process ${p.name} arriving at time ${currentTime}, adding to priority ${p.priority} queue`);
      readyQueues[p.priority - 1].push(p);
      arrivedProcesses.add(p.name);
    }
  });
}

// Aging and Starvation Management
function handleAgingAndStarvation(settings) {
  // Check each process in each ready queue for aging/starvation
  for (let lvl = 0; lvl < 3; lvl++) {
    let queue = readyQueues[lvl];
    for (let i = queue.length - 1; i >= 0; i--) {
      let p = queue[i];
      
      // Starvation - waiting time reaches starvationInterval, increase priority (move to higher priority queue)
      if (p.waitingTime >= settings.starvationInterval && p.priority > 1) {
        console.log(`Starvation: ${p.name} moving from priority ${p.priority} to ${p.priority - 1}`);
        queue.splice(i, 1); // Remove from current queue
        p.priority--;
        p.waitingTime = 0;
        readyQueues[p.priority - 1].push(p); // Add to higher priority queue
      }
      // Aging - processing time reaches agingInterval, decrease priority (move to lower priority queue)
      else if (p.processingTime >= settings.agingInterval && p.priority < 3) {
        console.log(`Aging: ${p.name} moving from priority ${p.priority} to ${p.priority + 1}`);
        queue.splice(i, 1); // Remove from current queue
        p.priority++;
        p.processingTime = 0;
        readyQueues[p.priority - 1].push(p); // Add to lower priority queue
      }
    }
  }
  
  // Also check current process for aging
  if (currentProcess && currentProcess.processingTime >= settings.agingInterval && currentProcess.priority < 3) {
    console.log(`Aging: Current process ${currentProcess.name} moving from priority ${currentProcess.priority} to ${currentProcess.priority + 1}`);
    // Move current process to lower priority queue
    currentProcess.priority++;
    currentProcess.processingTime = 0;
    readyQueues[currentProcess.priority - 1].push(currentProcess);
    currentProcess = null; // Release the CPU so scheduler picks next process
    // Don't move it yet, let it finish its quantum
  }
}

// Gantt Chart Management
function updateGanttChart() {
  if (currentProcess) {
    let lastBlock = ganttBlocks[ganttBlocks.length - 1];
    if (lastBlock && lastBlock.name === currentProcess.name) {
      lastBlock.end = currentTime + 1;
    } else {
      // Check for idle period before adding new process
      if (lastProcessTime < currentTime) {
        ganttBlocks.push({ name: "Idle", start: lastProcessTime, end: currentTime, isIdle: true });
      }
      ganttBlocks.push({ name: currentProcess.name, start: currentTime, end: currentTime + 1, isIdle: false });
    }
    lastProcessTime = currentTime + 1;
  } else {
    // No process running - will be handled in next iteration
    lastProcessTime = currentTime;
  }
}

// ===== Main Simulation Step =====
function nextStep() {
  let settings = getSettings();

  // 1. Increment time first
  currentTime++;
  currentTimeDisplay.textContent = currentTime;

  // 2. Handle new process arrivals (before any processing)
  handleProcessArrivals();

  // 3. If current process exists, execute it for this time unit
  if (currentProcess) {
    currentProcess.processingTime++;
    currentProcess.remainingTime--;
    
    let lvl = currentProcess.priority - 1;
    quantumCounters[lvl]--;
    
    console.log(`Time ${currentTime}: Executing ${currentProcess.name}, remaining: ${currentProcess.remainingTime}, quantum left: ${quantumCounters[lvl]}`);
  }

  // 4. Update waiting time for all processes in ready queues (not the running one)
  for (let lvl = 0; lvl < 3; lvl++) {
    readyQueues[lvl].forEach(p => {
      p.waitingTime++;
    });
  }

  // 5. Update Gantt chart
  updateGanttChart();

  // 6. Check if current process completed
  if (currentProcess && currentProcess.remainingTime <= 0) {
    console.log(`Process ${currentProcess.name} completed at time ${currentTime}`);
    currentProcess = null;
  }
  // 7. Check if quantum expired (and process not completed)
  else if (currentProcess) {
    let lvl = currentProcess.priority - 1;
    if (quantumCounters[lvl] <= 0) {
      console.log(`Quantum expired for ${currentProcess.name}, moving back to priority ${currentProcess.priority} queue`);
      readyQueues[lvl].push(currentProcess);
      currentProcess = null;
    }
  }

  // 8. Handle aging and starvation (check both running process and waiting processes)
  handleAgingAndStarvation(settings);

  // 9. Select next process if none is running
  handleRoundRobinScheduling(settings);

  // 10. Render UI
  renderUI();
}

// ===== Render UI =====
function renderUI() {
  // Update current time display
  currentTimeDisplay.textContent = currentTime;
  
  // Debug: Log queue states
  console.log(`Time ${currentTime}: Priority queues:`, readyQueues.map((q, i) => `Level ${i+1}: [${q.map(p => p.name).join(', ')}]`));
  if (currentProcess) {
    console.log(`Current process: ${currentProcess.name} (Priority ${currentProcess.priority})`);
  }
  
  // Clear all priority bars
  priorityBars.forEach(bar => bar.innerHTML = "");
  
  // Render each priority level
  for (let lvl = 0; lvl < 3; lvl++) {
    let bar = priorityBars[lvl];
    let queue = readyQueues[lvl];
    
    // Check if current process belongs to this priority level
    let showCurrentProcess = currentProcess && (currentProcess.priority - 1) === lvl;
    
    console.log(`Rendering Priority Level ${lvl + 1}: ${queue.length} processes${showCurrentProcess ? ' + current process' : ''}`);
    
    if (queue.length === 0 && !showCurrentProcess) {
      bar.innerHTML = '<div class="empty">No processes in this priority level</div>';
      bar.classList.add('empty');
    } else {
      bar.classList.remove('empty');
      
      // Show current process first if it belongs to this level
      if (showCurrentProcess) {
        let card = document.createElement('div');
        card.className = 'process-card current';
        card.innerHTML = `
          <div class="process-name">${currentProcess.name} [RUNNING]</div>
          <div class="process-info">
            <span><span class="label">Remaining BT:</span> ${currentProcess.remainingTime}</span>
            <span><span class="label">Processing Time:</span> ${currentProcess.processingTime}</span>
            <span><span class="label">Waiting Time:</span> ${currentProcess.waitingTime}</span>
            <span><span class="label">Arrival Time:</span> ${currentProcess.arrivalTime}</span>
          </div>
        `;
        bar.appendChild(card);
      }
      
      // Show waiting processes
      queue.forEach(p => {
        console.log(`Adding process ${p.name} to Priority Level ${lvl + 1} bar`);
        let card = document.createElement('div');
        card.className = 'process-card';
        
        card.innerHTML = `
          <div class="process-name">${p.name}</div>
          <div class="process-info">
            <span><span class="label">Remaining BT:</span> ${p.remainingTime}</span>
            <span><span class="label">Processing Time:</span> ${p.processingTime}</span>
            <span><span class="label">Waiting Time:</span> ${p.waitingTime}</span>
            <span><span class="label">Arrival Time:</span> ${p.arrivalTime}</span>
          </div>
        `;
        
        bar.appendChild(card);
      });
    }
  }

  // Gantt Chart
  ganttChart.innerHTML = "";
  timeIndicators.innerHTML = "";
  
  if (ganttBlocks.length === 0) {
    // Show initial state
    let div = document.createElement("div");
    div.className = "gantt-block idle";
    div.style.minWidth = "40px";
    div.innerText = "Idle";
    ganttChart.appendChild(div);
    
    let marker = document.createElement("div");
    marker.className = "time-marker";
    marker.style.minWidth = "40px";
    marker.innerText = "0";
    timeIndicators.appendChild(marker);
  } else {
    ganttBlocks.forEach((block, i) => {
      let div = document.createElement("div");
      div.className = block.isIdle ? "gantt-block idle" : "gantt-block";
      div.style.minWidth = (block.end - block.start) * 40 + "px";
      div.innerText = block.name;
      ganttChart.appendChild(div);

      let marker = document.createElement("div");
      marker.className = "time-marker";
      marker.style.minWidth = (block.end - block.start) * 40 + "px";
      marker.innerText = block.start;
      timeIndicators.appendChild(marker);

      if (i === ganttBlocks.length - 1) {
        let endMarker = document.createElement("div");
        endMarker.className = "time-marker";
        endMarker.innerText = block.end;
        timeIndicators.appendChild(endMarker);
      }
    });
  }
}

// ===== Event Listeners =====
document.getElementById("addRowBtn").addEventListener("click", () => addRow());
document.getElementById("resetBtn").addEventListener("click", resetSimulation);
document.getElementById("startBtn").addEventListener("click", startSimulation);
document.getElementById("nextStepBtn").addEventListener("click", nextStep);

// ===== Load Defaults on Page Load =====
window.onload = () => {
  defaultProcesses.forEach(p => addRow(p.name, p.arrivalTime, p.burstTime, p.priority));
};