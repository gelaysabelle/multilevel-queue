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
  { name: "P7", arrivalTime: 12, burstTime: 4,  priority: 1 },
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
  processes = [];
  for (let row of processTable.rows) {
    let [name, at, bt, prio] = Array.from(row.cells).map(c => c.firstChild.value);
    if (!name || at === "" || bt === "" || prio === "") continue;
    processes.push({
      name,
      arrivalTime: parseInt(at),
      burstTime: parseInt(bt),
      remainingTime: parseInt(bt),
      priority: parseInt(prio),
      processingTime: 0,
      waitingTime: 0
    });
  }
  simulationStarted = true;
  document.getElementById("nextStepBtn").disabled = false;
  
  // Render initial state (time 0)
  renderUI();
  
  // Debug: Test if we can manually add a process to see if UI works
  console.log("Testing UI by manually adding P1 to queue...");
  if (processes.length > 0) {
    let p1 = processes.find(p => p.name === "P1");
    if (p1) {
      readyQueues[p1.priority - 1].push(p1);
      console.log("Manually added P1 to queue, re-rendering...");
      renderUI();
    }
  }
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
        break;
      }
    }
  } else {
    // Decrement quantum counter
    let lvl = currentProcess.priority - 1;
    quantumCounters[lvl]--;
    
    // Check if quantum expired and process still has remaining time
    if (quantumCounters[lvl] <= 0 && currentProcess.remainingTime > 0) {
      readyQueues[lvl].push(currentProcess);
      currentProcess = null;
    }
  }
}

// Priority Management Functions
function handleProcessArrivals() {
  processes.forEach(p => {
    if (p.arrivalTime === currentTime) {
      console.log(`Process ${p.name} arriving at time ${currentTime}, adding to priority ${p.priority} queue`);
      readyQueues[p.priority - 1].push(p);
    }
  });
}

function handleProcessCompletion() {
  if (currentProcess && currentProcess.remainingTime <= 0) {
    currentProcess = null;
  }
}

// Aging and Starvation Management
function handleAgingAndStarvation() {
  processes.forEach(p => {
    if (p.remainingTime <= 0) return;
    
    // Starvation - waiting time reaches 5, increase priority and reset waiting time
    if (p.waitingTime >= 5 && p.priority > 1) {
      p.priority--;
      p.waitingTime = 0;
    }
    
    // Aging - processing time reaches 6, decrease priority and reset processing time
    if (p.processingTime >= 6 && p.priority < 3) {
      p.priority++;
      p.processingTime = 0;
    }
  });
}

// Time Management
function updateProcessTiming() {
  // Update current process
  if (currentProcess) {
    currentProcess.processingTime++;
    currentProcess.remainingTime--;
  }
  
  // Update waiting time for all processes in queues
  for (let lvl = 0; lvl < 3; lvl++) {
    readyQueues[lvl].forEach(p => {
      if (p !== currentProcess) p.waitingTime++;
    });
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

  // 2. Update process timing
  updateProcessTiming();

  // 3. Handle aging and starvation
  handleAgingAndStarvation();

  // 4. Handle new process arrivals
  handleProcessArrivals();

  // 5. Handle process completion
  handleProcessCompletion();

  // 6. Apply Round Robin scheduling
  handleRoundRobinScheduling(settings);

  // 7. Update Gantt chart
  updateGanttChart();

  // 8. Render UI
  renderUI();
}

// ===== Render UI =====
function renderUI() {
  // Update current time display
  currentTimeDisplay.textContent = currentTime;
  
  // Debug: Log queue states
  console.log(`Time ${currentTime}: Priority queues:`, readyQueues.map((q, i) => `Level ${i+1}: [${q.map(p => p.name).join(', ')}]`));
  
  // Clear all priority bars
  priorityBars.forEach(bar => bar.innerHTML = "");
  
  // Render each priority level - only show processes that are actually in the ready queues
  readyQueues.forEach((queue, priorityIndex) => {
    let bar = priorityBars[priorityIndex];
    console.log(`Rendering Priority Level ${priorityIndex + 1}: ${queue.length} processes`);
    
    if (queue.length === 0) {
      bar.innerHTML = '<div class="empty">No processes in this priority level</div>';
      bar.classList.add('empty');
    } else {
      bar.classList.remove('empty');
      queue.forEach(p => {
        console.log(`Adding process ${p.name} to Priority Level ${priorityIndex + 1} bar`);
        let card = document.createElement('div');
        card.className = 'process-card';
        if (p === currentProcess) {
          card.classList.add('current');
        }
        
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
  });
  
  // Also show the currently running process if it exists
  if (currentProcess) {
    let priorityIndex = currentProcess.priority - 1;
    let bar = priorityBars[priorityIndex];
    bar.classList.remove('empty');
    
    // Check if current process is already shown in the queue
    let currentProcessShown = false;
    for (let card of bar.children) {
      if (card.querySelector('.process-name').textContent === currentProcess.name) {
        currentProcessShown = true;
        break;
      }
    }
    
    // If not shown, add it to the appropriate priority bar
    if (!currentProcessShown) {
      let card = document.createElement('div');
      card.className = 'process-card current';
      card.innerHTML = `
        <div class="process-name">${currentProcess.name}</div>
        <div class="process-info">
          <span><span class="label">Remaining BT:</span> ${currentProcess.remainingTime}</span>
          <span><span class="label">Processing Time:</span> ${currentProcess.processingTime}</span>
          <span><span class="label">Waiting Time:</span> ${currentProcess.waitingTime}</span>
          <span><span class="label">Arrival Time:</span> ${currentProcess.arrivalTime}</span>
        </div>
      `;
      bar.appendChild(card);
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
