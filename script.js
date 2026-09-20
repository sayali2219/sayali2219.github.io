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
  const afterImage=component.querySelector('.after-image');
  const handle=component.querySelector('.before-after-handle');
  if(!media||!beforeImage||!afterImage||!handle) return;

  let value=50;
  let dragging=false;

  const enhanceImage=async image=>{
    const source=image.dataset.imageBase64;
    if(!source) return;

    try{
      const response=await fetch(source,{cache:'force-cache'});
      if(!response.ok) throw new Error('Image data request failed');

      const base64=(await response.text()).trim();
      image.src='data:image/webp;base64,'+base64;
      await image.decode();

      /*
       * The current website copies are small source images. Resize them once at
       * roughly 2x display resolution with the browser's high-quality scaler,
       * then apply a restrained unsharp mask. This cannot invent missing detail,
       * but it makes the existing photographic source visibly crisper without
       * changing the slider layout or crop.
       */
      const displayWidth=Math.max(320,Math.round(media.clientWidth));
      const targetWidth=Math.min(1800,Math.max(image.naturalWidth,displayWidth*2));
      const targetHeight=Math.max(1,Math.round(image.naturalHeight*(targetWidth/image.naturalWidth)));

      const canvas=document.createElement('canvas');
      canvas.width=targetWidth;
      canvas.height=targetHeight;

      const ctx=canvas.getContext('2d',{willReadFrequently:true});
      if(!ctx) return;

      ctx.imageSmoothingEnabled=true;
      ctx.imageSmoothingQuality='high';
      ctx.drawImage(image,0,0,targetWidth,targetHeight);

      const frame=ctx.getImageData(0,0,targetWidth,targetHeight);
      const sourcePixels=frame.data;
      const sharpened=new Uint8ClampedArray(sourcePixels);

      const index=(x,y)=>(y*targetWidth+x)*4;

      for(let y=1;y<targetHeight-1;y++){
        for(let x=1;x<targetWidth-1;x++){
          const i=index(x,y);
          const top=index(x,y-1);
          const bottom=index(x,y+1);
          const left=index(x-1,y);
          const right=index(x+1,y);

          for(let channel=0;channel<3;channel++){
            const center=sourcePixels[i+channel];
            const neighbours=
              sourcePixels[top+channel]+
              sourcePixels[bottom+channel]+
              sourcePixels[left+channel]+
              sourcePixels[right+channel];

            // Subtle 4-neighbour unsharp mask; avoids the crunchy halo effect.
            sharpened[i+channel]=Math.max(
              0,
              Math.min(255,Math.round(center*5-neighbours))
            );
          }
        }
      }

      frame.data.set(sharpened);
      ctx.putImageData(frame,0,0);

      const enhanced=canvas.toDataURL('image/webp',0.95);
      image.src=enhanced;
    }catch(error){
      console.error('Artisan Mate transformation image failed to load:',error);
    }
  };

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
  enhanceImage(beforeImage);
  enhanceImage(afterImage);
});
