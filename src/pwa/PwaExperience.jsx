import React,{createContext,useContext,useEffect,useMemo,useState}from'react';
import{registerLukePwa,activateWaitingWorker}from'./registerPwa.js';
import{useStore}from'../store/StoreContext.jsx';
import{Icon}from'../components/icons.jsx';

const PwaContext=createContext(null);
const DISMISS_KEY='luke:pwa-install-dismissed-at';
const ROUTE_KEY='luke:pwa-storefront-route';
const WEEK=7*24*60*60*1000;

function isStandalone(){return window.matchMedia?.('(display-mode: standalone)').matches||window.navigator.standalone===true}
function isIos(){return /iphone|ipad|ipod/i.test(navigator.userAgent||'')}
function recentlyDismissed(){try{const value=Number(localStorage.getItem(DISMISS_KEY)||0);return value>0&&Date.now()-value<WEEK}catch{return false}}
function rememberRoute(routing,tenant,store){try{
  const path=window.location.pathname;
  const target=path.startsWith('/t/')?path:(routing?.source==='TENANT_PATH'&&tenant?.slug?`/t/${encodeURIComponent(tenant.slug)}${store?.slug?`/s/${encodeURIComponent(store.slug)}`:''}`:'');
  if(target)localStorage.setItem(ROUTE_KEY,target);
}catch{}}

export function PwaProvider({children}){
 const{routing,tenant,store}=useStore();
 const[prompt,setPrompt]=useState(null),[installed,setInstalled]=useState(()=>typeof window!=='undefined'&&isStandalone()),[ios]=useState(()=>typeof window!=='undefined'&&isIos()),[online,setOnline]=useState(()=>typeof navigator==='undefined'?true:navigator.onLine),[update,setUpdate]=useState(null);
 useEffect(()=>{rememberRoute(routing,tenant,store)},[routing?.source,tenant?.slug,store?.slug]);
 useEffect(()=>{
  const before=e=>{e.preventDefault();setPrompt(e)};
  const done=()=>{setInstalled(true);setPrompt(null)};
  const up=()=>setOnline(true),down=()=>setOnline(false);
  window.addEventListener('beforeinstallprompt',before);window.addEventListener('appinstalled',done);window.addEventListener('online',up);window.addEventListener('offline',down);
  registerLukePwa({onUpdate:(registration,worker)=>setUpdate({registration,worker})});
  let hadController=Boolean(navigator.serviceWorker?.controller);const controller=()=>{if(hadController)window.location.reload();else hadController=true};navigator.serviceWorker?.addEventListener('controllerchange',controller);
  return()=>{window.removeEventListener('beforeinstallprompt',before);window.removeEventListener('appinstalled',done);window.removeEventListener('online',up);window.removeEventListener('offline',down);navigator.serviceWorker?.removeEventListener('controllerchange',controller)};
 },[]);
 const value=useMemo(()=>({prompt,installed,ios,online,update,async install(){if(!prompt)return false;await prompt.prompt();const result=await prompt.userChoice;if(result?.outcome==='accepted')setPrompt(null);return result?.outcome==='accepted'},dismiss(){try{localStorage.setItem(DISMISS_KEY,String(Date.now()))}catch{}setPrompt(null)},recentlyDismissed:recentlyDismissed(),applyUpdate(){if(update)activateWaitingWorker(update.registration)}}),[prompt,installed,ios,online,update]);
 return <PwaContext.Provider value={value}>{children}</PwaContext.Provider>;
}
export function usePwa(){return useContext(PwaContext)}

export function PwaExperience({path}){
 const pwa=usePwa();const{effectiveBranding}=useStore();const[showIos,setShowIos]=useState(false),[visible,setVisible]=useState(false);
 const hidden=['/login','/register','/checkout'].includes(path)||pwa?.installed;
 useEffect(()=>{if(hidden||pwa?.recentlyDismissed)return;const t=setTimeout(()=>setVisible(true),5000);return()=>clearTimeout(t)},[hidden,pwa?.recentlyDismissed]);
 if(!pwa)return null;
 return <>
  {!pwa.online&&<div className="pwa-network-banner" role="status"><Icon name="wifi-off" size={15}/> You are offline. Shopping data that needs the server will resume when the connection returns.</div>}
  {pwa.update&&<div className="pwa-update-banner" role="status"><span>New Luke Shop version available.</span><button type="button" className="btn btn-primary btn-small" onClick={pwa.applyUpdate}>Update now</button></div>}
  {!hidden&&visible&&(pwa.prompt||pwa.ios)&&<div className="pwa-install-card" role="region" aria-label="Install shopping app"><div className="pwa-install-brand"><span className="pwa-install-icon">{(effectiveBranding?.store_name||'L').slice(0,1).toUpperCase()}</span><div><strong>Install {effectiveBranding?.store_name||'this store'}</strong><small>Open faster from your home screen in a standalone app window.</small></div></div><div className="pwa-install-actions">{pwa.prompt?<button type="button" className="btn btn-primary btn-small" onClick={pwa.install}>Install app</button>:<button type="button" className="btn btn-primary btn-small" onClick={()=>setShowIos(true)}>How to install</button>}<button type="button" className="link-btn" onClick={()=>{pwa.dismiss();setVisible(false)}}>Not now</button></div></div>}
  {showIos&&<div className="pwa-ios-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setShowIos(false)}}><div className="pwa-ios-sheet" role="dialog" aria-modal="true" aria-label="Install on iPhone or iPad"><div className="card-title-row"><div><span className="eyebrow">iPhone / iPad</span><h2>Add to Home Screen</h2></div><button type="button" className="link-btn" onClick={()=>setShowIos(false)}>Close</button></div><ol><li>Open the browser Share menu.</li><li>Choose <strong>Add to Home Screen</strong>.</li><li>Confirm the app name and tap <strong>Add</strong>.</li></ol><p className="muted">After installation, launch the store from its new home-screen icon.</p></div></div>}
 </>;
}
