import {ALLOW_ENV_TENANT_FALLBACK,ENV_TENANT_SLUG} from '../api/client.js';

const LOCAL_HOSTS=new Set(['localhost','127.0.0.1','::1']);
const decode=value=>{try{return decodeURIComponent(value)}catch{return value}};

export function resolveBrowserStorefrontRoute(loc=window.location){
  const parts=String(loc.pathname||'/').split('/').filter(Boolean).map(decode);
  if(parts[0]==='preview'&&parts.length===2&&parts[1])return{mode:'preview',token:parts[1]};
  if(parts[0]==='t'&&parts[1]&&(parts.length===2||(parts.length===4&&parts[2]==='s'&&parts[3]))){
    return{mode:'tenant',tenantSlug:parts[1],storeSlug:parts.length===4?parts[3]:''};
  }
  const hostname=String(loc.hostname||'').toLowerCase();
  if(hostname&&!LOCAL_HOSTS.has(hostname))return{mode:'domain',hostname};
  if(ALLOW_ENV_TENANT_FALLBACK&&ENV_TENANT_SLUG)return{mode:'tenant',tenantSlug:ENV_TENANT_SLUG,storeSlug:''};
  return null;
}
