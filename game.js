const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d');
const names=['idle','walk','run','jump','crouch','fall','getup','attack','doublejump'];
const sprites={};
for(const name of names){sprites[name]=[];let count={idle:5,walk:5,run:4,jump:5,crouch:4,fall:5,getup:5,attack:3,doublejump:1}[name];
 for(let i=1;i<=count;i++){const im=new Image();im.src=`./assets/sprites/${name}_${i}.png`;sprites[name].push(im)}}
const keys={};addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if([' ','arrowleft','arrowright','arrowup','arrowdown'].includes(e.key.toLowerCase()))e.preventDefault();if(e.key.toLowerCase()==='r')reset()});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
const platforms=[{x:0,y:470,w:650,h:90},{x:740,y:470,w:500,h:90},{x:1320,y:470,w:1080,h:90},
{x:260,y:370,w:120,h:24},{x:470,y:310,w:120,h:24},{x:850,y:370,w:150,h:24},{x:1120,y:320,w:120,h:24},{x:1510,y:370,w:160,h:24},{x:1850,y:320,w:180,h:24}];
let p,camera=0,prev=0;
function reset(){p={x:80,y:350,vx:0,vy:0,w:48,h:88,ground:false,face:1,anim:'idle',frame:0,animTime:0,jumps:0,attack:0};camera=0}reset();
function hit(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function update(dt){
 const left=keys.arrowleft||keys.a,right=keys.arrowright||keys.d,down=keys.arrowdown||keys.s,run=keys.shift;
 const speed=run?330:220;p.vx=left===right?0:(right?speed:-speed);if(p.vx)p.face=Math.sign(p.vx);
 if((keys[' ']||keys.z||keys.arrowup)&&!p.jumpHeld){if(p.ground){p.vy=-620;p.ground=false;p.jumps=1}else if(p.jumps===1){p.vy=-560;p.jumps=2;p.anim='doublejump'}p.jumpHeld=true}
 if(!(keys[' ']||keys.z||keys.arrowup))p.jumpHeld=false;
 if(keys.j&&p.attack<=0)p.attack=.35;if(p.attack>0)p.attack-=dt;
 p.x+=p.vx*dt;for(const t of platforms)if(hit(p,t)){if(p.vx>0)p.x=t.x-p.w;if(p.vx<0)p.x=t.x+t.w}
 const old=p.y;p.vy+=1650*dt;p.y+=p.vy*dt;p.ground=false;
 for(const t of platforms)if(hit(p,t)){if(p.vy>=0&&old+p.h<=t.y+10){p.y=t.y-p.h;p.vy=0;p.ground=true;p.jumps=0}else if(p.vy<0){p.y=t.y+t.h;p.vy=0}}
 p.x=Math.max(0,p.x);if(p.y>800)reset();
 let anim='idle';if(p.attack>0)anim='attack';else if(down&&p.ground)anim='crouch';else if(!p.ground)anim=p.vy<0?'jump':'fall';else if(Math.abs(p.vx)>0)anim=run?'run':'walk';
 if(p.anim!==anim){p.anim=anim;p.frame=0;p.animTime=0}
 p.animTime+=dt;const fps=anim==='idle'?5:anim==='attack'?12:10;if(p.animTime>1/fps){p.animTime=0;p.frame=(p.frame+1)%sprites[anim].length}
 camera=Math.max(0,Math.min(p.x-330,2400-canvas.width));
}
function draw(){
 ctx.clearRect(0,0,960,540);ctx.fillStyle='#83d5ff';ctx.fillRect(0,0,960,540);
 ctx.fillStyle='#ffffffaa';for(let i=0;i<5;i++){let x=((i*260-camera*.22)%1150+1150)%1150-80;ctx.beginPath();ctx.arc(x,100,24,0,7);ctx.arc(x+28,91,30,0,7);ctx.arc(x+58,103,22,0,7);ctx.fill()}
 for(const t of platforms){let x=t.x-camera;ctx.fillStyle='#8c5735';ctx.fillRect(x,t.y,t.w,t.h);ctx.fillStyle='#54b84b';ctx.fillRect(x,t.y,t.w,12);ctx.fillStyle='#68432f';for(let bx=x+12;bx<x+t.w-8;bx+=32)ctx.fillRect(bx,t.y+22,3,3)}
 const arr=sprites[p.anim]||sprites.idle,im=arr[p.frame%arr.length];if(im?.complete&&im.naturalWidth){const scale=.67,w=im.naturalWidth*scale,h=im.naturalHeight*scale;ctx.save();if(p.face<0){ctx.translate(p.x-camera+p.w,0);ctx.scale(-1,1);ctx.drawImage(im,-(w-p.w)/2,p.y+p.h-h,w,h)}else ctx.drawImage(im,p.x-camera-(w-p.w)/2,p.y+p.h-h,w,h);ctx.restore()}
 ctx.fillStyle='#102b43';ctx.font='bold 18px system-ui';ctx.fillText('MUNDO 1-1',18,30);
}
function loop(t){let dt=Math.min((t-prev)/1000||0,.033);prev=t;update(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop);
