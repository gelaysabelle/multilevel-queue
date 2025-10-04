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

# Advanced Aging Mechanisms for Multi-Level Queue Scheduler

## Overview

Advanced aging mechanisms go beyond simple time-based priority adjustments to create more sophisticated and fair scheduling systems. These mechanisms consider multiple factors to make intelligent decisions about when and how to adjust process priorities.

## Current Implementation Analysis

Your current aging mechanism is relatively simple:
```javascript
// Current aging - only based on processing time
if (p.processingTime >= settings.agingInterval && p.priority < 3) {
  console.log(`Aging: ${p.name} moving from priority ${p.priority} to ${p.priority + 1}`);
  queue.splice(i, 1);
  p.priority++;
  p.processingTime = 0;
  readyQueues[p.priority - 1].push(p);
}
```

## 1. Multi-Factor Aging System

### Concept
Instead of using only processing time, consider multiple factors that contribute to a process's "age" and priority adjustment needs.

### Implementation
```javascript
class AdvancedAgingSystem {
  constructor() {
    this.agingFactors = {
      processingTime: 0.3,      // 30% weight
      waitingTime: 0.25,        // 25% weight
      totalTime: 0.2,           // 20% weight
      ioTime: 0.15,             // 15% weight
      responseTime: 0.1         // 10% weight
    };
    
    this.agingThresholds = {
      promotion: 0.7,           // Score above 0.7 promotes process
      demotion: 0.8             // Score above 0.8 demotes process
    };
  }

  calculateAgingScore(process, currentTime) {
    const factors = this.agingFactors;
    
    // Normalize each factor to 0-1 scale
    const processingScore = Math.min(process.processingTime / 20, 1);
    const waitingScore = Math.min(process.waitingTime / 15, 1);
    const totalScore = Math.min((currentTime - process.arrivalTime) / 30, 1);
    const ioScore = Math.min((process.ioTime || 0) / 10, 1);
    const responseScore = Math.min((process.responseTime || 0) / 5, 1);
    
    return (processingScore * factors.processingTime) +
           (waitingScore * factors.waitingTime) +
           (totalScore * factors.totalTime) +
           (ioScore * factors.ioTime) +
           (responseScore * factors.responseTime);
  }

  shouldPromote(process, currentTime) {
    const score = this.calculateAgingScore(process, currentTime);
    return score >= this.agingThresholds.promotion && process.priority > 1;
  }

  shouldDemote(process, currentTime) {
    const score = this.calculateAgingScore(process, currentTime);
    return score >= this.agingThresholds.demotion && process.priority < 3;
  }
}
```

## 2. Dynamic Aging Intervals

### Concept
Instead of fixed aging intervals, use dynamic intervals that adjust based on system load and process characteristics.

### Implementation
```javascript
class DynamicAgingIntervals {
  constructor() {
    this.baseIntervals = {
      promotion: 5,
      demotion: 8
    };
    this.loadFactors = {
      high: 0.7,    // Reduce intervals when system is busy
      medium: 1.0,  // Normal intervals
      low: 1.3      // Increase intervals when system is idle
    };
  }

  calculateSystemLoad() {
    const totalProcesses = processes.length;
    const activeProcesses = processes.filter(p => p.remainingTime > 0).length;
    const queueLengths = readyQueues.map(q => q.length);
    const totalQueueLength = queueLengths.reduce((sum, len) => sum + len, 0);
    
    // Calculate load factor (0-1)
    const loadFactor = Math.min(totalQueueLength / (totalProcesses * 2), 1);
    
    if (loadFactor > 0.7) return 'high';
    if (loadFactor > 0.3) return 'medium';
    return 'low';
  }

  getAdjustedIntervals() {
    const load = this.calculateSystemLoad();
    const factor = this.loadFactors[load];
    
    return {
      promotion: Math.max(1, Math.floor(this.baseIntervals.promotion * factor)),
      demotion: Math.max(1, Math.floor(this.baseIntervals.demotion * factor))
    };
  }
}
```

## 3. Priority-Based Aging Rates

### Concept
Different priority levels should have different aging rates. High-priority processes might age faster (get demoted sooner) to prevent monopolization.

### Implementation
```javascript
class PriorityBasedAging {
  constructor() {
    this.agingRates = {
      1: { promotion: 0.8, demotion: 0.6 },  // High priority ages faster
      2: { promotion: 1.0, demotion: 1.0 },  // Medium priority normal rate
      3: { promotion: 1.2, demotion: 1.4 }   // Low priority ages slower
    };
  }

  getAgingRate(priority, type) {
    return this.agingRates[priority][type];
  }

  calculateEffectiveAging(process, baseAging) {
    const rate = this.getAgingRate(process.priority, 'demotion');
    return baseAging * rate;
  }
}
```

## 4. Context-Aware Aging

### Concept
Consider the context of the process when making aging decisions. For example, a process that just completed I/O might deserve a temporary priority boost.

### Implementation
```javascript
class ContextAwareAging {
  constructor() {
    this.contextFactors = {
      ioReturn: 1.5,           // Boost after I/O completion
      quantumExpiry: 0.8,      // Slight boost after quantum expiry
      starvation: 2.0,         // Strong boost for starved processes
      newArrival: 1.0          // Normal aging for new arrivals
    };
  }

  getContextFactor(process) {
    // Check if process just returned from I/O
    if (process.justReturnedFromIO) {
      process.justReturnedFromIO = false;
      return this.contextFactors.ioReturn;
    }
    
    // Check if process just expired its quantum
    if (process.justExpiredQuantum) {
      process.justExpiredQuantum = false;
      return this.contextFactors.quantumExpiry;
    }
    
    // Check for starvation
    if (process.waitingTime > 10) {
      return this.contextFactors.starvation;
    }
    
    return this.contextFactors.newArrival;
  }

  adjustAgingDecision(process, baseDecision) {
    const factor = this.getContextFactor(process);
    return baseDecision * factor;
  }
}
```

## 5. Machine Learning-Based Aging

### Concept
Use machine learning to predict optimal aging decisions based on historical process behavior and system performance.

### Implementation
```javascript
class MLAgingSystem {
  constructor() {
    this.trainingData = [];
    this.model = null;
    this.features = [
      'processingTime', 'waitingTime', 'totalTime', 'ioTime',
      'responseTime', 'priority', 'burstTime', 'queueLength'
    ];
  }

  extractFeatures(process, systemState) {
    return {
      processingTime: process.processingTime,
      waitingTime: process.waitingTime,
      totalTime: currentTime - process.arrivalTime,
      ioTime: process.ioTime || 0,
      responseTime: process.responseTime || 0,
      priority: process.priority,
      burstTime: process.burstTime,
      queueLength: readyQueues[process.priority - 1].length
    };
  }

  predictAgingDecision(process, systemState) {
    const features = this.extractFeatures(process, systemState);
    
    // Simple decision tree (in real implementation, use actual ML model)
    if (features.waitingTime > 15) return 'promote';
    if (features.processingTime > 20) return 'demote';
    if (features.ioTime > 5) return 'promote';
    
    return 'maintain';
  }

  recordDecision(process, decision, outcome) {
    this.trainingData.push({
      features: this.extractFeatures(process, {}),
      decision: decision,
      outcome: outcome
    });
  }
}
```

## 6. Fairness-Based Aging

### Concept
Ensure that aging decisions promote fairness across all processes, not just individual process optimization.

### Implementation
```javascript
class FairnessAging {
  constructor() {
    this.fairnessMetrics = {
      maxWaitingTime: 0,
      minWaitingTime: Infinity,
      averageWaitingTime: 0
    };
  }

  calculateFairnessMetrics() {
    const waitingTimes = processes
      .filter(p => p.remainingTime > 0)
      .map(p => p.waitingTime);
    
    if (waitingTimes.length === 0) return;
    
    this.fairnessMetrics.maxWaitingTime = Math.max(...waitingTimes);
    this.fairnessMetrics.minWaitingTime = Math.min(...waitingTimes);
    this.fairnessMetrics.averageWaitingTime = 
      waitingTimes.reduce((sum, time) => sum + time, 0) / waitingTimes.length;
  }

  calculateFairnessScore() {
    if (this.fairnessMetrics.maxWaitingTime === 0) return 1;
    
    const range = this.fairnessMetrics.maxWaitingTime - this.fairnessMetrics.minWaitingTime;
    const average = this.fairnessMetrics.averageWaitingTime;
    
    // Lower range and closer to average = more fair
    return Math.max(0, 1 - (range / (average * 2)));
  }

  shouldPromoteForFairness(process) {
    const fairnessScore = this.calculateFairnessScore();
    const processWaitingRatio = process.waitingTime / this.fairnessMetrics.averageWaitingTime;
    
    // Promote if process is waiting much longer than average and system is unfair
    return fairnessScore < 0.5 && processWaitingRatio > 1.5;
  }
}
```

## 7. Complete Advanced Aging Implementation

### Integration with Existing Code
```javascript
// Enhanced process object
class EnhancedProcess {
  constructor(name, arrivalTime, burstTime, priority) {
    this.name = name;
    this.arrivalTime = arrivalTime;
    this.burstTime = burstTime;
    this.remainingTime = burstTime;
    this.priority = priority;
    this.processingTime = 0;
    this.waitingTime = 0;
    this.ioTime = 0;
    this.responseTime = 0;
    this.justReturnedFromIO = false;
    this.justExpiredQuantum = false;
    this.lastAgingCheck = 0;
  }
}

// Advanced aging system integration
class AdvancedAgingManager {
  constructor() {
    this.agingSystem = new AdvancedAgingSystem();
    this.dynamicIntervals = new DynamicAgingIntervals();
    this.priorityAging = new PriorityBasedAging();
    this.contextAging = new ContextAwareAging();
    this.fairnessAging = new FairnessAging();
  }

  handleAdvancedAging(process, currentTime) {
    // Update fairness metrics
    this.fairnessAging.calculateFairnessMetrics();
    
    // Get dynamic intervals
    const intervals = this.dynamicIntervals.getAdjustedIntervals();
    
    // Check if enough time has passed since last aging check
    if (currentTime - process.lastAgingCheck < 1) return;
    
    process.lastAgingCheck = currentTime;
    
    // Calculate aging score
    const agingScore = this.agingSystem.calculateAgingScore(process, currentTime);
    
    // Apply context factors
    const contextFactor = this.contextAging.getContextFactor(process);
    const adjustedScore = agingScore * contextFactor;
    
    // Apply priority-based aging rates
    const priorityRate = this.priorityAging.getAgingRate(process.priority, 'demotion');
    const finalScore = adjustedScore * priorityRate;
    
    // Make aging decision
    if (this.agingSystem.shouldPromote(process, currentTime) || 
        this.fairnessAging.shouldPromoteForFairness(process)) {
      this.promoteProcess(process);
    } else if (this.agingSystem.shouldDemote(process, currentTime)) {
      this.demoteProcess(process);
    }
  }

  promoteProcess(process) {
    if (process.priority > 1) {
      console.log(`Advanced Aging: Promoting ${process.name} from priority ${process.priority} to ${process.priority - 1}`);
      process.priority--;
      process.waitingTime = 0;
      process.processingTime = 0;
    }
  }

  demoteProcess(process) {
    if (process.priority < 3) {
      console.log(`Advanced Aging: Demoting ${process.name} from priority ${process.priority} to ${process.priority + 1}`);
      process.priority++;
      process.processingTime = 0;
    }
  }
}
```

## 8. Configuration and Tuning

### User-Configurable Aging Parameters
```javascript
// Add to settings in HTML
<div class="aging-settings">
  <h4>Advanced Aging Settings</h4>
  <label>Aging Factor - Processing Time: 
    <input type="range" id="agingProcessing" min="0" max="1" step="0.1" value="0.3">
    <span id="agingProcessingValue">0.3</span>
  </label>
  <label>Aging Factor - Waiting Time: 
    <input type="range" id="agingWaiting" min="0" max="1" step="0.1" value="0.25">
    <span id="agingWaitingValue">0.25</span>
  </label>
  <label>Promotion Threshold: 
    <input type="range" id="promotionThreshold" min="0" max="1" step="0.1" value="0.7">
    <span id="promotionThresholdValue">0.7</span>
  </label>
  <label>Demotion Threshold: 
    <input type="range" id="demotionThreshold" min="0" max="1" step="0.1" value="0.8">
    <span id="demotionThresholdValue">0.8</span>
  </label>
</div>
```

## 9. Visualization of Advanced Aging

### Aging Metrics Display
```javascript
function renderAgingMetrics() {
  const agingMetricsDiv = document.getElementById('agingMetrics');
  const agingManager = new AdvancedAgingManager();
  
  agingManager.fairnessAging.calculateFairnessMetrics();
  const fairnessScore = agingManager.fairnessAging.calculateFairnessScore();
  
  agingMetricsDiv.innerHTML = `
    <h4>Aging Metrics</h4>
    <div class="metric">
      <span>Fairness Score: ${(fairnessScore * 100).toFixed(1)}%</span>
      <div class="progress-bar">
        <div class="progress" style="width: ${fairnessScore * 100}%"></div>
      </div>
    </div>
    <div class="metric">
      <span>Max Waiting Time: ${agingManager.fairnessAging.fairnessMetrics.maxWaitingTime}</span>
    </div>
    <div class="metric">
      <span>Average Waiting Time: ${agingManager.fairnessAging.fairnessMetrics.averageWaitingTime.toFixed(1)}</span>
    </div>
  `;
}
```

## 10. Benefits of Advanced Aging

### Improved System Performance
- **Better Fairness**: Ensures all processes get reasonable CPU time
- **Reduced Starvation**: More sophisticated promotion mechanisms
- **Adaptive Behavior**: System adjusts to different workloads
- **Context Awareness**: Considers process state and system conditions

### Educational Value
- **Complex Decision Making**: Shows how real systems make scheduling decisions
- **Multiple Factors**: Demonstrates that scheduling involves many considerations
- **Tunable Parameters**: Allows experimentation with different aging strategies
- **Performance Analysis**: Provides metrics to evaluate aging effectiveness

## Implementation Steps

1. **Start Simple**: Begin with multi-factor aging
2. **Add Dynamic Intervals**: Implement load-based interval adjustment
3. **Include Context Awareness**: Add I/O and quantum expiry factors
4. **Implement Fairness**: Add fairness-based promotion logic
5. **Add Visualization**: Create metrics display for aging decisions
6. **Make Configurable**: Allow users to adjust aging parameters

This advanced aging system would significantly enhance your simulator's educational value and demonstrate sophisticated scheduling concepts used in real operating systems.
