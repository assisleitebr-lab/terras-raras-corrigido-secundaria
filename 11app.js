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
  ore:{name:"Minério bruto",icon:"◆",price:18,unit:"un.",color:"ore"},
  concentrate:{name:"Concentrado mineral",icon:"◈",price:42,unit:"un.",color:"concentrate"},
  mixed:{name:"Composto misto de terras raras",icon:"◇",price:75,unit:"un.",color:"mixed"},
  oxide:{name:"Óxido de terras raras",icon:"⬡",price:125,unit:"un.",color:"oxide"},
  metal:{name:"Metal de neodímio",icon:"▰",price:210,unit:"un.",color:"metal"},
  alloy:{name:"Liga NdFeB",icon:"▣",price:330,unit:"un.",color:"alloy"},
  magnet:{name:"Ímã permanente NdFeB",icon:"✥",price:520,unit:"un.",color:"magnet"},
  motor:{name:"Componente para motor elétrico",icon:"⚙",price:850,unit:"un.",color:"motor"},
  chip:{name:"Chip eletrônico de alta precisão",icon:"❖",price:1650,unit:"un.",color:"chip"},
  battery:{name:"Bateria de estado sólido",icon:"⚡",price:2800,unit:"un.",color:"battery"},
  quantum_core:{name:"Núcleo de propulsão magnética",icon:"⚛",price:4500,unit:"un.",color:"quantum"},
  vovo_artifact:{name:"Módulo Espacial VovôBrDias",icon:"🚀",price:10000,unit:"un.",color:"artifact"}
};

function matBadge(id){
  const m = MATERIALS[id];
  if(!m) return "";
  return `<span class="mat-badge mat-${m.color}">${m.icon} ${m.name}</span>`;
}

const MISSIONS = [
  {title:"Extração mineral",desc:"Inicie a operação da jazida e extraia seu primeiro lote de minério.",detail:"A mineração começa com a lavra do corpo mineral e transporte do minério.",goal:"ore",target:50,reward:1200,stage:"Lavra"},
  {title:"Britagem e moagem",desc:"Reduza o tamanho das rochas para liberar os minerais de interesse.",detail:"Britadores e moinhos diminuem a granulometria do minério.",goal:"concentrate",target:20,reward:1500,stage:"Cominuição"},
  {title:"Beneficiamento mineral",desc:"Concentre os minerais portadores de terras raras.",detail:"Operações físicas como separação magnética elevam o teor dos minerais.",goal:"mixed",target:12,reward:1800,stage:"Concentração"},
  {title:"Processamento químico",desc:"Faça o tratamento do concentrado para obter óxidos de terras raras.",detail:"Rotas hidrometalúrgicas envolvem lixiviação e purificação.",goal:"oxide",target:4,reward:2200,stage:"Hidrometalurgia"},
  {title:"Separação dos elementos",desc:"Avance no fracionamento dos elementos de terras raras.",detail:"A separação individual exige extração por solventes.",goal:"oxide",target:10,reward:2600,stage:"Separação"},
  {title:"Produção de óxidos",desc:"Amplie a produção de óxidos individuais de terras raras.",detail:"Óxidos como neodímio e praseodímio calcinados.",goal:"oxide",target:20,reward:3000,stage:"Óxidos"},
  {title:"Refino e obtenção dos metais",desc:"Transforme óxidos selecionados em metais.",detail:"Obtenção de metais por redução metalotérmica.",goal:"metal",target:10,reward:3500,stage:"Metalurgia"},
  {title:"Fabricação de ligas metálicas",desc:"Produza uma liga adequada à fabricação de ímãs permanentes.",detail:"Ligas NdFeB utilizam neodímio, ferro e boro.",goal:"alloy",target:8,reward:4200,stage:"Ligas"},
  {title:"Produção de ímãs permanentes",desc:"Fabrique ímãs permanentes de neodímio-ferro-boro.",detail:"Compactação, sinterização e tratamentos posteriores.",goal:"magnet",target:5,reward:5000,stage:"Ímãs"},
  {title:"Aplicação industrial",desc:"Forneça componentes magnéticos para aplicações tecnológicas.",detail:"Ímãs de alto desempenho em motores elétricos e geradores.",goal:"motor",target:3,reward:7000,stage:"Tecnologia"},
  {title:"Microeletrônica avançada",desc:"Integre motores e óxidos para fabricar chips de alta precisão.",detail:"Semicondutores essenciais para automação avançada.",goal:"chip",target:3,reward:9500,stage:"Microeletrônica"},
  {title:"Armazenamento de alta densidade",desc:"Fabrique baterias de estado sólido com ligas e óxidos purificados.",detail:"Armazenamento energético de altíssima eficiência.",goal:"battery",target:2,reward:12000,stage:"Energia"},
  {title:"Propulsão de alta performance",desc:"Desenvolva o núcleo de propulsão magnética para veículos espaciais.",detail:"Combina motores elétricos e chips avançados.",goal:"quantum_core",target:2,reward:16000,stage:"Propulsão"},
  {title:"Projeto Especial Aurora",desc:"Monte o protótipo inicial da espaçonave de exploração.",detail:"Integração de baterias, núcleos quânticos e ligas especiais.",goal:"vovo_artifact",target:1,reward:25000,stage:"Exploração"},
  {title:"O Legado de VovôBrDias",desc:"Conclua a frota espacial definitiva e eternize o nome do Diretor!",detail:"A fase suprema da indústria de terras raras dedicada ao grande Diretor VovôBrDias.",goal:"vovo_artifact",target:3,reward:50000,stage:"O Legado"}
];

const PROCESSES = [
  {id:"crush",title:"Britagem e moagem",icon:"⚒",desc:"Reduz o tamanho do minério para liberar os minerais.",input:"ore",qty:10,output:"concentrate",out:5,cost:120,unlock:0,mission:1,learn:"Na prática, a cominuição prepara o minério para as etapas de concentração."},
  {id:"benefit",title:"Beneficiamento",icon:"◈",desc:"Concentra os minerais de interesse por métodos físicos.",input:"concentrate",qty:5,output:"mixed",out:3,cost:180,unlock:1,mission:2,learn:"A recuperação e o teor do concentrado dependem da mineralogia e da rota escolhida."},
  {id:"chem",title:"Processamento químico",icon:"⚗",desc:"Trata o concentrado e prepara a solução para purificação.",input:"mixed",qty:4,output:"oxide",out:2,cost:260,unlock:2,mission:3,learn:"A lixiviação transfere os elementos de interesse para uma solução."},
  {id:"separate",title:"Separação e purificação",icon:"⇄",desc:"Separa e purifica os elementos de terras raras.",input:"oxide",qty:3,output:"oxide",out:5,cost:380,unlock:4,mission:4,learn:"A separação individual é complexa devido à similaridade química."},
  {id:"metal",title:"Redução e refino",icon:"♨",desc:"Obtém metal a partir do óxido selecionado.",input:"oxide",qty:3,output:"metal",out:2,cost:520,unlock:5,mission:6,learn:"Processo metalúrgico de redução para obtenção de metal puro."},
  {id:"alloy",title:"Produção de ligas",icon:"▣",desc:"Combina metais e elementos de liga para formar NdFeB.",input:"metal",qty:3,output:"alloy",out:2,cost:700,unlock:6,mission:7,learn:"A liga NdFeB combina neodímio, ferro e boro."},
  {id:"magnet",title:"Fabricação de ímãs",icon:"✥",desc:"Processa a liga para produzir ímãs permanentes.",input:"alloy",qty:2,output:"magnet",out:1,cost:900,unlock:7,mission:8,learn:"Envolve alinhamento de pó, compactação e sinterização."},
  {id:"motor",title:"Componente industrial",icon:"⚙",desc:"Integra os ímãs em componentes para motores elétricos.",input:"magnet",qty:2,output:"motor",out:1,cost:1200,unlock:8,mission:9,learn:"Motores de alta densidade de potência."},
  {id:"chip",title:"Fabricação de chip eletrônico",icon:"❖",desc:"Integra elementos de terras raras em microcomponentes.",input:"motor",qty:1,extraInput:"oxide",extraQty:2,output:"chip",out:1,cost:1800,unlock:10,mission:10,learn:"Essencial em semicondutores e telas avançadas."},
  {id:"battery",title:"Bateria de estado sólido",icon:"⚡",desc:"Fabrica baterias de alta densidade energética para veículos avançados.",input:"alloy",qty:2,extraInput:"oxide",extraQty:2,output:"battery",out:1,cost:2500,unlock:11,mission:11,learn:"Baterias avançadas usando compostos de terras raras."},
  {id:"quantum_core",title:"Núcleo magnético quântico",icon:"⚛",desc:"Cria o propulsor magnético para espaçonaves.",input:"motor",qty:2,extraInput:"chip",extraQty:1,output:"quantum_core",out:1,cost:4000,unlock:12,mission:12,learn:"Tecnologia de propulsão avançada."},
  {id:"vovo_artifact",title:"Módulo Espacial VovôBrDias",icon:"🚀",desc:"Montagem do artefato supremo em homenagem ao Diretor VovôBrDias!",input:"quantum_core",qty:1,extraInput:"battery",extraQty:2,output:"vovo_artifact",out:1,cost:8000,unlock:13,mission:13,isFinalProject:true,learn:"O ápice da tecnologia industrial e espacial da Mineradora Aurora, eternizando o Diretor VovôBrDias!"}
];

const UPGRADES = [
  {id:"crusher",name:"Britador de mandíbulas",icon:"⚒",desc:"Melhora a capacidade de britagem e reduz custo operacional.",cost:1800,eff:5},
  {id:"mill",name:"Moinho industrial",icon:"⚙",desc:"Aumenta a eficiência de moagem.",cost:2600,eff:8},
  {id:"separator",name:"Unidade de separação",icon:"⇄",desc:"Aprimora a capacidade de purificação.",cost:4200,eff:12},
  {id:"lab",name:"Laboratório de controle",icon:"⚗",desc:"Melhora o controle de qualidade e rendimento.",cost:5500,eff:10},
  {id:"automation",name:"Automação industrial",icon:"▦",desc:"Otimiza operações e reduz custos.",cost:8000,eff:18},
  {id:"plant",name:"Expansão da planta",icon:"▤",desc:"Amplia a capacidade global de produção.",cost:12000,eff:25},
  {id:"space_hub",name:"Central Espacial VovôBrDias",icon:"🛰",desc:"Tecnologia orbital para suporte à fase espacial.",cost:25000,eff:35}
];

const DEFAULT_STATE = {
  coins:15000,
  stock:{ore:300,concentrate:0,mixed:0,oxide:0,metal:0,alloy:0,magnet:0,motor:0,chip:0,battery:0,quantum_core:0,vovo_artifact:0},
  produced:{concentrate:0,mixed:0,oxide:0,metal:0,alloy:0,magnet:0,motor:0,chip:0,battery:0,quantum_core:0,vovo_artifact:0},
  completed:[],
  production:0,
  upgrades:[],
  company:"Mineradora Aurora (VovôBrDias)"
};

let state = loadState();

function loadState(){
  try{
    const saved = JSON.parse(localStorage.getItem("terrasRarasSaveV2"));
    if(saved){
      return {
        ...structuredClone(DEFAULT_STATE),
        ...saved,
        stock:{...DEFAULT_STATE.stock,...(saved.stock||{})},
        produced:{...DEFAULT_STATE.produced,...(saved.produced||{})},
        completed:Array.isArray(saved.completed)?saved.completed:[],
        upgrades:Array.isArray(saved.upgrades)?saved.upgrades:[]
      };
    }
  }catch(e){}
  return structuredClone(DEFAULT_STATE);
}

async function saveToCloud(currentState){
  try{
    const docRef = doc(db, "users", playerId);
    await setDoc(docRef, { ...currentState, updatedAt: new Date().toISOString() });
    const statusEl = $("cloudSyncStatus");
    if(statusEl) statusEl.textContent = "☁ Salvo na Nuvem";
  }catch(e){
    console.error("Erro ao salvar no Firebase:", e);
    const statusEl = $("cloudSyncStatus");
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
        stock:{...DEFAULT_STATE.stock,...(cloudData.stock||{})},
        produced:{...DEFAULT_STATE.produced,...(cloudData.produced||{})},
        completed:Array.isArray(cloudData.completed)?cloudData.completed:[],
        upgrades:Array.isArray(cloudData.upgrades)?cloudData.upgrades:[]
      };
      localStorage.setItem("terrasRarasSaveV2", JSON.stringify(state));
      renderAll();
      toast("Progresso sincronizado do Firebase com sucesso!");
    }
  }catch(e){
    console.error("Erro ao carregar do Firebase:", e);
  }
}

function save(){
  try{
    localStorage.setItem("terrasRarasSaveV2", JSON.stringify(state));
    saveToCloud(state);
  }catch(e){}
  renderAll();
}

const fmt = n => Number(n||0).toLocaleString("pt-BR");
const $ = id => document.getElementById(id);

function totalEfficiencyBonus(){
  return state.upgrades.reduce((acc,id)=>acc+(UPGRADES.find(u=>u.id===id)?.eff||0),0);
}

function effectiveCost(p){
  const bonus = totalEfficiencyBonus();
  const discountRate = Math.min(0.40, bonus * 0.005);
  return Math.max(10, Math.round(p.cost * (1 - discountRate)));
}

let audioEnabled = true;
let lastSpokenText = "Bem-vindo à Expansão O Legado de VovôBrDias.";

function setAudioStatus(msg){
  const status = $("audioStatus");
  if(status) status.textContent = msg;
}

function speak(text){
  lastSpokenText = String(text||"").replace(/<[^>]*>/g, "");
  if(!audioEnabled || !lastSpokenText || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(lastSpokenText);
  utterance.lang = "pt-BR";
  utterance.rate = 0.94;
  utterance.pitch = 1;
  utterance.volume = 1;
  const voices = window.speechSynthesis.getVoices();
  const portuguese = voices.find(v=>/^pt-BR$/i.test(v.lang)) || voices.find(v=>/^pt/i.test(v.lang));
  if(portuguese) utterance.voice = portuguese;
  window.speechSynthesis.speak(utterance);
}

function stopSpeech(){
  if("speechSynthesis" in window) window.speechSynthesis.cancel();
}

function speakCurrentMission(){
  const i = activeMissionIndex();
  if(i < 0){
    speak("Parabéns! Você concluiu todas as quinze missões da expansão O Legado de VovôBrDias!");
    return;
  }
  const m = MISSIONS[i];
  speak(`Missão ${i+1}: ${m.title}. ${m.desc}`);
}

function speakView(name){
  speak("Seção atualizada.");
}

function activeMissionIndex(){
  for(let i=0; i<MISSIONS.length; i++){
    if(!state.completed.includes(i)) return i;
  }
  return -1;
}

function missionProgress(i){
  const m = MISSIONS[i];
  return Math.min(100, Math.floor((state.stock[m.goal]||0) / m.target * 100));
}

function unlockedProcess(p){
  return state.completed.length >= p.unlock;
}

function toast(msg){
  const el = $("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(()=>el.classList.remove("show"), 2800);
  speak(msg);
}

function showModal(title, text, symbol="✓", eyebrow="OPERAÇÃO CONCLUÍDA"){
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
  document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active", v.id === "view-" + name));
  document.querySelectorAll(".nav-link").forEach(b=>b.classList.toggle("active", b.dataset.view === name));
  const labels = {
    dashboard:"Visão geral",
    missions:"Missões",
    production:"Produção",
    market:"Mercado",
    upgrades:"Equipamentos"
  };
  $("pageTitle").textContent = labels[name] || "Visão geral";
  $("sidebar").classList.remove("open");
  window.scrollTo({top:0, behavior:"smooth"});
}

function renderFinalBanner(){
  const unlocked = state.completed.length >= MISSIONS.length;
  const artifacts = state.produced.vovo_artifact || 0;
  if(!unlocked) return "";
  return `
    <div class="final-chip-card">
      <div class="final-chip-head">
        <span class="final-chip-icon">🚀</span>
        <div>
          <span class="eyebrow" style="color:#b6ed62">O LEGADO SUPREMO ALCANÇADO</span>
          <h4>Homenagem ao Diretor VovôBrDias!</h4>
        </div>
      </div>
      <p>Você completou a expansão espacial e eternizou a marca VovôBrDias nas estrelas! ${artifacts > 0 ? `<strong>Módulos criados: ${fmt(artifacts)} un.</strong>` : ""}</p>
    </div>
  `;
}

function renderStock(){
  const list = $("stockList");
  list.innerHTML = Object.entries(MATERIALS).map(([id,m])=>`
    <div class="stock-row">
      <span class="material-icon mat-icon-${m.color}">${m.icon}</span>
      <div>${matBadge(id)}<small class="stock-sub">Disponível</small></div>
      <strong class="stock-qty">${fmt(state.stock[id])} ${m.unit}</strong>
    </div>
  `).join("");
}

function renderChain(){
  $("chainStrip").innerHTML = MISSIONS.map((m,i)=>`
    <div class="chain-step ${state.completed.includes(i) ? "done" : i === activeMissionIndex() ? "" : "locked"}">
      <span class="step-no">ETAPA ${String(i+1).padStart(2,"0")}</span>
      <strong>${m.title}</strong>
      <div style="margin-top:6px">${matBadge(m.goal)}</div>
    </div>
  `).join("");
}

function renderDashboard(){
  const idx = activeMissionIndex();
  $("statCoins").innerHTML = `${fmt(state.coins)} <small>CR</small>`;
  $("topCoins").textContent = fmt(state.coins);
  $("statOre").innerHTML = `${fmt(state.stock.ore)} <small>un.</small>`;
  $("statProduction").innerHTML = `${fmt(state.production)} <small>un.</small>`;
  $("statMissions").innerHTML = `${state.completed.length} <small>/ 15</small>`;
  $("companyLevel").textContent = 1 + Math.floor(state.completed.length / 2);
  $("missionCount").textContent = idx < 0 ? "★" : idx + 1;
  if($("heroIndex")){
    $("heroIndex").innerHTML = `${idx < 0 ? "15" : String(idx + 1).padStart(2,"0")} <span>/ 15</span>`;
  }

  if(idx < 0){
    $("nextMissionEyebrow").textContent = "FROTA ESPACIAL CONCLUÍDA";
    $("nextMissionTitle").textContent = "O Legado de VovôBrDias está consagrado!";
    $("nextMissionDesc").innerHTML = `Parabéns Diretor! Todas as 15 missões espaciais e industriais foram concluídas com sucesso.`;
    if($("nextMissionBadge")) $("nextMissionBadge").textContent = "CONCLUÍDA";
    $("missionProgressText").textContent = "100%";
    $("missionProgressBar").style.width = "100%";
    if($("nextMissionActionBtn")) $("nextMissionActionBtn").style.display = "none";
  }else{
    $("nextMissionEyebrow").textContent = "PRÓXIMO OBJETIVO";
    $("nextMissionTitle").textContent = `Missão ${String(idx+1).padStart(2,"0")} · ${MISSIONS[idx].title}`;
    $("nextMissionDesc").innerHTML = `${MISSIONS[idx].desc} Meta: <strong>${MISSIONS[idx].target} un.</strong> de ${matBadge(MISSIONS[idx].goal)}.`;
    if($("nextMissionBadge")) $("nextMissionBadge").textContent = "EM ANDAMENTO";
    $("missionProgressText").textContent = missionProgress(idx) + "%";
    $("missionProgressBar").style.width = missionProgress(idx) + "%";
    if($("nextMissionActionBtn")) $("nextMissionActionBtn").style.display = "inline-flex";
  }
  if($("finalChipOfferDashboard")){
    $("finalChipOfferDashboard").innerHTML = renderFinalBanner();
  }
  renderStock();
  renderChain();
}

function renderMissions(){
  const pct = Math.round(state.completed.length / 15 * 100);
  $("missionSummaryCount").textContent = `${state.completed.length}/15`;
  $("allMissionProgress").style.width = pct + "%";
  $("allMissionPercent").textContent = pct + "% da cadeia produtiva e espacial";
  if($("finalChipOfferMissions")){
    $("finalChipOfferMissions").innerHTML = renderFinalBanner();
  }
  $("missionList").innerHTML = MISSIONS.map((m,i)=>{
    const done = state.completed.includes(i);
    const unlocked = i === activeMissionIndex() || done;
    const progress = done ? 100 : unlocked ? missionProgress(i) : 0;
    const readyToClaim = unlocked && !done && (state.stock[m.goal] || 0) >= m.target;
    return `
      <article class="mission-card ${done ? "completed" : unlocked ? "unlocked" : "locked"}">
        <div class="mission-number">${done ? "✓" : String(i+1).padStart(2,"0")}</div>
        <div class="mission-info">
          <h3>${m.title}</h3>
          <p>${m.desc}</p>
          <div class="mission-reward">Meta: <strong>${m.target} un.</strong> de ${matBadge(m.goal)} · Recompensa: ◈ ${fmt(m.reward)} créditos · ${m.stage}</div>
          <div class="progress-track" style="margin-top:9px;max-width:260px"><span style="width:${progress}%"></span></div>
        </div>
        <div class="mission-action">
          <small>${done ? "CONCLUÍDA" : readyToClaim ? "PRONTA PARA RESGATE" : unlocked ? progress + "% concluído" : "BLOQUEADA"}</small>
          ${unlocked && !done ? `<button class="btn btn-primary" type="button" onclick="completeMission(${i})">Resgatar missão</button>` : ""}
        </div>
      </article>
    `;
  }).join("");
}

function renderProcesses(){
  const grid = $("processGrid");
  grid.innerHTML = PROCESSES.map(p=>{
    const open = unlockedProcess(p);
    const cost = effectiveCost(p);
    const hasDiscount = cost < p.cost;
    const hasMainInput = (state.stock[p.input] || 0) >= p.qty;
    const hasExtraInput = !p.extraInput || (state.stock[p.extraInput] || 0) >= p.extraQty;
    const enough = hasMainInput && hasExtraInput && state.coins >= cost;
    const lockLabel = p.isFinalProject ? "Conclua as missões anteriores" : "Missão anterior necessária";
    return `
      <article class="process-card ${p.isFinalProject ? "final-process-card" : ""}" id="process-card-${p.id}">
        <div class="process-top">
          <span class="process-icon">${p.icon}</span>
          <span class="status-pill">${open ? (p.isFinalProject ? "PROJETO SUPREMO" : "DISPONÍVEL") : "BLOQUEADO"}</span>
        </div>
        <h3>${p.title}</h3>
        <p>${p.desc}</p>
        <div class="recipe">
          <strong>Entrada:</strong> ${p.qty} ${matBadge(p.input)}${p.extraInput ? ` + ${p.extraQty} ${matBadge(p.extraInput)}` : ""}<br>
          <strong>Saída:</strong> ${p.out} ${matBadge(p.output)}<br>
          <strong>Produzido:</strong> <span class="produced-count">${fmt(state.produced[p.output]||0)} ${MATERIALS[p.output].unit}</span><br>
          <strong>Custo:</strong> ${fmt(cost)} créditos
        </div>
        <button class="btn ${open && enough ? "btn-primary" : "btn-outline"}" type="button" ${open && enough ? `onclick="runProcess('${p.id}')"` : "disabled"}>
          ${!open ? lockLabel : !enough ? "Insumos ou créditos insuficientes" : (p.isFinalProject ? "🚀 Construir Módulo VovôBrDias" : "▶ Iniciar processamento")}
        </button>
      </article>
    `;
  }).join("");

  const eff = 100 + totalEfficiencyBonus();
  $("productionTotal").textContent = fmt(state.production) + " un.";
  $("equipmentTotal").textContent = 1 + state.upgrades.length;
  $("efficiencyValue").textContent = eff + "%";
}

function renderMarket(){
  $("marketGrid").innerHTML = Object.entries(MATERIALS).map(([id,m])=>{
    const qtyAvailable = state.stock[id] || 0;
    const disabled = qtyAvailable <= 0;
    return `
      <article class="market-card ${id === "vovo_artifact" ? "chip-market-card" : ""}">
        <span class="material-icon mat-icon-${m.color}">${m.icon}</span>
        <div style="margin-top:10px">${matBadge(id)}</div>
        <p style="margin-top:8px">Estoque: <strong>${fmt(qtyAvailable)} ${m.unit}</strong></p>
        <div class="market-price">${fmt(m.price)} <small>CR / un.</small></div>
        <div class="sell-row">
          <input type="number" min="1" max="${Math.max(1, qtyAvailable)}" value="${qtyAvailable > 0 ? Math.min(5, qtyAvailable) : 0}" id="sell-${id}" ${disabled ? "disabled" : ""}>
          <button class="btn btn-primary" type="button" onclick="sellMaterial('${id}')" ${disabled ? "disabled" : ""}>Vender</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderUpgrades(){
  $("upgradeGrid").innerHTML = UPGRADES.map(u=>{
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
        <button class="btn ${owned ? "btn-outline" : "btn-primary"} full" type="button" style="margin-top:14px" ${owned || !canAfford ? "disabled" : `onclick="buyUpgrade('${u.id}')"`}>
          ${owned ? "Adquirido" : !canAfford ? "Créditos insuficientes" : "Adquirir"}
        </button>
      </article>
    `;
  }).join("");
}

const STAGE_THEMES = [
  {name:"FASE 1 · LAVRA",svg:`<svg viewBox="0 0 640 280" xmlns="http://www.w3.org/2000/svg"><rect width="640" height="280" fill="#13293d"/><polygon points="180,280 310,115 445,280" fill="#183247"/></svg>`},
  {name:"FASE 2 · COMINUIÇÃO",svg:`<svg viewBox="0 0 640 280" xmlns="http://www.w3.org/2000/svg"><rect width="640" height="280" fill="#11263a"/><rect x="255" y="135" width="74" height="115" rx="8" fill="#1c3c52"/></svg>`},
  {name:"FASE 3 · HIDROMETALURGIA",svg:`<svg viewBox="0 0 640 280" xmlns="http://www.w3.org/2000/svg"><rect width="640" height="280" fill="#0f2336"/><rect x="250" y="95" width="46" height="150" rx="22" fill="#19374d"/></svg>`},
  {name:"FASE 4 · METALURGIA",svg:`<svg viewBox="0 0 640 280" xmlns="http://www.w3.org/2000/svg"><rect width="640" height="280" fill="#122134"/><path d="M310 245 L330 110 H430 L450 245 Z" fill="#1d2f42"/></svg>`},
  {name:"FASE 5 · ALTA TECNOLOGIA",svg:`<svg viewBox="0 0 640 280" xmlns="http://www.w3.org/2000/svg"><rect width="640" height="280" fill="#0d2235"/><circle cx="430" cy="145" r="44" fill="#163547"/></svg>`},
  {name:"FASE 6 · EXPANSÃO ESPACIAL VOVÔBRDIAS",svg:`<svg viewBox="0 0 640 280" xmlns="http://www.w3.org/2000/svg"><rect width="640" height="280" fill="#060b14"/><circle cx="500" cy="80" r="3" fill="#fff"/><circle cx="100" cy="60" r="2" fill="#fff"/><rect x="380" y="80" width="140" height="120" rx="16" fill="#10293d" stroke="#b6ed62" stroke-width="3"/><text x="450" y="145" text-anchor="middle" fill="#b6ed62" font-family="Manrope,sans-serif" font-weight="800" font-size="14">VOVÔBRDIAS</text></svg>`}
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
  const backdrop = $("stageBackdrop");
  if(backdrop){
    const encoded = encodeURIComponent(theme.svg);
    backdrop.style.backgroundImage = `url("data:image/svg+xml,${encoded}")`;
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
  const p = PROCESSES.find(x=>x.id===id);
  if(!p || !unlockedProcess(p)) return;
  const cost = effectiveCost(p);
  const hasMain = (state.stock[p.input] || 0) >= p.qty;
  const hasExtra = !p.extraInput || (state.stock[p.extraInput] || 0) >= p.extraQty;
  if(!hasMain || !hasExtra || state.coins < cost){
    toast("Recursos insuficientes para esta operação.");
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
  const htmlResult = isAllDone
    ? `Parabéns Diretor! Você concluiu a missão final <strong>${m.title}</strong> e eternizou o legado de <strong>VovôBrDias</strong>!`
    : `Parabéns! Você concluiu a missão <strong>${m.title}</strong> e recebeu <strong>${fmt(m.reward)} créditos</strong>.`;
  showModal(isAllDone ? "Expansão concluída · Homenagem Suprema!" : "Missão concluída!", htmlResult, isAllDone ? "🚀" : "✦", "RECOMPENSA");
}

function sellMaterial(id){
  const input = $("sell-" + id);
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
  toast(`${qty} unidade(s) vendida(s).`);
}

function buyUpgrade(id){
  const u = UPGRADES.find(x=>x.id===id);
  if(!u || state.upgrades.includes(id)) return;
  if(state.coins < u.cost){
    toast("Créditos insuficientes.");
    return;
  }
  state.coins -= u.cost;
  state.upgrades.push(id);
  save();
  showModal("Investimento realizado", `<strong>${u.name}</strong> adquirido com sucesso!`, "⬡", "EXPANSÃO");
}

function startNewGame(){
  if(!confirm("Começar uma nova partida?\n\nTodo o progresso atual será apagado.")) return;
  closeModal();
  state = structuredClone(DEFAULT_STATE);
  save();
  changeView("dashboard");
  toast("Nova partida iniciada!");
}

document.querySelectorAll(".nav-link").forEach(b=>b.addEventListener("click",()=>changeView(b.dataset.view)));
document.querySelectorAll("[data-goto]").forEach(b=>b.addEventListener("click",()=>changeView(b.dataset.goto)));
if($("brandHome")) $("brandHome").addEventListener("click",e=>{e.preventDefault();changeView("dashboard");});
$("mobileMenu").addEventListener("click",()=>$("sidebar").classList.toggle("open"));
["newGame","newGameButton","resetGame"].forEach(id=>{
  const btn = $(id);
  if(btn) btn.addEventListener("click", startNewGame);
});
if($("syncCloudBtn")){
  $("syncCloudBtn").addEventListener("click", ()=>{
    loadFromCloud();
    toast("Sincronizando com o Firebase...");
  });
}
$("modalClose").addEventListener("click",closeModal);
$("modalOk").addEventListener("click",closeModal);
$("modalBackdrop").addEventListener("click",e=>{if(e.target===$("modalBackdrop"))closeModal();});
$("todayLabel").textContent = new Intl.DateTimeFormat("pt-BR",{day:"2-digit",month:"short",year:"numeric"}).format(new Date());

loadFromCloud().then(()=>{
  renderAll();
});
