document.addEventListener('DOMContentLoaded',()=>{const toggle=document.querySelector('.menu-toggle'),nav=document.querySelector('#site-nav');if(toggle&&nav){toggle.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');toggle.setAttribute('aria-expanded',String(open));});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('is-open');toggle.setAttribute('aria-expanded','false')}));}
const filters=[...document.querySelectorAll('.filter')],cards=[...document.querySelectorAll('.project-card')];filters.forEach(btn=>btn.addEventListener('click',()=>{filters.forEach(b=>{b.classList.remove('is-active');b.setAttribute('aria-pressed','false')});btn.classList.add('is-active');btn.setAttribute('aria-pressed','true');const filter=btn.dataset.filter;cards.forEach(card=>{const cats=(card.dataset.category||'').split(' ');card.hidden=!(filter==='all'||cats.includes(filter));});}));
document.querySelectorAll('[data-architecture-link]').forEach(a=>a.addEventListener('click',()=>{const target=document.querySelector('#work');if(target){document.querySelectorAll('.filter').forEach(b=>{const active=b.dataset.filter==='architecture';b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active));});cards.forEach(card=>{card.hidden=!(card.dataset.category||'').split(' ').includes('architecture');});}}));
const form=document.querySelector('#project-form'),status=document.querySelector('#form-status');if(form){form.addEventListener('submit',async e=>{e.preventDefault();if(!status)return;const submitButton=form.querySelector('button[type="submit"]');const originalLabel=submitButton?submitButton.textContent:'';if(submitButton){submitButton.disabled=true;submitButton.textContent='Sending enquiry…';}form.setAttribute('aria-busy','true');status.textContent='Sending your enquiry…';try{const res=await fetch(form.action,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}});if(!res.ok)throw new Error('Request failed');status.textContent='Thank you. Your enquiry has been sent. We’ll be in touch soon.';form.reset();if(typeof fbq==='function')fbq('track','Lead');}catch(err){status.textContent='We couldn’t send your enquiry just now. Please email kudvesayali.sk@gmail.com or try again.';}finally{if(submitButton){submitButton.disabled=false;submitButton.textContent=originalLabel;}form.removeAttribute('aria-busy');}});}
const revealables=document.querySelectorAll('.reveal,.project-card,.service-grid article,.steps>div,.arch-feature,.interior-mosaic img,.arch-project');if('IntersectionObserver' in window){const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');io.unobserve(entry.target)}}),{threshold:.08});revealables.forEach(el=>{el.classList.add('reveal');io.observe(el);});}else{revealables.forEach(el=>el.classList.add('is-visible'));}
const leadPopup=document.querySelector('#lead-popup');
if(leadPopup){
  const storageKey='artisanMateLeadPopupLastShown';
  const cooldownMs=7*24*60*60*1000;
  const dialog=leadPopup.querySelector('.lead-popup__dialog');
  const closeButton=leadPopup.querySelector('.lead-popup__close');
  const cta=leadPopup.querySelector('.lead-popup__cta');
  let returnFocus=null;
  const lastShown=()=>{try{return Number(localStorage.getItem(storageKey)||0)}catch(err){return 0}};
  const closePopup=()=>{
    if(!leadPopup.classList.contains('is-open'))return;
    leadPopup.classList.remove('is-open');
    leadPopup.setAttribute('aria-hidden','true');
    document.body.classList.remove('lead-popup-open');
    if(returnFocus&&typeof returnFocus.focus==='function')returnFocus.focus();
  };
  leadPopup.querySelectorAll('[data-popup-close]').forEach(el=>el.addEventListener('click',closePopup));
  document.addEventListener('keydown',event=>{
    if(!leadPopup.classList.contains('is-open'))return;
    if(event.key==='Escape'){event.preventDefault();closePopup();return;}
    if(event.key!=='Tab'||!dialog)return;
    const focusable=[...dialog.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(el=>el.offsetParent!==null);
    if(!focusable.length)return;
    const first=focusable[0],last=focusable[focusable.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  });
  if(cta)cta.addEventListener('click',()=>{if(typeof fbq==='function')fbq('track','Contact',{content_name:'Free consultation popup',method:'WhatsApp'});});
  if(Date.now()-lastShown()>=cooldownMs){
    window.setTimeout(()=>{
      if(document.visibilityState==='hidden')return;
      returnFocus=document.activeElement;
      try{localStorage.setItem(storageKey,String(Date.now()));}catch(err){}
      leadPopup.classList.add('is-open');
      leadPopup.setAttribute('aria-hidden','false');
      document.body.classList.add('lead-popup-open');
      if(closeButton)closeButton.focus();
    },3000);
  }
}
});