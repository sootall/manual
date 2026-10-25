const works=[
  {
    "title": "百合花頭飾",
    "category": "緞帶花",
    "en": "RIBBON FLOWERS",
    "material": "待補充",
    "technique": "待補充",
    "description": "花朵、緞帶與木質形體相互交織，在柔軟與粗獷之間構成層次。",
    "images": [
      "images/V1-1.jpg"
    ],
    "provided": true
  },
  {
    "title": "玫瑰盤",
    "category": "螺鈿",
    "en": "MOTHER-OF-PEARL INLAY",
    "material": "待補充",
    "technique": "待補充",
    "description": "黑色盤面與白色碎片紋樣交錯，沿著器物邊緣展開曲線。",
    "images": [
      "images/V2-01.png",
      "images/V2-02.png",
      "images/V2-03.png",
      "images/V2-04.png",
      "images/V2-05.png"
    ],
    "provided": true
  },
  {
    "title": "櫻花胸針",
    "category": "緞帶花",
    "en": "RIBBON FLOWERS",
    "material": "待補充",
    "technique": "待補充",
    "description": "紅色花朵搭配金色線條與緞帶，呈現聚攏而向外延伸的層次。",
    "images": [
      "images/V3-01.png"
    ],
    "provided": true
  },
  {
    "title": "造型飾品",
    "category": "熱縮片",
    "en": "SHRINK PLASTIC",
    "material": "待補充",
    "technique": "待補充",
    "description": "透明感花瓣、蝶形裝飾與垂墜鏈條組成輕盈的花飾。",
    "images": [
      "images/V4-01.png",
      "images/V4-02.png",
      "images/V4-03.png",
      "images/V4-04.png"
    ],
    "provided": true
  },
  {
    "title": "皮革素描本",
    "category": "手工書",
    "en": "HANDMADE BOOK",
    "material": "待補充",
    "technique": "待補充",
    "description": "淺色織紋封面搭配深淺色飾片與扣帶，保留手作物件的細節。",
    "images": [
      "images/V5-01.png"
    ],
    "provided": true
  },
  {
    "title": "紫色的東西",
    "category": "羊毛氈/濕氈",
    "en": "WOOL FELTING / WET FELTING",
    "material": "待補充",
    "technique": "待補充",
    "description": "紫色柔軟形體搭配簡潔的表情，在枝條之間呈現圓潤輪廓。",
    "images": [
      "images/V6-01.png"
    ],
    "provided": true
  }
];
const grid=document.querySelector('#grid'),dialog=document.querySelector('#detail');let selected=0,photo=0,lastFocus;
const previewSource=src=>src.replace('images/','images/preview/').replace(/\.[^.]+$/,'.webp');
const fullImages=new Map();
function loadFullImage(src,priority='low'){
  if(fullImages.has(src))return fullImages.get(src);
  const promise=new Promise(resolve=>{
    const image=new Image();image.decoding='async';image.fetchPriority=priority;
    image.onload=()=>resolve(image);
    image.onerror=()=>{fullImages.delete(src);resolve(null);};
    image.src=src;
  });
  fullImages.set(src,promise);return promise;
}
async function preloadFullImages(){
  const queue=[...new Set(works.flatMap(w=>w.images))];
  async function worker(){while(queue.length)await loadFullImage(queue.shift());}
  await Promise.all([worker(),worker()]);
}
if(document.readyState==='complete')preloadFullImages();
else window.addEventListener('load',preloadFullImages,{once:true});
function render(){
grid.replaceChildren();works.forEach((w,i)=>{

const section=document.createElement('article');section.className='work-block';section.id='work-'+(i+1);section.setAttribute('aria-labelledby','title-'+i);section.style.setProperty('--work-image','url("'+previewSource(w.images[0])+'")');
section.innerHTML=`<div class="work-visual"><button class="work-photo" aria-label="放大查看${w.title}"><img src="${previewSource(w.images[0])}" alt="${w.title}${w.reference||w.provided?'':'（展示示意）'}" decoding="async"></button><div class="work-gallery"><button class="work-prev" aria-label="${w.title}上一張圖片">←</button><span class="work-page">01 / ${String(w.images.length).padStart(2,'0')}</span><button class="work-next" aria-label="${w.title}下一張圖片">→</button></div></div><div class="work-copy"><p class="eyebrow">${String(i+1).padStart(2,'0')} / ${w.en}</p><span class="work-tag">${w.category}</span><h3 id="title-${i}">${w.title}</h3><div class="work-rule"></div></div>`;
let current=0;const prev=section.querySelector('.work-prev'),next=section.querySelector('.work-next');
const update=()=>{section.querySelector('.work-photo img').src=previewSource(w.images[current]);section.querySelector('.work-page').textContent=String(current+1).padStart(2,'0')+' / '+String(w.images.length).padStart(2,'0');section.querySelector('.work-gallery').hidden=w.images.length===1};
prev.onclick=()=>{current=(current-1+w.images.length)%w.images.length;update()};next.onclick=()=>{current=(current+1)%w.images.length;update()};section.querySelector('.work-photo').onclick=()=>{openWork(i);photo=current;showPhoto()};update();grid.append(section);
});
}
const stage=document.querySelector('#image-stage'),zoomImage=document.querySelector('#zoom-image');
let zoom=1,panX=0,panY=0,drag=null;
function constrain(){const maxX=Math.max(0,(zoomImage.offsetWidth*zoom-stage.clientWidth)/2),maxY=Math.max(0,(zoomImage.offsetHeight*zoom-stage.clientHeight)/2);panX=Math.max(-maxX,Math.min(maxX,panX));panY=Math.max(-maxY,Math.min(maxY,panY));}
function paint(){constrain();zoomImage.style.transform=`translate(${panX}px,${panY}px) scale(${zoom})`;stage.classList.toggle('zoomed',zoom>1);}
function resetZoom(){zoom=1;panX=panY=0;drag=null;stage.classList.remove('dragging');paint();}
function openWork(i){selected=i;photo=0;lastFocus=document.activeElement;dialog.showModal();document.body.style.overflow='hidden';showPhoto();}
let viewerRequest=0;
function showPhoto(){const w=works[selected],src=w.images[photo],request=++viewerRequest;zoomImage.src=previewSource(src);loadFullImage(src,'high').then(image=>{if(image&&dialog.open&&request===viewerRequest)zoomImage.src=src;});zoomImage.alt=`${w.title}，第 ${photo+1} 張`;document.querySelector('#viewer-title').textContent=w.title;document.querySelector('#viewer-count').textContent=(photo+1)+' / '+w.images.length+'　作品圖片';document.querySelector('.viewer-bottom').hidden=w.images.length===1;dialog.classList.toggle('single-image',w.images.length===1);resetZoom();}
zoomImage.addEventListener('load',paint);
stage.addEventListener('wheel',e=>{e.preventDefault();const rect=stage.getBoundingClientRect();const px=e.clientX-rect.left-rect.width/2,py=e.clientY-rect.top-rect.height/2;const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?rect.height:1);const nextZoom=Math.max(1,Math.min(8,zoom*Math.exp(-Math.max(-300,Math.min(300,delta))*.002)));const factor=nextZoom/zoom;panX=px-(px-panX)*factor;panY=py-(py-panY)*factor;zoom=nextZoom;paint();},{passive:false});
stage.addEventListener('pointerdown',e=>{if(zoom<=1||e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,panX,panY};stage.setPointerCapture(e.pointerId);stage.classList.add('dragging');e.preventDefault();});
stage.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;panX=drag.panX+e.clientX-drag.x;panY=drag.panY+e.clientY-drag.y;paint();});
function stopDrag(){drag=null;stage.classList.remove('dragging');}
stage.addEventListener('pointerup',stopDrag);stage.addEventListener('pointercancel',stopDrag);stage.addEventListener('lostpointercapture',stopDrag);
function stepPhoto(direction){const count=works[selected].images.length;if(count<2)return;photo=(photo+direction+count)%count;showPhoto();}document.querySelector('#prev').onclick=()=>stepPhoto(-1);document.querySelector('#next').onclick=()=>stepPhoto(1);
document.querySelector('.close').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{resetZoom();document.body.style.overflow='';lastFocus?.focus()});
dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();document.querySelector('#next').click()}if(e.key==='ArrowLeft'){e.preventDefault();document.querySelector('#prev').click()}});
window.addEventListener('resize',()=>{if(dialog.open)paint()});render();

// Keep a continuous background beneath the cover and first artwork.
const openingMain=document.querySelector('main'),openingHero=document.querySelector('.hero'),openingWork=document.querySelector('.work-block');
function syncOpening(){openingMain.style.setProperty('--opening-height',(openingWork.getBoundingClientRect().bottom-openingMain.getBoundingClientRect().top)+'px');}
new ResizeObserver(syncOpening).observe(openingHero);new ResizeObserver(syncOpening).observe(openingWork);syncOpening();

// Sweep the diagonal reflection with the visitor's scroll position.
const reflectionMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let reflectionFrame=0;
function updateReflection(){
  reflectionFrame=0;
  const bounds=openingHero.getBoundingClientRect();
  const progress=reflectionMotion.matches?0:Math.max(0,Math.min(1,-bounds.top/bounds.height));
  openingHero.style.setProperty('--reflection-position',`${34+progress*66}%`);
  openingHero.style.setProperty('--reflection-strength',String(.2+Math.sin(progress*Math.PI)*.16));
}
function scheduleReflection(){if(!reflectionFrame)reflectionFrame=requestAnimationFrame(updateReflection);}
window.addEventListener('scroll',scheduleReflection,{passive:true});
window.addEventListener('resize',scheduleReflection);
reflectionMotion.addEventListener('change',scheduleReflection);
updateReflection();




