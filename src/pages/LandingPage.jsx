import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowDownRight, ArrowRight, Check, ChefHat, Clock3, Leaf, Menu,
  Refrigerator, ScanLine, ShoppingBasket, Sparkles, Sprout, X, CircleHelp,
} from 'lucide-react';
import './LandingPage.css';

const photo = (id, width = 1000) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
const reveal = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] } },
};

const features = [
  { icon: Refrigerator, number: '01', title: 'Know what you have', text: 'Keep your fridge, freezer, and pantry in one tidy place. See what needs to be used before it gets forgotten.', color: 'sage' },
  { icon: Sparkles, number: '02', title: 'Find your next meal', text: 'Turn the ingredients you already own into meal inspiration, instead of another last-minute grocery run.', color: 'peach' },
  { icon: ShoppingBasket, number: '03', title: 'Shop with a plan', text: 'Make a shopping list from what is missing and keep the little essentials from slipping your mind.', color: 'gold' },
  { icon: Leaf, number: '04', title: 'Waste less, feel good', text: 'Pay attention to freshness and use more of what you buy. Small kitchen habits can make a real difference.', color: 'clay' },
];

const faqs = [
  { q: 'What is CookEase?', a: 'CookEase is a kitchen companion that helps you keep track of ingredients, notice what needs to be used, find recipe inspiration, and organize your shopping list.' },
  { q: 'Do I need to add every ingredient manually?', a: 'You can add ingredients through the app and use the scan flow where supported. Manual entry is always available if a barcode cannot be read.' },
  { q: 'Will CookEase replace my grocery list?', a: 'That is the idea. Keep a running list in CookEase, check items off as you shop, and use your inventory to decide what you actually need.' },
  { q: 'Does the app have account sign-in?', a: 'This version opens the working app directly and stores your kitchen data in this browser. Account-based sign-in and cloud syncing are not configured in this codebase yet.' },
];

function Brand({ light = false }) {
  return <Link className={`cookease-brand ${light ? 'cookease-brand--light' : ''}`} to="/" aria-label="CookEase home">
    <span className="cookease-brand__mark"><ChefHat size={21} strokeWidth={2.3} /></span>
    <span>CookEase<span className="cookease-brand__dot">.</span></span>
  </Link>;
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="landing-page">
      <header className="landing-nav">
        <div className="landing-nav__inner">
          <Brand />
          <button className="landing-nav__mobile" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(v => !v)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <nav className={`landing-nav__links ${menuOpen ? 'landing-nav__links--open' : ''}`}>
            <a href="#how-it-works" onClick={closeMenu}>How it works</a>
            <a href="#features" onClick={closeMenu}>Features</a>
            <a href="#less-waste" onClick={closeMenu}>Our approach</a>
            <a className="landing-nav__login" href="#faq" onClick={closeMenu}>Questions</a>
            <Link className="button button--small" to="/dashboard" onClick={closeMenu}>Open CookEase <ArrowRight size={16} /></Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-orbit hero-orbit--one" />
          <div className="hero-orbit hero-orbit--two" />
          <div className="hero-section__grid">
            <motion.div className="hero-copy" initial="hidden" animate="visible" variants={reveal}>
              <div className="eyebrow"><span className="eyebrow__spark"><Sparkles size={14} /></span> A little more ease in your kitchen</div>
              <h1>Good food.<br />Less waste.<br /><em>More ease.</em></h1>
              <p className="hero-copy__body">Make the most of what you already have. CookEase helps you keep track of ingredients, find your next meal, and shop with a plan.</p>
              <div className="hero-copy__actions">
                <Link className="button" to="/dashboard">Get started free <ArrowRight size={18} /></Link>
                <a className="text-link" href="#how-it-works">See how it works <ArrowDownRight size={17} /></a>
              </div>
              <div className="hero-proof"><span className="hero-proof__avatars"><i>🥑</i><i>🍅</i><i>🥕</i></span><span>Less guessing. More good meals.</span></div>
            </motion.div>

            <motion.div className="hero-visual" initial={{ opacity: 0, scale: 0.94, rotate: 1.5 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 0.85, delay: 0.14, ease: 'easeOut' }}>
              <div className="hero-visual__photo"><img src={photo('photo-1547592180-85f173990554', 1300)} alt="Colorful fresh ingredients and a nourishing bowl of food" /></div>
              <div className="hero-visual__wash" />
              <div className="floating-note floating-note--fresh"><span className="floating-note__icon"><Leaf size={18} /></span><div><strong>Fresh first</strong><small>Use what you have</small></div><span className="note-check"><Check size={14} /></span></div>
              <div className="floating-note floating-note--recipe"><span className="recipe-thumb"><img src={photo('photo-1546069901-ba9599a7e63c', 300)} alt="Fresh salad recipe" /></span><div><small>TONIGHT'S IDEA</small><strong>Colorful grain bowl</strong><span className="recipe-time"><Clock3 size={12} /> 20 min · easy</span></div><ArrowRight size={16} />
              </div>
              <div className="hero-visual__caption"><span>YOUR KITCHEN,</span><strong>working smarter.</strong></div>
              <div className="hero-sticker"><Sprout size={22} /><span>Good habits<br />grow here.</span></div>
            </motion.div>
          </div>
          <div className="hero-bottom"><span>PLAN A LITTLE</span><span className="hero-bottom__line" /><span>COOK A LOT</span><span className="hero-bottom__leaf"><Leaf size={15} /></span></div>
        </section>

        <section className="benefit-strip" aria-label="CookEase benefits">
          <div className="benefit-strip__inner">
            <div><span className="benefit-icon benefit-icon--sage"><Refrigerator size={20} /></span><span><strong>Your kitchen, organized</strong><small>One view of what you have</small></span></div>
            <div><span className="benefit-icon benefit-icon--peach"><Sparkles size={20} /></span><span><strong>Ideas from ingredients</strong><small>Start with what is on hand</small></span></div>
            <div><span className="benefit-icon benefit-icon--gold"><ShoppingBasket size={20} /></span><span><strong>Shopping made simpler</strong><small>Buy what you really need</small></span></div>
          </div>
        </section>

        <section className="intro-section section-pad" id="features">
          <motion.div className="section-heading" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }} variants={reveal}>
            <span className="eyebrow">A calmer kind of cooking</span>
            <h2>Your kitchen has<br /><em>more potential.</em></h2>
            <p>Good meals start before you turn on the stove. CookEase connects the small things that make cooking feel easier, from the fridge shelf to the shopping bag.</p>
          </motion.div>
          <div className="feature-grid">
            {features.map(({ icon: Icon, number, title, text, color }, index) => (
              <motion.article className="feature-card" key={number} custom={index} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={{ ...reveal, visible: { ...reveal.visible, transition: { ...reveal.visible.transition, delay: index * 0.08 } } }}>
                <div className={`feature-card__icon feature-card__icon--${color}`}><Icon size={23} strokeWidth={1.8} /></div>
                <span className="feature-card__number">{number}</span>
                <h3>{title}</h3><p>{text}</p>
                <span className="feature-card__rule" />
              </motion.article>
            ))}
          </div>
        </section>

        <section className="inventory-section section-pad">
          <motion.div className="inventory-photo" initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.7 }}>
            <img src={photo('photo-1579113800032-c38bd7635818', 1000)} alt="Fresh vegetables neatly stored in a refrigerator" />
            <div className="photo-label"><span className="photo-label__dot" /><span><strong>In your fridge</strong><small>Know it before you buy it</small></span></div>
            <div className="produce-sticker">Freshness<br /><em>feels good.</em></div>
          </motion.div>
          <motion.div className="inventory-copy" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={reveal}>
            <span className="eyebrow">01 / Keep the good stuff in sight</span>
            <h2>Out of sight<br />shouldn't mean<br /><em>out of mind.</em></h2>
            <p>Forgotten leftovers and duplicate groceries are easy to avoid when you have one clear place to track your ingredients. Add items, keep an eye on expiry dates, and make your next meal count.</p>
            <ul className="check-list"><li><Check size={16} /> Track fridge, freezer, and pantry items</li><li><Check size={16} /> Spot ingredients that need using soon</li><li><Check size={16} /> Add items with a quick scan or manual entry</li></ul>
            <Link className="underlined-link" to="/fridge">Explore your fridge <ArrowRight size={17} /></Link>
          </motion.div>
        </section>

        <section className="recipe-section section-pad">
          <motion.div className="recipe-copy" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={reveal}>
            <span className="eyebrow">02 / Let ingredients lead</span>
            <h2>What's in the fridge?<br /><em>That's dinner.</em></h2>
            <p>Skip the blank stare into the refrigerator. Use your ingredients as a starting point for recipe ideas, then save the meals you want to make again.</p>
            <div className="recipe-pills"><span><Sparkles size={14} /> Ingredient-led ideas</span><span><Clock3 size={14} /> Weeknight friendly</span></div>
            <Link className="underlined-link" to="/recipes">Find recipe inspiration <ArrowRight size={17} /></Link>
          </motion.div>
          <motion.div className="recipe-collage" initial={{ opacity: 0, x: 25 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.7 }}>
            <div className="recipe-collage__main"><img src={photo('photo-1512621776951-a57141f2eefd', 1000)} alt="A fresh, colorful bowl ready for dinner" /><div className="recipe-collage__tag"><Sparkles size={15} /> Made from what you have</div></div>
            <div className="recipe-collage__small"><img src={photo('photo-1476224203421-9ac39bcb3327', 500)} alt="A home-cooked meal on a plate" /></div>
            <div className="recipe-doodle">mix<br />match<br /><em>enjoy!</em></div>
          </motion.div>
        </section>

        <section className="steps-section section-pad" id="how-it-works">
          <div className="steps-section__top"><div><span className="eyebrow">Simple by design</span><h2>Three small steps.<br /><em>A better kitchen rhythm.</em></h2></div><p>No complicated setup. Start with what is in your kitchen today, and build better habits as you go.</p></div>
          <div className="steps-grid">
            <motion.article className="step-card" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={reveal}><div className="step-card__visual step-card__visual--one"><span className="step-card__big">01</span><ScanLine size={56} strokeWidth={1.2} /><span className="step-card__mini">SCAN OR ADD</span></div><span className="step-card__count">STEP 01</span><h3>Stock your kitchen</h3><p>Add what you have and keep your ingredients easy to find, from produce to pantry staples.</p></motion.article>
            <motion.article className="step-card" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={{ ...reveal, visible: { ...reveal.visible, transition: { duration: 0.62, delay: 0.1 } } }}><div className="step-card__visual step-card__visual--two"><span className="step-card__big">02</span><ChefHat size={56} strokeWidth={1.2} /><span className="step-card__mini">GET INSPIRED</span></div><span className="step-card__count">STEP 02</span><h3>Make a plan</h3><p>See what needs using and find a recipe direction before you reach for your keys or delivery app.</p></motion.article>
            <motion.article className="step-card" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={{ ...reveal, visible: { ...reveal.visible, transition: { duration: 0.62, delay: 0.2 } } }}><div className="step-card__visual step-card__visual--three"><span className="step-card__big">03</span><Leaf size={56} strokeWidth={1.2} /><span className="step-card__mini">COOK & REPEAT</span></div><span className="step-card__count">STEP 03</span><h3>Use more. Waste less.</h3><p>Cook with intention, shop for the gaps, and feel good about making more of every grocery run.</p></motion.article>
          </div>
        </section>

        <section className="less-waste-section" id="less-waste">
          <div className="less-waste-section__photo"><img src={photo('photo-1540420773420-3366772f4999', 1400)} alt="Fresh produce and greens for a low-waste meal" /></div>
          <div className="less-waste-section__content"><span className="eyebrow eyebrow--light">A small change with a good feeling</span><h2>Love your food<br />all the way to<br /><em>the last bite.</em></h2><p>Every ingredient you use is a little less food forgotten, a little less money wasted, and a little more care in your everyday routine.</p><Link className="button button--cream" to="/dashboard">Make your kitchen easier <ArrowRight size={18} /></Link><div className="less-waste-section__scribble">good food<br />deserves<br /><em>to be enjoyed.</em></div></div>
        </section>

        <section className="faq-section section-pad" id="faq">
          <div className="faq-section__heading"><span className="eyebrow"><CircleHelp size={14} /> A few helpful answers</span><h2>Good questions.<br /><em>Simple answers.</em></h2><p>Want to know a little more before you jump in?</p></div>
          <div className="faq-list">{faqs.map((faq, index) => <div className={`faq-item ${openFaq === index ? 'faq-item--open' : ''}`} key={faq.q}><button onClick={() => setOpenFaq(openFaq === index ? -1 : index)} aria-expanded={openFaq === index}><span>{faq.q}</span><span className="faq-item__toggle">{openFaq === index ? <X size={17} /> : <ArrowRight size={17} />}</span></button>{openFaq === index && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.25 }}>{faq.a}</motion.p>}</div>)}</div>
        </section>

        <section className="final-cta">
          <div className="final-cta__decoration final-cta__decoration--left">✳</div><div className="final-cta__decoration final-cta__decoration--right">✳</div>
          <span className="eyebrow eyebrow--light">Your next good meal starts here</span><h2>Make room for<br /><em>more delicious.</em></h2><p>Start with what you have. We'll help with the rest.</p><Link className="button button--cream" to="/dashboard">Let's get cooking <ArrowRight size={18} /></Link>
        </section>
      </main>

      <footer className="landing-footer"><div className="landing-footer__top"><Brand light /><p>A little more ease.<br />A little less waste.</p><Link to="/dashboard" className="landing-footer__app">Go to the app <ArrowRight size={16} /></Link></div><div className="landing-footer__bottom"><span>© {new Date().getFullYear()} CookEase</span><span>Made for everyday kitchens, and the good things in them.</span><a href="#top" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Back to top ↑</a></div></footer>
    </div>
  );
}
