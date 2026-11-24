import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import EmployeeShell from '../components/EmployeeShell';
import ui from '../components/ui.module.css';
import styles from './LandingPage.module.css';

const PROMISES = [
  { title: 'No login', body: 'You never sign in, so there is no account to trace.' },
  { title: 'No name, email or ID', body: 'A response is only your ratings and your words. Nothing else is saved with it.' },
  { title: 'No date, no time', body: 'Answers reach leadership in shuffled batches, so their order never shows who replied when.' },
  { title: 'Open source', body: 'The code is public, so you can check every one of these claims.' },
];

const LandingPage = () => (
  <EmployeeShell>
    <section className={styles.hero}>
      <div className={styles.copy}>
        <h1 className={styles.title}>Two minutes. Zero names.</h1>
        <p className={styles.lead}>
          Six quick taps and a few short written questions. Nothing saved with your answers can be traced back to you.
        </p>
        <Link to="/survey" className={`${ui.btn} ${ui.primary} ${styles.cta}`}>
          Start
          <ArrowRight size={20} strokeWidth={2} aria-hidden="true" />
        </Link>
      </div>

      <div className={styles.visual} aria-hidden="true">
        <span className={styles.ring} />
        <span className={styles.ring} />
        <span className={styles.ring} />
        <span className={styles.core} />
      </div>
    </section>

    <section className={styles.how} aria-labelledby="how-title">
      <h2 id="how-title" className={styles.howTitle}>How your anonymity works</h2>
      <dl className={styles.list}>
        {PROMISES.map(({ title, body }) => (
          <div key={title} className={styles.row}>
            <dt>{title}</dt>
            <dd>{body}</dd>
          </div>
        ))}
      </dl>
    </section>
  </EmployeeShell>
);

export default LandingPage;
