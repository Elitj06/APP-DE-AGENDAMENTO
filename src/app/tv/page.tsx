"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const INITIAL = [
  {p:1,name:"Mariana Souza",badge:"👑",level:"Lenda",pts:980,streak:21,liga:"Ouro",c:"#fbbf24"},
  {p:2,name:"Carlos Menezes",badge:"💎",level:"Elite",pts:840,streak:14,liga:"Ouro",c:"#c084fc"},
  {p:3,name:"Julia Rodrigues",badge:"🔥",level:"Expert",pts:780,streak:11,liga:"Ouro",c:"#f97316"},
  {p:4,name:"Pedro Alves",badge:"⚡",level:"Dedicado",pts:620,streak:7,liga:"Prata",c:"#e2e8f0"},
  {p:5,name:"Ana Lima",badge:"💪",level:"Regular",pts:540,streak:5,liga:"Prata",c:"#e2e8f0"},
  {p:6,name:"Bruno Costa",badge:"💪",level:"Regular",pts:480,streak:4,liga:"Bronze",c:"#e2e8f0"},
  {p:7,name:"Fernanda P.",badge:"🌱",level:"Iniciante",pts:380,streak:3,liga:"Bronze",c:"#e2e8f0"},
  {p:8,name:"Rafael M.",badge:"🌱",level:"Iniciante",pts:290,streak:2,liga:"Bronze",c:"#e2e8f0"},
];

const LIGA_C: Record<string,string> = {Ouro:"#fbbf24",Prata:"#94a3b8",Bronze:"#f97316"};
const LIGA_E: Record<string,string> = {Ouro:"🥇",Prata:"🥈",Bronze:"🥉"};

function useTimeString() {
  const [t, setT] = useState("");
  useEffect(() => {
    const upd = () => setT(new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit",second:"2-digit"}));
    upd();
    const id = setInterval(upd, 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

export default function TVPage() {
  const time = useTimeString();
  const [ranking, setRanking] = useState(INITIAL);
  const [lastUpdate, setLastUpdate] = useState("agora");
  const [highlight, setHighlight] = useState<number|null>(null);

  // Simulate live updates
  useEffect(() => {
    const id = setInterval(() => {
      setRanking(prev => {
        const idx = Math.floor(Math.random() * prev.length);
        const inc = Math.floor(Math.random() * 15) + 1;
        const updated = prev.map((r,i) => i===idx ? {...r,pts:r.pts+inc} : r);
        const sorted = [...updated].sort((a,b) => b.pts-a.pts).map((r,i) => ({...r,p:i+1}));
        setHighlight(sorted[idx]?.p ?? null);
        setTimeout(() => setHighlight(null), 1800);
        return sorted;
      });
      setLastUpdate(new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}));
    }, 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{background:"linear-gradient(160deg,#060a10 0%,#0a0f1a 50%,#060a10 100%)",minHeight:"100vh",fontFamily:"'Epilogue',sans-serif",color:"#e2e8f0",padding:"24px",position:"relative",overflow:"hidden"}}>
      {/* Background orbs */}
      <div style={{position:"fixed",top:"-10%",left:"-5%",width:"50vw",height:"50vw",borderRadius:"50%",background:"radial-gradient(circle,rgba(249,115,22,.04) 0%,transparent 70%)",pointerEvents:"none",zIndex:0}} className="anim-glow"/>
      <div style={{position:"fixed",bottom:"-10%",right:"-5%",width:"40vw",height:"40vw",borderRadius:"50%",background:"radial-gradient(circle,rgba(168,85,247,.04) 0%,transparent 70%)",pointerEvents:"none",zIndex:0}}/>

      <div style={{position:"relative",zIndex:1,maxWidth:1200,margin:"0 auto"}}>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"clamp(20px,3vh,36px)"}}>
          <div style={{display:"flex",alignItems:"center",gap:"clamp(10px,2vw,20px)"}}>
            <div style={{width:"clamp(44px,5vw,64px)",height:"clamp(44px,5vw,64px)",borderRadius:"clamp(10px,1.5vw,16px)",background:"linear-gradient(135deg,#f97316,#ea580c)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Syne,sans-serif",fontWeight:900,color:"#fff",fontSize:"clamp(20px,3vw,32px)",boxShadow:"0 0 30px rgba(249,115,22,.5)"}}>G</div>
            <div>
              <div style={{fontFamily:"Syne,sans-serif",fontWeight:900,fontSize:"clamp(18px,3vw,38px)",letterSpacing:"-.03em",lineHeight:1.1}}>Studio Flex</div>
              <div style={{fontSize:"clamp(11px,1.5vw,16px)",color:"#4a5568"}}>🏆 Competição de Março 2025</div>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,justifyContent:"flex-end",marginBottom:4}}>
              <div style={{width:10,height:10,borderRadius:"50%",background:"#10b981",boxShadow:"0 0 8px #10b981"}} className="anim-glow"/>
              <span style={{color:"#10b981",fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:"clamp(12px,1.5vw,16px)"}}>AO VIVO</span>
            </div>
            <div style={{fontFamily:"Syne,sans-serif",fontSize:"clamp(18px,2.5vw,28px)",fontWeight:900,color:"#e2e8f0"}}>{time}</div>
            <div style={{fontSize:"clamp(10px,1.2vw,13px)",color:"#374151"}}>Atualizado: {lastUpdate}</div>
          </div>
        </div>

        {/* Liga filter pills */}
        <div style={{display:"flex",gap:10,marginBottom:"clamp(14px,2vh,24px)",flexWrap:"wrap"}}>
          {["Ouro","Prata","Bronze"].map(liga=>(
            <div key={liga} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 16px",borderRadius:999,background:`${LIGA_C[liga]}12`,border:`1px solid ${LIGA_C[liga]}40`,color:LIGA_C[liga],fontSize:"clamp(11px,1.3vw,14px)",fontWeight:700,fontFamily:"Syne,sans-serif"}}>
              {LIGA_E[liga]} Liga {liga}
            </div>
          ))}
        </div>

        {/* Ranking */}
        <div style={{display:"flex",flexDirection:"column",gap:"clamp(8px,1.2vh,14px)"}}>
          {ranking.map((r) => {
            const isTop3=r.p<=3;
            const isFresh=highlight===r.p;
            const bgMap:Record<number,string>={1:"linear-gradient(135deg,rgba(251,191,36,.1),rgba(249,115,22,.06))",2:"linear-gradient(135deg,rgba(168,85,247,.08),rgba(99,102,241,.04))",3:"linear-gradient(135deg,rgba(249,115,22,.08),rgba(239,68,68,.04))"};
            const borderMap:Record<number,string>={1:"rgba(251,191,36,.35)",2:"rgba(168,85,247,.25)",3:"rgba(249,115,22,.2)"};
            return (
              <div key={r.name} style={{
                background:isFresh?"rgba(249,115,22,.15)":isTop3?bgMap[r.p]:"rgba(255,255,255,.02)",
                border:`1px solid ${isFresh?"rgba(249,115,22,.6)":isTop3?borderMap[r.p]:"rgba(255,255,255,.05)"}`,
                borderRadius:"clamp(12px,1.5vw,20px)",
                padding:"clamp(12px,1.8vh,20px) clamp(14px,2vw,28px)",
                display:"flex",alignItems:"center",gap:"clamp(10px,2vw,22px)",
                transition:"all .5s ease",
                transform:isFresh?"scale(1.005)":"scale(1)",
                boxShadow:isFresh?"0 0 20px rgba(249,115,22,.2)":"none",
              }}>
                {/* Position */}
                <div style={{minWidth:"clamp(30px,4vw,54px)",textAlign:"center",fontFamily:"Syne,sans-serif",fontWeight:900,fontSize:isTop3?"clamp(22px,3.5vw,44px)":"clamp(16px,2.5vw,28px)",color:r.p===1?"#fbbf24":r.p===2?"#c084fc":r.p===3?"#f97316":"#4a5568"}}>
                  {r.p<=3?["🥇","🥈","🥉"][r.p-1]:`#${r.p}`}
                </div>
                {/* Badge */}
                <div style={{fontSize:"clamp(24px,4vw,48px)"}}>{r.badge}</div>
                {/* Info */}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:"Syne,sans-serif",fontWeight:900,fontSize:"clamp(15px,2.5vw,28px)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.name}</div>
                  <div style={{fontSize:"clamp(10px,1.3vw,15px)",color:"#4a5568",marginTop:2}}>
                    Nível {r.level} · <span style={{color:LIGA_C[r.liga]}}>{LIGA_E[r.liga]} Liga {r.liga}</span>
                  </div>
                </div>
                {/* Streak */}
                <div style={{textAlign:"center",background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.15)",borderRadius:"clamp(8px,1vw,12px)",padding:"clamp(6px,1vh,10px) clamp(10px,1.5vw,18px)"}}>
                  <div style={{fontSize:"clamp(18px,2.5vw,28px)"}}>🔥</div>
                  <div style={{fontFamily:"Syne,sans-serif",fontWeight:900,fontSize:"clamp(13px,1.8vw,20px)",color:"#ef4444"}}>{r.streak}d</div>
                </div>
                {/* Points */}
                <div style={{textAlign:"right",minWidth:"clamp(60px,8vw,110px)"}}>
                  <div style={{fontSize:"clamp(10px,1.2vw,13px)",color:"#374151",marginBottom:2}}>PONTOS</div>
                  <div style={{fontFamily:"Syne,sans-serif",fontWeight:900,fontSize:isTop3?"clamp(22px,3.5vw,44px)":"clamp(18px,2.8vw,34px)",color:r.p===1?"#fbbf24":isFresh?"#f97316":"#e2e8f0",transition:"color .3s"}}>
                    {r.pts.toLocaleString("pt-BR")}
                  </div>
                  {isFresh&&<div style={{fontSize:"clamp(10px,1.2vw,13px)",color:"#f97316",fontWeight:700}}>+pts ↑</div>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{marginTop:"clamp(16px,2vh,28px)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
          <div style={{fontSize:"clamp(10px,1.2vw,13px)",color:"#374151"}}>
            127 alunos participando · Competição encerra em 18 dias
          </div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <Link href="/app" style={{fontSize:"clamp(10px,1.2vw,13px)",color:"#f97316",textDecoration:"none",padding:"5px 12px",borderRadius:8,background:"rgba(249,115,22,.08)",border:"1px solid rgba(249,115,22,.2)"}}>App do aluno →</Link>
            <Link href="/" style={{fontSize:"clamp(10px,1.2vw,13px)",color:"#374151",textDecoration:"none",padding:"5px 12px",borderRadius:8,background:"rgba(255,255,255,.03)"}}>GymFlow.app</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
