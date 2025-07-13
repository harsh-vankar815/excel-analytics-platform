import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { motion } from 'framer-motion';
import { CubeIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline';
import { createChart } from '../components/charts/createChart';

const ThreeDChart = ({ data, type = 'column', config = {} }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const labelRendererRef = useRef(null);
  const controlsRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!containerRef.current || !data) {
      setError('Container or data not available');
      setIsLoading(false);
      return;
    }

    try {
    setIsLoading(true);
      setError(null);

      // Setup scene
    const scene = new THREE.Scene();
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    // Create gradient background
      const canvas = document.createElement('canvas');
      canvas.width = 2;
      canvas.height = 512;
      const context = canvas.getContext('2d');
      
      const gradient = context.createLinearGradient(0, 0, 0, 512);
      if (isDarkMode) {
        gradient.addColorStop(0, '#0f172a');
        gradient.addColorStop(1, '#1e293b');
      } else {
        gradient.addColorStop(0, '#e0f2fe');
        gradient.addColorStop(1, '#f8fafc');
      }
      
      context.fillStyle = gradient;
      context.fillRect(0, 0, 2, 512);
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
    scene.background = texture;
    
    sceneRef.current = scene;

      // Setup camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(6, 6, 6);
    cameraRef.current = camera;

      // Setup WebGL renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Setup label renderer
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';
    containerRef.current.appendChild(labelRenderer.domElement);
    labelRendererRef.current = labelRenderer;

    // Setup controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 1.2;
    controls.minDistance = 3;
    controls.maxDistance = 20;
    controls.autoRotate = config.animate || false;
    controls.autoRotateSpeed = 1.0;
    controlsRef.current = controls;

      // Setup lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(isDarkMode ? 0xffffff : 0xffffee, 1);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
      // Create chart
      createChart(scene, data, type, config);

      // Animation loop
      const animate = () => {
        if (!sceneRef.current || !cameraRef.current || !rendererRef.current || !controlsRef.current) return;
        
        animationFrameRef.current = requestAnimationFrame(animate);
        controlsRef.current.update();
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        if (labelRendererRef.current) {
          labelRendererRef.current.render(sceneRef.current, cameraRef.current);
        }
    };
    
    animate();
      setIsLoading(false);

      // Cleanup function
    return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
      }

      if (containerRef.current) {
          while (containerRef.current.firstChild) {
            containerRef.current.removeChild(containerRef.current.firstChild);
          }
        }

        if (rendererRef.current) {
          rendererRef.current.dispose();
        }

        if (sceneRef.current) {
          sceneRef.current.traverse((object) => {
            if (object.geometry) {
              object.geometry.dispose();
            }
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose());
              } else {
                object.material.dispose();
              }
        }
      });
    }
  };
    } catch (err) {
      console.error('Error initializing 3D chart:', err);
      setError(`Failed to initialize 3D chart: ${err.message}`);
      setIsLoading(false);
    }
  }, [data, type, config]);

  // Handle window resize
  useEffect(() => {
  const handleResize = () => {
    if (!containerRef.current || !cameraRef.current || !rendererRef.current || !labelRendererRef.current) return;
    
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    
    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();
    
    rendererRef.current.setSize(width, height);
    labelRendererRef.current.setSize(width, height);
  };
  
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] text-red-500">
        <div className="text-center">
          <div className="text-xl mb-2">Error</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className={`relative rounded-xl overflow-hidden ${
        isFullScreen 
          ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' 
          : 'w-full h-full min-h-[400px]'
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1), transparent 80%)',
        }}
      />
      
      <button
        onClick={() => setIsFullScreen(!isFullScreen)}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
      >
        {isFullScreen ? (
          <ArrowsPointingInIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        ) : (
          <ArrowsPointingOutIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        )}
      </button>
    </motion.div>
  );
};

export default ThreeDChart; 