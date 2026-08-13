import React,{createContext,useContext,useEffect,useMemo,useState} from 'react';
import {createApi,resolveStorefrontBootstrap,setStorefrontRuntimeContext,clearStorefrontRuntimeContext} from '../api/client.js';
import {resolveBrowserStorefrontRoute} from './route-context.js';
import {useAuth} from '../auth/AuthContext.jsx';
const StoreContext=createContext(null);
const COLOR=/^#[0-9a-fA-F]{6}$/;
const FONT_PRESETS={
 IOS_SYSTEM:{heading:'-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',body:'-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif'},
 SYSTEM_MINIMAL:{heading:'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',body:'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'},
 MODERN_SANS:{heading:'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif',body:'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif'},
 CLEAN_COMMERCE:{heading:'Manrope, Avenir Next, Avenir, ui-sans-serif, system-ui, sans-serif',body:'Manrope, Avenir Next, Avenir, ui-sans-serif, system-ui, sans-serif'},
 GEOMETRIC:{heading:'Avenir Next, Avenir, Montserrat, ui-sans-serif, sans-serif',body:'Avenir Next, Avenir, ui-sans-serif, sans-serif'},
 FRIENDLY:{heading:'Nunito, ui-rounded, system-ui, sans-serif',body:'Nunito, ui-rounded, system-ui, sans-serif'},
 HUMANIST:{heading:'Gill Sans, Gill Sans MT, Calibri, sans-serif',body:'Calibri, Candara, Segoe, sans-serif'},
 EDITORIAL:{heading:'Georgia, Times New Roman, serif',body:'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'},
 LUXURY_SERIF:{heading:'Didot, Bodoni MT, Georgia, serif',body:'Avenir Next, Avenir, system-ui, sans-serif'},
 CLASSIC_SERIF:{heading:'Baskerville, Georgia, Times New Roman, serif',body:'Georgia, Times New Roman, serif'},
 TECHNICAL:{heading:'Roboto, Arial, sans-serif',body:'Roboto, Arial, sans-serif'},
 COMPACT_UI:{heading:'Segoe UI, Arial, sans-serif',body:'Segoe UI, Arial, sans-serif'}
};
const DEFAULTS={accent:'#13713d',accent2:'#0f5132',accent3:'#18a56d',bg:'#f8f7f2',surface:'#ffffff',ink:'#10150f',muted:'#70776f',success:'#168552',danger:'#c63e35'};
const scale=v=>v==='small'?.92:v==='large'?1.12:v==='xl'?1.22:1;
function applyTheme(config={}){
 const root=document.documentElement;const exp=config.experience||{};const theme=exp.theme||{};const typography=exp.typography||{};const layout=exp.layout||{};const branding={...(config.tenant?.branding||{}),...(exp.branding||{})};
 const vars={accent:theme.primary||branding.accent||DEFAULTS.accent,accent2:theme.secondary||DEFAULTS.accent2,accent3:theme.accent||DEFAULTS.accent3,bg:theme.background||DEFAULTS.bg,surface:theme.surface||DEFAULTS.surface,ink:theme.text||DEFAULTS.ink,muted:theme.muted_text||DEFAULTS.muted,success:theme.success||DEFAULTS.success,danger:theme.danger||DEFAULTS.danger};
 for(const[k,v]of Object.entries(vars))root.style.setProperty(`--${k}`,COLOR.test(String(v||''))?v:DEFAULTS[k]);
 const radius=theme.radius==='large'?'26px':theme.radius==='small'?'9px':theme.radius==='none'?'0px':'16px';root.style.setProperty('--radius',radius);
 const preset=FONT_PRESETS[typography.preset]||FONT_PRESETS.SYSTEM_MINIMAL;root.style.setProperty('--font-heading',preset.heading);root.style.setProperty('--font-body',preset.body);root.style.setProperty('--heading-scale',String(scale(typography.heading_scale)));root.style.setProperty('--body-scale',String(scale(typography.body_scale)));root.style.setProperty('--letter-spacing',typography.letter_spacing==='wide'?'.025em':typography.letter_spacing==='tight'?'-.025em':'0em');
 root.dataset.themePreset=theme.preset||'custom';root.dataset.cardStyle=theme.card_style||'standard';root.dataset.buttonStyle=theme.button_style||'solid';root.dataset.density=theme.density||'comfortable';root.dataset.headerLayout=layout.header||'logo_left';root.dataset.heroLayout=layout.hero||'split';root.dataset.categoryLayout=layout.categories||'cards';root.dataset.productGrid=layout.product_grid||'four';root.dataset.productCard=layout.product_card||'standard';root.dataset.mobileNav=layout.mobile_nav||'standard';root.dataset.typography=typography.preset||'SYSTEM_MINIMAL';
 document.title=branding.store_name||config.tenant?.name||'Luke Shop';
 let icon=document.querySelector('link[rel="icon"]');if(branding.favicon_url){if(!icon){icon=document.createElement('link');icon.rel='icon';document.head.appendChild(icon);}icon.href=branding.favicon_url;}
}
export function StoreProvider({children}){
 const{session}=useAuth();const api=useMemo(()=>createApi({getSession:()=>session,onSession:()=>{}}),[session]);
 const[config,setConfig]=useState(null);const[loading,setLoading]=useState(true);const[error,setError]=useState('');
 const reload=async()=>{setLoading(true);setError('');clearStorefrontRuntimeContext();try{const selection=resolveBrowserStorefrontRoute();const data=await resolveStorefrontBootstrap(selection);const next=data.data;if(next.channels?.customer_web===false)throw new Error('This client storefront is not enabled.');setStorefrontRuntimeContext({tenantSlug:next.tenant.slug,storeId:next.store.id,storeSlug:next.store.slug,source:next.routing?.source,preview:next.routing?.preview});setConfig(next);applyTheme(next);}catch(e){setConfig(null);setError(e.message||'Unable to load storefront.');}finally{setLoading(false);}};
 useEffect(()=>{reload();},[]);
 const experience=config?.experience||{};const effectiveBranding={...(config?.tenant?.branding||{}),...(experience.branding||{})};
 const value={config,tenant:config?.tenant||null,store:config?.store||null,routing:config?.routing||null,channels:config?.channels||{},experience,effectiveBranding,customerService:config?.customer_service||null,loading,error,reload,publicApi:api};
 return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
export function useStore(){return useContext(StoreContext);}
