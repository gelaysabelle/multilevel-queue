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

// NEW: one pixel size for one time unit (kept in JS and also pushed to CSS var)
const TIME_UNIT_PX = 40;

// NEW: append-only time axis state (keeps "0" anchored and prevents shifting)
let axisZeroPlaced = false;      // we place the "0" tick once per simulation
let lastTickValue = 0;           // last time value appended to the axis (monotonic)

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

  // NEW: reset axis state (so "0" will be placed once on next start)
  axisZeroPlaced = false;
  lastTickValue = 0;

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

  // NEW: publish unit width to CSS so layout stays consistent
  document.documentElement.style.setProperty('--unit', `${TIME_UNIT_PX}px`);

  // NEW: lay down the single immutable zero tick before any rendering
  ensureAxisZero();   // appends "0" once; keeps axis anchored
  lastTickValue = 0;  // axis currently shows only 0

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

  // NEW: keep Gantt bars and axis horizontally in sync while scrolling
  initScrollSync();

  // NEW: re-align axis with chart after a resize (keeps same scrollLeft)
  window.addEventListener('resize', () => {
    timeIndicators.scrollLeft = ganttChart.scrollLeft;
  });
  
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
  // NEW: use the *elapsed time slot* [currentTime - 1, currentTime]
  const slotStart = Math.max(0, currentTime - 1);
  const slotEnd = currentTime;

  if (currentProcess) {
    let lastBlock = ganttBlocks[ganttBlocks.length - 1];
    if (lastBlock && !lastBlock.isIdle && lastBlock.name === currentProcess.name) {
      // extend current block by this one time unit
      lastBlock.end = slotEnd;
    } else {
      // If there was a gap before this slot, close it with Idle
      if (lastProcessTime < slotStart) {
        ganttBlocks.push({ name: "Idle", start: lastProcessTime, end: slotStart, isIdle: true });
      }
      // Add a new block for the running process covering this single time unit
      ganttBlocks.push({ name: currentProcess.name, start: slotStart, end: slotEnd, isIdle: false });
    }
    lastProcessTime = slotEnd;
  } else {
    // NEW: explicitly record idle for this slot so the early 0..1 idle shows up correctly
    if (lastProcessTime < slotEnd) {
      const last = ganttBlocks[ganttBlocks.length - 1];
      if (last && last.isIdle) {
        last.end = slotEnd; // extend previous idle
      } else {
        ganttBlocks.push({ name: "Idle", start: slotStart, end: slotEnd, isIdle: true });
      }
      lastProcessTime = slotEnd;
    }
  }
}

// ===== Simulation completion guard =====
function isSimulationComplete() {
  const queuesEmpty = readyQueues.every(q => q.length === 0);
  const noCurrent = currentProcess === null;
  const allDone = processes.length > 0 && processes.every(p => p.remainingTime <= 0);
  return queuesEmpty && noCurrent && allDone;
}

// ===== Main Simulation Step =====
function nextStep() {
  if (!simulationStarted) return;

  let settings = getSettings();

  // 1. Increment time first
  currentTime++;
  currentTimeDisplay.textContent = currentTime;

  // NEW: Append a *single* tick for this new time unit (axis is append-only)
  appendTickPerUnit(currentTime); // keeps "0..t" laid out without touching earlier ticks

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

  // 5. Update Gantt chart (records the elapsed slot [t-1, t])
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

  // NEW: if everything is done, lock the Next Step button so axis can't keep growing
  if (isSimulationComplete()) {
    document.getElementById("nextStepBtn").disabled = true;
    simulationStarted = false;
    console.log("Simulation complete at time", currentTime);
  }

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

  // Gantt Chart (bars). IMPORTANT: axis is handled incrementally; do not clear it here.
  ganttChart.innerHTML = "";
  if (ganttBlocks.length === 0) {
    // Show initial state (bars only; axis "0" was placed at startSimulation)
    let div = document.createElement("div");
    div.className = "gantt-block idle";
    // exact sizing + no shrink to avoid flex rounding on narrow screens
    const w = TIME_UNIT_PX;
    div.style.width = `${w}px`;
    div.style.flex = `0 0 ${w}px`;
    div.innerText = "Idle";
    ganttChart.appendChild(div);
  } else {
    ganttBlocks.forEach((block) => {
      let div = document.createElement("div");
      div.className = block.isIdle ? "gantt-block idle" : "gantt-block";
      const w = (block.end - block.start) * TIME_UNIT_PX;
      // exact width + prevent flex-shrink
      div.style.width = `${w}px`;
      div.style.flex = `0 0 ${w}px`;
      div.innerText = block.name;
      ganttChart.appendChild(div);
    });
  }
}

// NEW: axis helpers (append-only; never remove earlier ticks)
function ensureAxisZero() {
  if (axisZeroPlaced) return;
  const zero = document.createElement("div");
  zero.className = "time-marker";
  const w = TIME_UNIT_PX;
  zero.style.width = `${w}px`;
  zero.style.flex = `0 0 ${w}px`; // prevent shrink on small viewports
  zero.textContent = "0";
  timeIndicators.appendChild(zero);
  axisZeroPlaced = true;
}

function appendTickPerUnit(value) {
  // Ensure 0 exists exactly once
  ensureAxisZero();

  // Only append forward (protects against duplicate calls)
  if (value <= lastTickValue) return;

  // Append ticks up to 'value' (covers any skipped increments)
  for (let t = lastTickValue + 1; t <= value; t++) {
    const marker = document.createElement("div");
    marker.className = "time-marker";
    const w = TIME_UNIT_PX;
    marker.style.width = `${w}px`;
    marker.style.flex = `0 0 ${w}px`; // prevent shrink
    marker.textContent = String(t);
    timeIndicators.appendChild(marker);
  }
  lastTickValue = value;
}

// NEW: keep bars and axis scrolled together
function initScrollSync() {
  let syncing = false;
  ganttChart.addEventListener("scroll", () => {
    if (syncing) return;
    syncing = true;
    timeIndicators.scrollLeft = ganttChart.scrollLeft;
    syncing = false;
  });
  timeIndicators.addEventListener("scroll", () => {
    if (syncing) return;
    syncing = true;
    ganttChart.scrollLeft = timeIndicators.scrollLeft;
    syncing = false;
  });
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
