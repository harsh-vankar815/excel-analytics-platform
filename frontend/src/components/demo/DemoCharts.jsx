import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { salesData, productData, performanceData, chartColors, getColorWithOpacity } from '../../utils/demoData';
import Interactive3DChart from '../charts/Interactive3DChart';
import { useTheme } from '../../contexts/ThemeContext';
import { LockClosedIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DemoCharts = () => {
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();
  const [activeTab, setActiveTab] = useState('2d');

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: theme === 'dark' ? 'rgb(229, 231, 235)' : 'rgb(55, 65, 81)',
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        color: theme === 'dark' ? 'rgb(229, 231, 235)' : 'rgb(55, 65, 81)',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: theme === 'dark' ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'
        }
      },
      y: {
        grid: {
          color: theme === 'dark' ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.5)'
        },
        ticks: {
          color: theme === 'dark' ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'
        }
      }
    }
  };

  // 2D Chart data
  const barChartData = {
    labels: salesData.map(item => item.Month),
    datasets: [
      {
        label: 'Sales',
        data: salesData.map(item => item.Sales),
        backgroundColor: getColorWithOpacity(chartColors[0]),
        borderColor: chartColors[0],
        borderWidth: 1
      },
      {
        label: 'Expenses',
        data: salesData.map(item => item.Expenses),
        backgroundColor: getColorWithOpacity(chartColors[1]),
        borderColor: chartColors[1],
        borderWidth: 1
      }
    ]
  };

  const lineChartData = {
    labels: salesData.map(item => item.Month),
    datasets: [
      {
        label: 'Profit',
        data: salesData.map(item => item.Profit),
        backgroundColor: getColorWithOpacity(chartColors[2]),
        borderColor: chartColors[2],
        borderWidth: 2,
        tension: 0.3,
        fill: true
      }
    ]
  };

  const pieChartData = {
    labels: productData.map(item => item.Product),
    datasets: [
      {
        data: productData.map(item => item.Revenue),
        backgroundColor: productData.map((_, i) => getColorWithOpacity(chartColors[i % chartColors.length])),
        borderColor: productData.map((_, i) => chartColors[i % chartColors.length]),
        borderWidth: 1
      }
    ]
  };

  // 3D Chart data
  const data3D = {
    datasets: [{
      label: 'Performance Metrics',
      data: performanceData.map(point => ({
        x: point.X,
        y: point.Y,
        z: point.Z
      })),
      backgroundColor: performanceData.map(point => 
        `rgba(${60 + point.X * 15}, ${100 + point.Z * 15}, 255, 0.7)`
      )
    }]
  };

  const options3D = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { title: { display: true, text: 'X Axis' } },
      y: { title: { display: true, text: 'Y Axis' } },
      z: { title: { display: true, text: 'Z Axis' } }
    },
    plugins: {
      title: {
        display: true,
        text: 'Interactive 3D Surface Chart',
        color: theme === 'dark' ? 'rgb(229, 231, 235)' : 'rgb(55, 65, 81)',
        font: { size: 16, weight: 'bold' }
      }
    }
  };

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className={`text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Try Our Excel Analytics Platform
          </h2>
          <p className={`text-xl max-w-3xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Explore sample charts without signing up. Create your own visualizations from Excel data by registering for free.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-md shadow-sm" role="group">
          </div>
        </div>

        {/* Chart Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {activeTab === '2d' ? (
            <>
              {/* 2D Charts */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
              >
                <h3 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Monthly Sales & Expenses
                </h3>
                <div className="h-80">
                  <Bar 
                    data={barChartData} 
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        title: {
                          ...chartOptions.plugins.title,
                          text: 'Monthly Sales & Expenses'
                        }
                      }
                    }} 
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={`p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
              >
                <h3 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Monthly Profit Trend
                </h3>
                <div className="h-80">
                  <Line 
                    data={lineChartData} 
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        title: {
                          ...chartOptions.plugins.title,
                          text: 'Monthly Profit Trend'
                        }
                      }
                    }} 
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
              >
                <h3 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Product Revenue Distribution
                </h3>
                <div className="h-80">
                  <Pie 
                    data={pieChartData} 
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        title: {
                          ...chartOptions.plugins.title,
                          text: 'Product Revenue Distribution'
                        }
                      }
                    }} 
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className={`flex items-center justify-center p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'} border-2 border-dashed ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}
              >
                <div className="text-center p-6">
                  <LockClosedIcon className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    More Chart Types Available
                  </h3>
                  <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Sign up to access more chart types including radar, bubble, scatter, and more.
                  </p>
                  <Link
                    to="/register"
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                  >
                    Sign Up Now
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </motion.div>
            </>
          ) : (
            <>
              {/* 3D Charts */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`p-6 rounded-xl shadow-lg col-span-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
              >
                <h3 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  3D Surface Chart
                </h3>
                <div className="h-[500px]">
                  <Interactive3DChart 
                    data={data3D}
                    options={options3D}
                    chartType="surface"
                    isDemoMode={true}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`flex items-center justify-center p-6 rounded-xl shadow-lg col-span-2 ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'} border-2 border-dashed ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}
              >
                <div className="text-center p-6 max-w-lg">
                  <LockClosedIcon className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Create Your Own 3D Visualizations
                  </h3>
                  <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Sign up to create custom 3D charts from your Excel data. Access more chart types including 3D scatter, bar, column, and bubble charts.
                  </p>
                  <Link
                    to="/register"
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                  >
                    Sign Up Now
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </motion.div>
            </>
          )}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={`text-center p-8 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-blue-50'} shadow-lg`}
        >
          <h3 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Ready to Create Your Own Charts?
          </h3>
          <p className={`text-lg mb-6 max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Upload your Excel files and create custom interactive visualizations with our full-featured analytics platform.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className={`px-6 py-3 rounded-lg font-medium ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
              Sign Up Free
            </Link>
            <Link
              to="/login"
              className={`px-6 py-3 rounded-lg font-medium ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-300'}`}
            >
              Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DemoCharts; 