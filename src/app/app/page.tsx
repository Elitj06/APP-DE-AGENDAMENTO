"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

// ── DATA ──────────────────────────────────────────────────────
const LEVELS = [
  {label:"Iniciante",min:0,max:24,emoji:"🌱",color:"#64748b"},
  {label:"Regular",min:25,max:49,emoji:"💪",color:"#3b82f6"},
  {label:"Dedicado",min:50,max:99,emoji:"⚡",color:"#10b981"},
  {label:"Expert",min:100,max:199,emoji:"🔥",color:"#f97316"},
  {label:"Elite",min:200,max:299,emoji:"💎",color:"#a855f7"},
  {label:"Lenda",min:300,max:Infinity,emoji:"👑",color:"#fbbf24"},
];

const TYPE_C: Record<string,string> = {
  "Musculação":"#f97316","Hiit":"#ef4444","Pilates":"#a855f7",
  "CrossFit":"#3b82f6","Cardio":"#10b981","Funcional":"#f59e0b",
  "Yoga":"#06b6d4","Avaliação":"#6366f1"
};
const TYPE_I: Record<string,string> = {
  "Musculação":"🏋️","Hiit":"⚡","Pilates":"🧘","CrossFit":"🔥",
  "Cardio":"🏃","Funcional":"💪","Yoga":"☯️","Avaliação":"📋"
};

const sub = (n:number) => { const d = new Date(); d.setDate(d.getDate()-n); return d; };
const SESSIONS = [
  {id:"s1",date:sub(0),type:"Musculação",trainer:"Lucas F.",duration:60,intensity:4,coins:1},
  {id:"s2",date:sub(2),type:"Hiit",trainer:"Ana B.",duration:45,intensity:5,coins:1},
  {id:"s3",date:sub(4),type:"Pilates",trainer:"Lucas F.",duration:60,intensity:3,coins:1},
  {id:"s4",date:sub(5),type:"Musculação",trainer:"Ana B.",duration:60,intensity:4,coins:1},
  {id:"s5",date:sub(7),type:"CrossFit",trainer:"Rafael C.",duration:45,intensity:5,coins:1},
  {id:"s6",date:sub(9),type:"Cardio",trainer:"Lucas F.",duration:60,intensity:2,coins:1},
  {id:"s7",date:sub(12),type:"Funcional",trainer:"Ana B.",duration:60,intensity:3,coins:1},
];

const GOALS = [
  {id:"g1",title:"50 check-ins",target:50,current:37,unit:"check-ins",reward:100,color:"#f97316",icon:"🎯"},
  {id:"g2",title:"Sequência 30 dias",target:30,current:14,unit:"dias",reward:150,color:"#ef4444",icon:"🔥"},
  {id:"g3",title:"200 GymCoins",target:200,current:86,unit:"coins",reward:50,color:"#fbbf24",icon:"🪙"},
  {id:"g4",title:"10 aulas Pilates",target:10,current:7,unit:"aulas",reward:80,color:"#a855f7",icon:"🧘"},
];

const RANKING_DATA = [
  {p:1,name:"Mariana S.",badge:"👑",pts:980,streak:21,isMe:false},
  {p:2,name:"Carlos M.",badge:"💎",pts:840,streak:14,isMe:false},
  {p:3,name:"Julia R.",badge:"🔥",pts:780,streak:11,isMe:false},
  {p:4,name:"Pedro A.",badge:"⚡",pts:620,streak:7,isMe:false},
  {p:5,name:"Ana L.",badge:"💪",pts:540,streak:5,isMe:false},
  {p:6,name:"Bruno C.",badge:"💪",pts:480,streak:4,isMe:false},
  {p:7,name:"Você",badge:"⚡",pts:420,streak:14,isMe:true},
  {p:8,name:"Fernanda P.",badge:"🌱",pts:380,streak:3,isMe:false},
];

const WA_MSGS = [
  {type:"lembrete",color:"#3b82f6",icon:"⏰",label:"Lembrete 24h",preview:"Seu treino é amanhã às 07h com Lucas F. Descanse bem! 💪",time:"Hoje 18:00"},
  {type:"aniversario",color:"#ec4899",icon:"🎂",label:"Aniversário",preview:"Feliz aniversário! Você ganhou 10 GymCoins de presente! 🎉",time:"Seu aniversário"},
  {type:"meta",color:"#10b981",icon:"📈",label:"Progresso de meta",preview:"74% da meta '50 check-ins'! Faltam apenas 13 — vai fundo! 💪",time:"Automático"},
  {type:"motiv",color:"#f97316",icon:"💥",label:"Motivacional",preview:"'Consistência bate intensidade.' Você está em 14 dias! 🔥",time:"Terças 08h"},
  {type:"coin",color:"#fbbf24",icon:"🪙",label:"Check-in confirmado",preview:"Check-in confirmado! +1 GymCoin. Saldo: 86 coins. Boa aula! ✅",time:"No check-in"},
];

const days7 = Array.from({length:7},(_,i) => {
  const d = sub(6-i);
  const hasSess = SESSIONS.some(s=>s.date.toDateString()===d.toDateString());
  return {d,hasSess};
});

function getLevelFor(coins:number) {
  return LEVELS.find(l=>coins>=l.min && coins<=l.max) || LEVELS[0];
}

function GoalRing({pct,color,size=52}:{pct:number,color:string,size?:number}) {
  const r=20,c=2*Math.PI*r;
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" style={{flexShrink:0}}>
      <circle cx={26} cy={26} r={r} fill="none" stroke="#1a2030" strokeWidth={5}/>
      <circle cx={26} cy={26} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${c*(pct/100)} ${c*(1-pct/100)}`} strokeLinecap="round"
        transform="rotate(-90 26 26)"/>
      <text x={26} y={30} textAnchor="middle" fontSize={10} fontWeight={800} fill="#e2e8f0" fontFamily="Syne,sans-serif">{pct}%</text>
    </svg>
  );
}

export default function AppPage() {
  const [tab, setTab] = useState<"score"|"historia"|"metas"|"whatsapp">("score");
  const [coinAnim, setCoinAnim] = useState(false);
  const coins = 86;
  const level = getLevelFor(coins);
  const streak = 14;

  return (
    <div style={{background:"#060a10",minHeight:"100vh",fontFamily:"'Epilogue',sans-serif",color:"#e2e8f0",paddingBottom:80}}>
      {/* HEADER */}
      <div style={{background:"rgba(6,10,16,.95)",borderBottom:"1px solid #0d1420",padding:"14px 16px 0",position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <Link href="/" style={{width:34,height:34,borderRadius:9,background:"linear-gradient(135deg,#f97316,#ea580c)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Syne,sans-serif",fontWeight:900,color:"#fff",fontSize:17,textDecoration:"none",boxShadow:"0 0 14px rgba(249,115,22,.4)"}}>G</Link>
            <div>
              <div style={{fontSize:10,color:"#374151",fontWeight:600,letterSpacing:".05em"}}>ALUNO</div>
              <div style={{fontSize:15,fontWeight:800,fontFamily:"Syne,sans-serif",letterSpacing:"-.02em"}}>Eliandro Tjader</div>
            </div>
          </div>
          {/* Coins */}
          <div onClick={()=>{setCoinAnim(true);setTimeout(()=>setCoinAnim(false),600)}}
            style={{display:"flex",alignItems:"center",gap:7,background:coinAnim?"rgba(251,191,36,.15)":"rgba(251,191,36,.07)",border:"1px solid rgba(251,191,36,.2)",borderRadius:999,padding:"7px 13px",cursor:"pointer",transition:"all .3s"}}>
            <span style={{fontSize:16}}>🪙</span>
            <span style={{fontWeight:900,fontSize:15,color:"#fbbf24",fontFamily:"Syne,sans-serif"}}>{coins}</span>
            <span style={{fontSize:10,color:"#78350f",fontWeight:600}}>coins</span>
          </div>
        </div>
        {/* Tabs */}
        <div style={{display:"flex"}}>
          {(["score","historia","metas","whatsapp"] as const).map(t=>{
            const labels={score:"🏆 Score",historia:"📅 Histórico",metas:"🎯 Metas",whatsapp:"💬 WhatsApp"};
            return (
              <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"9px 0",background:"transparent",border:"none",borderBottom:`2px solid ${tab===t?"#f97316":"transparent"}`,color:tab===t?"#f97316":"#374151",fontSize:12,fontWeight:600,transition:"all .2s",cursor:"pointer",fontFamily:"'Epilogue',sans-serif"}}>
                {labels[t]}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{padding:"16px"}}>
        {/* ── SCORE TAB ─────────────────────────────────────── */}
        {tab==="score"&&(
          <div>
            {/* Level hero */}
            <div style={{background:"linear-gradient(135deg,rgba(249,115,22,.08),rgba(234,88,12,.04))",border:`1px solid ${level.color}30`,borderRadius:20,padding:"24px",marginBottom:16,textAlign:"center",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,right:0,width:120,height:120,background:`radial-gradient(circle,${level.color}18,transparent 70%)`,pointerEvents:"none"}}/>
              <div style={{fontSize:52,marginBottom:8}}>{level.emoji}</div>
              <div style={{fontFamily:"Syne,sans-serif",fontWeight:900,fontSize:24,color:level.color,marginBottom:4}}>Nível {level.label}</div>
              <div style={{fontSize:13,color:"#718096",marginBottom:16}}>Você tem {coins} check-ins acumulados</div>
              {/* Progress to next level */}
              {level.max < Infinity && (
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#4a5568",marginBottom:6}}>
                    <span>{coins} check-ins</span>
                    <span>Próximo: {LEVELS[LEVELS.indexOf(level)+1]?.label} ({LEVELS[LEVELS.indexOf(level)+1]?.min})</span>
                  </div>
                  <div style={{height:6,background:"#1a2030",borderRadius:999,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${((coins-level.min)/(level.max-level.min))*100}%`,background:`linear-gradient(90deg,${level.color}80,${level.color})`,borderRadius:999}}/>
                  </div>
                  <div style={{fontSize:11,color:"#4a5568",marginTop:6}}>Faltam {level.max+1-coins} check-ins para o próximo nível</div>
                </div>
              )}
            </div>

            {/* Ranking position */}
            <div style={{background:"#0f1419",border:"1px solid #1a2030",borderRadius:20,padding:"20px",marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:700,color:"#374151",textTransform:"uppercase",letterSpacing:".08em",marginBottom:14}}>Ranking do Studio — Março</div>
              {RANKING_DATA.map(r=>(
                <div key={r.p} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",marginBottom:6,borderRadius:12,background:r.isMe?"rgba(249,115,22,.08)":"rgba(255,255,255,.02)",border:`1px solid ${r.isMe?"rgba(249,115,22,.3)":"rgba(255,255,255,.04)"}`,transition:"all .2s"}}>
                  <span style={{fontFamily:"Syne,sans-serif",fontWeight:900,fontSize:r.p<=3?18:14,color:r.p===1?"#fbbf24":r.p===2?"#c084fc":r.p===3?"#f97316":"#4a5568",minWidth:26}}>{r.p<=3?["🥇","🥈","🥉"][r.p-1]:`#${r.p}`}</span>
                  <span style={{fontSize:18}}>{r.badge}</span>
                  <span style={{flex:1,fontWeight:r.isMe?700:500,fontSize:14,color:r.isMe?"#f97316":"#e2e8f0"}}>{r.name}</span>
                  <span style={{fontSize:11,color:"#4a5568"}}>🔥{r.streak}d</span>
                  <span style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:15,color:r.isMe?"#f97316":"#9ca3af"}}>{r.pts}</span>
                </div>
              ))}
            </div>

            {/* Week streak */}
            <div style={{background:"#0f1419",border:"1px solid #1a2030",borderRadius:20,padding:"20px",marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <div style={{fontSize:11,fontWeight:700,color:"#374151",textTransform:"uppercase",letterSpacing:".08em"}}>Esta semana</div>
                <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.2)",borderRadius:999,padding:"4px 12px"}}>
                  <span style={{fontSize:14}}>🔥</span>
                  <span style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:14,color:"#ef4444"}}>{streak} dias</span>
                </div>
              </div>
              <div style={{display:"flex",gap:8,justifyContent:"space-between"}}>
                {days7.map(({d,hasSess},i)=>{
                  const w=["D","S","T","Q","Q","S","S"][d.getDay()];
                  const isToday=d.toDateString()===new Date().toDateString();
                  return (
                    <div key={i} style={{flex:1,textAlign:"center"}}>
                      <div style={{fontSize:10,marginBottom:6,fontWeight:isToday?700:400,color:isToday?"#f97316":"#374151"}}>{w}</div>
                      <div style={{width:"100%",aspectRatio:"1",borderRadius:10,background:hasSess?"linear-gradient(135deg,#f97316,#ea580c)":"#1a2030",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,border:isToday&&!hasSess?"1px dashed rgba(249,115,22,.4)":"none",boxShadow:hasSess?"0 0 10px rgba(249,115,22,.3)":"none"}}>
                        {hasSess?"✓":""}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stats grid */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[
                {icon:"🏋️",v:37,l:"Total check-ins",c:"#f97316"},
                {icon:"🔥",v:`${streak}d`,l:"Sequência atual",c:"#ef4444"},
                {icon:"🪙",v:coins,l:"GymCoins",c:"#fbbf24"},
                {icon:"⭐",v:"Expert",l:"Nível atual",c:"#a855f7"},
              ].map(({icon,v,l,c})=>(
                <div key={l} style={{background:"#0f1419",border:"1px solid #1a2030",borderRadius:16,padding:"14px"}}>
                  <div style={{fontSize:20,marginBottom:6}}>{icon}</div>
                  <div style={{fontFamily:"Syne,sans-serif",fontSize:20,fontWeight:900,color:c}}>{v}</div>
                  <div style={{fontSize:11,color:"#374151",marginTop:3}}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── HISTÓRIA TAB ──────────────────────────────────── */}
        {tab==="historia"&&(
          <div>
            <div style={{background:"#0f1419",border:"1px solid #1a2030",borderRadius:20,padding:"16px",marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:700,color:"#374151",textTransform:"uppercase",letterSpacing:".08em",marginBottom:12}}>Últimas sessões</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {SESSIONS.map(s=>{
                  const c=TYPE_C[s.type]||"#6366f1";
                  const d=s.date;
                  const W=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"][d.getDay()];
                  const isToday=d.toDateString()===new Date().toDateString();
                  return (
                    <div key={s.id} style={{background:"rgba(255,255,255,.02)",borderLeft:`3px solid ${c}`,borderRadius:12,padding:"12px 14px",display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:36,height:36,borderRadius:10,background:`${c}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{TYPE_I[s.type]}</div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:13}}>{s.type}</div>
                        <div style={{fontSize:11,color:"#374151",marginTop:2}}>{isToday?"Hoje":`${W}, ${d.getDate()}/${d.getMonth()+1}`} · {s.trainer} · {s.duration}min</div>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                        <div style={{display:"flex",gap:2}}>{[1,2,3,4,5].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:i<=s.intensity?c:"#1a2030"}}/>)}</div>
                        <div style={{fontSize:10,color:"#fbbf24"}}>+{s.coins}🪙</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Type breakdown */}
            <div style={{background:"#0f1419",border:"1px solid #1a2030",borderRadius:20,padding:"16px"}}>
              <div style={{fontSize:11,fontWeight:700,color:"#374151",textTransform:"uppercase",letterSpacing:".08em",marginBottom:12}}>Por tipo de treino</div>
              {Object.entries(SESSIONS.reduce((a:Record<string,number>,s)=>{a[s.type]=(a[s.type]||0)+1;return a;},{})).sort((a,b)=>b[1]-a[1]).map(([t,n])=>{
                const c=TYPE_C[t]||"#6366f1";
                const pct=Math.round((n/SESSIONS.length)*100);
                return (
                  <div key={t} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                      <span>{TYPE_I[t]} {t}</span><span style={{color:"#4a5568"}}>{n}× · {pct}%</span>
                    </div>
                    <div style={{height:5,background:"#1a2030",borderRadius:999}}><div style={{height:"100%",width:`${pct}%`,background:c,borderRadius:999}}/></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── METAS TAB ─────────────────────────────────────── */}
        {tab==="metas"&&(
          <div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {GOALS.map(g=>{
                const pct=Math.min(100,Math.round((g.current/g.target)*100));
                const rem=g.target-g.current;
                return (
                  <div key={g.id} style={{background:"#0f1419",border:`1px solid ${pct>=75?g.color+"40":"#1a2030"}`,borderRadius:20,padding:"18px",position:"relative",overflow:"hidden"}}>
                    {pct>=75&&<div style={{position:"absolute",top:0,right:0,width:100,height:100,background:`radial-gradient(circle,${g.color}15,transparent 70%)`,pointerEvents:"none"}}/>}
                    <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
                      <GoalRing pct={pct} color={g.color}/>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                          <span style={{fontSize:20}}>{g.icon}</span>
                          <span style={{fontFamily:"Syne,sans-serif",fontSize:15,fontWeight:800}}>{g.title}</span>
                          {pct===100&&<span style={{fontSize:10,padding:"2px 8px",borderRadius:999,background:"rgba(16,185,129,.15)",color:"#10b981",fontWeight:700}}>✓ Concluída</span>}
                        </div>
                        <div style={{height:5,background:"#1a2030",borderRadius:999,marginBottom:8,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${g.color}80,${g.color})`,borderRadius:999}}/>
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
                          {[["Atual",g.current,g.color],["Meta",g.target,"#e2e8f0"],["Faltam",pct>=100?"—":rem,pct>=100?"#10b981":"#9ca3af"]].map(([l,v,c])=>(
                            <div key={String(l)} style={{background:"#070b10",borderRadius:8,padding:"7px 10px"}}>
                              <div style={{fontSize:9,color:"#374151",textTransform:"uppercase",letterSpacing:".06em"}}>{l}</div>
                              <div style={{fontFamily:"Syne,sans-serif",fontSize:16,fontWeight:900,color:String(c)}}>{v}</div>
                              <div style={{fontSize:9,color:"#374151"}}>{g.unit}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <span style={{fontSize:13}}>🪙</span>
                          <span style={{fontSize:12,color:"#fbbf24",fontWeight:700}}>+{g.reward} coins ao concluir</span>
                        </div>
                        {pct>=75&&pct<100&&(
                          <div style={{marginTop:10,background:"#0a1a0f",border:"1px solid rgba(37,211,102,.2)",borderRadius:10,padding:"8px 10px",display:"flex",gap:6}}>
                            <span style={{fontSize:13}}>📲</span>
                            <p style={{fontSize:11,color:"#4ade80",lineHeight:1.5}}>WhatsApp enviado: faltam {rem} {g.unit}! 💪</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── WHATSAPP TAB ──────────────────────────────────── */}
        {tab==="whatsapp"&&(
          <div>
            {/* WA header */}
            <div style={{background:"#075e54",borderRadius:14,padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:42,height:42,borderRadius:"50%",background:"#128c7e",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🏋️</div>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:"#fff",fontFamily:"Syne,sans-serif"}}>Studio Flex</div>
                <div style={{fontSize:11,color:"#25d366"}}>● online</div>
              </div>
            </div>

            {/* Messages */}
            <div style={{background:"#111b21",borderRadius:16,padding:"16px",marginBottom:14}}>
              {WA_MSGS.map((m,i)=>(
                <div key={i} style={{marginBottom:14}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}>
                    <span style={{fontSize:14}}>{m.icon}</span>
                    <span style={{fontSize:11,fontWeight:700,color:m.color,textTransform:"uppercase",letterSpacing:".05em"}}>{m.label}</span>
                    <span style={{fontSize:10,color:"#2d3748"}}>· {m.time}</span>
                  </div>
                  <div style={{background:"#1a2e1f",border:"1px solid rgba(37,211,102,.15)",borderRadius:"4px 14px 14px 14px",padding:"10px 14px",maxWidth:"88%"}}>
                    <p style={{fontSize:13,color:"#dcfce7",lineHeight:1.65}}>{m.preview}</p>
                    <div style={{display:"flex",justifyContent:"flex-end",marginTop:4,gap:4,alignItems:"center"}}>
                      <span style={{fontSize:10,color:"#4ade80"}}>✓✓</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Schedule */}
            <div style={{background:"#0a1a0f",border:"1px solid rgba(37,211,102,.15)",borderRadius:16,padding:"16px"}}>
              <div style={{fontSize:11,fontWeight:700,color:"#25d366",marginBottom:12,textTransform:"uppercase",letterSpacing:".06em"}}>📅 Agenda de disparos automáticos</div>
              {[
                {e:"🎂",l:"Aniversário",t:"08:00 do dia"},
                {e:"⏰",l:"Lembrete 24h antes",t:"18:00 dia anterior"},
                {e:"🔔",l:"Lembrete 1h antes",t:"1h antes do treino"},
                {e:"💥",l:"Motivacional semanal",t:"Terças e Quintas 08h"},
                {e:"📈",l:"Progresso de meta",t:"Automático a 25/50/75/90/100%"},
                {e:"😴",l:"Aluno inativo",t:"Após 7, 14 e 21 dias"},
              ].map(({e,l,t})=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <span style={{fontSize:12,color:"#9ca3af"}}>{e} {l}</span>
                  <span style={{fontSize:10,color:"#374151",background:"#0f1419",padding:"2px 8px",borderRadius:6}}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom links */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"rgba(6,10,16,.95)",borderTop:"1px solid #0d1420",padding:"10px 16px",display:"flex",gap:8,justifyContent:"center"}}>
        <Link href="/" style={{fontSize:12,color:"#374151",textDecoration:"none",padding:"6px 14px",borderRadius:8,background:"rgba(255,255,255,.03)"}}>← Landing</Link>
        <Link href="/tv" style={{fontSize:12,color:"#ec4899",textDecoration:"none",padding:"6px 14px",borderRadius:8,background:"rgba(236,72,153,.06)",border:"1px solid rgba(236,72,153,.15)"}}>📺 TV ao vivo</Link>
      </div>
    </div>
  );
}
