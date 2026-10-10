'use strict';
(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#menu');
  function closeMenu() { menuButton.setAttribute('aria-expanded','false'); menuButton.setAttribute('aria-label','Abrir menu'); menu.classList.remove('is-open'); }
  menuButton.addEventListener('click', () => { const isOpen = menuButton.getAttribute('aria-expanded') !== 'true'; menuButton.setAttribute('aria-expanded',String(isOpen)); menuButton.setAttribute('aria-label',isOpen ? 'Fechar menu' : 'Abrir menu'); menu.classList.toggle('is-open',isOpen); });
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
  // Optional campaign attribution stays on this page. No personal information enters events.
  const allowedAttribution = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','gbraid','wbraid'];
  const params = new URLSearchParams(location.search);
  const attribution = Object.fromEntries(allowedAttribution.filter(k=>params.has(k)).map(k=>[k,params.get(k).slice(0,250)]));
  window.dataLayer = window.dataLayer || [];
  const track = (event,details={}) => window.dataLayer.push({event,...details,campaign:attribution});
  document.querySelectorAll('[data-track]').forEach(link=>link.addEventListener('click',()=>track(link.dataset.track,{position:link.dataset.position})));
  // These events are intent signals, never a confirmed lead, meeting or sale.
  const items = [...document.querySelectorAll('.gallery-item')];
  const gallery = document.querySelector('.gallery');
  document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
    const filter=button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    items.forEach(item=>item.hidden=filter!=='todos'&&item.dataset.category!==filter);
    gallery.classList.toggle('is-filtered',filter!=='todos');
    gallery.scrollTo({left:0,behavior:'auto'});
    requestAnimationFrame(updateGalleryNavigation);
    if(!motionDisabled()) items.filter(item=>!item.hidden).forEach((item,i)=>item.querySelector('img').animate([{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0)'}],{duration:650,delay:i*60,easing:'cubic-bezier(.2,.7,.2,1)'}));
    track('portfolio_filter',{category:filter});
  }));
  const photoDialog=document.querySelector('#photo-dialog');
  const expanded=document.querySelector('#expanded-photo');
  const caption=document.querySelector('#expanded-caption');
  let visiblePhotos=[];let current=0;
  function showPhoto(index){document.querySelector('.photo-prev').disabled=visiblePhotos.length<2;document.querySelector('.photo-next').disabled=visiblePhotos.length<2;current=(index+visiblePhotos.length)%visiblePhotos.length;const button=visiblePhotos[current];expanded.src=button.dataset.photo;expanded.alt=button.dataset.caption;caption.textContent=button.dataset.caption;}
  document.querySelectorAll('[data-photo]').forEach(button=>button.addEventListener('click',()=>{visiblePhotos=items.filter(item=>!item.hidden).map(item=>item.querySelector('[data-photo]'));showPhoto(visiblePhotos.indexOf(button));photoDialog.showModal();}));
  document.querySelector('.photo-prev').addEventListener('click',()=>showPhoto(current-1));
  document.querySelector('.photo-next').addEventListener('click',()=>showPhoto(current+1));
  photoDialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();showPhoto(current+1);}if(e.key==='ArrowLeft'){e.preventDefault();showPhoto(current-1);}});
  document.querySelectorAll('dialog').forEach(dialog=>{
    dialog.querySelectorAll('.dialog-close,[data-close]').forEach(b=>b.addEventListener('click',()=>dialog.close()));
    dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  });
  const quoteDialog=document.querySelector('#quote-dialog');
  const message=document.querySelector('#prepared-message');
  const whatsappLink=document.querySelector('#open-whatsapp');
  function setWhatsAppLink(){whatsappLink.href='https://wa.me/5519981547979?text='+encodeURIComponent(message.value);}
  message.addEventListener('input',setWhatsAppLink);
  document.querySelector('#quote-form').addEventListener('submit',e=>{
    e.preventDefault();
    const form=e.currentTarget; if(!form.reportValidity())return;
    const values=new FormData(form);
    message.value=['Olá, equipe Arko!','',`Meu nome é ${values.get('nome').trim()}. Gostaria de conversar sobre um projeto de marcenaria.`,`Cidade: ${values.get('cidade').trim()}`,`Ambiente: ${values.get('ambiente')}`,values.get('projeto').trim()?`Sobre o projeto: ${values.get('projeto').trim()}`:'','', 'Podemos conversar sobre uma proposta?'].filter((s,i,a)=>s!==''||a[i-1]!=='').join('\n');
    setWhatsAppLink();track('quote_prepared',{environment:values.get('ambiente')});quoteDialog.showModal();
  });
  document.querySelector('#open-privacy').addEventListener('click',()=>document.querySelector('#privacy-dialog').showModal());
  // Motion and gallery navigation are native browser features, with no external runtime.
  const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const previousGallery=document.querySelector('.gallery-prev');
  const nextGallery=document.querySelector('.gallery-next');
  const galleryTotal=document.querySelector('.gallery-total');
  const galleryProgress=document.querySelector('.gallery-progress');
  let galleryFrame=0;
  function updateGalleryNavigation(){
    galleryFrame=0;
    const max=Math.max(0,gallery.scrollWidth-gallery.clientWidth);
    previousGallery.disabled=gallery.scrollLeft<3;
    nextGallery.disabled=max<3||gallery.scrollLeft>=max-3;
    galleryTotal.textContent=String(items.filter(item=>!item.hidden).length);
    galleryProgress.style.setProperty('--gallery-progress',max?String(.12+.88*Math.min(1,Math.max(0,gallery.scrollLeft/max))):'1');
  }
  const moveGallery=direction=>gallery.scrollBy({left:direction*gallery.clientWidth*.78,behavior:motionDisabled()?'auto':'smooth'});
  previousGallery.addEventListener('click',()=>moveGallery(-1));
  nextGallery.addEventListener('click',()=>moveGallery(1));
  gallery.addEventListener('scroll',()=>{if(!galleryFrame)galleryFrame=requestAnimationFrame(updateGalleryNavigation);},{passive:true});
  gallery.addEventListener('keydown',e=>{if(e.target!==gallery)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();moveGallery(e.key==='ArrowRight'?1:-1);}});
  let dragState=null;let galleryDragged=false;
  gallery.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;galleryDragged=false;dragState={pointerId:e.pointerId,x:e.clientX,left:gallery.scrollLeft};});
  gallery.addEventListener('pointermove',e=>{if(!dragState||e.pointerId!==dragState.pointerId)return;const distance=e.clientX-dragState.x;if(!galleryDragged&&Math.abs(distance)>7){galleryDragged=true;gallery.classList.add('is-dragging');gallery.setPointerCapture(e.pointerId);}if(galleryDragged){e.preventDefault();gallery.scrollLeft=dragState.left-distance;}});
  const endGalleryDrag=e=>{if(dragState&&e.pointerId===dragState.pointerId){if(gallery.hasPointerCapture(e.pointerId))gallery.releasePointerCapture(e.pointerId);dragState=null;gallery.classList.remove('is-dragging');}};
  gallery.addEventListener('pointerup',endGalleryDrag);gallery.addEventListener('pointercancel',endGalleryDrag);
  gallery.addEventListener('dragstart',e=>e.preventDefault());
  gallery.addEventListener('click',e=>{if(galleryDragged){e.preventDefault();e.stopImmediatePropagation();galleryDragged=false;}},true);
  const environment=document.querySelector('.environments');
  const pauseButton=document.querySelector('.environment-pause');
  pauseButton.addEventListener('click',()=>{const paused=pauseButton.getAttribute('aria-pressed')!=='true';pauseButton.setAttribute('aria-pressed',String(paused));pauseButton.setAttribute('aria-label',paused?'Retomar faixa de ambientes':'Pausar faixa de ambientes');pauseButton.innerHTML=paused?'<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m8 5 11 7-11 7Z"/></svg>':'<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M8 5v14M16 5v14"/></svg>';environment.classList.toggle('is-paused',paused);});
  const root=document.documentElement;
  const hero=document.querySelector('.hero');
  const header=document.querySelector('.header');
  const followPhoto=document.querySelector('.follow-up-photo');
  const processSteps=[...document.querySelectorAll('.steps li')];
  const processList=document.querySelector('.steps');
  const currentNumber=document.querySelector('.process-active-number');
  const mobileContact=document.querySelector('.mobile-contact');
  const contactSection=document.querySelector('#contato');
  mobileContact.inert=true;
  let scrollFrame=0;
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  function updateScroll(){
    scrollFrame=0;
    const viewportHeight=innerHeight;
    const scrollRange=Math.max(1,root.scrollHeight-viewportHeight);
    root.style.setProperty('--page-progress',String(clamp(scrollY/scrollRange,0,1)));
    header.classList.toggle('has-scrolled',scrollY>24);
    const heroRect=hero.getBoundingClientRect();
    const followRect=followPhoto.getBoundingClientRect();
    if(!motionDisabled()&&innerWidth>760){
      root.style.setProperty('--hero-photo-y',-clamp(-heroRect.top*.055,0,28)+'px');
      followPhoto.style.setProperty('--follow-photo-y',clamp((viewportHeight/2-followRect.top-followRect.height/2)*.045,-24,24)+'px');
    }else{root.style.setProperty('--hero-photo-y','0px');followPhoto.style.setProperty('--follow-photo-y','0px');}
    const readPoint=viewportHeight*.52;
    let active=0;
    processSteps.forEach((step,index)=>{if(step.getBoundingClientRect().top<readPoint)active=index;});
    processSteps.forEach((step,index)=>step.classList.toggle('is-current',index===active));
    currentNumber.textContent=String(active+1).padStart(2,'0');
    const stepsRect=processList.getBoundingClientRect();
    processList.style.setProperty('--process-progress',String(clamp((readPoint-stepsRect.top-31)/Math.max(1,stepsRect.height-90),0,1)));
    const showMobileContact=heroRect.bottom<110&&contactSection.getBoundingClientRect().top>viewportHeight-100;
    mobileContact.classList.toggle('is-visible',showMobileContact);
    mobileContact.inert=!showMobileContact;
  }
  function scheduleScroll(){if(!scrollFrame)scrollFrame=requestAnimationFrame(updateScroll);}
  addEventListener('scroll',scheduleScroll,{passive:true});
  addEventListener('resize',()=>{scheduleScroll();updateGalleryNavigation();},{passive:true});
  const motionToggle=document.querySelector('#motion-toggle');
  function motionDisabled(){return reduceMotion.matches||root.classList.contains('motion-reduced');}
  function updateMotionPreference(){
    const disabled=motionDisabled();
    root.classList.toggle('motion-ready',!disabled);
    motionToggle.disabled=reduceMotion.matches;
    motionToggle.setAttribute('aria-pressed',String(disabled));
    motionToggle.textContent=reduceMotion.matches?'Movimento reduzido':disabled?'Ativar movimento':'Reduzir movimento';
    scheduleScroll();
  }
  motionToggle.addEventListener('click',()=>{root.classList.toggle('motion-reduced');updateMotionPreference();});
  reduceMotion.addEventListener('change',updateMotionPreference);
  // Only selected photography and headings enter with a reveal. All content stays visible without JS.
  const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}}),{threshold:.18});
  for(const heading of document.querySelectorAll('.follow-up h2,.process-intro h2,.about h2')){
    const lines=heading.innerHTML.split(/<br\s*\/?\s*>/i);
    heading.innerHTML=lines.map(line=>'<span class="reveal-line"><span>'+line+'</span></span>').join('');
    heading.dataset.reveal='lines';revealObserver.observe(heading);
  }
  revealObserver.observe(followPhoto);
  updateMotionPreference();
  updateGalleryNavigation();updateScroll();
  // A click or a prepared message is an intent signal, not a confirmed lead or sale.
})();
