import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDXKVUV6DnlkWuozFp57rl6M1K-0iXHIjk",
  authDomain: "terras-rara-v1-pro.firebaseapp.com",
  projectId: "terras-rara-v1-pro",
  storageBucket: "terras-rara-v1-pro.firebasestorage.app",
  messagingSenderId: "737526391829",
  appId: "1:737526391829:web:493ee03146bbf97eaf5a1c",
  measurementId: "G-W2SZ7RWD4G"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

let playerId = localStorage.getItem("terrasRarasPlayerId");
if(!playerId){
  playerId = "player_" + Math.random().toString(36).substring(2, 15);
  localStorage.setItem("terrasRarasPlayerId", playerId);
}

const MATERIALS = {
  ore: { name: "Minério bruto", icon: "◆", price: 18, unit: "un.", color: "ore" },
  concentrate: { name: "Concentrado mineral", icon: "◈", price: 42, unit: "un.", color: "concentrate" },
  mixed: { name: "Composto misto de terras raras", icon: "◇", price: 75, unit: "un.", color: "mixed" },
  oxide: { name: "Óxido de terras raras", icon: "⬡", price: 125, unit: "un.", color: "oxide" },
  metal: { name: "Metal de neodímio", icon: "▰", price: 210, unit: "un.", color: "metal" },
  alloy: { name: "Liga NdFeB", icon: "▣", price: 330, unit: "un.", color: "alloy" },
  magnet: { name: "Ímã permanente NdFeB", icon: "✥", price: 520, unit: "un.", color: "magnet" },
  motor: { name: "Componente para motor elétrico", icon: "⚙", price: 850, unit: "un.", color: "motor" },
  chip: { name: "Chip eletrônico de alta precisão", icon: "❖", price: 1650, unit: "un.", color: "chip" },
  battery: { name: "Bateria de estado sólido", icon: "⚡", price: 2800, unit: "un.", color: "battery" },
  quantum_core: { name: "Núcleo de propulsão magnética", icon: "⚛", price: 4500, unit: "un.", color: "quantum" },
  vovo_artifact: { name: "Módulo Espacial VovôBrDias", icon: "🚀", price: 10000, unit: "un.", color: "artifact" }
};

function matBadge(id){
  const m = MATERIALS[id];
  if(!m) return "";
  return `<span class="mat-badge mat-${m.color}">${m.icon} ${m.name}</span>`;
}

// Total de 20 Missões divididas em 2 Fases de 10 missões cada
const MISSIONS = [
  // ==================== FASE 1: INDUSTRIAL (1 a 10) ====================
  { title: "Extração mineral", desc: "Inicie a operação da jazida e extraia seu primeiro lote de minério.", detail: "A mineração começa com a lavra do corpo mineral e transporte do minério.", goal: "ore", target: 50, reward: 1200, stage: "Fase 1: Lavra" },
  { title: "Britagem e moagem", desc: "Reduza o tamanho das rochas para liberar os minerais de interesse.", detail: "Britadores e moinhos diminuem a granulometria do minério.", goal: "concentrate", target: 20, reward: 1500, stage: "Fase 1: Cominuição" },
  { title: "Beneficiamento mineral", desc: "Concentre os minerais portadores de terras raras.", detail: "Operações físicas como separação magnética elevam o teor dos minerais.", goal: "mixed", target: 12, reward: 1800, stage: "Fase 1: Concentração" },
  { title: "Processamento químico", desc: "Faça o tratamento do concentrado para obter óxidos de terras raras.", detail: "Rotas hidrometalúrgicas envolvem lixiviação e purificação.", goal: "oxide", target: 4, reward: 2200, stage: "Fase 1: Hidrometalurgia" },
  { title: "Separação dos elementos", desc: "Avance no fracionamento dos elementos de terras raras.", detail: "A separação individual exige extração por solventes.", goal: "oxide", target: 10, reward: 2600, stage: "Fase 1: Separação" },
  { title: "Produção de óxidos", desc: "Amplie a produção de óxidos individuais de terras raras.", detail: "Óxidos como neodímio e praseodímio calcinados.", goal: "oxide", target: 20, reward: 3000, stage: "Fase 1: Óxidos" },
  { title: "Refino e obtenção dos metais", desc: "Transforme óxidos selecionados em metais.", detail: "Obtenção de metais por redução metalotérmica.", goal: "metal", target: 10, reward: 3500, stage: "Fase 1: Metalurgia" },
  { title: "Fabricação de ligas metálicas", desc: "Produza uma liga adequada à fabricação de ímãs permanentes.", detail: "Ligas NdFeB utilizam neodímio, ferro e boro.", goal: "alloy", target: 8, reward: 4200, stage: "Fase 1: Ligas" },
  { title: "Produção de ímãs permanentes", desc: "Fabrique ímãs permanentes de neodímio-ferro-boro.", detail: "Compactação, sinterização e tratamentos posteriores.", goal: "magnet", target: 5, reward: 5000, stage: "Fase 1: Ímãs" },
  { title: "Aplicação industrial", desc: "Forneça componentes magnéticos para motores elétricos e conclusão da Fase 1.", detail: "Ímãs de alto desempenho em motores elétricos e geradores.", goal: "motor", target: 3, reward: 10000, stage: "Fase 1: Conclusão & Nível" },

  // ==================== FASE 2: CHIPS & QUANTUM (11 a 20) ====================
  { title: "Microeletrônica avançada", desc: "Inicie a Fase 2 integrando motores e óxidos para fabricar chips de alta precisão.", detail: "Semicondutores essenciais para automação avançada.", goal: "chip", target: 5, reward: 15000, stage: "Fase 2: Nanotecnologia" },
  { title: "Armazenamento de alta densidade", desc: "Fabrique baterias de estado sólido com ligas e óxidos purificados.", detail: "Armazenamento energético de altíssima eficiência.", goal: "battery", target: 4, reward: 20000, stage: "Fase 2: Energia" },
  { title: "Propulsão de alta performance", desc: "Desenvolva o núcleo de propulsão magnética para veículos espaciais.", detail: "Combina motores elétricos e chips avançados.", goal: "quantum_core", target: 3, reward: 28000, stage: "Fase 2: Propulsão" },
  { title: "Projeto Especial Aurora", desc: "Monte o protótipo inicial da espaçonave de exploração.", detail: "Integração de baterias, núcleos quânticos e ligas especiais.", goal: "vovo_artifact", target: 2, reward: 40000, stage: "Fase 2: Exploração" },
  { title: "Nanofabricação em Massa", desc: "Estabeleça a linha massiva de chips eletrônicos de precisão.", detail: "A demanda global por semicondutores exige produção em larga escala.", goal: "chip", target: 15, reward: 60000, stage: "Fase 2: Semicondutores" },
  { title: "Supercomputadores Quânticos", desc: "Construa núcleos quânticos para processamento de dados estelares.", detail: "Tecnologia de ponta alimentada por chips de silício e terras raras.", goal: "quantum_core", target: 8, reward: 90000, stage: "Fase 2: Supercomputação" },
  { title: "Frota Estelar de VovôBrDias", desc: "Monte múltiplos Módulos Espaciais VovôBrDias usando chips e núcleos quânticos.", detail: "A expansão definitiva do império rumo às profundezas do universo.", goal: "vovo_artifact", target: 5, reward: 130000, stage: "Fase 2: Expansão Estelar" },
  { title: "Monopólio Tecnológico", desc: "Domine o mercado intergaláctico de microchips de alta performance.", detail: "O topo absoluto da cadeia tecnológica sob a liderança do Diretor.", goal: "chip", target: 30, reward: 200000, stage: "Fase 2: Império Comercial" },
  { title: "O Legado de VovôBrDias", desc: "Consolide a frota espacial definitiva e eternize o nome do Diretor!", detail: "A fase suprema da indústria de terras raras dedicada ao grande Diretor VovôBrDias.", goal: "vovo_artifact", target: 10, reward: 350000, stage: "Fase 2: O Legado" },
  { title: "O Trono do Cosmos", desc: "A missão final definitiva: coroe o império supremo de VovôBrDias nas estrelas!", detail: "A coroação máxima do Diretor na história da mineração e tecnologia universal.", goal: "vovo_artifact", target: 20, reward: 1000000, stage: "Fase 2: Eternidade" }
];

const PROCESSES = [
  { id: "crush", title: "Britagem e moagem", icon: "⚒", desc: "Reduz o tamanho do minério para liberar os minerais.", input: "ore", qty: 10, output: "concentrate", out: 5, cost: 120, unlock: 0, mission: 1, learn: "Na prática, a cominuição prepara o minério para as etapas de concentração." },
  { id: "benefit", title: "Beneficiamento", icon: "◈", desc: "Concentra os minerais de interesse por métodos físicos.", input: "concentrate", qty: 5, output: "mixed", out: 3, cost: 180, unlock: 1, mission: 2, learn: "A recuperação e o teor do concentrado dependem da mineralogia e da rota escolhida." },
  { id: "chem", title: "Processamento químico", icon: "⚗", desc: "Trata o concentrado e prepara a solução para purificação.", input: "mixed", qty: 4, output: "oxide", out: 2, cost: 260, unlock: 2, mission: 3, learn: "A lixiviação transfere os elementos de interesse para uma solução." },
  { id: "separate", title: "Separação e purificação", icon: "⇄", desc: "Separa e purifica os elementos de terras raras.", input: "oxide", qty: 3, output: "oxide", out: 5, cost: 380, unlock: 4, mission: 4, learn: "A separação individual é complexa devido à similaridade química." },
  { id: "metal", title: "Redução e refino", icon: "♨", desc: "Obtém metal a partir do óxido selecionado.", input: "oxide", qty: 3, output: "metal", out: 2, cost: 520, unlock: 5, mission: 6, learn: "Processo metalúrgico de redução para obtenção de metal puro." },
  { id: "alloy", title: "Produção de ligas", icon: "▣", desc: "Combina metais e elementos de liga para formar NdFeB.", input: "metal", qty: 3, output: "alloy", out: 2, cost: 700, unlock: 6, mission: 7, learn: "A liga NdFeB combina neodímio, ferro e boro." },
  { id: "magnet", title: "Fabricação de ímãs", icon: "✥", desc: "Processa a liga para produzir ímãs permanentes.", input: "alloy", qty: 2, output: "magnet", out: 1, cost: 900, unlock: 7, mission: 8, learn: "Envolve alinhamento de pó, compactação e sinterização." },
  { id: "motor", title: "Componente industrial", icon: "⚙", desc: "Integra os ímãs em componentes para motores elétricos.", input: "magnet", qty: 2, output: "motor", out: 1, cost: 1200, unlock: 8, mission: 9, learn: "Motores de alta densidade de potência." },
  { id: "chip", title: "Fabricação de chip eletrônico", icon: "❖", desc: "Integra elementos de terras raras em microcomponentes (Liberado na Fase 2).", input: "motor", qty: 1, extraInput: "oxide", extraQty: 2, output: "chip", out: 1, cost: 1800, unlock: 10, mission: 11, learn: "Essencial em semicondutores e telas avançadas." },
  { id: "battery", title: "Bateria de estado sólido", icon: "⚡", desc: "Fabrica baterias de alta densidade energética para veículos avançados.", input: "alloy", qty: 2, extraInput: "oxide", extraQty: 2, output: "battery", out: 1, cost: 2500, unlock: 11, mission: 12, learn: "Baterias avançadas usando compostos de terras raras." },
  { id: "quantum_core", title: "Núcleo magnético quântico", icon: "⚛", desc: "Cria o propulsor magnético para espaçonaves.", input: "motor", qty: 2, extraInput: "chip", extraQty: 1, output: "quantum_core", out: 1, cost: 4000, unlock: 12, mission: 13, learn: "Tecnologia de propulsão avançada." },
  { id: "vovo_artifact", title: "Módulo Espacial VovôBrDias", icon: "🚀", desc: "Montagem do artefato supremo em homenagem ao Diretor VovôBrDias!", input: "quantum_core", qty: 1, extraInput: "battery", extraQty: 2, output: "vovo_artifact", out: 1, cost: 8000, unlock: 13, mission: 14, isFinalProject: true, learn: "O ápice da tecnologia industrial e espacial da Mineradora Aurora, eternizando o Diretor VovôBrDias!" }
];

const UPGRADES = [
  { id: "crusher", name: "Britador de mandíbulas", icon: "⚒", desc: "Melhora a capacidade de britagem e reduz custo operacional.", cost: 1800, eff: 5 },
  { id: "mill", name: "Moinho industrial", icon: "⚙", desc: "Aumenta a eficiência de moagem.", cost: 2600, eff: 8 },
  { id: "separator", name: "Unidade de separação", icon: "⇄", desc: "Aprimora a capacidade de purificação.", cost: 4200, eff: 12 },
  { id: "lab", name: "Laboratório de controle", icon: "⚗", desc: "Melhora o controle de qualidade e rendimento.", cost: 5500, eff: 10 },
  { id: "automation", name: "Automação industrial", icon: "▦", desc: "Otimiza operações e reduz custos.", cost: 8000, eff: 18 },
  { id: "plant", name: "Expansão da planta", icon: "▤", desc: "Amplia a capacidade global de produção.", cost: 12000, eff: 25 },
  { id: "space_hub", name: "Central Espacial VovôBrDias", icon: "🛰", desc: "Tecnologia orbital para suporte à fase espacial.", cost: 25000, eff: 35 }
];

const DEFAULT_STATE = {
  coins: 15000,
  stock: { ore: 300, concentrate: 0, mixed: 0, oxide: 0, metal: 0, alloy: 0, magnet: 0, motor: 0, chip: 0, battery: 0, quantum_core: 0, vovo_artifact: 0 },
  produced: { concentrate: 0, mixed: 0, oxide: 0, metal: 0, alloy: 0, magnet: 0, motor: 0, chip: 0, battery: 0, quantum_core: 0, vovo_artifact: 0 },
  completed: [],
  production: 0,
  upgrades: [],
  company: "Mineradora Aurora (VovôBrDias)"
};

let state = loadState();

function loadState(){
  try{
    const saved = JSON.parse(localStorage.getItem("terrasRarasSaveProV3_5"));
    if(saved){
      return {
        ...structuredClone(DEFAULT_STATE),
        ...saved,
        stock: { ...DEFAULT_STATE.stock, ...(saved.stock || {}) },
        produced: { ...DEFAULT_STATE.produced, ...(saved.produced || {}) },
        completed: Array.isArray(saved.completed) ? saved.completed : [],
        upgrades: Array.isArray(saved.upgrades) ? saved.upgrades : []
      };
    }
  }catch(e){}
  return structuredClone(DEFAULT_STATE);
}

async function saveToCloud(currentState){
  try{
    const docRef = doc(db, "users", playerId);
    await setDoc(docRef, { ...currentState, updatedAt: new Date().toISOString() });
    const statusEl = document.getElementById("cloudSyncStatus");
    if(statusEl) statusEl.textContent = "☁ Nuvem Ativa";
  }catch(e){
    console.error("Erro ao salvar no Firebase:", e);
    const statusEl = document.getElementById("cloudSyncStatus");
    if(statusEl) statusEl.textContent = "⚠ Erro na Nuvem";
  }
}

async function loadFromCloud(){
  try{
    const docRef = doc(db, "users", playerId);
    const snap = await getDoc(docRef);
    if(snap.exists()){
      const cloudData = snap.data();
      state = {
        ...structuredClone(DEFAULT_STATE),
        ...cloudData,
        stock: { ...DEFAULT_STATE.stock, ...(cloudData.stock || {}) },
        produced: { ...DEFAULT_STATE.produced, ...(cloudData.produced || {}) },
        completed: Array.isArray(cloudData.completed) ? cloudData.completed : [],
        upgrades: Array.isArray(cloudData.upgrades) ? cloudData.upgrades : []
      };
      localStorage.setItem("terrasRarasSaveProV3_5", JSON.stringify(state));
      renderAll();
      toast("Progresso sincronizado do Firebase com sucesso!");
    }
  }catch(e){
    console.error("Erro ao carregar do Firebase:", e);
  }
}

function save(){
  try{
    localStorage.setItem("terrasRarasSaveProV3_5", JSON.stringify(state));
    saveToCloud(state);
  }catch(e){}
  renderAll();
}

const fmt = n => Number(n || 0).toLocaleString("pt-BR");
const $ = id => document.getElementById(id);

function totalEfficiencyBonus(){
  return state.upgrades.reduce((acc, id) => acc + (UPGRADES.find(u => u.id === id)?.eff || 0), 0);
}

function effectiveCost(p){
  const bonus = totalEfficiencyBonus();
  const discountRate = Math.min(0.40, bonus * 0.005);
  return Math.max(10, Math.round(p.cost * (1 - discountRate)));
}

let audioEnabled = true;
let lastSpokenText = "Bem-vindo ao Centro de Comando Terras Raras.";

function setAudioStatus(msg){
  const status = $("audioStatus");
  if(status) status.textContent = msg;
}

function speak(text){
  lastSpokenText = String(text || "").replace(/<[^>]*>/g, "");
  if(!audioEnabled || !lastSpokenText || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(lastSpokenText);
  utterance.lang = "pt-BR";
  utterance.rate = 0.95;
  utterance.pitch = 1;
  const voices = window.speechSynthesis.getVoices();
  const portuguese = voices.find(v => /^pt-BR$/i.test(v.lang)) || voices.find(v => /^pt/i.test(v.lang));
  if(portuguese) utterance.voice = portuguese;
  window.speechSynthesis.speak(utterance);
}

function stopSpeech(){
  if("speechSynthesis" in window) window.speechSynthesis.cancel();
}

function speakCurrentMission(){
  const i = activeMissionIndex();
  if(i < 0){
    speak("Parabéns! Todas as vinte missões foram concluídas com sucesso!");
    return;
  }
  const m = MISSIONS[i];
  speak(`Missão ${i+1}: ${m.title}. ${m.desc}`);
}

function activeMissionIndex(){
  for(let i = 0; i < MISSIONS.length; i++){
    if(!state.completed.includes(i)) return i;
  }
  return -1;
}

function missionProgress(i){
  const m = MISSIONS[i];
  return Math.min(100, Math.floor((state.stock[m.goal] || 0) / m.target * 100));
}

function unlockedProcess(p){
  return state.completed.length >= p.unlock;
}

function toast(msg){
  const el = $("toast");
  if(!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), 2800);
  speak(msg);
}

function showModal(title, text, symbol = "✓", eyebrow = "NOTIFICAÇÃO"){
  $("modalTitle").textContent = title;
  $("modalText").innerHTML = text;
  $("modalSymbol").textContent = symbol;
  $("modalEyebrow").textContent = eyebrow;
  $("modalBackdrop").classList.add("show");
}

function closeModal(){
  $("modalBackdrop").classList.remove("show");
}

function changeView(name){
  document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === "view-" + name));
  document.querySelectorAll(".nav-link").forEach(b => b.classList.toggle("active", b.dataset.view === name));
  const labels = {
    dashboard: "Visão geral",
    missions: "Missões",
    production: "Produção",
    market: "Mercado",
    upgrades: "Equipamentos"
  };
  const titleEl = $("pageTitle");
  if(titleEl) titleEl.textContent = labels[name] || "Visão geral";
  
  const sidebar = $("sidebar");
  const backdrop = $("sidebarBackdrop");
  if(sidebar) sidebar.classList.remove("open");
  if(backdrop) backdrop.classList.remove("show");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderStock(){
  const list = $("stockList");
  if(!list) return;
  list.innerHTML = Object.entries(MATERIALS).map(([id, m]) => `
    <div class="stock-row">
      <span class="material-icon mat-icon-${m.color}">${m.icon}</span>
      <div>${matBadge(id)}<small class="stock-sub">Disponível</small></div>
      <strong class="stock-qty">${fmt(state.stock[id])} ${m.unit}</strong>
    </div>
  `).join("");
}

function renderChain(){
  const strip = $("chainStrip");
  if(!strip) return;
  const displayMissions = MISSIONS.slice(0, 10);
  strip.innerHTML = displayMissions.map((m, i) => `
    <div class="chain-step ${state.completed.includes(i) ? "done" : i === activeMissionIndex() ? "" : "locked"}">
      <span class="step-no">FASE 1 · ${String(i + 1).padStart(2, "0")}</span>
      <strong>${m.title}</strong>
      <div style="margin-top:6px">${matBadge(m.goal)}</div>
    </div>
  `).join("");
}

function renderDashboard(){
  const idx = activeMissionIndex();
  if($("statCoins")) $("statCoins").innerHTML = `${fmt(state.coins)} <small>CR</small>`;
  if($("topCoins")) $("topCoins").textContent = fmt(state.coins);
  if($("statOre")) $("statOre").innerHTML = `${fmt(state.stock.ore)} <small>un.</small>`;
  if($("statProduction")) $("statProduction").innerHTML = `${fmt(state.production)} <small>un.</small>`;
  if($("statMissions")) $("statMissions").innerHTML = `${state.completed.length} <small>/ 20</small>`;
  if($("companyLevel")) $("companyLevel").textContent = state.completed.length >= 10 ? 2 : 1;
  if($("missionCount")) $("missionCount").textContent = idx < 0 ? "★" : idx + 1;
  if($("heroIndex")){
    $("heroIndex").innerHTML = `${idx < 0 ? "20" : String(idx + 1).padStart(2, "0")} <span>/ 20</span>`;
  }

  const isPhase2 = state.completed.length >= 10;
  if($("heroKicker")) $("heroKicker").textContent = isPhase2 ? "FASE 2 · NANOFABRICAÇÃO DE CHIPS & QUANTUM" : "FASE 1 · INFRAESTRUTURA INDUSTRIAL (1-10)";
  if($("heroTitle")) $("heroTitle").innerHTML = isPhase2 ? "Era dos<br><em>chips.</em>" : "Maquinaria &<br><em>excelência.</em>";
  if($("heroDesc")) $("heroDesc").textContent = isPhase2 
    ? "A Fase 2 está ativa! Produza chips avançados, núcleos quânticos e domine o império estelar." 
    : "Conclua as 10 primeiras missões industriais para receber a Homenagem de Nível e desbloquear a Fase 2.";

  if(idx < 0){
    if($("nextMissionEyebrow")) $("nextMissionEyebrow").textContent = "IMPÉRIO VOVÔBRDIAS CONSOLIDADO";
    if($("nextMissionTitle")) $("nextMissionTitle").textContent = "O Trono do Cosmos é seu!";
    if($("nextMissionDesc")) $("nextMissionDesc").innerHTML = `Parabéns Diretor VovôBrDias! Todas as 20 missões foram concluídas com glória suprema.`;
    if($("nextMissionBadge")) $("nextMissionBadge").textContent = "CONCLUÍDA";
    if($("missionProgressText")) $("missionProgressText").textContent = "100%";
    if($("missionProgressBar")) $("missionProgressBar").style.width = "100%";
    if($("nextMissionActionBtn")) $("nextMissionActionBtn").style.display = "none";
  }else{
    if($("nextMissionEyebrow")) $("nextMissionEyebrow").textContent = isPhase2 ? "OBJETIVO DA FASE 2" : "PRÓXIMO OBJETIVO (FASE 1)";
    if($("nextMissionTitle")) $("nextMissionTitle").textContent = `Missão ${String(idx + 1).padStart(2, "0")} · ${MISSIONS[idx].title}`;
    if($("nextMissionDesc")) $("nextMissionDesc").innerHTML = `${MISSIONS[idx].desc} Meta: <strong>${MISSIONS[idx].target} un.</strong> de ${matBadge(MISSIONS[idx].goal)}.`;
    if($("nextMissionBadge")) $("nextMissionBadge").textContent = isPhase2 ? "FASE 2 ATIVA" : "FASE 1";
    if($("missionProgressText")) $("missionProgressText").textContent = missionProgress(idx) + "%";
    if($("missionProgressBar")) $("missionProgressBar").style.width = missionProgress(idx) + "%";
    if($("nextMissionActionBtn")) $("nextMissionActionBtn").style.display = "inline-flex";
  }

  const dashOffer = $("finalChipOfferDashboard");
  if(dashOffer){
    dashOffer.innerHTML = (state.completed.length >= MISSIONS.length) ? `
      <div class="final-chip-card">
        <div class="final-chip-head"><span class="final-chip-icon">🚀</span><div><span class="eyebrow" style="color:var(--accent)">O LEGADO SUPREMO</span><h4>Império de VovôBrDias Eternizado!</h4></div></div>
        <p>Você completou todas as 20 missões e dominou o cosmos!</p>
      </div>
    ` : isPhase2 ? `
      <div class="final-chip-card" style="border-color:var(--cyan)">
        <div class="final-chip-head"><span class="final-chip-icon" style="background:rgba(6,182,212,0.2);color:var(--cyan)">❖</span><div><span class="eyebrow" style="color:var(--cyan)">FASE 2 EM ANDAMENTO</span><h4>Foco em Nanofabricação & Chips</h4></div></div>
        <p>Aproveite os processos avançados de chips e núcleos quânticos para acelerar seu império.</p>
      </div>
    ` : "";
  }
  renderStock();
  renderChain();
}

function renderMissions(){
  const pct = Math.round(state.completed.length / 20 * 100);
  if($("missionSummaryCount")) $("missionSummaryCount").textContent = `${state.completed.length}/20`;
  if($("allMissionProgress")) $("allMissionProgress").style.width = pct + "%";
  if($("allMissionPercent")) $("allMissionPercent").textContent = `${pct}% concluído (Fase 1 & Fase 2)`;

  const isPhase2Unlocked = state.completed.length >= 10;
  const mOffer = $("finalChipOfferMissions");
  if(mOffer){
    mOffer.innerHTML = (state.completed.length >= MISSIONS.length) ? `
      <div class="final-chip-card" style="margin-bottom:20px;">
        <div class="final-chip-head"><span class="final-chip-icon">🚀</span><div><span class="eyebrow" style="color:var(--accent)">O LEGADO SUPREMO</span><h4>Todas as 20 missões concluídas!</h4></div></div>
        <p>Você completou a Fase 1 e a Fase 2 com excelência absoluta!</p>
      </div>
    ` : isPhase2Unlocked ? `
      <div class="final-chip-card" style="margin-bottom:20px;border-color:var(--cyan)">
        <div class="final-chip-head"><span class="final-chip-icon" style="background:rgba(6,182,212,0.2);color:var(--cyan)">🏆</span><div><span class="eyebrow" style="color:var(--cyan)">FASE 2 ATIVA · NÍVEL 2 ALCANÇADO</span><h4>Era dos Chips & Nanotecnologia</h4></div></div>
        <p>Parabéns pela homenagem de nível! Agora execute as missões de fabricação em massa de chips e supercomputação quântica.</p>
      </div>
    ` : `
      <div class="final-chip-card" style="margin-bottom:20px;border-color:var(--amber)">
        <div class="final-chip-head"><span class="final-chip-icon" style="background:rgba(245,158,11,0.2);color:var(--amber)">⭐</span><div><span class="eyebrow" style="color:var(--amber)">FASE 1 EM ANDAMENTO</span><h4>Conclua as 10 primeiras missões</h4></div></div>
        <p>Complete a 10ª missão para receber a Homenagem de Nível do Diretor VovôBrDias e desbloquear a Fase 2.</p>
      </div>
    `;
  }

  const mList = $("missionList");
  if(!mList) return;
  mList.innerHTML = MISSIONS.map((m, i) => {
    const done = state.completed.includes(i);
    const unlocked = i === activeMissionIndex() || done;
    const progress = done ? 100 : unlocked ? missionProgress(i) : 0;
    const readyToClaim = unlocked && !done && (state.stock[m.goal] || 0) >= m.target;
    const isPhase2Mission = i >= 10;
    return `
      <article class="mission-card ${done ? "completed" : unlocked ? "unlocked" : "locked"} ${isPhase2Mission ? 'phase2-mission-card' : ''}">
        <div class="mission-number">${done ? "✓" : String(i + 1).padStart(2, "0")}</div>
        <div class="mission-info">
          <h3>${m.title} ${isPhase2Mission ? '<span style="color:var(--cyan);font-size:10px;margin-left:6px">[FASE 2]</span>' : '<span style="color:var(--accent);font-size:10px;margin-left:6px">[FASE 1]</span>'}</h3>
          <p>${m.desc}</p>
          <div class="mission-reward">Meta: <strong>${m.target} un.</strong> de ${matBadge(m.goal)} · Recompensa: ◈ ${fmt(m.reward)} CR · ${m.stage}</div>
          <div class="progress-track" style="margin-top:10px;max-width:280px"><span style="width:${progress}%"></span></div>
        </div>
        <div class="mission-action">
          <small>${done ? "CONCLUÍDA" : readyToClaim ? "PRONTA PARA RESGATE" : unlocked ? `${progress}% concluído` : "BLOQUEADA"}</small>
          ${unlocked && !done ? `<button class="btn btn-primary mission-claim-btn" data-mission="${i}" type="button">Resgatar</button>` : ""}
        </div>
      </article>
    `;
  }).join("");

  document.querySelectorAll(".mission-claim-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      completeMission(Number(btn.dataset.mission));
    });
  });
}

function renderProcesses(){
  const grid = $("processGrid");
  if(!grid) return;
  grid.innerHTML = PROCESSES.map(p => {
    const open = unlockedProcess(p);
    const cost = effectiveCost(p);
    const hasMainInput = (state.stock[p.input] || 0) >= p.qty;
    const hasExtraInput = !p.extraInput || (state.stock[p.extraInput] || 0) >= p.extraQty;
    const enough = hasMainInput && hasExtraInput && state.coins >= cost;
    const lockLabel = p.isFinalProject ? "Conclua missões anteriores" : "Missão anterior necessária";
    return `
      <article class="process-card ${p.isFinalProject ? "final-process-card" : ""}" id="process-card-${p.id}">
        <div class="process-top">
          <span class="process-icon">${p.icon}</span>
          <span class="status-pill">${open ? (p.isFinalProject ? "SUPREMO" : "DISPONÍVEL") : "BLOQUEADO"}</span>
        </div>
        <h3>${p.title}</h3>
        <p>${p.desc}</p>
        <div class="recipe">
          <strong>Entrada:</strong> ${p.qty} ${matBadge(p.input)}${p.extraInput ? ` + ${p.extraQty} ${matBadge(p.extraInput)}` : ""}<br>
          <strong>Saída:</strong> ${p.out} ${matBadge(p.output)}<br>
          <strong>Produzido:</strong> <span class="produced-count">${fmt(state.produced[p.output] || 0)} ${MATERIALS[p.output].unit}</span><br>
          <strong>Custo:</strong> ${fmt(cost)} CR
        </div>
        <button class="btn ${open && enough ? "btn-light" : "btn-outline"} process-run-btn" data-process="${p.id}" type="button" ${open && enough ? "" : "disabled"}>
          ${!open ? lockLabel : !enough ? "Insumos ou CR insuficientes" : (p.isFinalProject ? "🚀 Construir Módulo VovôBrDias" : "▶ Executar processo")}
        </button>
      </article>
    `;
  }).join("");

  document.querySelectorAll(".process-run-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      runProcess(btn.dataset.process);
    });
  });

  const eff = 100 + totalEfficiencyBonus();
  if($("productionTotal")) $("productionTotal").textContent = `${fmt(state.production)} un.`;
  if($("equipmentTotal")) $("equipmentTotal").textContent = 1 + state.upgrades.length;
  if($("efficiencyValue")) $("efficiencyValue").textContent = `${eff}%`;
}

function renderMarket(){
  const marketGrid = $("marketGrid");
  if(!marketGrid) return;
  marketGrid.innerHTML = Object.entries(MATERIALS).map(([id, m]) => {
    const qtyAvailable = state.stock[id] || 0;
    const disabled = qtyAvailable <= 0;
    return `
      <article class="market-card ${id === "chip" || id === "vovo_artifact" ? "chip-market-card" : ""}">
        <span class="material-icon mat-icon-${m.color}">${m.icon}</span>
        <div style="margin-top:10px">${matBadge(id)}</div>
        <p style="margin-top:8px">Estoque: <strong>${fmt(qtyAvailable)} ${m.unit}</strong></p>
        <div class="market-price">${fmt(m.price)} <small>CR / un.</small></div>
        <div class="sell-row">
          <input type="number" min="1" max="${Math.max(1, qtyAvailable)}" value="${qtyAvailable > 0 ? Math.min(5, qtyAvailable) : 0}" id="sell-${id}" ${disabled ? "disabled" : ""}>
          <button class="btn btn-light market-sell-btn" data-mat="${id}" type="button" ${disabled ? "disabled" : ""}>Vender</button>
        </div>
      </article>
    `;
  }).join("");

  document.querySelectorAll(".market-sell-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      sellMaterial(btn.dataset.mat);
    });
  });
}

function renderUpgrades(){
  const upgradeGrid = $("upgradeGrid");
  if(!upgradeGrid) return;
  upgradeGrid.innerHTML = UPGRADES.map(u => {
    const owned = state.upgrades.includes(u.id);
    const canAfford = state.coins >= u.cost;
    return `
      <article class="upgrade-card">
        <span class="upgrade-icon">${u.icon}</span>
        ${owned ? '<span class="owned">ADQUIRIDO</span>' : ""}
        <h3>${u.name}</h3>
        <p>${u.desc}</p>
        <div class="upgrade-cost">${fmt(u.cost)} <small>CRÉDITOS</small></div>
        <div class="stat-foot">Eficiência: +${u.eff}%</div>
        <button class="btn ${owned ? "btn-outline" : "btn-light"} full upgrade-buy-btn" data-upgrade="${u.id}" type="button" style="margin-top:16px" ${owned || !canAfford ? "disabled" : ""}>
          ${owned ? "Adquirido" : !canAfford ? "Créditos insuficientes" : "Investir"}
        </button>
      </article>
    `;
  }).join("");

  document.querySelectorAll(".upgrade-buy-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      buyUpgrade(btn.dataset.upgrade);
    });
  });
}

const STAGE_THEMES = [
  { name: "FASE 1 · LAVRA", svg: `<svg viewBox="0 0 640 280" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1e3a5f"/><stop offset="100%" stop-color="#0b1724"/></linearGradient></defs><rect width="640" height="280" fill="url(#g1)"/><polygon points="120,280 260,100 400,280" fill="#132538" stroke="#22c55e" stroke-width="1.5" opacity="0.8"/><circle cx="260" cy="100" r="8" fill="#22c55e"/><text x="320" y="240" text-anchor="middle" fill="#94a3b8" font-family="Manrope,sans-serif" font-weight="800" font-size="12" letter-spacing="2">MAQUINARIA PESADA · LAVRA DE MINÉRIO</text></svg>` },
  { name: "FASE 1 · COMINUIÇÃO", svg: `<svg viewBox="0 0 640 280" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#172d4c"/><stop offset="100%" stop-color="#070d18"/></linearGradient></defs><rect width="640" height="280" fill="url(#g2)"/><rect x="230" y="90" width="180" height="130" rx="16" fill="#0f1c2e" stroke="#06b6d4" stroke-width="2"/><circle cx="320" cy="155" r="35" fill="none" stroke="#22c55e" stroke-width="3" stroke-dasharray="8 4"/><text x="320" y="245" text-anchor="middle" fill="#06b6d4" font-family="Manrope,sans-serif" font-weight="800" font-size="12" letter-spacing="2">BRITADOR DE MANDÍBULAS INDUSTRIAL</text></svg>` },
  { name: "FASE 1 · HIDROMETALURGIA", svg: `<svg viewBox="0 0 640 280" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1e3a5f"/><stop offset="100%" stop-color="#091321"/></linearGradient></defs><rect width="640" height="280" fill="url(#g3)"/><rect x="250" y="70" width="140" height="160" rx="24" fill="#0f1c2e" stroke="#a855f7" stroke-width="2"/><path d="M270 120 Q320 90 370 120 T420 150" fill="none" stroke="#a855f7" stroke-width="3"/><text x="320" y="250" text-anchor="middle" fill="#a855f7" font-family="Manrope,sans-serif" font-weight="800" font-size="12" letter-spacing="2">REFINARIA QUÍMICA DE ÓXIDOS</text></svg>` },
  { name: "FASE 1 · METALURGIA", svg: `<svg viewBox="0 0 640 280" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g4" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#254b7d"/><stop offset="100%" stop-color="#0b1724"/></linearGradient></defs><rect width="640" height="280" fill="url(#g4)"/><polygon points="240,230 320,80 400,230" fill="#0f1c2e" stroke="#f59e0b" stroke-width="2"/><circle cx="320" cy="160" r="22" fill="#f59e0b" opacity="0.6"/><text x="320" y="260" text-anchor="middle" fill="#f59e0b" font-family="Manrope,sans-serif" font-weight="800" font-size="12" letter-spacing="2">FORNO METALÚRGICO DE REDUÇÃO</text></svg>` },
  { name: "FASE 1 · ALTA TECNOLOGIA", svg: `<svg viewBox="0 0 640 280" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g5" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0f2c42"/><stop offset="100%" stop-color="#040812"/></linearGradient></defs><rect width="640" height="280" fill="url(#g5)"/><circle cx="320" cy="140" r="60" fill="none" stroke="#06b6d4" stroke-width="3"/><circle cx="320" cy="140" r="30" fill="#22c55e" opacity="0.5"/><text x="320" y="240" text-anchor="middle" fill="#22c55e" font-family="Manrope,sans-serif" font-weight="800" font-size="12" letter-spacing="2">LINHA DE ÍMÃS E MOTORES DE ALTA PERFORMANCE</text></svg>` },
  { name: "FASE 2 · NANOFABRICAÇÃO DE CHIPS", svg: `<svg viewBox="0 0 640 280" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g6" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0f1c2e"/><stop offset="100%" stop-color="#040812"/></linearGradient></defs><rect width="640" height="280" fill="url(#g6)"/><rect x="180" y="60" width="280" height="140" rx="16" fill="#0f1c2e" stroke="#06b6d4" stroke-width="2.5"/><line x1="180" y1="130" x2="460" y2="130" stroke="#22c55e" stroke-width="2"/><circle cx="320" cy="130" r="20" fill="#22c55e" filter="drop-shadow(0 0 10px #22c55e)"/><text x="320" y="235" text-anchor="middle" fill="#06b6d4" font-family="Manrope,sans-serif" font-weight="800" font-size="13" letter-spacing="2">FASE 2 · CHIPS QUÂNTICOS & SUPORTE ESTELAR</text></svg>` }
];

function currentStageTheme(){
  const completed = state.completed.length;
  if(completed >= 10) return STAGE_THEMES[5];
  const idx = Math.min(4, Math.floor(completed / 2));
  return STAGE_THEMES[idx];
}

function renderStageTheme(){
  const theme = currentStageTheme();
  const heroScene = $("heroScene");
  if(heroScene){
    heroScene.innerHTML = `${theme.svg}<span class="hero-stage-tag">${theme.name}</span>`;
  }
}

function renderAll(){
  renderStageTheme();
  renderDashboard();
  renderMissions();
  renderProcesses();
  renderMarket();
  renderUpgrades();
}

function runProcess(id){
  const p = PROCESSES.find(x => x.id === id);
  if(!p || !unlockedProcess(p)) return;
  const cost = effectiveCost(p);
  const hasMain = (state.stock[p.input] || 0) >= p.qty;
  const hasExtra = !p.extraInput || (state.stock[p.extraInput] || 0) >= p.extraQty;
  if(!hasMain || !hasExtra || state.coins < cost){
    toast("Recursos ou créditos insuficientes para esta operação.");
    return;
  }
  state.stock[p.input] -= p.qty;
  if(p.extraInput) state.stock[p.extraInput] -= p.extraQty;
  state.stock[p.output] += p.out;
  state.produced[p.output] = (state.produced[p.output] || 0) + p.out;
  state.coins -= cost;
  state.production += p.out;
  save();

  const htmlResult = `<strong>${p.title}:</strong> você produziu <strong>${p.out} un.</strong> de ${matBadge(p.output)}.<br><br>${p.learn}`;
  showModal(p.isFinalProject ? "Módulo VovôBrDias construído!" : "Processamento concluído", htmlResult, p.isFinalProject ? "🚀" : "⚙", p.isFinalProject ? "HOMENAGEM SUPREMA" : "PRODUÇÃO");
}

function completeMission(i){
  if(i !== activeMissionIndex()) return;
  const m = MISSIONS[i];
  if((state.stock[m.goal] || 0) < m.target){
    toast(`Você precisa ter ${m.target} unidades de ${MATERIALS[m.goal].name}.`);
    return;
  }
  state.completed.push(i);
  state.coins += m.reward;
  save();
  const isAllDone = state.completed.length >= MISSIONS.length;
  const justUnlockedPhase2 = state.completed.length === 10;
  
  let titleModal = isAllDone ? "Império Supremo Concluído!" : justUnlockedPhase2 ? "🏆 HOMENAGEM DE NÍVEL · FASE 2 LIBERADA!" : "Missão concluída!";
  let htmlResult = isAllDone
    ? `Parabéns Diretor VovôBrDias! Você concluiu todas as 20 missões, eternizando seu império supremo nas estrelas!`
    : justUnlockedPhase2
    ? `⭐ <strong>Homenagem Especial ao Diretor VovôBrDias!</strong><br><br>Você completou com brilhantismo as <strong>10 primeiras missões</strong> da Fase 1!<br>Sua liderança elevou a mineradora ao <strong>Nível 2</strong>.<br><br>🚀 A <strong>Fase 2: Era da Nanofabricação de Chips & Supercomputadores Quânticos</strong> está oficialmente iniciada! Prepare-se para novos desafios tecnológicos.`
    : `Parabéns! Você concluiu a missão <strong>${m.title}</strong> e recebeu <strong>${fmt(m.reward)} créditos</strong>.`;

  showModal(titleModal, htmlResult, isAllDone ? "🚀" : justUnlockedPhase2 ? "🏆" : "✦", isAllDone ? "LEGADO ETERNO" : justUnlockedPhase2 ? "SUBIDA DE NÍVEL" : "RECOMPENSA");
}

function sellMaterial(id){
  const input = $("sell-" + id);
  if(!input) return;
  const qty = Math.floor(Number(input.value));
  if(!Number.isFinite(qty) || qty <= 0){
    toast("Informe uma quantidade válida.");
    return;
  }
  if(qty > state.stock[id]){
    toast("Você não possui essa quantidade no estoque.");
    return;
  }
  const revenue = qty * MATERIALS[id].price;
  state.stock[id] -= qty;
  state.coins += revenue;
  save();
  toast(`${qty} unidade(s) vendida(s) com sucesso.`);
}

function buyUpgrade(id){
  const u = UPGRADES.find(x => x.id === id);
  if(!u || state.upgrades.includes(id)) return;
  if(state.coins < u.cost){
    toast("Créditos insuficientes para investimento.");
    return;
  }
  state.coins -= u.cost;
  state.upgrades.push(id);
  save();
  showModal("Investimento realizado", `<strong>${u.name}</strong> adquirido com sucesso!`, "⬡", "PESQUISA");
}

function startNewGame(){
  if(!confirm("Deseja iniciar uma nova partida?\n\nTodo o progresso atual desta empresa será reiniciado.")) return;
  closeModal();
  state = structuredClone(DEFAULT_STATE);
  save();
  changeView("dashboard");
  toast("Nova partida iniciada com sucesso!");
}

// Event Bindings
document.querySelectorAll(".nav-link").forEach(b => {
  b.addEventListener("click", () => changeView(b.dataset.view));
});

document.querySelectorAll("[data-goto]").forEach(b => {
  b.addEventListener("click", () => changeView(b.dataset.goto));
});

const brandHome = $("brandHome");
if(brandHome) brandHome.addEventListener("click", e => { e.preventDefault(); changeView("dashboard"); });

const mobileMenu = $("mobileMenu");
const sidebar = $("sidebar");
const sidebarBackdrop = $("sidebarBackdrop");

if(mobileMenu && sidebar && sidebarBackdrop) {
  mobileMenu.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    sidebarBackdrop.classList.toggle("show");
  });
  sidebarBackdrop.addEventListener("click", () => {
    sidebar.classList.remove("open");
    sidebarBackdrop.classList.remove("show");
  });
}

["newGame", "newGameButton", "resetGame"].forEach(id => {
  const btn = $(id);
  if(btn) btn.addEventListener("click", startNewGame);
});

const syncCloudBtn = $("syncCloudBtn");
if(syncCloudBtn){
  syncCloudBtn.addEventListener("click", () => {
    loadFromCloud();
    toast("Sincronizando dados com o Firebase...");
  });
}

const modalClose = $("modalClose");
if(modalClose) modalClose.addEventListener("click", closeModal);
const modalOk = $("modalOk");
if(modalOk) modalOk.addEventListener("click", closeModal);
const modalBackdrop = $("modalBackdrop");
if(modalBackdrop) modalBackdrop.addEventListener("click", e => { if(e.target === modalBackdrop) closeModal(); });

const speakMissionBtn = $("speakMissionBtn");
if(speakMissionBtn) speakMissionBtn.addEventListener("click", speakCurrentMission);

const todayLabel = $("todayLabel");
if(todayLabel) todayLabel.textContent = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date());

// Audio Assistant Toggles
const audioEnable = $("audioEnable");
if(audioEnable) audioEnable.addEventListener("click", () => { audioEnabled = true; speak("Áudio ativado."); toast("Áudio ativado."); });

const audioRepeat = $("audioRepeat");
if(audioRepeat) audioRepeat.addEventListener("click", () => speak(lastSpokenText));

const audioToggle = $("audioToggle");
if(audioToggle) audioToggle.addEventListener("click", () => {
  audioEnabled = !audioEnabled;
  audioToggle.textContent = audioEnabled ? "Áudio ligado" : "Áudio desligado";
  audioToggle.setAttribute("aria-pressed", String(audioEnabled));
  if(!audioEnabled) stopSpeech();
  else speak("Áudio ligado.");
});

// Initial load
loadFromCloud().then(() => {
  renderAll();
});
