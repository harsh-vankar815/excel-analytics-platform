import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';
import DemoCharts from '../components/demo/DemoCharts';


const Home = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-700 min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-10 -right-24 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-24 left-64 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative container mx-auto px-6 py-16 md:py-24 z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Content Section */}
            <motion.div
              className="lg:w-1/2 text-center lg:text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
                Transform Your Excel Data Into Interactive Visualizations
              </h1>
              <p style={{
              }} className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto lg:mx-0">
                Upload any Excel file and instantly create beautiful, interactive 2D and 3D charts powered by AI-driven insights.
              </p>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                {isAuthenticated ? (
                  <Link
                    to="/app/upload"
                    style={{
                      color: theme === 'dark' ? '#ffffff' : styles.textColor,
                      backgroundColor: theme === 'dark' ? 'black' : styles.backgroundColor
                    }}
                    className="px-8 py-4 bg-black rounded-lg hover:bg-gray-900 transition-colors text-base md:text-lg font-medium shadow-xl shadow-blue-900/30 text-white flex items-center justify-center gap-2 group"
                  >
                    Upload File
                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      style={{
                        color: 'white'
                      }}
                      className="bg-transparent px-8 py-4 text-blue-700 rounded-lg hover:bg-white/10 transition-colors text-base md:text-lg font-medium shadow-xl shadow-blue-900/30 flex items-center justify-center"
                    >
                      Get Started for Free
                    </Link>
                    <Link
                      to="/login"
                      style={{
                        color: 'white'
                      }}
                      className="px-8 py-4 border-2 border-white rounded-lg hover:bg-white/10 transition-colors text-base md:text-lg font-medium flex items-center justify-center"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/demo"
                      style={{
                        color: 'white'
                      }}
                      className="px-8 py-4 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-base md:text-lg font-medium shadow-xl shadow-blue-900/30 text-white flex items-center justify-center gap-2 group"
                    >
                      Try Demo
                      <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                    </Link>
                  </>
                )}
              </div>
            </motion.div>

            {/* Dashboard Preview */}
            <motion.div
              className="lg:w-1/2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="bg-[#1e3a8a]/90 p-8 rounded-2xl shadow-2xl border border-blue-500/30 backdrop-blur-sm">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Excel Analytics Dashboard</h2>
                </div>

                <div className="aspect-video bg-blue-800/50 rounded-xl overflow-hidden flex items-center justify-center border border-blue-600/30 shadow-inner relative group">
                  {/* Placeholder for a dashboard image */}
                  <div className="bg-blue-800/50 w-full h-full grid grid-cols-2 gap-4 p-6">
                    <div className="bg-blue-700/50 p-4 rounded-lg h-32 flex items-center justify-center">
                      <svg className="w-12 h-12 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                      </svg>
                    </div>
                    <div className="bg-blue-700/50 p-4 rounded-lg h-32 flex items-center justify-center">
                      <svg className="w-12 h-12 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <div className="bg-blue-700/50 p-4 rounded-lg h-32 col-span-2 flex items-center justify-center">
                      <div className="text-blue-300 text-xl font-medium">Excel Analytics Dashboard</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={{
        backgroundColor: theme === 'dark' ? '' : styles.backgroundColor
      }}
        className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 style={{
              color: theme === 'dark' ? '#ffffff' : styles.textColor,
            }} className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Powerful Features for Excel Data Analysis
            </h2>
            <p style={{
              color: theme === 'light' ? 'gray' : styles.textColor
            }} className="text-xl text-gray-600 dark:text-gray-300">
              Our platform provides everything you need to transform raw Excel data into meaningful insights.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Feature 1 */}
            <motion.div
              style={{
                backgroundColor: theme === 'dark' ? '' : styles.backgroundColor,
              }}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-full flex items-center justify-center mb-6 shadow-md">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <h3 style={{
                color: theme === 'light' ? 'black' : styles.textColor
              }} className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-4">
                Interactive Visualizations
              </h3>
              <p style={{
                color: theme === 'light' ? 'gray' : styles.textColor
              }} className="text-gray-600 dark:text-gray-300 text-center">
                Create stunning 2D and 3D charts with just a few clicks. Customize colors, labels, and animations.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              style={{
                backgroundColor: theme === 'dark' ? '' : styles.backgroundColor,
              }}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -5 }}
            >
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-full flex items-center justify-center mb-6 shadow-md">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
              </div>
              <h3 style={{
                color: theme === 'light' ? 'black' : styles.textColor
              }} className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-4">
                Excel File Upload
              </h3>
              <p style={{
                color: theme === 'light' ? 'gray' : styles.textColor
              }} className="text-gray-600 dark:text-gray-300 text-center">
                Easily upload .xls and .xlsx files. Our system intelligently parses data for immediate analysis.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              style={{
                backgroundColor: theme === 'dark' ? '' : styles.backgroundColor,
              }}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -5 }}
            >
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 rounded-full flex items-center justify-center mb-6 shadow-md">
                <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 style={{
                color: theme === 'light' ? 'black' : styles.textColor
              }} className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-4">
                AI-Powered Insights
              </h3>
              <p style={{
                color: theme === 'light' ? 'gray' : styles.textColor
              }} className="text-gray-600 dark:text-gray-300 text-center">
                Get smart recommendations and automatic data analysis powered by advanced machine learning algorithms.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Demo Charts Section */}
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <DemoCharts />
      </div>

      {/* CTA Section */}
      <div style={{
        backgroundColor: theme === 'dark' ? '' : styles.backgroundColor,
      }} className="bg-gray-100 dark:bg-gray-900 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 style={{
            color: theme === 'light' ? 'black' : styles.textColor
          }} className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Transform Your Excel Data?
          </h2>
          <p style={{
            color: theme === 'light' ? 'gray' : styles.textColor
          }} className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10">
            Sign up today and start creating beautiful visualizations from your Excel data in minutes.
          </p>
          <Link
            to="/register"
            style={{
              color: 'white'
            }}
            className="inline-block px-8 py-4 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium shadow-lg"
          >
            Get Started for Free
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home; 