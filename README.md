# Multi-Level Queue (MLQ) Scheduler Simulator

## Overview

This is an interactive web-based simulator for a Multi-Level Queue (MLQ) CPU scheduling algorithm. The simulator demonstrates how processes are scheduled across different priority levels using Round Robin scheduling with aging and starvation prevention mechanisms.

## Features

- **Three Priority Levels**: Processes are organized into three priority queues (1=highest, 3=lowest)
- **Round Robin Scheduling**: Each priority level uses Round Robin with configurable quantum times
- **Aging Mechanism**: Processes that run for too long get demoted to lower priority
- **Starvation Prevention**: Processes waiting too long get promoted to higher priority
- **Interactive Gantt Chart**: Visual representation of process execution timeline
- **Real-time Visualization**: Live display of queue states and process information

## File Structure

```
multilevel-queue/
├── index.html          # Main HTML structure and UI layout
├── script.js           # Core simulation logic and algorithms
├── style.css           # Styling and visual design
└── README.md           # This documentation file
```

## Code Documentation

### HTML Structure (`index.html`)

The HTML file creates a responsive layout with three main sections:

#### 1. Left Panel - Configuration
- **Settings Section**: Configurable parameters for the scheduler
  - Quantum times for each priority level (1-3)
  - Aging interval (when processes get demoted)
  - Starvation interval (when processes get promoted)
- **Process Table**: Input table for defining processes with:
  - Process name
  - Arrival time
  - Burst time (execution time)
  - Priority level (1-3)

#### 2. Right Panel - Visualization
- **Current Time Display**: Shows the current simulation time
- **Priority Queue States**: Three sections showing processes in each priority level
  - Priority Level 1 (Highest Priority) - Red theme
  - Priority Level 2 (Medium Priority) - Yellow theme  
  - Priority Level 3 (Lowest Priority) - Green theme

#### 3. Bottom Panel - Gantt Chart
- **Gantt Chart**: Visual timeline showing process execution
- **Time Indicators**: Time markers synchronized with the Gantt chart

### JavaScript Logic (`script.js`)

#### Global Variables
```javascript
let processes = [];           // Array of all processes
let readyQueues = [[], [], []]; // Three priority queues
let currentTime = 0;          // Current simulation time
let currentProcess = null;    // Currently executing process
let quantumCounters = [0, 0, 0]; // Quantum remaining for each level
```

#### Core Functions

##### 1. Process Management
- `addRow()`: Adds new process to the input table
- `resetSimulation()`: Clears all data and resets to initial state
- `startSimulation()`: Initializes and begins the simulation

##### 2. Scheduling Algorithm
- `handleRoundRobinScheduling()`: Implements Round Robin selection from highest priority queue
- `handleProcessArrivals()`: Adds processes to appropriate queues when they arrive
- `handleAgingAndStarvation()`: Manages priority changes based on aging and starvation

##### 3. Priority Management
- **Aging**: Processes that run for `agingInterval` time units get demoted to lower priority
- **Starvation Prevention**: Processes waiting for `starvationInterval` time units get promoted to higher priority

##### 4. Visualization
- `renderUI()`: Updates the visual display of queues and process states
- `updateGanttChart()`: Records process execution in the Gantt chart
- `appendTickPerUnit()`: Adds time markers to the timeline

#### Simulation Flow

The `nextStep()` function implements the core simulation logic:

1. **Increment Time**: Advance simulation clock
2. **Update Waiting Times**: Increment waiting time for all queued processes
3. **Handle Starvation**: Promote processes that have waited too long
4. **Process Arrivals**: Add new processes that arrive at current time
5. **Execute Current Process**: Run the current process for one time unit
6. **Check Completion**: Remove completed processes
7. **Handle Quantum Expiry**: Re-enqueue processes when quantum expires
8. **Handle Aging**: Demote processes that have run too long
9. **Select Next Process**: Choose next process to run
10. **Update Visualization**: Refresh the UI display

### CSS Styling (`style.css`)

#### Layout Design
- **Grid Layout**: Two-column layout for configuration and visualization
- **Responsive Design**: Adapts to mobile screens
- **Card-based UI**: Modern card design for process visualization

#### Visual Themes
- **Priority Level 1**: Red theme (`#dc3545`) - Highest priority
- **Priority Level 2**: Yellow theme (`#ffc107`) - Medium priority  
- **Priority Level 3**: Green theme (`#28a745`) - Lowest priority
- **Current Process**: Highlighted with green border and background

#### Interactive Elements
- **Hover Effects**: Cards lift slightly on hover
- **Button States**: Disabled buttons are grayed out
- **Time Display**: Gradient background with large, bold text

## Default Process Set

The simulator comes with 7 default processes:

| Process | Arrival Time | Burst Time | Priority |
|---------|-------------|------------|----------|
| P1      | 1           | 20         | 3        |
| P2      | 3           | 10         | 2        |
| P3      | 5           | 2          | 1        |
| P4      | 8           | 7          | 2        |
| P5      | 11          | 15         | 3        |
| P6      | 15          | 8          | 2        |
| P7      | 20          | 4          | 1        |

## How to Use

1. **Configure Settings**: Adjust quantum times, aging, and starvation intervals
2. **Add/Modify Processes**: Use the process table to define your processes
3. **Start Simulation**: Click "Start Simulation" to begin
4. **Step Through**: Use "Next Step" to advance the simulation one time unit at a time
5. **Observe Results**: Watch how processes move between priority levels and execute
6. **Reset**: Use "Reset" to start over with default processes

## Algorithm Details

### Multi-Level Queue Scheduling
- **Preemptive**: Higher priority processes can interrupt lower priority ones
- **Round Robin**: Within each priority level, processes are scheduled in round-robin fashion
- **Quantum-based**: Each priority level has its own quantum time

### Aging and Starvation Prevention
- **Aging**: Prevents high-priority processes from monopolizing the CPU
- **Starvation Prevention**: Ensures low-priority processes eventually get CPU time
- **Dynamic Priority**: Process priorities change based on their behavior

### Process States
- **Arrived**: Process has entered the system
- **Ready**: Process is waiting in a priority queue
- **Running**: Process is currently executing
- **Completed**: Process has finished execution

## Technical Implementation

### Time Management
- Simulation runs in discrete time units
- Each step represents one time unit of execution
- Gantt chart shows continuous timeline of process execution

### Queue Management
- Three separate ready queues for each priority level
- FIFO ordering within each priority level
- Dynamic reordering when priorities change

### Memory Management
- Processes maintain state throughout simulation
- Tracks remaining time, processing time, and waiting time
- Efficient queue operations for adding/removing processes

# Enhancement Scenarios for Multi-Level Queue Scheduler

## Overview

This document outlines various enhancement scenarios and possible modifications that can be made to the Multi-Level Queue Scheduler Simulator to extend its functionality, improve user experience, and demonstrate different scheduling concepts.

## 1. Additional Priority Levels

### Scenario: 5-Level Priority System
**Current**: 3 priority levels (1=highest, 3=lowest)  
**Enhancement**: Extend to 5 priority levels (1=highest, 5=lowest)

#### Implementation Changes:
- Modify `readyQueues` array to support 5 levels: `[[], [], [], [], []]`
- Add two more priority level sections in HTML
- Update CSS with new color themes for levels 4 and 5
- Extend settings to include quantum times for levels 4 and 5
- Update validation to accept priorities 1-5

#### Benefits:
- More realistic representation of real operating systems
- Better demonstration of priority-based scheduling
- More complex aging and starvation scenarios

#### Code Modifications:
```javascript
// In script.js
let readyQueues = [[], [], [], [], []]; // 5 levels instead of 3
let quantumCounters = [0, 0, 0, 0, 0]; // 5 quantum counters

// In HTML - add two more priority level sections
<div class="priority-level">
  <h4>Priority Level 4 (Lower)</h4>
  <div id="priority4-bar" class="priority-bar"></div>
</div>
<div class="priority-level">
  <h4>Priority Level 5 (Lowest)</h4>
  <div id="priority5-bar" class="priority-bar"></div>
</div>
```

## 2. Different Scheduling Algorithms per Level

### Scenario: Mixed Scheduling Algorithms
**Current**: Round Robin for all levels  
**Enhancement**: Different algorithms for different priority levels

#### Options:
- **Level 1 (Highest)**: First-Come-First-Served (FCFS)
- **Level 2 (Medium)**: Round Robin (current)
- **Level 3 (Lowest)**: Shortest Job First (SJF)

#### Implementation:
```javascript
function selectNextProcess(level) {
  switch(level) {
    case 0: // Highest priority - FCFS
      return readyQueues[level].shift();
    case 1: // Medium priority - Round Robin
      return readyQueues[level].shift();
    case 2: // Lowest priority - SJF
      return readyQueues[level].sort((a,b) => a.remainingTime - b.remainingTime).shift();
  }
}
```

## 3. Process Types and Categories

### Scenario: Different Process Categories
**Enhancement**: Add process types with different behaviors

#### Process Types:
- **System Processes**: High priority, short bursts
- **Interactive Processes**: Medium priority, I/O bound
- **Batch Processes**: Low priority, CPU intensive
- **Real-time Processes**: Highest priority, strict deadlines

#### Implementation:
```javascript
// Add process type to process object
{
  name: "P1",
  arrivalTime: 1,
  burstTime: 20,
  priority: 3,
  type: "batch", // new field
  deadline: null // for real-time processes
}
```

## 4. I/O Operations and Blocking

### Scenario: I/O Bound Processes
**Enhancement**: Add I/O operations that can block processes

#### Features:
- Processes can request I/O operations
- I/O operations take time and block the process
- Separate I/O queue for blocked processes
- I/O completion returns process to ready queue

#### Implementation:
```javascript
// Add I/O state to processes
{
  name: "P1",
  arrivalTime: 1,
  burstTime: 20,
  priority: 3,
  ioOperations: [
    { time: 5, duration: 3 }, // I/O at time 5, takes 3 time units
    { time: 12, duration: 2 }
  ],
  currentIO: null,
  blockedUntil: null
}
```

## 5. Advanced Aging Mechanisms

### Scenario: Sophisticated Aging
**Current**: Simple aging based on processing time  
**Enhancement**: Multiple aging criteria

#### Aging Factors:
- **Processing Time**: Current implementation
- **Waiting Time**: Time spent in ready queues
- **I/O Time**: Time spent blocked on I/O
- **Response Time**: Time from arrival to first execution

#### Implementation:
```javascript
function calculateAgingScore(process) {
  return (process.processingTime * 0.4) + 
         (process.waitingTime * 0.3) + 
         (process.ioTime * 0.2) + 
         (process.responseTime * 0.1);
}
```

## 6. Performance Metrics and Statistics

### Scenario: Comprehensive Performance Analysis
**Enhancement**: Add detailed performance metrics

#### Metrics to Track:
- **Turnaround Time**: Total time from arrival to completion
- **Waiting Time**: Total time spent waiting in ready queues
- **Response Time**: Time from arrival to first execution
- **Throughput**: Number of processes completed per time unit
- **CPU Utilization**: Percentage of time CPU is busy

#### Implementation:
```javascript
// Add metrics calculation
function calculateMetrics() {
  return {
    averageTurnaroundTime: processes.reduce((sum, p) => sum + p.turnaroundTime, 0) / processes.length,
    averageWaitingTime: processes.reduce((sum, p) => sum + p.waitingTime, 0) / processes.length,
    averageResponseTime: processes.reduce((sum, p) => sum + p.responseTime, 0) / processes.length,
    throughput: completedProcesses.length / currentTime,
    cpuUtilization: (currentTime - idleTime) / currentTime * 100
  };
}
```

## 7. Interactive Process Creation

### Scenario: Dynamic Process Generation
**Enhancement**: Allow users to add processes during simulation

#### Features:
- Add processes while simulation is running
- Random process generator with configurable parameters
- Process templates for common scenarios
- Import/export process sets

#### Implementation:
```javascript
function addProcessDuringSimulation(process) {
  if (process.arrivalTime <= currentTime) {
    // Process arrives immediately
    readyQueues[process.priority - 1].push(process);
  } else {
    // Process arrives in the future
    futureProcesses.push(process);
  }
}
```

## 8. Visualization Enhancements

### Scenario: Advanced Visualizations
**Enhancement**: Improve visual representation

#### New Visualizations:
- **Timeline View**: Show process states over time
- **Queue Length Graph**: Chart showing queue lengths over time
- **Priority Changes Graph**: Show when processes change priority
- **Performance Metrics Dashboard**: Real-time metrics display

#### Implementation:
```javascript
// Add Chart.js for graphs
function createQueueLengthChart() {
  const ctx = document.getElementById('queueChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: timeLabels,
      datasets: [
        { label: 'Level 1', data: queue1Lengths, borderColor: 'red' },
        { label: 'Level 2', data: queue2Lengths, borderColor: 'yellow' },
        { label: 'Level 3', data: queue3Lengths, borderColor: 'green' }
      ]
    }
  });
}
```

## 9. Configuration Profiles

### Scenario: Predefined Scenarios
**Enhancement**: Save and load different simulation scenarios

#### Profiles:
- **High Load**: Many processes with varying priorities
- **I/O Intensive**: Processes with frequent I/O operations
- **Real-time**: Processes with strict deadlines
- **Mixed Workload**: Combination of different process types

#### Implementation:
```javascript
const scenarios = {
  highLoad: {
    processes: [...],
    settings: { quantum: [2, 4, 6], agingInterval: 8, starvationInterval: 4 }
  },
  ioIntensive: {
    processes: [...],
    settings: { quantum: [1, 2, 3], agingInterval: 6, starvationInterval: 3 }
  }
};
```

## 10. Educational Features

### Scenario: Learning and Tutorial Mode
**Enhancement**: Add educational features

#### Features:
- **Step-by-step Explanation**: Detailed explanation of each scheduling decision
- **Algorithm Comparison**: Compare MLQ with other scheduling algorithms
- **Interactive Tutorial**: Guided walkthrough of scheduling concepts
- **Quiz Mode**: Test understanding with questions

#### Implementation:
```javascript
function explainSchedulingDecision() {
  const explanation = {
    time: currentTime,
    decision: "Process P1 selected from Priority Level 1",
    reason: "Priority Level 1 has highest priority and P1 is first in queue",
    alternatives: "Could have selected from Level 2 or 3, but Level 1 takes precedence"
  };
  displayExplanation(explanation);
}
```

## 11. Real-time Simulation

### Scenario: Continuous Execution
**Enhancement**: Add automatic simulation mode

#### Features:
- **Play/Pause**: Automatic step execution with speed control
- **Speed Control**: Adjustable simulation speed
- **Breakpoints**: Pause at specific events or times
- **Replay**: Replay simulation from any point

#### Implementation:
```javascript
let simulationInterval = null;
let simulationSpeed = 1000; // milliseconds per step

function startAutoSimulation() {
  simulationInterval = setInterval(() => {
    if (!isSimulationComplete()) {
      nextStep();
    } else {
      stopAutoSimulation();
    }
  }, simulationSpeed);
}
```

## 12. Export and Reporting

### Scenario: Results Export
**Enhancement**: Export simulation results

#### Export Formats:
- **CSV**: Process data and metrics
- **JSON**: Complete simulation state
- **PDF Report**: Formatted analysis report
- **Gantt Chart Image**: Visual timeline export

#### Implementation:
```javascript
function exportResults(format) {
  switch(format) {
    case 'csv':
      exportToCSV(processes, metrics);
      break;
    case 'json':
      exportToJSON(simulationState);
      break;
    case 'pdf':
      generatePDFReport(processes, metrics, ganttChart);
      break;
  }
}
```

## Implementation Priority

### High Priority (Easy to implement, high impact):
1. Additional Priority Levels (5-level system)
2. Performance Metrics and Statistics
3. Configuration Profiles
4. Real-time Simulation (Play/Pause)

### Medium Priority (Moderate complexity, good educational value):
1. Different Scheduling Algorithms per Level
2. Process Types and Categories
3. Visualization Enhancements
4. Export and Reporting

### Low Priority (Complex implementation, advanced features):
1. I/O Operations and Blocking
2. Advanced Aging Mechanisms
3. Interactive Process Creation
4. Educational Features

## Conclusion

These enhancement scenarios provide a roadmap for extending the Multi-Level Queue Scheduler Simulator. Each enhancement adds new educational value and demonstrates different aspects of operating system scheduling. The modular design of the current code makes it relatively easy to implement these enhancements incrementally.

Choose enhancements based on your educational goals, available time, and technical complexity preferences. Start with high-priority items for quick wins, then gradually add more sophisticated features.
