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
  const emailLink=document.querySelector('#open-email');
  function setEmailLink(){emailLink.href='mailto:arkomarcenaria@gmail.com?subject='+encodeURIComponent('Pedido de orçamento | Arko Marcenaria')+'&body='+encodeURIComponent(message.value);}
  message.addEventListener('input',setEmailLink);
  document.querySelector('#quote-form').addEventListener('submit',e=>{
    e.preventDefault();
    const form=e.currentTarget; if(!form.reportValidity())return;
    const values=new FormData(form);
    message.value=['Olá, equipe Arko!','',`Meu nome é ${values.get('nome').trim()}. Gostaria de conversar sobre um projeto de marcenaria.`,`Cidade: ${values.get('cidade').trim()}`,`Ambiente: ${values.get('ambiente')}`,values.get('projeto').trim()?`Sobre o projeto: ${values.get('projeto').trim()}`:'','', 'Podemos conversar sobre uma proposta?'].filter((s,i,a)=>s!==''||a[i-1]!=='').join('\n');
    setEmailLink();track('quote_prepared',{environment:values.get('ambiente')});quoteDialog.showModal();
  });
  document.querySelector('#open-privacy').addEventListener('click',()=>document.querySelector('#privacy-dialog').showModal());
  // A view is not a conversion. Google tags stay unconfigured in this local first version.
})();
