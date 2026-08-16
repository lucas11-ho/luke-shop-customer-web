const API_BASE=(import.meta.env.VITE_LUKE_SHOP_API_BASE_URL||'http://localhost:4100').replace(/\/$/,'');
export const ENV_TENANT_SLUG=(import.meta.env.VITE_LUKE_SHOP_TENANT_SLUG||'').trim();
export const ENV_STORE_ID=(import.meta.env.VITE_LUKE_SHOP_STORE_ID||'').trim();
export const ALLOW_ENV_TENANT_FALLBACK=String(import.meta.env.VITE_LUKE_SHOP_ALLOW_ENV_TENANT_FALLBACK||'false').toLowerCase()==='true';
const SESSION_KEY='luke-shop-customer.session.v2';
let runtimeContext={tenantSlug:'',storeId:'',storeSlug:'',source:null,preview:false};

export class ApiError extends Error{
  constructor(message,{status=0,code='NETWORK_ERROR',requestId=null,details=null}={}){
    super(message);this.name='ApiError';this.status=status;this.code=code;this.requestId=requestId;this.details=details;
  }
}

export function getStorefrontRuntimeContext(){return {...runtimeContext};}
export function setStorefrontRuntimeContext(next={}){
  runtimeContext={tenantSlug:String(next.tenantSlug||''),storeId:String(next.storeId||''),storeSlug:String(next.storeSlug||''),source:next.source||null,preview:Boolean(next.preview)};
  window.dispatchEvent(new CustomEvent('luke-shop:storefront-context',{detail:getStorefrontRuntimeContext()}));
}
export function clearStorefrontRuntimeContext(){setStorefrontRuntimeContext({});}
export function readStoredSession(){try{return JSON.parse(sessionStorage.getItem(SESSION_KEY)||'null');}catch{return null;}}
export function writeStoredSession(value){if(value)sessionStorage.setItem(SESSION_KEY,JSON.stringify(value));else sessionStorage.removeItem(SESSION_KEY);}

async function parseResponse(res){
  let payload=null;try{payload=await res.json();}catch{payload=null;}
  if(!res.ok){const e=payload?.error||{};throw new ApiError(e.message||`Request failed (${res.status})`,{status:res.status,code:e.code||'HTTP_ERROR',requestId:e.request_id||null,details:e.details||null});}
  return payload;
}

async function rawFetch(path,{query}={}){
  const url=new URL(`${API_BASE}${path}`);
  if(query)Object.entries(query).forEach(([key,value])=>{if(value!==undefined&&value!==null&&value!=='')url.searchParams.set(key,String(value));});
  let response;try{response=await fetch(url,{headers:{Accept:'application/json'}});}catch{throw new ApiError('Unable to reach Luke Shop Backend. Check the API URL and backend status.');}
  return parseResponse(response);
}

export async function resolveStorefrontBootstrap(selection){
  if(!selection)throw new ApiError('No storefront selected. Open a tenant storefront URL such as /t/demo.',{code:'STOREFRONT_ROUTE_REQUIRED'});
  if(selection.mode==='preview')return rawFetch(`/v1/storefront/preview/${encodeURIComponent(selection.token)}`);
  if(selection.mode==='domain')return rawFetch('/v1/storefront/resolve',{query:{hostname:selection.hostname}});
  return rawFetch('/v1/storefront/resolve',{query:{tenant_slug:selection.tenantSlug,store_slug:selection.storeSlug||undefined}});
}

export function createApi({getSession,onSession}){
  let liveSession=getSession?.()||null;
  let refreshPromise=null;
  const current=()=>liveSession||getSession?.()||null;
  const request=async(path,{method='GET',body,rawBody,contentType,query,auth=false,retry=true,storeId}={})=>{
    const ctx=getStorefrontRuntimeContext();
    if(!ctx.tenantSlug)throw new ApiError('No storefront selected. Open a valid tenant storefront URL.',{code:'STOREFRONT_ROUTE_REQUIRED'});
    const session=current();
    const url=new URL(`${API_BASE}${path}`);
    if(query)Object.entries(query).forEach(([key,value])=>{if(value!==undefined&&value!==null&&value!=='')url.searchParams.set(key,String(value));});
    const headers={Accept:'application/json','x-tenant-slug':ctx.tenantSlug};
    const effectiveStoreId=storeId===undefined?ctx.storeId:storeId;
    if(effectiveStoreId)headers['x-store-id']=effectiveStoreId;
    const sessionMatches=session?.tenantSlug===ctx.tenantSlug;
    if(auth&&sessionMatches&&session?.accessToken)headers.Authorization=`Bearer ${session.accessToken}`;
    let payload;if(rawBody!==undefined){headers['Content-Type']=contentType||'application/octet-stream';payload=rawBody;}else if(body!==undefined){headers['Content-Type']='application/json';payload=JSON.stringify(body);}
    let response;
    try{response=await fetch(url,{method,headers,body:payload});}catch{throw new ApiError('Unable to reach Luke Shop Backend. Check the API URL and backend status.');}
    if(response.status===401&&auth&&retry&&sessionMatches&&session?.refreshToken&&path!=='/v1/customer/auth/refresh'){
      if(!refreshPromise){
        refreshPromise=(async()=>{
          const refreshHeaders={'Content-Type':'application/json','Accept':'application/json','x-tenant-slug':ctx.tenantSlug};
          const rr=await fetch(`${API_BASE}/v1/customer/auth/refresh`,{method:'POST',headers:refreshHeaders,body:JSON.stringify({refresh_token:session.refreshToken})});
          const data=await parseResponse(rr);const t=data.data.tokens;
          const next={...session,tenantSlug:ctx.tenantSlug,accessToken:t.access_token,refreshToken:t.refresh_token,expiresIn:t.expires_in};liveSession=next;onSession?.(next);return next;
        })().finally(()=>{refreshPromise=null;});
      }
      try{await refreshPromise;return request(path,{method,body,rawBody,contentType,query,auth,retry:false,storeId});}
      catch(error){liveSession=null;onSession?.(null);throw error;}
    }
    return parseResponse(response);
  };
  return{request,baseUrl:API_BASE};
}
