import React,{useEffect,useMemo,useRef,useState}from'react';
import{useAuth}from'../auth/AuthContext.jsx';
import{fetchAuthenticatedBlob}from'../api/client.js';
import{Icon}from'./icons.jsx';

const QUICK=['I am at the entrance','Please call me when you arrive','Please leave it with me directly'];
const human=v=>String(v||'').replaceAll('_',' ').toLowerCase().replace(/(^|\s)\S/g,m=>m.toUpperCase());
const ago=value=>{if(!value)return'No live point yet';const s=Math.max(0,Math.round((Date.now()-new Date(value).getTime())/1000));if(s<10)return'just now';if(s<60)return`${s}s ago`;const m=Math.floor(s/60);return m<60?`${m}m ago`:`${Math.floor(m/60)}h ago`};

export function DeliveryExperience({orderRef}){
 const{api}=useAuth();const[data,setData]=useState(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[message,setMessage]=useState(''),[sending,setSending]=useState(false),[proofUrls,setProofUrls]=useState({}),[proofBusy,setProofBusy]=useState('');const alive=useRef(true);
 const load=async({quiet=false}={})=>{if(!quiet){setLoading(true);setError('')}try{const r=await api.request(`/v1/customer/orders/${encodeURIComponent(orderRef)}/delivery-experience`,{auth:true});if(alive.current)setData(r.data.delivery)}catch(e){if(alive.current&&!quiet)setError(e.message)}finally{if(alive.current&&!quiet)setLoading(false)}};
 useEffect(()=>{alive.current=true;load();return()=>{alive.current=false;Object.values(proofUrls).forEach(url=>URL.revokeObjectURL(url))}},[orderRef]);
 const active=Boolean(data?.dispatch&&!['DELIVERED','CANCELLED'].includes(data.dispatch.status));
 useEffect(()=>{if(!active)return undefined;const id=setInterval(()=>load({quiet:true}).catch(()=>{}),10000);return()=>clearInterval(id)},[active,orderRef]);
 const send=async(body=message)=>{const text=String(body||'').trim();if(!text||!data?.conversation?.can_send)return;setSending(true);setError('');try{await api.request(`/v1/customer/orders/${encodeURIComponent(orderRef)}/delivery-messages`,{method:'POST',auth:true,body:{body:text,message_type:QUICK.includes(text)?'QUICK':'TEXT'}});setMessage('');await load({quiet:true})}catch(e){setError(e.message)}finally{setSending(false)}};
 const showProof=async p=>{if(!p.content_path||proofUrls[p.id])return;setProofBusy(p.id);setError('');try{const blob=await fetchAuthenticatedBlob(p.content_path);const url=URL.createObjectURL(blob);setProofUrls(v=>({...v,[p.id]:url}))}catch(e){setError(e.message)}finally{setProofBusy('')}};
 const tracking=data?.tracking||{},loc=tracking.current_location,driver=data?.dispatch?.driver,messages=data?.messages||[],proofs=data?.proofs||[];
 const mapUrl=loc?`https://www.google.com/maps?q=${encodeURIComponent(`${loc.latitude},${loc.longitude}`)}`:'';
 const embedUrl=loc?`https://www.google.com/maps?q=${encodeURIComponent(`${loc.latitude},${loc.longitude}`)}&z=16&output=embed`:'';
 const title=data?.dispatch?.status==='DELIVERED'?'Delivered':tracking.available?'Your delivery is in progress':'Delivery assigned';
 if(loading)return <section className="section delivery-experience-shell"><div className="delivery-exp-loading">Loading delivery experience…</div></section>;
 if(error&&!data)return null;
 if(!data?.dispatch)return null;
 return <section className="section delivery-experience-shell" data-testid="customer-delivery-experience-v1">
  <div className="delivery-exp-head"><div><span className="eyebrow">Live delivery</span><h2>{title}</h2><p>{driver?.name?`${driver.name} · ${human(driver.vehicle_type||'Driver')}${driver.vehicle_label?` · ${driver.vehicle_label}`:''}`:'Your driver assignment is being prepared.'}</p></div><span className={`delivery-exp-status status-${String(data.dispatch.status).toLowerCase()}`}>{human(data.dispatch.status)}</span></div>
  {error&&<div className="delivery-exp-error">{error}</div>}
  <div className="delivery-exp-grid">
   <div className="delivery-exp-stack">
    <article className="delivery-exp-card live-card"><div className="delivery-exp-card-head"><div><span className="eyebrow">Driver location</span><h3>{loc?(loc.stale?'Last known location':'Live work location'):'Waiting for driver location'}</h3></div>{loc&&!loc.stale&&<span className="live-share-status"><span className="live-dot"/> Live</span>}</div>
     {loc?<><div className="delivery-live-map"><iframe title="Driver live location" src={embedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade"/></div><div className="delivery-live-meta"><div><span>Updated</span><strong>{ago(loc.updated_at)}</strong></div><div><span>Accuracy</span><strong>{loc.accuracy_meters!=null?`±${Math.round(loc.accuracy_meters)} m`:'—'}</strong></div><div><span>Privacy</span><strong>Active delivery only</strong></div></div><a className="btn btn-secondary btn-small" href={mapUrl} target="_blank" rel="noreferrer"><Icon name="navigation" size={15}/> Open live point</a></>:<p className="muted">The driver's position appears only while they are actively working on your assigned delivery. It is hidden before active work and after the dispatch ends.</p>}
    </article>
    {proofs.length>0&&<article className="delivery-exp-card"><span className="eyebrow">Delivery proof</span><h3>Proof of delivery</h3><p className="muted">Customer-visible proof is available only after delivery.</p><div className="delivery-proof-customer-list">{proofs.map(p=><div key={p.id} className="delivery-proof-customer-item"><div><strong>{p.proof_type==='PHOTO'?'Delivery photo':'Acknowledgement'}</strong><span>{p.recipient_name||p.note||p.original_filename||'Recorded at delivery'}</span></div>{p.asset_id&&<button type="button" className="btn btn-secondary btn-small" onClick={()=>showProof(p)} disabled={proofBusy===p.id}>{proofBusy===p.id?'Opening…':proofUrls[p.id]?'Loaded':'View proof'}</button>}{proofUrls[p.id]&&<img src={proofUrls[p.id]} alt="Delivery proof"/>}</div>)}</div></article>}
   </div>
   <article className="delivery-exp-card delivery-chat-card"><div className="delivery-exp-card-head"><div><span className="eyebrow">Delivery chat</span><h3>Message driver or store</h3></div><span>{data.conversation?.can_send?'Open':'Read only'}</span></div><div className="delivery-chat-messages">{messages.length?messages.map(m=><div key={m.id} className={`delivery-chat-message sender-${String(m.sender_type).toLowerCase()}`}><div><strong>{m.sender_type==='CUSTOMER'?'You':m.sender_name}</strong><small>{new Date(m.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</small></div><p>{m.body}</p></div>):<div className="delivery-chat-empty">No delivery messages yet.</div>}</div>{data.conversation?.can_send?<><div className="delivery-quick-replies">{QUICK.map(q=><button key={q} type="button" onClick={()=>send(q)} disabled={sending}>{q}</button>)}</div><form className="delivery-chat-form" onSubmit={e=>{e.preventDefault();send()}}><input value={message} onChange={e=>setMessage(e.target.value)} maxLength="2000" placeholder="Message driver or store…"/><button className="btn btn-primary" disabled={sending||!message.trim()}>{sending?'Sending…':'Send'}</button></form></>:<p className="delivery-chat-closed">This conversation is read-only because the delivery is complete or cancelled.</p>}</article>
  </div>
 </section>;
}
