import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import DemoCharts from '../components/demo/DemoCharts';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const Demo = () => {
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className={`relative py-16 ${theme === 'dark' ? 'bg-gray-900' : 'bg-blue-50'}`}>
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className={`text-4xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Excel Analytics Demo
            </h1>
            <p className={`text-xl mb-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Try our platform without signing up. Explore sample visualizations and see how you can transform your Excel data into beautiful, interactive charts.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/register"
                className={`px-6 py-3 rounded-lg font-medium flex items-center ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              >
                Sign Up Free
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </Link>
              <Link
                to="/"
                className={`px-6 py-3 rounded-lg font-medium ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-300'}`}
              >
                Back to Home
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Demo Charts */}
      <DemoCharts />

      {/* Features Comparison */}
      <div className={`py-16 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className={`text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Demo vs Full Version
            </h2>
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              See what additional features you get when you sign up for a free account
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Demo Features */}
            <motion.div
              className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className={`text-xl font-semibold mb-6 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Demo Version
              </h3>
              <ul className={`space-y-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  View sample 2D charts
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  View sample 3D charts
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  Basic chart interactions
                </li>
                <li className="flex items-center opacity-50">
                  <svg className="w-5 h-5 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                  </svg>
                  Upload your own Excel files
                </li>
                <li className="flex items-center opacity-50">
                  <svg className="w-5 h-5 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                  </svg>
                  Create custom charts
                </li>
                <li className="flex items-center opacity-50">
                  <svg className="w-5 h-5 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                  </svg>
                  Save and share charts
                </li>
              </ul>
            </motion.div>

            {/* Full Version Features */}
            <motion.div
              className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-blue-900' : 'bg-blue-50'} border ${theme === 'dark' ? 'border-blue-700' : 'border-blue-200'}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className={`text-xl font-semibold mb-6 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Full Version (Free)
              </h3>
              <ul className={`space-y-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  All demo features
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  Upload your own Excel files
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  Create custom 2D & 3D charts
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  Access to all chart types
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  Save and share your charts
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  AI-powered insights
                </li>
              </ul>
            </motion.div>
          </div>

          <div className="text-center mt-12">
            <Link
              to="/register"
              className={`inline-flex items-center px-6 py-3 rounded-lg font-medium ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
              Create Free Account
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo; 