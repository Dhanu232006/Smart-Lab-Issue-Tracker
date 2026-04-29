import { useState, useMemo } from "react";
import { useDashboardStats, useIssues, useLabMap, useActivityLog, useIssueActions } from "./useLabData";
import { formatTime, formatDate } from "./api";

const ADMIN_CSS = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Outfit:wght@300;400;500;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
.ad-root{--bg:#0b0d13;--bg2:#10131c;--bg3:#161a27;--bg4:#1d2235;--rim:#252d44;--rim2:#2e3852;--cyan:#00d4ff;--cdim:rgba(0,212,255,0.12);--green:#00e676;--gdim:rgba(0,230,118,0.10);--amber:#ffab00;--adim:rgba(255,171,0,0.10);--red:#ff3d57;--rdim:rgba(255,61,87,0.10);--text:#dce6f7;--text2:#7b8db5;--text3:#47577a;--mono:'JetBrains Mono',monospace;--body:'Outfit',sans-serif;font-family:var(--body);background:var(--bg);color:var(--text);min-height:100vh;display:flex;flex-direction:column;position:relative;overflow-x:hidden;}
.ad-root::before{content:'';position:fixed;inset:0;pointer-events:none;z-index:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px);}
.ad-nav{position:sticky;top:0;z-index:50;height:56px;background:rgba(11,13,19,0.94);backdrop-filter:blur(20px);border-bottom:1px solid var(--rim);display:flex;align-items:center;padding:0 1.5rem;gap:12px;}
.ad-logo{display:flex;align-items:center;gap:9px;font-family:var(--mono);font-size:0.9rem;font-weight:700;letter-spacing:0.08em;}
.ad-logo-icon{width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,var(--cyan),#6c63ff);display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 0 14px rgba(0,212,255,0.3);}
.ad-logo span{color:var(--cyan);}
.ad-logo-sub{font-family:var(--mono);font-size:0.6rem;color:var(--text3);letter-spacing:0.2em;text-transform:uppercase;background:var(--bg3);border:1px solid var(--rim);border-radius:4px;padding:2px 7px;}
.ad-spacer{flex:1;}
.ad-clock{font-family:var(--mono);font-size:0.7rem;color:var(--text3);}
.ad-btn{background:transparent;border:1px solid var(--rim2);border-radius:8px;padding:6px 13px;font-family:var(--mono);font-size:0.72rem;color:var(--text2);cursor:pointer;transition:all 0.2s;}
.ad-btn:hover{border-color:var(--cyan);color:var(--cyan);background:var(--cdim);}
.ad-tabs{background:var(--bg2);border-bottom:1px solid var(--rim);padding:0 1.5rem;display:flex;gap:0;align-items:flex-end;}
.ad-tab{font-family:var(--mono);font-size:0.72rem;letter-spacing:0.08em;padding:12px 16px;color:var(--text3);cursor:pointer;border-bottom:2px solid transparent;transition:all 0.2s;white-space:nowrap;}
.ad-tab:hover{color:var(--text2);}
.ad-tab.active{color:var(--cyan);border-bottom-color:var(--cyan);}
.ad-page{flex:1;padding:1.8rem 1.5rem;position:relative;z-index:1;}
.ad-kpi-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:1.6rem;}
.ad-kpi{background:var(--bg2);border:1px solid var(--rim);border-radius:12px;padding:16px 16px 14px;transition:border-color 0.2s,transform 0.18s;position:relative;overflow:hidden;}
.ad-kpi:hover{transform:translateY(-2px);}
.ad-kpi::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;border-radius:12px 12px 0 0;}
.ad-kpi.c-green::before{background:var(--green);box-shadow:0 0 8px var(--green);}
.ad-kpi.c-amber::before{background:var(--amber);box-shadow:0 0 8px var(--amber);}
.ad-kpi.c-red::before{background:var(--red);box-shadow:0 0 8px var(--red);}
.ad-kpi.c-cyan::before{background:var(--cyan);box-shadow:0 0 8px var(--cyan);}
.ad-kpi-val{font-family:var(--mono);font-size:1.8rem;font-weight:700;line-height:1;margin-bottom:4px;}
.ad-kpi.c-green .ad-kpi-val{color:var(--green);}.ad-kpi.c-amber .ad-kpi-val{color:var(--amber);}.ad-kpi.c-red .ad-kpi-val{color:var(--red);}.ad-kpi.c-cyan .ad-kpi-val{color:var(--cyan);}
.ad-kpi-lbl{font-size:0.72rem;color:var(--text2);}
.ad-kpi-sub{font-family:var(--mono);font-size:0.6rem;color:var(--text3);margin-top:5px;}
.ad-grid2{display:grid;grid-template-columns:1fr 340px;gap:14px;}
.ad-card{background:var(--bg2);border:1px solid var(--rim);border-radius:14px;overflow:hidden;margin-bottom:14px;}
.ad-card-head{padding:13px 16px;border-bottom:1px solid var(--rim);display:flex;align-items:center;justify-content:space-between;gap:10px;}
.ad-card-title{font-family:var(--mono);font-size:0.68rem;color:var(--text3);letter-spacing:0.16em;text-transform:uppercase;}
.ad-card-body{padding:14px 16px;}
.ad-tbl{width:100%;border-collapse:collapse;}
.ad-tbl th{font-family:var(--mono);font-size:0.6rem;color:var(--text3);text-transform:uppercase;letter-spacing:0.14em;padding:0 10px 10px;text-align:left;border-bottom:1px solid var(--rim);white-space:nowrap;}
.ad-tbl td{padding:10px;border-bottom:1px solid var(--rim);font-size:0.8rem;vertical-align:middle;}
.ad-tbl tr:last-child td{border-bottom:none;}
.ad-tbl tr{transition:background 0.15s;}
.ad-tbl tr:hover td{background:var(--bg3);}
.ad-tbl-id{font-family:var(--mono);font-size:0.72rem;font-weight:700;color:var(--cyan);}
.ad-tbl-desc{color:var(--text2);max-width:200px;}
.ad-tbl-student{font-family:var(--mono);font-size:0.68rem;color:var(--text3);}
.ad-tbl-time{font-family:var(--mono);font-size:0.65rem;color:var(--text3);white-space:nowrap;}
.ad-tag{display:inline-flex;align-items:center;padding:3px 9px;border-radius:20px;font-family:var(--mono);font-size:0.6rem;font-weight:700;border:1px solid;white-space:nowrap;}
.ad-tag.open{background:var(--rdim);color:var(--red);border-color:rgba(255,61,87,0.3);}
.ad-tag.prog{background:var(--adim);color:var(--amber);border-color:rgba(255,171,0,0.3);}
.ad-tag.fixed{background:var(--gdim);color:var(--green);border-color:rgba(0,230,118,0.3);}
.ad-sev{display:inline-block;padding:2px 8px;border-radius:4px;font-family:var(--mono);font-size:0.58rem;font-weight:700;}
.ad-sev.CRITICAL{background:rgba(255,61,87,0.2);color:var(--red);}
.ad-sev.HIGH{background:rgba(255,171,0,0.15);color:var(--amber);}
.ad-sev.MEDIUM{background:rgba(0,212,255,0.1);color:var(--cyan);}
.ad-sev.MINOR{background:var(--bg4);color:var(--text3);}
.ad-action-row{display:flex;gap:5px;}
.ad-btn-sm{padding:4px 10px;border-radius:6px;border:1px solid var(--rim);background:transparent;color:var(--text2);font-family:var(--mono);font-size:0.6rem;cursor:pointer;transition:all 0.18s;white-space:nowrap;}
.ad-btn-sm:disabled{opacity:0.4;cursor:not-allowed;}
.ad-btn-sm.green:hover:not(:disabled){border-color:var(--green);color:var(--green);background:var(--gdim);}
.ad-btn-sm.amber:hover:not(:disabled){border-color:var(--amber);color:var(--amber);background:var(--adim);}
.ad-btn-sm.red:hover:not(:disabled){border-color:var(--red);color:var(--red);background:var(--rdim);}
.ad-filter-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.ad-filter-chip{padding:5px 12px;border-radius:20px;border:1px solid var(--rim);background:var(--bg3);color:var(--text2);font-family:var(--mono);font-size:0.65rem;cursor:pointer;transition:all 0.18s;}
.ad-filter-chip:hover{border-color:var(--rim2);color:var(--text);}
.ad-filter-chip.on{border-color:var(--cyan);color:var(--cyan);background:var(--cdim);}
.ad-search{flex:1;min-width:160px;background:var(--bg3);border:1px solid var(--rim);border-radius:8px;padding:7px 12px;color:var(--text);font-family:var(--mono);font-size:0.72rem;outline:none;transition:border-color 0.2s;}
.ad-search:focus{border-color:var(--cyan);}
.ad-search::placeholder{color:var(--text3);}
.ad-chart{display:flex;flex-direction:column;gap:8px;}
.ad-bar-row{display:flex;align-items:center;gap:10px;}
.ad-bar-lbl{font-family:var(--mono);font-size:0.62rem;color:var(--text3);width:96px;flex-shrink:0;text-align:right;}
.ad-bar-track{flex:1;height:8px;background:var(--bg4);border-radius:4px;overflow:hidden;}
.ad-bar-fill{height:100%;border-radius:4px;transition:width 0.6s cubic-bezier(.4,0,.2,1);}
.ad-bar-count{font-family:var(--mono);font-size:0.6rem;color:var(--text3);width:24px;text-align:right;flex-shrink:0;}
.ad-minimap{display:flex;flex-direction:column;gap:8px;}
.ad-minimap-row{display:flex;align-items:center;gap:6px;}
.ad-minimap-lbl{font-family:var(--mono);font-size:0.58rem;color:var(--text3);width:14px;text-align:right;flex-shrink:0;}
.ad-minimap-pcs{display:flex;gap:5px;flex-wrap:wrap;}
.ad-mpc{width:28px;height:26px;border-radius:5px;border:1px solid;display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:0.48rem;cursor:pointer;transition:transform 0.15s,box-shadow 0.15s;flex-shrink:0;}
.ad-mpc.ok{background:#081a10;border-color:#143d22;color:var(--green);}
.ad-mpc.minor{background:#1c1300;border-color:#3d2c00;color:var(--amber);}
.ad-mpc.faulty{background:#160507;border-color:#3d0f16;color:var(--red);}
.ad-mpc.offline{background:var(--bg3);border-color:var(--rim);color:var(--text3);opacity:0.4;cursor:default;}
.ad-mpc:not(.offline):hover{transform:scale(1.15);box-shadow:0 3px 10px rgba(0,0,0,0.4);}
.ad-activity{display:flex;flex-direction:column;}
.ad-act-item{display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-bottom:1px solid var(--rim);}
.ad-act-item:last-child{border-bottom:none;}
.ad-act-dot{width:8px;height:8px;border-radius:50%;margin-top:5px;flex-shrink:0;}
.ad-act-dot.fixed{background:var(--green);box-shadow:0 0 6px var(--green);}
.ad-act-dot.prog{background:var(--amber);box-shadow:0 0 6px var(--amber);}
.ad-act-dot.open{background:var(--red);box-shadow:0 0 6px var(--red);}
.ad-act-main{flex:1;}
.ad-act-line1{font-size:0.78rem;color:var(--text);margin-bottom:2px;}
.ad-act-line2{font-family:var(--mono);font-size:0.62rem;color:var(--text3);}
.ad-detail{background:var(--bg3);border:1px solid var(--rim);border-radius:12px;padding:16px;}
.ad-detail-id{font-family:var(--mono);font-size:1rem;font-weight:700;color:var(--cyan);margin-bottom:6px;}
.ad-detail-row{display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--rim);font-size:0.78rem;}
.ad-detail-row:last-child{border-bottom:none;}
.ad-detail-key{color:var(--text3);font-family:var(--mono);font-size:0.65rem;text-transform:uppercase;letter-spacing:0.1em;}
.ad-detail-val{color:var(--text);}
.ad-detail-actions{display:flex;flex-direction:column;gap:7px;margin-top:12px;}
.ad-btn-full{width:100%;padding:9px 0;border-radius:8px;border:1px solid;font-family:var(--mono);font-size:0.72rem;font-weight:700;cursor:pointer;transition:all 0.2s;letter-spacing:0.05em;}
.ad-btn-full.amber{background:var(--adim);border-color:rgba(255,171,0,0.35);color:var(--amber);}
.ad-btn-full.amber:hover{background:rgba(255,171,0,0.18);border-color:var(--amber);}
.ad-btn-full.green{background:var(--gdim);border-color:rgba(0,230,118,0.35);color:var(--green);}
.ad-btn-full.green:hover{background:rgba(0,230,118,0.18);border-color:var(--green);}
.ad-btn-full.red{background:var(--rdim);border-color:rgba(255,61,87,0.35);color:var(--red);}
.ad-btn-full.red:hover{background:rgba(255,61,87,0.18);border-color:var(--red);}
.ad-donut-wrap{display:flex;align-items:center;gap:18px;}
.ad-donut{width:80px;height:80px;border-radius:50%;flex-shrink:0;position:relative;display:flex;align-items:center;justify-content:center;}
.ad-donut-inner{position:absolute;width:54px;height:54px;border-radius:50%;background:var(--bg2);display:flex;flex-direction:column;align-items:center;justify-content:center;}
.ad-donut-pct{font-family:var(--mono);font-size:0.9rem;font-weight:700;color:var(--green);line-height:1;}
.ad-donut-sub{font-family:var(--mono);font-size:0.48rem;color:var(--text3);}
.ad-donut-legend{display:flex;flex-direction:column;gap:5px;}
.ad-donut-item{display:flex;align-items:center;gap:6px;font-size:0.7rem;color:var(--text2);}
.ad-donut-swatch{width:8px;height:8px;border-radius:2px;flex-shrink:0;}
.ad-toast{position:fixed;bottom:22px;right:22px;z-index:200;background:#081a10;border:1px solid var(--green);border-radius:10px;padding:12px 18px;font-family:var(--mono);font-size:0.74rem;color:var(--green);box-shadow:0 8px 28px rgba(0,230,118,0.18);transform:translateY(70px);opacity:0;transition:all 0.38s cubic-bezier(.34,1.2,.64,1);pointer-events:none;}
.ad-toast.show{transform:translateY(0);opacity:1;}
.ad-scroll{overflow-y:auto;max-height:360px;}
.ad-scroll::-webkit-scrollbar{width:3px;}
.ad-scroll::-webkit-scrollbar-thumb{background:var(--rim2);border-radius:2px;}
.ad-loading{display:flex;align-items:center;justify-content:center;height:180px;font-family:var(--mono);font-size:0.7rem;color:var(--text3);letter-spacing:0.1em;}
@media(max-width:760px){.ad-grid2{grid-template-columns:1fr;}.ad-kpi-row{grid-template-columns:repeat(2,1fr);}}`;

const LAB_ROWS = [
  { left:[1,2,3,4],    right:[5,6,7,8]    },
  { left:[9,10,11,12], right:[13,14,15,16] },
  { left:[17,18,19,20],right:[21,22,23,24] },
  { left:[25,26,27,28],right:[29]          },
];
const statusLabel = s => ({ok:"Working",faulty:"Not Working",minor:"Minor Issue",offline:"Offline"}[s]??"");

function Clock() {
  const [t,setT] = useState(new Date());
  useState(()=>{ const i=setInterval(()=>setT(new Date()),1000); return()=>clearInterval(i); },[]);
  return <span className="ad-clock">{t.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</span>;
}

export default function AdminDashboard({ onBack }) {
  const [tab,      setTab]      = useState("overview");
  const [filter,   setFilter]   = useState("all");
  const [search,   setSearch]   = useState("");
  const [selIssue, setSelIssue] = useState(null);
  const [mapSel,   setMapSel]   = useState(null);
  const [selectedPc, setSelectedPc] = useState(null);
  const [toast,    setToast]    = useState("");

  const { stats, loading: statsLoading, refresh: refreshStats } = useDashboardStats();
  const { issues, loading: issuesLoading, refresh: refreshIssues } = useIssues();
  const { computers, loading: mapLoading, refresh: refreshMap, optimisticUpdate } = useLabMap();
  const { log, refresh: refreshLog } = useActivityLog();

  const refreshAll = () => { refreshStats(); refreshIssues(); refreshMap(); refreshLog(); };
  const showToast  = (msg) => { setToast(msg); setTimeout(()=>setToast(""),3000); };

  const { updateIssue, updatePC, actionLoading } = useIssueActions(refreshAll);

  const handleIssue = async (id, tag) => {
    await updateIssue(id, tag);
    showToast(`Issue → ${tag==="prog"?"In Progress":tag==="fixed"?"Fixed":"Reopened"}`);
    setSelIssue(null);
  };

  const handlePC = async (pcNum, status) => {
    const pc = computers[pcNum];
    if (!pc) return;
    optimisticUpdate(pcNum, status);
    await updatePC(pc.id, status);
    showToast(`${pc.pcLabel} → ${statusLabel(status)}`);
  };

  const filtered = useMemo(()=>issues.filter(i=>{
    if(filter!=="all"&&i.frontendStatus!==filter) return false;
    const q=search.toLowerCase();
    if(q&&!i.pcLabel?.toLowerCase().includes(q)&&!i.studentName?.toLowerCase().includes(q)&&!i.issueType?.toLowerCase().includes(q)) return false;
    return true;
  }),[issues,filter,search]);

  const selIssueObj = issues.find(i=>i.id===selIssue);
  const typeCounts  = useMemo(()=>{ const m={}; issues.forEach(i=>{m[i.issueType]=(m[i.issueType]||0)+1;}); return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,6); },[issues]);
  const maxCount    = Math.max(1,...typeCounts.map(([,c])=>c));
  const hp          = stats?.healthPercent??0;
  const working     = stats?.working??0;
  const minor       = stats?.minor??0;
  const faulty      = stats?.faulty??0;
  const total       = stats?.totalPcs??29;
  const donutGrad   = `conic-gradient(var(--green) 0% ${hp}%, var(--amber) ${hp}% ${hp+Math.round(minor/total*100)}%, var(--red) ${hp+Math.round(minor/total*100)}% 100%)`;

  const tagLabel = t => t==="open"?"Open":t==="prog"?"In Progress":"Fixed";

  return (
    <>
      <style>{ADMIN_CSS}</style>
      <div className="ad-root">
        <nav className="ad-nav">
          <div className="ad-logo"><div className="ad-logo-icon">💻</div>Smart<span>Lab</span></div>
          <div className="ad-logo-sub">ADMIN</div>
          <div className="ad-spacer"/>
          <Clock/>
          {onBack&&<button className="ad-btn" onClick={onBack}>← Student View</button>}
        </nav>

        <div className="ad-tabs">
          {[["overview","Overview"],["issues","Issues"],["map","Lab Map"],["log","Activity Log"]].map(([k,v])=>(
            <div key={k} className={`ad-tab ${tab===k?"active":""}`} onClick={()=>setTab(k)}>{v}</div>
          ))}
        </div>

        {tab==="overview"&&(
          <div className="ad-page">
            <div className="ad-kpi-row">
              <div className="ad-kpi c-red">  <div className="ad-kpi-val">{statsLoading?"…":stats?.openIssues??0}</div><div className="ad-kpi-lbl">Open Issues</div>  <div className="ad-kpi-sub">needs attention</div></div>
              <div className="ad-kpi c-amber"> <div className="ad-kpi-val">{statsLoading?"…":stats?.inProgress??0}</div><div className="ad-kpi-lbl">In Progress</div>  <div className="ad-kpi-sub">being resolved</div></div>
              <div className="ad-kpi c-green"> <div className="ad-kpi-val">{statsLoading?"…":stats?.fixedToday??0}</div><div className="ad-kpi-lbl">Fixed Today</div>  <div className="ad-kpi-sub">resolved issues</div></div>
              <div className="ad-kpi c-cyan">  <div className="ad-kpi-val">{statsLoading?"…":faulty}</div>           <div className="ad-kpi-lbl">Faulty PCs</div>    <div className="ad-kpi-sub">not working</div></div>
              <div className="ad-kpi c-green"> <div className="ad-kpi-val">{statsLoading?"…":`${hp}%`}</div>         <div className="ad-kpi-lbl">Lab Health</div>    <div className="ad-kpi-sub">{working}/{total} working</div></div>
            </div>
            <div className="ad-grid2">
              <div>
                <div className="ad-card">
                  <div className="ad-card-head"><span className="ad-card-title">// Issues by Type</span></div>
                  <div className="ad-card-body">
                    {issuesLoading?<div className="ad-loading">Loading…</div>:(
                      <div className="ad-chart">
                        {typeCounts.map(([lbl,cnt])=>(
                          <div className="ad-bar-row" key={lbl}>
                            <div className="ad-bar-lbl">{lbl}</div>
                            <div className="ad-bar-track"><div className="ad-bar-fill" style={{width:`${Math.round(cnt/maxCount*100)}%`,background:"var(--cyan)"}}/></div>
                            <div className="ad-bar-count">{cnt}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="ad-card">
                  <div className="ad-card-head"><span className="ad-card-title">// Latest Reports</span><button className="ad-filter-chip on" onClick={()=>setTab("issues")}>View All →</button></div>
                  <div className="ad-card-body" style={{padding:0}}>
                    <table className="ad-tbl">
                      <thead><tr><th>PC</th><th>Issue</th><th>Sev</th><th>Status</th><th>Actions</th></tr></thead>
                      <tbody>
                        {issues.filter(i=>i.frontendStatus!=="fixed").slice(0,5).map(iss=>(
                          <tr key={iss.id} onClick={()=>{setSelIssue(iss.id);setTab("issues");}} style={{cursor:"pointer"}}>
                            <td className="ad-tbl-id">{iss.pcLabel}</td>
                            <td className="ad-tbl-desc">{iss.issueType}</td>
                            <td><span className={`ad-sev ${iss.severity}`}>{iss.severity}</span></td>
                            <td><span className={`ad-tag ${iss.frontendStatus}`}>{tagLabel(iss.frontendStatus)}</span></td>
                            <td><div className="ad-action-row" onClick={e=>e.stopPropagation()}>
                              {iss.frontendStatus==="open"&&<button className="ad-btn-sm amber" disabled={!!actionLoading[`issue-${iss.id}`]} onClick={()=>handleIssue(iss.id,"prog")}>Start</button>}
                              {iss.frontendStatus==="prog"&&<button className="ad-btn-sm green" disabled={!!actionLoading[`issue-${iss.id}`]} onClick={()=>handleIssue(iss.id,"fixed")}>Fix ✓</button>}
                            </div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div>
                <div className="ad-card" style={{marginBottom:14}}>
                  <div className="ad-card-head"><span className="ad-card-title">// PC Health</span></div>
                  <div className="ad-card-body">
                    <div className="ad-donut-wrap">
                      <div className="ad-donut" style={{background:donutGrad}}>
                        <div className="ad-donut-inner"><div className="ad-donut-pct">{hp}%</div><div className="ad-donut-sub">healthy</div></div>
                      </div>
                      <div className="ad-donut-legend">
                        <div className="ad-donut-item"><div className="ad-donut-swatch" style={{background:"var(--green)"}}/>Working ({working})</div>
                        <div className="ad-donut-item"><div className="ad-donut-swatch" style={{background:"var(--amber)"}}/>Minor ({minor})</div>
                        <div className="ad-donut-item"><div className="ad-donut-swatch" style={{background:"var(--red)"}}/>Faulty ({faulty})</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ad-card">
                  <div className="ad-card-head"><span className="ad-card-title">// Activity</span></div>
                  <div className="ad-card-body" style={{paddingTop:8}}>
                    <div className="ad-activity">
                      {log.slice(0,6).map((a,i)=>(
                        <div className="ad-act-item" key={a.id??i}>
                          <div className={`ad-act-dot ${a.action?.includes("FIXED")?"fixed":a.action?.includes("PROGRESS")?"prog":"open"}`}/>
                          <div className="ad-act-main">
                            <div className="ad-act-line1">{a.action}</div>
                            <div className="ad-act-line2">{a.performedBy} · {formatDate(a.performedAt)} {formatTime(a.performedAt)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab==="issues"&&(
          <div className="ad-page">
            <div className="ad-card" style={{marginBottom:14}}>
              <div className="ad-card-body" style={{paddingTop:12,paddingBottom:12}}>
                <div className="ad-filter-bar">
                  <input className="ad-search" placeholder="Search PC, student, issue…" value={search} onChange={e=>setSearch(e.target.value)}/>
                  {["all","open","prog","fixed"].map(f=>(
                    <div key={f} className={`ad-filter-chip ${filter===f?"on":""}`} onClick={()=>setFilter(f)}>
                      {f==="all"?"All":f==="prog"?"In Progress":f.charAt(0).toUpperCase()+f.slice(1)}
                      {f!=="all"&&<>({issues.filter(i=>i.frontendStatus===f).length})</>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="ad-grid2">
              <div className="ad-card">
                <div className="ad-card-head"><span className="ad-card-title">// {filtered.length} Issue{filtered.length!==1?"s":""}</span></div>
                {issuesLoading?<div className="ad-loading">Loading…</div>:(
                  <div className="ad-scroll">
                    <table className="ad-tbl">
                      <thead><tr><th>PC</th><th>Student</th><th>Issue</th><th>Sev</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
                      <tbody>
                        {filtered.map(iss=>(
                          <tr key={iss.id} onClick={()=>setSelIssue(iss.id)} style={{cursor:"pointer",background:selIssue===iss.id?"var(--bg4)":undefined}}>
                            <td className="ad-tbl-id">{iss.pcLabel}</td>
                            <td className="ad-tbl-student">{iss.studentName?.split(" ")[0]}</td>
                            <td className="ad-tbl-desc" style={{fontSize:"0.75rem"}}>{iss.issueType}</td>
                            <td><span className={`ad-sev ${iss.severity}`}>{iss.severity}</span></td>
                            <td className="ad-tbl-time">{formatDate(iss.reportedAt)}</td>
                            <td><span className={`ad-tag ${iss.frontendStatus}`}>{tagLabel(iss.frontendStatus)}</span></td>
                            <td><div className="ad-action-row" onClick={e=>e.stopPropagation()}>
                              {iss.frontendStatus==="open" &&<button className="ad-btn-sm amber" disabled={!!actionLoading[`issue-${iss.id}`]} onClick={()=>handleIssue(iss.id,"prog")}>Start</button>}
                              {iss.frontendStatus==="prog" &&<button className="ad-btn-sm green" disabled={!!actionLoading[`issue-${iss.id}`]} onClick={()=>handleIssue(iss.id,"fixed")}>Fix ✓</button>}
                              {iss.frontendStatus==="fixed"&&<button className="ad-btn-sm red"   disabled={!!actionLoading[`issue-${iss.id}`]} onClick={()=>handleIssue(iss.id,"open")}>Reopen</button>}
                            </div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!filtered.length&&<div style={{textAlign:"center",padding:"2rem",fontFamily:"var(--mono)",fontSize:"0.7rem",color:"var(--text3)"}}>no issues match filters</div>}
                  </div>
                )}
              </div>
              <div>
                {selIssueObj?(
                  <div className="ad-detail">
                    <div className="ad-detail-id">{selIssueObj.pcLabel}</div>
                    <div style={{marginBottom:10}}><span className={`ad-tag ${selIssueObj.frontendStatus}`}>{tagLabel(selIssueObj.frontendStatus)}</span></div>
                    {[["Type",selIssueObj.issueType],["Severity",<span className={`ad-sev ${selIssueObj.severity}`}>{selIssueObj.severity}</span>],["Reported By",selIssueObj.studentName],["Roll No.",selIssueObj.rollNumber],["Description",selIssueObj.description||"—"],["Reported",`${formatDate(selIssueObj.reportedAt)} ${formatTime(selIssueObj.reportedAt)}`],...(selIssueObj.resolvedAt?[["Resolved",`${formatDate(selIssueObj.resolvedAt)} ${formatTime(selIssueObj.resolvedAt)}`]]:[])].map(([k,v])=>(
                      <div className="ad-detail-row" key={k}><span className="ad-detail-key">{k}</span><span className="ad-detail-val" style={{textAlign:"right",maxWidth:180,fontSize:"0.75rem"}}>{v}</span></div>
                    ))}
                    <div className="ad-detail-actions">
                      {selIssueObj.frontendStatus==="open" &&<button className="ad-btn-full amber" onClick={()=>handleIssue(selIssueObj.id,"prog")}>⚙ Mark In Progress</button>}
                      {selIssueObj.frontendStatus==="prog" &&<button className="ad-btn-full green" onClick={()=>handleIssue(selIssueObj.id,"fixed")}>✓ Mark as Fixed</button>}
                      {selIssueObj.frontendStatus==="fixed"&&<button className="ad-btn-full red"   onClick={()=>handleIssue(selIssueObj.id,"open")}>↩ Reopen Issue</button>}
                    </div>
                  </div>
                ):(
                  <div className="ad-card"><div className="ad-card-body" style={{textAlign:"center",padding:"2.5rem 1rem",fontFamily:"var(--mono)",fontSize:"0.7rem",color:"var(--text3)",lineHeight:2}}>← select an issue<br/>to see details</div></div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab==="map"&&(
          <div className="ad-page">
            <div className="ad-grid2">
              <div>
                <div className="ad-card">
                  <div className="ad-card-head"><span className="ad-card-title">// Lab 3 — Floor Map</span><div style={{display:"flex",gap:10,fontSize:"0.65rem",fontFamily:"var(--mono)",alignItems:"center"}}><span style={{color:"var(--green)"}}>● Working</span><span style={{color:"var(--amber)"}}>● Minor</span><span style={{color:"var(--red)"}}>● Faulty</span></div></div>
                  <div className="ad-card-body">
                    <div style={{textAlign:"center",marginBottom:14,fontFamily:"var(--mono)",fontSize:"0.6rem",color:"var(--cyan)",letterSpacing:"0.2em",opacity:0.7}}>── PROJECTOR / BOARD ──</div>
                    {mapLoading?<div className="ad-loading">Loading…</div>:(
                      <div className="ad-minimap">
                        {LAB_ROWS.map((row,ri)=>(
                          <div className="ad-minimap-row" key={ri}>
                            <div className="ad-minimap-lbl">{ri+1}</div>
                            <div className="ad-minimap-pcs">
                              {row.left.map(n=>(
                                <div key={n} className={`ad-mpc ${computers[n]?.frontendStatus??"ok"}`}
                                  onClick={()=>{setMapSel(n);setSelectedPc(computers[n]);}}
                                  style={mapSel===n?{outline:"2px solid var(--cyan)",outlineOffset:"2px"}:{}}
                                >{String(n).padStart(2,"0")}</div>
                              ))}
                              <div style={{width:20,flexShrink:0}}/>
                              {row.right.map(n=>(
                                <div key={n} className={`ad-mpc ${computers[n]?.frontendStatus??"ok"}`}
                                  onClick={()=>{setMapSel(n);setSelectedPc(computers[n]);}}
                                  style={mapSel===n?{outline:"2px solid var(--cyan)",outlineOffset:"2px"}:{}}
                                >{String(n).padStart(2,"0")}</div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div>
                {mapSel?(
                  <div className="ad-detail">
                    <div className="ad-detail-id">{selectedPc?.pcLabel}</div>
                    <div style={{marginBottom:10}}><span className={`ad-tag ${computers[mapSel]?.frontendStatus==="ok"?"fixed":computers[mapSel]?.frontendStatus==="faulty"?"open":"prog"}`}>{statusLabel(computers[mapSel]?.frontendStatus)}</span></div>
                    {[["Status",statusLabel(computers[mapSel]?.frontendStatus)],["Row",computers[mapSel]?.rowName??"—"],["Side",computers[mapSel]?.side??"—"],["Issues",issues.filter(i=>i.computerId===mapSel).length+" total"]].map(([k,v])=>(
                      <div className="ad-detail-row" key={k}><span className="ad-detail-key">{k}</span><span className="ad-detail-val" style={{fontSize:"0.75rem"}}>{v}</span></div>
                    ))}
                    <div className="ad-detail-actions">
                      {computers[mapSel]?.frontendStatus!=="ok"     &&<button className="ad-btn-full green" onClick={()=>handlePC(mapSel,"ok")}>✓ Mark as Working</button>}
                      {computers[mapSel]?.frontendStatus!=="faulty"  &&<button className="ad-btn-full red"   onClick={()=>handlePC(mapSel,"faulty")}>✕ Mark as Faulty</button>}
                      {computers[mapSel]?.frontendStatus!=="offline" &&<button className="ad-btn-full red" style={{opacity:0.6}} onClick={()=>handlePC(mapSel,"offline")}>⏻ Set Offline</button>}
                    </div>
                  </div>
                ):(
                  <div className="ad-card"><div className="ad-card-body" style={{textAlign:"center",padding:"2.5rem 1rem",fontFamily:"var(--mono)",fontSize:"0.7rem",color:"var(--text3)",lineHeight:2}}>← click any PC<br/>to manage its status</div></div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab==="log"&&(
          <div className="ad-page">
            <div className="ad-kpi-row" style={{marginBottom:14}}>
              <div className="ad-kpi c-red">  <div className="ad-kpi-val">{issues.length}</div>                                                <div className="ad-kpi-lbl">Total Reports</div></div>
              <div className="ad-kpi c-amber"> <div className="ad-kpi-val">{issues.filter(i=>i.frontendStatus==="open").length}</div>          <div className="ad-kpi-lbl">Still Open</div></div>
              <div className="ad-kpi c-green"> <div className="ad-kpi-val">{issues.filter(i=>i.frontendStatus==="fixed").length}</div>         <div className="ad-kpi-lbl">Resolved</div></div>
              <div className="ad-kpi c-cyan">  <div className="ad-kpi-val">{issues.length?Math.round(issues.filter(i=>i.frontendStatus==="fixed").length/issues.length*100):0}%</div><div className="ad-kpi-lbl">Resolution Rate</div></div>
            </div>
            <div className="ad-card">
              <div className="ad-card-head"><span className="ad-card-title">// Full Issue Log</span></div>
              {issuesLoading?<div className="ad-loading">Loading…</div>:(
                <div className="ad-scroll">
                  <table className="ad-tbl">
                    <thead><tr><th>PC</th><th>Type</th><th>Student</th><th>Roll No.</th><th>Sev</th><th>Reported</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {issues.map(iss=>(
                        <tr key={iss.id}>
                          <td className="ad-tbl-id">{iss.pcLabel}</td>
                          <td style={{fontSize:"0.72rem",color:"var(--text2)"}}>{iss.issueType}</td>
                          <td className="ad-tbl-student">{iss.studentName}</td>
                          <td className="ad-tbl-student">{iss.rollNumber}</td>
                          <td><span className={`ad-sev ${iss.severity}`}>{iss.severity}</span></td>
                          <td className="ad-tbl-time">{formatDate(iss.reportedAt)} {formatTime(iss.reportedAt)}</td>
                          <td><span className={`ad-tag ${iss.frontendStatus}`}>{tagLabel(iss.frontendStatus)}</span></td>
                          <td><div className="ad-action-row">
                            {iss.frontendStatus==="open" &&<button className="ad-btn-sm amber" onClick={()=>handleIssue(iss.id,"prog")}>Start</button>}
                            {iss.frontendStatus==="prog" &&<button className="ad-btn-sm green" onClick={()=>handleIssue(iss.id,"fixed")}>Fix ✓</button>}
                            {iss.frontendStatus==="fixed"&&<button className="ad-btn-sm red"   onClick={()=>handleIssue(iss.id,"open")}>Reopen</button>}
                          </div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        <div className={`ad-toast ${toast?"show":""}`}>✓ {toast}</div>
      </div>
    </>
  );
}
