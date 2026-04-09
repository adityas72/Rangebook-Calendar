import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { AnimatePresence, LayoutGroup, motion, useScroll, useSpring, useTransform } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  Eraser,
  FileText,
  Image,
  Keyboard,
  Moon,
  PenLine,
  Printer,
  Sparkles,
  Sun,
  Wand2
} from "lucide-react";
import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  startOfMonth,
  startOfWeek
} from "date-fns";
import "./styles.css";

const monthStories = [
  {
    title: "January Reset",
    mood: "quiet focus",
    image: "https://images.unsplash.com/photo-1483664852095-d6cc6870702d?auto=format&fit=crop&w=1800&q=86",
    accent: "#2f8f83",
    accentTwo: "#dfe8da",
    ink: "#14201e",
    copy: "A clean page for decisions that deserve room."
  },
  {
    title: "February Pulse",
    mood: "soft signal",
    image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1800&q=86",
    accent: "#c84c69",
    accentTwo: "#f7d5de",
    ink: "#24181d",
    copy: "Short month, sharper edges, warmer notes."
  },
  {
    title: "March Motion",
    mood: "fresh start",
    image: "https://images.unsplash.com/photo-1455218873509-8097305ee378?auto=format&fit=crop&w=1800&q=86",
    accent: "#1f9965",
    accentTwo: "#d7eadb",
    ink: "#14211a",
    copy: "Green edges and decisions with momentum."
  },
  {
    title: "April Light",
    mood: "clear weather",
    image: "https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?auto=format&fit=crop&w=1800&q=86",
    accent: "#e6503f",
    accentTwo: "#dceee8",
    ink: "#201a18",
    copy: "The month opens like a window."
  },
  {
    title: "May Orchard",
    mood: "bright work",
    image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1800&q=86",
    accent: "#ee6848",
    accentTwo: "#e7f1d5",
    ink: "#211b16",
    copy: "Warm notes, honest pacing, better rituals."
  },
  {
    title: "June Current",
    mood: "cool motion",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=86",
    accent: "#008d9b",
    accentTwo: "#d3eef0",
    ink: "#101e21",
    copy: "A tide chart for plans that keep moving."
  },
  {
    title: "July High Sun",
    mood: "bold days",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=86",
    accent: "#db5731",
    accentTwo: "#f8df7d",
    ink: "#24190f",
    copy: "Loud color, long light, fewer maybes."
  },
  {
    title: "August Drift",
    mood: "open water",
    image: "https://images.unsplash.com/photo-1471922694854-ff1b63b20054?auto=format&fit=crop&w=1800&q=86",
    accent: "#0a9f8b",
    accentTwo: "#d4ece7",
    ink: "#11201f",
    copy: "Keep the plans breathable and the water close."
  },
  {
    title: "September Draft",
    mood: "new system",
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1800&q=86",
    accent: "#c85a34",
    accentTwo: "#e9e0ca",
    ink: "#211a12",
    copy: "New notebooks and better defaults."
  },
  {
    title: "October Signal",
    mood: "crisp focus",
    image: "https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?auto=format&fit=crop&w=1800&q=86",
    accent: "#b94a33",
    accentTwo: "#efd8c7",
    ink: "#221713",
    copy: "The good kind of deadline, written cleanly."
  },
  {
    title: "November Table",
    mood: "gathered",
    image: "https://images.unsplash.com/photo-1476820865390-c52aeebb9891?auto=format&fit=crop&w=1800&q=86",
    accent: "#5f8650",
    accentTwo: "#dce8d3",
    ink: "#182014",
    copy: "Gather the loose threads before the year closes."
  },
  {
    title: "December Glow",
    mood: "final pages",
    image: "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?auto=format&fit=crop&w=1800&q=86",
    accent: "#c43d50",
    accentTwo: "#f0d6d9",
    ink: "#221417",
    copy: "Quiet wins, bright windows, final pages."
  }
];

const holidayMap = {
  "01-01": "New Year",
  "02-14": "Valentine",
  "03-08": "Womens Day",
  "04-22": "Earth Day",
  "05-01": "Labour Day",
  "06-21": "Solstice",
  "07-04": "Fourth",
  "08-15": "Independence",
  "10-31": "Halloween",
  "11-14": "Childrens Day",
  "12-25": "Christmas"
};

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const storageKey = "rangebook-react-notes";
const presets = [
  "Ship the prototype, record the range selector, then polish the README.",
  "Design review: check mobile layout, keyboard arrows, and note persistence.",
  "Personal sprint: pick 5 days, add one outcome, and protect focus blocks."
];

function readNotes() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "{}");
  } catch {
    return {};
  }
}

function saveNotes(notes) {
  localStorage.setItem(storageKey, JSON.stringify(notes));
}

function keyForDate(date) {
  return format(date, "yyyy-MM-dd");
}

function getCalendarDays(cursor) {
  const first = startOfWeek(startOfMonth(cursor));
  const last = endOfWeek(endOfMonth(cursor));
  const days = [];
  let day = first;
  while (!isAfter(day, last)) {
    days.push(day);
    day = addDays(day, 1);
  }
  while (days.length < 42) {
    days.push(day);
    day = addDays(day, 1);
  }
  return days;
}

function orderedRange(start, end) {
  if (!start || !end) return [start, end];
  return isBefore(end, start) ? [end, start] : [start, end];
}

function App() {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(new Date(2026, 3, 1));
  const [range, setRange] = useState({ start: null, end: null });
  const [notes, setNotes] = useState(readNotes);
  const [noteMode, setNoteMode] = useState("month");
  const [panel, setPanel] = useState("notes");
  const [toast, setToast] = useState("");
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 24 });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const story = monthStories[cursor.getMonth()];
  const days = useMemo(() => getCalendarDays(cursor), [cursor]);
  const [start, end] = orderedRange(range.start, range.end);
  const rangeIsReady = Boolean(start && end);
  const rangeDays = rangeIsReady ? differenceInCalendarDays(end, start) + 1 : range.start ? 1 : 0;
  const monthNoteKey = `month:${format(cursor, "yyyy-MM")}`;
  const rangeNoteKey = rangeIsReady ? `range:${keyForDate(start)}:${keyForDate(end)}` : `range:draft:${format(cursor, "yyyy-MM")}`;
  const activeNoteKey = noteMode === "range" ? rangeNoteKey : monthNoteKey;
  const noteValue = notes[activeNoteKey] || "";

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", story.accent);
    document.documentElement.style.setProperty("--accent-two", story.accentTwo);
    document.documentElement.style.setProperty("--month-ink", story.ink);
  }, [story]);

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.target.tagName === "TEXTAREA" || event.target.tagName === "INPUT") return;
      if (event.key === "ArrowLeft") moveMonth(-1);
      if (event.key === "ArrowRight") moveMonth(1);
      if (event.key.toLowerCase() === "n") setPanel("notes");
      if (event.key.toLowerCase() === "i") setPanel("insights");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function announce(message) {
    setToast(message);
    window.clearTimeout(announce.timer);
    announce.timer = window.setTimeout(() => setToast(""), 1400);
  }

  function moveMonth(delta) {
    setCursor((value) => addMonths(value, delta));
  }

  function chooseDate(date) {
    if (!range.start || range.end) {
      setRange({ start: date, end: null });
      setNoteMode("range");
      announce(`Started ${format(date, "MMM d")}`);
      return;
    }
    const [nextStart, nextEnd] = orderedRange(range.start, date);
    setRange({ start: nextStart, end: nextEnd });
    setNoteMode("range");
    announce(`${format(nextStart, "MMM d")} to ${format(nextEnd, "MMM d")}`);
  }

  function clearRange() {
    setRange({ start: null, end: null });
    setNoteMode("month");
    announce("Range cleared");
  }

  function updateNote(value) {
    setNotes((current) => {
      const next = { ...current };
      if (value.trim()) next[activeNoteKey] = value;
      else delete next[activeNoteKey];
      return next;
    });
  }

  function addPreset(text) {
    const next = noteValue ? `${noteValue}\n${text}` : text;
    updateNote(next);
    announce("Note added");
  }

  function notePreviewEntries() {
    return Object.entries(notes).slice(-5).reverse();
  }

  return (
    <main className="app-shell">
      <motion.div className="scroll-meter" style={{ scaleX }} />

      <section className="intro-section" id="top">
        <motion.div
          className="intro-copy"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <h1>Rangebook Calendar</h1>
          <p>
            A tactile wall calendar with range selection, image-aware theming, animated transitions,
            persistent notes, and a mobile layout that still feels intentional.
          </p>
        </motion.div>

        <motion.nav
          className="quick-actions"
          aria-label="Page actions"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <a href="#calendar"><CalendarDays size={18} /> Calendar</a>
          <a href="#notes"><PenLine size={18} /> Notes</a>
          <button type="button" onClick={() => window.print()}><Printer size={18} /> Print</button>
        </motion.nav>
      </section>

      <LayoutGroup>
        <section className="calendar-stage" id="calendar" aria-label="Interactive calendar">
          <motion.aside className="hero-panel" layout>
            <AnimatePresence mode="wait">
              <motion.div
                className="hero-image-frame"
                key={story.title}
                initial={{ opacity: 0, rotateY: -12, scale: 1.04 }}
                animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                exit={{ opacity: 0, rotateY: 10, scale: 0.98 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
              >
                <motion.img src={story.image} alt={`${story.title} seasonal scene`} style={{ y: heroY }} />
                <div className="hero-scrim" />
                <div className="hero-text">
                  <span>{story.mood}</span>
                  <h2>{story.title}</h2>
                  <p>{story.copy}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.aside>

          <motion.section className="calendar-card" layout>
            <header className="calendar-top">
              <button className="icon-button" type="button" onClick={() => moveMonth(-1)} aria-label="Previous month">
                <ArrowLeft size={20} />
              </button>
              <div>
                <span>{format(cursor, "yyyy")}</span>
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={format(cursor, "MMMM-yyyy")}
                    initial={{ opacity: 0, y: 20, rotateX: -30 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    exit={{ opacity: 0, y: -16, rotateX: 25 }}
                    transition={{ duration: 0.32 }}
                  >
                    {format(cursor, "MMMM")}
                  </motion.h2>
                </AnimatePresence>
              </div>
              <button className="icon-button" type="button" onClick={() => moveMonth(1)} aria-label="Next month">
                <ArrowRight size={20} />
              </button>
            </header>

            <div className="weekday-row" aria-hidden="true">
              {weekdays.map((day) => <span key={day}>{day}</span>)}
            </div>

            <motion.div className="date-grid" layout>
              {days.map((day) => {
                const key = keyForDate(day);
                const holiday = holidayMap[format(day, "MM-dd")];
                const isStart = range.start && isSameDay(day, range.start);
                const isEnd = range.end && isSameDay(day, range.end);
                const isRangeMiddle = start && end && isWithinInterval(day, { start, end }) && !isStart && !isEnd;
                const hasNote = Object.keys(notes).some((noteKey) => noteKey.includes(key));
                return (
                  <motion.button
                    className={[
                      "date-cell",
                      isSameMonth(day, cursor) ? "" : "muted",
                      isSameDay(day, today) ? "today" : "",
                      isStart ? "range-start" : "",
                      isEnd ? "range-end" : "",
                      isRangeMiddle ? "in-range" : "",
                      holiday ? "holiday" : "",
                      hasNote ? "has-note" : ""
                    ].join(" ")}
                    key={key}
                    type="button"
                    onClick={() => chooseDate(day)}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.96 }}
                    layout
                    aria-label={format(day, "MMMM d, yyyy")}
                  >
                    <span className="date-number">{format(day, "d")}</span>
                    {holiday && <small>{holiday}</small>}
                  </motion.button>
                );
              })}
            </motion.div>

            <footer className="range-dock">
              <RangeStat label="Start" value={range.start ? format(start, "MMM d, yyyy") : "Choose date"} />
              <RangeStat label="End" value={range.end ? format(end, "MMM d, yyyy") : "Choose date"} />
              <RangeStat label="Duration" value={rangeDays ? `${rangeDays} day${rangeDays === 1 ? "" : "s"}` : "0 days"} />
            </footer>
          </motion.section>

          <motion.aside className="control-panel" id="notes" layout>
            <div className="panel-tabs" role="tablist" aria-label="Side panel">
              <button className={panel === "notes" ? "active" : ""} type="button" onClick={() => setPanel("notes")}>
                <FileText size={17} /> Notes
              </button>
              <button className={panel === "insights" ? "active" : ""} type="button" onClick={() => setPanel("insights")}>
                <Wand2 size={17} /> Polish
              </button>
            </div>

            <AnimatePresence mode="wait">
              {panel === "notes" ? (
                <motion.div
                  className="notes-view"
                  key="notes"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="note-title">
                    <span>{noteMode === "range" ? "Range note" : "Month note"}</span>
                    <h2>{noteMode === "range" && start ? rangeIsReady ? `${format(start, "MMM d")} - ${format(end, "MMM d")}` : `From ${format(start, "MMM d")}` : format(cursor, "MMMM yyyy")}</h2>
                  </div>

                  <div className="segmented">
                    <button className={noteMode === "month" ? "selected" : ""} type="button" onClick={() => setNoteMode("month")}>
                      <Moon size={16} /> Month
                    </button>
                    <button className={noteMode === "range" ? "selected" : ""} type="button" onClick={() => setNoteMode("range")} disabled={!range.start}>
                      <Sun size={16} /> Range
                    </button>
                  </div>

                  <textarea
                    value={noteValue}
                    onChange={(event) => updateNote(event.target.value)}
                    placeholder="Write the plan, reminder, idea, or tiny mission briefing here..."
                  />

                  <div className="preset-list">
                    {presets.map((preset) => (
                      <button type="button" key={preset} onClick={() => addPreset(preset)}>
                        <Check size={15} /> {preset}
                      </button>
                    ))}
                  </div>

                  <div className="save-line"><Check size={16} /> Saved locally in the browser</div>
                </motion.div>
              ) : (
                <motion.div
                  className="insights-view"
                  key="insights"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2>Built To Stand Out</h2>
                  <Feature icon={<Image size={18} />} title="Image-aware theming" text="Every month changes the visual system, not just the photo." />
                  <Feature icon={<Keyboard size={18} />} title="Keyboard flow" text="Arrow keys move month-to-month; N and I switch panel views." />
                  <Feature icon={<Sparkles size={18} />} title="Motion language" text="Month cards flip, cells lift, and the hero uses scroll depth." />
                  <Feature icon={<ChevronDown size={18} />} title="Responsive behavior" text="The wall-calendar composition collapses into a touch-friendly stack." />
                  <button className="clear-button" type="button" onClick={clearRange}><Eraser size={18} /> Clear selected range</button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.aside>
        </section>
      </LayoutGroup>

      <section className="memory-section">
        <div>
          <p className="eyebrow"><PenLine size={16} /> Recent saved notes</p>
          <h2>Nothing gets lost when the month changes.</h2>
        </div>
        <div className="memory-grid">
          {notePreviewEntries().length ? notePreviewEntries().map(([key, value]) => (
            <motion.article className="memory-card" key={key} whileHover={{ y: -6 }}>
              <span>{key.replace("month:", "Month ").replace("range:", "Range ").replaceAll(":", " to ")}</span>
              <p>{value}</p>
            </motion.article>
          )) : (
            <article className="memory-card empty">
              <span>Ready</span>
              <p>Add a note and it will appear here as proof that the calendar is actually functional.</p>
            </article>
          )}
        </div>
      </section>

      <footer className="creator-footer">
        <div>
          <p>Created with love by</p>
          <h2>ADITYA SINGH</h2>
          <span>Passionate frontend engineer, tech alchemist, and detail-obsessed builder of interfaces that feel alive.</span>
        </div>
        <nav aria-label="Creator links">
          <a href="https://www.linkedin.com/in/adityas72/" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="https://github.com/adityas72" target="_blank" rel="noreferrer">GitHub</a>
        </nav>
      </footer>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function RangeStat({ label, value }) {
  return (
    <div className="range-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <article className="feature">
      <div>{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

createRoot(document.getElementById("root")).render(<App />);
