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

const decodeHexToText=hex=>{
  const clean=hex.replace(/\s+/g,'');
  let out='';
  for(let i=0;i<clean.length;i+=2){
    out+=String.fromCharCode(parseInt(clean.slice(i,i+2),16));
  }
  return out;
};

const loadExactHallImage=async(image,type)=>{
  const partCounts={before:12,after:11};
  const parts=Array.from({length:partCounts[type]},(_,index)=>
    'assets/hall-'+type+'-exact/part-'+String(index+1).padStart(3,'0')+'.txt'
  );

  try{
    const responses=await Promise.all(
      parts.map(path=>fetch(path,{cache:'no-store'}))
    );
    if(responses.some(response=>!response.ok)){
      throw new Error('Exact hall image chunk request failed');
    }

    const encodedChunks=await Promise.all(responses.map(response=>response.text()));
    const base64=encodedChunks.map(decodeHexToText).join('').trim();

    if(!base64) throw new Error('Exact hall image data is empty');

    image.src='data:image/jpeg;base64,'+base64;
    await image.decode();
  }catch(error){
    // Fallback keeps the slider functional if a chunk ever fails to load.
    const fallback=image.dataset.imageBase64;
    if(fallback){
      const response=await fetch(fallback,{cache:'force-cache'});
      const base64=(await response.text()).trim();
      image.src='data:image/webp;base64,'+base64;
    }
    console.error('Artisan Mate exact transformation image failed to load:',error);
  }
};

beforeAfter.forEach(component=>{
  const media=component.querySelector('.before-after-media');
  const beforeImage=component.querySelector('.before-image');
  const afterImage=component.querySelector('.after-image');
  const handle=component.querySelector('.before-after-handle');
  if(!media||!beforeImage||!afterImage||!handle) return;

  let value=50;
  let dragging=false;

  const clamp=n=>Math.max(0,Math.min(100,n));

  const render=()=>{
    value=clamp(value);
    component.style.setProperty('--split',value+'%');
    handle.style.left=value+'%';
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

  const endDrag=()=>{ dragging=false; };

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
  loadExactHallImage(beforeImage,'before');
  loadExactHallImage(afterImage,'after');
});
