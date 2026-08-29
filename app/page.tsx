'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Check,
  Flame,
  Info,
  Library,
  RotateCcw,
  Search,
  Sparkles,
  Volume2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { sentences, type SentenceCard } from '@/lib/sentences';

type Rating = 'again' | 'hard' | 'good' | 'easy';
type Review = { due: number; interval: number; reps: number; lastRating: Rating };
type ReviewMap = Record<string, Review>;
type View = 'study' | 'deck' | 'about';

const STORAGE_KEY = 'juzi-reviews-v1';
const DAY = 86_400_000;

const ratingCopy: Record<Rating, { label: string; wait: string; days: number }> = {
  again: { label: 'Again', wait: '1 min', days: 1 / 1440 },
  hard: { label: 'Hard', wait: '2 days', days: 2 },
  good: { label: 'Good', wait: '4 days', days: 4 },
  easy: { label: 'Easy', wait: '8 days', days: 8 },
};

const attribution = (
  <a className="font-medium underline decoration-cinnabar/35 underline-offset-2 hover:text-foreground" href="https://resources.allsetlearning.com/chinese/grammar/使" target="_blank" rel="noreferrer">
    AllSet Learning Chinese Grammar Wiki
  </a>
);

export default function Home() {
  const [view, setView] = useState<View>('study');
  const [reviews, setReviews] = useState<ReviewMap>({});
  const [sessionDone, setSessionDone] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [filter, setFilter] = useState<'All' | SentenceCard['focus']>('All');
  const [query, setQuery] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setReviews(JSON.parse(saved) as ReviewMap);
    } catch {
      // A clean deck is a safe fallback when storage is unavailable or malformed.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  }, [ready, reviews]);

  const now = Date.now();
  const dueCards = useMemo(
    () => sentences.filter((card) => !sessionDone.includes(card.id) && (!reviews[card.id] || reviews[card.id].due <= now)),
    [reviews, sessionDone, now],
  );
  const card = dueCards[0];
  const completedCount = Object.values(reviews).filter((review) => review.reps > 0).length;
  const progress = Math.min(100, Math.round((sessionDone.length / 12) * 100));

  const rate = useCallback((rating: Rating) => {
    if (!card) return;
    const current = reviews[card.id];
    const base = ratingCopy[rating].days;
    let interval = base;
    if (current && rating !== 'again') {
      const multiplier = rating === 'hard' ? 1.2 : rating === 'good' ? 2.5 : 4;
      interval = Math.max(base, Math.round(current.interval * multiplier));
    }
    setReviews((all) => ({
      ...all,
      [card.id]: { due: Date.now() + interval * DAY, interval, reps: (current?.reps ?? 0) + 1, lastRating: rating },
    }));
    setSessionDone((ids) => [...ids, card.id]);
    setRevealed(false);
  }, [card, reviews]);

  useEffect(() => {
    if (view !== 'study') return;
    const onKey = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !revealed && card) {
        event.preventDefault();
        setRevealed(true);
      }
      if (revealed && ['Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(event.code)) {
        const ratings: Rating[] = ['again', 'hard', 'good', 'easy'];
        rate(ratings[Number(event.code.at(-1)) - 1]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [card, rate, revealed, view]);

  const filteredCards = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return sentences.filter((item) => {
      const matchesFilter = filter === 'All' || item.focus === filter;
      const haystack = `${item.chinese} ${item.pinyin} ${item.english}`.toLowerCase();
      return matchesFilter && (!normalized || haystack.includes(normalized));
    });
  }, [filter, query]);

  const goTo = (next: View) => {
    setView(next);
    setRevealed(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-ink/10 bg-paper/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <button onClick={() => goTo('study')} className="flex items-center gap-3" aria-label="句子 — study home">
            <span className="grid size-9 place-items-center rounded-xl bg-cinnabar font-serif text-lg font-bold text-white shadow-[0_5px_14px_rgb(197_82_61/22%)]">句</span>
            <span className="font-serif text-xl font-semibold tracking-tight">句子</span>
            <span className="hidden text-xs text-muted-foreground sm:inline">Jùzi</span>
          </button>
          <nav className="hidden items-center gap-1 rounded-xl border border-ink/10 bg-white/50 p-1 sm:flex" aria-label="Main navigation">
            <button className={`top-nav ${view === 'study' ? 'top-nav-active' : ''}`} onClick={() => goTo('study')}>Study</button>
            <button className={`top-nav ${view === 'deck' ? 'top-nav-active' : ''}`} onClick={() => goTo('deck')}>Deck</button>
            <button className={`top-nav ${view === 'about' ? 'top-nav-active' : ''}`} onClick={() => goTo('about')}>About</button>
          </nav>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground"><Flame className="size-4 text-cinnabar" aria-hidden="true" /><strong className="text-foreground">6</strong><span className="hidden sm:inline"> day streak</span></span>
            <span className="grid size-9 place-items-center rounded-full bg-jade text-xs font-bold text-white">SR</span>
          </div>
        </div>
      </header>

      {view === 'study' && (
        <StudyView
          card={card}
          completedCount={completedCount}
          dueCount={dueCards.length}
          progress={progress}
          revealed={revealed}
          sessionCount={sessionDone.length}
          onReveal={() => setRevealed(true)}
          onRate={rate}
          onRestart={() => setSessionDone([])}
          onNavigate={goTo}
        />
      )}
      {view === 'deck' && (
        <DeckView
          cards={filteredCards}
          filter={filter}
          query={query}
          reviews={reviews}
          onFilter={setFilter}
          onQuery={setQuery}
          onBack={() => goTo('study')}
        />
      )}
      {view === 'about' && <AboutView onBack={() => goTo('study')} />}

      <nav className="fixed inset-x-4 bottom-4 z-20 grid grid-cols-3 rounded-2xl border border-ink/10 bg-card/95 p-1.5 shadow-[0_16px_50px_rgb(23_36_31/18%)] backdrop-blur sm:hidden" aria-label="Mobile navigation">
        <button className={`mobile-nav ${view === 'study' ? 'mobile-nav-active' : ''}`} onClick={() => goTo('study')}><Sparkles />Study</button>
        <button className={`mobile-nav ${view === 'deck' ? 'mobile-nav-active' : ''}`} onClick={() => goTo('deck')}><Library />Deck</button>
        <button className={`mobile-nav ${view === 'about' ? 'mobile-nav-active' : ''}`} onClick={() => goTo('about')}><Info />About</button>
      </nav>
    </main>
  );
}

function StudyView({
  card,
  completedCount,
  dueCount,
  progress,
  revealed,
  sessionCount,
  onReveal,
  onRate,
  onRestart,
  onNavigate,
}: {
  card?: SentenceCard;
  completedCount: number;
  dueCount: number;
  progress: number;
  revealed: boolean;
  sessionCount: number;
  onReveal: () => void;
  onRate: (rating: Rating) => void;
  onRestart: () => void;
  onNavigate: (view: View) => void;
}) {
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-5 pb-28 pt-8 sm:px-8 lg:grid-cols-[220px_minmax(0,1fr)_220px] lg:py-12">
      <aside className="hidden lg:block">
        <p className="eyebrow">Today</p>
        <nav className="mt-4 space-y-2" aria-label="Study sections">
          <button className="nav-item nav-item-active w-full" onClick={() => onNavigate('study')}><Sparkles /> Study <span>{dueCount}</span></button>
          <button className="nav-item w-full" onClick={() => onNavigate('deck')}><BookOpen /> Sentence deck <span>{sentences.length}</span></button>
        </nav>
        <div className="mt-10 rounded-2xl border border-ink/10 bg-white/55 p-4">
          <div className="flex items-center justify-between text-sm"><span>Daily goal</span><strong>{Math.min(sessionCount, 12)} / 12</strong></div>
          <Progress value={progress} className="mt-3 [&_[data-slot=progress-indicator]]:bg-jade" />
          <p className="mt-3 text-xs leading-5 text-muted-foreground">{sessionCount >= 12 ? 'Goal complete. Nice work.' : `${12 - sessionCount} more to keep your rhythm.`}</p>
        </div>
      </aside>

      <section className="min-w-0">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div><p className="eyebrow">B1 · Causative verbs</p><h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">Make it stick.</h1></div>
          <span className="text-sm tabular-nums text-muted-foreground">{dueCount} due</span>
        </div>

        {card ? (
          <article className="study-card" key={card.id}>
            <div className="flex items-start justify-between gap-4">
              <span className="rounded-full bg-cinnabar/10 px-3 py-1 text-xs font-semibold text-cinnabar">{card.focus} · {card.focus === '使' ? 'shǐ' : card.focus === '让' ? 'ràng' : card.focus === '叫' ? 'jiào' : 'qǐng'}</span>
              <Button variant="ghost" size="icon" aria-label="Audio is coming soon" title="Audio coming soon" disabled><Volume2 /></Button>
            </div>
            <div className="flex min-h-[260px] flex-col items-center justify-center py-8 text-center sm:min-h-[330px]">
              <p lang="zh-Hans" className="hanzi text-[2rem] font-medium leading-[1.65] sm:text-[2.55rem]">{card.chinese}</p>
              {revealed ? (
                <div className="answer-in mt-7 max-w-xl">
                  <p className="text-base leading-7 text-cinnabar">{card.pinyin}</p>
                  <p className="mt-3 text-lg font-medium leading-7">{card.english}</p>
                  <div className="mx-auto mt-6 h-px w-12 bg-ink/15" />
                  <p className="mt-5 text-sm leading-6 text-muted-foreground">{card.note}</p>
                </div>
              ) : <p className="mt-6 text-sm text-muted-foreground">Read it aloud. What made what happen?</p>}
            </div>
            <div className="border-t border-ink/10 pt-5">
              {!revealed ? (
                <Button className="h-11 w-full bg-ink text-paper hover:bg-ink/85" onClick={onReveal}>Reveal meaning <kbd className="ml-2 rounded border border-white/20 px-1.5 py-0.5 text-[10px]">Space</kbd></Button>
              ) : (
                <div>
                  <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">How well did you know it?</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {(Object.keys(ratingCopy) as Rating[]).map((rating, index) => (
                      <button className={`rating ${rating === 'again' ? 'rating-again' : ''} ${rating === 'good' ? 'rating-good' : ''}`} key={rating} onClick={() => onRate(rating)}>
                        {rating === 'again' && <RotateCcw />}{rating === 'good' && <Check />}{ratingCopy[rating].label}<small>{ratingCopy[rating].wait} · {index + 1}</small>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>
        ) : (
          <article className="study-card flex min-h-[460px] flex-col items-center justify-center text-center">
            <span className="grid size-16 place-items-center rounded-full bg-jade/10 text-jade"><Check className="size-7" /></span>
            <p className="eyebrow mt-6">Session complete</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold">都记住了！</h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">You reviewed every sentence due right now. The scheduler will bring them back at the right time.</p>
            <div className="mt-7 flex flex-wrap justify-center gap-2">
              <Button className="bg-ink text-paper hover:bg-ink/85" onClick={onRestart}>Study full deck again</Button>
              <Button variant="outline" onClick={() => onNavigate('deck')}>Browse sentences</Button>
            </div>
          </article>
        )}

        {card?.source === 'allset' && <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">Adapted from {attribution} · <a className="underline underline-offset-2" href="https://creativecommons.org/licenses/by-nc-sa/3.0/" target="_blank" rel="noreferrer">CC BY-NC-SA 3.0</a> · Changes made</p>}
      </section>

      <aside className="hidden lg:block">
        <p className="eyebrow">Memory trace</p>
        <div className="mt-4 rounded-2xl border border-ink/10 bg-white/55 p-5">
          <span className="grid size-11 place-items-center rounded-full bg-jade/10 text-jade"><Check /></span>
          <p className="mt-4 font-serif text-lg font-semibold">{completedCount} learned</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">Progress stays on this device and returns with you.</p>
        </div>
        <div className="mt-4 rounded-2xl bg-ink p-5 text-paper shadow-[0_16px_40px_rgb(23_36_31/12%)]">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-paper/55">Core pattern</p>
          <p className="mt-3 font-serif text-lg leading-7">Subject + <strong className="text-peach">使</strong> + person + result</p>
          <p className="mt-4 text-xs leading-5 text-paper/55">Use 使 in formal or written Chinese. In conversation, 让 is usually more natural.</p>
        </div>
      </aside>
    </section>
  );
}

function DeckView({ cards, filter, query, reviews, onFilter, onQuery, onBack }: {
  cards: SentenceCard[];
  filter: 'All' | SentenceCard['focus'];
  query: string;
  reviews: ReviewMap;
  onFilter: (filter: 'All' | SentenceCard['focus']) => void;
  onQuery: (query: string) => void;
  onBack: () => void;
}) {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-28 pt-8 sm:px-8 lg:py-12">
      <button className="mb-7 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" onClick={onBack}><ArrowLeft className="size-4" /> Back to study</button>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="eyebrow">Sentence mining</p><h1 className="mt-1 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">The causative deck.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Mine the structure, not isolated words. Every sentence shows who causes what result.</p></div>
        <span className="font-serif text-4xl text-cinnabar">{cards.length}<small className="ml-2 font-sans text-xs uppercase tracking-wider text-muted-foreground">sentences</small></span>
      </div>

      <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-ink/10 bg-white/55 p-3 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><span className="sr-only">Search sentences</span><input className="h-10 w-full rounded-xl border border-ink/10 bg-card pl-10 pr-3 text-sm outline-none focus:border-cinnabar/50 focus:ring-2 focus:ring-cinnabar/10" value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Search Chinese, pinyin, or meaning…" /></label>
        <div className="flex gap-1 overflow-x-auto" aria-label="Filter by causative verb">
          {(['All', '使', '让', '叫', '请'] as const).map((item) => <button key={item} className={`filter-chip ${filter === item ? 'filter-chip-active' : ''}`} onClick={() => onFilter(item)}>{item}</button>)}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {cards.map((item) => (
          <article className="deck-card" key={item.id}>
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-cinnabar/10 px-2.5 py-1 text-xs font-bold text-cinnabar">{item.focus}</span>
              <span className={`text-[10px] font-bold uppercase tracking-[0.12em] ${reviews[item.id] ? 'text-jade' : 'text-muted-foreground'}`}>{reviews[item.id] ? `${reviews[item.id].reps} review${reviews[item.id].reps === 1 ? '' : 's'}` : 'New'}</span>
            </div>
            <h2 lang="zh-Hans" className="hanzi mt-5 text-[1.55rem] font-medium leading-[1.6]">{item.chinese}</h2>
            <p className="mt-3 text-sm leading-6 text-cinnabar">{item.pinyin}</p>
            <p className="mt-2 text-sm font-medium leading-6">{item.english}</p>
            <p className="mt-4 border-t border-ink/10 pt-4 text-xs leading-5 text-muted-foreground">{item.note}</p>
            <p className="mt-3 text-[10px] leading-4 text-muted-foreground">{item.source === 'allset' ? <>Adapted from {attribution} · CC BY-NC-SA 3.0 · Changes made</> : 'Original practice sentence · 句子 Jùzi'}</p>
          </article>
        ))}
      </div>
      {cards.length === 0 && <div className="mt-6 rounded-2xl border border-dashed border-ink/20 p-14 text-center"><p className="font-serif text-2xl">No sentence found.</p><p className="mt-2 text-sm text-muted-foreground">Try another word, pinyin syllable, or translation.</p></div>}
    </section>
  );
}

function AboutView({ onBack }: { onBack: () => void }) {
  return (
    <section className="mx-auto max-w-3xl px-5 pb-28 pt-8 sm:px-8 lg:py-12">
      <button className="mb-7 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" onClick={onBack}><ArrowLeft className="size-4" /> Back to study</button>
      <p className="eyebrow">About the project</p>
      <h1 className="mt-2 font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Grammar becomes instinct through sentences.</h1>
      <p className="mt-6 text-lg leading-8 text-muted-foreground">句子 Jùzi is a noncommercial learning prototype. It turns a grammar explanation into short retrieval sessions: read, recall, reveal, rate, repeat.</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[['01', 'Notice the pattern', 'See the grammar doing real work in a memorable sentence.'], ['02', 'Recall the meaning', 'Try before revealing pinyin, translation, and the grammar note.'], ['03', 'Meet it again', 'Your confidence rating chooses when the sentence returns.']].map(([number, title, body]) => <article className="rounded-2xl border border-ink/10 bg-card p-5" key={number}><span className="font-serif text-3xl text-cinnabar">{number}</span><h2 className="mt-5 font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p></article>)}
      </div>

      <article className="mt-10 rounded-[1.75rem] bg-ink p-6 text-paper sm:p-8">
        <p className="eyebrow !text-paper/50">Content & license</p>
        <h2 className="mt-2 font-serif text-2xl font-semibold">Built to respect the source.</h2>
        <div className="mt-5 space-y-4 text-sm leading-7 text-paper/70">
          <p>Ten sentences and related grammar notes are adapted from the {attribution}. They are used under the <a className="underline underline-offset-2" href="https://creativecommons.org/licenses/by-nc-sa/3.0/" target="_blank" rel="noreferrer">Creative Commons Attribution–NonCommercial–ShareAlike 3.0 license</a>.</p>
          <p>This means the adapted content must remain noncommercial, credit AllSet Learning, link to the license, note changes, and be shared under the same license. AllSet also asks that its full linked name appear wherever its content is shown; the deck does that card by card.</p>
          <p>The additional practice sentences and the application code are original to this repository. This is not legal advice, and commercial use would require separate permission from AllSet Learning.</p>
        </div>
      </article>
    </section>
  );
}
