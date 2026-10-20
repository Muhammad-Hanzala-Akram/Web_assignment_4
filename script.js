const editor = document.getElementById('editor');
const stage = document.getElementById('stage');
const present = document.getElementById('present');
const counter = document.getElementById('counter');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const fsBtn = document.getElementById('fsBtn');
const saveBtn = document.getElementById('saveBtn');
const savedFlag = document.getElementById('savedFlag');

let slidesArray = [];
let currentSlideIndex = 0;

function mdToHtml(md){
  const lines = md.split('\n');
  let html = '', inList = false;
  for (let raw of lines){
    const line = raw.trim();
    if (line.startsWith('## ')){
      if (inList){ html += '</ul>'; inList = false; }
      html += `<h2>${inline(line.slice(3))}</h2>`;
    } else if (line.startsWith('# ')){
      if (inList){ html += '</ul>'; inList = false; }
      html += `<h1>${inline(line.slice(2))}</h1>`;
    } else if (line.startsWith('- ')){
      if (!inList){ html += '<ul>'; inList = true; }
      html += `<li>${inline(line.slice(2))}</li>`;
    } else if (line === ''){
      if (inList){ html += '</ul>'; inList = false; }
    } else {
      if (inList){ html += '</ul>'; inList = false; }
      html += `<p>${inline(line)}</p>`;
    }
  }
  if (inList) html += '</ul>';
  return html;
}
function inline(text){
  return text
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

function parseSlides(){
  slidesArray = editor.value.split(/\r?\n-{3}[ \t]*(?:\r?\n|$)/);
  if (currentSlideIndex >= slidesArray.length) currentSlideIndex = slidesArray.length - 1;
  if (currentSlideIndex < 0) currentSlideIndex = 0;
  render();
}
function render(){
  present.innerHTML = mdToHtml(slidesArray[currentSlideIndex] || '');
  counter.textContent = `${currentSlideIndex + 1} / ${slidesArray.length}`;
  prevBtn.disabled = currentSlideIndex === 0;
  nextBtn.disabled = currentSlideIndex === slidesArray.length - 1;
}
function nextSlide(){ if (currentSlideIndex < slidesArray.length - 1){ currentSlideIndex++; render(); } }
function prevSlide(){ if (currentSlideIndex > 0){ currentSlideIndex--; render(); } }

function saveSlides(){
  try{
    localStorage.setItem('slidedown_content', editor.value);
    savedFlag.classList.add('show');
    setTimeout(()=> savedFlag.classList.remove('show'), 1200);
  }catch(e){ console.error('Save failed', e); }
}
function loadSlides(){
  try{
    const stored = localStorage.getItem('slidedown_content');
    if (stored){ editor.value = stored; }
  }catch(e){ console.error('Load failed', e); }
}

function toggleFullscreen(){
  if (!document.fullscreenElement){ stage.requestFullscreen(); }
  else { document.exitFullscreen(); }
}

editor.addEventListener('input', parseSlides);
prevBtn.addEventListener('click', prevSlide);
nextBtn.addEventListener('click', nextSlide);
fsBtn.addEventListener('click', toggleFullscreen);
saveBtn.addEventListener('click', saveSlides);

document.addEventListener('fullscreenchange', ()=>{
  fsBtn.textContent = document.fullscreenElement ? 'Exit Full Screen' : 'Full Screen';
});

window.addEventListener('keydown', (e)=>{
  const typing = document.activeElement === editor && !document.fullscreenElement;
  if (e.key === 'ArrowRight' && !typing){ nextSlide(); }
  else if (e.key === 'ArrowLeft' && !typing){ prevSlide(); }
  else if (e.key === 'F11'){ e.preventDefault(); toggleFullscreen(); }
  else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's'){ e.preventDefault(); saveSlides(); }
});

loadSlides();
parseSlides();