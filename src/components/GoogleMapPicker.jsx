import React,{useEffect,useRef,useState}from'react';
import{Icon}from'./icons.jsx';
import{getCurrentLocation,geolocationSupported}from'../delivery/locationPrototype.js';

let loaderPromise=null;
let loaderKey='';
function loadGoogleMaps(apiKey){
  if(typeof window==='undefined')return Promise.reject(new Error('Google Maps is not available in this environment.'));
  if(window.google?.maps?.importLibrary)return Promise.resolve(window.google.maps);
  if(loaderPromise){if(loaderKey!==apiKey)return Promise.reject(new Error('A different Google Maps key is already active on this page.'));return loaderPromise;}
  loaderKey=apiKey;
  loaderPromise=new Promise((resolve,reject)=>{
    const callback=`__lukeMapsReady_${Math.random().toString(36).slice(2)}`;
    window[callback]=()=>{delete window[callback];resolve(window.google.maps);};
    const script=document.createElement('script');
    script.dataset.lukeGoogleMaps='1';
    script.async=true;
    script.src=`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&loading=async&libraries=places&auth_referrer_policy=origin&v=weekly&callback=${encodeURIComponent(callback)}`;
    script.onerror=()=>{delete window[callback];loaderPromise=null;reject(new Error('Google Maps could not load. Check the browser API key and allowed referrers.'));};
    document.head.appendChild(script);
  });
  return loaderPromise;
}

export function GoogleMapPicker({config,value,onConfirm,busy=false,compact=false}){
  const mapNode=useRef(null),searchNode=useRef(null),mapRef=useRef(null),autocompleteRef=useRef(null);
  const[draft,setDraft]=useState(value?.latitude!=null&&value?.longitude!=null?{latitude:Number(value.latitude),longitude:Number(value.longitude)}:null);
  const[ready,setReady]=useState(false),[error,setError]=useState(''),[finding,setFinding]=useState(false);

  useEffect(()=>{let alive=true;async function init(){try{
    const maps=await loadGoogleMaps(config.api_key);
    const [{Map},{PlaceAutocompleteElement}]=await Promise.all([maps.importLibrary('maps'),maps.importLibrary('places')]);
    if(!alive||!mapNode.current)return;
    const center=draft?{lat:draft.latitude,lng:draft.longitude}:{lat:20,lng:0};
    const map=new Map(mapNode.current,{center,zoom:draft?17:2,mapId:config.map_id||undefined,mapTypeControl:false,streetViewControl:false,fullscreenControl:false,clickableIcons:false,gestureHandling:'greedy'});
    mapRef.current=map;
    map.addListener('idle',()=>{const c=map.getCenter();if(c)setDraft({latitude:c.lat(),longitude:c.lng()});});
    if(searchNode.current){
      const autocomplete=new PlaceAutocompleteElement();
      autocomplete.placeholder='Search address or place';
      autocompleteRef.current=autocomplete;
      searchNode.current.replaceChildren(autocomplete);
      autocomplete.addEventListener('gmp-select',async event=>{try{const place=event.placePrediction.toPlace();await place.fetchFields({fields:['formattedAddress','location','viewport']});if(!place.location)return;if(place.viewport)map.fitBounds(place.viewport);else{map.setCenter(place.location);map.setZoom(17);}setDraft({latitude:place.location.lat(),longitude:place.location.lng()});}catch{setError('Could not open that search result on the map.');}});
    }
    if(alive)setReady(true);
  }catch(e){if(alive)setError(e.message||'Google Maps could not load.');}}init();return()=>{alive=false};},[config.api_key,config.map_id]);

  useEffect(()=>{if(!mapRef.current||value?.latitude==null||value?.longitude==null)return;const next={lat:Number(value.latitude),lng:Number(value.longitude)};mapRef.current.setCenter(next);if(mapRef.current.getZoom()<15)mapRef.current.setZoom(17);setDraft({latitude:next.lat,longitude:next.lng});},[value?.latitude,value?.longitude]);

  const locate=async()=>{setFinding(true);setError('');try{const loc=await getCurrentLocation();mapRef.current?.setCenter({lat:loc.latitude,lng:loc.longitude});mapRef.current?.setZoom(18);setDraft({latitude:loc.latitude,longitude:loc.longitude});await onConfirm?.({...loc,location_source:'GPS'});}catch(e){setError(e.message)}finally{setFinding(false)}};
  const confirm=async()=>{if(!draft)return;setError('');await onConfirm?.({latitude:draft.latitude,longitude:draft.longitude,accuracy_meters:null,location_source:'MAP_PIN',location_updated_at:new Date().toISOString()});};

  return <div className={`google-map-picker ${compact?'is-compact':''}`}>
    <div className="google-map-search" ref={searchNode}><span className="muted">Loading address search…</span></div>
    <div className="google-map-stage"><div className="google-map-canvas" ref={mapNode}/><div className="google-map-center-pin" aria-hidden="true"><span/><i/></div>{!ready&&!error&&<div className="google-map-loading">Loading Google Maps…</div>}</div>
    <div className="google-map-toolbar"><button type="button" className="btn btn-secondary btn-small" onClick={locate} disabled={busy||finding||!geolocationSupported()}><Icon name="locate" size={15}/>{finding?'Locating…':'Use current location'}</button><button type="button" className="btn btn-primary btn-small" onClick={confirm} disabled={busy||!ready||!draft}><Icon name="check" size={15}/> Confirm this pin</button></div>
    <small className="google-map-help">Search, move the map until the pin is exactly on the delivery point, then confirm it. You can still correct the written address before saving.</small>
    {error&&<div className="form-error">{error}</div>}
  </div>;
}
