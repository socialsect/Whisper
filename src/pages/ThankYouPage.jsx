import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import EmployeeShell from '../components/EmployeeShell';
import ui from '../components/ui.module.css';
import styles from './ThankYouPage.module.css';

const NEXT = [
  'Leadership reads every response and looks for patterns, not people.',
  'The themes that keep coming up become clear actions with owners.',
  'We share what changed, and what did not, back with the team.',
];

const ThankYouPage = () => (
  <EmployeeShell>
    <section className={styles.wrap}>
      <span className={styles.tick} aria-hidden="true">
        <Check size={32} strokeWidth={2.5} />
      </span>

      <h1 className={styles.title}>Sent. Thank you for being honest.</h1>
      <p className={styles.lead}>
        Your answers are stored without your name, account or the time you sent them. You can close this tab. Nothing is kept on this device.
      </p>

      <h2 className={styles.next}>What happens next</h2>
      <ol className={styles.steps}>
        {NEXT.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ol>

      <Link to="/" className={`${ui.btn} ${ui.ghost}`}>
        Back to start
      </Link>
    </section>
  </EmployeeShell>
);

export default ThankYouPage;
