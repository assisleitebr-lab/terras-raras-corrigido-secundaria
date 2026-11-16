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

// Gerar ou recuperar ID de jogador local para Firestore
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
  chip:{name:"Chip eletrônico de alta precisão",icon:"❖",price:1650,unit:"un.",color:"chip"}
};

function matBadge(id){
  const m = MATERIALS[id];
  if(!m) return "";
  return `<span class="mat-badge mat-${m.color}">${m.icon} ${m.name}</span>`;
}

const MISSIONS = [
  {title:"Extração mineral",desc:"Inicie a operação da jazida e extraia seu primeiro lote de minério.",detail:"A mineração começa com a lavra do corpo mineral, seguida do carregamento e transporte do minério até a unidade de processamento.",goal:"ore",target:50,reward:1200,stage:"Lavra"},
  {title:"Britagem e moagem",desc:"Reduza o tamanho das rochas para liberar os minerais de interesse.",detail:"Britadores e moinhos diminuem a granulometria do minério. O tamanho adequado das partículas ajuda a liberar os minerais que serão concentrados.",goal:"concentrate",target:20,reward:1500,stage:"Cominuição"},
  {title:"Beneficiamento mineral",desc:"Concentre os minerais portadores de terras raras.",detail:"Operações físicas, como classificação, separação magnética e/ou flotação, podem elevar o teor dos minerais de interesse antes do tratamento químico.",goal:"mixed",target:12,reward:1800,stage:"Concentração"},
  {title:"Processamento químico",desc:"Faça o tratamento do concentrado para obter óxidos de terras raras.",detail:"Rotas hidrometalúrgicas podem envolver lixiviação e etapas de purificação. A rota adequada depende da mineralogia e da composição do concentrado.",goal:"oxide",target:4,reward:2200,stage:"Hidrometalurgia"},
  {title:"Separação dos elementos",desc:"Avance no fracionamento dos elementos de terras raras.",detail:"Como os elementos possuem propriedades químicas muito semelhantes, a separação industrial costuma exigir várias etapas, frequentemente com extração por solventes ou troca iônica.",goal:"oxide",target:10,reward:2600,stage:"Separação"},
  {title:"Produção de óxidos",desc:"Amplie a produção de óxidos individuais de terras raras.",detail:"Após purificação e precipitação, os produtos podem ser calcinados para formar óxidos, como óxido de neodímio e óxido de praseodímio.",goal:"oxide",target:20,reward:3000,stage:"Óxidos"},
  {title:"Refino e obtenção dos metais",desc:"Transforme óxidos selecionados em metais.",detail:"A obtenção de metais de terras raras pode envolver processos metalúrgicos específicos, como redução metalotérmica ou eletrólise de sais fundidos.",goal:"metal",target:10,reward:3500,stage:"Metalurgia"},
  {title:"Fabricação de ligas metálicas",desc:"Produza uma liga adequada à fabricação de ímãs permanentes.",detail:"Ligas para ímãs NdFeB utilizam principalmente neodímio (ou praseodímio), ferro e boro. A formulação e o processamento influenciam o desempenho magnético.",goal:"alloy",target:8,reward:4200,stage:"Ligas"},
  {title:"Produção de ímãs permanentes",desc:"Fabrique ímãs permanentes de neodímio-ferro-boro.",detail:"A fabricação de ímãs NdFeB envolve preparação da liga, moagem, alinhamento do pó, compactação, sinterização e tratamentos posteriores.",goal:"magnet",target:5,reward:5000,stage:"Ímãs"},
  {title:"Aplicação industrial",desc:"Forneça componentes magnéticos para aplicações tecnológicas.",detail:"Ímãs permanentes de alto desempenho são utilizados em motores elétricos, geradores eólicos, automação e diversos equipamentos tecnológicos.",goal:"motor",target:3,reward:7000,stage:"Tecnologia"}
];

const PROCESSES = [
  {id:"crush",title:"Britagem e moagem",icon:"⚒",desc:"Reduz o tamanho do minério para liberar os minerais.",input:"ore",qty:10,output:"concentrate",out:5,cost:120,unlock:0,mission:1,learn:"Na prática, a cominuição prepara o minério para as etapas de concentração."},
  {id:"benefit",title:"Beneficiamento",icon:"◈",desc:"Concentra os minerais de interesse por métodos físicos.",input:"concentrate",qty:5,output:"mixed",out:3,cost:180,unlock:1,mission:2,learn:"A recuperação e o teor do concentrado dependem da mineralogia e da rota escolhida."},
  {id:"chem",title:"Processamento químico",icon:"⚗",desc:"Trata o concentrado e prepara a solução para purificação.",input:"mixed",qty:4,output:"oxide",out:2,cost:260,unlock:2,mission:3,learn:"A lixiviação transfere os elementos de interesse para uma solução; depois vêm purificação e precipitação."},
  {id:"separate",title:"Separação e purificação",icon:"⇄",desc:"Separa e purifica os elementos de terras raras.",input:"oxide",qty:3,output:"oxide",out:5,cost:380,unlock:4,mission:4,learn:"A separação individual é complexa porque os elementos têm comportamentos químicos parecidos."},
  {id:"metal",title:"Redução e refino",icon:"♨",desc:"Obtém metal a partir do óxido selecionado.",input:"oxide",qty:3,output:"metal",out:2,cost:520,unlock:5,mission:6,learn:"Nem todo óxido é reduzido pela mesma rota; o processo depende do elemento e da aplicação."},
  {id:"alloy",title:"Produção de ligas",icon:"▣",desc:"Combina metais e elementos de liga para formar NdFeB.",input:"metal",qty:3,output:"alloy",out:2,cost:700,unlock:6,mission:7,learn:"A liga NdFeB combina neodímio/praseodímio, ferro e boro em composição controlada."},
  {id:"magnet",title:"Fabricação de ímãs",icon:"✥",desc:"Processa a liga para produzir ímãs permanentes.",input:"alloy",qty:2,output:"magnet",out:1,cost:900,unlock:7,mission:8,learn:"O processo pode incluir moagem, alinhamento, compactação, sinterização e usinagem."},
  {id:"motor",title:"Componente industrial",icon:"⚙",desc:"Integra os ímãs em componentes para motores elétricos.",input:"magnet",qty:2,output:"motor",out:1,cost:1200,unlock:8,mission:9,learn:"Motores de ímãs permanentes convertem energia elétrica em movimento com alta densidade de potência."},
  {id:"chip",title:"Fabricação de chip eletrônico",icon:"❖",desc:"Integra elementos de terras raras em semicondutores e microcomponentes eletrônicos.",input:"motor",qty:1,extraInput:"oxide",extraQty:2,output:"chip",out:1,cost:1800,unlock:10,mission:10,isFinalProject:true,learn:"Terras raras e óxidos purificados são essenciais em capacitores cerâmicos, sensores, telas e chips eletrônicos avançados."}
];

const UPGRADES = [
  {id:"crusher",name:"Britador de mandíbulas",icon:"⚒",desc:"Melhora a capacidade de britagem e reduz o custo operacional.",cost:1800,eff:5},
  {id:"mill",name:"Moinho industrial",icon:"⚙",desc:"Aumenta a eficiência de moagem e preparação do minério.",cost:2600,eff:8},
  {id:"separator",name:"Unidade de separação",icon:"⇄",desc:"Aprimora a capacidade de purificação e separação.",cost:4200,eff:12},
  {id:"lab",name:"Laboratório de controle",icon:"⚗",desc:"Melhora o controle de qualidade e o rendimento da fábrica.",cost:5500,eff:10},
  {id:"automation",name:"Automação industrial",icon:"▦",desc:"Otimiza operações e reduz custos de processamento.",cost:8000,eff:18},
  {id:"plant",name:"Expansão da planta",icon:"▤",desc:"Amplia a capacidade global de produção.",cost:12000,eff:25}
];

const DEFAULT_STATE = {
  coins:10000,
  stock:{ore:300,concentrate:0,mixed:0,oxide:0,metal:0,alloy:0,magnet:0,motor:0,chip:0},
  produced:{concentrate:0,mixed:0,oxide:0,metal:0,alloy:0,magnet:0,motor:0,chip:0},
  completed:[],
  production:0,
  upgrades:[],
  company:"Mineradora Aurora"
};

let state = loadState();

function loadState(){
  try{
    const saved = JSON.parse(localStorage.getItem("terrasRarasSave"));
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

// Sincronizar com Firebase Firestore
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
      localStorage.setItem("terrasRarasSave", JSON.stringify(state));
      renderAll();
      toast("Progresso sincronizado do Firebase com sucesso!");
    }
  }catch(e){
    console.error("Erro ao carregar do Firebase:", e);
  }
}

function save(){
  try{
    localStorage.setItem("terrasRarasSave", JSON.stringify(state));
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

// Assistente de voz
let audioEnabled = true;
let lastSpokenText = "Bem-vindo à Mineradora Aurora com Firebase. Este é um simulador educativo de mineração e processamento de terras raras.";

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
  utterance.onstart = () => setAudioStatus("Lendo as instruções em voz alta…");
  utterance.onend = () => setAudioStatus("Pronto para ler novas instruções.");
  utterance.onerror = () => setAudioStatus("Clique em Ativar áudio para liberar a leitura no navegador.");
  window.speechSynthesis.speak(utterance);
}

function stopSpeech(){
  if("speechSynthesis" in window) window.speechSynthesis.cancel();
  setAudioStatus(audioEnabled ? "Leitura interrompida." : "Áudio desligado.");
}

function speakCurrentMission(){
  const i = activeMissionIndex();
  if(i < 0){
    speak("Parabéns! Você concluiu todas as dez missões da cadeia produtiva e desbloqueou o projeto especial de alta tecnologia: agora você pode fabricar um Chip eletrônico de alta precisão no Centro de Produção!");
    return;
  }
  const m = MISSIONS[i];
  speak(`Missão ${i+1}: ${m.title}. ${m.desc} Aprenda: ${m.detail} Para concluir, tenha ${m.target} unidades de ${MATERIALS[m.goal].name} no estoque. Ao concluir, você recebe ${fmt(m.reward)} créditos.`);
}

function speakView(name){
  const messages = {
    dashboard:"Você está na visão geral da sua indústria conectada ao Firebase. Aqui pode acompanhar seu dinheiro, o estoque e o andamento das missões.",
    missions:"Você está na central de missões. Cada missão representa uma etapa da cadeia produtiva.",
    production:"Você está no centro de produção. Escolha uma máquina disponível, confira os materiais necessários e o custo em créditos.",
    market:"Você está no mercado de materiais. Confira o estoque e o preço por unidade para vender.",
    upgrades:"Você está na loja de equipamentos. Ouça a descrição de cada melhoria para aumentar a eficiência da indústria."
  };
  speak(messages[name] || "Nova seção aberta.");
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
  speakView(name);
}

function goToChipProduction(){
  changeView("production");
  setTimeout(()=>{
    const card = document.getElementById("process-card-chip");
    if(card){
      card.scrollIntoView({behavior:"smooth", block:"center"});
      card.classList.add("pulse-highlight");
      setTimeout(()=>card.classList.remove("pulse-highlight"), 2200);
    }
  }, 150);
}

function renderFinalChipBanner(){
  const unlocked = state.completed.length >= MISSIONS.length;
  const chipsMade = state.produced.chip || 0;
  if(!unlocked) return "";
  return `
    <div class="final-chip-card">
      <div class="final-chip-head">
        <span class="final-chip-icon">❖</span>
        <div>
          <span class="eyebrow" style="color:#b6ed62">ESTÁGIO FINAL DESBLOQUEADO · MICROELETRÔNICA</span>
          <h4>Projeto Especial: Criar Chip Eletrônico</h4>
        </div>
      </div>
      <p>Você dominou toda a cadeia das terras raras! Agora pode integrar ${matBadge("motor")} e ${matBadge("oxide")} para fabricar um ${matBadge("chip")} de altíssimo valor agregado. ${chipsMade > 0 ? `<strong>Chips já fabricados: ${fmt(chipsMade)} un.</strong>` : ""}</p>
      <div class="final-chip-actions">
        <button class="btn btn-light" type="button" onclick="goToChipProduction()">❖ Ir fabricar Chip Eletrônico →</button>
        <button class="audio-btn mission-audio-btn" type="button" onclick="speakProcess('chip')">🔊 Ouvir como criar o chip</button>
      </div>
    </div>
  `;
}

function renderStock(){
  const list = $("stockList");
  list.innerHTML = Object.entries(MATERIALS).map(([id,m])=>`
    <div class="stock-row">
      <span class="material-icon mat-icon-${m.color}">${m.icon}</span>
      <div>${matBadge(id)}<small class="stock-sub">Disponível no estoque</small></div>
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
  $("statMissions").innerHTML = `${state.completed.length} <small>/ 10</small>`;
  $("companyLevel").textContent = 1 + Math.floor(state.completed.length / 2) + ((state.produced.chip||0) > 0 ? 1 : 0);
  $("missionCount").textContent = idx < 0 ? "★" : idx + 1;
  if($("heroIndex")){
    $("heroIndex").innerHTML = `${idx < 0 ? "10" : String(idx + 1).padStart(2,"0")} <span>/ 10</span>`;
  }

  if(idx < 0){
    $("nextMissionEyebrow").textContent = "ESTÁGIO FINAL ALCANÇADO";
    $("nextMissionTitle").textContent = "Cadeia produtiva concluída!";
    $("nextMissionDesc").innerHTML = `Parabéns! Você concluiu todas as etapas e liberou a fabricação do ${matBadge("chip")}.`;
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
    $("finalChipOfferDashboard").innerHTML = renderFinalChipBanner();
  }
  renderStock();
  renderChain();
}

function speakMission(i){
  const m = MISSIONS[i];
  const status = state.completed.includes(i) ? "Esta missão já foi concluída." : "Missão em andamento.";
  speak(`Missão ${i+1}: ${m.title}. ${m.desc} ${status}`);
}

function speakConcentrateGuide(){
  speak("Vamos aprender a produzir concentrado mineral. Tenha minério bruto e créditos, acesse a máquina de britagem e moagem, e execute as operações.");
}

function renderMissions(){
  const pct = Math.round(state.completed.length / 10 * 100);
  $("missionSummaryCount").textContent = `${state.completed.length}/10`;
  $("allMissionProgress").style.width = pct + "%";
  $("allMissionPercent").textContent = pct + "% da cadeia produtiva";
  if($("finalChipOfferMissions")){
    $("finalChipOfferMissions").innerHTML = renderFinalChipBanner();
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
          <button class="audio-btn card-audio mission-audio-btn" type="button" onclick="speakMission(${i})">🔊 Ouvir instrução</button>
        </div>
      </article>
    `;
  }).join("");
}

function speakProcess(id){
  const p = PROCESSES.find(x=>x.id===id);
  if(!p) return;
  speak(`${p.title}. ${p.desc} Consome ${p.qty} unidades de ${MATERIALS[p.input].name}.`);
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
    const lockLabel = p.isFinalProject ? "Conclua as 10 missões para liberar" : "Missão anterior necessária";
    return `
      <article class="process-card ${p.isFinalProject ? "final-process-card" : ""}" id="process-card-${p.id}">
        <div class="process-top">
          <span class="process-icon">${p.icon}</span>
          <span class="status-pill">${open ? (p.isFinalProject ? "PROJETO FINAL" : "DISPONÍVEL") : "BLOQUEADO"}</span>
        </div>
        <h3>${p.title}</h3>
        <p>${p.desc}</p>
        <div class="recipe">
          <strong>Entrada:</strong> ${p.qty} ${matBadge(p.input)}${p.extraInput ? ` + ${p.extraQty} ${matBadge(p.extraInput)}` : ""}<br>
          <strong>Saída:</strong> ${p.out} ${matBadge(p.output)}<br>
          <strong>Produzido até agora:</strong> <span class="produced-count">${fmt(state.produced[p.output]||0)} ${MATERIALS[p.output].unit}</span><br>
          <strong>Custo:</strong> ${fmt(cost)} créditos ${hasDiscount ? `<small style="color:#5d8c32">(base: ${fmt(p.cost)})</small>` : ""}
        </div>
        <button class="audio-btn card-audio" type="button" onclick="speakProcess('${p.id}')">🔊 Ouvir instrução</button>
        <button class="btn ${open && enough ? "btn-primary" : "btn-outline"}" type="button" ${open && enough ? `onclick="runProcess('${p.id}')"` : "disabled"}>
          ${!open ? lockLabel : !enough ? "Insumos ou créditos insuficientes" : (p.isFinalProject ? "❖ Fabricar Chip Eletrônico" : "▶ Iniciar processamento")}
        </button>
      </article>
    `;
  }).join("");

  const eff = 100 + totalEfficiencyBonus();
  $("productionTotal").textContent = fmt(state.production) + " un.";
  $("equipmentTotal").textContent = 1 + state.upgrades.length;
  $("efficiencyValue").textContent = eff + "%";
  if($("efficiencyBar")){
    $("efficiencyBar").style.width = Math.min(100, Math.round((eff / 180) * 100)) + "%";
  }
}

function speakMarket(id){
  const m = MATERIALS[id];
  speak(`Mercado: ${m.name}. Preço: ${fmt(m.price)} créditos por unidade.`);
}

function renderMarket(){
  $("marketGrid").innerHTML = Object.entries(MATERIALS).map(([id,m])=>{
    const qtyAvailable = state.stock[id] || 0;
    const disabled = qtyAvailable <= 0;
    return `
      <article class="market-card ${id === "chip" ? "chip-market-card" : ""}">
        <span class="material-icon mat-icon-${m.color}">${m.icon}</span>
        <div style="margin-top:10px">${matBadge(id)}</div>
        <p style="margin-top:8px">Estoque disponível: <strong>${fmt(qtyAvailable)} ${m.unit}</strong></p>
        <div class="market-price">${fmt(m.price)} <small>CR / unidade</small></div>
        <button class="audio-btn card-audio" type="button" onclick="speakMarket('${id}')">🔊 Ouvir como vender</button>
        <div class="sell-row">
          <input type="number" min="1" max="${Math.max(1, qtyAvailable)}" value="${qtyAvailable > 0 ? Math.min(5, qtyAvailable) : 0}" id="sell-${id}" aria-label="Quantidade de ${m.name}" ${disabled ? "disabled" : ""}>
          <button class="btn btn-primary" type="button" onclick="sellMaterial('${id}')" ${disabled ? "disabled" : ""}>Vender</button>
        </div>
      </article>
    `;
  }).join("");
}

function speakUpgrade(id){
  const u = UPGRADES.find(x=>x.id===id);
  if(!u) return;
  speak(`${u.name}. Custo: ${fmt(u.cost)} créditos.`);
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
        <button class="audio-btn card-audio" type="button" onclick="speakUpgrade('${u.id}')">🔊 Ouvir equipamento</button>
        <div class="upgrade-cost">${fmt(u.cost)} <small>CRÉDITOS</small></div>
        <div class="stat-foot">Eficiência adicional: +${u.eff}%</div>
        <button class="btn ${owned ? "btn-outline" : "btn-primary"} full" type="button" style="margin-top:14px" ${owned || !canAfford ? "disabled" : `onclick="buyUpgrade('${u.id}')"`}>
          ${owned ? "Equipamento adquirido" : !canAfford ? "Créditos insuficientes" : "Adquirir equipamento"}
        </button>
      </article>
    `;
  }).join("");
}

const STAGE_THEMES = [
  {
    name:"FASE 1 · JAZIDA E LAVRA",
    svg:`<svg viewBox="0 0 640 280" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="sky1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#13293d"/><stop offset="100%" stop-color="#224459"/></linearGradient><linearGradient id="oreGlow" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#d8f69b"/><stop offset="100%" stop-color="#79a83c"/></linearGradient></defs><rect width="640" height="280" fill="url(#sky1)"/><circle cx="510" cy="65" r="46" fill="#b6ed62" opacity="0.10"/><polygon points="180,280 310,115 445,280" fill="#183247"/><polygon points="330,280 485,82 640,280" fill="#1f3f56"/><polygon points="485,82 525,135 495,145 470,125" fill="#b6ed62" opacity="0.28"/><path d="M430 165 L465 142 L495 162 L482 198 L440 192 Z" fill="url(#oreGlow)" opacity="0.92"/><path d="M355 215 L380 198 L402 214 L390 238 L362 234 Z" fill="url(#oreGlow)" opacity="0.72"/><path d="M210 245 Q360 220 620 250 L640 280 L190 280 Z" fill="#0f2030"/></svg>`
  },
  {
    name:"FASE 2 · COMINUIÇÃO E BENEFICIAMENTO",
    svg:`<svg viewBox="0 0 640 280" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="sky2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#11263a"/><stop offset="100%" stop-color="#1e4554"/></linearGradient></defs><rect width="640" height="280" fill="url(#sky2)"/><rect x="255" y="135" width="74" height="115" rx="8" fill="#1c3c52" stroke="#9dd24c" stroke-width="2"/><rect x="355" y="115" width="84" height="135" rx="8" fill="#1c3c52" stroke="#b6ed62" stroke-width="2"/><line x1="210" y1="210" x2="565" y2="175" stroke="#b6ed62" stroke-width="6" stroke-linecap="round" opacity="0.65"/><rect x="180" y="248" width="460" height="32" fill="#0c1b29"/></svg>`
  },
  {
    name:"FASE 3 · HIDROMETALURGIA E ÓXIDOS",
    svg:`<svg viewBox="0 0 640 280" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="sky3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0f2336"/><stop offset="100%" stop-color="#1b434e"/></linearGradient></defs><rect width="640" height="280" fill="url(#sky3)"/><g fill="#19374d" stroke="#5eead4" stroke-width="2"><rect x="250" y="95" width="46" height="150" rx="22"/><rect x="325" y="75" width="52" height="170" rx="25"/><rect x="405" y="90" width="48" height="155" rx="23"/></g><rect x="180" y="245" width="460" height="35" fill="#0b1926"/></svg>`
  },
  {
    name:"FASE 4 · METALURGIA E LIGAS NdFeB",
    svg:`<svg viewBox="0 0 640 280" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="sky4" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#122134"/><stop offset="100%" stop-color="#2c3545"/></linearGradient></defs><rect width="640" height="280" fill="url(#sky4)"/><path d="M310 245 L330 110 H430 L450 245 Z" fill="#1d2f42" stroke="#fbbf24" stroke-width="2.5"/><rect x="352" y="155" width="56" height="42" rx="6" fill="#f59e0b" opacity="0.85"/><rect x="180" y="245" width="460" height="35" fill="#0b1724"/></svg>`
  },
  {
    name:"FASE 5 · ÍMÃS E ALTA TECNOLOGIA",
    svg:`<svg viewBox="0 0 640 280" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="sky5" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0d2235"/><stop offset="100%" stop-color="#1a4742"/></linearGradient></defs><rect width="640" height="280" fill="url(#sky5)"/><circle cx="430" cy="145" r="44" fill="#163547" stroke="#b6ed62" stroke-width="3"/><rect x="180" y="248" width="460" height="32" fill="#091724"/></svg>`
  },
  {
    name:"FASE 6 · MICROELETRÔNICA E CHIPS",
    svg:`<svg viewBox="0 0 640 280" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="sky6" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0b1d2e"/><stop offset="100%" stop-color="#143b47"/></linearGradient></defs><rect width="640" height="280" fill="url(#sky6)"/><rect x="394" y="92" width="112" height="106" rx="14" fill="#10293d" stroke="#b6ed62" stroke-width="3"/><rect x="414" y="112" width="72" height="66" rx="8" fill="#1a4358" stroke="#38bdf8" stroke-width="2"/><text x="450" y="150" text-anchor="middle" fill="#b6ed62" font-family="Manrope,sans-serif" font-weight="800" font-size="13">CHIP</text><rect x="180" y="248" width="460" height="32" fill="#081521"/></svg>`
  }
];

function currentStageTheme(){
  const completed = state.completed.length;
  if(completed >= MISSIONS.length) return STAGE_THEMES[5];
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

  const extraDesc = p.extraInput ? ` e ${p.extraQty} unidades de ${matBadge(p.extraInput)}` : "";
  const htmlResult = `<strong>${p.title}:</strong> você consumiu ${p.qty} unidades de ${matBadge(p.input)}${extraDesc} e produziu <strong>${p.out} un.</strong> de ${matBadge(p.output)}.<br><br>${p.learn}`;
  const voiceResult = `Processamento concluído. ${p.title}.`;
  showModal(p.isFinalProject ? "Chip eletrônico fabricado!" : "Processamento concluído", htmlResult, p.isFinalProject ? "❖" : "⚙", p.isFinalProject ? "ALTA TECNOLOGIA" : "PRODUÇÃO REALIZADA");
  speak(voiceResult);
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
    ? `Parabéns! Você concluiu a missão final <strong>${m.title}</strong> e recebeu <strong>${fmt(m.reward)} créditos</strong>.<br><br><strong>Novo estágio desbloqueado:</strong> agora você pode fabricar o ${matBadge("chip")} no Centro de Produção!`
    : `Parabéns! Você concluiu a missão <strong>${m.title}</strong> e recebeu <strong>${fmt(m.reward)} créditos</strong>.`;
  showModal(isAllDone ? "Cadeia concluída · Chip liberado!" : "Missão concluída!", htmlResult, isAllDone ? "❖" : "✦", "RECOMPENSA RECEBIDA");
  speak("Missão concluída com sucesso.");
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
  speak("Venda realizada com sucesso.");
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
  const result = `Compra realizada. <strong>${u.name}</strong> foi incorporado à sua indústria.`;
  showModal("Investimento realizado", result, "⬡", "EXPANSÃO INDUSTRIAL");
  speak("Equipamento adquirido com sucesso.");
}

function startNewGame(){
  if(!confirm("Começar uma nova partida?\n\nTodo o progresso atual desta indústria será apagado.")) return;
  stopSpeech();
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

// Carregar do Firebase ao iniciar
loadFromCloud().then(()=>{
  renderAll();
});

if("speechSynthesis" in window){
  window.speechSynthesis.onvoiceschanged = ()=>{};
}else{
  setAudioStatus("Leitura em voz alta não suportada.");
  $("audioEnable").disabled = true;
  $("audioToggle").disabled = true;
}

$("audioEnable").addEventListener("click",()=>{
  audioEnabled = true;
  $("audioToggle").textContent = "Áudio ligado";
  $("audioToggle").setAttribute("aria-pressed","true");
  speak("Áudio ativado com sucesso.");
});

$("audioRepeat").addEventListener("click",()=>speak(lastSpokenText));

$("audioToggle").addEventListener("click",()=>{
  audioEnabled = !audioEnabled;
  $("audioToggle").textContent = audioEnabled ? "Áudio ligado" : "Áudio desligado";
  $("audioToggle").setAttribute("aria-pressed", String(audioEnabled));
  if(!audioEnabled) stopSpeech();
  else speak("Áudio ligado.");
});
