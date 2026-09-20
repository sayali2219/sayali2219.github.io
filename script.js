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


const beforeAfter=document.querySelectorAll('[data-before-after]');
beforeAfter.forEach(component=>{
  const media=component.querySelector('.before-after-media');
  const beforeImage=component.querySelector('.before-image');
  const handle=component.querySelector('.before-after-handle');
  if(!media||!beforeImage||!handle) return;

  let value=50;
  let dragging=false;

  const clamp=n=>Math.max(0,Math.min(100,n));

  const render=()=>{
    value=clamp(value);
    component.style.setProperty('--split',value+'%');
    handle.setAttribute('aria-valuenow',String(Math.round(value)));
  };

  const setFromPointer=e=>{
    const rect=media.getBoundingClientRect();
    if(!rect.width) return;
    value=clamp(((e.clientX-rect.left)/rect.width)*100);
    render();
  };

  const startDrag=e=>{
    dragging=true;
    media.setPointerCapture?.(e.pointerId);
    setFromPointer(e);
    e.preventDefault();
  };

  const moveDrag=e=>{
    if(!dragging) return;
    setFromPointer(e);
  };

  const endDrag=()=>{
    dragging=false;
  };

  media.addEventListener('pointerdown',startDrag);
  media.addEventListener('pointermove',moveDrag);
  media.addEventListener('pointerup',endDrag);
  media.addEventListener('pointercancel',endDrag);
  media.addEventListener('lostpointercapture',endDrag);

  handle.addEventListener('keydown',e=>{
    let next=value;
    if(e.key==='ArrowLeft') next-=2;
    else if(e.key==='ArrowRight') next+=2;
    else if(e.key==='Home') next=0;
    else if(e.key==='End') next=100;
    else return;
    e.preventDefault();
    value=clamp(next);
    render();
  });

  render();
});
