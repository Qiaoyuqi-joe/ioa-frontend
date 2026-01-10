/**
 * IOA (Internet of Agent) - Main Application
 * Displays agent network topology and discovery process
 */

// 模拟数据 - Agent列表（云边端三层架构）
const agentDatabase = [
  {
    id: 'agent-video',
    name: 'VideoAgent',
    type: 'agent',
    status: 'active',
    layer: 'terminal',
    cpu: 65,
    memory: 72,
    capabilities: ['video analysis', 'object detection', 'frame extraction', 'real-time streaming'],
    description: 'Terminal-layer agent for video processing and analysis at the edge',
    relevance: 95
  },
  {
    id: 'agent-keyframe',
    name: 'KeyframeAgent',
    type: 'agent',
    status: 'active',
    layer: 'edge',
    cpu: 48,
    memory: 58,
    capabilities: ['keyframe extraction', 'scene detection', 'thumbnail generation'],
    description: 'Edge-layer agent for extracting key frames from video streams',
    relevance: 88
  },
  {
    id: 'agent-map',
    name: 'MapAgent',
    type: 'agent',
    status: 'active',
    layer: 'edge',
    cpu: 52,
    memory: 64,
    capabilities: ['map analysis', 'spatial indexing', 'location processing'],
    description: 'Edge-layer agent for geographic information processing',
    relevance: 82
  },
  {
    id: 'agent-meteorology',
    name: 'MeteorologyAgent',
    type: 'agent',
    status: 'active',
    layer: 'cloud',
    cpu: 58,
    memory: 68,
    capabilities: ['weather analysis', 'climate prediction', 'data integration'],
    description: 'Cloud-layer agent for meteorological data analysis',
    relevance: 85
  },
  {
    id: 'agent-report',
    name: 'ReportAgent',
    type: 'agent',
    status: 'active',
    layer: 'cloud',
    cpu: 72,
    memory: 80,
    capabilities: ['report generation', 'data visualization', 'comprehensive analysis', 'export formatting'],
    description: 'Cloud-layer agent for generating comprehensive reports from processed data',
    relevance: 92
  },
  {
    id: 'llm-gpt',
    name: 'GPT-4 LLM',
    type: 'llm',
    status: 'active',
    layer: 'cloud',
    cpu: 85,
    memory: 92,
    capabilities: ['NLP', 'text generation', 'summarization', 'analysis'],
    description: 'Cloud-layer large language model for advanced text processing',
    relevance: 90
  },
  {
    id: 'tool-database',
    name: 'Database Service',
    type: 'tool',
    status: 'active',
    layer: 'cloud',
    cpu: 35,
    memory: 42,
    capabilities: ['data storage', 'queries', 'indexing', 'transactions'],
    description: 'Cloud-layer database service for persistent data storage',
    relevance: 78
  },
  {
    id: 'compute-gpu',
    name: 'GPU Cluster',
    type: 'compute',
    status: 'active',
    layer: 'cloud',
    cpu: 92,
    memory: 96,
    capabilities: ['deep learning', 'inference', 'batch processing', 'training'],
    description: 'Cloud-layer GPU cluster for heavy computation tasks',
    relevance: 88
  }
];

// 应用状态
let appState = {
  selectedAgents: [],
  filteredAgents: [...agentDatabase],
  messages: [],
  filterType: '',
  filterStatus: 'active',
  currentRequest: ''
};

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
  console.log('IOA Application Initializing...');
  
  // 初始化各个模块
  initializeStats();
  initializeNetworkGraph();
  initializeResourceChart();
  initializeDiscoveryProcess();
  initializeChatSystem();
  
  // 检查是否有新注册的Agent
  loadNewAgents();
  
  console.log('IOA Application Ready!');
});

/**
 * 初始化顶部统计数据
 */
function initializeStats() {
  const agents = agentDatabase.filter(a => a.type === 'agent');
  const llms = agentDatabase.filter(a => a.type === 'llm');
  const tools = agentDatabase.filter(a => a.type === 'tool');
  const computes = agentDatabase.filter(a => a.type === 'compute');
  
  document.getElementById('totalNodes').textContent = agentDatabase.length;
  document.getElementById('agentCount').textContent = agents.length;
  document.getElementById('llmCount').textContent = llms.length;
  document.getElementById('toolCount').textContent = tools.length;
  document.getElementById('computeCount').textContent = computes.length;
}

/**
 * 初始化网络拓扑图 - 云边端三层架构
 */
function initializeNetworkGraph() {
  const container = document.getElementById('networkGraph');
  
  // 定义三层架构的Y坐标
  const layerPositions = {
    'cloud': -300,
    'edge': 0,
    'end': 300
  };
  
  // 准备节点数据 - 按层级布局
  const nodes = new vis.DataSet(agentDatabase.map((agent, index) => {
    let color = '#1a73e8';
    let size = 30;
    let borderWidth = 2;
    let layer = agent.layer || 'edge';
    
    switch(agent.type) {
      case 'agent':
        color = '#34a853';
        size = 40;
        break;
      case 'llm':
        color = '#ea4335';
        size = 38;
        break;
      case 'tool':
        color = '#fbbc04';
        size = 32;
        break;
      case 'compute':
        color = '#4285f4';
        size = 42;
        break;
    }
    
    // 按层级分组排列节点
    const layerAgents = agentDatabase.filter(a => a.layer === layer);
    const indexInLayer = layerAgents.findIndex(a => a.id === agent.id);
    const spacing = 150;
    const totalAgents = layerAgents.length;
    const startX = -(totalAgents - 1) * spacing / 2;
    const xPos = startX + indexInLayer * spacing;
    
    return {
      id: agent.id,
      label: agent.name,
      color: {
        background: color,
        border: '#333',
        highlight: {
          background: color,
          border: '#000'
        }
      },
      x: xPos,
      y: layerPositions[layer],
      size: size,
      borderWidth: borderWidth,
      physics: false,  // 关闭物理模拟，使用固定位置
      font: { size: 12, color: '#fff', bold: { color: '#fff' } },
      title: `${agent.name}<br>Type: ${agent.type}<br>Layer: ${layer}<br>CPU: ${agent.cpu}% | Memory: ${agent.memory}%`,
      layer: layer
    };
  }));
  
  // 准备边数据 - 云边端三层架构的连接关系
  const edges = [];
  const edgeSet = new vis.DataSet(edges);
  
  // 初始化边 - 边层agent连接到云层资源
  const edgeAgents = agentDatabase.filter(a => a.layer === 'edge');
  const cloudResources = agentDatabase.filter(a => a.layer === 'cloud');
  
  edgeAgents.forEach((agent, idx) => {
    cloudResources.forEach((cloud, cloudIdx) => {
      if (cloud.type === 'llm' || (cloud.type === 'compute' && cloudIdx % 2 === 0)) {
        edgeSet.add({
          from: agent.id,
          to: cloud.id,
          color: { color: '#bbb', highlight: '#1a73e8' },
          width: 2,
          smooth: { type: 'cubicBezier' }
        });
      }
    });
  });
  
  // 获取网络实例的全局引用以支持动态更新
  window.networkGraph = { nodes, edges: edgeSet };
  
  // 创建网络图
  const data = { nodes: nodes, edges: edgeSet };
  const options = {
    physics: {
      enabled: false  // 禁用物理引擎以使用固定布局
    },
    interaction: {
      navigationButtons: true,
      keyboard: true,
      zoomView: true,
      dragView: true,
      hover: true,
      tooltipDelay: 200
    },
    layout: {
      hierarchical: false  // 手动布局
    }
  };
  
  const network = new vis.Network(container, data, options);
  window.networkInstance = network;
  
  // 事件监听：节点点击时高亮
  network.on('click', function(params) {
    if (params.nodes.length > 0) {
      const selectedNodeId = params.nodes[0];
      highlightNodeInNetwork(selectedNodeId);
    }
  });
  
  // 添加动态闪烁效果 - 只闪烁在线的agent
  setInterval(() => {
    const activeAgents = agentDatabase.filter(a => a.status === 'active');
    if (activeAgents.length > 0) {
      const randomAgent = activeAgents[Math.floor(Math.random() * activeAgents.length)];
      const originalSize = nodes.get(randomAgent.id).size;
      
      nodes.update({
        id: randomAgent.id,
        size: originalSize * 1.3,
        color: {
          background: nodes.get(randomAgent.id).color.background,
          border: '#ffd700',
          highlight: {
            background: nodes.get(randomAgent.id).color.background,
            border: '#000'
          }
        }
      });
      
      setTimeout(() => {
        nodes.update({
          id: randomAgent.id,
          size: originalSize,
          color: {
            background: nodes.get(randomAgent.id).color.background,
            border: '#333',
            highlight: {
              background: nodes.get(randomAgent.id).color.background,
              border: '#000'
            }
          }
        });
      }, 500);
    }
  }, 3000);
  
  // 添加图例说明
  addNetworkLegend();
}

/**
 * 初始化资源视图图表
 */
function initializeResourceChart() {
  const chartContainer = document.getElementById('resourceChart');
  const chart = echarts.init(chartContainer);
  
  // 准备数据
  const names = agentDatabase.map(a => a.name);
  const cpuData = agentDatabase.map(a => a.cpu);
  const memoryData = agentDatabase.map(a => a.memory);
  
  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#333',
      textStyle: { color: '#fff' }
    },
    legend: {
      data: ['CPU Usage (%)', 'Memory Usage (%)'],
      bottom: 10
    },
    grid: {
      left: '3%',
      right: '3%',
      top: '5%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: names,
      axisLabel: {
        rotate: 45,
        fontSize: 11
      }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: 'CPU Usage (%)',
        type: 'line',
        data: cpuData,
        smooth: true,
        itemStyle: { color: '#ea4335' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(234, 67, 53, 0.3)' },
            { offset: 1, color: 'rgba(234, 67, 53, 0)' }
          ])
        }
      },
      {
        name: 'Memory Usage (%)',
        type: 'line',
        data: memoryData,
        smooth: true,
        itemStyle: { color: '#4285f4' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(66, 133, 244, 0.3)' },
            { offset: 1, color: 'rgba(66, 133, 244, 0)' }
          ])
        }
      }
    ]
  };
  
  chart.setOption(option);
  
  // 响应式重绘
  window.addEventListener('resize', () => {
    chart.resize();
  });
}

/**
 * 初始化Discovery过程 - 核心功能
 */
function initializeDiscoveryProcess() {
  const discoveryList = document.getElementById('discoveryList');
  
  // 默认渲染所有Agent
  renderDiscoveryList(agentDatabase);
}
  // 设置初始active状态
  document.querySelector('.filter-chip[data-filter="status"][data-value="active"]').classList.add('active');
}

/**
 * 语义搜索 - 模拟Orchestrator Agent的工作过程
 */
function performSemanticSearch(request) {
  const keywords = request.toLowerCase().split(/\s+/);
  
  // 计算每个Agent与请求的相关度
  return agentDatabase
    .map(agent => {
      let score = 0;
      const agentText = (agent.name + ' ' + agent.description + ' ' + agent.capabilities.join(' ')).toLowerCase();
      
      // 关键词匹配
      keywords.forEach(keyword => {
        if (agentText.includes(keyword)) {
          score += 10;
        }
      });
      
      // 能力匹配
      agent.capabilities.forEach(cap => {
        keywords.forEach(keyword => {
          if (cap.includes(keyword)) {
            score += 15;
          }
        });
      });
      
      // 特定能力的权重提升
      if (keywords.some(k => ['video', 'analyze', 'analysis'].includes(k)) && 
          agent.capabilities.some(c => c.includes('video'))) {
        score += 20;
      }
      
      if (keywords.some(k => ['report', 'generate', 'summary'].includes(k)) && 
          agent.capabilities.some(c => c.includes('report'))) {
        score += 20;
      }
      
      if (keywords.some(k => ['process', 'data', 'processing'].includes(k)) && 
          agent.capabilities.some(c => c.includes('process'))) {
        score += 15;
      }
      
      return {
        ...agent,
        matchScore: Math.max(score, Math.floor(Math.random() * 100) + 30)
      };
    })
    .filter(a => a.matchScore > 20)
    .sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * 应用过滤条件
 */
function applyFilters() {
  let filtered = [...agentDatabase];
  
  // 类型过滤
  if (appState.filterType) {
    filtered = filtered.filter(a => a.type === appState.filterType);
  }
  
  // 状态过滤
  if (appState.filterStatus) {
    filtered = filtered.filter(a => a.status === appState.filterStatus);
  }
  
  // 如果有当前请求，按相关度排序
  if (appState.currentRequest) {
    filtered = performSemanticSearch(appState.currentRequest).filter(agent => {
      if (appState.filterType && agent.type !== appState.filterType) return false;
      if (appState.filterStatus && agent.status !== appState.filterStatus) return false;
      return true;
    });
  }
  
  renderDiscoveryList(filtered);
}

/**
 * 渲染Discovery列表 - Agent Card格式
 */
function renderDiscoveryList(agents) {
  const discoveryList = document.getElementById('discoveryList');
  discoveryList.innerHTML = '';
  
  agents.forEach((agent, index) => {
    const card = document.createElement('div');
    card.className = 'agent-card';
    
    const typeLabel = agent.type.charAt(0).toUpperCase() + agent.type.slice(1);
    const capabilities = agent.capabilities.slice(0, 2).join(', ');
    
    // 计算匹配度（如果有）
    const matchScore = agent.matchScore || agent.relevance || 0;
    const relevancePercent = Math.min(100, matchScore);
    
    card.innerHTML = `
      <div class="agent-card-left">
        <input type="checkbox" class="agent-card-checkbox" id="checkbox-${agent.id}" data-agent-id="${agent.id}">
        <div class="agent-card-info">
          <div class="agent-card-name">${agent.name}</div>
          <div>
            <span class="agent-card-type ${agent.type}">${typeLabel}</span>
            <span class="agent-card-status ${agent.status}">● ${agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}</span>
          </div>
          <div class="agent-card-capabilities">${capabilities}</div>
        </div>
      </div>
      <div class="agent-card-right">
        <div class="agent-score">
          <span class="agent-score-label">Match</span>
          <span class="agent-score-value">${relevancePercent}%</span>
          <div class="relevance-bar">
            <div class="relevance-fill" style="width: ${relevancePercent}%"></div>
          </div>
        </div>
      </div>
    `;
    
    // 处理选择事件
    const checkbox = card.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        appState.selectedAgents.push(agent);
        // 在拓扑图中高亮该Agent
        highlightNodeInNetwork(agent.id);
      } else {
        appState.selectedAgents = appState.selectedAgents.filter(a => a.id !== agent.id);
      }
      updateSelectedAgentsList();
    });
    
    discoveryList.appendChild(card);
  });
}

/**
 * 更新已选中的Agents显示
 */
function updateSelectedAgentsList() {
  const selectedList = document.getElementById('selectedList');
  selectedList.innerHTML = '';
  
  appState.selectedAgents.forEach(agent => {
    const tag = document.createElement('div');
    tag.className = 'selected-tag';
    tag.innerHTML = `
      ${agent.name}
      <button onclick="removeSelectedAgent('${agent.id}')" type="button">×</button>
    `;
    selectedList.appendChild(tag);
  });
}

/**
 * 移除已选中的Agent
 */
function removeSelectedAgent(agentId) {
  appState.selectedAgents = appState.selectedAgents.filter(a => a.id !== agentId);
  
  // 取消对应的checkbox选中状态
  const checkbox = document.getElementById(`checkbox-${agentId}`);
  if (checkbox) {
    checkbox.checked = false;
  }
  
  updateSelectedAgentsList();
}

/**
 * 从localStorage加载新注册的Agent
 */
function loadNewAgents() {
  const newAgentsData = localStorage.getItem('newAgents');
  if (newAgentsData) {
    try {
      const newAgents = JSON.parse(newAgentsData);
      newAgents.forEach(agent => {
        // 检查agent是否已存在
        const exists = agentDatabase.some(a => a.id === agent.id);
        if (!exists) {
          agentDatabase.push(agent);
          // 动态添加到拓扑图
          if (window.networkGraph && window.networkInstance) {
            addAgentToNetwork(agent);
          }
        }
      });
      
      // 更新统计
      initializeStats();
      
      // 清空localStorage中的新Agent列表
      localStorage.removeItem('newAgents');
      
      // 重新渲染Discovery列表
      renderDiscoveryList(agentDatabase);
      
      console.log('Loaded', newAgents.length, 'new agents from localStorage');
    } catch (e) {
      console.error('Error loading new agents:', e);
    }
  }
}

/**
 * 初始化聊天系统
 */
function initializeChatSystem() {
  const userInput = document.getElementById('userInput');
  const sendButton = document.getElementById('sendButton');
  const messages = document.getElementById('messages');
  
  // 发送消息
  function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;
    
    // 添加用户消息
    appState.messages.push({ type: 'user', text: text });
    displayMessage(text, 'user');
    userInput.value = '';
    
    // 生成AI回复
    setTimeout(() => {
      const response = generateAIResponse(text);
      appState.messages.push({ type: 'assistant', text: response });
      displayMessage(response, 'assistant');
    }, 500);
  }
  
  // 显示消息
  function displayMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = text;
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
  }
  
  // 生成AI回复 - 同时更新Discovery列表
  function generateAIResponse(input) {
    const lowerInput = input.toLowerCase();
    
    // 根据用户输入自动更新Discovery列表
    const searchResults = performSemanticSearch(input);
    renderDiscoveryList(searchResults);
    
    const responses = {
      agent: '当前有 5 个核心 Agent。他们分别是 VideoAgent（终端层）、KeyframeAgent（边缘层）、MapAgent（边缘层）、MeteorologyAgent（云层）和 ReportAgent（云层），正在处理不同的任务。',
      llm: 'LLM 资源利用率为 85%。GPT-4 实例在线。推荐优化任务分配以提高效率。',
      resource: '所有资源运行正常。CPU 平均占用 62%，内存平均占用 72%。系统处于最优运行状态。',
      status: '系统状态良好。所有节点均在线。检测到 0 个故障，0 个警告。',
      video: '正在推荐视频处理相关的 Agent。VideoAgent 可以进行视频分析，KeyframeAgent 可以提取关键帧。',
      map: '地理信息处理需要 MapAgent。该 Agent 擅长空间索引和位置处理。',
      weather: '气象数据分析由 MeteorologyAgent 负责。它可以进行天气分析和气候预测。',
      report: '报告生成由 ReportAgent 负责。它可以生成综合报告和数据可视化。',
      default: '已收到您的请求。我已为您推荐相关的 Agent。请在右侧 Discovery Process 中查看。'
    };
    
    if (lowerInput.includes('agent') || lowerInput.includes('代理')) return responses.agent;
    if (lowerInput.includes('llm') || lowerInput.includes('大模型')) return responses.llm;
    if (lowerInput.includes('资源') || lowerInput.includes('resource')) return responses.resource;
    if (lowerInput.includes('状态') || lowerInput.includes('status')) return responses.status;
    if (lowerInput.includes('video') || lowerInput.includes('视频')) return responses.video;
    if (lowerInput.includes('map') || lowerInput.includes('地图') || lowerInput.includes('位置')) return responses.map;
    if (lowerInput.includes('weather') || lowerInput.includes('气象') || lowerInput.includes('天气')) return responses.weather;
    if (lowerInput.includes('report') || lowerInput.includes('报告')) return responses.report;
    
    return responses.default;
  }
  
  sendButton.addEventListener('click', sendMessage);
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
  
  // 欢迎消息
  displayMessage('👋 欢迎使用 IOA 平台！\n\n• 使用<strong>Discovery Process</strong>来搜索和选择 Agent\n• 点击<strong>Register Agent</strong>注册新的 Agent\n• 在此与 Orchestrator Agent 进行交互', 'assistant');
}

/**
 * 添加网络拓扑图的图例说明
 */
function addNetworkLegend() {
  const container = document.getElementById('networkGraph');
  const legend = document.createElement('div');
  legend.className = 'network-legend';
  legend.innerHTML = `
    <div class="legend-item">
      <div class="legend-color" style="background-color: #34a853;"></div>
      <span>Agent (Edge Layer)</span>
    </div>
    <div class="legend-item">
      <div class="legend-color" style="background-color: #ea4335;"></div>
      <span>LLM (Cloud Layer)</span>
    </div>
    <div class="legend-item">
      <div class="legend-color" style="background-color: #fbbc04;"></div>
      <span>Tool (Cloud Layer)</span>
    </div>
    <div class="legend-item">
      <div class="legend-color" style="background-color: #4285f4;"></div>
      <span>Compute (Cloud Layer)</span>
    </div>
  `;
  container.appendChild(legend);
}

/**
 * 高亮拓扑图中的节点 - 当Agent被选中时调用
 */
function highlightNodeInNetwork(nodeId) {
  if (!window.networkInstance) return;
  
  // 获取节点信息
  const agent = agentDatabase.find(a => a.id === nodeId);
  if (!agent) return;
  
  // 高亮该节点
  window.networkGraph.nodes.update({
    id: nodeId,
    size: 50,
    color: {
      background: window.networkGraph.nodes.get(nodeId).color.background,
      border: '#FFD700',
      highlight: {
        background: window.networkGraph.nodes.get(nodeId).color.background,
        border: '#000'
      }
    },
    borderWidth: 4,
    shadow: {
      enabled: true,
      color: 'rgba(255, 215, 0, 0.5)',
      size: 15,
      x: 5,
      y: 5
    }
  });
  
  // 高亮相关的边
  const edges = window.networkGraph.edges.get({
    filter: edge => edge.from === nodeId || edge.to === nodeId
  });
  
  edges.forEach(edge => {
    window.networkGraph.edges.update({
      id: edge.id,
      width: 4,
      color: { color: '#FFD700', highlight: '#FFD700' }
    });
  });
  
  // 3秒后取消高亮
  setTimeout(() => {
    const originalNode = agentDatabase.find(a => a.id === nodeId);
    const typeColor = {
      'agent': '#34a853',
      'llm': '#ea4335',
      'tool': '#fbbc04',
      'compute': '#4285f4'
    }[originalNode.type];
    
    window.networkGraph.nodes.update({
      id: nodeId,
      size: window.networkGraph.nodes.get(nodeId).size / (50 / 40),
      color: {
        background: typeColor,
        border: '#333',
        highlight: {
          background: typeColor,
          border: '#000'
        }
      },
      borderWidth: 2,
      shadow: {
        enabled: false
      }
    });
    
    edges.forEach(edge => {
      window.networkGraph.edges.update({
        id: edge.id,
        width: 2,
        color: { color: '#bbb', highlight: '#1a73e8' }
      });
    });
  }, 3000);
}

/**
 * 动态添加新Agent到拓扑图
 */
function addAgentToNetwork(agent) {
  if (!window.networkGraph || !window.networkInstance) {
    console.error('Network graph not initialized');
    return;
  }
  
  const layerPositions = {
    'cloud': -300,
    'edge': 0,
    'end': 300
  };
  
  const typeColor = {
    'agent': '#34a853',
    'llm': '#ea4335',
    'tool': '#fbbc04',
    'compute': '#4285f4'
  };
  
  const typeSize = {
    'agent': 40,
    'llm': 38,
    'tool': 32,
    'compute': 42
  };
  
  const layer = agent.layer || 'edge';
  const layerAgents = agentDatabase.filter(a => a.layer === layer);
  const indexInLayer = layerAgents.findIndex(a => a.id === agent.id);
  const spacing = 150;
  const totalAgents = layerAgents.length;
  const startX = -(totalAgents - 1) * spacing / 2;
  const xPos = startX + indexInLayer * spacing;
  
  // 添加节点
  window.networkGraph.nodes.add({
    id: agent.id,
    label: agent.name,
    color: {
      background: typeColor[agent.type] || '#1a73e8',
      border: '#333',
      highlight: {
        background: typeColor[agent.type] || '#1a73e8',
        border: '#000'
      }
    },
    x: xPos,
    y: layerPositions[layer],
    size: typeSize[agent.type] || 35,
    borderWidth: 2,
    physics: false,
    font: { size: 12, color: '#fff', bold: { color: '#fff' } },
    title: `${agent.name}<br>Type: ${agent.type}<br>Layer: ${layer}<br>CPU: ${agent.cpu}% | Memory: ${agent.memory}%`,
    layer: layer
  });
  
  // 添加边 - 连接到云层资源
  if (layer === 'edge') {
    const cloudResources = agentDatabase.filter(a => a.layer === 'cloud' && (a.type === 'llm' || a.type === 'compute'));
    cloudResources.forEach((cloud, idx) => {
      if (idx % 2 === 0) {
        window.networkGraph.edges.add({
          from: agent.id,
          to: cloud.id,
          color: { color: '#bbb', highlight: '#1a73e8' },
          width: 2,
          smooth: { type: 'cubicBezier' }
        });
      }
    });
  }
  
  console.log('Added agent to network:', agent.name);
}
