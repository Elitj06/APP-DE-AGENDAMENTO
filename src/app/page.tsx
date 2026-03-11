"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

function useScrolled() {
  const [s, set] = useState(false);
  useEffect(() => { const h=()=>set(window.scrollY>50); window.addEventListener("scroll",h); return ()=>window.removeEventListener("scroll",h); },[]);
  return s;
}

function Counter({ end, suffix="" }: { end: number; suffix?: string }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      let n=0; const step=end/55;
      const t=setInterval(()=>{ n+=step; if(n>=end){setV(end);clearInterval(t);}else setV(Math.floor(n)); },18);
    },{threshold:0.5});
    if(ref.current) obs.observe(ref.current);
    return ()=>obs.disconnect();
  },[end]);
  return <span ref={ref}>{v.toLocaleString("pt-BR")}{suffix}</span>;
}

const LEVELS=[
  {label:"Iniciante",range:"0–24",emoji:"🌱",color:"#64748b"},
  {label:"Regular",range:"25–49",emoji:"💪",color:"#3b82f6"},
  {label:"Dedicado",range:"50–99",emoji:"⚡",color:"#10b981"},
  {label:"Expert",range:"100–199",emoji:"🔥",color:"#f97316"},
  {label:"Elite",range:"200–299",emoji:"💎",color:"#a855f7"},
  {label:"Lenda",range:"300+",emoji:"👑",color:"#fbbf24"},
];

const FEATURES=[
  {icon:"🏆",title:"Rankings & Ligas",desc:"Liga Ouro, Prata e Bronze. Competições mensais + níveis permanentes. Alunos sempre têm algo a perseguir.",color:"#fbbf24"},
  {icon:"📅",title:"Agendamento Inteligente",desc:"1 toque → horário na agenda do professor. Confirmação automática, sem intervenção da recepção.",color:"#3b82f6"},
  {icon:"💬",title:"WhatsApp Automático",desc:"Lembrete 24h/1h antes, parabéns no aniversário, motivacional semanal, alerta de meta. Tudo sem esforço.",color:"#25d366"},
  {icon:"🪙",title:"GymCoins",desc:"1 check-in = 1 GymCoin. Moeda interna que sobe no ranking e gamifica cada visita.",color:"#f97316"},
  {icon:"📺",title:"TV do Studio",desc:"Ranking em tempo real nas TVs. Reconhecimento público e competição saudável visível para todos.",color:"#ec4899"},
  {icon:"🎯",title:"Metas & Conquistas",desc:"Alunos criam metas. Sistema notifica a 25%, 50%, 75%, 90% e 100% com bônus de coins.",color:"#10b981"},
  {icon:"📊",title:"Histórico & Heatmap",desc:"Cada treino registrado: profissional, tipo, intensidade. Heatmap de frequência e evolução temporal.",color:"#a855f7"},
  {icon:"🔐",title:"Check-in Multi-modal",desc:"QR code, biometria, facial (hash LGPD), manual. Integração Wellhub e TotalPass.",color:"#06b6d4"},
];

const RANKING=[
  {p:1,name:"Mariana Souza",badge:"👑",level:"Lenda",pts:980,streak:21,liga:"🥇 Ouro",border:"rgba(251,191,36,.3)"},
  {p:2,name:"Carlos Menezes",badge:"💎",level:"Elite",pts:840,streak:14,liga:"🥇 Ouro",border:"rgba(168,85,247,.25)"},
  {p:3,name:"Julia Rodrigues",badge:"🔥",level:"Expert",pts:780,streak:11,liga:"🥇 Ouro",border:"rgba(249,115,22,.2)"},
  {p:4,name:"Pedro Alves",badge:"⚡",level:"Dedicado",pts:620,streak:7,liga:"🥈 Prata",border:"rgba(255,255,255,.06)"},
  {p:5,name:"Ana Lima",badge:"💪",level:"Regular",pts:540,streak:5,liga:"🥈 Prata",border:"rgba(255,255,255,.06)"},
];

export default function Home() {
  const scrolled = useScrolled();
  const [activeLevel, setActiveLevel] = useState(3);

  return (
    <div style={{background:"#060a10",color:"#e2e8f0",fontFamily:"'Epilogue',sans-serif",minHeight:"100vh"}}>
      {/* NAV */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,padding:"14px 28px",background:scrolled?"rgba(6,10,16,.92)":"transparent",backdropFilter:scrolled?"blur(20px)":"none",borderBottom:scrolled?"1px solid rgba(255,255,255,.05)":"none",transition:"all .3s",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,borderRadius:9,background:"linear-gradient(135deg,#f97316,#ea580c)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Syne,sans-serif",fontWeight:900,color:"#fff",fontSize:17,boxShadow:"0 0 18px rgba(249,115,22,.45)"}}>G</div>
          <span style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:17,letterSpacing:"-.03em"}}>GymFlow <span style={{color:"#f97316"}}>×</span> ScoreFit</span>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <Link href="/app" style={{padding:"9px 20px",borderRadius:999,background:"linear-gradient(135deg,#f97316,#ea580c)",color:"#fff",fontSize:13,fontWeight:700,textDecoration:"none",fontFamily:"Syne,sans-serif",boxShadow:"0 0 18px rgba(249,115,22,.35)"}}>Demo →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"120px 24px 60px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:"20%",left:"5%",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(249,115,22,.07) 0%,transparent 70%)",pointerEvents:"none"}} className="anim-glow"/>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(249,115,22,.08)",border:"1px solid rgba(249,115,22,.25)",borderRadius:999,padding:"7px 18px",marginBottom:28}}>
          <span style={{fontSize:14}}>🏆</span>
          <span style={{fontSize:13,fontWeight:600,color:"#f97316"}}>Gamificação completa para academias e studios</span>
        </div>
        <h1 style={{fontFamily:"Syne,sans-serif",fontSize:"clamp(36px,7vw,78px)",fontWeight:900,lineHeight:1.04,letterSpacing:"-.04em",maxWidth:900,marginBottom:22}}>
          Seus alunos estão desistindo?<br/>
          <span className="gradient-fire">Transforme treinos em competição.</span>
        </h1>
        <p style={{fontSize:"clamp(15px,2.5vw,19px)",color:"#718096",lineHeight:1.75,maxWidth:580,marginBottom:44}}>
          Rankings automáticos, Ligas Ouro/Prata/Bronze, níveis permanentes, agendamento inteligente e WhatsApp automático. O sistema que faz alunos <strong style={{color:"#e2e8f0"}}>quererem voltar todo dia.</strong>
        </p>
        <div style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center",marginBottom:64}}>
          <Link href="/app" style={{padding:"16px 38px",borderRadius:999,background:"linear-gradient(135deg,#f97316,#ea580c)",color:"#fff",fontSize:16,fontWeight:800,textDecoration:"none",fontFamily:"Syne,sans-serif",boxShadow:"0 0 40px rgba(249,115,22,.4),0 4px 20px rgba(0,0,0,.4)"}}>Ver demo interativa →</Link>
          <Link href="/tv" style={{padding:"16px 38px",borderRadius:999,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",color:"#e2e8f0",fontSize:15,fontWeight:600,textDecoration:"none",fontFamily:"'Epilogue',sans-serif"}}>📺 Ver TV ao vivo</Link>
        </div>
        <div style={{display:"flex",gap:"clamp(24px,6vw,64px)",flexWrap:"wrap",justifyContent:"center"}}>
          {[{n:1240,s:"+",l:"Studios ativos"},{n:48600,s:"+",l:"Alunos engajados"},{n:94,s:"%",l:"Taxa de retenção"},{n:3200,s:"+",l:"WhatsApps/dia"}].map(({n,s,l})=>(
            <div key={l} style={{textAlign:"center"}}>
              <div style={{fontFamily:"Syne,sans-serif",fontSize:"clamp(28px,5vw,46px)",fontWeight:900,color:"#f97316"}}><Counter end={n} suffix={s}/></div>
              <div style={{fontSize:12,color:"#4a5568",fontWeight:500,marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="funcionalidades" style={{padding:"80px 24px",background:"rgba(255,255,255,.01)",borderTop:"1px solid rgba(255,255,255,.04)"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:52}}>
            <div style={{fontSize:11,fontWeight:700,color:"#f97316",textTransform:"uppercase",letterSpacing:".15em",marginBottom:14}}>Tudo em um só lugar</div>
            <h2 style={{fontFamily:"Syne,sans-serif",fontSize:"clamp(26px,5vw,48px)",fontWeight:900,letterSpacing:"-.03em"}}>Cada funcionalidade projetada para <span className="gradient-fire">engajar</span></h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
            {FEATURES.map(({icon,title,desc,color})=>(
              <div key={title} className="glass card-hover" style={{borderRadius:20,padding:"26px 22px"}}>
                <div style={{width:50,height:50,borderRadius:13,background:`${color}18`,border:`1px solid ${color}35`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,marginBottom:14}}>{icon}</div>
                <h3 style={{fontFamily:"Syne,sans-serif",fontSize:16,fontWeight:700,marginBottom:8}}>{title}</h3>
                <p style={{fontSize:13,color:"#718096",lineHeight:1.7}}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LEVELS */}
      <section id="níveis" style={{padding:"80px 24px"}}>
        <div style={{maxWidth:900,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:48}}>
            <div style={{fontSize:11,fontWeight:700,color:"#fbbf24",textTransform:"uppercase",letterSpacing:".15em",marginBottom:14}}>Reconhecimento permanente</div>
            <h2 style={{fontFamily:"Syne,sans-serif",fontSize:"clamp(26px,5vw,48px)",fontWeight:900,letterSpacing:"-.03em",marginBottom:14}}>Níveis que <span className="gradient-gold">nunca resetam</span></h2>
            <p style={{color:"#718096",fontSize:16,maxWidth:500,margin:"0 auto"}}>Diferente das competições mensais, os níveis refletem o histórico total do aluno. Status e reconhecimento para sempre.</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:28}}>
            {LEVELS.map((l,i)=>(
              <div key={l.label} onClick={()=>setActiveLevel(i)} className="card-hover" style={{background:activeLevel===i?`${l.color}15`:"rgba(255,255,255,.02)",border:`1px solid ${activeLevel===i?l.color:"rgba(255,255,255,.06)"}`,borderRadius:18,padding:"22px 16px",textAlign:"center",cursor:"pointer",transition:"all .2s"}}>
                <div style={{fontSize:32,marginBottom:8}}>{l.emoji}</div>
                <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:15,color:l.color,marginBottom:4}}>{l.label}</div>
                <div style={{fontSize:12,color:"#4a5568"}}>{l.range} check-ins</div>
              </div>
            ))}
          </div>
          <div style={{background:`${LEVELS[activeLevel].color}10`,border:`1px solid ${LEVELS[activeLevel].color}30`,borderRadius:20,padding:"28px 32px",display:"flex",alignItems:"center",gap:24,flexWrap:"wrap"}}>
            <div style={{fontSize:56}}>{LEVELS[activeLevel].emoji}</div>
            <div>
              <div style={{fontFamily:"Syne,sans-serif",fontWeight:900,fontSize:22,color:LEVELS[activeLevel].color,marginBottom:6}}>Nível {LEVELS[activeLevel].label}</div>
              <div style={{color:"#9ca3af",fontSize:14,marginBottom:12}}>{LEVELS[activeLevel].range} check-ins totais</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {["Badge exclusivo no app","Destaque no ranking TV","Reconhecimento público"].map(b=>(
                  <span key={b} style={{background:`${LEVELS[activeLevel].color}18`,border:`1px solid ${LEVELS[activeLevel].color}35`,color:LEVELS[activeLevel].color,fontSize:11,fontWeight:600,padding:"4px 10px",borderRadius:999}}>{b}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TV PREVIEW */}
      <section style={{padding:"80px 24px",background:"rgba(255,255,255,.01)",borderTop:"1px solid rgba(255,255,255,.04)"}}>
        <div style={{maxWidth:800,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:40}}>
            <div style={{fontSize:11,fontWeight:700,color:"#ec4899",textTransform:"uppercase",letterSpacing:".15em",marginBottom:14}}>TV do studio</div>
            <h2 style={{fontFamily:"Syne,sans-serif",fontSize:"clamp(26px,5vw,44px)",fontWeight:900,letterSpacing:"-.03em"}}>Rankings <span style={{color:"#ec4899"}}>ao vivo</span> na sua TV</h2>
          </div>
          <div style={{background:"#000",borderRadius:20,border:"8px solid #1a1a2e",boxShadow:"0 30px 80px rgba(0,0,0,.7)",overflow:"hidden"}}>
            <div style={{background:"linear-gradient(135deg,#0a0f1a,#0d1426)",padding:"28px 32px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
                <div>
                  <div style={{fontFamily:"Syne,sans-serif",fontSize:20,fontWeight:900}}>Studio Flex — Competição Março</div>
                  <div style={{fontSize:12,color:"#4a5568",marginTop:2}}>Atualizado em tempo real · 127 alunos participando</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:"#10b981"}} className="anim-glow"/>
                  <span style={{color:"#10b981",fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:12}}>AO VIVO</span>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {RANKING.map(r=>(
                  <div key={r.p} style={{background:"rgba(255,255,255,.02)",border:`1px solid ${r.border}`,borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",gap:14}}>
                    <span style={{fontFamily:"Syne,sans-serif",fontWeight:900,fontSize:r.p<=3?22:16,color:r.p===1?"#fbbf24":r.p===2?"#c084fc":r.p===3?"#f97316":"#4a5568",minWidth:30,textAlign:"center"}}>#{r.p}</span>
                    <span style={{fontSize:22}}>{r.badge}</span>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:15}}>{r.name}</div>
                      <div style={{fontSize:11,color:"#4a5568",marginTop:1}}>Nível {r.level} · {r.liga}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:11,color:"#4a5568",marginBottom:2}}>🔥 {r.streak} dias</div>
                      <div style={{fontFamily:"Syne,sans-serif",fontWeight:900,fontSize:18,color:r.p===1?"#fbbf24":"#e2e8f0"}}>{r.pts} pts</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{textAlign:"center",marginTop:20}}>
            <Link href="/tv" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"12px 24px",borderRadius:12,background:"rgba(236,72,153,.08)",border:"1px solid rgba(236,72,153,.2)",color:"#ec4899",textDecoration:"none",fontSize:14,fontWeight:700,fontFamily:"Syne,sans-serif"}}>
              📺 Abrir TV em tela cheia →
            </Link>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="preços" style={{padding:"80px 24px"}}>
        <div style={{maxWidth:960,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:52}}>
            <h2 style={{fontFamily:"Syne,sans-serif",fontSize:"clamp(26px,5vw,48px)",fontWeight:900,letterSpacing:"-.03em"}}>Planos simples e transparentes</h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:20}}>
            {[
              {plan:"Starter",price:"R$150",sub:"Até 500 alunos",badge:null as string|null,features:["Rankings & competições mensais","Liga Ouro/Prata/Bronze","Níveis permanentes","Web App do aluno","TV em tempo real","Setup gratuito"]},
              {plan:"Growth",price:"R$200",sub:"Até 1.000 alunos",badge:"MAIS POPULAR",features:["Tudo do Starter","Agendamento automático","WhatsApp automático","Check-in QR + biometria","GymCoins & metas","Histórico & heatmap","Wellhub / TotalPass"]},
              {plan:"Scale",price:"R$297",sub:"1.000+ alunos",badge:null as string|null,features:["Tudo do Growth","Multi-studio","Dashboard admin avançado","Check-in facial (LGPD)","Catraca WebSocket","API personalizada","Suporte dedicado"]},
            ].map(({plan,price,sub,badge,features})=>(
              <div key={plan} style={{borderRadius:24,padding:"32px 26px",background:badge?"linear-gradient(135deg,rgba(249,115,22,.1),rgba(234,88,12,.04))":"rgba(255,255,255,.02)",border:`1px solid ${badge?"rgba(249,115,22,.4)":"rgba(255,255,255,.06)"}`,position:"relative",overflow:"hidden"}}>
                {badge&&<div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#f97316,#ea580c)",color:"#fff",fontSize:10,fontWeight:800,padding:"4px 16px",borderRadius:"0 0 10px 10px",fontFamily:"Syne,sans-serif",whiteSpace:"nowrap"}}>{badge}</div>}
                <div style={{fontFamily:"Syne,sans-serif",fontSize:13,fontWeight:700,color:"#718096",textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>{plan}</div>
                <div style={{fontFamily:"Syne,sans-serif",fontSize:38,fontWeight:900,color:badge?"#f97316":"#e2e8f0",marginBottom:4}}>{price}</div>
                <div style={{fontSize:12,color:"#4a5568",marginBottom:24}}>/mês · {sub}</div>
                <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:28}}>
                  {features.map(f=><div key={f} style={{display:"flex",gap:9,alignItems:"flex-start",fontSize:13,color:"#9ca3af"}}><span style={{color:badge?"#f97316":"#10b981",flexShrink:0}}>✓</span>{f}</div>)}
                </div>
                <button style={{width:"100%",padding:"13px",borderRadius:13,background:badge?"linear-gradient(135deg,#f97316,#ea580c)":"rgba(255,255,255,.05)",border:badge?"none":"1px solid rgba(255,255,255,.1)",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"Syne,sans-serif"}}>Solicitar demo</button>
              </div>
            ))}
          </div>
          <p style={{textAlign:"center",color:"#374151",fontSize:13,marginTop:20}}>Setup gratuito em todos os planos · Sem fidelidade · Suporte via WhatsApp</p>
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:"80px 24px"}}>
        <div style={{maxWidth:780,margin:"0 auto",textAlign:"center",background:"linear-gradient(135deg,rgba(249,115,22,.08),rgba(234,88,12,.04))",border:"1px solid rgba(249,115,22,.2)",borderRadius:32,padding:"56px 40px",position:"relative",overflow:"hidden"}}>
          <h2 style={{fontFamily:"Syne,sans-serif",fontSize:"clamp(26px,5vw,52px)",fontWeight:900,letterSpacing:"-.04em",marginBottom:16}}>Pronto para <span className="gradient-fire">parar de perder alunos?</span></h2>
          <p style={{color:"#718096",fontSize:17,lineHeight:1.7,marginBottom:40}}>Setup em menos de 24h. Sem fidelidade. Veja os resultados na primeira semana.</p>
          <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
            <Link href="/app" style={{padding:"16px 40px",borderRadius:999,background:"linear-gradient(135deg,#f97316,#ea580c)",color:"#fff",fontSize:16,fontWeight:800,textDecoration:"none",fontFamily:"Syne,sans-serif",boxShadow:"0 0 40px rgba(249,115,22,.5)"}}>Ver demo agora →</Link>
            <Link href="/tv" style={{padding:"16px 40px",borderRadius:999,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",color:"#e2e8f0",fontSize:15,fontWeight:600,textDecoration:"none"}}>📺 Demo da TV</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{borderTop:"1px solid rgba(255,255,255,.05)",padding:"36px 28px"}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:14}}>
          <span style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:15}}>GymFlow <span style={{color:"#f97316"}}>×</span> ScoreFit</span>
          <span style={{fontSize:12,color:"#374151"}}>© 2025 GymFlow. Todos os direitos reservados.</span>
        </div>
      </footer>
    </div>
  );
}
