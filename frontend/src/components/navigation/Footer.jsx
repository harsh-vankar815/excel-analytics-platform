import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import './Footer.css';

const Footer = () => {
  const year = new Date().getFullYear();
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();
  
  return (
    <footer style={{
      backgroundColor: theme === 'dark' ? styles.backgroundColor : styles.footerBackground,
      borderTop: `1px solid ${styles.borderColor}`,
      marginTop: 'auto',
      color: theme === 'dark' ? styles.textColor : styles.footerText
    }} className={`footer ${theme === 'dark' ? 'footer-dark' : 'footer-light'}`}>
      <div className="footer-container">
        <div className="footer-grid">
          <div className="brand-section">
            <div className="brand-logo">
              <svg style={{ height: '1.5rem', width: '1.5rem', color: '#3b82f6' }} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 4.5C3 3.12 4.12 2 5.5 2H18.5C19.88 2 21 3.12 21 4.5V19.5C21 20.88 19.88 22 18.5 22H5.5C4.12 22 3 20.88 3 19.5V4.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 8H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 8V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="brand-name" style={{ color: styles.textColor }}>Excel Analytics</span>
            </div>
            <p className="brand-description" style={{ color: theme === 'dark' ? styles.secondaryColor : '#4b5563' }}>
              Advanced analytics and visualization for your Excel data.
            </p>
          </div>

          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: '1.5rem'
          }}>
            <div className="footer-column">
              <h3 className="column-title" style={{ color: styles.textColor }}>Platform</h3>
              <ul className="footer-links" style={{ color: theme === 'dark' ? styles.secondaryColor : '#4b5563' }}>
                <li><Link to="/features" className="footer-link" style={{ color: 'inherit' }}>Features</Link></li>
                <li><Link to="/pricing" className="footer-link" style={{ color: 'inherit' }}>Pricing</Link></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3 className="column-title" style={{ color: styles.textColor }}>Resources</h3>
              <ul className="footer-links" style={{ color: theme === 'dark' ? styles.secondaryColor : '#4b5563' }}>
                <li><Link to="/docs" className="footer-link" style={{ color: 'inherit' }}>Docs</Link></li>
                <li><Link to="/api" className="footer-link" style={{ color: 'inherit' }}>API</Link></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3 className="column-title" style={{ color: styles.textColor }}>Company</h3>
              <ul className="footer-links" style={{ color: theme === 'dark' ? styles.secondaryColor : '#4b5563' }}>
                <li><Link to="/about" className="footer-link" style={{ color: 'inherit' }}>About</Link></li>
                <li><Link to="/contact" className="footer-link" style={{ color: 'inherit' }}>Contact</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <hr style={{ 
          margin: '1.5rem 0', 
          borderColor: styles.borderColor 
        }} />
        
        <div className="footer-bottom">
          <span className="copyright" style={{ 
            color: theme === 'dark' ? '#9ca3af' : '#6b7280'
          }}>
            © {year} <Link to="/" className="footer-link" style={{ color: 'inherit' }}>Excel Analytics™</Link>. All Rights Reserved.
          </span>
          <div className="social-links">
            <a href="#" className="social-link" aria-label="Facebook page" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
              <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="social-link" aria-label="Twitter page" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
              <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a href="#" className="social-link" aria-label="GitHub account" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
              <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 