import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.181.2/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.181.2/examples/jsm/controls/OrbitControls.js";

const $=id=>document.getElementById(id);
const KEY="worldchef3d-save-v3";

const RECIPES={
 burger:{name:"Hamburguesa Clásica",icon:"🍔",station:"grill",time:7,base:45,xp:12,req:{bread:1,meat:1,cheese:1,lettuce:1,tomato:1}},
 fries:{name:"Papas Fritas",icon:"🍟",station:"fryer",time:5,base:28,xp:8,req:{potato:2}},
 pizza:{name:"Pizza Pepperoni",icon:"🍕",station:"oven",time:11,base:85,xp:20,req:{dough:1,cheese:2,pepperoni:1,tomato:1}},
 sushi:{name:"Sushi Deluxe",icon:"🍣",station:"prep",time:14,base:130,xp:28,req:{rice:2,fish:1,seaweed:1}},
 steak:{name:"Steak Premium",icon:"🥩",station:"grill",time:12,base:150,xp:30,req:{meat:2}},
 soda:{name:"Soda",icon:"🥤",station:"drinks",time:2,base:18,xp:4,req:{syrup:1}}
};
const STATIONS=[
 ["grill","🔥","Parrilla",1,350],["fryer","🍟","Freidora",2,600],["oven","🍕","Horno",3,1000],
 ["prep","🔪","Preparación",5,1800],["drinks","🥤","Bebidas",2,750],["fridge","🧊","Nevera",1,900],["dish","🧼","Lavaplatos",2,1100]
];
const INITIAL_INV={bread:20,meat:20,cheese:20,lettuce:20,tomato:20,potato:30,dough:10,pepperoni:10,rice:20,fish:10,seaweed:10,syrup:20};

function fresh(){
 return {level:1,xp:0,xpGoal:100,cash:500,gems:10,reputation:100,totalOrders:0,
  restaurantLevel:1,recipeLevels:{burger:1},stations:{grill:1},inv:{...INITIAL_INV},
  orders:[],activeContract:null,marketing:0,completedContracts:0};
}
let S=load();
function load(){try{return Object.assign(fresh(),JSON.parse(localStorage.getItem(KEY)||"null")||{});}catch{return fresh();}}
function save(){localStorage.setItem(KEY,JSON.stringify(S));}

const scene=new THREE.Scene(); scene.background=new THREE.Color(0x9eb7c4); scene.fog=new THREE.Fog(0x9eb7c4,13,30);
const camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.1,100);camera.position.set(8,8,10);
const renderer=new THREE.WebGLRenderer({canvas:$("game"),antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;
const controls=new OrbitControls(camera,renderer.domElement);controls.enablePan=false;controls.minDistance=8;controls.maxDistance=16;controls.minPolarAngle=.7;controls.maxPolarAngle=1.25;controls.target.set(0,1,0);
scene.add(new THREE.HemisphereLight(0xffffff,0x405060,2));const sun=new THREE.DirectionalLight(0xffffff,3);sun.position.set(4,10,5);sun.castShadow=true;scene.add(sun);
function box(w,h,d,c,x,y,z){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color:c,roughness:.75}));o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;scene.add(o);return o}
function cyl(r,h,c,x,y,z){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,20),new THREE.MeshStandardMaterial({color:c,roughness:.7}));o.position.set(x,y,z);o.castShadow=true;scene.add(o);return o}
function label(t,c="#fff"){const cv=document.createElement("canvas");cv.width=512;cv.height=128;const x=cv.getContext("2d");x.font="bold 58px Arial";x.fillStyle=c;x.textAlign="center";x.fillText(t,256,78);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),transparent:true}));s.scale.set(3.2,.8,1);return s}
box(14,.25,12,0x3b424b,0,-.15,0);box(14,4,.25,0x22272f,0,2,-5.8);box(.25,4,12,0x252a32,-7,2,0);box(.25,4,12,0x252a32,7,2,0);
box(5,.25,2.2,0x8b6b45,-3,1.6,-1.6);box(2.8,.25,2.2,0x8b6b45,3,1.6,-1.6);
for(let i=0;i<4;i++){let x=-5+i*3.3;box(2.7,1,1,0x15181d,x,.5,-4.3);for(let j=0;j<2;j++)cyl(.27,.35,0x5c626a,x-.65+j*1.3,1.18,-4.3)}
box(2.7,1.2,1.5,0x1b2027,-3,2.2,1.8);box(2.2,1.2,1.5,0x292e36,3,2.2,1.8);
for(let k=0;k<3;k++){let x=-4+k*4;box(.7,.9,.7,0x9b673e,x,.45,3);cyl(.65,.12,0x6d4c35,x,.95,2.7)}
const sign=label("WORLD CHEF");sign.position.set(0,3.8,-5.55);scene.add(sign);

function stationLevel(k){return S.stations[k]||0}
function unlocked(id){const r=RECIPES[id];return stationLevel(r.station)>0}
function recipeValue(id){const r=RECIPES[id],lv=S.recipeLevels[id]||1;return Math.round(r.base*(1+(lv-1)*.2))}
function ingredientsOk(id){return Object.entries(RECIPES[id].req).every(([k,v])=>(S.inv[k]||0)>=v)}
function consume(id){Object.entries(RECIPES[id].req).forEach(([k,v])=>S.inv[k]-=v)}
function addOrder(){
 const pool=Object.keys(RECIPES).filter(id=>unlocked(id));
 const id=pool[Math.floor(Math.random()*pool.length)]||"burger";
 const vip=Math.random()<.07;
 const r=RECIPES[id];
 S.orders.push({id:crypto.randomUUID(),recipe:id,vip,time:(vip?48:55)+Math.random()*12,left:(vip?48:55)+Math.random()*12,reward:Math.round(recipeValue(id)*(vip?2:1))});
 renderOrders();
}
function renderOrders(){
 $("orders").innerHTML=S.orders.map(o=>{const r=RECIPES[o.recipe],p=Math.max(0,o.left/o.time);return '<div class="order '+(o.vip?"vip":"")+'"><div class="order-head"><span>'+(o.vip?"💎 VIP":"🧑 Cliente")+'</span><span>'+r.icon+' '+r.name+'</span></div><div class="order-items">'+Object.entries(r.req).map(([k,v])=>v+"× "+k).join(" · ")+'</div><div class="timer"><span style="transform:scaleX('+p+')"></span></div><div class="order-reward"><span>'+(o.vip?"2× ":"")+"🪙 $"+o.reward+'</span><span>'+Math.ceil(o.left)+"s</span></div></div>"}).join("");
}
function toast(t){const e=$("toast");e.textContent=t;e.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove("show"),1900)}
function update(){
 $("level").textContent=S.level;$("cash").textContent="$"+S.cash.toLocaleString();$("gems").textContent=S.gems;
 $("xpBar").style.width=Math.min(100,S.xp/S.xpGoal*100)+"%";$("xpText").textContent=S.xp+" / "+S.xpGoal+" XP";
 $("rep").textContent=S.reputation+"%";
 const active=Object.keys(RECIPES).find(k=>unlocked(k))||"burger",r=RECIPES[active],lv=stationLevel(r.station);
 $("stationName").textContent=(STATIONS.find(x=>x[0]===r.station)||["","","Parrilla"])[2];
 $("stationInfo").textContent="Nivel "+lv+" · "+Math.max(1,lv)+" plato";
 $("cookBtn").innerHTML="COCINAR "+r.icon+" "+r.name.toUpperCase()+' <span id="cookTime">'+r.time+"s</span>";
 $("ingredients").innerHTML=Object.entries(r.req).map(([k,v])=>'<div class="ingredient">'+k+'<small>'+v+" · "+(S.inv[k]||0)+" disponibles</small></div>").join("");
 $("restaurantLevel").textContent=S.restaurantLevel;
 save();
}
function gainXP(n){S.xp+=n;while(S.xp>=S.xpGoal){S.xp-=S.xpGoal;S.level++;S.xpGoal=Math.floor(S.xpGoal*1.45);toast("⭐ Nivel "+S.level+" desbloqueado");}checkRestaurant();update()}
function checkRestaurant(){const target=Math.floor(S.totalOrders/12)+1;if(target>S.restaurantLevel&&S.cash>=target*500&&S.reputation>=80){S.restaurantLevel=target;toast("🏪 Restaurante nivel "+target+"!");}}
let cooking=false;
function cook(){
 if(cooking)return;
 const id=Object.keys(RECIPES).find(k=>unlocked(k))||"burger",r=RECIPES[id];
 if(!ingredientsOk(id)){toast("⚠️ Faltan ingredientes para "+r.name);return}
 consume(id);cooking=true;$("cookBtn").disabled=true;let duration=Math.max(2,r.time-(stationLevel(r.station)-1)*.8),start=performance.now();
 function tick(now){let left=duration-(now-start)/1000;if(left<=0){finish(id);return}$("cookBtn").innerHTML="🔥 COCINANDO "+Math.ceil(left)+"s";requestAnimationFrame(tick)}requestAnimationFrame(tick);update()
}
function finish(id){
 cooking=false;$("cookBtn").disabled=false;const o=S.orders[0],r=RECIPES[id];
 if(o&&o.recipe===id){S.cash+=o.reward;S.totalOrders++;gainXP(r.xp*(o.vip?2:1));S.orders.shift();toast((o.vip?"💎 VIP satisfecho · ":"")+"Orden "+r.name+" +$"+o.reward);setTimeout(addOrder,1200)}
 else toast("🍽️ "+r.name+" lista. No había cliente para ella.");
 update();renderOrders();
}
function buyIngredient(k){
 const cost=25; if(S.cash<cost){toast("No tienes suficiente dinero");return}S.cash-=cost;S.inv[k]=(S.inv[k]||0)+10;update();modal("inventory")
}
function modal(kind){
 $("modal").classList.remove("hidden");let html="";
 if(kind==="inventory"){html="<h2>📦 Inventario</h2><p>Compra lotes de 10. Los ingredientes se consumen al cocinar.</p><div class='list'>"+Object.entries(S.inv).map(([k,v])=>'<div class="list-row"><div class="main"><b>'+k+'</b><small>'+v+" unidades</small></div><button class='mini-btn green' data-buy='"+k+"'>$25 +10</button></div>").join("")+"</div>"}
 else if(kind==="upgrades"){html="<h2>🔧 Cocina</h2><p>Compra estaciones y súbelas de nivel para cocinar más rápido.</p><div class='list'>"+STATIONS.map(s=>{const [id,ic,n,req,cost]=s,lv=stationLevel(id),price=lv?Math.round(cost*(lv+1)):cost;return '<div class="list-row '+(!lv&&S.level<req?"locked":"")+'"><div class="main"><b>'+ic+" "+n+'</b><small>'+(lv?"Nivel "+lv+" → "+(lv+1):"Desbloqueo nivel "+req)+"</small></div><button class='mini-btn green' data-st='"+id+"' "+(!lv&&S.level<req?"disabled":"")+'>'+price.toLocaleString()+"</button></div>"}).join("")+"</div>"}
 else if(kind==="recipes"){html="<h2>📖 Recetas</h2><div class='list'>"+Object.entries(RECIPES).map(([id,r])=>{const lv=S.recipeLevels[id]||0,locked=!unlocked(id);return '<div class="list-row '+(locked?"locked":"")+'"><div class="main"><b>'+r.icon+" "+r.name+'</b><small>'+(locked?"🔒 Requiere estación "+r.station:"Nivel "+lv+" · $"+recipeValue(id)+" por orden")+"</small></div><button class="mini-btn '+(!locked?"green":"")+'" data-rec="'+id+'">'+(locked?"🔒":lv>0?"MEJORAR $"+Math.round(500*lv):"DESBLOQUEAR")+"</button></div>"}).join("")+"</div>"}
 else if(kind==="contracts"){const active=S.activeContract;html="<h2>📋 Contratos</h2><p>Los contratos ahora requieren producción real. No entregan dinero al aceptarlos.</p>"+(active?'<div class="contract active"><b>📦 '+active.name+'</b><small>Progreso '+active.done+"/"+active.need+" · "+Math.ceil(active.left/60)+" min</small><div class='progress'><span style="width:"+(active.done/active.need*100)+"%"></span></div></div>':"<div class='list'>"+[["🎂 Cumpleaños",20,2500,1],["🏢 Corporativo",60,8500,3],["👽 Galáctico",200,35000,8]].map(c=>'<div class="list-row"><div class="main"><b>'+c[0]+'</b><small>'+c[1]+" platos · 10 min · Requiere restaurante "+c[3]+'</small></div><button class="mini-btn green" data-contract="'+c[1]+"|"+c[2]+"|"+c[3]+"|"+c[0]+'">ACEPTAR</button></div>').join("")+"</div>")}
 else if(kind==="world"){html="<h2>🌎 Mundo</h2><div class='list'>"+[["🇺🇸 Nueva York",1],["🇯🇵 Tokio",11],["🇫🇷 París",21],["🇨🇳 China",31],["🇦🇷 Argentina",41]].map(c=>'<div class="list-row '+(S.level>=c[1]?"":"locked")+'"><div class="main"><b>'+c[0]+'</b><small>'+(S.level>=c[1]?"Disponible":"Nivel "+c[1])+"</small></div><button class='mini-btn'>"+(S.level>=c[1]?"ENTRAR":"🔒")+"</button></div>").join("")+"</div>"}
 else {html="<h2>🏪 Restaurante</h2><p>Reputación: ⭐ "+S.reputation+"% · Restaurante nivel "+S.restaurantLevel+"</p><div class='list'><div class='list-row'><div class='main'><b>Pedidos completados</b><small>"+S.totalOrders+"</small></div></div><div class='list-row'><div class='main'><b>Marketing</b><small>Aumenta la llegada de clientes.</small></div><button class='mini-btn green' data-marketing='1'>$500</button></div><div class='list-row'><div class='main'><b>Guardar partida</b><small>Progreso guardado automáticamente en este dispositivo.</small></div></div><div class='list-row'><div class='main'><b>Reiniciar</b><small>Elimina todo el progreso.</small></div><button class='mini-btn' data-reset='1'>RESET</button></div></div>"}
 $("modalContent").innerHTML=html;
 $("modalContent").querySelectorAll("[data-buy]").forEach(b=>b.onclick=()=>buyIngredient(b.dataset.buy));
 $("modalContent").querySelectorAll("[data-st]").forEach(b=>b.onclick=()=>{const id=b.dataset.st,s=STATIONS.find(x=>x[0]===id),lv=stationLevel(id),price=lv?Math.round(s[4]*(lv+1)):s[4];if(S.cash<price){toast("Necesitas $"+price);return}if(!lv&&S.level<s[3]){toast("🔒 Necesitas nivel "+s[3]);return}S.cash-=price;S.stations[id]=(lv||0)+1;if(id==="grill"&&S.stations.grill===2)S.recipeLevels.burger=1;toast("🔧 "+s[2]+" mejorada");update();modal("upgrades")});
 $("modalContent").querySelectorAll("[data-rec]").forEach(b=>b.onclick=()=>{const id=b.dataset.rec,r=RECIPES[id];if(!unlocked(id)){toast("🔒 Primero desbloquea la estación");return}const lv=S.recipeLevels[id]||1,cost=500*lv;if(S.cash<cost){toast("Necesitas $"+cost);return}S.cash-=cost;S.recipeLevels[id]=lv+1;toast("📖 Receta mejorada");update();modal("recipes")});
 $("modalContent").querySelectorAll("[data-contract]").forEach(b=>b.onclick=()=>{if(S.activeContract){toast("Ya tienes un contrato activo");return}const [need,reward,req,name]=b.dataset.contract.split("|").map((v,i)=>i===0||i===1||i===2?Number(v):v);if(S.restaurantLevel<req){toast("🔒 Restaurante nivel "+req);return}S.activeContract={name,need,reward,done:0,left:600};toast("📋 Contrato aceptado: produce "+need+" platos");update();modal("contracts")});
 $("modalContent").querySelector("[data-marketing]")?.addEventListener("click",()=>{if(S.cash<500){toast("Necesitas $500");return}S.cash-=500;S.marketing++;toast("📣 Marketing activo");update();modal("restaurant")});
 $("modalContent").querySelector("[data-reset]")?.addEventListener("click",()=>{if(confirm("¿Borrar toda la partida?")){S=fresh();save();location.reload()}});
}
$("closeModal").onclick=()=>$("modal").classList.add("hidden");$("inventoryBtn").onclick=()=>modal("inventory");$("contractsBtn").onclick=()=>modal("contracts");$("upgradesBtn").onclick=()=>modal("upgrades");$("recipesBtn").onclick=()=>modal("recipes");$("worldBtn").onclick=()=>modal("world");$("restaurantBtn").onclick=()=>modal("restaurant");$("cookBtn").onclick=cook;
function contractTick(dt){if(!S.activeContract)return;S.activeContract.left-=dt;if(S.activeContract.left<=0){if(S.activeContract.done>=S.activeContract.need){S.cash+=S.activeContract.reward;gainXP(Math.round(S.activeContract.reward/80));S.completedContracts++;toast("🏆 Contrato completado +$"+S.activeContract.reward)}else{S.reputation=Math.max(0,S.reputation-10);toast("❌ Contrato fallido · reputación -10")}S.activeContract=null;modal("contracts")}}
function loop(now){if(!loop.last)loop.last=now;const dt=(now-loop.last)/1000;loop.last=now;S.orders.forEach(o=>o.left-=dt);const expired=S.orders.filter(o=>o.left<=0);if(expired.length){S.reputation=Math.max(0,S.reputation-expired.length*3);S.orders=S.orders.filter(o=>o.left>0);toast("😠 Cliente se fue · reputación -"+expired.length*3);for(let i=0;i<expired.length;i++)setTimeout(addOrder,700+i*300)}contractTick(dt);renderOrders();update();renderer.render(scene,camera);requestAnimationFrame(loop)}
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
if(!S.orders.length){addOrder();setTimeout(addOrder,2500);setTimeout(addOrder,5000)}else renderOrders();update();requestAnimationFrame(loop);
