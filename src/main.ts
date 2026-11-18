import {surface,panel,label,rect,type Frame} from "@shared/surface";
import {loadValues} from "@shared/settings";
let maximum=100,entries:string[]=[],color="#6AE6A4FF",address="",error="",result="",rolling=false,step=0,digits="",numbers="",chosen=0,fetching=false,closed=false;
let timer:ReturnType<typeof setTimeout>|undefined;
function draw():Frame{
 const cap=rolling?"PICKING":result?"SELECTED":"DRAW 1-"+maximum;
 const f:Frame=[label("cap",cap,1,0,color,"front","tiny"),label("num",rolling?digits:result||error||"Click to draw",1,7,result?color:"#FFF2D9FF")];
 if(step>=12&&step<16)for(let i=0;i<4;i++)f.push(rect("spark"+i,57+i*3,2+(i+step)%7,2,2,color));
 return [...f,...panel("TUMBLER DRAW",[error||"Pool: "+maximum,entries.length?"List of names":"Inclusive number range","Click: draw","Start: refresh pool",result?"Last: "+result:"Ready"])];
}
async function sync(){if(!address||fetching||rolling)return;fetching=true;error="Loading";refresh();
 try{const r=await fetch(address);if(!r.ok)throw Error("Offline");const j=await r.json() as {maximum:number;entries:string[]};
 if(!Number.isInteger(j.maximum)||j.maximum<1||j.maximum>9999999||!Array.isArray(j.entries)||(j.entries.length!==0&&j.entries.length!==j.maximum))throw Error("Invalid pool");
 maximum=j.maximum;entries=j.entries;error="";result="";}catch{error="No pool";}finally{fetching=false;if(!closed)refresh();}}
function spin(){if(rolling||fetching||error)return;rolling=true;step=0;chosen=1+Math.floor(Math.random()*maximum);numbers=String(chosen).padStart(String(maximum).length,"0");
 function tick(){timer=undefined;step++;const fixed=Math.floor(step*numbers.length/12);digits=numbers.slice(0,fixed);
 while(digits.length<numbers.length)digits+=Math.floor(Math.random()*10);
 if(step===12){rolling=false;result=entries[chosen-1]||String(chosen);}refresh();
 if(step<16)timer=setTimeout(tick,45+step*4);}
 if(timer!==undefined)clearTimeout(timer);tick();}
const refresh=surface(draw,k=>{if(k==="ok")spin();if(k==="start")void sync();},()=>{closed=true;if(timer!==undefined)clearTimeout(timer);},{enabled:false});
void loadValues().then(v=>{entries=String(v?.entries||"").split("|").map(s=>s.trim()).filter(Boolean);maximum=entries.length||Number(v?.maximum||100);
 if(!Number.isInteger(maximum)||maximum<1||maximum>9999999)error="Invalid range";
 const col=String(v?.color||"");if(/^#[0-9a-f]{6}$/i.test(col))color=col+"FF";address=String(v?.bridge||"").trim();if(address&&!closed)void sync();refresh();});
