import React,{useState} from 'react';
import {useStore} from '../store/StoreContext.jsx';
import {useAuth} from '../auth/AuthContext.jsx';
import {go} from '../app/router.js';
import {getStorefrontRuntimeContext} from '../api/client.js';
export function SupportLauncher({placement='floating'}){
 const{customerService,experience}=useStore();const{api,isAuthenticated}=useAuth();const[busy,setBusy]=useState(false);const[message,setMessage]=useState('');
 const enabled=Boolean(experience?.features?.support!==false&&customerService?.enabled&&customerService?.placement?.[placement]);if(!enabled)return null;
 const open=async()=>{if(!isAuthenticated){go('/login',{next:location.hash.slice(1)||'/'});return;}setBusy(true);setMessage('');try{const d=await api.request('/v1/customer/support/context',{method:'POST',body:getStorefrontRuntimeContext().storeId?{store_id:getStorefrontRuntimeContext().storeId}:{},auth:true});const detail=d.data;window.dispatchEvent(new CustomEvent('luke-shop:support-context',{detail}));if(typeof window.LukeShopSupport?.open==='function')window.LukeShopSupport.open(detail);else setMessage('Support connection is ready.');}catch(e){setMessage(e.message);}finally{setBusy(false);}};
 return <div className={placement==='floating'?'support-floating':'support-inline'}><button className="support-button" onClick={open} disabled={busy}><span>◉</span>{busy?'Connecting…':customerService?.label||'Customer Support'}</button>{message&&<div className="support-note" onClick={()=>setMessage('')}>{message}</div>}</div>;
}
