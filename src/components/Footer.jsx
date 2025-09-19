import { Github, ExternalLink } from 'lucide-react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.left}>
            <p className={styles.tagline}>
              Built with transparency in mind
            </p>
          </div>
          
          <div className={styles.right}>
            <a 
              href="https://github.com/socialsect/Whisper" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.sourceLink}
            >
              <Github size={16} />
              <span>Don't Trust Us? Check the Source Code</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
        
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © 2025 Socialsect. Open source and transparent.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
