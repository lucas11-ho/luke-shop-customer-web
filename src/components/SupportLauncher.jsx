import React,{useEffect,useMemo,useRef,useState} from 'react';
import {useStore} from '../store/StoreContext.jsx';
import {useAuth} from '../auth/AuthContext.jsx';
import {go} from '../app/router.js';
import {getStorefrontRuntimeContext} from '../api/client.js';
import {Icon} from './icons.jsx';

function safeChatTarget(raw,routeKey){
 const value=String(raw||'').trim();if(!/^https:\/\//i.test(value))return null;
 try{const u=new URL(value);if(u.username||u.password)return null;u.hash='';
   // The merchant may save the generated platform-specific URL directly. If
   // they save the generic Chat origin, route_key is added only as a query
   // reference and never carries customer identity or the signed context.
   if(routeKey&&!u.searchParams.get('platform')&&!/^\/p\//.test(u.pathname))u.searchParams.set('platform',String(routeKey));
   return {url:u.toString(),origin:u.origin};
 }catch{return null;}
}
function currentPath(){return `${window.location.pathname}${window.location.search}${window.location.hash}`.slice(0,500);}

export function SupportLauncher({placement='floating',orderRef=null}){
 const{customerService,experience,tenant}=useStore();const{api,isAuthenticated}=useAuth();
 const[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[open,setOpen]=useState(false),[context,setContext]=useState(null);
 const frame=useRef(null);const target=useMemo(()=>safeChatTarget(customerService?.chat_url,customerService?.platform_route_key),[customerService?.chat_url,customerService?.platform_route_key]);
 const enabled=Boolean(experience?.features?.support!==false&&customerService?.enabled&&customerService?.placement?.[placement]);
 const issueContext=async()=>{const runtime=getStorefrontRuntimeContext();const body={...(runtime.storeId?{store_id:runtime.storeId}:{}),current_path:currentPath(),locale:tenant?.locale||navigator.language||'en',...(orderRef?{order_ref:orderRef}:{})};const d=await api.request('/v1/customer/support/context',{method:'POST',body,auth:true});setContext(d.data);return d.data;};
 const deliver=(detail=context)=>{if(!detail||!target||!frame.current?.contentWindow)return;frame.current.contentWindow.postMessage({type:'LUKE_COMMERCE_CONTEXT',version:2,context:detail.context,context_id:detail.context_id,expires_in:detail.expires_in,customer:detail.customer,store:detail.store,current_order_ref:detail.current_order_ref||orderRef||null,page_path:detail.page_path||currentPath(),platform_route_key:customerService?.platform_route_key||null},target.origin);};
 useEffect(()=>{if(!open||!target)return;const receive=async(event)=>{if(event.origin!==target.origin||event.source!==frame.current?.contentWindow)return;if(event.data?.type==='LUKE_COMMERCE_CONTEXT_REQUEST'){try{const fresh=await issueContext();deliver(fresh);}catch(e){setMessage(e.message||'Could not refresh support access.');}}};window.addEventListener('message',receive);return()=>window.removeEventListener('message',receive);},[open,target,orderRef]);
 if(!enabled)return null;
 const launch=async()=>{if(!isAuthenticated){go('/login',{next:location.hash.slice(1)||'/'});return;}if(!target){setMessage('Customer support chat is not configured yet.');return;}setBusy(true);setMessage('');try{const detail=await issueContext();window.dispatchEvent(new CustomEvent('luke-shop:support-context',{detail}));setOpen(true);setTimeout(()=>deliver(detail),120);}catch(e){setMessage(e.message);}finally{setBusy(false);}};
 return <><div className={placement==='floating'?'support-floating':'support-inline'}><button className="support-button" onClick={launch} disabled={busy} data-testid="support-launcher"><Icon name="headset" size={17}/>{busy?'Connecting…':customerService?.label||'Customer Support'}</button>{message&&<div className="support-note" onClick={()=>setMessage('')}>{message}</div>}</div>{open&&target&&<div className="support-chat-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setOpen(false)}}><section className="support-chat-modal" role="dialog" aria-modal="true" aria-label="Customer support"><header><div><strong>{customerService?.label||'Customer Support'}</strong><span>{context?.customer?.customer_code?`Connected as ${context.customer.customer_code}`:'Secure account context connected'}</span></div><button type="button" className="support-chat-close" aria-label="Close support" onClick={()=>setOpen(false)}>×</button></header><iframe ref={frame} title="Luke customer support" src={target.url} onLoad={()=>deliver()} sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" referrerPolicy="strict-origin"/></section></div>}</>;
}
