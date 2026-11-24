import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion as Motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, Lock } from 'lucide-react';
import { cleanText, isValidScore, MAX_TEXT } from '../utils/security';
import { PULSE, TEXT } from '../surveyConfig';
import EmployeeShell from '../components/EmployeeShell';
import ui from '../components/ui.module.css';
import styles from './SurveyPage.module.css';

const TOTAL = PULSE.length + TEXT.length;
const DRAFT_KEY = 'whisper_progress';
const SEND_TIMEOUT_MS = 15000;
const ENDPOINT = import.meta.env.VITE_SHEETS_ENDPOINT;

// Progress lives in sessionStorage only: it survives an accidental refresh,
// dies with the tab, and is cleared on submit. It never leaves the device.
const loadDraft = () => {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    return {
      step: Number.isInteger(d.step) ? Math.min(Math.max(d.step, 0), TOTAL - 1) : 0,
      pulse: d.pulse && typeof d.pulse === 'object' ? d.pulse : {},
      text: d.text && typeof d.text === 'object' ? d.text : {},
    };
  } catch {
    return null;
  }
};

const PulseStep = ({ question, value, onPick }) => {
  const headingRef = useRef(null);
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div>
      <p className={styles.kind}>Quick rating</p>
      <h1 id="question" ref={headingRef} tabIndex={-1} className={styles.question}>
        {question.text}
      </h1>
      <div role="radiogroup" aria-labelledby="question" className={styles.scale}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} out of 5`}
            className={`${styles.dot} ${value === n ? styles.dotOn : ''}`}
            onClick={() => onPick(n)}
          >
            {n}
          </button>
        ))}
      </div>
      <div className={styles.scaleLabels} aria-hidden="true">
        <span>Strongly disagree</span>
        <span>Strongly agree</span>
      </div>
    </div>
  );
};

const TextStep = ({ question, value, onChange }) => {
  const headingRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Only pop the keyboard on devices with a real pointer. On phones it would cover the question.
    if (window.matchMedia?.('(pointer: fine)').matches) {
      inputRef.current?.focus({ preventScroll: true });
    } else {
      headingRef.current?.focus({ preventScroll: true });
    }
  }, []);

  const left = MAX_TEXT - value.length;

  return (
    <div>
      <p className={styles.kind}>Optional</p>
      <h1 id="question" ref={headingRef} tabIndex={-1} className={styles.question}>
        {question.title}
      </h1>
      <p id="hint" className={styles.hint}>{question.hint}</p>
      <textarea
        ref={inputRef}
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={MAX_TEXT}
        rows={6}
        placeholder="Write as much or as little as you like"
        aria-labelledby="question"
        aria-describedby="hint privacy"
      />
      <div className={styles.inputMeta}>
        <span id="privacy" className={styles.privacy}>
          <Lock size={14} strokeWidth={2} aria-hidden="true" />
          Leave out your name and details only you would know.
        </span>
        {left <= 200 && <span className={styles.count}>{left} left</span>}
      </div>
    </div>
  );
};

const SurveyPage = () => {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const draft = useRef(loadDraft()).current;

  const [step, setStep] = useState(draft?.step ?? 0);
  const [dir, setDir] = useState(1);
  const [pulse, setPulse] = useState(draft?.pulse ?? {});
  const [text, setText] = useState(draft?.text ?? {});
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [advancing, setAdvancing] = useState(false);
  const timer = useRef(null);
  const honeypot = useRef(null);

  const isPulse = step < PULSE.length;
  const pulseQ = isPulse ? PULSE[step] : null;
  const textQ = isPulse ? null : TEXT[step - PULSE.length];
  const isLast = step === TOTAL - 1;
  const textValue = textQ ? text[textQ.id] ?? '' : '';
  const answered = isPulse && isValidScore(pulse[pulseQ.id]);

  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ step, pulse, text }));
    } catch {
      /* storage unavailable, fine */
    }
  }, [step, pulse, text]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const go = useCallback((d) => {
    clearTimeout(timer.current);
    setAdvancing(false);
    setError('');
    setDir(d);
    setStep((s) => Math.min(Math.max(s + d, 0), TOTAL - 1));
  }, []);

  const submit = async () => {
    const firstMissing = PULSE.findIndex((q) => !isValidScore(pulse[q.id]));
    if (firstMissing !== -1) {
      setDir(-1);
      setStep(firstMissing);
      return;
    }

    const cleaned = {};
    TEXT.forEach(({ id }) => {
      const v = cleanText(text[id]);
      if (v) cleaned[id] = v;
    });

    // The whole payload. No ID, no name, no date, no time. `hp` is only added if a bot filled the hidden field.
    const payload = { pulse, version: '3.0' };
    if (Object.keys(cleaned).length) payload.text = cleaned;
    if (honeypot.current?.value) payload.hp = honeypot.current.value;

    setSending(true);
    setError('');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);
    try {
      if (!ENDPOINT) throw new Error('no endpoint');
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        // text/plain keeps this a "simple" request, so the browser sends no CORS preflight.
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        signal: controller.signal,
      });
      const result = await res.json();
      if (!result?.ok) throw new Error('rejected');
      sessionStorage.removeItem(DRAFT_KEY);
      navigate('/thank-you', { replace: true });
    } catch {
      setError('That did not go through. Check your connection and try again. Your answers are still here.');
      setSending(false);
    } finally {
      clearTimeout(timeout);
    }
  };

  const next = () => (isLast ? submit() : go(1));

  const pick = (n) => {
    const id = pulseQ.id;
    setPulse((p) => ({ ...p, [id]: n }));
    clearTimeout(timer.current);
    setAdvancing(true);
    // Short pause so the tap registers visually, then move on.
    timer.current = setTimeout(() => go(1), reduce ? 120 : 240);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (isPulse && /^[1-5]$/.test(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey) {
        pick(Number(e.key));
      } else if (!isPulse && e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !sending) {
        next();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const variants = {
    enter: (d) => ({ opacity: 0, x: reduce ? 0 : d * 28 }),
    center: { opacity: 1, x: 0 },
    exit: (d) => ({ opacity: 0, x: reduce ? 0 : d * -28 }),
  };

  // On rating screens the button only appears when revisiting an answered question
  const showAction = !isPulse || (answered && !advancing);
  let actionLabel = 'Next';
  if (isLast) actionLabel = 'Send anonymously';
  else if (!isPulse && !textValue.trim()) actionLabel = 'Skip';

  return (
    <EmployeeShell minimal>
      <div className={styles.page}>
        <div className={styles.top}>
          <button
            type="button"
            className={styles.back}
            onClick={() => (step === 0 ? navigate('/') : go(-1))}
            aria-label={step === 0 ? 'Back to start' : 'Previous question'}
            disabled={sending}
          >
            <ArrowLeft size={22} strokeWidth={2} aria-hidden="true" />
          </button>
          <div
            className={styles.bar}
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={TOTAL}
            aria-valuenow={step + 1}
            aria-label="Progress"
          >
            <div className={styles.fill} style={{ '--p': (step + 1) / TOTAL }} />
          </div>
          <span className={styles.counter}>{step + 1} / {TOTAL}</span>
        </div>

        <div className={styles.stage}>
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <Motion.div
              key={step}
              className={styles.step}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: reduce ? 0.01 : 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {isPulse ? (
                <PulseStep question={pulseQ} value={pulse[pulseQ.id]} onPick={pick} />
              ) : (
                <TextStep
                  question={textQ}
                  value={textValue}
                  onChange={(v) => setText((t) => ({ ...t, [textQ.id]: v }))}
                />
              )}
            </Motion.div>
          </AnimatePresence>
        </div>

        {/* Honeypot: humans never see or reach this field, bots tend to fill it. */}
        <input
          ref={honeypot}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
        />

        <div className={styles.actions}>
          {error && <p role="alert" className={styles.error}>{error}</p>}
          {showAction && (
            <button
              type="button"
              className={`${ui.btn} ${!isPulse && !textValue.trim() && !isLast ? ui.ghost : ui.primary} ${styles.action}`}
              onClick={next}
              disabled={sending}
            >
              {sending ? (
                <>
                  <span className={ui.spinner} aria-hidden="true" />
                  Sending
                </>
              ) : (
                <>
                  {actionLabel}
                  {isLast ? (
                    <Lock size={18} strokeWidth={2} aria-hidden="true" />
                  ) : (
                    <ArrowRight size={20} strokeWidth={2} aria-hidden="true" />
                  )}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </EmployeeShell>
  );
};

export default SurveyPage;
