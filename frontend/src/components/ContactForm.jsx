import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import Card from './ui/Card';
import { Button } from './ui/Button';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/contact', formData);
      toast.success('Message sent successfully! We will get back to you soon.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    }

    setLoading(false);
  };

  return (
    <Card 
      variant="glassmorphic" 
      size="lg"
      className="max-w-2xl mx-auto"
      title="Contact Us"
      subtitle="We'd love to hear from you! Fill out the form below and we'll get back to you as soon as possible."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base px-4 py-3"
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base px-4 py-3"
              placeholder="your.email@example.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base px-4 py-3"
            placeholder="What would you like to discuss?"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            value={formData.message}
            onChange={handleChange}
            required
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base px-4 py-3"
            placeholder="Please type your message here..."
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth={true}
            isLoading={loading}
            loadingText="Sending your message..."
            icon={PaperAirplaneIcon}
          >
            Send Message
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ContactForm; 