import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Data Analyst',
    company: 'TechCorp',
    image: 'https://randomuser.me/api/portraits/women/32.jpg',
    content: 'This platform transformed how I present data to stakeholders. The visualizations are stunning and the AI insights have helped us discover patterns we would have missed.',
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Financial Advisor',
    company: 'Global Finance',
    image: 'https://randomuser.me/api/portraits/men/45.jpg',
    content: 'As someone who works with Excel spreadsheets daily, this tool has been a game-changer. I can quickly transform complex financial data into clear visualizations for my clients.',
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Marketing Director',
    company: 'Brand Innovators',
    image: 'https://randomuser.me/api/portraits/women/68.jpg',
    content: 'The 3D charts feature helped us present our campaign results in a way that truly impressed our clients. The ease of use and beautiful designs make this my go-to tool.',
  },
  {
    id: 4,
    name: 'David Park',
    role: 'Operations Manager',
    company: 'Logistics Pro',
    image: 'https://randomuser.me/api/portraits/men/22.jpg',
    content: 'We've reduced our reporting time by 60% using this platform. The ability to quickly upload Excel data and generate interactive visualizations has streamlined our processes.',
  },
];

const TestimonialSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h2 
            className="text-3xl md:text-4xl font-bold mb-6"
            style={{ color: theme === 'dark' ? '#ffffff' : '#1f2937' }}
          >
            What Our Users Say
          </h2>
          <p 
            className="text-xl"
            style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
          >
            Join thousands of professionals who have transformed how they work with Excel data
          </p>
        </motion.div>

        <div className="relative max-w-5xl mx-auto">
          {/* Testimonial Cards */}
          <div className="relative h-[400px] md:h-[300px]">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                className={`absolute w-full rounded-2xl p-6 md:p-8 shadow-lg border ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-100'
                }`}
                initial={{ opacity: 0, x: 100 }}
                animate={{ 
                  opacity: index === activeIndex ? 1 : 0,
                  x: index === activeIndex ? 0 : 100,
                  scale: index === activeIndex ? 1 : 0.9,
                }}
                transition={{ duration: 0.5 }}
                style={{
                  zIndex: index === activeIndex ? 10 : 0,
                  pointerEvents: index === activeIndex ? 'auto' : 'none',
                }}
              >
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-blue-500">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i} 
                          className="w-5 h-5 text-yellow-400" 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    
                    <blockquote>
                      <p 
                        className="text-lg md:text-xl mb-4 italic"
                        style={{ color: theme === 'dark' ? '#f3f4f6' : '#1f2937' }}
                      >
                        "{testimonial.content}"
                      </p>
                    </blockquote>
                    
                    <div className="mt-4">
                      <p 
                        className="font-semibold"
                        style={{ color: theme === 'dark' ? '#f3f4f6' : '#111827' }}
                      >
                        {testimonial.name}
                      </p>
                      <p 
                        className="text-sm"
                        style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                      >
                        {testimonial.role}, {testimonial.company}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Navigation Dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? 'bg-blue-600 w-6'
                    : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection; 