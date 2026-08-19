import React,{createContext,useContext,useEffect,useMemo,useState}from'react';
import{useStore}from'../store/StoreContext.jsx';
import{UI_DICTIONARIES,interpolate,localizeCategory,localizeProduct,localizePromotion,localizeSection,normalizeLocalizationConfig,normalizeLocale}from'./localization.js';

const LocalizationContext=createContext(null);
function storageKey(tenant,store){return `luke-storefront-locale:${tenant?.public_id||tenant?.slug||'tenant'}:${store?.public_id||store?.slug||'store'}`;}
function safeRead(key){try{return localStorage.getItem(key)||''}catch{return''}}
function safeWrite(key,value){try{localStorage.setItem(key,value)}catch{}}

export function LocalizationProvider({children}){
 const{tenant,store,experience,effectiveBranding}=useStore();
 const config=useMemo(()=>normalizeLocalizationConfig(experience,tenant),[experience,tenant]);
 const key=useMemo(()=>storageKey(tenant,store),[tenant,store]);
 const initial=()=>{const saved=normalizeLocale(safeRead(key));return config.enabledLocales.includes(saved)?saved:config.defaultLocale;};
 const[locale,setLocaleState]=useState(initial);
 useEffect(()=>{const saved=normalizeLocale(safeRead(key));const next=config.enabledLocales.includes(saved)?saved:config.defaultLocale;setLocaleState(next);},[key,config.defaultLocale,config.enabledLocales.join('|')]);
 const setLocale=(next)=>{const normalized=normalizeLocale(next);if(!config.enabledLocales.includes(normalized))return false;safeWrite(key,normalized);setLocaleState(normalized);return true;};
 const localePack=config.translations?.[locale]||{};
 const defaultPack=config.translations?.[config.defaultLocale]||{};
 const uiOverride={...(config.uiOverrides?.[locale]||{}),...(localePack.ui||{})};
 const defaultUiOverride={...(config.uiOverrides?.[config.defaultLocale]||{}),...(defaultPack.ui||{})};
 const t=(id,vars={})=>interpolate(uiOverride[id]??UI_DICTIONARIES[locale]?.[id]??defaultUiOverride[id]??UI_DICTIONARIES[config.defaultLocale]?.[id]??UI_DICTIONARIES.en[id]??id,vars);
 const localizedBranding=useMemo(()=>({...effectiveBranding,...(localePack.branding||{})}),[effectiveBranding,localePack]);
 const lp=product=>localizeProduct(localePack,product);const lc=category=>localizeCategory(localePack,category);const lpromo=promotion=>localizePromotion(localePack,promotion);const ls=section=>localizeSection(localePack,section);
 useEffect(()=>{
   document.documentElement.lang=locale;
   document.documentElement.dataset.storeLocale=locale;
   const seo={...(experience?.seo||{}),...(localePack.seo||{})};
   const name=localizedBranding?.store_name||store?.name||tenant?.name||'Luke Shop';
   document.title=seo.title||name;
   let description=document.head.querySelector('meta[name="description"]');if(!description){description=document.createElement('meta');description.name='description';document.head.appendChild(description);}description.content=seo.description||localizedBranding?.hero_subtitle||'';
 },[locale,localePack,localizedBranding,experience?.seo,store?.name,tenant?.name]);
 const value={locale,setLocale,t,config,locales:config.locales,defaultLocale:config.defaultLocale,localePack,localizedBranding,localizeProduct:lp,localizeCategory:lc,localizePromotion:lpromo,localizeSection:ls};
 return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}
export function useLocalization(){const value=useContext(LocalizationContext);if(!value)throw new Error('useLocalization must be used inside LocalizationProvider');return value;}
