// 曲线相关功能模块 - 使用三次贝塞尔曲线
// 用于在地图上创建摄像头、基站与边缘服务器之间的连接曲线

/**
 * 创建两点之间的曲线路径 - 使用三次贝塞尔曲线
 * @param {Object} start - 起始点坐标 {lat, lng}
 * @param {Object} end - 终点坐标 {lat, lng}
 * @param {Object} map - Leaflet地图实例
 * @param {String} color - 曲线颜色
 * @param {String} tooltip - 提示文本
 * @param {String} dashArray - 虚线样式，如果不提供则为实线
 * @return {Object} L.polyline实例
 */
function createCurve(start, end, map, color, tooltip, dashArray) {
  // 创建直线连接起点和终点
  const linePoints = [
    [start.lat, start.lng],
    [end.lat, end.lng]
  ];

  // 创建线条样式对象
  const lineOptions = {
    color: color,
    weight: 5,
    opacity: 0.7,
    smoothFactor: 1
  };

  // 如果提供了虚线样式，添加到选项中
  if (dashArray) {
    lineOptions.dashArray = dashArray;
  }

  // 创建直线并添加到地图
  const line = L.polyline(linePoints, lineOptions).addTo(map);

  // 添加提示文本
  if (tooltip) {
    line.bindTooltip(tooltip);
  }

  return line;
}

/**
 * 在地图上创建基站到边缘服务器的连接曲线
 * @param {Object} map - Leaflet地图实例
 * @param {Array} baseStations - 基站数组
 * @param {Object} edgeServer - 边缘服务器对象
 */
function createBaseStationToEdgeServerCurves(map, baseStations, edgeServer) {
  // 获取所有基站的位置
  const nuc01Position = baseStations.find(station => station.id === 'Nuc01');
  const nuc02Position = baseStations.find(station => station.id === 'Nuc02');
  const nuc03Position = baseStations.find(station => station.id === 'Nuc03');

  // 橙色 - 基站连接曲线颜色
  const bsColor = '#F39C12';

  // 创建并添加曲线到地图，分别连接三个基站与边缘服务器
  if (nuc01Position && edgeServer) {
    createCurve(nuc01Position, edgeServer, map, bsColor, "Nuc01 ↔ Edge Server");
  }

  if (nuc02Position && edgeServer) {
    createCurve(nuc02Position, edgeServer, map, bsColor, "Nuc02 ↔ Edge Server");
  }

  if (nuc03Position && edgeServer) {
    createCurve(nuc03Position, edgeServer, map, bsColor, "Nuc03 ↔ Edge Server");
  }
}

/**
 * 在地图上创建摄像头到新的Base Station的连接曲线
 * @param {Object} map - Leaflet地图实例
 * @param {Array} cameras - 摄像头数组
 * @param {Array} baseStations - 基站数组
 */
function createCameraToBaseStationCurves(map, cameras, baseStations) {
  // 获取Base Station的位置
  const baseStationPosition = baseStations.find(station => station.id === 'Base Station');

  // 如果没有找到Base Station，直接返回
  if (!baseStationPosition) {
    console.error('Base Station不存在');
    return;
  }

  // 蓝色 - 摄像头连接曲线颜色
  const cameraColor = '#3498DB';

  // 虚线样式 - "5, 10" 表示5像素的线段和10像素的间隔
  const dashStyle = "5, 10";

  // 为每个摄像头创建连接曲线
  cameras.forEach(camera => {
    if (camera && baseStationPosition) {
      createCurve(camera, baseStationPosition, map, cameraColor, `${camera.id} ↔ Base Station`, dashStyle);
      console.log(`创建了 ${camera.id} 到 Base Station 的虚线连接`);
    }
  });
}

/**
 * 在地图上创建新的Base Station到Edge Server的绿色连接曲线
 * @param {Object} map - Leaflet地图实例
 * @param {Array} baseStations - 基站数组
 * @param {Object} edgeServer - 边缘服务器对象
 */
function createNewBaseStationToEdgeServerCurve(map, baseStations, edgeServer) {
  // 获取Base Station的位置
  const baseStationPosition = baseStations.find(station => station.id === 'Base Station');

  // 绿色 - Base Station到Edge Server的连接曲线颜色
  const bsColor = '#006600'; // 深绿色

  // 创建并添加曲线到地图，连接Base Station与Edge Server
  if (baseStationPosition && edgeServer) {
    createCurve(baseStationPosition, edgeServer, map, bsColor, "Base Station ↔ Edge Server");
  }
}

// 导出函数以便在map.js中使用
window.mapCurves = {
  createCurve,
  createBaseStationToEdgeServerCurves,
  createCameraToBaseStationCurves,
  createNewBaseStationToEdgeServerCurve
};