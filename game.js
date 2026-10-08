import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.181.2/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.181.2/examples/jsm/controls/OrbitControls.js";

const $=id=>document.getElementById(id), KEY="worldchef3d-save-v5";
const RECIPES={
 burger:{name:"Hamburguesa Clásica",icon:"🍔",station:"grill",time:7,base:45,xp:12,req:{bread:1,meat:1,cheese:1,lettuce:1,tomato:1}},
 fries:{name:"Papas Fritas",icon:"🍟",station:"fryer",time:5,base:28,xp:8,req:{potato:2}},
 pizza:{name:"Pizza Pepperoni",icon:"🍕",station:"oven",time:11,base:85,xp:20,req:{dough:1,cheese:2,pepperoni:1,tomato:1}},
 sushi:{name:"Sushi Deluxe",icon:"🍣",station:"prep",time:14,base:130,xp:28,req:{rice:2,fish:1,seaweed:1}},
 steak:{name:"Steak Premium",icon:"🥩",station:"grill",time:12,base:150,xp:30,req:{meat:2}}, soda:{name:"Soda",icon:"🥤",station:"drinks",time:2,base:18,xp:4,req:{syrup:1}}
};
const STATIONS=[["grill","🔥","Parrilla",1,350],["fryer","🍟","Freidora",2,600],["oven","🍕","Horno",3,1000],["prep","🔪","Preparación",5,1800],["drinks","🥤","Bebidas",2,750],["fridge","🧊","Nevera",1,900],["dish","🧼","Lavaplatos",2,1100]];
const INITIAL_INV={bread:20,meat:20,cheese:20,lettuce:20,tomato:20,potato:30,dough:10,pepperoni:10,rice:20,fish:10,seaweed:10,syrup:20};
function fresh(){return{employees:{},level:1,xp:0,xpGoal:100,cash:500,gems:10,reputation:100,totalOrders:0,restaurantLevel:1,recipeLevels:{burger:1},stations:{grill:1},inv:{...INITIAL_INV},orders:[],prepared:[],selectedOrder:null,activeContract:null,marketing:0,completedContracts:0,lastSeen:Date.now(),tutorialDone:false,achievements:{},expansion:0,city:"newyork"}}
function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||"null"),d=fresh();if(!x)return d;Object.assign(d,x,{employees:{...d.employees,...(x.employees||{})},recipeLevels:{...d.recipeLevels,...(x.recipeLevels||{})},stations:{...d.stations,...(x.stations||{})},inv:{...d.inv,...(x.inv||{})}});d.orders=Array.isArray(x.orders)?x.orders:[];d.prepared=Array.isArray(x.prepared)?x.prepared:[];return d}catch{return fresh()}}
let S=load(), cooking=false;
function save(){localStorage.setItem(KEY,JSON.stringify(S))}
const scene=new THREE.Scene();const cityTheme={newyork:0x9eb7c4,tokyo:0x687b91,paris:0xb9a58f,china:0xc98f72,argentina:0x86a9b8};const initialCityColor=cityTheme[S.city]||cityTheme.newyork;scene.background=new THREE.Color(initialCityColor);scene.fog=new THREE.Fog(initialCityColor,13,30);
const camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.1,100);camera.position.set(8,8,10);
const renderer=new THREE.WebGLRenderer({canvas:$("game"),antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;
const controls=new OrbitControls(camera,renderer.domElement);controls.enablePan=false;controls.minDistance=8;controls.maxDistance=16;controls.minPolarAngle=.7;controls.maxPolarAngle=1.25;controls.target.set(0,1,0);
scene.add(new THREE.HemisphereLight(0xffffff,0x405060,2));const sun=new THREE.DirectionalLight(0xffffff,3);sun.position.set(4,10,5);sun.castShadow=true;scene.add(sun);
const restaurantWidth=14+(S.expansion||0)*3, restaurantDepth=12+(S.expansion||0)*2;
function box(w,h,d,c,x,y,z){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color:c,roughness:.75}));o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;scene.add(o);return o}
function cyl(r,h,c,x,y,z){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,20),new THREE.MeshStandardMaterial({color:c,roughness:.7}));o.position.set(x,y,z);o.castShadow=true;scene.add(o);return o}
box(restaurantWidth,.25,restaurantDepth,0x3b424b,0,-.15,0);box(restaurantWidth,4,.25,0x22272f,0,2,-restaurantDepth/2+.1);box(.25,4,restaurantDepth,0x252a32,-restaurantWidth/2,2,0);box(.25,4,restaurantDepth,0x252a32,restaurantWidth/2,2,0);
box(5,.25,2.2,0x8b6b45,-3,1.6,-1.6);box(2.8,.25,2.2,0x8b6b45,3,1.6,-1.6);
for(let i=0;i<4;i++){let x=-5+i*3.3;box(2.7,1,1,0x15181d,x,.5,-4.3);cyl(.27,.35,0x5c626a,x-.65,1.18,-4.3);cyl(.27,.35,0x5c626a,x+.65,1.18,-4.3)}
for(let k=0;k<3;k++){let x=-4+k*4;box(.7,.9,.7,0x9b673e,x,.45,3);cyl(.65,.12,0x6d4c35,x,.95,2.7)}
function stationLevel(k){return S.stations[k]||0} function unlocked(id){return stationLevel(RECIPES[id].station)>0}
function recipeValue(id){const r=RECIPES[id],lv=S.recipeLevels[id]||1;return Math.round(r.base*(1+(lv-1)*.2))}
function ok(id){return Object.entries(RECIPES[id].req).every(([k,v])=>(S.inv[k]||0)>=v)}
function consume(id){Object.entries(RECIPES[id].req).forEach(([k,v])=>S.inv[k]-=v)}

// --- 3D CUSTOMER LAYER ---
const customerGroup=new THREE.Group(); scene.add(customerGroup);
const customerMeshes=[];
function createCustomer(o,index){
  const g=new THREE.Group(), x=-4.8+(index%4)*3.2, z=2.2-Math.floor(index/4)*1.7;
  g.position.set(x,.9,z);
  const body=new THREE.Mesh(new THREE.CylinderGeometry(.42,.5,.9,12),new THREE.MeshStandardMaterial({color:[0x3b82f6,0xef4444,0xf59e0b,0x8b5cf6][index%4]}));
  body.position.y=.45; body.castShadow=true; g.add(body);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.34,16,12),new THREE.MeshStandardMaterial({color:0xd49b78}));
  head.position.y=1.15; head.castShadow=true; g.add(head);
  const bubble=box(.95,.5,.08,0x171b22,0,1.8,0); bubble.material.transparent=true; bubble.material.opacity=.92; bubble.userData.customer=true; g.add(bubble);
  g.userData.baseY=.9; g.userData.phase=Math.random()*6.28; g.userData.order=o.id;
  customerGroup.add(g); customerMeshes.push(g);
}
function syncCustomers(){
  customerMeshes.forEach(g=>{if(g.parent)g.parent.remove(g)});
  customerMeshes.length=0; S.orders.slice(0,8).forEach(createCustomer);
}
const oldAddOrder=addOrder;
addOrder=function(){oldAddOrder();syncCustomers()};
const oldServe=serve;
serve=function(o){oldServe(o);syncCustomers()};

function addOrder(){
 const capacity=3+Math.max(0,S.restaurantLevel-1)+(S.employees?.waiter?.level||0)+(S.expansion||0)*2;
 if(S.orders.length>=capacity)return;
 const pool=Object.keys(RECIPES).filter(unlocked);
 const first=pool[Math.floor(Math.random()*pool.length)]||"burger";
 const combo=S.restaurantLevel>=4&&Math.random()<.28;
 const second=combo?(pool.filter(x=>x!==first)[Math.floor(Math.random()*Math.max(1,pool.filter(x=>x!==first).length))]||first):null;
 const items=second?[first,second]:[first];
 const vip=Math.random()<Math.min(.18,.07+S.marketing*.015), base=Math.max(...items.map(x=>RECIPES[x].time));
 const waiterLevel=S.employees?.waiter?.level||0; const t=((vip?58:68)+Math.random()*14)*(1+waiterLevel*.08);
 const reward=Math.round(items.reduce((n,x)=>n+recipeValue(x),0)*(vip?2:1));
 S.orders.push({id:crypto.randomUUID(),recipe:first,items,vip,time:t,left:t,reward});
 if(!S.selectedOrder)S.selectedOrder=S.orders[0].id;
 renderOrders()
}
function renderOrders(){$("orders").innerHTML=S.orders.map(o=>{const r=RECIPES[o.recipe],items=o.items||[o.recipe],p=Math.max(0,o.left/o.time);return '<button class="order '+(o.vip?"vip ":"")+(o.id===S.selectedOrder?"selected":"")+'" data-order="'+o.id+'"><div class="order-head"><span>'+(o.vip?"💎 VIP":"🧑 Cliente")+'</span><span>'+r.icon+" "+r.name+'</span></div><div class="order-items">'+items.map(x=>RECIPES[x].icon+" "+RECIPES[x].name).join(" + ")+'</div><div class="timer"><span style="transform:scaleX('+p+')"></span></div><div class="order-reward"><span>'+(o.vip?"2× ":"")+"🪙 $"+o.reward+'</span><span>'+Math.ceil(o.left)+"s</span></div></button>"}).join("");$("orders").querySelectorAll("[data-order]").forEach(b=>b.onclick=()=>{S.selectedOrder=b.dataset.order;renderOrders();update()})}
function toast(t){const e=$("toast");e.textContent=t;e.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove("show"),1900)}
function update(){const o=S.orders.find(x=>x.id===S.selectedOrder)||S.orders[0],id=o?.recipe||Object.keys(RECIPES).find(unlocked)||"burger",r=RECIPES[id],lv=stationLevel(r.station);$("level").textContent=S.level;$("cash").textContent="$"+S.cash.toLocaleString();$("gems").textContent=S.gems;$("rep").textContent=S.reputation+"%";$("xpBar").style.width=Math.min(100,S.xp/S.xpGoal*100)+"%";$("xpText").textContent=S.xp+" / "+S.xpGoal+" XP";$("stationName").textContent=STATIONS.find(x=>x[0]===r.station)?.[2]||"Parrilla";$("stationInfo").textContent="Nivel "+lv+" · "+r.time+"s";$("cookBtn").innerHTML="COCINAR "+r.icon+" "+r.name.toUpperCase()+" <span>"+r.time+"s</span>";$("ingredients").innerHTML=Object.entries(r.req).map(([k,v])=>'<div class="ingredient">'+k+'<small>'+v+" · "+(S.inv[k]||0)+" disponibles</small></div>").join("");$("restaurantLevel").textContent=S.restaurantLevel;$("preparedCount")&&($("preparedCount").textContent=S.prepared.length)}
function gainXP(n){S.xp+=n;while(S.xp>=S.xpGoal){S.xp-=S.xpGoal;S.level++;S.xpGoal=Math.floor(S.xpGoal*1.5);toast("⭐ Nivel "+S.level+" desbloqueado")}checkRestaurant()}
function checkRestaurant(){const next=S.restaurantLevel+1;if(next>20)return;const orderNeed=next===2?10:next===3?35:next===4?75:next===5?150:150+(next-5)*75;const cashNeed=next===2?1000:next===3?1500:next===4?4000:next===5?8000:8000+(next-5)*5000;const repNeed=next===2?85:next===3?90:next===4?95:90;const stationNeed=next>=3?2:1;const recipeNeed=next>=5?3:next>=4?2:0;const recipeLevelNeed=next>=5?3:next>=4?2:1;const mastered=Object.values(S.recipeLevels||{}).filter(l=>l>=recipeLevelNeed).length;if(S.totalOrders>=orderNeed&&S.cash>=cashNeed&&S.reputation>=repNeed&&(S.stations.grill||0)>=stationNeed&&mastered>=recipeNeed){S.cash-=cashNeed;S.restaurantLevel=next;toast("🏪 Restaurante nivel "+next+" desbloqueado");save()}}
function cook(){if(cooking)return;const o=S.orders.find(x=>x.id===S.selectedOrder)||S.orders[0],items=o?.items||[o?.recipe||"burger"],counts={};items.forEach(x=>counts[x]=(counts[x]||0)+1);const id=Object.keys(counts).find(x=>S.prepared.filter(p=>p.recipe===x).length<counts[x])||items[0],r=RECIPES[id];if(!unlocked(id)){toast("🔒 Estación bloqueada");return}if(!ok(id)){toast("⚠️ Faltan ingredientes para "+r.name);return}consume(id);cooking=true;$("cookBtn").disabled=true;const cookLevel=S.employees?.cook?.level||0;const staffSpeed=Math.max(.55,1-cookLevel*.08);const duration=Math.max(2,(r.time-(stationLevel(r.station)-1)*.8)*staffSpeed),start=performance.now();function tick(now){const left=duration-(now-start)/1000;if(left<=0)return finish(id);$("cookBtn").innerHTML="🔥 COCINANDO "+Math.ceil(left)+"s";requestAnimationFrame(tick)}requestAnimationFrame(tick);update()}
function finish(id){cooking=false;$("cookBtn").disabled=false;S.prepared.push({recipe:id,created:Date.now()});if(S.activeContract){if(S.activeContract.requirements){if(Object.prototype.hasOwnProperty.call(S.activeContract.requirements,id))S.activeContract.done[id]=Math.min(S.activeContract.requirements[id],(S.activeContract.done[id]||0)+1);}else S.activeContract.done=Math.min(S.activeContract.need,S.activeContract.done+1);}const o=S.orders.find(x=>x.id===S.selectedOrder)||S.orders[0],r=RECIPES[id];if(o){const items=o.items||[o.recipe],ready=items.every(x=>S.prepared.some(p=>p.recipe===x));if(ready)serve(o);else toast("🍽️ "+r.name+" preparada. Falta completar esta orden.");}else toast("🍽️ "+r.name+" preparada.");update()}
function serve(o){
 const items=o.items||[o.recipe];
 const counts={};items.forEach(x=>counts[x]=(counts[x]||0)+1);
 for(const [id,n] of Object.entries(counts)){if(S.prepared.filter(x=>x.recipe===id).length<n){toast("🍽️ Falta preparar "+RECIPES[id].name);return}}
 for(const [id,n] of Object.entries(counts)){for(let i=0;i<n;i++){const idx=S.prepared.findIndex(x=>x.recipe===id);S.prepared.splice(idx,1)}}
 S.cash+=o.reward;S.totalOrders++;gainXP(items.reduce((n,x)=>n+RECIPES[x].xp,0)*(o.vip?2:1));
 S.orders=S.orders.filter(x=>x.id!==o.id);S.selectedOrder=S.orders[0]?.id||null;
 toast((o.vip?"💎 VIP satisfecho · ":"")+"Orden servida +$"+o.reward);setTimeout(addOrder,Math.max(450,1200-S.marketing*90));renderOrders();update()
}
function serveSelected(){const o=S.orders.find(x=>x.id===S.selectedOrder)||S.orders[0];if(!o)return toast("No hay cliente seleccionado");serve(o)}
function buyIngredient(k){if(S.cash<25)return toast("No tienes suficiente dinero");S.cash-=25;S.inv[k]=(S.inv[k]||0)+10;update();modal("inventory")}
function modal(kind){$("modal").classList.remove("hidden");let html="";
if(kind==="inventory")html="<h2>📦 Inventario</h2><p>Compra lotes de 10.</p><div class='list'>"+Object.entries(S.inv).map(([k,v])=>'<div class="list-row"><div class="main"><b>'+k+'</b><small>'+v+" unidades</small></div><button class='mini-btn green' data-buy='"+k+"'>$25 +10</button></div>").join("")+"</div>";
else if(kind==="upgrades")html="<h2>🔧 Cocina</h2><p>Las estaciones reducen tiempos y desbloquean recetas.</p><div class='list'>"+STATIONS.map(s=>{const[id,ic,n,req,cost]=s,lv=stationLevel(id),price=lv?Math.round(cost*(lv+1)):cost;return '<div class="list-row '+(!lv&&S.level<req?"locked":"")+'"><div class="main"><b>'+ic+" "+n+'</b><small>'+(lv?"Nivel "+lv+" → "+(lv+1):"Desbloqueo nivel "+req)+'</small></div><button class="mini-btn green" data-st="'+id+'" '+(!lv&&S.level<req?"disabled":"")+'>'+price.toLocaleString()+"</button></div>"}).join("")+"</div>";
else if(kind==="recipes")html="<h2>📖 Recetas</h2><div class='list'>"+Object.entries(RECIPES).map(([id,r])=>{const lv=S.recipeLevels[id]||0,locked=!unlocked(id);return '<div class="list-row '+(locked?"locked":"")+'"><div class="main"><b>'+r.icon+" "+r.name+'</b><small>'+(locked?"🔒 Requiere estación "+r.station:"Nivel "+(lv||1)+" · $"+recipeValue(id)+" por orden")+'</small></div><button class="mini-btn '+(!locked?"green":"")+'" data-rec="'+id+'">'+(locked?"🔒":"MEJORAR $"+500*(lv||1))+"</button></div>"}).join("")+"</div>";
else if(kind==="employees"){
html="<h2>👥 Personal</h2><p>Contrata empleados para preparar y atender más rápido.</p><div class='list'>"+[
["cook","👨‍🍳 Cocinero",1500],["waiter","🧑‍🍳 Mesero",1800],["cleaner","🧹 Limpieza",1200]
].map(e=>{const cur=S.employees?.[e[0]],cost=cur?1000*cur.level:e[2];return '<div class="list-row"><div class="main"><b>'+e[1]+'</b><small>'+(cur?"Nivel "+cur.level:"Sin contratar")+'</small></div><button class="mini-btn green" data-emp="'+e[0]+'">'+(cur?"MEJORAR $"+cost:"CONTRATAR $"+cost)+'</button></div>'}).join("")+"</div>";
}
else if(kind==="contracts"){const a=S.activeContract;const contracts=[{name:"🎂 Cumpleaños",req:{burger:20},reward:2500,time:600,restaurant:1},{name:"🏢 Corporativo",req:{burger:30,fries:30},reward:8500,time:900,restaurant:3},{name:"👽 Galáctico",req:{burger:500,soda:500,fries:300},reward:125000,time:1800,restaurant:8}];const contractText=x=>Object.entries(x.req).map(([id,n])=>n+" "+RECIPES[id].name).join(" + ");const progress=x=>Object.entries(x.req).reduce((sum,[id,n])=>sum+Math.min(n,x.done?.[id]||0),0),needTotal=x=>Object.values(x.req).reduce((a,b)=>a+b,0);html="<h2>📋 Contratos</h2><p>Produce platos específicos dentro del límite de tiempo.</p>"+(a?'<div class="contract active"><b>📦 '+a.name+'</b><small>Progreso '+progress(a)+"/"+needTotal(a)+" · "+Math.ceil(a.left/60)+" min</small><p>"+Object.entries(a.requirements||{}).map(([id,n])=>RECIPES[id].icon+" "+RECIPES[id].name+": "+(a.done?.[id]||0)+"/"+n).join(" · ")+"</p><div class='progress'><span style='width:"+(progress(a)/needTotal(a)*100)+"%'></span></div></div>":"<div class='list'>"+contracts.map((x,i)=>'<div class="list-row"><div class="main"><b>'+x.name+'</b><small>'+contractText(x)+" · "+Math.ceil(x.time/60)+" min · Restaurante "+x.restaurant+'</small></div><button class="mini-btn green" data-contract-index="'+i+'">ACEPTAR</button></div>').join("")+"</div>")};
else if(kind==="world")html="<h2>🌎 Mundo</h2><p>Viaja cuando tu restaurante alcance el nivel requerido.</p><div class='list'>"+[["🇺🇸 Nueva York","newyork",1],["🇯🇵 Tokio","tokyo",10],["🇫🇷 París","paris",20],["🇨🇳 China","china",30],["🇦🇷 Argentina","argentina",40]].map((x,i)=>'<div class="list-row '+(S.restaurantLevel>=x[2]?"":"locked")+'"><div class="main"><b>'+x[0]+'</b><small>'+(S.restaurantLevel>=x[2]?"Disponible":"Restaurante nivel "+x[2])+"</small></div><button class=\"mini-btn\" data-city-index=\""+i+"\">"+(S.restaurantLevel>=x[2]?"ENTRAR":"🔒")+"</button></div>").join("")+"</div>";else html="<h2>🏪 Restaurante</h2><p>Reputación ⭐ "+S.reputation+"% · Nivel "+S.restaurantLevel+" · Expansión "+S.expansion+"</p><div class='list'><div class='list-row'><div class='main'><b>Pedidos completados</b><small>"+S.totalOrders+"</small></div></div><div class='list-row'><div class='main'><b>Marketing</b><small>Mejora la llegada de clientes.</small></div><button class='mini-btn green' data-marketing='1'>$500</button></div><div class='list-row'><div class='main'><b>Expandir restaurante</b><small>Más espacio y +2 clientes simultáneos · $"+(2500*((S.expansion||0)+1)).toLocaleString()+"</small></div><button class='mini-btn green' data-expansion='1'>EXPANDIR</button></div><div class='list-row'><div class='main'><b>Guardar</b><small>Guardado automático en este dispositivo.</small></div></div><div class='list-row'><div class='main'><b>Reiniciar</b><small>Borra todo el progreso.</small></div><button class='mini-btn' data-reset='1'>RESET</button></div></div>";
$("modalContent").innerHTML=html;
$("modalContent").querySelectorAll("[data-emp]").forEach(b=>b.onclick=()=>{upgradeEmployee(b.dataset.emp);modal("employees")});
$("modalContent").querySelectorAll("[data-buy]").forEach(b=>b.onclick=()=>buyIngredient(b.dataset.buy));
$("modalContent").querySelector("[data-expansion]")?.addEventListener("click",()=>expandRestaurant());
$("modalContent").querySelectorAll("[data-city-index]").forEach(b=>b.onclick=()=>travelCity(+b.dataset.cityIndex));
$("modalContent").querySelectorAll("[data-st]").forEach(b=>b.onclick=()=>{const id=b.dataset.st,s=STATIONS.find(x=>x[0]===id),lv=stationLevel(id),price=lv?Math.round(s[4]*(lv+1)):s[4];if(S.cash<price)return toast("Necesitas $"+price);if(!lv&&S.level<s[3])return toast("🔒 Necesitas nivel "+s[3]);S.cash-=price;S.stations[id]=(lv||0)+1;toast("🔧 "+s[2]+" mejorada");update();modal("upgrades")});
$("modalContent").querySelectorAll("[data-rec]").forEach(b=>b.onclick=()=>{const id=b.dataset.rec;if(!unlocked(id))return toast("🔒 Primero desbloquea la estación");const lv=S.recipeLevels[id]||1,cost=500*lv;if(S.cash<cost)return toast("Necesitas $"+cost);S.cash-=cost;S.recipeLevels[id]=lv+1;toast("📖 Receta mejorada");update();modal("recipes")});
$("modalContent").querySelectorAll("[data-contract-index]").forEach(b=>b.onclick=()=>{if(S.activeContract)return toast("Ya tienes un contrato activo");const contracts=[{name:"🎂 Cumpleaños",req:{burger:20},reward:2500,time:600,restaurant:1},{name:"🏢 Corporativo",req:{burger:30,fries:30},reward:8500,time:900,restaurant:3},{name:"👽 Galáctico",req:{burger:500,soda:500,fries:300},reward:125000,time:1800,restaurant:8}];const x=contracts[+b.dataset.contractIndex];if(!x)return;if(S.restaurantLevel<x.restaurant)return toast("🔒 Restaurante nivel "+x.restaurant);S.activeContract={name:x.name,requirements:x.req,done:Object.fromEntries(Object.keys(x.req).map(id=>[id,0])),reward:x.reward,left:x.time};save();toast("📋 Contrato aceptado");update();modal("contracts")});
$("modalContent").querySelector("[data-marketing]")?.addEventListener("click",()=>{if(S.cash<500)return toast("Necesitas $500");S.cash-=500;S.marketing++;toast("📣 Marketing activo");update();modal("restaurant")});
$("modalContent").querySelector("[data-reset]")?.addEventListener("click",()=>{if(confirm("¿Borrar toda la partida?")){localStorage.removeItem(KEY);location.reload()}});
}
$("closeModal").onclick=()=>$("modal").classList.add("hidden");$("inventoryBtn").onclick=()=>modal("inventory");$("contractsBtn").onclick=()=>modal("contracts");$("employeesBtn")?.addEventListener("click",()=>modal("employees"));$("upgradesBtn").onclick=()=>modal("upgrades");$("recipesBtn").onclick=()=>modal("recipes");$("worldBtn").onclick=()=>modal("world");$("restaurantBtn").onclick=()=>modal("restaurant");$("cookBtn").onclick=cook;$("serveBtn")?.addEventListener("click",serveSelected);
function hireEmployee(role){
  S.employees=S.employees||{};
  if(S.employees[role]) return toast("Ese empleado ya está contratado");
  const costs={cook:1500,waiter:1800,cleaner:1200}, cost=costs[role]||1500;
  if(S.cash<cost) return toast("Necesitas $"+cost);
  S.cash-=cost; S.employees[role]={level:1}; save(); toast("👥 Empleado contratado");
}
function travelCity(index){const cities=[["newyork","🇺🇸 Nueva York",1,0x9eb7c4],["tokyo","🇯🇵 Tokio",10,0x687b91],["paris","🇫🇷 París",20,0xb9a58f],["china","🇨🇳 China",30,0xc98f72],["argentina","🇦🇷 Argentina",40,0x86a9b8]];const city=cities[index];if(!city)return;if(S.restaurantLevel<city[2])return toast("🔒 Necesitas Restaurante nivel "+city[2]);S.city=city[0];scene.background=new THREE.Color(city[3]);scene.fog.color=new THREE.Color(city[3]);toast("🌎 "+city[1]);save();modal("world")}
function expandRestaurant(){const current=S.expansion||0;if(current>=4)return toast("🏪 Expansión máxima alcanzada");const cost=2500*(current+1);if(S.cash<cost)return toast("Necesitas $"+cost.toLocaleString());S.cash-=cost;S.expansion=current+1;save();toast("🏗️ Restaurante expandido");setTimeout(()=>location.reload(),500)}
function upgradeEmployee(role){
  const e=S.employees?.[role];
  if(!e) return hireEmployee(role);
  const cost=1000*e.level;
  if(S.cash<cost) return toast("Necesitas $"+cost);
  S.cash-=cost; e.level++; save(); toast("⭐ Empleado mejorado");
}
function contractTick(dt){const a=S.activeContract;if(!a)return;a.left-=dt;const complete=a.requirements?Object.entries(a.requirements).every(([id,n])=>(a.done?.[id]||0)>=n):a.done>=a.need;if(a.left<=0){if(complete){S.cash+=a.reward;S.completedContracts++;gainXP(Math.round(a.reward/80));toast("🏆 Contrato completado +$"+a.reward)}else{S.reputation=Math.max(0,S.reputation-10);toast("❌ Contrato fallido · reputación -10")}S.activeContract=null}}
function loop(now){if(!loop.last)loop.last=now;const dt=(now-loop.last)/1000;loop.last=now;S.orders.forEach(o=>o.left-=dt);const expired=S.orders.filter(o=>o.left<=0);if(expired.length){const cleanerLevel=S.employees?.cleaner?.level||0;const reputationLoss=Math.max(1,3-cleanerLevel);S.reputation=Math.max(0,S.reputation-expired.length*reputationLoss);S.orders=S.orders.filter(o=>o.left>0);if(!S.selectedOrder||!S.orders.some(o=>o.id===S.selectedOrder))S.selectedOrder=S.orders[0]?.id||null;expired.forEach((_,i)=>setTimeout(addOrder,700+i*300));toast("😠 Cliente se fue · reputación -"+expired.length*reputationLoss);syncCustomers()}contractTick(dt);renderOrders();update();renderer.render(scene,camera);customerMeshes.forEach(g=>{g.position.y=g.userData.baseY+Math.sin(now*.002+g.userData.phase)*.025});requestAnimationFrame(loop)}


// --- POLISH SYSTEMS: tutorial, achievements, audio, offline reward ---
const WC={
  audio:null,
  beep(freq=520,duration=.07,type="sine"){
    try{
      if(!this.audio)this.audio=new (window.AudioContext||window.webkitAudioContext)();
      const o=this.audio.createOscillator(),g=this.audio.createGain();
      o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.045,this.audio.currentTime);
      g.gain.exponentialRampToValueAtTime(.001,this.audio.currentTime+duration);
      o.connect(g);g.connect(this.audio.destination);o.start();o.stop(this.audio.currentTime+duration);
    }catch{}
  },
  achievements:{
    first_order:["🍽️ Primera orden",s=>s.totalOrders>=1],
    ten_orders:["🔥 En racha",s=>s.totalOrders>=10],
    vip:["💎 Cliente VIP",s=>s.totalOrders>=1],
    rich:["💰 Primeros $5,000",s=>s.cash>=5000],
    contract:["📋 Contratista",s=>s.completedContracts>=1],
    world:["🌎 Viajero",s=>s.level>=11]
  }
};
S.achievements=S.achievements||{};
function checkAchievements(){
  for(const [id,[name,test]] of Object.entries(WC.achievements)){
    if(!S.achievements[id]&&test(S)){S.achievements[id]=Date.now();toast("🏆 "+name);WC.beep(880,.12,"triangle")}
  }
}
const _gainXP=gainXP;
gainXP=function(n){_gainXP(n);checkAchievements();};
const _serve=serve;
serve=function(o){_serve(o);WC.beep(o.vip?880:660,.09,"triangle");checkAchievements();};

function showTutorial(){
  if(S.tutorialDone)return;
  const steps=[
    ["👋 Bienvenido a WorldChef3D","Selecciona una orden de cliente arriba."],
    ["🔥 Cocina","Pulsa COCINAR para preparar el plato seleccionado."],
    ["🍽️ Sirve","Cuando esté listo, pulsa SERVIR ORDEN SELECCIONADA."],
    ["📦 Administra","Compra ingredientes y mejora estaciones desde los botones."],
    ["📋 Crece","Completa contratos y sube el nivel de tu restaurante."]
  ];
  let n=0;
  const el=document.createElement("div");el.id="tutorial";
  const render=()=>{const [a,b]=steps[n];el.innerHTML="<div class='tutorial-card'><div class='tutorial-step'>"+(n+1)+" / "+steps.length+"</div><h2>"+a+"</h2><p>"+b+"</p><button id='tutorialNext'>"+(n===steps.length-1?"EMPEZAR":"SIGUIENTE")+"</button></div>";el.querySelector("button").onclick=()=>{WC.beep(620);if(n===steps.length-1){S.tutorialDone=true;save();el.remove()}else{n++;render()}}};
  document.body.appendChild(el);render();
}
function applyOfflineProgress(){const now=Date.now(),last=Number(S.lastSeen||now),elapsed=Math.max(0,Math.min(4*3600,(now-last)/1000));if(elapsed<60){S.lastSeen=now;return}const cookLevel=S.employees?.cook?.level||0,waiterLevel=S.employees?.waiter?.level||0;if(!cookLevel&&!waiterLevel){S.lastSeen=now;return;}const cycles=Math.floor(elapsed/30),earnings=cycles*(35+cookLevel*12+waiterLevel*15);if(earnings>0){S.cash+=earnings;S.lastSeen=now;setTimeout(()=>toast("🌙 Mientras estabas fuera +$"+earnings),700);save()}}
window.addEventListener("pagehide",()=>{S.lastSeen=Date.now();save()});
document.addEventListener("pointerdown",()=>WC.beep(420,.025),{once:true});
setInterval(save,5000);\napplyOfflineProgress();\nsetTimeout(showTutorial,500);

addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
if(!S.orders.length){addOrder();setTimeout(addOrder,2500);setTimeout(addOrder,5000)}else{S.selectedOrder=S.orders.some(o=>o.id===S.selectedOrder)?S.selectedOrder:S.orders[0].id;renderOrders();syncCustomers()}update();requestAnimationFrame(loop);