import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useTheme } from '../../contexts/ThemeContext';

const ChartPreview3D = ({ 
  data,
  selectedColumns,
  chartType = 'column'
}) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  // Create gradient background texture
  const createGradient = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    
    const gradient = context.createLinearGradient(0, 0, 0, 256);
    
    // Use theme-specific gradient colors
    if (theme === 'light') {
      gradient.addColorStop(0, '#e0f2fe'); // Light blue
      gradient.addColorStop(1, '#f8fafc'); // Light gray
    } else {
      gradient.addColorStop(0, '#0f172a'); // Dark blue
      gradient.addColorStop(1, '#1e293b'); // Dark gray
    }
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 2, 256);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    return texture;
  };

  // Function to create a 3D chart based on type
  const create3DChart = (scene, processedData, xColumn, yColumns, chartType) => {
    try {
      // Ensure we have valid data to work with
      if (!processedData || !Array.isArray(processedData) || processedData.length === 0) {
        throw new Error('Invalid or empty data for 3D chart');
      }

      // Get data values - handle different data formats
      let xValues = [];
      let yValues = [];

      // Handle different data structures
      if (typeof processedData[0] === 'object') {
        // Extract x values, with fallbacks
        xValues = processedData.map(item => {
          if (item[xColumn] !== undefined) return item[xColumn];
          if (item.category !== undefined) return item.category;
          if (item.label !== undefined) return item.label;
          if (item.name !== undefined) return item.name;
          if (item.x !== undefined) return item.x;
          return `Item ${processedData.indexOf(item) + 1}`;
        });

        // Extract y values for each column, with fallbacks
        yValues = yColumns.map(column => 
          processedData.map(item => {
            const value = parseFloat(item[column]) || 
                         parseFloat(item.value) || 
                         parseFloat(item.y) || 
                         0;
            return isNaN(value) ? 0 : value;
          })
        );
      } else if (Array.isArray(processedData[0])) {
        // Handle array of arrays format
        xValues = processedData.map((_, i) => `Item ${i+1}`);
        yValues = [processedData.map(item => {
          const value = parseFloat(Array.isArray(item) ? item[0] : item);
          return isNaN(value) ? 0 : value;
        })];
      } else {
        // Handle simple array of numbers
        xValues = processedData.map((_, i) => `Item ${i+1}`);
        yValues = [processedData.map(item => {
          const value = parseFloat(item);
          return isNaN(value) ? 0 : value;
        })];
      }
      
      // Find min/max values for scaling
      const allYValues = yValues.flat();
      const minY = Math.min(...allYValues);
      const maxY = Math.max(...allYValues);
      
      // Create chart configuration
      const barWidth = 0.4;
      const spacing = 0.1;
      const maxHeight = 2.5;
      const dataLength = Math.min(xValues.length, 8);
      const seriesCount = yValues.length;
      
      // Calculate layout
      const totalWidth = (barWidth + spacing) * dataLength * seriesCount;
      const startX = -totalWidth / 2 + barWidth / 2;
      
      // Function to normalize height
      const normalizeHeight = (value) => {
        if (maxY === minY) return 0.5; // Default height if all values are the same
        return ((value - minY) / (maxY - minY || 1)) * maxHeight || 0.1;
      };
      
      // Get color palette based on theme
      const colors = theme === 'light' 
        ? [
            0x3B82F6, // Blue
            0x10B981, // Green
            0xF97316, // Orange
            0x8B5CF6, // Purple
            0xEC4899, // Pink
            0x06B6D4, // Cyan
          ]
        : [
            0x60A5FA, // Lighter Blue
            0x34D399, // Lighter Green
            0xFBBF24, // Yellow
            0xA78BFA, // Lighter Purple
            0xF472B6, // Lighter Pink
            0x22D3EE, // Lighter Cyan
          ];
      
      // Create chart elements based on chart type
      switch(chartType) {
        case 'column':
          // Column chart (vertical bars)
          yValues.forEach((series, seriesIndex) => {
            for (let i = 0; i < Math.min(series.length, dataLength); i++) {
              const value = series[i];
              if (value === undefined || value === null || isNaN(value)) continue;
              
              const height = normalizeHeight(value);
              const color = colors[seriesIndex % colors.length];
              
              const geometry = new THREE.BoxGeometry(barWidth, height, barWidth);
              const position = new THREE.Vector3(
                startX + (barWidth + spacing) * (i + seriesIndex * dataLength),
                height / 2,
                0
              );
              
              const material = new THREE.MeshPhongMaterial({
                color: color,
                transparent: true,
                opacity: 0.9,
                shininess: 50
              });
              
              const bar = new THREE.Mesh(geometry, material);
              bar.position.copy(position);
              bar.castShadow = true;
              bar.receiveShadow = true;
              
              scene.add(bar);
            }
          });
          break;
          
        case 'bar':
          // Bar chart (horizontal bars)
          yValues.forEach((series, seriesIndex) => {
            for (let i = 0; i < Math.min(series.length, dataLength); i++) {
              const value = series[i];
              if (value === undefined || value === null || isNaN(value)) continue;
              
              const height = normalizeHeight(value);
              const color = colors[seriesIndex % colors.length];
              
              const geometry = new THREE.BoxGeometry(height, barWidth, barWidth);
              const position = new THREE.Vector3(
                height / 2,
                startX + (barWidth + spacing) * (i + seriesIndex * dataLength),
                0
              );
              
              const material = new THREE.MeshPhongMaterial({
                color: color,
                transparent: true,
                opacity: 0.9,
                shininess: 50
              });
              
              const bar = new THREE.Mesh(geometry, material);
              bar.position.copy(position);
              bar.castShadow = true;
              bar.receiveShadow = true;
              
              scene.add(bar);
            }
          });
          break;
          
        case 'scatter':
          // Scatter plot (points in 3D space)
          yValues.forEach((series, seriesIndex) => {
            for (let i = 0; i < Math.min(series.length, dataLength); i++) {
              const value = series[i];
              if (value === undefined || value === null || isNaN(value)) continue;
              
              const height = normalizeHeight(value);
              const color = colors[seriesIndex % colors.length];
              
              const geometry = new THREE.SphereGeometry(barWidth * 0.6, 16, 16);
              const position = new THREE.Vector3(
                startX + (barWidth + spacing) * (i + seriesIndex * dataLength),
                height,
                (seriesIndex * 0.5) - 1
              );
              
              const material = new THREE.MeshPhongMaterial({
                color: color,
                transparent: true,
                opacity: 0.9,
                shininess: 80
              });
              
              const sphere = new THREE.Mesh(geometry, material);
              sphere.position.copy(position);
              sphere.castShadow = true;
              
              scene.add(sphere);
            }
          });
          break;
          
        case 'line':
          // Line chart (connected points)
          yValues.forEach((series, seriesIndex) => {
            const points = [];
            
            for (let i = 0; i < Math.min(series.length, dataLength); i++) {
              const value = series[i];
              if (value === undefined || value === null || isNaN(value)) continue;
              
              const height = normalizeHeight(value);
              const color = colors[seriesIndex % colors.length];
              
              // Add point to line
              const point = new THREE.Vector3(
                startX + (barWidth + spacing) * (i + seriesIndex * dataLength),
                height,
                0
              );
              points.push(point);
              
              // Create sphere at each point
              const geometry = new THREE.SphereGeometry(barWidth * 0.4, 12, 12);
              const material = new THREE.MeshPhongMaterial({
                color: color,
                transparent: true,
                opacity: 0.9,
                shininess: 80
              });
              
              const sphere = new THREE.Mesh(geometry, material);
              sphere.position.copy(point);
              sphere.castShadow = true;
              
              scene.add(sphere);
            }
            
            // Create line connecting points
            if (points.length > 1) {
              const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
              const lineMaterial = new THREE.LineBasicMaterial({ 
                color: colors[seriesIndex % colors.length],
                linewidth: 3
              });
              
              const line = new THREE.Line(lineGeometry, lineMaterial);
              scene.add(line);
            }
          });
          break;
          
        case 'surface':
          // Surface chart (3D surface)
          const surfaceSize = 5;
          const surfaceSegments = 20;
          const surfaceGeometry = new THREE.PlaneGeometry(surfaceSize, surfaceSize, surfaceSegments, surfaceSegments);
          
          // Create a wavy surface
          const surfaceVertices = surfaceGeometry.attributes.position;
          for (let i = 0; i < surfaceVertices.count; i++) {
            const x = surfaceVertices.getX(i);
            const z = surfaceVertices.getZ(i);
            
            // Create a wavy surface using sine functions
            let y = Math.sin(x * 1.5) * 0.5 + Math.sin(z * 2) * 0.5;
            
            // Add some random peaks based on data values
            const dataIndex = i % allYValues.length;
            const dataValue = allYValues[dataIndex];
            const normalizedValue = normalizeHeight(dataValue);
            
            y += normalizedValue * 0.3;
            
            surfaceVertices.setY(i, y);
          }
          
          surfaceGeometry.computeVertexNormals();
          
          // Create gradient material for surface
          const surfaceMaterial = new THREE.MeshPhongMaterial({
            color: colors[0],
            shininess: 70,
            side: THREE.DoubleSide,
            wireframe: false,
            transparent: true,
            opacity: 0.85,
            vertexColors: false
          });
          
          const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
          surface.position.set(0, 0.5, 0);
          surface.rotation.x = -Math.PI / 2;
          surface.castShadow = true;
          surface.receiveShadow = true;
          
          scene.add(surface);
          break;
          
        case 'heatmap':
          // Heatmap (colored grid)
          const gridSize = 5;
          const cellsPerSide = Math.min(5, Math.ceil(Math.sqrt(allYValues.length)));
          const cellSize = gridSize / cellsPerSide;
          
          // Create cells based on data values
          for (let x = 0; x < cellsPerSide; x++) {
            for (let z = 0; z < cellsPerSide; z++) {
              const index = x * cellsPerSide + z;
              if (index >= allYValues.length) continue;
              
              const value = allYValues[index];
              const normalizedValue = normalizeHeight(value);
              
              // Create cell geometry
              const cellGeometry = new THREE.BoxGeometry(cellSize * 0.9, normalizedValue, cellSize * 0.9);
              
              // Determine color based on value (heat)
              const colorIndex = Math.floor(normalizedValue * colors.length / maxHeight);
              const color = colors[Math.min(colorIndex, colors.length - 1)];
              
              const cellMaterial = new THREE.MeshPhongMaterial({
                color: color,
                transparent: true,
                opacity: 0.85,
                shininess: 50
              });
              
              const cell = new THREE.Mesh(cellGeometry, cellMaterial);
              
              // Position cell in grid
              const posX = (x - cellsPerSide / 2) * cellSize + cellSize / 2;
              const posZ = (z - cellsPerSide / 2) * cellSize + cellSize / 2;
              
              cell.position.set(posX, normalizedValue / 2, posZ);
              cell.castShadow = true;
              cell.receiveShadow = true;
              
              scene.add(cell);
            }
          }
          break;
          
        case 'waterfall':
          // Waterfall chart (connected bars showing cumulative effect)
          let cumulativeHeight = 0;
          const waterFallWidth = barWidth * 1.5;
          
          // Create connecting planes
          for (let i = 0; i < Math.min(allYValues.length, 8) - 1; i++) {
            const currentValue = allYValues[i];
            const nextValue = allYValues[i + 1];
            
            if (currentValue === undefined || nextValue === undefined) continue;
            
            const currentHeight = normalizeHeight(currentValue);
            const nextHeight = normalizeHeight(nextValue);
            
            // Create bar for current value
            const barGeometry = new THREE.BoxGeometry(waterFallWidth, currentHeight, waterFallWidth);
            const barMaterial = new THREE.MeshPhongMaterial({
              color: colors[i % colors.length],
              transparent: true,
              opacity: 0.9,
              shininess: 50
            });
            
            const bar = new THREE.Mesh(barGeometry, barMaterial);
            bar.position.set(
              (i - 3) * (waterFallWidth * 1.5),
              cumulativeHeight + currentHeight / 2,
              0
            );
            bar.castShadow = true;
            bar.receiveShadow = true;
            scene.add(bar);
            
            // Create connecting plane to next bar
            const connectorGeometry = new THREE.PlaneGeometry(
              waterFallWidth * 1.5, 
              Math.abs(nextHeight - currentHeight)
            );
            
            const connectorMaterial = new THREE.MeshPhongMaterial({
              color: 0xAAAAAA,
              transparent: true,
              opacity: 0.5,
              side: THREE.DoubleSide
            });
            
            const connector = new THREE.Mesh(connectorGeometry, connectorMaterial);
            
            // Position connector between bars
            const connectorX = (i - 3) * (waterFallWidth * 1.5) + waterFallWidth * 0.75;
            const connectorY = cumulativeHeight + currentHeight;
            const connectorZ = 0;
            
            connector.position.set(connectorX, connectorY, connectorZ);
            
            // Rotate and adjust position based on whether next bar is higher or lower
            if (nextHeight > currentHeight) {
              connector.rotation.z = Math.PI / 2;
              connector.position.y = cumulativeHeight + currentHeight + (nextHeight - currentHeight) / 2;
            } else {
              connector.rotation.z = -Math.PI / 2;
              connector.position.y = cumulativeHeight + nextHeight + (currentHeight - nextHeight) / 2;
            }
            
            scene.add(connector);
            
            // Update cumulative height for next bar
            cumulativeHeight += (nextHeight - currentHeight);
          }
          
          // Add final bar
          if (allYValues.length > 0) {
            const finalValue = allYValues[Math.min(allYValues.length, 8) - 1];
            const finalHeight = normalizeHeight(finalValue);
            
            const finalBarGeometry = new THREE.BoxGeometry(waterFallWidth, finalHeight, waterFallWidth);
            const finalBarMaterial = new THREE.MeshPhongMaterial({
              color: colors[(allYValues.length - 1) % colors.length],
              transparent: true,
              opacity: 0.9,
              shininess: 50
            });
            
            const finalBar = new THREE.Mesh(finalBarGeometry, finalBarMaterial);
            finalBar.position.set(
              (Math.min(allYValues.length, 8) - 4) * (waterFallWidth * 1.5),
              cumulativeHeight + finalHeight / 2,
              0
            );
            finalBar.castShadow = true;
            finalBar.receiveShadow = true;
            scene.add(finalBar);
          }
          break;
          
        case 'bubble':
          // Bubble chart (3D bubbles with varying sizes)
          yValues.forEach((series, seriesIndex) => {
            for (let i = 0; i < Math.min(series.length, dataLength); i++) {
              const value = series[i];
              if (value === undefined || value === null || isNaN(value)) continue;
              
              const height = normalizeHeight(value);
              const color = colors[seriesIndex % colors.length];
              
              // Bubble size based on value
              const bubbleSize = Math.max(barWidth * 0.4, barWidth * height * 0.8);
              
              const geometry = new THREE.SphereGeometry(bubbleSize, 16, 16);
              const position = new THREE.Vector3(
                startX + (barWidth + spacing) * (i + seriesIndex * dataLength),
                height * 1.5,
                (seriesIndex * 0.8) - 1
              );
              
              const material = new THREE.MeshPhongMaterial({
                color: color,
                transparent: true,
                opacity: 0.7,
                shininess: 90
              });
              
              const bubble = new THREE.Mesh(geometry, material);
              bubble.position.copy(position);
              bubble.castShadow = true;
              
              scene.add(bubble);
            }
          });
          break;
          
        default:
          // Check for similar chart types before defaulting to column
          if (chartType.includes('bar') || chartType === 'horizontalBar' || chartType === 'stackedBar') {
            // Use bar chart implementation
            yValues.forEach((series, seriesIndex) => {
              for (let i = 0; i < Math.min(series.length, dataLength); i++) {
                const value = series[i];
                if (value === undefined || value === null || isNaN(value)) continue;
                
                const height = normalizeHeight(value);
                const color = colors[seriesIndex % colors.length];
                
                const geometry = new THREE.BoxGeometry(height, barWidth, barWidth);
                const position = new THREE.Vector3(
                  height / 2,
                  startX + (barWidth + spacing) * (i + seriesIndex * dataLength),
                  0
                );
                
                const material = new THREE.MeshPhongMaterial({
                  color: color,
                  transparent: true,
                  opacity: 0.9,
                  shininess: 50
                });
                
                const bar = new THREE.Mesh(geometry, material);
                bar.position.copy(position);
                bar.castShadow = true;
                bar.receiveShadow = true;
                
                scene.add(bar);
              }
            });
          } else if (chartType.includes('line') || chartType === 'area') {
            // Use line chart implementation
            yValues.forEach((series, seriesIndex) => {
              const points = [];
              
              for (let i = 0; i < Math.min(series.length, dataLength); i++) {
                const value = series[i];
                if (value === undefined || value === null || isNaN(value)) continue;
                
                const height = normalizeHeight(value);
                const color = colors[seriesIndex % colors.length];
                
                // Add point to line
                const point = new THREE.Vector3(
                  startX + (barWidth + spacing) * (i + seriesIndex * dataLength),
                  height,
                  0
                );
                points.push(point);
                
                // Create sphere at each point
                const geometry = new THREE.SphereGeometry(barWidth * 0.4, 12, 12);
                const material = new THREE.MeshPhongMaterial({
                  color: color,
                  transparent: true,
                  opacity: 0.9,
                  shininess: 80
                });
                
                const sphere = new THREE.Mesh(geometry, material);
                sphere.position.copy(point);
                sphere.castShadow = true;
                
                scene.add(sphere);
              }
              
              // Create line connecting points
              if (points.length > 1) {
                const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
                const lineMaterial = new THREE.LineBasicMaterial({ 
                  color: colors[seriesIndex % colors.length],
                  linewidth: 3
                });
                
                const line = new THREE.Line(lineGeometry, lineMaterial);
                scene.add(line);
              }
            });
          } else if (chartType.includes('scatter') || chartType === 'bubble') {
            // Use scatter chart implementation
            yValues.forEach((series, seriesIndex) => {
              for (let i = 0; i < Math.min(series.length, dataLength); i++) {
                const value = series[i];
                if (value === undefined || value === null || isNaN(value)) continue;
                
                const height = normalizeHeight(value);
                const color = colors[seriesIndex % colors.length];
                
                const geometry = new THREE.SphereGeometry(barWidth * 0.6, 16, 16);
                const position = new THREE.Vector3(
                  startX + (barWidth + spacing) * (i + seriesIndex * dataLength),
                  height,
                  (seriesIndex * 0.5) - 1
                );
                
                const material = new THREE.MeshPhongMaterial({
                  color: color,
                  transparent: true,
                  opacity: 0.9,
                  shininess: 80
                });
                
                const sphere = new THREE.Mesh(geometry, material);
                sphere.position.copy(position);
                sphere.castShadow = true;
                
                scene.add(sphere);
              }
            });
          } else {
            // Default to column chart for other types
            yValues.forEach((series, seriesIndex) => {
              for (let i = 0; i < Math.min(series.length, dataLength); i++) {
                const value = series[i];
                if (value === undefined || value === null || isNaN(value)) continue;
                
                const height = normalizeHeight(value);
                const color = colors[seriesIndex % colors.length];
                
                const geometry = new THREE.BoxGeometry(barWidth, height, barWidth);
                const position = new THREE.Vector3(
                  startX + (barWidth + spacing) * (i + seriesIndex * dataLength),
                  height / 2,
                  0
                );
                
                const material = new THREE.MeshPhongMaterial({
                  color: color,
                  transparent: true,
                  opacity: 0.9,
                  shininess: 50
                });
                
                const bar = new THREE.Mesh(geometry, material);
                bar.position.copy(position);
                bar.castShadow = true;
                bar.receiveShadow = true;
                
                scene.add(bar);
              }
            });
          }
      }
      
      // Add grid and floor
      const gridColor = theme === 'light' ? 0xAAAAAA : 0x666666;
      const gridSecondaryColor = theme === 'light' ? 0xDDDDDD : 0x444444;
      
      const gridHelper = new THREE.GridHelper(10, 10, gridColor, gridSecondaryColor);
      gridHelper.position.y = -0.01;
      gridHelper.material.opacity = theme === 'light' ? 0.9 : 0.7;
      gridHelper.material.transparent = true;
      scene.add(gridHelper);
      
      const floorGeometry = new THREE.PlaneGeometry(10, 10);
      const floorMaterial = new THREE.MeshBasicMaterial({
        color: theme === 'light' ? 0xf8fafc : 0x1e293b,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
      });
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -0.02;
      scene.add(floor);
      
    } catch (error) {
      console.error('Error creating 3D chart:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Reset error state
    setHasError(false);
    
    if (!containerRef.current) {
      return;
    }
    
    // Process data with enhanced error handling
    let processedData = [];
    try {
      if (data) {
        if (Array.isArray(data)) {
          processedData = data;
        } else if (data.source && Array.isArray(data.source)) {
          processedData = data.source;
        } else if (data.data && Array.isArray(data.data)) {
          processedData = data.data;
        } else if (data.configuration && data.configuration.source && Array.isArray(data.configuration.source)) {
          processedData = data.configuration.source;
        } else if (data.config && data.config.source && Array.isArray(data.config.source)) {
          processedData = data.config.source;
        } else if (data.configuration && data.configuration.data && Array.isArray(data.configuration.data)) {
          processedData = data.configuration.data;
        } else if (data.config && data.config.data && Array.isArray(data.config.data)) {
          processedData = data.config.data;
        } else if (typeof data === 'object') {
          try {
            // Try to extract data from nested properties
            const potentialDataArrays = [
              data.data,
              data.values,
              data.items,
              data.rows,
              Object.values(data)
            ].filter(Array.isArray);
            
            if (potentialDataArrays.length > 0) {
              // Use the longest array found
              processedData = potentialDataArrays.reduce((a, b) => 
                a.length > b.length ? a : b, []);
            }
          } catch (e) {
            console.error('Failed to convert data object to array', e);
          }
        }
      }
      
      // Use sample data if no valid data is found
      if (!processedData || !Array.isArray(processedData) || processedData.length === 0) {
        console.log('No valid data found, using sample data for preview');
        processedData = [
          { category: 'A', value: 30 },
          { category: 'B', value: 45 },
          { category: 'C', value: 25 },
          { category: 'D', value: 60 },
          { category: 'E', value: 15 }
        ];
      }
    } catch (error) {
      console.error('Error processing chart data:', error);
      // Fallback to sample data
      processedData = [
        { category: 'A', value: 30 },
        { category: 'B', value: 45 },
        { category: 'C', value: 25 },
        { category: 'D', value: 60 },
        { category: 'E', value: 15 }
      ];
    }
    
    // Extract column names with better fallbacks
    const xColumn = selectedColumns && selectedColumns.x ? selectedColumns.x : 'category';
    const yColumns = selectedColumns && Array.isArray(selectedColumns.y) && selectedColumns.y.length > 0 
      ? selectedColumns.y 
      : selectedColumns && selectedColumns.y ? [selectedColumns.y] : ['value'];
    
    setIsLoading(true);

    try {
      // Setup simplified scene
      const scene = new THREE.Scene();
      scene.background = createGradient();
      sceneRef.current = scene;
  
      // Setup camera
      const camera = new THREE.PerspectiveCamera(
        75,
        containerRef.current.clientWidth / containerRef.current.clientHeight,
        0.1,
        1000
      );
      // Position camera closer and at a better angle for small containers
      camera.position.set(3, 3, 3);
      cameraRef.current = camera;
  
      // Setup renderer with error handling
      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ 
          antialias: true,
          alpha: true,
          powerPreference: 'default'
        });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;
      } catch (error) {
        console.error('Error creating WebGL renderer:', error);
        setHasError(true);
        setIsLoading(false);
        return;
      }
  
      // Setup controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.1;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 2.0;
      controls.enableZoom = false;
      controlsRef.current = controls;
  
      // Basic lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, theme === 'light' ? 0.8 : 0.6);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, theme === 'light' ? 1.0 : 1.2);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);
      
      // Add a second directional light from another angle for better visibility
      const secondaryLight = new THREE.DirectionalLight(0xffffff, theme === 'light' ? 0.6 : 0.8);
      secondaryLight.position.set(-5, 3, -5);
      scene.add(secondaryLight);
      
      // Create simplified chart
      try {
        create3DChart(scene, processedData, xColumn, yColumns, chartType);
      } catch (error) {
        console.error('Error creating chart:', error);
        setHasError(true);
      }
  
      // Animation loop
      const animate = () => {
        if (hasError) return;
        
        animationFrameRef.current = requestAnimationFrame(animate);
        
        if (controlsRef.current) {
          controlsRef.current.update();
        }
        
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      };
      
      animate();
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing preview chart:', error);
      setHasError(true);
      setIsLoading(false);
    }

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (rendererRef.current.domElement && rendererRef.current.domElement.parentNode) {
          rendererRef.current.domElement.parentNode.removeChild(rendererRef.current.domElement);
        }
      }
      
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(m => m.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
    };
  }, [data, chartType, selectedColumns, theme]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative w-full h-full">
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ minHeight: "160px" }} // Match the card height
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 z-10">
            <div className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        )}
        
        {hasError && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span style={{ color: styles.secondaryColor }}>3D preview not available</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartPreview3D; 