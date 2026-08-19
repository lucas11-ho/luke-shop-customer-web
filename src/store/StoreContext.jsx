import React,{createContext,useContext,useEffect,useMemo,useState} from 'react';
import {createApi,resolveStorefrontBootstrap,setStorefrontRuntimeContext,clearStorefrontRuntimeContext} from '../api/client.js';
import {resolveBrowserStorefrontRoute} from './route-context.js';
import {useAuth} from '../auth/AuthContext.jsx';

const StoreContext=createContext(null);
const COLOR=/^#[0-9a-fA-F]{6}$/;
const FONT_PRESETS={
 IOS_SYSTEM:{heading:'-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',body:'-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif'},
 SYSTEM_MINIMAL:{heading:'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',body:'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'},
 MODERN_SANS:{heading:'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif',body:'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif',css:'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap'},
 CLEAN_COMMERCE:{heading:'Manrope, Avenir Next, Avenir, ui-sans-serif, system-ui, sans-serif',body:'Manrope, Avenir Next, Avenir, ui-sans-serif, system-ui, sans-serif',css:'https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap'},
 GEOMETRIC:{heading:'Montserrat, Avenir Next, Avenir, ui-sans-serif, sans-serif',body:'Montserrat, Avenir Next, Avenir, ui-sans-serif, sans-serif',css:'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap'},
 FRIENDLY:{heading:'Nunito, ui-rounded, system-ui, sans-serif',body:'Nunito, ui-rounded, system-ui, sans-serif',css:'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap'},
 HUMANIST:{heading:'Gill Sans, Gill Sans MT, Calibri, sans-serif',body:'Calibri, Candara, Segoe, sans-serif'},
 EDITORIAL:{heading:'Georgia, Times New Roman, serif',body:'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'},
 LUXURY_SERIF:{heading:'Didot, Bodoni MT, Georgia, serif',body:'Avenir Next, Avenir, system-ui, sans-serif'},
 CLASSIC_SERIF:{heading:'Baskerville, Georgia, Times New Roman, serif',body:'Georgia, Times New Roman, serif'},
 TECHNICAL:{heading:'Roboto, Arial, sans-serif',body:'Roboto, Arial, sans-serif',css:'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap'},
 COMPACT_UI:{heading:'Segoe UI, Arial, sans-serif',body:'Segoe UI, Arial, sans-serif'}
};
const DEFAULTS={accent:'#13713d',accent2:'#0f5132',accent3:'#18a56d',bg:'#f8f7f2',surface:'#ffffff',ink:'#10150f',muted:'#70776f',success:'#168552',danger:'#c63e35'};
const scaleHeading=v=>v==='compact'?.92:v==='large'?1.12:v==='display'?1.26:1;
const scaleBody=v=>v==='compact'?.94:v==='large'?1.08:1;

function ensureFont(presetKey){
 const preset=FONT_PRESETS[presetKey]||FONT_PRESETS.SYSTEM_MINIMAL;
 let link=document.getElementById('luke-store-font');
 if(!preset.css){if(link)link.remove();return preset;}
 if(!link){link=document.createElement('link');link.id='luke-store-font';link.rel='stylesheet';document.head.appendChild(link);}
 if(link.href!==preset.css)link.href=preset.css;
 return preset;
}
function setMeta(name,content,property=false){
 const key=property?'property':'name';let node=document.head.querySelector(`meta[${key}="${name}"]`);
 if(!content){node?.remove();return;}
 if(!node){node=document.createElement('meta');node.setAttribute(key,name);document.head.appendChild(node);}node.setAttribute('content',content);
}
function applyTheme(config={}){
 const root=document.documentElement;const exp=config.experience||{};const theme=exp.theme||{};const typography=exp.typography||{};const layout=exp.layout||{};const responsive=exp.responsive||{};
 const experienceBranding=exp.branding||{};const branding={...(config.tenant?.branding||{}),...experienceBranding};if(experienceBranding.use_internal_name===true)branding.store_name=config.store?.name||config.tenant?.name||branding.store_name;
 const vars={accent:theme.primary||branding.accent||DEFAULTS.accent,accent2:theme.secondary||DEFAULTS.accent2,accent3:theme.accent||DEFAULTS.accent3,bg:theme.background||DEFAULTS.bg,surface:theme.surface||DEFAULTS.surface,ink:theme.text||DEFAULTS.ink,muted:theme.muted_text||DEFAULTS.muted,success:theme.success||DEFAULTS.success,danger:theme.danger||DEFAULTS.danger};
 for(const[k,v]of Object.entries(vars))root.style.setProperty(`--${k}`,COLOR.test(String(v||''))?v:DEFAULTS[k]);
 const radius=theme.radius==='xl'?'34px':theme.radius==='large'?'26px':theme.radius==='small'?'9px':'16px';root.style.setProperty('--radius',radius);
 const preset=ensureFont(typography.preset);root.style.setProperty('--font-heading',preset.heading);root.style.setProperty('--font-body',preset.body);root.style.setProperty('--heading-scale',String(scaleHeading(typography.heading_scale)));root.style.setProperty('--body-scale',String(scaleBody(typography.body_scale)));root.style.setProperty('--letter-spacing',typography.letter_spacing==='wide'?'.025em':typography.letter_spacing==='tight'?'-.025em':'0em');
 const cols=responsive.product_columns||{};root.style.setProperty('--products-desktop',String(cols.desktop||4));root.style.setProperty('--products-tablet',String(cols.tablet||3));root.style.setProperty('--products-mobile',String(cols.mobile||2));
 root.dataset.themePreset=theme.preset||'custom';root.dataset.cardStyle=theme.card_style||'clean';root.dataset.buttonStyle=theme.button_style||'solid';root.dataset.density=theme.density||'comfortable';root.dataset.headerLayout=layout.header||'logo_left';root.dataset.heroLayout=layout.hero||'split';root.dataset.categoryLayout=layout.categories||'cards';root.dataset.productGrid=layout.product_grid||'four';root.dataset.productCard=layout.product_card||'standard';root.dataset.mobileNav=layout.mobile_nav||'standard';root.dataset.typography=typography.preset||'SYSTEM_MINIMAL';root.dataset.buttonCase=typography.button_case||'none';root.dataset.heroMediaDesktop=responsive.hero_media_position?.desktop||'right';root.dataset.heroMediaTablet=responsive.hero_media_position?.tablet||'right';root.dataset.heroMediaMobile=responsive.hero_media_position?.mobile||'below';
 const seo=exp.seo||{};document.title=seo.title||branding.store_name||config.store?.name||config.tenant?.name||'Luke Shop';setMeta('theme-color',vars.ink||DEFAULTS.ink);setMeta('apple-mobile-web-app-title',branding.store_name||config.store?.name||config.tenant?.name||'Luke Shop');setMeta('description',seo.description||branding.hero_subtitle||'');setMeta('og:title',document.title,true);setMeta('og:description',seo.description||branding.hero_subtitle||'',true);if(seo.social_image_url)setMeta('og:image',seo.social_image_url,true);
 let icon=document.querySelector('link[rel="icon"]');if(branding.favicon_url){if(!icon){icon=document.createElement('link');icon.rel='icon';document.head.appendChild(icon);}icon.href=branding.favicon_url;}else if(icon){icon.remove();}
}
function designerEmbedding(){
 const q=new URLSearchParams(window.location.search);const parentOrigin=q.get('parent_origin')||'';return q.get('embed')==='designer'&&parentOrigin?{enabled:true,parentOrigin}:{enabled:false,parentOrigin:''};
}
export function StoreProvider({children}){
 const{session}=useAuth();const api=useMemo(()=>createApi({getSession:()=>session,onSession:()=>{}}),[session]);
 const[config,setConfig]=useState(null);const[loading,setLoading]=useState(true);const[error,setError]=useState('');const[errorCode,setErrorCode]=useState('');
 const reload=async()=>{setLoading(true);setError('');setErrorCode('');clearStorefrontRuntimeContext();try{const selection=resolveBrowserStorefrontRoute();const data=await resolveStorefrontBootstrap(selection);const next=data.data;if(next.channels?.customer_web===false)throw new Error('This client storefront is not enabled.');setStorefrontRuntimeContext({tenantSlug:next.tenant.slug,storeId:next.store.id,storeSlug:next.store.slug,source:next.routing?.source,preview:next.routing?.preview});setConfig(next);applyTheme(next);}catch(e){setConfig(null);setErrorCode(e.code||'');setError(e.message||'Unable to load storefront.');}finally{setLoading(false);}};
 useEffect(()=>{reload();},[]);
 useEffect(()=>{const embed=designerEmbedding();if(!embed.enabled||!config?.routing?.preview)return undefined;document.documentElement.dataset.designerEmbed='true';const onMessage=e=>{if(e.origin!==embed.parentOrigin||e.source!==window.parent)return;const m=e.data||{};if(m.type!=='luke-store-designer:config'||!m.config||typeof m.config!=='object')return;setConfig(prev=>{if(!prev)return prev;const next={...prev,experience:m.config};applyTheme(next);return next;});};window.addEventListener('message',onMessage);window.parent.postMessage({type:'luke-store-designer:ready',experienceVersion:config.experience_version,storeId:config.store?.id},embed.parentOrigin);return()=>{window.removeEventListener('message',onMessage);delete document.documentElement.dataset.designerEmbed;};},[config?.routing?.preview,config?.experience_version,config?.store?.id]);
 const experience=config?.experience||{};const rawBranding={...(config?.tenant?.branding||{}),...(experience.branding||{})};const effectiveBranding=experience.branding?.use_internal_name===true?{...rawBranding,store_name:config?.store?.name||config?.tenant?.name||rawBranding.store_name}:rawBranding;
 const value={config,tenant:config?.tenant||null,store:config?.store||null,routing:config?.routing||null,channels:config?.channels||{},experience,effectiveBranding,customerService:config?.customer_service||null,loading,error,errorCode,reload,publicApi:api};
 return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
export function useStore(){return useContext(StoreContext);}
