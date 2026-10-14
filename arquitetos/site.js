'use strict';
const root=document.documentElement;
const preference=matchMedia('(prefers-reduced-motion: reduce)');
const motionButton=document.querySelector('.motion-control');
let userReduced=false;
try{userReduced=localStorage.getItem('arko-reduced-motion')==='true';}catch{}
function applyMotion(){const reduced=preference.matches||userReduced;root.classList.toggle('reduced-motion',reduced);root.classList.toggle('motion-ready',!reduced);motionButton.setAttribute('aria-pressed',String(reduced));motionButton.textContent=reduced?'Movimento reduzido':'Reduzir movimento';}
applyMotion();
preference.addEventListener('change',applyMotion);
motionButton.addEventListener('click',()=>{userReduced=!userReduced;try{localStorage.setItem('arko-reduced-motion',String(userReduced));}catch{}applyMotion();});
const reveals=document.querySelectorAll('[data-reveal]');
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}},{threshold:.12});reveals.forEach(el=>observer.observe(el));}else{reveals.forEach(el=>el.classList.add('is-visible'));}
const menu=document.querySelector('.menu-toggle');
const nav=document.querySelector('.nav');
function closeMenu(){menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Abrir menu');nav.classList.remove('is-open');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');nav.classList.toggle('is-open',open);});
nav.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav.classList.contains('is-open')){closeMenu();menu.focus();}});
const detailButtons=[...document.querySelectorAll('[data-detail-button]')];
const detailFigures=[...document.querySelectorAll('[data-detail]')];
const detailStatus=document.querySelector('#detail-status');
function selectDetail(index){detailButtons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));detailFigures.forEach((figure,i)=>{figure.hidden=i!==index;figure.classList.toggle('is-selected',i===index);});detailStatus.textContent=`Detalhe ${index+1} de ${detailFigures.length}: ${detailButtons[index].dataset.label}.`;}
detailButtons.forEach((button,index)=>{button.addEventListener('click',()=>selectDetail(index));button.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=(index+1)%detailButtons.length;if(event.key==='ArrowLeft')next=(index+detailButtons.length-1)%detailButtons.length;if(next!==undefined){event.preventDefault();selectDetail(next);detailButtons[next].focus();}});});
const form=document.querySelector('#partner-form');
form.querySelector('[type=submit]').disabled=false;
const review=document.querySelector('#review');
const message=document.querySelector('#review-message');
const whatsapp=document.querySelector('#review-whatsapp');
const phone='5519981547979';
function updateWhatsApp(){whatsapp.href=`https://wa.me/${phone}?text=${encodeURIComponent(message.value)}`;}
message.addEventListener('input',updateWhatsApp);
form.addEventListener('submit',event=>{event.preventDefault();const data=new FormData(form);const name=String(data.get('name')).trim();const city=String(data.get('city')).trim();const office=String(data.get('office')).trim();const note=String(data.get('note')).trim();const visit=data.get('interest')==='visita';message.value=`Olá, equipe Arko!\n\nSou ${name}, trabalho com arquitetura/interiores em ${city}.${office?`\nEscritório: ${office}`:''}\n\n${visit?'Gostaria de combinar uma visita à fábrica e conversar sobre uma parceria. Podemos alinhar um dia, horário e endereço?':'Gostaria de apresentar um projeto e conversar sobre uma parceria de marcenaria com vocês.'}${note?`\n\n${note}`:''}`;updateWhatsApp();if(typeof review.showModal==='function'){review.showModal();}else{window.open(whatsapp.href,'_blank','noopener,noreferrer');}});
document.querySelector('.close-review').addEventListener('click',()=>review.close());
review.addEventListener('click',event=>{if(event.target===review){const rect=review.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)review.close();}});
const header=document.querySelector('.header');
const mobileContact=document.querySelector('.mobile-contact');
const hero=document.querySelector('.hero');
const contact=document.querySelector('#visita');
let queued=false;let lastVisible=false;
function updateScroll(){queued=false;const max=document.documentElement.scrollHeight-innerHeight;const progress=max>0?scrollY/max:0;const heroBottom=hero.getBoundingClientRect().bottom;const contactTop=contact.getBoundingClientRect().top;const contactBottom=contact.getBoundingClientRect().bottom;const visible=heroBottom<84&&!(contactTop<innerHeight*.75&&contactBottom>84);header.style.setProperty('--progress',progress.toFixed(4));if(visible!==lastVisible){mobileContact.classList.toggle('is-visible',visible);mobileContact.inert=!visible;mobileContact.setAttribute('aria-hidden',String(!visible));lastVisible=visible;}}
function scheduleScroll(){if(!queued){queued=true;requestAnimationFrame(updateScroll);}}
addEventListener('scroll',scheduleScroll,{passive:true});addEventListener('resize',scheduleScroll);updateScroll();

root.classList.add('js-ready');
