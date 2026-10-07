import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.181.2/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.181.2/examples/jsm/controls/OrbitControls.js";

var $ = function(id){ return document.getElementById(id); };
var S = {
  level:1, xp:0, xpGoal:120, cash:500, gems:10, reputation:100,
  grill:1, recipe:1, cooking:false, nextId:1,
  inv:{bread:20, meat:20, cheese:20, lettuce:20, tomato:20},
  orders:[]
};

var scene = new THREE.Scene();
scene.background = new THREE.Color(0x9eb7c4);
scene.fog = new THREE.Fog(0x9eb7c4, 13, 30);
var camera = new THREE.PerspectiveCamera(48, innerWidth/innerHeight, .1, 100);
camera.position.set(8,8,10);
var renderer = new THREE.WebGLRenderer({canvas:$("game"),antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;

var controls = new OrbitControls(camera,renderer.domElement);
controls.enablePan=false; controls.minDistance=8; controls.maxDistance=16;
controls.minPolarAngle=.7; controls.maxPolarAngle=1.25;
controls.target.set(0,1,0);

scene.add(new THREE.HemisphereLight(0xffffff,0x405060,2));
var sun = new THREE.DirectionalLight(0xffffff,3);
sun.position.set(4,10,5); sun.castShadow=true; scene.add(sun);

function box(w,h,d,color,x,y,z){
  var m=new THREE.MeshStandardMaterial({color:color,roughness:.75});
  var o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
  o.position.set(x,y,z); o.castShadow=true; o.receiveShadow=true; scene.add(o); return o;
}
function cyl(r,h,color,x,y,z){
  var m=new THREE.MeshStandardMaterial({color:color,roughness:.7});
  var o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,24),m);
  o.position.set(x,y,z); o.castShadow=true; scene.add(o); return o;
}
function sprite(text,color,size){
  var c=document.createElement("canvas"); c.width=512;c.height=128;
  var ctx=c.getContext("2d");ctx.font="bold "+size+"px Arial";ctx.fillStyle=color;
  ctx.textAlign="center";ctx.fillText(text,256,78);
  var t=new THREE.CanvasTexture(c);
  var s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true}));
  s.scale.set(3.2,.8,1); return s;
}

box(14,.25,12,0x3b424b,0,-.15,0);
box(14,4,.25,0x22272f,0,2,-5.8);
box(.25,4,12,0x252a32,-7,2,0);
box(.25,4,12,0x252a32,7,2,0);
box(5,.25,2.2,0x8b6b45,-3,1.6,-1.6);
box(2.8,.25,2.2,0x8b6b45,3,1.6,-1.6);
for(var i=0;i<4;i++){ var x=-5+i*3.3; box(2.7,1,1,0x15181d,x,.5,-4.3); for(var j=0;j<2;j++) cyl(.27,.35,0x5c626a,x-.65+j*1.3,1.18,-4.3); }
box(2.7,1.2,1.5,0x1b2027,-3,2.2,1.8);
box(2.2,1.2,1.5,0x292e36,3,2.2,1.8);
for(var k=0;k<3;k++){ var xx=-4+k*4; box(.7,.9,.7,0x9b673e,xx,.45,3); cyl(.65,.12,0x6d4c35,xx,.95,2.7); }
var sign=sprite("WORLD CHEF","#ffffff",58);sign.position.set(0,3.8,-5.55);scene.add(sign);

function addOrder(){
  var vip=Math.random()<.08;
  S.orders.push({id:S.nextId++,vip:vip,time:vip?35:42,left:vip?35:42,
    reward:vip?90:45});
  renderOrders();
}
function renderOrders(){
  $("orders").innerHTML=S.orders.map(function(o){
    var scale=Math.max(0,o.left/o.time);
    return '<div class="order '+(o.vip?"vip":"")+'"><div class="order-head"><span>'+(o.vip?"💎 VIP":"🧑 Cliente")+'</span><span>#'+o.id+'</span></div><div class="order-items">'+(o.vip?"🥩 Steak premium + 🍟 Papas":"🍔 Hamburguesa + 🍟 Papas")+'</div><div class="timer"><span style="transform:scaleX('+scale+')"></span></div><div class="order-reward"><span>'+(o.vip?"2× ":"")+'🪙 $'+o.reward+'</span><span>'+Math.ceil(o.left)+'s</span></div></div>';
  }).join("");
}
function toast(t){
  var e=$("toast");e.textContent=t;e.classList.add("show");
  clearTimeout(toast.timer);toast.timer=setTimeout(function(){e.classList.remove("show")},1800);
}
function update(){
  $("level").textContent=S.level;$("cash").textContent="$"+S.cash.toLocaleString();$("gems").textContent=S.gems;
  $("xpBar").style.width=Math.min(100,S.xp/S.xpGoal*100)+"%";
  $("xpText").textContent=S.xp+" / "+S.xpGoal+" XP";
  var time=Math.max(4,10-(S.grill-1)*.7);
  $("cookTime").textContent=Math.ceil(time)+"s";
  $("stationInfo").textContent="Nivel "+S.grill+" · "+S.grill+" plato";
  $("ingredients").innerHTML=[
    ["🍞","Pan",S.inv.bread],["🥩","Carne",S.inv.meat],["🧀","Queso",S.inv.cheese],
    ["🥬","Lechuga",S.inv.lettuce],["🍅","Tomate",S.inv.tomato]
  ].map(function(x){return '<div class="ingredient">'+x[0]+'<small>'+x[1]+' '+x[2]+'</small></div>';}).join("");
}
function xp(n){
  S.xp+=n;
  while(S.xp>=S.xpGoal){S.xp-=S.xpGoal;S.level++;S.xpGoal=Math.floor(S.xpGoal*1.55);toast("⭐ Nivel "+S.level+" desbloqueado");}
  update();
}
function cook(){
  if(S.cooking)return;
  var keys=["bread","meat","cheese","lettuce","tomato"];
  for(var i=0;i<keys.length;i++) if(S.inv[keys[i]]<=0){toast("⚠️ Falta "+keys[i]);return;}
  keys.forEach(function(k){S.inv[k]--;});
  S.cooking=true;$("cookBtn").disabled=true;
  var duration=Math.max(4,10-(S.grill-1)*.7), start=performance.now();
  function tick(now){
    var left=duration-(now-start)/1000;
    if(left<=0){finishCook();return;}
    $("cookBtn").innerHTML="🔥 COCINANDO "+Math.ceil(left)+"s";
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
function finishCook(){
  S.cooking=false;$("cookBtn").disabled=false;
  $("cookBtn").innerHTML='COCINAR HAMBURGUESA <span id="cookTime"></span>';
  var o=S.orders[0];
  if(o){
    S.cash+=o.reward;xp(o.vip?24:12);
    S.orders.shift();toast(o.vip?"💎 VIP satisfecho · 2× recompensa":"🍔 Orden entregada +$"+o.reward);
    setTimeout(addOrder,2500);
  } else toast("🍔 Hamburguesa lista");
  update();renderOrders();
}
function modal(kind){
  $("modal").classList.remove("hidden");var html="";
  if(kind==="inventory"){
    html="<h2>📦 Inventario</h2><p>Compra ingredientes para no detener la cocina.</p><div class='list'>";
    var names={bread:"🍞 Pan",meat:"🥩 Carne",cheese:"🧀 Queso",lettuce:"🥬 Lechuga",tomato:"🍅 Tomate"};
    Object.keys(names).forEach(function(k){html+='<div class="list-row"><div class="main"><b>'+names[k]+'</b><small>'+S.inv[k]+' unidades</small></div><button class="mini-btn green" data-buy="'+k+'">Comprar $50</button></div>';});
    html+="</div>";
  } else if(kind==="upgrades"){
    var cost=250+S.grill*350;
    html="<h2>🔧 Mejoras de cocina</h2><p>Las mejoras aumentan la capacidad y reducen tiempos.</p><div class='list'>";
    html+='<div class="list-row"><div class="main"><b>🔥 Parrilla</b><small>Nivel '+S.grill+' → '+(S.grill+1)+'</small></div><button class="mini-btn green" data-upgrade="grill">$'+cost.toLocaleString()+'</button></div>';
    html+='<div class="list-row"><div class="main"><b>🧊 Nevera</b><small>Próximamente: capacidad de inventario</small></div><button class="mini-btn">PRONTO</button></div>';
    html+='<div class="list-row"><div class="main"><b>🧼 Lavaplatos</b><small>Próximamente: velocidad de limpieza</small></div><button class="mini-btn">PRONTO</button></div></div>';
  } else if(kind==="contracts"){
    html="<h2>📋 Contratos especiales</h2><p>No todos los contratos son buena idea: tu capacidad limita el riesgo.</p><div class='list'>";
    var cs=[["🎂 Fiesta de cumpleaños","50 hamburguesas · 30 papas","$4,500"],["🏢 Evento corporativo","100 almuerzos · 100 bebidas","$9,000"],["👽 Clientes extraterrestres","100 sodas · 50 hamburguesas","$35,000"]];
    cs.forEach(function(c,i){html+='<div class="list-row"><div class="main"><b>'+c[0]+'</b><small>'+c[1]+' · ⏱️ '+(i===0?8:i===1?12:15)+" min</small></div><button class='mini-btn green' data-contract='"+i+"'>"+c[2]+"</button></div>";});
    html+="</div>";
  } else if(kind==="recipes"){
    html="<h2>📖 Recetas</h2><p>Las recetas suben de valor, pero requieren niveles y objetivos.</p><div class='list'>";
    html+='<div class="list-row"><div class="main"><b>🍔 Hamburguesa Clásica</b><small>⭐ Nivel '+S.recipe+' · Valor base $45</small></div><button class="mini-btn green" data-recipe="burger">Mejorar $1,200</button></div>';
    html+='<div class="list-row locked"><div class="main"><b>🍕 Pizza Pepperoni</b><small>Desbloquea al nivel 5</small></div><button class="mini-btn">🔒</button></div>';
    html+='<div class="list-row locked"><div class="main"><b>🍣 Sushi</b><small>Desbloquea en Tokio</small></div><button class="mini-btn">🔒</button></div></div>';
  } else if(kind==="world"){
    html="<h2>🌎 Mapa del mundo</h2><div class='list'>";
    var cities=[["🇺🇸 New York","Nivel 1–10","green"],["🇯🇵 Tokio","Nivel 11–20","locked"],["🇫🇷 París","Nivel 21–30","locked"],["🇨🇳 China","Nivel 31–40","locked"],["🇦🇷 Argentina","Nivel 41–50","locked"]];
    cities.forEach(function(c){html+='<div class="list-row '+c[2]+'"><div class="main"><b>'+c[0]+'</b><small>'+c[1]+'</small></div><button class="mini-btn">'+(c[2]==="green"?"ENTRAR":"🔒")+"</button></div>";});
    html+="</div>";
  } else {
    html="<h2>🏪 Tu restaurante</h2><p>Reputación: ⭐ "+S.reputation+"% · Capacidad actual: 4 clientes</p><div class='list'><div class='list-row'><div class='main'><b>Progresión</b><small>Sube de nivel completando objetivos, no por repetir una sola orden.</small></div></div><div class='list-row'><div class='main'><b>Marketing</b><small>Las promociones atraerán más clientes cuando estén desbloqueadas.</small></div></div></div>";
  }
  $("modalContent").innerHTML=html;
  $("modalContent").querySelectorAll("[data-buy]").forEach(function(b){b.onclick=function(){if(S.cash<50){toast("No tienes suficiente dinero");return;}S.cash-=50;S.inv[b.dataset.buy]+=10;update();modal("inventory");};});
  $("modalContent").querySelectorAll("[data-upgrade]").forEach(function(b){b.onclick=function(){var c=250+S.grill*350;if(S.cash<c){toast("Necesitas $"+c);return;}S.cash-=c;S.grill++;toast("🔥 Parrilla mejorada");update();modal("upgrades");};});
  $("modalContent").querySelectorAll("[data-contract]").forEach(function(b){b.onclick=function(){var i=Number(b.dataset.contract);toast(i===2?"👽 Contrato alienígena aceptado":"📋 Contrato aceptado");if(i===2){S.cash+=35000;xp(120);}else{S.cash+=i===0?4500:9000;xp(i===0?35:55);}update();$("modal").classList.add("hidden");};});
  $("modalContent").querySelectorAll("[data-recipe]").forEach(function(b){b.onclick=function(){if(S.level<3){toast("🔒 Necesitas nivel 3");return;}if(S.cash<1200){toast("Necesitas $1,200");return;}S.cash-=1200;S.recipe++;toast("📖 Receta mejorada");update();modal("recipes");};});
}
$("closeModal").onclick=function(){$("modal").classList.add("hidden");};
$("inventoryBtn").onclick=function(){modal("inventory")};
$("contractsBtn").onclick=function(){modal("contracts")};
$("upgradesBtn").onclick=function(){modal("upgrades")};
$("recipesBtn").onclick=function(){modal("recipes")};
$("worldBtn").onclick=function(){modal("world")};
$("restaurantBtn").onclick=function(){modal("restaurant")};
$("cookBtn").onclick=cook;

function loop(now){
  if(!loop.last)loop.last=now;
  var dt=(now-loop.last)/1000;loop.last=now;
  S.orders.forEach(function(o){o.left-=dt;});
  var expired=S.orders.filter(function(o){return o.left<=0;});
  if(expired.length){
    S.reputation=Math.max(0,S.reputation-expired.length*3);
    S.orders=S.orders.filter(function(o){return o.left>0;});
    toast("😠 Cliente se fue · reputación -"+expired.length*3);
  }
  renderOrders();update();renderer.render(scene,camera);requestAnimationFrame(loop);
}
addEventListener("resize",function(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
addOrder();setTimeout(addOrder,3000);setTimeout(addOrder,7000);update();requestAnimationFrame(loop);
