const projects={
 lot62:{title:'Lot 62 — Elsie Street',desc:'Working residential project in Australia. Developed construction drawings, coordinated framing and slab drawings, produced a 3D model for presentation, and developed sections and details for the site.',pages:[5,6,7,8]},
 lot934:{title:'Lot 934 — Highpoint Street',desc:'Working residential project in Australia combining bioclimatic massing studies, natural-light and cross-ventilation considerations, construction sections, slab details and internal documentation.',pages:[9,10,11,12,13,14]},
 hrc:{title:'HRC Building Group',desc:'Construction progress of a single-storey residential project on a sloped, bushland site. The portfolio records construction drawings, framing and slab coordination, and 3D presentation work.',pages:[15]},
 avenue:{title:'Avenue Glory',desc:'Working documentation for a residential project in India, including set-out and centre-line drawings, plans and building sections.',pages:[17,18,19]},
 tembhare:{title:'Tembhare, Karjat — Phase 01',desc:'Master planning project covering 45,486 sq.m. The portfolio presents the site plan, open space and amenity considerations and key plan.',pages:[20]},
 plot9798:{title:'Plot 97–98',desc:'Residential working documentation including plans, sections and electrical layouts.',pages:[22,23,24]},
 tembhare2:{title:'Tembhare, Karjat — Phase 02',desc:'Second-phase master planning project covering 48,643 sq.m.',pages:[21]},
 laprincess:{title:'La Princess',desc:'A multi-use high-rise development featuring a mix of commercial and residential spaces. The ground and lower levels are dedicated to retail and office space with high-visibility storefronts and an entrance lobby.',pages:[25,26]},
 vrindavan:{title:'Vrindavan',desc:'Modern high-rise residential development in Kher Nagar, Bandra East. The portfolio describes podium-style architecture to maximize parking and amenities in a dense urban environment, with 13,159 sq.m. FSI consumed.',pages:[29]}
};
const nav=document.querySelector('.nav-links'),menu=document.querySelector('.menu-toggle');
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',open)});
document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
const filters=document.querySelectorAll('.filter'),cards=document.querySelectorAll('.project');
filters.forEach(btn=>btn.addEventListener('click',()=>{filters.forEach(b=>b.classList.remove('active'));btn.classList.add('active');const f=btn.dataset.filter;cards.forEach(card=>{const tags=card.dataset.tags||'';card.style.display=(f==='all'||tags.includes(f))?'':'none'})}));
const modal=document.querySelector('.modal'),modalTitle=document.querySelector('#modal-title'),modalDesc=document.querySelector('#modal-desc'),gallery=document.querySelector('#modal-gallery');
function openProject(key){const p=projects[key];if(!p)return;modalTitle.textContent=p.title;modalDesc.textContent=p.desc;gallery.innerHTML=p.pages.map(n=>`<img src="assets/portfolio/page-${String(n).padStart(2,'0')}.webp" alt="${p.title} — portfolio page ${n}">`).join('');modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('no-scroll');modal.scrollTop=0}
function closeProject(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('no-scroll')}
document.querySelectorAll('[data-project]').forEach(el=>el.addEventListener('click',()=>openProject(el.dataset.project)));
document.querySelector('.modal-close').addEventListener('click',closeProject);modal.addEventListener('click',e=>{if(e.target===modal)closeProject()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeProject()});
