import React, {useEffect, useRef, useState} from "react";
import {createRoot} from "react-dom/client";
import {COMPANY, API_BASE} from "./config";
import {CERTIFICATIONS, MILESTONES, VALUES, TEAM, TESTIMONIALS, CAPABILITIES, PROCESS_STEPS, FAQS, BLOG_POSTS, POSITIONS, PERKS, RESEARCH_STAGES, GMP_STAGES, NUMBER_STATS} from "./content";
import {DnaHelix, FloatingCapsules, CursorGlow, ParticleField, TiltCard, Magnetic, Counter, ResearchPipeline} from "./effects";
import "./styles.css";

/* ---------- Scroll-reveal animation utilities ---------- */

// Watches an element and flips `visible` to true the moment it enters the
// viewport. Only fires once per element (unobserves itself after).
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      {threshold}
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

// Drop-in wrapper: <Reveal delay={100}>...</Reveal> fades/slides its
// children up into place the first time they scroll into view.
function Reveal({children, delay = 0, className = "", as: Tag = "div", ...rest}) {
  const [ref, visible] = useReveal();
  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? "in" : ""} ${className}`}
      style={{transitionDelay: `${delay}ms`}}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// Pings the backend once on mount and reports whether it's reachable.
// Used to show "live data" vs "demo preview" instead of silently falling
// back to hardcoded content with no explanation.
function useApiStatus() {
  const [status, setStatus] = useState("checking"); // "checking" | "online" | "offline"
  useEffect(() => {
    let cancelled = false;
    fetch(API_BASE + "/health")
      .then(r => { if (!cancelled) setStatus(r.ok ? "online" : "offline"); })
      .catch(() => { if (!cancelled) setStatus("offline"); });
    return () => { cancelled = true; };
  }, []);
  return status;
}

function ApiStatusBadge() {
  const status = useApiStatus();
  if (status === "checking") return null;
  return (
    <span className={`apiStatus ${status}`}>
      <i></i>{status === "online" ? "Live data connected" : "Demo preview — backend offline"}
    </span>
  );
}
function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 480);
    window.addEventListener("scroll", onScroll, {passive: true});
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <button
      className={`toTop ${show ? "show" : ""}`}
      onClick={() => window.scrollTo({top: 0, behavior: "smooth"})}
      aria-label="Back to top"
    >
      ↑
    </button>
  );
}

/* ---------- Reusable content-section building blocks ---------- */

// Row of certification/compliance badges — used on Home and Quality.
function BadgeStrip({items = CERTIFICATIONS}) {
  return (
    <Reveal className="badgeStrip">
      {items.map(b => <span className="badge" key={b}>{b}</span>)}
    </Reveal>
  );
}

// Numbered 4-step process row — used on Home and PCD Franchise.
function ProcessSteps({steps = PROCESS_STEPS}) {
  return (
    <div className="processGrid">
      {steps.map((s, i) => (
        <Reveal delay={i * 100} className="processStep" key={s.t}>
          <span className="processNum">{String(i + 1).padStart(2, "0")}</span>
          <h3>{s.t}</h3>
          <p>{s.d}</p>
        </Reveal>
      ))}
    </div>
  );
}

// Testimonial quote cards — used on Home and PCD Franchise.
function Testimonials({items = TESTIMONIALS}) {
  return (
    <div className="grid3">
      {items.map((t, i) => (
        <Reveal delay={i * 100} className="quoteCard" key={t.name + i}>
          <p>"{t.quote}"</p>
          <div className="quoteBy"><b>{t.name}</b><small>{t.role}</small></div>
        </Reveal>
      ))}
    </div>
  );
}

// Leadership team grid — used on About.
function TeamGrid({people = TEAM}) {
  return (
    <div className="grid4">
      {people.map((p, i) => (
        <Reveal delay={i * 90} className="teamCard" key={p.name + i}>
          <div className="avatar">{p.name.split(" ").map(w => w[0]).join("")}</div>
          <h3>{p.name}</h3>
          <span>{p.role}</span>
          <p>{p.bio}</p>
        </Reveal>
      ))}
    </div>
  );
}

// Vertical milestone timeline — used on About.
function Timeline({items = MILESTONES}) {
  return (
    <div className="timeline">
      {items.map((m, i) => (
        <Reveal delay={i * 80} className="timelineItem" key={m.year}>
          <span className="timelineYear">{m.year}</span>
          <p>{m.text}</p>
        </Reveal>
      ))}
    </div>
  );
}

// Collapsible FAQ accordion — used on PCD Franchise, Quality and Contact.
function FAQ({items = FAQS}) {
  const [open, setOpen] = useState(0);
  return (
    <div className="faqList">
      {items.map((f, i) => (
        <Reveal delay={i * 60} className={`faqItem ${open === i ? "openFaq" : ""}`} key={f.q}>
          <button className="faqQ" onClick={() => setOpen(open === i ? -1 : i)}>
            <span>{f.q}</span>
            <span className="faqIcon">{open === i ? "−" : "+"}</span>
          </button>
          {open === i && <p className="faqA">{f.a}</p>}
        </Reveal>
      ))}
    </div>
  );
}

const demoProducts = [
 {id:"demo-1",name:"Product Name 01",composition:"Add verified composition",dosage_form:"Tablet",category:"General",image_url:"/products/product-placeholder.svg",description:"Replace this demo information with verified product details."},
 {id:"demo-2",name:"Product Name 02",composition:"Add verified composition",dosage_form:"Capsule",category:"General",image_url:"/products/product-placeholder.svg",description:"Replace this demo information with verified product details."},
 {id:"demo-3",name:"Product Name 03",composition:"Add verified composition",dosage_form:"Syrup",category:"General",image_url:"/products/product-placeholder.svg",description:"Replace this demo information with verified product details."}
];

const NAV_PAGES = ["home","about","products","pcd","manufacturing","quality","blog","careers","contact"];

function Layout({children, setPage, page}) {
  const [scrolled, setScrolled] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 12);
      // Hide only once we're past the hero, and only while actively
      // scrolling down; any upward movement brings it right back.
      if (y > lastY && y > 140) setNavHidden(true);
      else setNavHidden(false);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, {passive: true});
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <>
      <CursorGlow />
      <header className={`nav ${scrolled ? "scrolled" : ""} ${navHidden ? "navHidden" : ""}`}>
        <div className="brand" onClick={() => setPage("home")}>
          <img src={COMPANY.logo} />
          <span>{COMPANY.name}</span>
        </div>
        <nav>
          {NAV_PAGES.map(p => (
            <button
              key={p}
              className={page === p ? "activeLink" : ""}
              onClick={() => setPage(p)}
            >
              {p === "pcd" ? "PCD Franchise" : p.replace(/^\w/, c => c.toUpperCase())}
            </button>
          ))}
        </nav>
        <a className="navcta" href={`https://wa.me/${COMPANY.whatsapp}`} target="_blank">WhatsApp</a>
      </header>

      {children}

      <BackToTop />

      <footer>
        <div className="footBrand">
          <h3>{COMPANY.name}</h3>
          <p>{COMPANY.tagline}</p>
          <p>{COMPANY.address}</p>
          <div className="footSocial">
            <a href={COMPANY.social.linkedin} target="_blank" aria-label="LinkedIn">in</a>
            <a href={COMPANY.social.instagram} target="_blank" aria-label="Instagram">ig</a>
            <a href={COMPANY.social.facebook} target="_blank" aria-label="Facebook">fb</a>
          </div>
        </div>
        <div><h4>Contact</h4><p>{COMPANY.phone}</p><p>{COMPANY.email}</p></div>
        <div>
          <h4>Quick Links</h4>
          {["products","pcd","manufacturing","quality","careers"].map(p => (
            <p key={p} className="footLink" onClick={() => setPage(p)}>
              {p === "pcd" ? "PCD Franchise" : p.replace(/^\w/, c => c.toUpperCase())}
            </p>
          ))}
        </div>
        <div className="footNewsletter">
          <h4>Stay Updated</h4>
          <p>Get updates on new products and franchise openings.</p>
          <form className="newsletterForm" onSubmit={e => e.preventDefault()}>
            <input type="email" placeholder="Your email" required />
            <button className="primary">Join</button>
          </form>
        </div>
      </footer>
    </>
  );
}

function Home({setPage}) {
  return (
    <main>
      <section className="hero">
        <ParticleField count={16} />
        <FloatingCapsules count={5} />
        <div className="heroText">
          <span className="eyebrow">PHARMACEUTICAL PARTNER</span>
          <h1>Building trusted healthcare partnerships.</h1>
          <p>Premium pharmaceutical solutions, franchise opportunities and manufacturing partnerships—presented in a clean, modern platform.</p>
          <div className="actions">
            <Magnetic className="primary" onClick={() => setPage("products")}>Explore Products</Magnetic>
            <Magnetic className="secondary" onClick={() => setPage("contact")}>Send Enquiry</Magnetic>
          </div>
          <a className="brochureLink" href={COMPANY.brochure} target="_blank">↓ Download company brochure (PDF)</a>
        </div>
        <div className="heroCard">
          <DnaHelix size={230} />
          <span>QUALITY</span>
          <strong>Carefully presented.<br/>Easy to manage.</strong>
          <small>Replace demo content with your verified company information.</small>
        </div>
      </section>

      <Reveal as="section" className="stats">
        <div><b>01</b><span>Product catalogue</span></div>
        <div><b>02</b><span>PCD franchise</span></div>
        <div><b>03</b><span>Manufacturing</span></div>
        <div><b>04</b><span>Lead management</span></div>
      </Reveal>

      <section className="section numberStats">
        {NUMBER_STATS.map(s => <Counter key={s.label} to={s.to} suffix={s.suffix} label={s.label} />)}
      </section>

      <section className="section">
        <Reveal><span className="eyebrow">R&D PIPELINE</span></Reveal>
        <Reveal delay={80}><h2>From discovery to approval.</h2></Reveal>
        <ResearchPipeline stages={RESEARCH_STAGES} />
      </section>

      <section className="section">
        <Reveal><span className="eyebrow">WHY THIS PLATFORM</span></Reveal>
        <Reveal delay={80}><h2>Website + business dashboard in one project.</h2></Reveal>
        <div className="grid3">
          <Reveal delay={120}><Card t="Product CMS" d="Add and update products without editing frontend code."/></Reveal>
          <Reveal delay={220}><Card t="Lead CRM" d="Track enquiries from new lead to contacted, follow-up and closed."/></Reveal>
          <Reveal delay={320}><Card t="Simple configuration" d="Phone, WhatsApp, email, logo and address are kept in one config file." /></Reveal>
        </div>
      </section>

      <section className="section trustSection">
        <Reveal><span className="eyebrow">COMPLIANCE & CERTIFICATIONS</span></Reveal>
        <Reveal delay={80}><h2>Standards we build every batch around.</h2></Reveal>
        <BadgeStrip />
      </section>

      <section className="section altBg">
        <Reveal><span className="eyebrow">MANUFACTURING CAPABILITY</span></Reveal>
        <Reveal delay={80}><h2>What we bring to a manufacturing partnership.</h2></Reveal>
        <div className="grid4">
          {CAPABILITIES.map((c, i) => (
            <Reveal delay={120 + i * 80} className="card" key={c.t}><h3>{c.t}</h3><p>{c.d}</p></Reveal>
          ))}
        </div>
      </section>

      <section className="section">
        <Reveal><span className="eyebrow">HOW IT WORKS</span></Reveal>
        <Reveal delay={80}><h2>From first enquiry to onboarded partner.</h2></Reveal>
        <ProcessSteps />
      </section>

      <section className="section altBg">
        <Reveal><span className="eyebrow">WHAT PARTNERS SAY</span></Reveal>
        <Reveal delay={80}><h2>Demo testimonials — replace with verified quotes.</h2></Reveal>
        <Testimonials />
      </section>

      <section className="section">
        <Reveal><span className="eyebrow">FROM THE KNOWLEDGE CENTRE</span></Reveal>
        <Reveal delay={80}><h2>Recent articles.</h2></Reveal>
        <div className="grid3">
          {BLOG_POSTS.slice(0,3).map((b, i) => (
            <Reveal delay={120 + i * 90} className="card blogCard" key={b.title}>
              <span className="eyebrow">{b.category}</span>
              <h3>{b.title}</h3>
              <p>{b.excerpt}</p>
              <button className="linkBtn" onClick={() => setPage("blog")}>Read more →</button>
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal as="section" className="ctaBanner">
        <div>
          <span className="eyebrow" style={{color:"#f5d7da"}}>READY TO PARTNER?</span>
          <h2>Start a PCD franchise or manufacturing enquiry today.</h2>
        </div>
        <div className="actions">
          <button className="primary" onClick={() => setPage("contact")}>Send Enquiry</button>
          <a className="secondary ctaWhatsapp" href={`https://wa.me/${COMPANY.whatsapp}`} target="_blank">Chat on WhatsApp</a>
        </div>
      </Reveal>
    </main>
  );
}
function Card({t,d}){return <article className="card"><div className="icon">✦</div><h3>{t}</h3><p>{d}</p></article>}

function About({setPage}) {
  return (
    <main>
      <section className="pageHero heroFade">
        <span className="eyebrow">ABOUT US</span>
        <h1>A modern pharmaceutical presence.</h1>
        <p>Replace this with the verified company story. Below is a structured layout ready for real mission, milestones and team content.</p>
      </section>

      <section className="section">
        <div className="grid2">
          <Reveal className="wideCard"><h2>Our Mission</h2><p>Replace with your verified mission statement — what drives the company's approach to healthcare and partnerships.</p></Reveal>
          <Reveal delay={100} className="wideCard"><h2>Our Vision</h2><p>Replace with your verified vision statement — where the company aims to be across franchise, manufacturing and product reach.</p></Reveal>
        </div>
      </section>

      <section className="section altBg">
        <Reveal><span className="eyebrow">WHAT WE STAND FOR</span></Reveal>
        <Reveal delay={80}><h2>Our values.</h2></Reveal>
        <div className="grid4">
          {VALUES.map((v,i)=>(
            <Reveal delay={120+i*80} className="card" key={v.t}><h3>{v.t}</h3><p>{v.d}</p></Reveal>
          ))}
        </div>
      </section>

      <section className="section">
        <Reveal><span className="eyebrow">OUR JOURNEY</span></Reveal>
        <Reveal delay={80}><h2>Milestones.</h2></Reveal>
        <Timeline />
      </section>

      <section className="section altBg">
        <Reveal><span className="eyebrow">LEADERSHIP</span></Reveal>
        <Reveal delay={80}><h2>The team behind the platform.</h2></Reveal>
        <TeamGrid />
      </section>

      <Reveal as="section" className="ctaBanner">
        <div><h2>Want to know more before partnering with us?</h2></div>
        <div className="actions"><button className="primary" onClick={()=>setPage("contact")}>Get in touch</button></div>
      </Reveal>
    </main>
  );
}

function PCDFranchise({setPage}) {
  return (
    <main>
      <section className="pageHero heroFade">
        <span className="eyebrow">PCD FRANCHISE</span>
        <h1>Grow with a trusted pharma partner.</h1>
        <p>Replace this with your verified franchise territories, benefits, terms and enquiry process.</p>
        <button className="primary" onClick={()=>setPage("contact")}>Start an enquiry</button>
      </section>

      <section className="section">
        <Reveal><span className="eyebrow">WHY PARTNER WITH US</span></Reveal>
        <Reveal delay={80}><h2>Franchise benefits.</h2></Reveal>
        <div className="grid4">
          <Reveal delay={120} className="card"><h3>Monopoly Rights</h3><p>Add your verified territory-based monopoly terms.</p></Reveal>
          <Reveal delay={200} className="card"><h3>Marketing Support</h3><p>Add details on visual aids, samples and promotional material.</p></Reveal>
          <Reveal delay={280} className="card"><h3>Wide Product Range</h3><p>Add your verified therapeutic segments and formulation count.</p></Reveal>
          <Reveal delay={360} className="card"><h3>Timely Delivery</h3><p>Add your verified logistics and dispatch commitments.</p></Reveal>
        </div>
      </section>

      <section className="section altBg">
        <Reveal><span className="eyebrow">GETTING STARTED</span></Reveal>
        <Reveal delay={80}><h2>Franchise process.</h2></Reveal>
        <ProcessSteps />
      </section>

      <section className="section">
        <Reveal><span className="eyebrow">PARTNER VOICES</span></Reveal>
        <Reveal delay={80}><h2>What franchise partners say.</h2></Reveal>
        <Testimonials />
      </section>

      <section className="section altBg">
        <Reveal><span className="eyebrow">QUESTIONS</span></Reveal>
        <Reveal delay={80}><h2>Franchise FAQs.</h2></Reveal>
        <FAQ />
      </section>

      <Reveal as="section" className="ctaBanner">
        <div><h2>Ready to open a franchise in your territory?</h2></div>
        <div className="actions"><button className="primary" onClick={()=>setPage("contact")}>Start an enquiry</button></div>
      </Reveal>
    </main>
  );
}

function Manufacturing({setPage}) {
  return (
    <main>
      <section className="pageHero heroFade">
        <span className="eyebrow">THIRD-PARTY MANUFACTURING</span>
        <h1>Manufacturing partnerships.</h1>
        <p>Replace this with your verified manufacturing capabilities, dosage forms, facilities and certifications.</p>
        <button className="primary" onClick={()=>setPage("contact")}>Discuss your requirement</button>
      </section>

      <section className="section">
        <Reveal><span className="eyebrow">OUR CAPABILITY</span></Reveal>
        <Reveal delay={80}><h2>What we bring to production.</h2></Reveal>
        <div className="grid4">
          {CAPABILITIES.map((c,i)=>(
            <Reveal delay={120+i*80} className="card" key={c.t}><h3>{c.t}</h3><p>{c.d}</p></Reveal>
          ))}
        </div>
      </section>

      <section className="section altBg">
        <Reveal><span className="eyebrow">COMPLIANCE</span></Reveal>
        <Reveal delay={80}><h2>Certifications held by the facility.</h2></Reveal>
        <BadgeStrip />
      </section>

      <section className="section">
        <Reveal><span className="eyebrow">CLEAN-ROOM WORKFLOW</span></Reveal>
        <Reveal delay={80}><h2>How a batch moves through GMP production.</h2></Reveal>
        <ResearchPipeline stages={GMP_STAGES} />
      </section>

      <section className="section altBg">
        <Reveal><span className="eyebrow">ENGAGEMENT PROCESS</span></Reveal>
        <Reveal delay={80}><h2>From formulation to delivery.</h2></Reveal>
        <ProcessSteps />
      </section>

      <Reveal as="section" className="ctaBanner">
        <div><h2>Have a formulation you want manufactured?</h2></div>
        <div className="actions"><button className="primary" onClick={()=>setPage("contact")}>Discuss your requirement</button></div>
      </Reveal>
    </main>
  );
}

function Quality({setPage}) {
  return (
    <main>
      <section className="pageHero heroFade">
        <span className="eyebrow">QUALITY</span>
        <h1>Quality at every step.</h1>
        <p>Replace this with verified quality systems, certifications and process information.</p>
      </section>

      <section className="section">
        <div className="grid2">
          <Reveal className="wideCard"><h2>Quality Policy</h2><p>Replace with your verified quality policy statement covering testing, documentation and continuous improvement.</p></Reveal>
          <Reveal delay={100} className="wideCard"><h2>Quality Control</h2><p>Replace with your verified in-process and finished-product testing procedures.</p></Reveal>
        </div>
      </section>

      <section className="section altBg">
        <Reveal><span className="eyebrow">CERTIFICATIONS</span></Reveal>
        <Reveal delay={80}><h2>Standards we're certified against.</h2></Reveal>
        <BadgeStrip />
      </section>

      <section className="section">
        <Reveal><span className="eyebrow">QUESTIONS</span></Reveal>
        <Reveal delay={80}><h2>Quality FAQs.</h2></Reveal>
        <FAQ />
      </section>
    </main>
  );
}

function Blog() {
  return (
    <main>
      <section className="pageHero compact heroFade">
        <span className="eyebrow">INSIGHTS</span>
        <h1>Pharma knowledge centre.</h1>
        <p>The backend is ready for a future blog CMS. These are demo articles — add verified posts from the admin panel in a later iteration.</p>
      </section>
      <section className="section">
        <div className="grid2">
          {BLOG_POSTS.map((b,i)=>(
            <Reveal delay={i*90} className="card blogCard" key={b.title}>
              <span className="eyebrow">{b.category} · {b.date}</span>
              <h3>{b.title}</h3>
              <p>{b.excerpt}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}

function Careers({setPage}) {
  return (
    <main>
      <section className="pageHero heroFade">
        <span className="eyebrow">CAREERS</span>
        <h1>Build the future of healthcare.</h1>
        <p>Replace this with verified openings, job descriptions and application workflow.</p>
        <button className="primary" onClick={()=>setPage("contact")}>Contact HR</button>
      </section>

      <section className="section">
        <Reveal><span className="eyebrow">WHY WORK HERE</span></Reveal>
        <Reveal delay={80}><h2>What to expect.</h2></Reveal>
        <div className="grid3">
          {PERKS.map((p,i)=>(
            <Reveal delay={120+i*90} className="card" key={p.t}><h3>{p.t}</h3><p>{p.d}</p></Reveal>
          ))}
        </div>
      </section>

      <section className="section altBg">
        <Reveal><span className="eyebrow">OPEN ROLES</span></Reveal>
        <Reveal delay={80}><h2>Current openings.</h2></Reveal>
        <div className="table">
          {POSITIONS.map((p,i)=>(
            <Reveal as="div" delay={i*70} className="row" key={p.title}>
              <span><b>{p.title}</b><small>{p.type} · {p.location}</small></span>
              <button onClick={()=>setPage("contact")}>Apply</button>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}

function Products({setPage}) {
 const [items,setItems]=useState(demoProducts),[q,setQ]=useState(""),[cat,setCat]=useState("All");
 useEffect(()=>{fetch(API_BASE+"/products").then(r=>r.ok?r.json():[]).then(x=>{if(Array.isArray(x)&&x.length)setItems(x)}).catch(()=>{})},[]);
 const cats=["All",...new Set(items.map(x=>x.category).filter(Boolean))];
 const filtered=items.filter(x=>(cat==="All"||x.category===cat)&&(`${x.name} ${x.composition} ${x.category}`.toLowerCase().includes(q.toLowerCase())));
 return (
   <main>
     <section className="pageHero compact heroFade">
       <span className="eyebrow">CATALOGUE</span>
       <h1>Products</h1>
       <p>Search, filter and enquire about your products.</p>
       <div className="heroRow">
         <ApiStatusBadge />
         <a className="brochureLink" href={COMPANY.brochure} target="_blank">↓ Download full catalogue (PDF)</a>
       </div>
     </section>
     <section className="section">
       <div className="filters">
         <input placeholder="Search products..." value={q} onChange={e=>setQ(e.target.value)}/>
         {cats.map(c=><button className={cat===c?"active":""} onClick={()=>setCat(c)} key={c}>{c}</button>)}
       </div>
       <div className="productGrid">
         {filtered.map((p,i)=>(
           <Reveal as="div" delay={i%6*70} key={p.id}>
             <TiltCard className="product">
               <img src={p.image_url||"/products/product-placeholder.svg"}/>
               <div>
                 <span>{p.category}</span>
                 <h3>{p.name}</h3>
                 <p>{p.composition}</p>
                 <small>{p.dosage_form}</small>
                 <div className="productActions">
                   <a href={`https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent("Hello, I am interested in "+p.name)}`} target="_blank">WhatsApp</a>
                   <button onClick={()=>setPage("contact")}>Enquire</button>
                 </div>
               </div>
             </TiltCard>
           </Reveal>
         ))}
       </div>
     </section>
   </main>
 );
}

function Contact(){const [form,setForm]=useState({name:"",phone:"",email:"",city:"",type:"General",message:""}),[msg,setMsg]=useState("");
 async function submit(e){e.preventDefault();setMsg("Sending...");try{const r=await fetch(API_BASE+"/enquiries",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});const d=await r.json();setMsg(r.ok?(d.message||"Enquiry submitted successfully."):"Unable to submit. Check your details.");}catch{setMsg("Backend not running. Start the server, then try again.");}}
 return (
   <main>
     <section className="pageHero compact heroFade liquidBg">
       <div className="liquidWave"></div>
       <span className="eyebrow">GET IN TOUCH</span>
       <h1>Let's talk.</h1>
       <p>Use the form below. Submissions are saved in the database and can be emailed when SMTP is configured.</p>
     </section>
     <section className="section contactGrid">
       <Reveal>
         <h2>Contact details</h2>
         <p>{COMPANY.address}</p>
         <p>{COMPANY.phone}</p>
         <p>{COMPANY.email}</p>
         <a className="whatsappBig" href={`https://wa.me/${COMPANY.whatsapp}`} target="_blank">Chat on WhatsApp →</a>
       </Reveal>
       <Reveal delay={120} as="form" className="form" onSubmit={submit}>
         {["name","phone","email","city"].map(k=><input required={k!=="email"} key={k} placeholder={k[0].toUpperCase()+k.slice(1)} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/>)}
         <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
           <option>General</option>
           <option>PCD Franchise</option>
           <option>Third-Party Manufacturing</option>
           <option>Product Enquiry</option>
         </select>
         <textarea required placeholder="Message" rows="6" value={form.message} onChange={e=>setForm({...form,message:e.target.value})}/>
         <button className="primary">Submit Enquiry</button>
         {msg && <p className="notice">{msg}</p>}
       </Reveal>
     </section>

     <section className="section altBg">
       <Reveal><span className="eyebrow">BEFORE YOU WRITE IN</span></Reveal>
       <Reveal delay={80}><h2>Common questions.</h2></Reveal>
       <FAQ />
     </section>
   </main>
 );
}

const EMPTY_PRODUCT = {name:"",composition:"",dosage_form:"Tablet",category:"General",image_url:"/products/product-placeholder.svg",description:""};
const ENQUIRY_STATUSES = ["New","Contacted","Follow-up","Converted","Closed"];
const STATUS_COLORS = {New:"#c51f2b",Contacted:"#a15b00",Followup:"#8f1620","Follow-up":"#8f1620",Converted:"#1a7a3c",Closed:"#6b6b6b"};

function Admin(){
 const [token,setToken]=useState(localStorage.getItem("ab_token")||"");
 const [login,setLogin]=useState({email:"",password:""});
 const [loginError,setLoginError]=useState("");
 const [tab,setTab]=useState("dashboard");
 const [data,setData]=useState({products:[],enquiries:[],logs:[]});
 const [loadError,setLoadError]=useState("");
 const [form,setForm]=useState(EMPTY_PRODUCT);
 const [editingId,setEditingId]=useState(null);
 const [uploading,setUploading]=useState(false);
 const [toast,setToast]=useState("");
 const [productQuery,setProductQuery]=useState("");
 const [enquiryQuery,setEnquiryQuery]=useState("");
 const [confirmDeleteId,setConfirmDeleteId]=useState(null);

 const headers={"Content-Type":"application/json","Authorization":"Bearer "+token};

 function flash(msg){setToast(msg);setTimeout(()=>setToast(""),2600)}

 async function load(){
   if(!token)return;
   setLoadError("");
   try{
     const [p,e,l]=await Promise.all([fetch(API_BASE+"/admin/products",{headers}),fetch(API_BASE+"/admin/enquiries",{headers}),fetch(API_BASE+"/admin/audit-logs",{headers})]);
     if(p.status===401){localStorage.removeItem("ab_token");setToken("");return}
     setData({products:await p.json(),enquiries:await e.json(),logs:await l.json()});
   }catch(err){
     setLoadError(`Can't reach the backend at ${API_BASE}. Make sure "npm run server" (or "npm run dev") is running.`);
   }
 }
 useEffect(()=>{load()},[token]);

 async function doLogin(e){
   e.preventDefault();
   setLoginError("");
   try{
     const r=await fetch(API_BASE+"/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(login)});
     const d=await r.json();
     if(r.ok){localStorage.setItem("ab_token",d.token);setToken(d.token)}
     else setLoginError(d.message||"Login failed");
   }catch{setLoginError(`Can't reach the backend at ${API_BASE}. Make sure the server is running.`)}
 }

 async function handleFile(e){
   const file=e.target.files[0];
   if(!file)return;
   setUploading(true);
   try{
     const fd=new FormData();
     fd.append("file",file);
     const r=await fetch(API_BASE+"/admin/upload",{method:"POST",headers:{"Authorization":"Bearer "+token},body:fd});
     const d=await r.json();
     if(r.ok)setForm(f=>({...f,image_url:d.url}));
     else flash(d.message||"Upload failed");
   }catch{flash("Upload failed — check the server is running.")}
   setUploading(false);
 }

 function startEdit(p){setEditingId(p.id);setForm({name:p.name,composition:p.composition||"",dosage_form:p.dosage_form||"Tablet",category:p.category||"General",image_url:p.image_url||"/products/product-placeholder.svg",description:p.description||""});setTab("products");window.scrollTo({top:0,behavior:"smooth"})}
 function cancelEdit(){setEditingId(null);setForm(EMPTY_PRODUCT)}

 async function save(e){
   e.preventDefault();
   if(editingId){
     await fetch(API_BASE+"/admin/products/"+editingId,{method:"PUT",headers,body:JSON.stringify({...form,active:1})});
     flash("Product updated");
   }else{
     await fetch(API_BASE+"/admin/products",{method:"POST",headers,body:JSON.stringify(form)});
     flash("Product added");
   }
   cancelEdit();
   load();
 }
 async function del(id){
   await fetch(API_BASE+"/admin/products/"+id,{method:"DELETE",headers});
   setConfirmDeleteId(null);
   flash("Product removed");
   load();
 }
 async function status(id,status){await fetch(API_BASE+"/admin/enquiries/"+id,{method:"PATCH",headers,body:JSON.stringify({status})});load()}

 if(!token)return(
   <main className="adminLogin">
     <form className="form adminLoginForm" onSubmit={doLogin}>
       <span className="eyebrow">ABENCIVO CONTROL CENTRE</span>
       <h1>Admin Login</h1>
       <p>Use the credentials from your server .env file.</p>
       <input placeholder="Email" type="email" value={login.email} onChange={e=>setLogin({...login,email:e.target.value})}/>
       <input placeholder="Password" type="password" value={login.password} onChange={e=>setLogin({...login,password:e.target.value})}/>
       {loginError&&<p className="notice adminLoginError">{loginError}</p>}
       <button className="primary">Login</button>
     </form>
   </main>
 );

 const filteredProducts=data.products.filter(p=>(p.name+p.category+p.dosage_form).toLowerCase().includes(productQuery.toLowerCase()));
 const filteredEnquiries=data.enquiries.filter(x=>(x.name+x.type+x.city+x.assigned_to).toLowerCase().includes(enquiryQuery.toLowerCase()));
 const statusCounts=ENQUIRY_STATUSES.map(s=>({s,n:data.enquiries.filter(x=>x.status===s).length}));
 const TABS=[["dashboard","Dashboard","◆"],["products","Products","💊"],["enquiries","Enquiries","✉"],["logs","Activity Log","▤"]];

 return(
   <main className="admin">
     <aside>
       <h2>ABENCIVO</h2>
       {TABS.map(([id,label,icon])=>(
         <button className={tab===id?"sel":""} onClick={()=>setTab(id)} key={id}><i>{icon}</i>{label}</button>
       ))}
       <button className="logoutBtn" onClick={()=>{localStorage.removeItem("ab_token");setToken("")}}>Logout</button>
     </aside>

     <section className="adminMain">
       <div className="adminTop">
         <div><span className="eyebrow">CONTROL CENTRE</span><h1>{TABS.find(t=>t[0]===tab)[1]}</h1></div>
         {toast&&<span className="adminToast">{toast}</span>}
       </div>

       {loadError&&<div className="errorBanner">{loadError} <button onClick={load}>Retry</button></div>}

       {tab==="dashboard"&&(
         <>
           <div className="grid3">
             <div className="counterCard"><b>{data.products.length}</b><span>Active products</span></div>
             <div className="counterCard"><b>{data.enquiries.length}</b><span>Total enquiries</span></div>
             <div className="counterCard"><b>{data.logs.length}</b><span>Audit events</span></div>
           </div>
           <h3 className="adminSubhead">Enquiries by status</h3>
           <div className="statusBreakdown">
             {statusCounts.map(({s,n})=>(
               <div className="statusBarRow" key={s}>
                 <span className="statusBarLabel"><i className="statusDot" style={{background:STATUS_COLORS[s]}}></i>{s}</span>
                 <div className="statusBarTrack"><div className="statusBarFill" style={{width:`${data.enquiries.length?Math.max(4,(n/data.enquiries.length)*100):0}%`,background:STATUS_COLORS[s]}}></div></div>
                 <span className="statusBarCount">{n}</span>
               </div>
             ))}
           </div>
         </>
       )}

       {tab==="products"&&(
         <>
           <form className="adminForm productForm" onSubmit={save}>
             {editingId&&<div className="editingBanner">Editing product #{editingId} <button type="button" onClick={cancelEdit}>Cancel</button></div>}
             <div className="productFormGrid">
               <div className="uploadBox">
                 <img src={form.image_url.startsWith("/uploads")?API_BASE.replace("/api","")+form.image_url:form.image_url} alt="" />
                 <label className="uploadLabel">
                   {uploading?"Uploading...":"Change image"}
                   <input type="file" accept="image/*" hidden onChange={handleFile} disabled={uploading}/>
                 </label>
               </div>
               <div className="productFields">
                 <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/>
                 <input placeholder="Composition" value={form.composition} onChange={e=>setForm({...form,composition:e.target.value})}/>
                 <div className="fieldRow">
                   <input placeholder="Dosage form" value={form.dosage_form} onChange={e=>setForm({...form,dosage_form:e.target.value})}/>
                   <input placeholder="Category" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}/>
                 </div>
                 <textarea placeholder="Description" rows="3" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
               </div>
             </div>
             <button className="primary">{editingId?"Save changes":"Add Product"}</button>
           </form>

           <input className="adminSearch" placeholder="Search products..." value={productQuery} onChange={e=>setProductQuery(e.target.value)}/>
           <div className="table">
             {filteredProducts.map(p=>(
               <div className="row productRow" key={p.id}>
                 <img className="rowThumb" src={p.image_url.startsWith("/uploads")?API_BASE.replace("/api","")+p.image_url:p.image_url} alt=""/>
                 <span><b>{p.name}</b><small>{p.category} · {p.dosage_form}</small></span>
                 <div className="rowActions">
                   <button onClick={()=>startEdit(p)}>Edit</button>
                   {confirmDeleteId===p.id
                     ? <span className="confirmInline">Delete? <button className="dangerBtn" onClick={()=>del(p.id)}>Yes</button><button onClick={()=>setConfirmDeleteId(null)}>No</button></span>
                     : <button onClick={()=>setConfirmDeleteId(p.id)}>Delete</button>}
                 </div>
               </div>
             ))}
             {filteredProducts.length===0&&<div className="row emptyRow">No products match your search.</div>}
           </div>
         </>
       )}

       {tab==="enquiries"&&(
         <>
           <input className="adminSearch" placeholder="Search enquiries..." value={enquiryQuery} onChange={e=>setEnquiryQuery(e.target.value)}/>
           <div className="table">
             {filteredEnquiries.map(x=>(
               <div className="row" key={x.id}>
                 <span>
                   <b>{x.name} <em className="typeBadge">{x.type}</em></b>
                   <small>{x.phone} · {x.email} · {x.message}</small>
                   <small className="assignedTo">Assigned to: {x.assigned_to||"Unassigned"} {x.emailed?"· emailed":"· not emailed"}</small>
                 </span>
                 <select className="statusSelect" style={{color:STATUS_COLORS[x.status]||"#4b0d12"}} value={x.status} onChange={e=>status(x.id,e.target.value)}>
                   {ENQUIRY_STATUSES.map(s=><option key={s}>{s}</option>)}
                 </select>
               </div>
             ))}
             {filteredEnquiries.length===0&&<div className="row emptyRow">No enquiries match your search.</div>}
           </div>
         </>
       )}

       {tab==="logs"&&(
         <div className="table">
           {data.logs.map(x=>(
             <div className="row" key={x.id}>
               <span>{x.action} · {x.entity} · #{x.entity_id}</span>
               <small>{x.created_at}</small>
             </div>
           ))}
         </div>
       )}
     </section>
   </main>
 );
}

function App(){const [page,setPage]=useState(location.hash.slice(1)||"home");useEffect(()=>{const f=()=>setPage(location.hash.slice(1)||"home");addEventListener("hashchange",f);return()=>removeEventListener("hashchange",f)},[]);const go=p=>{location.hash=p;setPage(p)};let content=page==="home"?<Home setPage={go}/>:page==="products"?<Products setPage={go}/>:page==="contact"?<Contact/>:page==="admin"?<Admin/>:page==="about"?<About setPage={go}/>:page==="pcd"?<PCDFranchise setPage={go}/>:page==="manufacturing"?<Manufacturing setPage={go}/>:page==="quality"?<Quality setPage={go}/>:page==="blog"?<Blog/>:page==="careers"?<Careers setPage={go}/>:<Home setPage={go}/>;return page==="admin"?content:<Layout setPage={go} page={page}><div key={page} className="pageTransition">{content}</div></Layout>}
createRoot(document.getElementById("root")).render(<App/>);
