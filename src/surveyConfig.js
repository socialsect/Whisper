// Question IDs are kept stable: they are the column headers in the Google Sheet.
// apps-script/Validate.gs mirrors this list, and apps-script/test.mjs fails if they drift.

export const PULSE = [
  { id: 'clarity_of_role', text: 'I know what is expected of me in my role.' },
  { id: 'collaboration_team_flow', text: 'Our team works well together and backs each other up.' },
  { id: 'balance_energy', text: 'I can keep a healthy balance between work and life.' },
  { id: 'leadership_support', text: 'Leadership gives me the support I need to do well.' },
  { id: 'growth_future', text: 'I can see a path to grow at Socialsect.' },
  { id: 'wellbeing_at_work', text: 'Overall, I feel good about being part of this team.' },
];

// All text prompts are optional. Ratings are the only required part.
export const TEXT = [
  {
    id: 'what_works_well',
    title: 'What is working well right now?',
    hint: 'Habits, systems or people we should double down on.',
  },
  {
    id: 'what_slowing_down',
    title: 'What is slowing us down?',
    hint: 'Process, tools, culture or leadership. Where do you feel drag?',
  },
  {
    id: 'one_change_tomorrow',
    title: 'If you could change one thing tomorrow, what would it be?',
    hint: 'Big or small. What would improve your day here?',
  },
  {
    id: 'leadership_perspective',
    title: 'How do you feel about the way Rayansh leads?',
    hint: 'What is strong, what is weak, what should change?',
  },
  {
    id: 'team_perspective',
    title: 'Anything to share about a teammate?',
    hint: 'Good or bad. We want honesty, not politics.',
  },
  {
    id: 'recognition',
    title: 'Who deserves a shout-out?',
    hint: 'Someone who did great work lately.',
  },
  {
    id: 'anything_else',
    title: 'Anything else leadership should know?',
    hint: 'This space is unfiltered.',
  },
];
