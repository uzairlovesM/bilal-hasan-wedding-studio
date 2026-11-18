import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animate as anime } from 'animejs';
import { weddingEvents, invitationText, type WeddingEvent } from './data';
import { useStudioStore } from './store';
import { soundStudio } from './audio/SoundStudio';
import { mountEnvelopeScene, type EnvelopeController } from './engine/EnvelopeScene';
import { mountBabylonAlternative } from './engine/BabylonAlternative';
import PixiAtmosphere from './components/PixiAtmosphere';
import WorkerPetals from './components/WorkerPetals';
import LottieFlourish from './components/LottieFlourish';
import RiveAccent from './components/RiveAccent';

gsap.registerPlugin(ScrollTrigger);

function toUrduDigits(input: string | number) {
  return String(input).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
}

function useCountdown(target: string) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, ended: false });
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, new Date(target).getTime() - Date.now());
      setTime({ days: Math.floor(diff / 86400000), hours: Math.floor(diff / 3600000) % 24, minutes: Math.floor(diff / 60000) % 60, seconds: Math.floor(diff / 1000) % 60, ended: diff <= 0 });
    };
    tick(); const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [target]);
  return time;
}

function createCalendar(event: WeddingEvent) {
  const start = new Date(event.isoLocal);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const stamp = (date: Date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Bilal Hasan Wedding//Urdu Invitation//EN', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', `UID:${event.id}-bilal-hasan-2026@wedding.invitation`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`, `SUMMARY:${event.title} - Bilal Hasan`, `LOCATION:${event.address}`, `DESCRIPTION:${event.description}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${event.id}-bilal-hasan.ics`; anchor.click();
  URL.revokeObjectURL(url);
}

function EventCard({ event, index, onSelect }: { event: WeddingEvent; index: number; onSelect: (event: WeddingEvent) => void }) {
  return <motion.article className={`event-card event-${event.id} reveal`} initial={{ opacity: 0, y: 42 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ duration: .75, delay: index * .08, ease: [.18, .8, .2, 1] }}>
    <div className="event-photo-wrap">
      <img src={event.scene} alt={`${event.title} کی تقریب کا منظر`} className="event-photo" loading="lazy" />
      <div className="event-photo-shade" />
      <span className="event-index">۰{index + 1}</span>
      <span className="event-english">{event.english}</span>
      <button className="photo-open" onClick={() => onSelect(event)} aria-label={`${event.title} کی تفصیل دیکھیں`}>↗</button>
    </div>
    <div className="event-info">
      <div className="event-heading"><h3>{event.title}</h3><span className="event-status">{event.weekday}</span></div>
      <p className="event-description">{event.description}</p>
      <div className="event-meta"><span className="meta-icon">▦</span><span>{event.dateLabel}</span></div>
      <div className="event-meta"><span className="meta-icon">◷</span><span>{event.timeLabel}</span></div>
      <div className="event-meta"><span className="meta-icon">⌖</span><span>{event.venue}، پنڈی بھٹیاں</span></div>
      <div className="event-actions">
        <button className="text-action" onClick={() => createCalendar(event)}>کیلنڈر میں شامل کریں <span>＋</span></button>
        <a className="text-action" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address)}`} target="_blank" rel="noreferrer">راستہ دیکھیں <span>↗</span></a>
      </div>
    </div>
  </motion.article>;
}

function EventModal({ event, onClose }: { event: WeddingEvent | null; onClose: () => void }) {
  return <AnimatePresence>{event && <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
    <motion.div className="event-modal" role="dialog" aria-modal="true" initial={{ y: 36, scale: .96, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 24, scale: .96, opacity: 0 }} onClick={e => e.stopPropagation()}>
      <button className="modal-close" onClick={onClose} aria-label="بند کریں">×</button>
      <img src={event.detail} alt={`${event.title} کی آرائش`} />
      <div className="modal-copy"><span className="eyebrow">{event.english}</span><h3>{event.title}</h3><p>{event.description}</p><div className="modal-meta">{event.dateLabel} · {event.weekday}</div><div className="modal-meta">{event.timeLabel}</div><div className="modal-meta">{event.address}</div><button className="gold-button" onClick={() => createCalendar(event)}>کیلنڈر میں محفوظ کریں</button></div>
    </motion.div>
  </motion.div>}</AnimatePresence>;
}

function Gallery({ onOpen }: { onOpen: (src: string) => void }) {
  const images = [
    ['/assets/envelope-still-life.webp', 'شاہانہ دعوت نامہ'],
    ['/assets/mehndi-detail.webp', 'مہندی کی آرائش'],
    ['/assets/barat-detail.webp', 'بارات کا استقبال'],
    ['/assets/walima-detail.webp', 'ولیمہ کی ضیافت'],
    ['/assets/mehndi-scene.webp', 'مہندی کی شام'],
    ['/assets/barat-scene.webp', 'بارات کا منظر'],
    ['/assets/walima-scene.webp', 'ولیمہ کا ہال']
  ];
  return <div className="gallery-grid">
    {images.map(([src, title], i) => <motion.button key={src} className={`gallery-item gallery-item-${i}`} onClick={() => onOpen(src)} whileHover={{ y: -7, scale: 1.015 }} whileTap={{ scale: .985 }}>
      <img src={src} alt={title} loading="lazy" /><span>{title}</span><i>↗</i>
    </motion.button>)}
  </div>;
}

function Countdown() {
  const first = useCountdown(weddingEvents[0].isoLocal);
  return <div className="countdown" aria-live="off">
    {first.ended ? <span className="countdown-ended">تقریبات کا آغاز ہو چکا ہے</span> : <>
      {([['days', 'دن'], ['hours', 'گھنٹے'], ['minutes', 'منٹ'], ['seconds', 'سیکنڈ']] as const).map(([key, label]) => <div className="count-part" key={key}><strong>{toUrduDigits(first[key])}</strong><span>{label}</span></div>)}
    </>}
  </div>;
}

function useRevealAnimations(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const elements = gsap.utils.toArray<HTMLElement>('.scroll-reveal');
    const triggers = elements.map(element => gsap.fromTo(element, { y: 38, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 88%', once: true } }));
    const ornaments = document.querySelectorAll<HTMLElement>('.gold-rule, .section-ornament');
    ornaments.forEach(el => anime(el, { scaleX: [0.4, 1], opacity: [.35, 1], duration: 1800, alternate: true, loop: true, ease: 'inOutSine' }));
    return () => { triggers.forEach(t => t.kill()); ScrollTrigger.getAll().forEach(t => t.kill()); };
  }, [enabled]);
}

function BabylonCanvas({ enabled }: { enabled: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!enabled || !canvasRef.current) return;
    let cleanup: (() => void) | undefined;
    let live = true;
    mountBabylonAlternative(canvasRef.current).then(fn => { if (live) cleanup = fn; else fn(); }).catch(() => undefined);
    return () => { live = false; cleanup?.(); };
  }, [enabled]);
  return enabled ? <canvas ref={canvasRef} className="babylon-alternative" /> : null;
}

export default function App() {
  const introRef = useRef<HTMLDivElement>(null);
  const sceneHost = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const controller = useRef<EnvelopeController | null>(null);
  const [settled, setSettled] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<WeddingEvent | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [guestEditor, setGuestEditor] = useState(false);
  const [guestDraft, setGuestDraft] = useState('');
  const [qualityPanel, setQualityPanel] = useState(false);
  const [graphicsMode, setGraphicsMode] = useState<'three' | 'babylon'>('three');
  const [copied, setCopied] = useState(false);
  const name = useStudioStore(s => s.name);
  const opened = useStudioStore(s => s.opened);
  const soundEnabled = useStudioStore(s => s.soundEnabled);
  const motionEnabled = useStudioStore(s => s.motionEnabled);
  const engine = useStudioStore(s => s.engine);
  const quality = useStudioStore(s => s.quality);
  const setOpened = useStudioStore(s => s.setOpened);
  const setGuest = useStudioStore(s => s.setGuest);
  const setMotion = useStudioStore(s => s.setMotion);
  const setQuality = useStudioStore(s => s.setQuality);
  const setEngine = useStudioStore(s => s.setEngine);

  useRevealAnimations(opened && motionEnabled);

  useEffect(() => {
    if (!sceneHost.current) return;
    let disposed = false;
    mountEnvelopeScene(sceneHost.current, () => { if (!disposed) { setSettled(true); soundStudio.play('impact'); } }, () => {
      if (disposed) return;
      setOpened(true); soundStudio.play('chime');
      if (introRef.current) gsap.to(introRef.current, { autoAlpha: 0, duration: 1.1, ease: 'power3.inOut', onComplete: () => { if (introRef.current) introRef.current.style.display = 'none'; } });
      window.setTimeout(() => mainRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 420);
    }).then(api => { if (disposed) api.dispose(); else controller.current = api; }).catch(() => {
      import('./engine/canvasFallback').then(({ mountCanvasFallback }) => {
        if (!sceneHost.current || disposed) return;
        const api = mountCanvasFallback(sceneHost.current, () => setSettled(true), () => { setOpened(true); if (introRef.current) gsap.to(introRef.current, { autoAlpha: 0, duration: 1, onComplete: () => { if (introRef.current) introRef.current.style.display = 'none'; } }); });
        controller.current = api;
      }).catch(() => undefined);
    });
    return () => { disposed = true; controller.current?.dispose(); controller.current = null; };
  }, [setOpened, engine, quality]);

  useEffect(() => {
    if (graphicsMode === 'babylon') controller.current?.pause();
    else if (controller.current) controller.current.pause();
  }, [graphicsMode]);

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true, touchMultiplier: 1.15, wheelMultiplier: .8 });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); lenis.destroy(); };
  }, []);

  useEffect(() => {
    if (soundEnabled) {
      soundStudio.enable().then(() => { if (opened) soundStudio.playMusic(); }).catch(() => undefined);
    } else soundStudio.disable();
    return () => soundStudio.disable();
  }, [soundEnabled, opened]);

  useEffect(() => {
    if (!opened) return;
    const cards = document.querySelectorAll('.event-card');
    gsap.fromTo(cards, { y: 34, rotateX: 3, autoAlpha: 0 }, { y: 0, rotateX: 0, autoAlpha: 1, duration: 1.1, stagger: .15, ease: 'power3.out', scrollTrigger: { trigger: '.events-grid', start: 'top 86%' } });
  }, [opened]);

  const openEnvelope = useCallback(async () => {
    if (!controller.current || !settled || opened) return;
    if (!soundEnabled) { await soundStudio.enable(); useStudioStore.setState({ soundEnabled: true, soundPrimed: true }); }
    soundStudio.play('seal');
    soundStudio.play('paper');
    soundStudio.playMusic();
    await controller.current.open();
  }, [settled, opened, soundEnabled]);

  const replayEnvelope = () => {
    setOpened(false); setSettled(false);
    if (introRef.current) { introRef.current.style.display = 'grid'; gsap.set(introRef.current, { autoAlpha: 1 }); }
    controller.current?.replay();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSound = async () => {
    if (soundEnabled) { soundStudio.disable(); useStudioStore.setState({ soundEnabled: false }); }
    else {
      await soundStudio.enable();
      useStudioStore.setState({ soundEnabled: true, soundPrimed: true });
      soundStudio.play('chime');
      if (opened) soundStudio.playMusic();
    }
  };

  const copyInvitation = async () => {
    try { await navigator.clipboard.writeText(invitationText); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { setCopied(false); }
  };

  const shareInvitation = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'دعوتِ شادی — بلال حسن', text: invitationText, url: location.href });
    } else copyInvitation();
  };

  const allCalendar = () => {
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Bilal Hasan Wedding//Invitation//EN', 'CALSCALE:GREGORIAN'];
    weddingEvents.forEach(event => {
      const start = new Date(event.isoLocal); const end = new Date(start.getTime() + 7200000);
      const stamp = (date: Date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      lines.push('BEGIN:VEVENT', `UID:${event.id}-bilal-hasan-2026@wedding.invitation`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`, `SUMMARY:${event.title} - Bilal Hasan`, `LOCATION:${event.address}`, 'END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    const url = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/calendar' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'bilal-hasan-all-events.ics'; anchor.click(); URL.revokeObjectURL(url);
  };

  return <div className={`app-shell ${motionEnabled ? 'motion-enabled' : 'motion-reduced'}`}>
    <div className="paper-grain" aria-hidden="true" />
    <PixiAtmosphere />
    <WorkerPetals />
    <div className="intro-screen" ref={introRef} style={{ backgroundImage: 'linear-gradient(180deg,rgba(18,32,24,.38),rgba(22,34,25,.72)),url(/assets/mehndi-detail.webp)' }}>
      <div className="intro-topline"><span>دعوتِ مسرت و شادمانی</span><span>۲۸ — ۳۰ نومبر ۲۰۲۶</span></div>
      <div className="intro-head"><div className="intro-bismillah">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</div><h1>دعوتِ شادی</h1><p>بلال حسن <b>✦</b> ظفر اقبال</p></div>
      <div className="scene-stage" ref={sceneHost}>
        {graphicsMode === 'babylon' && <BabylonCanvas enabled />}
        <div className="scene-vignette" />
        <div className="envelope-loading" aria-live="polite">{settled ? 'آپ کا دعوت نامہ حاضر ہے' : 'ایک خاص دعوت آپ کے نام…'}</div>
        <button className={`envelope-cta ${settled ? 'is-ready' : ''}`} onClick={openEnvelope} disabled={!settled || opened}>
          <span className="cta-seal">ب</span><span>{opened ? 'دعوت نامہ کھل گیا' : settled ? 'مہر کھولیں' : 'لفافہ آ رہا ہے'}</span><i>✦</i>
        </button>
      </div>
      <div className="intro-bottom"><span>لفافہ زمین پر آئے گا، پھر آپ کی دعوت کھلے گی</span><span className="scroll-hint">↓</span></div>
      <div className="intro-tools">
        <button onClick={toggleSound} title="آواز">{soundEnabled ? '♫' : '♩'}</button>
        <button onClick={() => setMotion(!motionEnabled)} title="حرکت">{motionEnabled ? '◌' : 'Ⅱ'}</button>
        <button onClick={() => setQualityPanel(v => !v)} title="ترتیبات">⚙</button>
      </div>
      <AnimatePresence>{qualityPanel && <motion.div className="quality-popover" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}>
        <label>گرافکس معیار<select value={quality} onChange={e => setQuality(e.target.value as any)}><option value="auto">خودکار</option><option value="high">اعلیٰ</option><option value="balanced">متوازن</option><option value="battery">بیٹری محفوظ</option></select></label>
        <label>رینڈرنگ<select value={engine} onChange={e => setEngine(e.target.value as any)}><option value="auto">خودکار</option><option value="webgpu">WebGPU</option><option value="webgl">WebGL</option><option value="canvas">Canvas fallback</option></select></label>
        <label>متبادل انجن<select value={graphicsMode} onChange={e => setGraphicsMode(e.target.value as any)}><option value="three">Three.js</option><option value="babylon">Babylon.js</option></select></label>
      </motion.div>}</AnimatePresence>
    </div>

    <header className="site-header">
      <a className="brand-mark" href="#home"><span>ب</span><i>دعوتِ شادی</i></a>
      <nav><a href="#events">تقریبات</a><a href="#story">دعوت</a><a href="#gallery">تصویری جھلکیاں</a><a href="#venue">مقامات</a></nav>
      <div className="header-actions"><button onClick={toggleSound} aria-label="آواز">{soundEnabled ? '♫' : '♩'}</button><button onClick={() => setGuestEditor(true)}>مہمان کا نام</button></div>
    </header>

    <main ref={mainRef} id="home" className={opened ? 'invitation-open' : 'invitation-locked'}>
      <section className="hero-section">
        <div className="hero-photo" />
        <div className="hero-overlay" />
        <div className="hero-content scroll-reveal">
          <span className="hero-kicker">بسم اللہ الرحمن الرحیم</span>
          <LottieFlourish className="hero-flourish" />
          <p className="hero-small">دعوتِ مسرت و شادمانی</p>
          <h2>بلال حسن</h2>
          <div className="hero-divider"><span>✦</span></div>
          <p className="hero-parent">فرزندِ جناب ظفر اقبال</p>
          <p className="hero-invite">{name === 'معزز مہمان' ? 'آپ کو' : `${name} صاحب کو`} اس خوشی کے موقع پر شرکت کی پُرخلوص دعوت دی جاتی ہے۔</p>
          <div className="hero-actions"><a className="gold-button" href="#events">تقریبات دیکھیں <span>↓</span></a><button className="outline-button" onClick={shareInvitation}>دعوت شیئر کریں</button></div>
        </div>
        <div className="hero-side-note">A CELEBRATION OF LOVE & FAMILY</div>
        <div className="hero-bottom-note"><span>۲۰۲۶</span><span>نومبر</span><span>پنڈی بھٹیاں</span></div>
      </section>

      <section className="welcome-strip scroll-reveal" id="story">
        <div className="strip-emblem">❦</div>
        <div><span className="eyebrow">آپ کی تشریف آوری ہمارے لیے اعزاز ہے</span><h2>خوشیوں کے اس سفر میں ہمارے شریکِ سفر بنیں</h2><p>آپ کی دعاؤں اور موجودگی سے یہ لمحات مزید یادگار ہوں گے۔</p></div>
        <div className="strip-ornament">✧</div>
      </section>

      <section className="events-section" id="events">
        <div className="section-heading scroll-reveal"><span className="eyebrow">THE CELEBRATIONS</span><h2>تقریبات کی تفصیل</h2><p>تین دن، تین خوشیاں، اور آپ کی شرکت ہماری سب سے بڑی خوشی</p><div className="gold-rule" /></div>
        <div className="events-grid">{weddingEvents.map((event, index) => <EventCard key={event.id} event={event} index={index} onSelect={setSelectedEvent} />)}</div>
      </section>

      <section className="countdown-section scroll-reveal">
        <div className="countdown-photo" />
        <div className="countdown-copy"><span className="eyebrow">THE FIRST CELEBRATION BEGINS IN</span><h2>مہندی کی شام تک باقی وقت</h2><Countdown /><p>۲۸ نومبر ۲۰۲۶ · رات ۹:۰۰ بجے</p></div>
      </section>

      <section className="gallery-section" id="gallery">
        <div className="section-heading scroll-reveal"><span className="eyebrow">VISUAL MEMORIES</span><h2>خوشیوں کی تصویری جھلکیاں</h2><p>ہر منظر محبت، روشنی اور خوبصورتی سے سجا ہوا</p><div className="gold-rule" /></div>
        <Gallery onOpen={setLightbox} />
      </section>

      <section className="venue-section" id="venue">
        <div className="venue-text scroll-reveal"><span className="eyebrow">THE VENUES</span><h2>آپ کی راہ تک رہے ہیں</h2><p>مہندی اور بارات کی تقریبات حمزہ ٹاؤن میں منعقد ہوں گی، جبکہ ولیمہ ملک میرج ہال میں ہوگا۔</p><a className="text-action" href="https://www.google.com/maps/search/?api=1&query=Hamza+Town+Pindi+Bhattian+Pakistan" target="_blank" rel="noreferrer">حمزہ ٹاؤن کا راستہ <span>↗</span></a><a className="text-action" href="https://www.google.com/maps/search/?api=1&query=Malik+Marriage+Hall+Pindi+Bhattian+Pakistan" target="_blank" rel="noreferrer">ملک میرج ہال کا راستہ <span>↗</span></a></div>
        <div className="venue-photo"><img src="/assets/walima-detail.webp" alt="شاہانہ ولیمہ ہال" loading="lazy" /><div className="venue-photo-frame" /></div>
      </section>

      <section className="closing-section">
        <RiveAccent />
        <div className="closing-content scroll-reveal"><LottieFlourish /><span className="eyebrow">WITH LOVE & PRAYERS</span><h2>آپ کی شرکت ہمارے لیے باعثِ مسرت ہوگی</h2><p>اللہ تعالیٰ اس نئے سفر کو محبت، خوشیوں اور برکتوں سے بھر دے۔ آمین</p><div className="closing-actions"><button className="gold-button" onClick={copyInvitation}>{copied ? 'دعوت کاپی ہوگئی' : 'دعوت کا متن کاپی کریں'}</button><button className="outline-button" onClick={allCalendar}>تمام تقریبات کیلنڈر میں محفوظ کریں</button></div></div>
        <footer><span>بلال حسن × ظفر اقبال</span><button onClick={replayEnvelope}>لفافہ دوبارہ دیکھیں ↺</button><span>نومبر ۲۰۲۶</span></footer>
      </section>
    </main>

    <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    <AnimatePresence>{lightbox && <motion.div className="lightbox-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightbox(null)}><button className="lightbox-close" onClick={() => setLightbox(null)}>×</button><motion.img src={lightbox} initial={{ scale: .9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: .96, opacity: 0 }} onClick={e => e.stopPropagation()} /></motion.div>}</AnimatePresence>
    <AnimatePresence>{guestEditor && <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setGuestEditor(false)}><motion.form className="guest-modal" initial={{ y: 22, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} onSubmit={e => { e.preventDefault(); setGuest(guestDraft); setGuestEditor(false); }} onClick={e => e.stopPropagation()}><button type="button" className="modal-close" onClick={() => setGuestEditor(false)}>×</button><span className="eyebrow">PERSONAL INVITATION</span><h3>مہمان کا نام</h3><p>دعوت نامے پر اپنا یا مہمان کا نام دکھائیں۔</p><input value={guestDraft} onChange={e => setGuestDraft(e.target.value)} maxLength={48} placeholder="نام درج کریں" /><button className="gold-button" type="submit">محفوظ کریں</button></motion.form></motion.div>}</AnimatePresence>
    <div className="toast" aria-live="polite">{copied ? 'دعوت کا متن کاپی ہو گیا' : ''}</div>
  </div>;
}
