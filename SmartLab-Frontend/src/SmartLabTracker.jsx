import { useState, useCallback } from "react";
import { useLabMap, useIssues, useReportIssue } from "./useLabData";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Outfit:wght@300;400;500;600;700;800&display=swap');`;

const css = `${FONTS}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
.sl-root{--bg:#0b0d13;--bg2:#10131c;--bg3:#161a27;--bg4:#1d2235;--rim:#252d44;--rim2:#2e3852;--cyan:#00d4ff;--cdim:rgba(0,212,255,0.12);--green:#00e676;--gdim:rgba(0,230,118,0.10);--amber:#ffab00;--adim:rgba(255,171,0,0.10);--red:#ff3d57;--rdim:rgba(255,61,87,0.10);--text:#dce6f7;--text2:#7b8db5;--text3:#47577a;--mono:'JetBrains Mono',monospace;--body:'Outfit',sans-serif;font-family:var(--body);background:var(--bg);color:var(--text);min-height:100vh;display:flex;flex-direction:column;overflow-x:hidden;position:relative;}
.sl-root::before{content:'';position:relative;inset:0;pointer-events:none;z-index:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px);}
.sl-nav{position:sticky;top:0;z-index:50;height:56px;background:rgba(11,13,19,0.93);backdrop-filter:blur(20px);border-bottom:1px solid var(--rim);display:flex;align-items:center;padding:0 1.5rem;gap:1rem;}
.sl-logo{display:flex;align-items:center;gap:9px;font-family:var(--mono);font-size:0.9rem;font-weight:700;letter-spacing:0.08em;}
.sl-logo-icon{width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,var(--cyan),#6c63ff);display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 0 14px rgba(0,212,255,0.3);}
.sl-logo span{color:var(--cyan);}
.sl-spacer{flex:1;}
.sl-pill{background:var(--bg3);border:1px solid var(--rim);border-radius:20px;padding:4px 12px;font-family:var(--mono);font-size:0.72rem;color:var(--text2);}
.sl-pill b{color:var(--amber);}
.sl-btn{background:transparent;border:1px solid var(--rim2);border-radius:8px;padding:6px 14px;font-family:var(--mono);font-size:0.72rem;color:var(--text2);cursor:pointer;transition:all 0.2s;}
.sl-btn:hover{border-color:var(--cyan);color:var(--cyan);background:var(--cdim);}
.sl-strip{background:var(--bg2);border-bottom:1px solid var(--rim);padding:8px 1.5rem;display:flex;align-items:center;gap:12px;flex-wrap:wrap;font-size:0.78rem;color:var(--text2);}
.sl-strip-dot{width:6px;height:6px;border-radius:50%;background:var(--green);box-shadow:0 0 8px var(--green);animation:blink 2s ease-in-out infinite;}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0.4}}
.sl-strip strong{color:var(--text);font-weight:600;}
.sl-strip-sep{color:var(--rim2);}
.sl-body{flex:1;display:flex;width:100%;justify-content:space-between;position:relative;}
.sl-canvas{flex:1;padding:20px 40px;box-sizing:border-box;width:100%;}
.sl-hint{font-family:var(--mono);font-size:0.64rem;color:var(--text3);letter-spacing:0.15em;text-transform:uppercase;margin-bottom:1.4rem;display:flex;align-items:center;gap:8px;}
.sl-hint::after{content:'';flex:1;height:1px;background:var(--rim);}
.sl-proj-wrap{display:flex;flex-direction:column;align-items:center;margin-bottom:2rem;}
.sl-proj{width:min(520px,92%);height:38px;background:var(--bg3);border:1px solid var(--rim2);border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;}
.sl-proj-beam{position:absolute;inset:0;background:linear-gradient(90deg,transparent,var(--cdim),rgba(0,212,255,0.18),var(--cdim),transparent);animation:beam 4s ease-in-out infinite;}
@keyframes beam{0%,100%{opacity:0.4}50%{opacity:1}}
.sl-proj-lbl{font-family:var(--mono);font-size:0.7rem;letter-spacing:0.28em;color:var(--cyan);text-transform:uppercase;position:relative;z-index:1;opacity:0.85;}
.sl-proj-base{width:min(560px,100%);height:5px;background:linear-gradient(90deg,transparent,var(--rim2),var(--rim2),transparent);border-radius:0 0 3px 3px;}
.sl-proj-sub{font-family:var(--mono);font-size:0.6rem;color:var(--text3);letter-spacing:0.2em;text-transform:uppercase;margin-top:7px;}
.sl-grid{display:flex;flex-direction:column;gap:14px;align-items:center;justify-content:center;min-width:700px;}
.sl-grid-scroll{width:100%;overflow-x:auto;overflow-y:hidden;}
.sl-row{display:flex;align-items:center;width:100%;}
.sl-cluster{display:flex;gap:10px;}
.sl-cluster-left{flex:1;justify-content:flex-end;}
.sl-cluster-right{flex:1;justify-content:flex-start;}
.sl-aisle{width:56px;flex-shrink:0;display:flex;align-items:center;justify-content:center;}
.sl-aisle-line{width:1px;height:52px;background:linear-gradient(180deg,transparent,var(--rim),transparent);}
.sl-pc{width:58px;height:56px;border-radius:12px;border:1.5px solid;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;gap:4px;position:relative;transition:transform 0.15s cubic-bezier(.34,1.56,.64,1),box-shadow 0.2s,border-color 0.2s;user-select:none;flex-shrink:0;}
.sl-pc-icon{font-size:17px;line-height:1;}
.sl-pc-num{font-family:var(--mono);font-size:0.5rem;font-weight:500;opacity:0.75;letter-spacing:0.04em;}
.sl-pc::after{content:'';position:absolute;bottom:5px;right:6px;width:5px;height:5px;border-radius:50%;}
.sl-pc.ok{background:#081a10;border-color:#143d22;color:var(--green);}
.sl-pc.ok::after{background:var(--green);box-shadow:0 0 5px var(--green);}
.sl-pc.ok:hover{transform:translateY(-4px) scale(1.07);border-color:var(--green);box-shadow:0 8px 24px rgba(0,230,118,0.25);}
.sl-pc.minor{background:#1c1300;border-color:#3d2c00;color:var(--amber);}
.sl-pc.minor::after{background:var(--amber);box-shadow:0 0 5px var(--amber);}
.sl-pc.minor:hover{transform:translateY(-4px) scale(1.07);border-color:var(--amber);box-shadow:0 8px 24px rgba(255,171,0,0.25);}
.sl-pc.faulty{background:#160507;border-color:#3d0f16;color:var(--red);animation:pcpulse 2.5s ease-in-out infinite;}
.sl-pc.faulty::after{background:var(--red);box-shadow:0 0 5px var(--red);}
.sl-pc.faulty:hover{transform:translateY(-4px) scale(1.07);border-color:var(--red);box-shadow:0 8px 28px rgba(255,61,87,0.35);animation:none;}
.sl-pc.offline{background:var(--bg2);border-color:var(--rim);color:var(--text3);cursor:default;opacity:0.4;}
.sl-pc.selected{border-color:var(--cyan)!important;box-shadow:0 0 0 3px rgba(0,212,255,0.22),0 8px 26px rgba(0,212,255,0.28)!important;transform:translateY(-5px) scale(1.11)!important;background:#041820!important;color:var(--cyan)!important;animation:none!important;}
@keyframes pcpulse{0%,100%{box-shadow:0 0 0 0 rgba(255,61,87,0)}50%{box-shadow:0 0 0 5px rgba(255,61,87,0.14)}}
.sl-legend{display:flex;gap:18px;flex-wrap:wrap;margin-top:1.8rem;padding:12px 16px;background:var(--bg2);border:1px solid var(--rim);border-radius:10px;width:100%;}
.sl-legend-item{display:flex;align-items:center;gap:7px;font-size:0.72rem;color:var(--text2);}
.sl-legend-dot{width:9px;height:9px;border-radius:50%;}
.sl-legend-dot.ok{background:var(--green);box-shadow:0 0 5px var(--green);}
.sl-legend-dot.minor{background:var(--amber);box-shadow:0 0 5px var(--amber);}
.sl-legend-dot.faulty{background:var(--red);box-shadow:0 0 5px var(--red);}
.sl-legend-dot.offline{background:var(--rim2);}
.sl-sidebar{width:320px;flex-shrink:0;background:var(--bg2);border-left:1px solid var(--rim);padding:1.4rem;overflow-y:auto;display:flex;flex-direction:column;gap:1.4rem;}
.sl-sec-title{font-family:var(--mono);font-size:0.6rem;text-transform:uppercase;letter-spacing:0.18em;color:var(--text3);padding-bottom:7px;border-bottom:1px solid var(--rim);margin-bottom:9px;}
.sl-stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;}
.sl-stat{background:var(--bg3);border:1px solid var(--rim);border-radius:9px;padding:10px 12px;}
.sl-stat-num{font-family:var(--mono);font-size:1.4rem;font-weight:700;line-height:1;margin-bottom:2px;}
.sl-stat-lbl{font-size:0.62rem;color:var(--text2);}
.sl-stat.ok .sl-stat-num{color:var(--green);}
.sl-stat.minor .sl-stat-num{color:var(--amber);}
.sl-stat.fault .sl-stat-num{color:var(--red);}
.sl-stat.off .sl-stat-num{color:var(--text3);}
.sl-sel-box{background:var(--bg3);border:1px solid var(--rim);border-radius:11px;padding:14px;min-height:88px;transition:border-color 0.3s,box-shadow 0.3s;}
.sl-sel-box.active{border-color:var(--cyan);box-shadow:0 0 0 1px rgba(0,212,255,0.15);}
.sl-sel-placeholder{color:var(--text3);font-family:var(--mono);font-size:0.72rem;line-height:1.8;text-align:center;padding-top:8px;}
.sl-sel-name{font-family:var(--mono);font-size:1rem;font-weight:700;color:var(--cyan);margin-bottom:5px;}
.sl-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;font-family:var(--mono);font-size:0.65rem;font-weight:500;margin-bottom:9px;border:1px solid;}
.sl-badge.ok{background:var(--gdim);color:var(--green);border-color:rgba(0,230,118,0.3);}
.sl-badge.minor{background:var(--adim);color:var(--amber);border-color:rgba(255,171,0,0.3);}
.sl-badge.faulty{background:var(--rdim);color:var(--red);border-color:rgba(255,61,87,0.3);}
.sl-btn-report{width:100%;padding:9px 0;background:var(--rdim);border:1px solid rgba(255,61,87,0.4);border-radius:8px;color:var(--red);font-family:var(--mono);font-size:0.75rem;font-weight:700;cursor:pointer;transition:all 0.2s;margin-top:7px;letter-spacing:0.06em;}
.sl-btn-report:hover{background:rgba(255,61,87,0.2);border-color:var(--red);box-shadow:0 4px 14px rgba(255,61,87,0.25);transform:translateY(-1px);}
.sl-issues{display:flex;flex-direction:column;gap:7px;max-height:280px;overflow-y:auto;}
.sl-issues::-webkit-scrollbar{width:3px;}
.sl-issues::-webkit-scrollbar-thumb{background:var(--rim2);border-radius:2px;}
.sl-issue{background:var(--bg3);border:1px solid var(--rim);border-radius:8px;padding:9px 11px;animation:fadeSlide 0.35s ease-out both;}
@keyframes fadeSlide{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:translateX(0)}}
.sl-issue-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;}
.sl-issue-id{font-family:var(--mono);font-size:0.68rem;font-weight:700;color:var(--cyan);}
.sl-issue-time{font-family:var(--mono);font-size:0.6rem;color:var(--text3);}
.sl-issue-desc{font-size:0.74rem;color:var(--text2);line-height:1.4;margin-bottom:4px;}
.sl-tag{display:inline-block;padding:2px 7px;border-radius:4px;font-family:var(--mono);font-size:0.58rem;font-weight:700;}
.sl-tag.open{background:var(--rdim);color:var(--red);}
.sl-tag.prog{background:var(--adim);color:var(--amber);}
.sl-tag.fixed{background:var(--gdim);color:var(--green);}
.sl-overlay{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,0.82);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity 0.25s;}
.sl-overlay.open{opacity:1;pointer-events:all;}
.sl-modal{background:var(--bg2);border:1px solid var(--rim2);border-radius:18px;width:min(460px,92vw);box-shadow:0 32px 80px rgba(0,0,0,0.7);transform:translateY(22px) scale(0.96);transition:transform 0.28s cubic-bezier(.34,1.2,.64,1);overflow:hidden;}
.sl-overlay.open .sl-modal{transform:translateY(0) scale(1);}
.sl-m-head{padding:18px 22px 14px;border-bottom:1px solid var(--rim);display:flex;align-items:center;justify-content:space-between;}
.sl-m-title{font-family:var(--mono);font-size:0.85rem;font-weight:700;}
.sl-m-pcbadge{font-family:var(--mono);font-size:0.75rem;background:var(--cdim);color:var(--cyan);padding:4px 11px;border-radius:6px;border:1px solid rgba(0,212,255,0.28);}
.sl-m-close{background:none;border:none;color:var(--text2);font-size:1.1rem;cursor:pointer;padding:4px 7px;border-radius:6px;transition:all 0.2s;line-height:1;}
.sl-m-close:hover{background:var(--bg3);color:var(--text);}
.sl-m-body{padding:18px 22px;display:flex;flex-direction:column;gap:14px;}
.sl-fg label{display:block;font-family:var(--mono);font-size:0.62rem;color:var(--text3);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;}
.sl-input,.sl-select,.sl-textarea{width:100%;background:var(--bg3);border:1px solid var(--rim);border-radius:8px;padding:9px 13px;color:var(--text);font-family:var(--body);font-size:0.84rem;outline:none;transition:border-color 0.2s,box-shadow 0.2s;resize:vertical;}
.sl-input:focus,.sl-select:focus,.sl-textarea:focus{border-color:var(--cyan);box-shadow:0 0 0 2px rgba(0,212,255,0.12);}
.sl-input::placeholder,.sl-textarea::placeholder{color:var(--text3);}
.sl-input.err,.sl-select.err{border-color:var(--red);}
.sl-select option{background:var(--bg3);}
.sl-chips{display:flex;flex-wrap:wrap;gap:7px;}
.sl-chip{padding:5px 11px;border-radius:20px;border:1px solid var(--rim);background:var(--bg3);color:var(--text2);font-family:var(--mono);font-size:0.67rem;cursor:pointer;transition:all 0.18s;user-select:none;}
.sl-chip:hover{border-color:var(--rim2);color:var(--text);}
.sl-chip.on{border-color:var(--red);background:var(--rdim);color:var(--red);}
.sl-m-foot{padding:14px 22px 18px;border-top:1px solid var(--rim);display:flex;gap:9px;justify-content:flex-end;align-items:center;}
.sl-btn-cancel{padding:9px 18px;background:transparent;border:1px solid var(--rim);border-radius:8px;color:var(--text2);font-family:var(--mono);font-size:0.75rem;cursor:pointer;transition:all 0.2s;}
.sl-btn-cancel:hover{border-color:var(--rim2);color:var(--text);}
.sl-btn-submit{padding:9px 22px;background:var(--rdim);border:1px solid rgba(255,61,87,0.5);border-radius:8px;color:var(--red);font-family:var(--mono);font-size:0.75rem;font-weight:700;cursor:pointer;transition:all 0.2s;}
.sl-btn-submit:hover:not(:disabled){background:rgba(255,61,87,0.2);border-color:var(--red);box-shadow:0 4px 16px rgba(255,61,87,0.3);transform:translateY(-1px);}
.sl-btn-submit:disabled{opacity:0.5;cursor:not-allowed;}
.sl-err-msg{font-family:var(--mono);font-size:0.65rem;color:var(--red);flex:1;}
.sl-toast{position:fixed;bottom:22px;right:22px;z-index:300;background:#081a10;border:1px solid var(--green);border-radius:10px;padding:12px 18px;font-family:var(--mono);font-size:0.75rem;color:var(--green);box-shadow:0 8px 28px rgba(0,230,118,0.18);transform:translateY(72px);opacity:0;transition:all 0.38s cubic-bezier(.34,1.2,.64,1);pointer-events:none;}
.sl-toast.show{transform:translateY(0);opacity:1;}
.sl-loading{display:flex;align-items:center;justify-content:center;height:200px;font-family:var(--mono);font-size:0.72rem;color:var(--text3);letter-spacing:0.1em;}
.sl-err-banner{background:var(--rdim);border:1px solid rgba(255,61,87,0.3);border-radius:8px;padding:10px 14px;font-family:var(--mono);font-size:0.7rem;color:var(--red);margin-bottom:1rem;}
@media(max-width:700px){.sl-body{flex-direction:column;}.sl-canvas{flex:none;width:100%;}.sl-sidebar{width:100%;border-left:none;border-top:1px solid var(--rim);}.sl-pc{width:48px;height:46px;}}`;

const LAB_ROWS = [
  { left:[1,2,3,4],    right:[5,6,7,8]    },
  { left:[9,10,11,12], right:[13,14,15,16] },
  { left:[17,18,19,20],right:[21,22,23,24] },
  { left:[25,26,27,28],right:[29]          },
];

const ISSUE_CHIPS = ["🚫 Not Booting","⌨️ Keyboard","🖱️ Mouse","🌐 No Internet","🖥️ Display","🔊 Audio","💾 Software","🐢 Very Slow","🔌 No Power"];
const statusIcon  = s => ({ ok:"🖥️", faulty:"⚠️", minor:"🖥️", offline:"✕" }[s] ?? "🖥️");
const statusLabel = s => ({ ok:"Working", faulty:"Not Working", minor:"Minor Issue", offline:"Offline" }[s] ?? "");

function PCTile({ num, frontendStatus, selected, onClick }) {
  const cls = ["sl-pc", frontendStatus, selected ? "selected" : ""].filter(Boolean).join(" ");
  return (
    <div className={cls} onClick={() => onClick(num)}>
      <span className="sl-pc-icon">{statusIcon(frontendStatus)}</span>
      <span className="sl-pc-num">{String(num).padStart(2,"0")}</span>
    </div>
  );
}

export default function SmartLabTracker({ onAdmin }) {
  const { computers, loading, error: mapError, optimisticUpdate } = useLabMap();
  const { issues, loading: issuesLoading, refresh: refreshIssues } = useIssues();

  const [selected,setSelected] = useState(null);
  const [modal,   setModal]    = useState(false);
  const [toast,   setToast]    = useState(false);
  const [chips,   setChips]    = useState([]);
  const [fname,   setFname]    = useState("");
  const [froll,   setFroll]    = useState("");
  const [fsev,    setFsev]     = useState("");
  const [fdesc,   setFdesc]    = useState("");
  const [formErr, setFormErr]  = useState("");

  const { submit, submitting, error: submitError } = useReportIssue(() => {
    const newStatus = (fsev === "HIGH" || fsev === "CRITICAL") ? "faulty" : "minor";
    optimisticUpdate(selected, newStatus);
    refreshIssues();
    closeModal();
    setToast(true);
    setTimeout(() => setToast(false), 3500);
  });

  const pcList = Object.values(computers);
  const stats = {
    ok:     pcList.filter(p=>p.frontendStatus==="ok").length,
    minor:  pcList.filter(p=>p.frontendStatus==="minor").length,
    faulty: pcList.filter(p=>p.frontendStatus==="faulty").length,
    offline:pcList.filter(p=>p.frontendStatus==="offline").length,
  };
  const openCount   = issues.filter(i=>i.frontendStatus==="open").length;
  const selectedPC  = selected ? computers[selected] : null;
  const selectedId  = selected ? `PC-${String(selected).padStart(2,"0")}` : "";

  const selectPC = useCallback((num) => {
    if (computers[num]?.frontendStatus === "offline") return;
    setSelected(num);
  }, [computers]);

  const closeModal = () => {
    setModal(false); setChips([]); setFname(""); setFroll("");
    setFsev(""); setFdesc(""); setFormErr("");
  };

  const handleSubmit = async () => {
    if (!fname.trim()) { setFormErr("Name is required"); return; }
    if (!froll.trim()) { setFormErr("Roll number is required"); return; }
    if (!chips.length) { setFormErr("Select at least one issue type"); return; }
    if (!fsev)         { setFormErr("Select severity"); return; }
    setFormErr("");
    await submit({
      computerId:  selectedPC.id,
      studentName: fname.trim(),
      rollNumber:  froll.trim(),
      issueType:   chips[0].replace(/[^\w\s]/g,"").trim(),
      severity:    fsev,
      description: fdesc.trim(),
    });
  };

  return (
    <>
      <style>{css}</style>
      <div className="sl-root">
        <nav className="sl-nav">
          <div className="sl-logo"><div className="sl-logo-icon">💻</div>Smart<span>Lab</span></div>
          <div className="sl-spacer" />
          <div className="sl-pill">Open: <b>{openCount}</b></div>
          {onAdmin && <button className="sl-btn" onClick={onAdmin}>Admin →</button>}
        </nav>

        <div className="sl-strip">
          <div className="sl-strip-dot"/>
          <strong>Lab 3 — Block B</strong><span className="sl-strip-sep">|</span>
          🏫 Dept. of Computer Science<span className="sl-strip-sep">|</span>
          🖥️<strong>29 Systems</strong><span className="sl-strip-sep">|</span>
          🕐 <strong>08:00 AM – 02:30 PM</strong><span className="sl-strip-sep">|</span>
          Batch: <strong>CS-3A</strong>
        </div>

        <div className="sl-body">
          <div className="sl-canvas">
            <div className="sl-hint">lab floor map — click a system to report an issue</div>
            {mapError && <div className="sl-err-banner">⚠ Could not load lab map: {mapError}</div>}

            <div className="sl-proj-wrap">
              <div className="sl-proj">
                <div className="sl-proj-beam"/>
                <span className="sl-proj-lbl">Projector / Board</span>
              </div>
              <div className="sl-proj-base"/>
              <div className="sl-proj-sub">All Eyes This Way</div>
            </div>

            {loading
              ? <div className="sl-loading">Loading lab map…</div>
              : <div className="sl-grid-scroll">
                  <div className="sl-grid">
                    {LAB_ROWS.map((row,ri)=>(
                      <div className="sl-row" key={ri}>
                        <div className="sl-cluster sl-cluster-left">
                          {row.left.map(n=><PCTile key={n} num={n} frontendStatus={computers[n]?.frontendStatus??"ok"} selected={selected===n} onClick={selectPC}/>)}
                        </div>
                        <div className="sl-aisle"><div className="sl-aisle-line"/></div>
                        <div className="sl-cluster sl-cluster-right">
                          {row.right.map(n=><PCTile key={n} num={n} frontendStatus={computers[n]?.frontendStatus??"ok"} selected={selected===n} onClick={selectPC}/>)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
            }

            <div className="sl-legend">
              {["ok","minor","faulty","offline"].map(s=>(
                <div className="sl-legend-item" key={s}>
                  <div className={`sl-legend-dot ${s}`}/>{statusLabel(s)}
                </div>
              ))}
            </div>
          </div>

          <div className="sl-sidebar">
            <div>
              <div className="sl-sec-title">// System Stats</div>
              <div className="sl-stat-grid">
                <div className="sl-stat ok">   <div className="sl-stat-num">{stats.ok}</div>    <div className="sl-stat-lbl">Working</div></div>
                <div className="sl-stat minor"> <div className="sl-stat-num">{stats.minor}</div>  <div className="sl-stat-lbl">Minor Issue</div></div>
                <div className="sl-stat fault"> <div className="sl-stat-num">{stats.faulty}</div> <div className="sl-stat-lbl">Not Working</div></div>
                <div className="sl-stat off">   <div className="sl-stat-num">{stats.offline}</div><div className="sl-stat-lbl">Offline</div></div>
              </div>
            </div>

            <div>
              <div className="sl-sec-title">// Selected System</div>
              <div className={`sl-sel-box ${selected?"active":""}`}>
                {!selected
                  ? <div className="sl-sel-placeholder">← click a system<br/>on the map</div>
                  : <>
                      <div className="sl-sel-name">{selectedId}</div>
                      <div className={`sl-badge ${selectedPC?.frontendStatus}`}>● {statusLabel(selectedPC?.frontendStatus)}</div>
                      <button className="sl-btn-report" onClick={()=>setModal(true)}>⚠ Report Issue for {selectedId}</button>
                    </>
                }
              </div>
            </div>

            <div>
              <div className="sl-sec-title">// Recent Issues</div>
              <div className="sl-issues">
                {issuesLoading
                  ? <div style={{fontFamily:"var(--mono)",fontSize:"0.65rem",color:"var(--text3)",textAlign:"center",padding:"1rem"}}>Loading…</div>
                  : issues.slice(0,8).map((iss,i)=>(
                      <div className="sl-issue" key={iss.id??i} style={{animationDelay:`${i*40}ms`}}>
                        <div className="sl-issue-top">
                          <span className="sl-issue-id">{iss.pcLabel}</span>
                          <span className="sl-issue-time">{iss.reportedAt?.slice(11,16)}</span>
                        </div>
                        <div className="sl-issue-desc">{iss.issueType}</div>
                        <span className={`sl-tag ${iss.frontendStatus}`}>
                          {iss.frontendStatus==="open"?"Open":iss.frontendStatus==="prog"?"In Progress":"Fixed"}
                        </span>
                      </div>
                    ))
                }
              </div>
            </div>
          </div>
        </div>

        {/* MODAL */}
        <div className={`sl-overlay ${modal?"open":""}`} onClick={e=>e.target===e.currentTarget&&closeModal()}>
          <div className="sl-modal">
            <div className="sl-m-head">
              <span className="sl-m-title">⚠ Report Issue</span>
              <div style={{display:"flex",alignItems:"center",gap:9}}>
                <span className="sl-m-pcbadge">{selectedId}</span>
                <button className="sl-m-close" onClick={closeModal}>✕</button>
              </div>
            </div>
            <div className="sl-m-body">
              <div className="sl-fg">
                <label>Your Name</label>
                <input className={`sl-input ${formErr&&!fname?"err":""}`} placeholder="e.g. Ravi Kumar" value={fname} onChange={e=>{setFname(e.target.value);setFormErr("");}}/>
              </div>
              <div className="sl-fg">
                <label>Roll Number</label>
                <input className={`sl-input ${formErr&&!froll?"err":""}`} placeholder="e.g. 22CS047" value={froll} onChange={e=>{setFroll(e.target.value);setFormErr("");}}/>
              </div>
              <div className="sl-fg">
                <label>Issue Type — select all that apply</label>
                <div className="sl-chips">
                  {ISSUE_CHIPS.map(c=>(
                    <div key={c} className={`sl-chip ${chips.includes(c)?"on":""}`} onClick={()=>setChips(p=>p.includes(c)?p.filter(x=>x!==c):[...p,c])}>{c}</div>
                  ))}
                </div>
              </div>
              <div className="sl-fg">
                <label>Severity</label>
                <select className={`sl-select ${formErr&&!fsev?"err":""}`} value={fsev} onChange={e=>{setFsev(e.target.value);setFormErr("");}}>
                  <option value="">Select severity…</option>
                  <option value="MINOR">Minor — small inconvenience</option>
                  <option value="MEDIUM">Medium — affects work</option>
                  <option value="HIGH">High — cannot use system</option>
                  <option value="CRITICAL">Critical — safety concern</option>
                </select>
              </div>
              <div className="sl-fg">
                <label>Additional Details (optional)</label>
                <textarea className="sl-textarea" rows={2} placeholder="Any extra info for the admin…" value={fdesc} onChange={e=>setFdesc(e.target.value)}/>
              </div>
            </div>
            <div className="sl-m-foot">
              {(formErr||submitError) && <span className="sl-err-msg">{formErr||submitError}</span>}
              <button className="sl-btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="sl-btn-submit" disabled={submitting} onClick={handleSubmit}>
                {submitting?"Submitting…":"Submit Report →"}
              </button>
            </div>
          </div>
        </div>

        <div className={`sl-toast ${toast?"show":""}`}>✓ Reported — admin notified!</div>
      </div>
    </>
  );
}
