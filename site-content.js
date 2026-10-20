/* CMS Content Layer — data is edited in Pages CMS; the design remains in index.html. */
(function(){
  const select=(q,within=document)=>within.querySelector(q);
  const setText=(q,value)=>{const e=select(q); if(e && typeof value==='string') e.textContent=value};
  const setImg=(q,value)=>{const e=select(q); if(e && typeof value==='string' && value.trim()) e.src=asset(value)};
  function asset(value){
    if(!value || typeof value!=='string') return '';
    // CMS may return /assets/a.png or assets/a.png. Relative paths work on project sites & domains.
    if(/^https?:\/\//i.test(value)) return value;
    if(value.startsWith('data:image/')) return value;
    return value.replace(/^\/+/, '').replace(/^\.\//,'');
  }
  function make(tag, className, text){ const e=document.createElement(tag); if(className)e.className=className;if(typeof text==='string')e.textContent=text;return e;}
  function editablePhoto(item, cls){let img=make('img',cls);img.loading='lazy';img.src=asset(item.image);img.alt=(item.title||item.name||'Custom balloon décor')+' by Fuson’s Pop & Scoop Co.';return img;}
  function setupGallery(data){
    const target=select('#work .gallery');
    if(!target || !Array.isArray(data.gallery) || !data.gallery.length)return;
    target.replaceChildren();
    data.gallery.slice(0,12).forEach((item,i)=>{
      if(!item.image) return;
      const fig=make('figure',i===0?'tall':(i===data.gallery.length-1 && data.gallery.length>3?'wide':''));
      const img=editablePhoto(item,'');
      const cap=make('figcaption','',item.title||'');
      cap.appendChild(make('span','',item.subtitle||''));
      fig.append(img,cap);
      fig.tabIndex=0;
      fig.role='button';
      fig.setAttribute('aria-label','View photo: '+(item.title||'balloon décor'));
      const open=()=>{
        let modal=select('#lightbox-modal');if(!modal)return;
        select('#lightbox-image').src=img.src;
        select('#lightbox-image').alt=img.alt;
        select('#lightbox-caption').textContent=item.title||'';
        modal.setAttribute('aria-hidden','false');
        document.body.style.overflow='hidden';
        const btn=modal.querySelector('[data-close]');if(btn)btn.focus();
      };
      fig.addEventListener('click',open);
      fig.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}});
      target.append(fig);
    });
  }
  function setupPackages(data){
    const target=select('#services .service-grid');
    if(!target || !Array.isArray(data.packages))return;
    target.replaceChildren();
    data.packages.slice(0,18).forEach(item=>{
      if(!item.name) return;
      const art=make('article','service-card');
      art.appendChild(editablePhoto(item,'menu-photo'));
      art.appendChild(make('h3','',item.name));
      art.appendChild(make('p','',item.description||''));
      const link=make('a','text-link','Get a Quote ↗');
      link.href='#contact'; link.dataset.package=item.name;
      link.addEventListener('click',()=>{
        const selection=select('#event-service');
        if(selection){
          if(!Array.from(selection.options).some(x=>x.value===item.name)) selection.add(new Option(item.name,item.name));
          selection.value=item.name;
        }
      });
      art.appendChild(link);
      target.append(art);
    });
    const pick=select('#event-service');
    if(pick){
      const current=pick.value;
      Array.from(pick.options).filter(o=>o.hasAttribute('data-cms-package')).forEach(o=>o.remove());
      data.packages.forEach(p=>{
        if(!Array.from(pick.options).some(o=>o.value===p.name)){
          let opt=new Option(p.name,p.name);opt.setAttribute('data-cms-package','1');pick.add(opt, pick.options.length-1);
        }
      });
      if(current && Array.from(pick.options).some(o=>o.value===current))pick.value=current;
    }
  }
  function setFooterInstagram(instagram){
     if(typeof instagram!=='string'||!/^https:\/\//.test(instagram))return;
     document.querySelectorAll('a[href*="instagram.com/"]').forEach(a=>a.href=instagram);
  }
  function updateGarlandPrice(price){
    if(!Number.isFinite(Number(price)) || Number(price)<=0)return;
    const rate=Number(price);
    window.FUSONS_GARLAND_RATE=rate;
    const div=select('.shop-feature .shop-price');
    if(div){div.replaceChildren(document.createTextNode(`$${rate} / foot `),make('small','','before add-ons'));}
    const field=select('#garland-feet');
    if(field){ Array.from(field.options).forEach(option=>{
      if(option.value==='custom')return;
      const feet=Number(option.value);
      if(Number.isFinite(feet)) option.textContent=`${feet} ft · $${feet*rate}`;
    });}
    const val=field?.value;
    const summary=select('#garland-total');
    if(summary&&val&&val!=='custom')summary.textContent='$'+rate*Number(val);
  }
  function apply(data){
    if(!data||typeof data!=='object')return;
    if(data.branding){
      setImg('.brand-logo',data.branding.header_logo);
      setImg('.footer-logo',data.branding.footer_logo);
      const style=document.documentElement.style;
      if(/^#[\da-fA-F]{6}$/.test(data.branding.brown||'')){
        style.setProperty('--ink',data.branding.brown);
        style.setProperty('--rose',data.branding.brown);
        document.querySelectorAll('.navlinks .pill,.shop-content .pill,.gallery-actions .pill,.form-card button[type=submit]').forEach(el=>el.style.backgroundColor=data.branding.brown);
      }
      if(/^#[\da-fA-F]{6}$/.test(data.branding.cream||''))style.setProperty('--bg',data.branding.cream);
    }
    if(data.home){
      setText('#home .hero-copy .eyebrow',data.home.eyebrow);
      let h=select('#home h1');if(h&&typeof data.home.headline==='string'){
        h.replaceChildren(document.createTextNode(data.home.headline+' '),make('em','',data.home.headline_script||''));
      }
      setText('#home .hero-copy p',data.home.description);
      setImg('.hero .image-main',data.home.photo);
    }
    if(data.gallery_title) setText('#work .section-title',data.gallery_title+' ');
    if(data.gallery_script){
      const title=select('#work .section-title');
      if(title) title.replaceChildren(document.createTextNode((data.gallery_title||'A Little Pop of')+' '),make('span','handwritten',data.gallery_script));
    }
    setupGallery(data);
    const menu=select('#services .section-title');
    if(menu) menu.replaceChildren(document.createTextNode((data.menu_title||'Find Your')+' '),make('span','handwritten',data.menu_script||'Perfect Pop'));
    setupPackages(data);
    if(data.shop){
       setImg('#shop .shop-photo',data.shop.photo);
       setText('#shop .shop-feature h3',data.shop.garland_title);
       setText('#shop .shop-feature p',data.shop.garland_description);
       setText('#shop .shop-side h3',data.shop.other_title);
       setText('#shop .shop-side p',data.shop.other_description);
       updateGarlandPrice(data.shop.garland_per_foot);
    }
    if(data.contact){
       const title=select('#contact .section-title');
       if(title)title.replaceChildren(document.createTextNode((data.contact.heading||'')+' '),make('span','handwritten',data.contact.script||''));
       setText('#contact .section-desc',data.contact.description);
    }
    setFooterInstagram(data.social?.instagram);
  }
  // Original HTML stays usable without a server. On published site, CMS JSON replaces defaults.
  fetch('./site-content.json?v='+Date.now(),{cache:'no-store'})
    .then(r=>{if(!r.ok)throw new Error('Content unavailable');return r.json()})
    .then(apply)
    .catch(()=>{});
})();
