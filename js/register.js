/**
 * Agent Registration Page
 */

document.addEventListener('DOMContentLoaded', function() {
  const registerForm = document.getElementById('registerForm');
  
  registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // 收集表单数据
    const agentData = {
      name: document.getElementById('agentName').value,
      type: document.getElementById('agentType').value,
      layer: document.getElementById('agentLayer').value,
      description: document.getElementById('agentDescription').value,
      capabilities: document.getElementById('agentCapabilities').value,
      cpu: parseInt(document.getElementById('agentCpu').value),
      memory: parseInt(document.getElementById('agentMemory').value),
      endpoint: document.getElementById('agentEndpoint').value,
      autoStart: document.getElementById('agentAutoStart').checked
    };
    
    // 验证数据
    if (!agentData.name || !agentData.type || !agentData.layer || !agentData.description || !agentData.capabilities) {
      alert('Please fill in all required fields');
      return;
    }
    
    // 保存到localStorage以供主页使用
    const newAgent = {
      id: `${agentData.type}-${Date.now()}`,
      name: agentData.name,
      type: agentData.type,
      layer: agentData.layer,
      status: 'active',
      cpu: agentData.cpu,
      memory: agentData.memory,
      description: agentData.description,
      capabilities: agentData.capabilities.split(',').map(c => c.trim()),
      endpoint: agentData.endpoint,
      relevance: 70
    };
    
    // 将新Agent信息保存到localStorage
    const newAgents = localStorage.getItem('newAgents');
    const agentsList = newAgents ? JSON.parse(newAgents) : [];
    agentsList.push(newAgent);
    localStorage.setItem('newAgents', JSON.stringify(agentsList));
    
    // 显示成功消息
    showSuccessMessage('Agent registered successfully! Redirecting...');
    
    // 2秒后跳转回主页
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2000);
  });
  
  /**
   * 显示成功消息
   */
  function showSuccessMessage(message) {
    let successDiv = document.querySelector('.success-message');
    
    if (!successDiv) {
      successDiv = document.createElement('div');
      successDiv.className = 'success-message';
      document.body.appendChild(successDiv);
    }
    
    successDiv.textContent = message;
    successDiv.classList.add('show');
    
    setTimeout(() => {
      successDiv.classList.remove('show');
    }, 3000);
  }
});
