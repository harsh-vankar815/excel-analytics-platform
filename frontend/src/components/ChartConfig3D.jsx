import { useState } from 'react';
import { Switch } from '@headlessui/react';
import Card from './ui/Card';
import { Button } from './ui/Button';
import { 
  CubeTransparentIcon, 
  Cog6ToothIcon, 
  ArrowPathIcon, 
  ViewfinderCircleIcon,
  CubeIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const ChartConfig3D = ({ config, onConfigChange }) => {
  const [localConfig, setLocalConfig] = useState(config);

  const handleChange = (field, value) => {
    const newConfig = {
      ...localConfig,
      [field]: value
    };
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
  };

  const resetConfig = () => {
    const defaultConfig = {
      type: 'column',
      maxHeight: 5,
      barWidth: 0.5,
      spacing: 0.2,
      animate: false,
      showGrid: true
    };
    setLocalConfig(defaultConfig);
    onConfigChange(defaultConfig);
  };

  return (
    <Card
      variant="glassmorphic"
      title="3D Chart Configuration"
      subtitle="Customize your 3D visualization options"
      icon={Cog6ToothIcon}
      className="mb-6"
      footer={
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            icon={ArrowPathIcon}
            onClick={resetConfig}
          >
            Reset Defaults
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Chart Type Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Chart Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Column Chart Option */}
            <button
              type="button"
              onClick={() => handleChange('type', 'column')}
              className={`relative overflow-hidden group rounded-xl border-2 p-4 transition-all duration-300 ${
                localConfig.type === 'column'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-md'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative flex flex-col items-center">
                <div className="w-12 h-12 mb-3 flex items-end justify-center">
                  <div className="flex space-x-1">
                    <div className="bg-blue-400 dark:bg-blue-500 w-3 rounded-t-sm" style={{ height: '24px' }}></div>
                    <div className="bg-blue-500 dark:bg-blue-600 w-3 rounded-t-sm" style={{ height: '36px' }}></div>
                    <div className="bg-blue-600 dark:bg-blue-700 w-3 rounded-t-sm" style={{ height: '28px' }}></div>
                  </div>
                </div>
                <span className="text-sm font-medium">Column Chart</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Compare values vertically</p>
              </div>
            </button>
            
            {/* Bar Chart Option */}
            <button
              type="button"
              onClick={() => handleChange('type', 'bar')}
              className={`relative overflow-hidden group rounded-xl border-2 p-4 transition-all duration-300 ${
                localConfig.type === 'bar'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 shadow-md'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative flex flex-col items-center">
                <div className="w-12 h-12 mb-3 flex items-center justify-center">
                  <div className="flex flex-col space-y-1">
                    <div className="bg-green-600 dark:bg-green-700 h-3 rounded-r-sm" style={{ width: '36px' }}></div>
                    <div className="bg-green-500 dark:bg-green-600 h-3 rounded-r-sm" style={{ width: '24px' }}></div>
                    <div className="bg-green-400 dark:bg-green-500 h-3 rounded-r-sm" style={{ width: '30px' }}></div>
                  </div>
                </div>
                <span className="text-sm font-medium">Bar Chart</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Compare values horizontally</p>
              </div>
            </button>
            
            {/* Scatter Plot Option */}
            <button
              type="button"
              onClick={() => handleChange('type', 'scatter')}
              className={`relative overflow-hidden group rounded-xl border-2 p-4 transition-all duration-300 ${
                localConfig.type === 'scatter'
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 shadow-md'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative flex flex-col items-center">
                <div className="w-12 h-12 mb-3 flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute w-3 h-3 rounded-full bg-purple-400 dark:bg-purple-500" style={{ top: '-8px', left: '-12px' }}></div>
                    <div className="absolute w-3 h-3 rounded-full bg-purple-500 dark:bg-purple-600" style={{ top: '5px', left: '0px' }}></div>
                    <div className="absolute w-3 h-3 rounded-full bg-purple-600 dark:bg-purple-700" style={{ top: '-2px', left: '10px' }}></div>
                    <div className="absolute w-3 h-3 rounded-full bg-purple-700 dark:bg-purple-800" style={{ top: '10px', left: '-8px' }}></div>
                  </div>
                </div>
                <span className="text-sm font-medium">Scatter Plot</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Show data point distribution</p>
              </div>
            </button>
          </div>
        </div>

        {/* Height Configuration */}
        <div className="space-y-2 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <ViewfinderCircleIcon className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Maximum Height
              </label>
            </div>
            <span className="text-sm font-mono px-3 py-1 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 min-w-[3rem] text-center">
              {localConfig.maxHeight || 5}
            </span>
          </div>
          <div className="pt-2">
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={localConfig.maxHeight || 5}
              onChange={(e) => handleChange('maxHeight', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1 px-1">
              <span>1</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>
        </div>

        {/* Bar Width (for column/bar charts) */}
        {(localConfig.type === 'column' || localConfig.type === 'bar') && (
          <div className="space-y-2 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <CubeIcon className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bar Width
                </label>
              </div>
              <span className="text-sm font-mono px-3 py-1 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 min-w-[3rem] text-center">
                {localConfig.barWidth || 0.5}
              </span>
            </div>
            <div className="pt-2">
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={localConfig.barWidth || 0.5}
                onChange={(e) => handleChange('barWidth', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1 px-1">
                <span>Thin</span>
                <span>Medium</span>
                <span>Thick</span>
              </div>
            </div>
          </div>
        )}

        {/* Spacing Configuration */}
        <div className="space-y-2 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <GlobeAltIcon className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Element Spacing
              </label>
            </div>
            <span className="text-sm font-mono px-3 py-1 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 min-w-[3rem] text-center">
              {localConfig.spacing || 0.2}
            </span>
          </div>
          <div className="pt-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={localConfig.spacing || 0.2}
              onChange={(e) => handleChange('spacing', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1 px-1">
              <span>None</span>
              <span>Medium</span>
              <span>Wide</span>
            </div>
          </div>
        </div>

        {/* Toggle Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Animation Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30 shadow-sm">
            <div className="flex items-center">
              <div className="mr-3 p-2 rounded-full bg-blue-100 dark:bg-blue-900/40">
                <CubeTransparentIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Auto-Rotate
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Automatically rotate chart</p>
              </div>
            </div>
            <Switch
              checked={localConfig.animate || false}
              onChange={(checked) => handleChange('animate', checked)}
              className={`${
                localConfig.animate ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              <span className="sr-only">Enable animation</span>
              <span
                className={`${
                  localConfig.animate ? 'translate-x-6 bg-white' : 'translate-x-1 bg-white'
                } inline-block h-4 w-4 transform rounded-full transition-transform`}
              />
            </Switch>
          </div>

          {/* Grid Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30 shadow-sm">
            <div className="flex items-center">
              <div className="mr-3 p-2 rounded-full bg-blue-100 dark:bg-blue-900/40">
                <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18"></path>
                </svg>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Show Grid
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Display coordinate grid</p>
              </div>
            </div>
            <Switch
              checked={localConfig.showGrid || false}
              onChange={(checked) => handleChange('showGrid', checked)}
              className={`${
                localConfig.showGrid ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              <span className="sr-only">Show grid</span>
              <span
                className={`${
                  localConfig.showGrid ? 'translate-x-6 bg-white' : 'translate-x-1 bg-white'
                } inline-block h-4 w-4 transform rounded-full transition-transform`}
              />
            </Switch>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ChartConfig3D;