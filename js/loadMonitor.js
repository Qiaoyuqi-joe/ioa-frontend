// 初始化图表对象
let resourceChart = null;

// 创建柱状图函数
function createResourceChart() {
  try {
    console.log("开始初始化Resource Usage图表");

    const chartContainer = document.getElementById('resourceChart');
    if (!chartContainer) {
      console.error('找不到resourceChart容器元素');
      return null;
    }

    console.log("容器元素已获取，开始创建ECharts实例");

    // 初始化ECharts实例
    const chart = echarts.init(chartContainer);

    // 设置柱状图配置
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function (params) {
          return params[0].name + '<br/>' +
            params[0].seriesName + ': ' + params[0].value + '%<br/>' +
            params[1].seriesName + ': ' + params[1].value + '%';
        }
      },
      legend: {
        data: ['CPU', 'GPU'],
        top: 0,
        textStyle: {
          fontSize: 10
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['BS', 'ES', 'Nuc01', 'Nuc02', 'Nuc03'],
        axisLabel: {
          fontSize: 10
        }
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLabel: {
          formatter: '{value}%',
          fontSize: 10
        }
      },
      series: [
        {
          name: 'CPU',
          type: 'bar',
          data: [50, 50, 50, 50, 50],
          itemStyle: {
            color: 'rgba(54, 162, 235, 0.8)'
          },
          barWidth: '20%',
          barGap: '10%'
        },
        {
          name: 'GPU',
          type: 'bar',
          data: [50, 50, 50, 50, 50],
          itemStyle: {
            color: 'rgba(255, 206, 86, 0.8)'
          },
          barWidth: '20%',
          barGap: '10%'
        }
      ]
    };

    // 使用配置项设置图表
    chart.setOption(option);

    // 窗口大小变化时，重置图表大小
    window.addEventListener('resize', function () {
      chart.resize();
    });

    console.log("ECharts实例创建完成");
    return chart;
  } catch (error) {
    console.error('创建资源图表时出错:', error);
    return null;
  }
}

// 更新图表数据
function updateChartData(data) {
  if (!resourceChart) {
    console.error('无法更新资源数据: 图表未初始化');
    return;
  }

  // 标记开始更新图表
  document.body.classList.add('updating-chart');

  // 提取CPU数据
  const cpuValues = [
    data.bs.cpu,
    data.es.cpu,
    data.nuc01.cpu,
    data.nuc02.cpu,
    data.nuc03.cpu
  ];

  // 提取GPU数据
  const gpuValues = [
    data.bs.gpu,
    data.es.gpu,
    data.nuc01.gpu,
    data.nuc02.gpu,
    data.nuc03.gpu
  ];

  // 更新ECharts数据
  resourceChart.setOption({
    series: [
      {
        name: 'CPU',
        data: cpuValues
      },
      {
        name: 'GPU',
        data: gpuValues
      }
    ]
  });

  // 更新完成后移除标记
  setTimeout(() => {
    document.body.classList.remove('updating-chart');
  }, 350);
}

// 生成随机资源使用数据
function generateResourceData() {
  return {
    bs: {
      cpu: Math.floor(Math.random() * 60) + 20, // 20-80之间的随机数
      gpu: Math.floor(Math.random() * 70) + 15  // 15-85之间的随机数
    },
    es: {
      cpu: Math.floor(Math.random() * 75) + 15, // 15-90之间的随机数
      gpu: Math.floor(Math.random() * 80) + 10  // 10-90之间的随机数
    },
    nuc01: {
      cpu: Math.floor(Math.random() * 60) + 20, // 20-80之间的随机数
      gpu: Math.floor(Math.random() * 65) + 15  // 15-80之间的随机数
    },
    nuc02: {
      cpu: Math.floor(Math.random() * 65) + 15, // 15-80之间的随机数
      gpu: Math.floor(Math.random() * 70) + 10  // 10-80之间的随机数
    },
    nuc03: {
      cpu: Math.floor(Math.random() * 60) + 20, // 20-80之间的随机数
      gpu: Math.floor(Math.random() * 65) + 15  // 15-80之间的随机数
    }
  };
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM已加载完成，开始初始化图表");

  // 确保ECharts已定义
  if (typeof echarts === 'undefined') {
    console.error("ECharts库未加载，请检查CDN链接是否正确");
    return;
  }

  // 初始化图表
  setTimeout(() => {
    // 延迟初始化，确保DOM元素已完全渲染
    resourceChart = createResourceChart();

    if (resourceChart) {
      console.log("资源图表创建成功，开始更新数据");
      // 立即更新一次数据
      updateChartData(generateResourceData());

      // 定时更新数据
      setInterval(() => {
        if (!document.body.classList.contains('updating-cameras') &&
          !document.body.classList.contains('updating-chart')) {
          updateChartData(generateResourceData());
        }
      }, 2000);
    } else {
      console.error("资源图表创建失败");
    }
  }, 500);
}); 