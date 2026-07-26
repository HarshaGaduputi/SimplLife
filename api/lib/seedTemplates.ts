import type { Template } from "../../shared/types.js";

export const SEED_TEMPLATES: Template[] = [
  {
    id: "tpl-study-session",
    slug: "study-session",
    name: "Study Session",
    description:
      "Structure one focused study block with review, active reading, and self-test.",
    mainTaskTitle: "Study Session",
    subtasks: [
      { title: "Review last notes", order: 1 },
      { title: "Read assigned chapter", order: 2 },
      { title: "Write 3-question self-quiz", order: 3 },
    ],
    builtin: true,
  },
  {
    id: "tpl-work-project",
    slug: "work-project",
    name: "Work Project",
    description:
      "Plan a typical work project: scoping, execution milestones, and handoff.",
    mainTaskTitle: "Work Project",
    subtasks: [
      { title: "Clarify scope & stakeholders", order: 1 },
      { title: "Draft milestones", order: 2 },
      { title: "Implement first milestone", order: 3 },
    ],
    builtin: true,
  },
  {
    id: "tpl-weekly-goals",
    slug: "weekly-goals",
    name: "Weekly Goals",
    description: "Weekly split: set goals, mid-check, and end-of-week review.",
    mainTaskTitle: "Weekly Goals",
    subtasks: [
      { title: "List 3-5 goals for the week", order: 1 },
      { title: "Mid-week check-in", order: 2 },
      { title: "Sunday review & plan next", order: 3 },
    ],
    builtin: true,
  },
  {
    id: "tpl-event-planning",
    slug: "event-planning",
    name: "Event Planning",
    description: "Organize an event from idea to post-mortem.",
    mainTaskTitle: "Event Planning",
    subtasks: [
      { title: "Lock date, venue, budget", order: 1 },
      { title: "Send invites and track RSVPs", order: 2 },
      { title: "Run the day and wrap up", order: 3 },
    ],
    builtin: true,
  },
  {
    id: "tpl-personal-errands",
    slug: "personal-errands",
    name: "Personal Errands",
    description:
      "Run errands with a structured list and a final confirmation pass.",
    mainTaskTitle: "Personal Errands",
    subtasks: [
      { title: "Groceries (meal plan list)", order: 1 },
      { title: "Drop-offs & pickups", order: 2 },
      { title: "Quick tidy at home", order: 3 },
    ],
    builtin: true,
  },
  {
    id: "tpl-reading-list",
    slug: "reading-list",
    name: "Reading List",
    description: "Track a reading goal: pick, read, capture takeaways.",
    mainTaskTitle: "Reading List",
    subtasks: [
      { title: "Choose a book / article", order: 1 },
      { title: "Read target pages/chapters", order: 2 },
      { title: "Write 3 takeaways", order: 3 },
    ],
    builtin: true,
  },
  {
    id: "tpl-health-fitness",
    slug: "health-fitness",
    name: "Health & Fitness",
    description: "A weekly balanced routine: movement, meals, recovery.",
    mainTaskTitle: "Health & Fitness",
    subtasks: [
      { title: "Plan 3+ workouts", order: 1 },
      { title: "Prep 2 healthy meals", order: 2 },
      { title: "Stretch and sleep tracker", order: 3 },
    ],
    builtin: true,
  },
  {
    id: "tpl-shopping-run",
    slug: "shopping-run",
    name: "Shopping Run",
    description: "Plan and execute a shopping run with a budget check.",
    mainTaskTitle: "Shopping Run",
    subtasks: [
      { title: "Make list + set budget", order: 1 },
      { title: "Compare 2 key items", order: 2 },
      { title: "Check out and unpack", order: 3 },
    ],
    builtin: true,
  },
  {
    id: "tpl-client-task",
    slug: "client-task",
    name: "Client Task",
    description:
      "Deliver a client deliverable with brief, first draft, and final review.",
    mainTaskTitle: "Client Task",
    subtasks: [
      { title: "Confirm brief & deadline", order: 1 },
      { title: "Deliver first draft", order: 2 },
      { title: "Incorporate feedback & ship", order: 3 },
    ],
    builtin: true,
  },
  {
    id: "tpl-bug-fix",
    slug: "bug-fix",
    name: "Bug Fix",
    description: "Reproduce, root-cause, fix, and verify a bug end-to-end.",
    mainTaskTitle: "Bug Fix",
    subtasks: [
      { title: "Reproduce + screenshot/logs", order: 1 },
      { title: "Identify root cause", order: 2 },
      { title: "Fix, test, open PR", order: 3 },
    ],
    builtin: true,
  },
];
