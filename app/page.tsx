'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import {
  ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Check, ChevronRight,
  CircleCheck, Compass, Film, Headphones, Library, Search, Sparkles,
  Smartphone, Volume2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type Category = 'All' | 'Courses' | 'Grammar' | 'Apps' | 'Books' | 'Watch' | 'Listen';

type Resource = {
  title: string;
  chinese?: string;
  category: Exclude<Category, 'All'>;
  level: number[];
  description: string;
  price: 'Free' | 'Freemium' | 'Paid';
  href: string;
};

const stages = [
  {
    number: '01', hanzi: '启程', title: 'Find your footing', short: 'Brand new',
    level: 'HSK 1–2', count: '0–300 characters', color: '#d9543e',
    body: 'Build a reliable ear for sounds, learn the basic sentence frame, and recognize the characters you meet every day.',
    focus: ['Pinyin and the four tones', 'Basic word order', 'Questions and negation', '150–300 common characters'],
    routine: '20 min course · 10 min review · 10 min listening',
  },
  {
    number: '02', hanzi: '入门', title: 'Start reading for real', short: 'I know the basics',
    level: 'HSK 3', count: '300–600 characters', color: '#df8c45',
    body: 'Move beyond exercises. Short graded stories and slow native audio turn everything you have studied into understanding.',
    focus: ['Aspect particles 了 / 过 / 着', 'Result complements', 'Graded readers', 'Slow, repeated listening'],
    routine: '15 min grammar · 20 min reading · 15 min audio',
  },
  {
    number: '03', hanzi: '进阶', title: 'Cross into native media', short: 'I can converse',
    level: 'HSK 4', count: '600–1,200 characters', color: '#4d7769',
    body: 'Use good tools—not brute force—to bridge into webnovels, dramas, and podcasts made for native speakers.',
    focus: ['把 and 被 constructions', 'Popup dictionaries', 'Dual subtitles', 'First native stories'],
    routine: '20 min reading · 20 min watching · 10 min mining',
  },
  {
    number: '04', hanzi: '远行', title: 'Build immersion stamina', short: 'Comfortable intermediate',
    level: 'HSK 5', count: '1,200–2,000 characters', color: '#426a79',
    body: 'Longer sessions become possible. Follow one genre, one author, or one series long enough for its language to become familiar.',
    focus: ['Complex clauses', 'Genre vocabulary', '30-minute immersion blocks', 'Selective vocabulary mining'],
    routine: '30 min reading · 30 min drama · light review',
  },
  {
    number: '05', hanzi: '自在', title: 'Choose depth over coverage', short: 'Advanced',
    level: 'HSK 6+', count: '2,000–3,000 characters', color: '#6d5a86',
    body: 'Stop trying to know every word. Read broadly for flow, then go deep only where precision or style truly matters.',
    focus: ['Literary connectors', 'Chengyu in context', 'Chinese–Chinese dictionaries', 'Extensive reading'],
    routine: '45–60 min native media · note only what repeats',
  },
  {
    number: '06', hanzi: '无界', title: 'Live in the language', short: 'Native media ready',
    level: 'Beyond levels', count: '3,000+ characters', color: '#8c493e',
    body: 'The map opens up. Follow curiosity through novels, film, history, humor, and specialist subjects without a learner syllabus.',
    focus: ['Style and register', 'Classical references', 'Dialect awareness', 'Personal canon'],
    routine: 'Read, watch, and listen by interest—not level',
  },
];

const resources: Resource[] = [
  { title: 'HelloChinese', category: 'Apps', level: [0, 1], description: 'A friendly, structured start for pronunciation, characters, and essential grammar.', price: 'Freemium', href: 'https://www.hellochinese.cc/' },
  { title: 'Yoyo Chinese', category: 'Courses', level: [0, 1, 2], description: 'A thorough video curriculum with strong pronunciation teaching, dialogues, quizzes, and audio review.', price: 'Freemium', href: 'https://yoyochinese.com/' },
  { title: 'Chinese Zero to Hero', category: 'Courses', level: [0, 1, 2, 3, 4], description: 'Structured HSK courses that turn textbook material into clear video lessons and guided practice.', price: 'Paid', href: 'https://www.chinesezerotohero.com/' },
  { title: 'Hacking Chinese', category: 'Courses', level: [0, 1, 2, 3, 4, 5], description: 'Thoughtful, research-aware guidance on how to improve listening, speaking, reading, writing, and study habits.', price: 'Free', href: 'https://www.hackingchinese.com/' },
  { title: 'Chinese Grammar Wiki', category: 'Grammar', level: [0, 1, 2, 3, 4], description: 'Clear grammar explanations organized from A1 to C1 with practical examples.', price: 'Free', href: 'https://resources.allsetlearning.com/chinese/grammar/' },
  { title: 'Chinese Boost Grammar', category: 'Grammar', level: [0, 1, 2, 3, 4], description: 'A searchable grammar reference organized by CEFR, HSK level, function, and individual words.', price: 'Free', href: 'https://www.chineseboost.com/grammar/' },
  { title: 'Pleco', category: 'Apps', level: [0, 1, 2, 3, 4, 5], description: 'The essential Chinese dictionary, with handwriting, audio, flashcards, and reader add-ons.', price: 'Freemium', href: 'https://www.pleco.com/' },
  { title: 'Skritter', category: 'Apps', level: [0, 1, 2, 3], description: 'Character-writing practice with stroke-level feedback and spaced repetition for forms, tones, and meanings.', price: 'Paid', href: 'https://skritter.com/home' },
  { title: 'Dong Chinese', chinese: '懂中文', category: 'Apps', level: [0, 1, 2, 3], description: 'A clean web app for learning characters and vocabulary through examples, review, and level-aware practice.', price: 'Freemium', href: 'https://www.dong-chinese.com/' },
  { title: 'Little Fox Chinese', category: 'Listen', level: [0, 1], description: 'Illustrated, native-narrated stories with optional subtitles and vocabulary support.', price: 'Free', href: 'https://chinese.littlefox.com/en' },
  { title: 'Mandarin Companion', category: 'Books', level: [0, 1, 2], description: 'Compelling graded novels at 150, 300, and 450-character levels.', price: 'Paid', href: 'https://mandarincompanion.com/' },
  { title: 'Imagin8 Press', category: 'Books', level: [0, 1, 2], description: 'Graded retellings of Chinese myths and history with restricted vocabulary, pinyin, and English support.', price: 'Paid', href: 'https://imagin8press.com/' },
  { title: 'Du Chinese', category: 'Apps', level: [0, 1, 2, 3, 4, 5], description: 'Graded stories for every level with native audio, instant lookup, and grammar support.', price: 'Freemium', href: 'https://duchinese.net/' },
  { title: "The Chairman's Bao", category: 'Apps', level: [0, 1, 2, 3, 4, 5], description: 'Daily news rewritten across graded levels with human audio, one-tap definitions, and comprehension exercises.', price: 'Freemium', href: 'https://www.thechairmansbao.com/' },
  { title: 'Hack Chinese', category: 'Apps', level: [0, 1, 2, 3, 4, 5], description: 'A focused web app for learning and retaining Chinese vocabulary with smart spaced repetition.', price: 'Paid', href: 'https://www.hackchinese.com/' },
  { title: 'Mandarin Bean', category: 'Books', level: [0, 1, 2], description: 'HSK-tagged readings with audio, pinyin, traditional characters, and definitions.', price: 'Freemium', href: 'https://mandarinbean.com/' },
  { title: 'WordSwing', category: 'Books', level: [1, 2], description: 'Choose-your-own-adventure stories that make intensive reading feel like play.', price: 'Freemium', href: 'https://wordswing.com/' },
  { title: 'Readibu', category: 'Apps', level: [2, 3, 4, 5], description: 'A webnovel reader with one-tap definitions, text-to-speech, and bookmarks.', price: 'Freemium', href: 'https://www.readibu.com/' },
  { title: 'Language Reactor', category: 'Apps', level: [2, 3, 4, 5], description: 'Dual subtitles and playback controls for learning through streaming video.', price: 'Freemium', href: 'https://www.languagereactor.com/' },
  { title: 'Slow Chinese Archive', chinese: '慢速中文', category: 'Listen', level: [1, 2, 3], description: 'The preserved cultural podcast archive, with clear audio and transcripts for close listening.', price: 'Free', href: 'https://kitchenknif.github.io/SlowChinese/' },
  { title: 'TeaTime Chinese', category: 'Listen', level: [2, 3], description: 'Intermediate cultural stories in clear Mandarin with synchronized transcripts, pinyin, and word lookup.', price: 'Freemium', href: 'https://teatimechinese.com/' },
  { title: 'MaoMi Chinese', chinese: '猫咪中文', category: 'Listen', level: [2, 3, 4], description: 'Weekly intermediate Mandarin audio with transcripts, translations, and pinyin for supported listening.', price: 'Freemium', href: 'https://maomichinese.com/' },
  { title: 'ChinesePod', category: 'Listen', level: [0, 1, 2, 3, 4, 5], description: 'A deep archive of bite-sized audio and video lessons, graded from newcomer to advanced.', price: 'Freemium', href: 'https://www.chinesepod.com/' },
  { title: 'Peppa Pig', chinese: '小猪佩奇', category: 'Watch', level: [1, 2], description: 'Short episodes, visual context, and repetitive family vocabulary.', price: 'Free', href: 'https://www.youtube.com/@PeppaPigChineseOfficial' },
  { title: 'Reset', chinese: '开端', category: 'Watch', level: [2, 3], description: 'A gripping time-loop drama with repeated situations and contemporary dialogue.', price: 'Freemium', href: 'https://www.viki.com/tv/38357c-reset' },
  { title: 'Put Your Head on My Shoulder', chinese: '致我们暖暖的小时光', category: 'Watch', level: [2, 3], description: 'A light university romance with everyday settings, recurring vocabulary, and abundant visual context.', price: 'Freemium', href: 'https://www.viki.com/tv/36780c-put' },
  { title: 'Link Click', chinese: '时光代理人', category: 'Watch', level: [2, 3, 4], description: 'Modern animated mystery with clear dialogue, emotion, and strong visual support.', price: 'Freemium', href: 'https://www.bilibili.tv/en/play/1006270' },
  { title: 'Scissor Seven', chinese: '刺客伍六七', category: 'Watch', level: [3, 4], description: 'Short, funny animated episodes that mix colloquial Mandarin with action and strong visual storytelling.', price: 'Paid', href: 'https://www.netflix.com/title/81156880' },
  { title: 'To Live', chinese: '活着', category: 'Books', level: [3, 4], description: 'Yu Hua’s direct prose makes this modern classic a common first native novel.', price: 'Paid', href: 'https://book.douban.com/subject/4913064/' },
  { title: 'The Bad Kids', chinese: '隐秘的角落', category: 'Watch', level: [3, 4], description: 'A compact suspense drama with contemporary speech and an unforgettable story.', price: 'Freemium', href: 'https://www.iqiyi.com/a_19rrhm0f1d.html' },
  { title: 'Story FM', chinese: '故事FM', category: 'Listen', level: [3, 4, 5], description: 'First-person documentary stories—a rich route into natural speech and real lives.', price: 'Free', href: 'https://storyfm.cn/' },
  { title: 'Hikaru no Go', chinese: '棋魂', category: 'Watch', level: [3, 4], description: 'A warm coming-of-age drama; recurring settings make its vocabulary easier to acquire.', price: 'Freemium', href: 'https://www.iqiyi.com/a_1cmg22yqts9.html' },
  { title: 'Joy of Life', chinese: '庆余年', category: 'Watch', level: [4, 5], description: 'Fast, witty historical fantasy for learners ready for layered dialogue and register shifts.', price: 'Freemium', href: 'https://www.viki.com/tv/36367c-joy-of-life' },
  { title: 'The Three-Body Problem', chinese: '三体', category: 'Books', level: [4, 5], description: 'Ambitious science fiction for advanced readers building technical and literary range.', price: 'Paid', href: 'https://book.douban.com/subject/2567698/' },
  { title: 'Heavenly Path', chinese: '飞升宝典', category: 'Books', level: [1, 2, 3, 4, 5], description: 'The deep reference: extensive guides and ranked native Chinese media.', price: 'Free', href: 'https://heavenlypath.notion.site/heavenlypath/Heavenly-Path-d9be1806465b4525afeb132d1079194c' },
];

const categories: { name: Category; icon: typeof Library }[] = [
  { name: 'All', icon: Library }, { name: 'Courses', icon: Sparkles }, { name: 'Grammar', icon: BookOpen },
  { name: 'Apps', icon: Smartphone }, { name: 'Books', icon: BookOpen }, { name: 'Watch', icon: Film }, { name: 'Listen', icon: Headphones },
];

const resourceLogo = (href: string) => {
  const domain = new URL(href).hostname.replace(/^www\./, '');
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
};

export default function Home() {
  const [selectedStage, setSelectedStage] = useState(1);
  const [category, setCategory] = useState<Category>('All');
  const [query, setQuery] = useState('');
  const stage = stages[selectedStage];

  const filtered = useMemo(() => resources.filter((resource) => {
    const atLevel = resource.level.includes(selectedStage);
    const inCategory = category === 'All' || resource.category === category;
    const matches = `${resource.title} ${resource.chinese ?? ''} ${resource.description}`.toLowerCase().includes(query.toLowerCase());
    return atLevel && inCategory && matches;
  }), [category, query, selectedStage]);

  const goToPath = () => document.querySelector('#path')?.scrollIntoView({ behavior: 'smooth' });
  const goToLibrary = () => document.querySelector('#library')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Mandarin Atlas home"><span className="brand-mark">中</span><span>Mandarin Atlas</span></a>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation"><a href="#path">The path</a><a href="#library">Library</a><a href="#method">Method</a></nav>
        <Button onClick={goToPath} className="rounded-full bg-ink px-5 text-paper hover:bg-ink/90">Find my level</Button>
      </header>

      <section id="top" className="hero-shell">
        <div className="hero-copy">
          <div className="eyebrow"><Compass size={15} /> A clearer way through Chinese</div>
          <h1>Your map to<br /><em>fluency.</em></h1>
          <p>Know what to learn next—and what to read, watch, and listen to at every stage. One considered path from your first tones to native media.</p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={goToPath} size="lg" className="rounded-full bg-coral px-7 text-white hover:bg-coral/90">Show me the path <ArrowDown size={17} /></Button>
            <Button onClick={goToLibrary} size="lg" variant="outline" className="rounded-full border-ink/15 bg-transparent px-7">Browse resources <ArrowUpRight size={17} /></Button>
          </div>
        </div>

        <aside className="level-card" aria-label="Level finder">
          <span className="level-card-kicker">Start here</span><span className="level-card-hanzi" aria-hidden="true">你在哪儿？</span>
          <h2>Where are you now?</h2><p>Pick the description that feels closest. Your path updates instantly.</p>
          <div className="level-options">
            {stages.map((item, i) => (
              <button key={item.number} className={selectedStage === i ? 'selected' : ''} type="button" onClick={() => setSelectedStage(i)}>
                <span>{item.number}</span>{item.short}{selectedStage === i && <CircleCheck size={17} />}
              </button>
            ))}
          </div>
        </aside>
      </section>

      <section id="path" className="path-shell">
        <div className="section-intro"><span className="eyebrow">The learning path</span><h2>Six stages. One direction.</h2><p>A chronological route that keeps study and immersion moving together. Choose a stage to reveal its focus.</p></div>
        <div className="path-layout">
          <div className="timeline" role="list" aria-label="Chinese learning stages">
            {stages.map((item, index) => (
              <button className={`stage ${selectedStage === index ? 'active' : ''}`} key={item.number} onClick={() => setSelectedStage(index)} type="button" role="listitem" aria-pressed={selectedStage === index}>
                <div className="stage-rail"><span>{item.number}</span>{index < stages.length - 1 && <i />}</div>
                <div className="stage-hanzi" aria-hidden="true">{item.hanzi}</div>
                <div className="stage-copy"><span className="stage-level">{item.level} · {item.count}</span><h3>{item.title}</h3><p>{item.body}</p></div>
                <span className="stage-link"><ChevronRight size={19} /></span>
              </button>
            ))}
          </div>

          <aside className="stage-detail" style={{ '--stage-color': stage.color } as React.CSSProperties}>
            <div className="detail-top"><span>Right now</span><b>{stage.hanzi}</b></div>
            <p className="detail-level">{stage.level}<br />{stage.count}</p>
            <h3>{stage.title}</h3>
            <ul>{stage.focus.map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul>
            <div className="routine"><Volume2 size={18} /><div><span>A balanced day</span><p>{stage.routine}</p></div></div>
            <Button onClick={goToLibrary} className="w-full rounded-full bg-ink text-paper hover:bg-ink/90">See resources for this stage <ArrowRight size={16} /></Button>
          </aside>
        </div>
      </section>

      <section id="method" className="method-strip">
        <div><span className="eyebrow">The method</span><h2>Study less blindly.<br /><em>Immerse earlier.</em></h2></div>
        <div className="method-steps">
          <article><span>01</span><h3>Learn the frame</h3><p>A little structured grammar and vocabulary gives input somewhere to land.</p></article>
          <article><span>02</span><h3>Meet it in context</h3><p>Read, watch, and listen at the edge of comfort—not far beyond it.</p></article>
          <article><span>03</span><h3>Follow what repeats</h3><p>Save recurring words and patterns. Let rare ones pass without guilt.</p></article>
        </div>
      </section>

      <section id="library" className="library-shell">
        <div className="library-heading">
          <div><span className="eyebrow">Curated for your stage</span><h2>Your resource shelf.</h2></div>
          <div className="level-stamp"><span>Showing</span><strong>{stage.level}</strong><small>{stage.count}</small></div>
        </div>
        <div className="library-tools">
          <div className="category-tabs" role="tablist" aria-label="Resource categories">
            {categories.map(({ name, icon: Icon }) => <button key={name} type="button" role="tab" aria-selected={category === name} className={category === name ? 'active' : ''} onClick={() => setCategory(name)}><Icon size={14} />{name}</button>)}
          </div>
          <label className="search-box"><Search size={16} /><span className="sr-only">Search resources</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search this stage" /></label>
        </div>

        <div className="resource-grid">
          {filtered.map((resource, index) => (
            <a className="resource-card" href={resource.href} target="_blank" rel="noreferrer" key={resource.title}>
              <div className="resource-meta"><span>{String(index + 1).padStart(2, '0')}</span><span>{resource.category}</span><span className={`price ${resource.price.toLowerCase()}`}>{resource.price}</span></div>
              <div className="resource-brand">
                <span className="resource-logo"><Image src={resourceLogo(resource.href)} alt="" width={48} height={48} unoptimized /></span>
                <div><h3>{resource.title}</h3>{resource.chinese && <b>{resource.chinese}</b>}</div>
              </div>
              <p>{resource.description}</p>
              <span className="resource-cta">Visit resource <ArrowUpRight size={16} /></span>
            </a>
          ))}
          {filtered.length === 0 && <div className="empty-state"><Search size={24} /><h3>No matches at this stage</h3><p>Try another category or a broader search.</p><Button variant="outline" onClick={() => { setCategory('All'); setQuery(''); }}>Clear filters</Button></div>}
        </div>
      </section>

      <section className="source-note">
        <div className="source-seal">路</div>
        <div><span className="eyebrow">Built with gratitude</span><h2>A shorter path, inspired by a deeper one.</h2><p>Mandarin Atlas distills a practical route through Chinese learning. For exhaustive reading guides, media rankings, and community knowledge, visit the original Heavenly Path.</p></div>
        <a href="https://heavenlypath.notion.site/heavenlypath/Heavenly-Path-d9be1806465b4525afeb132d1079194c" target="_blank" rel="noreferrer">Explore Heavenly Path <ArrowUpRight size={17} /></a>
      </section>

      <footer><a className="brand" href="#top"><span className="brand-mark">中</span><span>Mandarin Atlas</span></a><p>Follow curiosity. Keep going. 慢慢来。</p><a href="#top">Back to top ↑</a></footer>
    </main>
  );
}
