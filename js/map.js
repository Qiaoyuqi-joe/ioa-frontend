// 摄像头位置（示例坐标，需要根据实际情况调整）
const cameras = [
  { id: 'Camera1', lat: 39.93258, lng: 116.227098, name: 'Camera1', description: '北京某废旧金属回收站' },
  { id: 'Camera2', lat: 40.014926 - 0.0018, lng: 116.286736 - 0.00236, name: 'Camera2', description: '北京某钢材压制厂' },
  { id: 'Camera3', lat: 39.875493 - 0.0009, lng: 116.277879 - 0.00354, name: 'Camera3', description: '北京某炼钢厂' },
  { id: 'Camera4', lat: 39.993117, lng: 116.22131, name: 'Camera4', description: '西五环香泉环岛' },
  { id: 'Camera5', lat: 39.897269, lng: 116.242997, name: 'Camera5', description: '莲石东路' }
];

// 基站位置（经过修改后的位置）
const baseStations = [
  { id: 'Nuc01', lat: 39.989184 - 0.0009, lng: 116.402669 - 0.0059, name: 'Nuc01', description: '亚运村', relatedCamera: 'Camera1' },
  { id: 'Nuc02', lat: 40.05512 - 0.0036, lng: 116.329074 - 0.00354, name: 'Nuc02', description: '西三旗', relatedCamera: 'Camera2' },
  { id: 'Nuc03', lat: 39.90754, lng: 116.459138, name: 'Nuc03', description: '北京CBD', relatedCamera: 'Camera3' },
  { id: 'Base Station', lat: 39.94250, lng: 116.300023, name: 'Base Station', description: '西三环紫竹桥', relatedCamera: 'Camera1' }
];

// 边缘服务器位置（位于BS01西侧250米处，北侧10米处）
const edgeServer = {
  id: 'Edge Server',
  lat: 39.960161 + 0.00009, // 北移10米
  lng: (116.349315 + 0.00118 * 5) - 0.00118 * 2.5, // BS01新位置 - 250米
  name: 'Edge Server',
  description: '边缘计算服务器',
  location: '北京邮电大学海淀校区',
  relatedBaseStations: ['Nuc01', 'Nuc02', 'Nuc03']
};

// 计算摄像头和基站位置的边界
function calculateBounds() {
  // 合并摄像头、基站和边缘服务器数组用于计算边界
  const allPoints = [...cameras, ...baseStations, edgeServer];

  let minLat = Math.min(...allPoints.map(point => point.lat));
  let maxLat = Math.max(...allPoints.map(point => point.lat));
  let minLng = Math.min(...allPoints.map(point => point.lng));
  let maxLng = Math.max(...allPoints.map(point => point.lng));

  // 添加较大的边距，确保所有点和连线都能显示
  const padding = 0.02; // 将边距从0.005增加到0.02
  minLat -= padding;
  maxLat += padding;
  minLng -= padding;
  maxLng += padding;

  return [[minLat, minLng], [maxLat, maxLng]];
}

// 初始化地图
const map = L.map('map', {
  // 禁用不必要的地图交互，减少重绘
  fadeAnimation: false,
  zoomAnimation: true,
  markerZoomAnimation: false,
  // 减少地图更新频率
  preferCanvas: true,
  // 禁用自动缩放，减少不必要的动画
  trackResize: false,
  // 允许多个弹出框同时存在
  closePopupOnClick: false,
  // 缩放控制参数 - 使缩放更精细
  zoomDelta: 0.25,           // 减小缩放步长为0.25（默认为1）
  zoomSnap: 0.25,            // 允许非整数缩放级别，最小单位0.25
  wheelPxPerZoomLevel: 120,  // 增加滚动像素数，使缩放更平滑（默认60）
  wheelDebounceTime: 100     // 滚轮事件去抖时间，防止过快缩放
});

// 定义多个底图图层
// OpenStreetMap标准图层
const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  updateWhenIdle: true,
  updateWhenZooming: false,
  opacity: 1,
  updateInterval: 500
});

// CartoDB明亮风格图层
const cartodbLight = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 19
});

// CartoDB暗黑风格图层
const cartodbDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 19
});

// Esri卫星图像图层
const esriSatellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

// 默认使用OpenStreetMap图层
osmLayer.addTo(map);

// 添加图层控制器，允许用户切换不同图层
const baseMaps = {
  "OpenStreetMap": osmLayer,
  "CartoDB亮色": cartodbLight,
  "CartoDB暗色": cartodbDark,
  "卫星图像": esriSatellite
};

L.control.layers(baseMaps, null, {
  position: 'topright'
}).addTo(map);

// 自定义摄像头图标 - 使用drone.png图片
const cameraIcon = L.icon({
  iconUrl: 'img/drone.png',
  shadowUrl: null,
  iconSize: [64, 64],
  iconAnchor: [32, 32],
  popupAnchor: [0, -32]
});

// 自定义Camera4和Camera5图标 - 使用camera.png图片
const cameraPngIcon = L.icon({
  iconUrl: 'img/camera.png',
  shadowUrl: null,
  iconSize: [48, 48],
  iconAnchor: [32, 32],
  popupAnchor: [0, -32]
});

// 不再需要SVG样式
const cameraIconStyle = document.createElement('style');
cameraIconStyle.textContent = `
  .custom-camera-icon {
    background: transparent;
    border: none;
  }
`;
document.head.appendChild(cameraIconStyle);

// 自定义基站图标（与摄像头图标明显不同）
const baseStationIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: null, // 移除阴影
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

// 自定义Base Station图标 - 使用提供的图片
const customBaseStationIcon = L.icon({
  iconUrl: 'img/bs1.png', // 相对路径
  shadowUrl: null,
  iconSize: [48, 48], // 可能需要根据实际图片调整
  iconAnchor: [24, 48], // 锚点在图标底部中间
  popupAnchor: [0, -24]
});

// 自定义Nuc节点图标 - 使用提供的计算机图片
const nucIcon = L.icon({
  iconUrl: 'img/computer3.png', // 相对路径
  shadowUrl: null,
  iconSize: [48, 48], // 可能需要根据实际图片调整
  iconAnchor: [24, 48], // 锚点在图标底部中间
  popupAnchor: [0, -24]
});

// 自定义通信基站图标 - 使用SVG创建基站形状
const commBaseStationIcon = L.divIcon({
  className: 'comm-base-station-icon',
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40">
    <rect x="10" y="12" width="4" height="12" fill="#e67e22" />
    <circle cx="12" cy="9" r="3" fill="#e67e22" />
    <path d="M9,9 C9,9 5,5 5,5" stroke="#e67e22" stroke-width="1.5" />
    <path d="M15,9 C15,9 19,5 19,5" stroke="#e67e22" stroke-width="1.5" />
    <path d="M9,7 C9,7 6,4 6,4" stroke="#e67e22" stroke-width="1.5" />
    <path d="M15,7 C15,7 18,4 18,4" stroke="#e67e22" stroke-width="1.5" />
    <path d="M12,6 C12,6 12,2 12,2" stroke="#e67e22" stroke-width="1.5" />
  </svg>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

// 添加自定义CSS，为通信基站图标添加样式
const commBaseStationStyle = document.createElement('style');
commBaseStationStyle.textContent = `
  .comm-base-station-icon {
    background: transparent;
    border: none;
  }
  .comm-base-station-icon svg {
    filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.5));
  }
`;
document.head.appendChild(commBaseStationStyle);

// 自定义边缘服务器图标
const edgeServerIcon = L.icon({
  iconUrl: 'img/server1.png', // 使用自定义服务器图标
  shadowUrl: null,
  iconSize: [48, 48], // 调整大小适应图片
  iconAnchor: [24, 48], // 锚点在图标底部中间
  popupAnchor: [0, -24]
});

// 添加自定义CSS，使边缘服务器图标颜色不同
const edgeServerStyle = document.createElement('style');
edgeServerStyle.textContent = `
  .leaflet-marker-icon.edge-server-icon {
  }
`;
document.head.appendChild(edgeServerStyle);

// 添加摄像头标记
cameras.forEach(camera => {
  // 根据摄像头ID选择不同的图标
  const icon = (camera.id === 'Camera4' || camera.id === 'Camera5') ? cameraPngIcon : cameraIcon;

  const marker = L.marker([camera.lat, camera.lng], { icon: icon })
    .bindPopup(`编号：${camera.name}<br>位置：${camera.description}`, { autoClose: false, closeOnClick: false })
    .addTo(map);

  // 点击标记时更新摄像头视频显示
  marker.on('click', () => {
    updateCameraFeed(camera.id);
  });

  // 为摄像头添加永久可见的标签
  const label = L.divIcon({
    className: 'camera-label',
    html: `<div>${camera.name}</div>`,
    iconSize: [80, 20],
    iconAnchor: [40, -5]
  });

  L.marker([camera.lat, camera.lng], { icon: label, interactive: false })
    .addTo(map);
});

// 添加基站标记
baseStations.forEach((station, index) => {
  // 选择合适的图标
  let icon;
  if (station.id === 'Base Station') {
    icon = customBaseStationIcon;
  } else {
    icon = nucIcon; // Nuc1-3使用电脑图标
  }

  // 自定义弹出内容，如果是Nuc节点，不显示关联摄像头信息
  let popupContent;
  if (station.id === 'Base Station') {
    popupContent = `编号：${station.name}<br>位置：${station.description}`;
  } else {
    popupContent = `编号：${station.name}<br>位置：${station.description}`;
  }

  const marker = L.marker([station.lat, station.lng], { icon: icon })
    .bindPopup(popupContent, { autoClose: false, closeOnClick: false })
    .addTo(map);

  // 点击基站时不再显示关联摄像头信息
  marker.on('click', () => {
    // 不再需要显示关联摄像头信息
  });

  // 为基站添加永久可见的标签
  let labelText;
  if (station.id === 'Base Station') {
    labelText = 'Base Station';
  } else {
    labelText = `Nuc${index + 1}`;
  }

  const baseStationLabel = L.divIcon({
    className: 'station-label',
    html: `<div>${labelText}</div>`,
    iconSize: [120, 20],
    iconAnchor: [60, -5]
  });

  L.marker([station.lat, station.lng], { icon: baseStationLabel, interactive: false })
    .addTo(map);
});

// 添加边缘服务器标记
const edgeServerMarker = L.marker([edgeServer.lat, edgeServer.lng], { icon: edgeServerIcon })
  .bindPopup(`编号：${edgeServer.name}<br>位置：${edgeServer.location}`, { autoClose: false, closeOnClick: false })
  .addTo(map);

// 点击边缘服务器时显示信息
edgeServerMarker.on('click', () => {
  if (typeof window.addOptimizedAlertMessage === 'function') {
    window.addOptimizedAlertMessage(`Edge Server is processing data from nearby base stations`, 'info');
  } else {
    console.log('Edge Server is processing data from nearby base stations');
  }
});

// 为边缘服务器添加永久可见的标签
const edgeServerLabel = L.divIcon({
  className: 'edge-server-label',
  html: `<div>Edge Server</div>`,
  iconSize: [100, 20],
  iconAnchor: [50, -5]
});

L.marker([edgeServer.lat, edgeServer.lng], { icon: edgeServerLabel, interactive: false })
  .addTo(map);

/* 删除已注释的曲线相关代码 */

// 设置地图视图以显示所有摄像头
map.fitBounds(calculateBounds());

// 更新摄像头视频显示的函数
function updateCameraFeed(cameraId) {
  console.log(`Switching to camera: ${cameraId}`);
  // 调用camera.js中定义的全局函数来切换摄像头
  if (window.switchCamera) {
    window.switchCamera(cameraId);
  } else {
    console.error('switchCamera函数未定义，请确保camera.js已正确加载');
  }
}

// 添加对曲线功能的引用
// 注意：确保在HTML中已经引入了curves.js文件
// 如果curves.js的函数可用，则创建曲线
document.addEventListener('DOMContentLoaded', () => {
  // 延迟执行以确保curves.js已加载
  setTimeout(() => {
    if (window.mapCurves) {
      // 添加摄像头到Base Station的蓝色连线
      window.mapCurves.createCameraToBaseStationCurves(map, cameras, baseStations);

      // 保留基站到Edge Server的连线
      window.mapCurves.createBaseStationToEdgeServerCurves(map, baseStations, edgeServer);

      // 添加Base Station到Edge Server的绿色连线
      window.mapCurves.createNewBaseStationToEdgeServerCurve(map, baseStations, edgeServer);

      // 确保所有摄像头与基站的连接都被创建
      console.log("所有连接曲线已创建");
    } else {
      console.error('曲线功能未加载，请确保curves.js已正确引入');
    }
  }, 1000); // 增加延迟时间确保加载完成
});

// 添加CSS样式以美化摄像头、基站和边缘服务器标签
const labelStyle = document.createElement('style');
labelStyle.textContent = `
  .camera-label, .station-label, .edge-server-label {
    background: transparent;
    border: none;
    box-shadow: none;
  }
  .camera-label div, .station-label div, .edge-server-label div {
    color: #000000;
    font-weight: bold;
    text-shadow: 1px 1px 1px white, -1px -1px 1px white, 1px -1px 1px white, -1px 1px 1px white;
    font-size: 12px;
    white-space: nowrap;
    text-align: center;
  }
  .station-label div {
  }
  .edge-server-label div {
    font-size: 14px; /* 稍大一点的字体 */
  }
`;
document.head.appendChild(labelStyle);

// 删除旧的独立的摄像头标签样式
const oldCameraLabelStyle = document.getElementById('camera-label-style');
if (oldCameraLabelStyle) {
  oldCameraLabelStyle.remove();
} 