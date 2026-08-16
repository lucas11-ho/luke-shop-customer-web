import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { Icon } from './icons.jsx';
import { getCurrentLocation, startLiveShare, shouldStopSharing, geolocationSupported, mapLink } from '../delivery/locationPrototype.js';

export function LocationCapture({ value, onChange, compact = false }) {
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  const locate=async()=>{setBusy(true);setError('');try{const loc=await getCurrentLocation();onChange?.(loc)}catch(e){setError(e.message)}finally{setBusy(false)}};
  const clear=()=>onChange?.({latitude:null,longitude:null,accuracy_meters:null,location_source:null,location_updated_at:null});
  return <div className={`location-capture ${compact?'is-compact':''}`}>
    <div className="location-capture-head"><div><strong><Icon name="map-pin" size={16}/> Precise delivery location</strong><small>Optional. Share a GPS point to help the delivery team find the correct entrance or handoff point.</small></div></div>
    {value?.latitude!=null&&value?.longitude!=null?<div className="location-capture-result"><div><span>Coordinates</span><strong>{Number(value.latitude).toFixed(6)}, {Number(value.longitude).toFixed(6)}</strong></div><div><span>Accuracy</span><strong>{value.accuracy_meters!=null?`± ${Math.round(value.accuracy_meters)} m`:'—'}</strong></div><div className="location-capture-actions"><a className="btn btn-secondary btn-small" href={mapLink(value)} target="_blank" rel="noreferrer"><Icon name="map-pin" size={14}/> Open map</a><button type="button" className="btn btn-secondary btn-small" onClick={locate} disabled={busy}>{busy?'Updating…':'Update GPS'}</button><button type="button" className="link-btn" onClick={clear}>Remove</button></div></div>:<button type="button" className="btn btn-secondary" onClick={locate} disabled={busy||!geolocationSupported()}><Icon name="locate" size={16}/> {busy?'Locating…':'Use my current location'}</button>}
    {error&&<div className="form-error">{error}</div>}
    {!geolocationSupported()&&<small className="muted">Location is not available in this browser. The written address still works normally.</small>}
  </div>;
}

export function DeliveryLocationCard({ orderRef, initialLocation, addressText, orderStatus, fulfillmentStatus, onSaved }) {
  const {api}=useAuth();
  const [location,setLocation]=useState(initialLocation?.latitude!=null?initialLocation:null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState(Boolean(initialLocation?.latitude!=null));
  useEffect(()=>{setLocation(initialLocation?.latitude!=null?initialLocation:null);setSaved(Boolean(initialLocation?.latitude!=null))},[initialLocation?.latitude,initialLocation?.longitude,initialLocation?.location_updated_at]);
  const update=async()=>{setBusy(true);setError('');try{const loc=await getCurrentLocation();setLocation(loc);setSaved(false)}catch(e){setError(e.message)}finally{setBusy(false)}};
  const confirm=async()=>{if(location?.latitude==null||location?.longitude==null){setError('Use your current location first.');return;}setBusy(true);setError('');try{const d=await api.request(`/v1/customer/orders/${encodeURIComponent(orderRef)}/delivery-location`,{method:'PATCH',auth:true,body:{latitude:location.latitude,longitude:location.longitude,accuracy_meters:location.accuracy_meters??null,location_source:location.location_source||'GPS'}});const next=d.data.delivery_location;setLocation(next);setSaved(true);onSaved?.(next)}catch(e){setError(e.message)}finally{setBusy(false)}};
  return <div className="form-card delivery-location-card"><div className="card-title-row"><div><h2><Icon name="map-pin" size={18}/> Delivery location</h2><p className="muted">{addressText||'Share a precise GPS point for this delivery.'}</p></div>{saved&&<span className="status-badge status-badge-good"><Icon name="check-circle" size={14}/> Confirmed</span>}</div>
    {location?.latitude!=null?<div className="location-capture-result"><div><span>Coordinates</span><strong>{Number(location.latitude).toFixed(6)}, {Number(location.longitude).toFixed(6)}</strong></div><div><span>Accuracy</span><strong>{location.accuracy_meters!=null?`± ${Math.round(location.accuracy_meters)} m`:'—'}</strong></div><div><span>Updated</span><strong>{location.location_updated_at?new Date(location.location_updated_at).toLocaleString():'Not saved yet'}</strong></div></div>:<p className="muted">No precise location has been shared yet.</p>}
    <div className="delivery-location-actions"><button type="button" className="btn btn-secondary" onClick={update} disabled={busy||!geolocationSupported()}><Icon name="locate" size={16}/> {busy?'Locating…':location?'Update current location':'Use my current location'}</button>{location&&!saved&&<button type="button" className="btn btn-primary" onClick={confirm} disabled={busy}><Icon name="check" size={16}/> Confirm for delivery</button>}{location?.latitude!=null&&<a className="btn btn-secondary" href={mapLink(location)} target="_blank" rel="noreferrer"><Icon name="map-pin" size={16}/> Open map</a>}</div>
    <p className="delivery-hint">GPS accuracy depends on the device and surroundings. You can update the point again while the order is active.</p>{error&&<div className="form-error">{error}</div>}
  </div>;
}

export function LiveLocationCard({ orderRef, orderStatus, fulfillmentStatus, initialSession }) {
  const {api}=useAuth();
  const [sharing,setSharing]=useState(false),[loc,setLoc]=useState(initialSession?.latitude!=null?initialSession:null),[error,setError]=useState(''),[ago,setAgo]=useState(0),[busy,setBusy]=useState(false);
  const stopWatch=useRef(null),lastPing=useRef(0),mounted=useRef(true);
  const autoStop=shouldStopSharing(orderStatus,fulfillmentStatus);
  const stop=async({silent=false}={})=>{stopWatch.current?.();stopWatch.current=null;setSharing(false);if(!silent){setBusy(true);try{await api.request(`/v1/customer/orders/${encodeURIComponent(orderRef)}/live-location/stop`,{method:'POST',auth:true,body:{}})}catch(e){setError(e.message)}finally{setBusy(false)}}};
  const start=async()=>{if(autoStop)return;setBusy(true);setError('');try{await api.request(`/v1/customer/orders/${encodeURIComponent(orderRef)}/live-location/start`,{method:'POST',auth:true,body:{}});stopWatch.current=startLiveShare(async next=>{if(!mounted.current)return;setLoc(next);setAgo(0);const now=Date.now();if(now-lastPing.current<5000)return;lastPing.current=now;try{await api.request(`/v1/customer/orders/${encodeURIComponent(orderRef)}/live-location/ping`,{method:'POST',auth:true,body:{latitude:next.latitude,longitude:next.longitude,accuracy_meters:next.accuracy_meters??null}})}catch(e){if(mounted.current)setError(e.message)}},e=>setError(e.message));setSharing(true)}catch(e){setError(e.message)}finally{setBusy(false)}};
  useEffect(()=>()=>{mounted.current=false;stopWatch.current?.()},[]);
  useEffect(()=>{if(autoStop&&sharing)stop()},[autoStop]);
  useEffect(()=>{if(!sharing)return undefined;const id=setInterval(()=>setAgo(v=>v+1),1000);return()=>clearInterval(id)},[sharing,loc]);
  if(autoStop&&!sharing)return null;
  return <div className="form-card live-location-card"><div className="card-title-row"><div><h2><Icon name="share" size={18}/> Live location</h2><p className="muted">Optional. Share your current GPS position with the merchant/delivery team only while this delivery is active.</p></div>{sharing&&<span className="live-share-status"><span className="live-dot"/> Live</span>}</div>
    {sharing?<><div className="live-share-meta"><div><span>Accuracy</span><strong>{loc?.accuracy_meters!=null?`± ${Math.round(loc.accuracy_meters)} m`:'Waiting…'}</strong></div><div><span>Updated</span><strong>{ago<=1?'just now':`${ago}s ago`}</strong></div>{loc?.latitude!=null&&<div><span>Position</span><strong>{Number(loc.latitude).toFixed(5)}, {Number(loc.longitude).toFixed(5)}</strong></div>}</div><button type="button" className="btn btn-danger btn-full" onClick={()=>stop()} disabled={busy}><Icon name="x" size={16}/> Stop sharing</button><p className="delivery-hint">Sharing stops automatically when the fulfillment reaches a terminal state or the session expires.</p></>:<><button type="button" className="btn btn-primary btn-full" onClick={start} disabled={busy||!geolocationSupported()}><Icon name="navigation" size={16}/> {busy?'Starting…':'Share live location'}</button>{initialSession?.status==='ACTIVE'&&<p className="delivery-hint">A server sharing session is active but this browser is not currently sending GPS updates. Tap Share live location to resume updates.</p>}</>}{error&&<div className="form-error">{error}</div>}
  </div>;
}
