import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';

const validateData = (data, type) => {
  if (!Array.isArray(data)) {
    throw new Error(`Data must be an array. Received: ${typeof data}`);
  }

  if (data.length === 0) {
    throw new Error('Data array cannot be empty');
  }

  // Log the data structure for debugging
  console.log(`Validating ${type} chart data:`, JSON.stringify(data, null, 2));

  switch (type) {
    case 'column':
    case 'bar':
      const invalidItems = data.filter(item => !item.hasOwnProperty('value') || !item.hasOwnProperty('label'));
      if (invalidItems.length > 0) {
        throw new Error(`${type} chart requires each data point to have 'value' and 'label' properties. Invalid items: ${JSON.stringify(invalidItems)}`);
      }
      break;
    case 'scatter':
      const invalidScatterPoints = data.filter(item => !item.hasOwnProperty('x') || !item.hasOwnProperty('y') || !item.hasOwnProperty('z'));
      if (invalidScatterPoints.length > 0) {
        throw new Error(`Scatter chart requires each data point to have x, y, and z coordinates. Invalid points: ${JSON.stringify(invalidScatterPoints)}`);
      }
      break;
    case 'surface':
      if (!Array.isArray(data[0])) {
        throw new Error(`Surface chart requires 2D array of data points. Received: ${typeof data[0]}`);
      }
      if (!data.values || !Array.isArray(data.values)) {
        throw new Error('Surface chart requires a values property containing a 2D array');
      }
      break;
    case 'line':
      if (!data.points || !Array.isArray(data.points)) {
        throw new Error('Line chart requires a points array property');
      }
      const invalidLinePoints = data.points.filter(item => !item.hasOwnProperty('x') || !item.hasOwnProperty('y'));
      if (invalidLinePoints.length > 0) {
        throw new Error(`Line chart requires each point to have x and y coordinates. Invalid points: ${JSON.stringify(invalidLinePoints)}`);
      }
      break;
    case 'bubble':
      const invalidBubblePoints = data.filter(item => !item.hasOwnProperty('x') || !item.hasOwnProperty('y') || !item.hasOwnProperty('size'));
      if (invalidBubblePoints.length > 0) {
        throw new Error(`Bubble chart requires each data point to have x, y coordinates and size. Invalid points: ${JSON.stringify(invalidBubblePoints)}`);
      }
      break;
    default:
      throw new Error(`Unsupported chart type: ${type}`);
  }
};

export const createChart = (scene, data, type, config = {}) => {
  try {
    if (!scene) {
      throw new Error('Scene is required');
    }

    if (!data) {
      throw new Error('Data is required');
    }

    // Validate data structure based on chart type
    validateData(data, type);

    const {
      maxHeight = 5,
      barWidth = 0.5,
      spacing = 0.2,
      showGrid = true,
      showLabels = true,
    } = config;

    const isDarkMode = document.documentElement.classList.contains('dark');

    // Clear existing chart elements
    scene.children = scene.children.filter(child => 
      child.type === 'Light' || 
      child.type === 'DirectionalLight' || 
      child.type === 'AmbientLight'
    );

    // Create axes
    const axesHelper = new THREE.AxesHelper(8);
    axesHelper.setColors(
      new THREE.Color(0xff4444),
      new THREE.Color(0x44ff44),
      new THREE.Color(0x4444ff)
    );
    scene.add(axesHelper);

    // Create grid if enabled
    if (showGrid) {
      const gridHelper = new THREE.GridHelper(10, 10, 0x888888, 0x444444);
      scene.add(gridHelper);
    }

    // Create floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshPhongMaterial({
      color: isDarkMode ? 0x1e293b : 0xf8fafc,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    scene.add(floor);

    // Helper function to create labels
    const createLabel = (text, position, options = {}) => {
      if (!showLabels) return null;

      const labelDiv = document.createElement('div');
      labelDiv.className = 'chart-label';
      labelDiv.textContent = text;
      labelDiv.style.color = isDarkMode ? 'white' : 'black';
      labelDiv.style.padding = options.padding || '6px';
      labelDiv.style.background = isDarkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)';
      labelDiv.style.borderRadius = '4px';
      labelDiv.style.fontSize = options.fontSize || '12px';
      labelDiv.style.fontWeight = options.fontWeight || '500';
      labelDiv.style.boxShadow = isDarkMode ? '0 2px 4px rgba(0, 0, 0, 0.5)' : '0 2px 4px rgba(0, 0, 0, 0.2)';

      const label = new CSS2DObject(labelDiv);
      label.position.set(...position);
      scene.add(label);
      return label;
    };

    // Create chart based on type
    try {
      switch (type) {
        case 'column':
          createColumnChart(scene, data, { maxHeight, barWidth, spacing, createLabel });
          break;
        case 'bar':
          createBarChart(scene, data, { maxHeight, barWidth, spacing, createLabel });
          break;
        case 'scatter':
          createScatterChart(scene, data, { maxHeight, createLabel });
          break;
        case 'surface':
          createSurfaceChart(scene, data, { maxHeight, createLabel });
          break;
        case 'line':
          createLineChart(scene, data, { maxHeight, createLabel });
          break;
        case 'bubble':
          createBubbleChart(scene, data, { maxHeight, createLabel });
          break;
        default:
          throw new Error(`Chart type '${type}' not supported`);
      }
    } catch (chartError) {
      console.error(`Error creating ${type} chart:`, chartError);
      throw new Error(`Failed to create ${type} chart: ${chartError.message}`);
    }
  } catch (error) {
    console.error('Error in createChart:', error);
    throw error;
  }
};

function createColumnChart(scene, data, options) {
  const { maxHeight, barWidth, spacing, createLabel } = options;
  const maxValue = Math.max(...data.map(d => d.value));

  data.forEach((item, index) => {
    const height = (item.value / maxValue) * maxHeight;
    const geometry = new THREE.BoxGeometry(barWidth, height, barWidth);
    
    const material = new THREE.MeshPhysicalMaterial({
      color: item.color || 0x3b82f6,
      metalness: 0.1,
      roughness: 0.2,
      clearcoat: 0.5,
      transparent: true,
      opacity: 0.95,
    });
    
    const bar = new THREE.Mesh(geometry, material);
    bar.position.set(
      index * (barWidth + spacing) - (data.length - 1) * (barWidth + spacing) / 2,
      height / 2,
      0
    );
    bar.castShadow = true;
    bar.receiveShadow = true;
    scene.add(bar);

    // Add label
    createLabel(
      `${item.label}: ${item.value}`,
      [
        index * (barWidth + spacing) - (data.length - 1) * (barWidth + spacing) / 2,
        height + 0.5,
        0
      ]
    );
  });
}

function createScatterChart(scene, data, options) {
  const { maxHeight, createLabel } = options;
  
  data.forEach((point) => {
    const geometry = new THREE.SphereGeometry(0.15, 24, 24);
    const material = new THREE.MeshPhysicalMaterial({
      color: point.color || 0x3b82f6,
      metalness: 0.2,
      roughness: 0.3,
      clearcoat: 0.6,
      transparent: true,
      opacity: 0.9,
    });
    
    const sphere = new THREE.Mesh(geometry, material);
    const centerOffset = maxHeight / 2;
    
    sphere.position.set(
      point.x * maxHeight - centerOffset,
      point.y * maxHeight,
      point.z * maxHeight - centerOffset
    );
    
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.add(sphere);

    if (point.label) {
      createLabel(
        point.label,
        [
          point.x * maxHeight - centerOffset,
          point.y * maxHeight + 0.3,
          point.z * maxHeight - centerOffset
        ],
        { fontSize: '10px' }
      );
    }
  });
}

function createBarChart(scene, data, options) {
  const { maxHeight, barWidth, spacing, createLabel } = options;
  const maxValue = Math.max(...data.map(d => d.value));

  data.forEach((item, index) => {
    const width = (item.value / maxValue) * maxHeight;
    const geometry = new THREE.BoxGeometry(width, barWidth, barWidth);
    
    const material = new THREE.MeshPhysicalMaterial({
      color: item.color || 0x3b82f6,
      metalness: 0.1,
      roughness: 0.2,
      clearcoat: 0.5,
      transparent: true,
      opacity: 0.95,
    });
    
    const bar = new THREE.Mesh(geometry, material);
    bar.position.set(
      width / 2,
      index * (barWidth + spacing) - (data.length - 1) * (barWidth + spacing) / 2,
      0
    );
    bar.castShadow = true;
    bar.receiveShadow = true;
    scene.add(bar);

    // Add label
    createLabel(
      `${item.label}: ${item.value}`,
      [
        width + 0.5,
        index * (barWidth + spacing) - (data.length - 1) * (barWidth + spacing) / 2,
        0
      ]
    );
  });
}

function createSurfaceChart(scene, data, options) {
  const { maxHeight, createLabel } = options;
  
  if (!data.values || !Array.isArray(data.values)) {
    console.error('Surface chart requires a values array');
    return;
  }

  const geometry = new THREE.PlaneGeometry(
    maxHeight,
    maxHeight,
    data.values.length - 1,
    data.values[0].length - 1
  );

  const vertices = geometry.attributes.position.array;
  const maxZ = Math.max(...data.values.flat());
  
  for (let i = 0; i < data.values.length; i++) {
    for (let j = 0; j < data.values[i].length; j++) {
      const index = (i * data.values[i].length + j) * 3;
      vertices[index + 2] = (data.values[i][j] / maxZ) * maxHeight;
    }
  }

  const material = new THREE.MeshPhongMaterial({
    color: 0x3b82f6,
    side: THREE.DoubleSide,
    wireframe: true,
  });

  const surface = new THREE.Mesh(geometry, material);
  surface.rotation.x = -Math.PI / 2;
  surface.castShadow = true;
  surface.receiveShadow = true;
  scene.add(surface);
}

function createLineChart(scene, data, options) {
  const { maxHeight, createLabel } = options;
  
  if (!data.points || !Array.isArray(data.points)) {
    console.error('Line chart requires points array');
    return;
  }

  const points = data.points.map(point => {
    return new THREE.Vector3(
      point.x * maxHeight,
      point.y * maxHeight,
      point.z * maxHeight || 0
    );
  });

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: data.color || 0x3b82f6,
    linewidth: 2,
  });

  const line = new THREE.Line(geometry, material);
  scene.add(line);

  // Add points at each vertex
  points.forEach((point, index) => {
    const sphereGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const sphereMaterial = new THREE.MeshPhysicalMaterial({
      color: data.color || 0x3b82f6,
      metalness: 0.2,
      roughness: 0.3,
    });

    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.copy(point);
    scene.add(sphere);

    if (data.labels && data.labels[index]) {
      createLabel(
        data.labels[index],
        [point.x, point.y + 0.3, point.z],
        { fontSize: '10px' }
      );
    }
  });
}

function createBubbleChart(scene, data, options) {
  const { maxHeight, createLabel } = options;
  
  if (!Array.isArray(data)) {
    console.error('Bubble chart requires an array of data points');
    return;
  }

  const maxSize = Math.max(...data.map(d => d.size || 1));

  data.forEach(point => {
    const size = ((point.size || 1) / maxSize) * 0.5;
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    
    const material = new THREE.MeshPhysicalMaterial({
      color: point.color || 0x3b82f6,
      metalness: 0.2,
      roughness: 0.3,
      clearcoat: 0.6,
      transparent: true,
      opacity: 0.8,
    });

    const bubble = new THREE.Mesh(geometry, material);
    bubble.position.set(
      point.x * maxHeight,
      point.y * maxHeight,
      point.z * maxHeight || 0
    );
    
    bubble.castShadow = true;
    bubble.receiveShadow = true;
    scene.add(bubble);

    if (point.label) {
      createLabel(
        point.label,
        [point.x * maxHeight, point.y * maxHeight + size + 0.2, point.z * maxHeight || 0],
        { fontSize: '10px' }
      );
    }
  });
} 