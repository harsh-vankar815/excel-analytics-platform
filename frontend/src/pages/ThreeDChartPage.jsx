import React, { useState } from 'react';
import ThreeDChart from '../components/ThreeDChart';
import ChartConfig3D from '../components/ChartConfig3D';
import { toast } from 'react-toastify';
import html2canvas from 'html2canvas';

const ThreeDChartPage = ({ data }) => {
  const [chartConfig, setChartConfig] = useState({
    type: 'column',
    maxHeight: 5,
    barWidth: 0.5,
    spacing: 0.2,
    animate: true,
    showGrid: true
  });

  const handleConfigChange = (newConfig) => {
    setChartConfig(newConfig);
  };

  const handleDownload = async () => {
    try {
      const chartElement = document.querySelector('#chart-container');
      const canvas = await html2canvas(chartElement);
      
      const link = document.createElement('a');
      link.download = `3d-chart-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success('Chart downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download chart. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Chart Section */}
        <div className="lg:w-2/3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                3D Visualization
              </h2>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Download Chart
              </button>
            </div>
            <div id="chart-container" className="w-full h-[600px]">
              <ThreeDChart
                data={data}
                type={chartConfig.type}
                config={chartConfig}
              />
            </div>
          </div>
        </div>

        {/* Configuration Section */}
        <div className="lg:w-1/3">
          <ChartConfig3D
            config={chartConfig}
            onConfigChange={handleConfigChange}
          />
          
          {/* Data Preview */}
          <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Data Preview
            </h3>
            <div className="overflow-auto max-h-60">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                      Label
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {data?.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                        {item.label}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                        {item.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreeDChartPage;