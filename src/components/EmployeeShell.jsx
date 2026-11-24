import { Link } from 'react-router-dom';
import styles from './EmployeeShell.module.css';

// Wraps the three employee-facing pages. Owns the theme tokens (light/dark follows the system).
const EmployeeShell = ({ children, minimal = false }) => (
  <div className={styles.shell}>
    {!minimal && (
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          <span className={styles.mark}>
            <img src="/logo.png" alt="" width="20" height="20" />
          </span>
          <span>Whisper</span>
        </Link>
      </header>
    )}

    <main className={styles.main}>{children}</main>

    {!minimal && (
      <footer className={styles.footer}>
        <span>Built by Socialsect</span>
        <a href="https://github.com/socialsect/Whisper" target="_blank" rel="noopener noreferrer">
          Check the source code
        </a>
      </footer>
    )}
  </div>
);

export default EmployeeShell;
