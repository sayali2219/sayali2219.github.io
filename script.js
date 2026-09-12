const menu=document.querySelector('.menu');
const nav=document.querySelector('#navlinks');

if(menu && nav){
  menu.addEventListener('click',()=>{
    const open=nav.classList.toggle('open');
    menu.setAttribute('aria-expanded',String(open));
  });
  nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
    nav.classList.remove('open');
    menu.setAttribute('aria-expanded','false');
  }));
}

const tabs=document.querySelectorAll('.tab[data-tab]');
const panels=document.querySelectorAll('.tab-panel[role="tabpanel"]');

tabs.forEach(tab=>{
  tab.addEventListener('click',()=>{
    const target=tab.dataset.tab;
    tabs.forEach(item=>{
      const active=item===tab;
      item.classList.toggle('is-active',active);
      item.setAttribute('aria-selected',String(active));
    });
    panels.forEach(panel=>{
      const active=panel.id===target;
      panel.classList.toggle('is-active',active);
      panel.hidden=!active;
    });
  });
});