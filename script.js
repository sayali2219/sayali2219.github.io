const menu=document.querySelector('.menu');
const nav=document.querySelector('#navlinks');
if(menu){menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',open?'true':'false');});}
document.querySelectorAll('#navlinks a').forEach(a=>a.addEventListener('click',()=>{nav?.classList.remove('open');menu?.setAttribute('aria-expanded','false')}));

const tabs=document.querySelectorAll('.tab');
const panels=document.querySelectorAll('.tab-panel');
tabs.forEach(tab=>tab.addEventListener('click',()=>{
  const id=tab.dataset.tab;
  tabs.forEach(t=>{const active=t===tab;t.classList.toggle('is-active',active);t.setAttribute('aria-selected',active?'true':'false');});
  panels.forEach(panel=>{const active=panel.id===id;panel.classList.toggle('is-active',active);panel.hidden=!active;});
}));
