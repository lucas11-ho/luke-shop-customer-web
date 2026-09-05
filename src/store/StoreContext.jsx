import React,{createContext,useContext,useEffect,useMemo,useState} from 'react';
import {createApi,resolveStorefrontBootstrap,setStorefrontRuntimeContext,clearStorefrontRuntimeContext} from '../api/client.js';
import {resolveBrowserStorefrontRoute} from './route-context.js';
import {useAuth} from '../auth/AuthContext.jsx';

const StoreContext=createContext(null);
const COLOR=/^#[0-9a-fA-F]{6}$/;
const CUSTOMER_COMPONENTS={
 product_card:new Set(['standard','minimal','soft','bold','technical','compact','quick_add','editorial']),
 form_control:new Set(['standard','ios_grouped','soft_filled','outline','minimal']),
 form_size:new Set(['compact','standard','large']),
 form_group:new Set(['standard','inset_grouped','card','flat']),
 product_image_ratio:new Set(['square','portrait','landscape','auto']),
 product_badge_position:new Set(['top_left','top_right','inline','hidden']),
 product_price_layout:new Set(['stacked','inline','emphasis','compact']),
 product_quick_add:new Set(['hidden','button','icon']),
 product_density:new Set(['compact','comfortable','spacious']),
 product_radius:new Set(['small','medium','large','xl']),
 product_elevation:new Set(['flat','soft','raised']),
 typography_preset:new Set(['ios_system','system_minimal','modern_sans','clean_commerce','geometric','friendly','humanist','editorial','luxury_serif','classic_serif','technical','compact_ui']),
 typography_scale:new Set(['compact','standard','large']),
 typography_heading_weight:new Set(['regular','semibold','bold','heavy']),
 typography_body_weight:new Set(['regular','medium','semibold']),
 typography_caption_weight:new Set(['regular','medium','semibold']),
 typography_button_weight:new Set(['medium','semibold','bold']),
 typography_line_height:new Set(['tight','standard','relaxed']),
 typography_letter_spacing:new Set(['tight','normal','wide']),
};
const CUSTOMER_NAV_OPTIONS={
 nav_mobile:new Set(['standard','ios_tab','floating_tab','minimal_tab','commerce_tab']),
 nav_labels:new Set(['always','active_only','hidden']),
 nav_indicator:new Set(['filled_icon','pill','dot','underline','background']),
 nav_container:new Set(['edge','floating','glass']),
 nav_icon_size:new Set(['size_20','size_22','size_24','size_26']),
 nav_active_style:new Set(['outline','filled','duotone']),
 nav_inactive_style:new Set(['outline','filled']),
};
const CUSTOMER_BUTTON_OPTIONS={
 button_primary:new Set(['solid','soft','outline','pill','ios_filled','ios_tonal','ios_outline','ios_soft','ios_pill']),
 button_secondary:new Set(['soft','solid','outline','ghost','pill','ios_tonal','ios_outline','ios_plain','ios_soft']),
 button_tertiary:new Set(['ghost','soft','outline','plain','ios_plain','ios_tonal','ios_outline']),
 button_destructive:new Set(['solid','soft','outline','ios_destructive','ios_destructive_soft','ios_destructive_outline']),
 button_icon:new Set(['round','square','ghost','ios_circle','ios_square','ios_plain']),
 button_size:new Set(['compact','standard','large']),
};
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
const packageScale=v=>v==='compact'?.94:v==='large'?1.08:1;
const radiusValue=v=>v==='pill'?'999px':v==='xl'?'34px':v==='large'?'26px':v==='small'?'9px':'16px';
const TYPE_WEIGHT={regular:400,medium:500,semibold:600,bold:700,heavy:800};
const TYPE_LINE_HEIGHT={tight:{heading:1.12,body:1.35},standard:{heading:1.2,body:1.5},relaxed:{heading:1.3,body:1.65}};
const TYPE_LETTER_SPACING={tight:'-.02em',normal:'0em',wide:'.02em'};

function resolveThemeComponents(themePackage,experience={}){
 if(!themePackage?.key||!themePackage?.version)return{};
 const manifest=themePackage.manifest||{},defaults=manifest.components||{},advertised=manifest.component_options||{},overrides=experience.theme_component_overrides||{},out={};
 for(const[key,allowed]of Object.entries(CUSTOMER_COMPONENTS)){
  const packageDefault=String(defaults[key]||'').toLowerCase();if(allowed.has(packageDefault))out[key]=packageDefault;
  const override=String(overrides[key]||'').toLowerCase(),packageAllowed=Array.isArray(advertised[key])?advertised[key]:[];
  if(allowed.has(override)&&packageAllowed.includes(override))out[key]=override;
 }
 return out;
}
function resolveThemeNavigation(themePackage,experience={}){
 if(!themePackage?.key||!themePackage?.version)return null;
 const manifest=themePackage.manifest||{},navigation=manifest.navigation||{},icons=manifest.icons||{},advertised=manifest.component_options||{},overrides=experience.theme_component_overrides||{};
 const defaults={
  nav_mobile:navigation.mobile||'standard',nav_labels:navigation.labels||'always',nav_indicator:navigation.active_indicator||'filled_icon',nav_container:navigation.container||'edge',
  nav_icon_size:`size_${[20,22,24,26].includes(Number(icons.size))?Number(icons.size):24}`,nav_active_style:icons.active_style||'filled',nav_inactive_style:icons.inactive_style||'outline',
 };
 const selected={...defaults};
 for(const[key,allowed]of Object.entries(CUSTOMER_NAV_OPTIONS)){
  const requested=String(overrides[key]||'').toLowerCase(),packageAllowed=Array.isArray(advertised[key])?advertised[key]:[];
  if(allowed.has(requested)&&packageAllowed.includes(requested))selected[key]=requested;
 }
 return {mobile:selected.nav_mobile,labels:selected.nav_labels,indicator:selected.nav_indicator,container:selected.nav_container,iconSize:Number(selected.nav_icon_size.replace('size_',''))||24,activeStyle:selected.nav_active_style,inactiveStyle:selected.nav_inactive_style};
}
function resolveThemeButtons(themePackage,experience={}){
 if(!themePackage?.key||!themePackage?.version)return null;
 const manifest=themePackage.manifest||{},buttons=manifest.buttons||{},advertised=manifest.component_options||{},overrides=experience.theme_component_overrides||{};
 const defaults={button_primary:buttons.primary||'solid',button_secondary:buttons.secondary||'soft',button_tertiary:buttons.tertiary||'ghost',button_destructive:buttons.destructive||'solid',button_icon:buttons.icon||'round',button_size:buttons.size||'standard'};
 const selected={...defaults};
 for(const[key,allowed]of Object.entries(CUSTOMER_BUTTON_OPTIONS)){
  const requested=String(overrides[key]||'').toLowerCase(),packageAllowed=Array.isArray(advertised[key])?advertised[key]:[];
  if(allowed.has(requested)&&packageAllowed.includes(requested))selected[key]=requested;
 }
 return {primary:selected.button_primary,secondary:selected.button_secondary,tertiary:selected.button_tertiary,destructive:selected.button_destructive,icon:selected.button_icon,size:selected.button_size};
}
function resolveThemeTypography(themePackage,themeComponents={}){
 if(!themePackage?.key||!themePackage?.version)return null;
 const typography=themePackage.manifest?.typography||{};
 const presetKey=String(themeComponents.typography_preset||typography.preset||'SYSTEM_MINIMAL').toUpperCase();
 const preset=Object.hasOwn(FONT_PRESETS,presetKey)?presetKey:'SYSTEM_MINIMAL';
 const scale=themeComponents.typography_scale||typography.scale||'standard';
 const headingWeight=themeComponents.typography_heading_weight||typography.heading_weight||'semibold';
 const bodyWeight=themeComponents.typography_body_weight||typography.body_weight||'regular';
 const captionWeight=themeComponents.typography_caption_weight||typography.caption_weight||'regular';
 const buttonWeight=themeComponents.typography_button_weight||typography.button_weight||'semibold';
 const lineHeight=themeComponents.typography_line_height||typography.line_height||'standard';
 const letterSpacing=themeComponents.typography_letter_spacing||typography.letter_spacing||'normal';
 return {preset,scale,headingWeight,bodyWeight,captionWeight,buttonWeight,lineHeight,letterSpacing};
}
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
 const themePackage=config.theme_package&&typeof config.theme_package==='object'?config.theme_package:null;const manifest=themePackage?.manifest||{};const foundations=manifest.foundations||{};const packageColors=foundations.colors||{};const packageTypography=manifest.typography||{};const packageButtons=manifest.buttons||{};const themeComponents=resolveThemeComponents(themePackage,exp);const themeNavigation=resolveThemeNavigation(themePackage,exp);const themeButtons=resolveThemeButtons(themePackage,exp);const themeTypography=resolveThemeTypography(themePackage,themeComponents);
 const experienceBranding=exp.branding||{};const branding={...(config.tenant?.branding||{}),...experienceBranding};if(experienceBranding.use_internal_name===true)branding.store_name=config.store?.name||config.tenant?.name||branding.store_name;
 const legacyVars={accent:theme.primary||branding.accent||DEFAULTS.accent,accent2:theme.secondary||DEFAULTS.accent2,accent3:theme.accent||DEFAULTS.accent3,bg:theme.background||DEFAULTS.bg,surface:theme.surface||DEFAULTS.surface,ink:theme.text||DEFAULTS.ink,muted:theme.muted_text||DEFAULTS.muted,success:theme.success||DEFAULTS.success,danger:theme.danger||DEFAULTS.danger};
 const vars={accent:packageColors.primary||legacyVars.accent,accent2:packageColors.secondary||legacyVars.accent2,accent3:packageColors.accent||legacyVars.accent3,bg:packageColors.background||legacyVars.bg,surface:packageColors.surface||legacyVars.surface,ink:packageColors.text||legacyVars.ink,muted:packageColors.muted_text||legacyVars.muted,success:packageColors.success||legacyVars.success,danger:packageColors.danger||legacyVars.danger};
 for(const[k,v]of Object.entries(vars))root.style.setProperty(`--${k}`,COLOR.test(String(v||''))?v:DEFAULTS[k]);
 const legacyRadius=theme.radius==='large'?'26px':theme.radius==='xl'?'34px':theme.radius==='small'?'9px':'16px';const radius=themePackage?radiusValue(foundations.radius):legacyRadius;root.style.setProperty('--radius',radius);
 const typographyPreset=themePackage?(themeTypography?.preset||packageTypography.preset||'SYSTEM_MINIMAL'):typography.preset;const preset=ensureFont(typographyPreset);root.style.setProperty('--font-heading',preset.heading);root.style.setProperty('--font-body',preset.body);
 if(themePackage){const scale=packageScale(themeTypography?.scale||packageTypography.scale);const line=TYPE_LINE_HEIGHT[themeTypography?.lineHeight]||TYPE_LINE_HEIGHT.standard;root.style.setProperty('--heading-scale',String(scale));root.style.setProperty('--body-scale',String(scale));root.style.setProperty('--letter-spacing',TYPE_LETTER_SPACING[themeTypography?.letterSpacing]||'0em');root.style.setProperty('--theme-heading-weight',String(TYPE_WEIGHT[themeTypography?.headingWeight]||600));root.style.setProperty('--theme-body-weight',String(TYPE_WEIGHT[themeTypography?.bodyWeight]||400));root.style.setProperty('--theme-caption-weight',String(TYPE_WEIGHT[themeTypography?.captionWeight]||400));root.style.setProperty('--theme-button-weight',String(TYPE_WEIGHT[themeTypography?.buttonWeight]||600));root.style.setProperty('--theme-heading-line-height',String(line.heading));root.style.setProperty('--theme-body-line-height',String(line.body));}
 else{root.style.setProperty('--heading-scale',String(scaleHeading(typography.heading_scale)));root.style.setProperty('--body-scale',String(scaleBody(typography.body_scale)));root.style.setProperty('--letter-spacing',typography.letter_spacing==='wide'?'.025em':typography.letter_spacing==='tight'?'-.025em':'0em');root.style.removeProperty('--theme-heading-weight');root.style.removeProperty('--theme-body-weight');root.style.removeProperty('--theme-caption-weight');root.style.removeProperty('--theme-button-weight');root.style.removeProperty('--theme-heading-line-height');root.style.removeProperty('--theme-body-line-height');}
 const cols=responsive.product_columns||{};root.style.setProperty('--products-desktop',String(cols.desktop||4));root.style.setProperty('--products-tablet',String(cols.tablet||3));root.style.setProperty('--products-mobile',String(cols.mobile||2));root.style.setProperty('--theme-nav-icon-size',`${themeNavigation?.iconSize||24}px`);
 root.dataset.themePreset=themePackage?`package-${String(themePackage.key||'theme').toLowerCase()}`:(theme.preset||'custom');root.dataset.cardStyle=theme.card_style||'clean';root.dataset.buttonStyle=themePackage?(themeButtons?.primary||packageButtons.primary||'solid'):(theme.button_style||'solid');root.dataset.density=themePackage?(foundations.density||'comfortable'):(theme.density||'comfortable');root.dataset.headerLayout=layout.header||'logo_left';root.dataset.heroLayout=layout.hero||'split';root.dataset.categoryLayout=layout.categories||'cards';root.dataset.productGrid=layout.product_grid||'four';root.dataset.productCard=themeComponents.product_card||layout.product_card||'standard';root.dataset.mobileNav=themePackage?(themeNavigation?.mobile||'standard'):(layout.mobile_nav||'standard');root.dataset.typography=typographyPreset||'SYSTEM_MINIMAL';root.dataset.buttonCase=typography.button_case||'none';root.dataset.heroMediaDesktop=responsive.hero_media_position?.desktop||'right';root.dataset.heroMediaTablet=responsive.hero_media_position?.tablet||'right';root.dataset.heroMediaMobile=responsive.hero_media_position?.mobile||'below';
 root.dataset.themeSystem=themePackage?'v1':'';root.dataset.themePackage=themePackage?`${themePackage.key}@${themePackage.version}`:'';root.dataset.themeRadius=themePackage?(foundations.radius||'medium'):'';root.dataset.themeDensity=themePackage?(foundations.density||'comfortable'):'';root.dataset.themeButtonPrimary=themePackage?(themeButtons?.primary||packageButtons.primary||'solid'):'';root.dataset.themeButtonSecondary=themePackage?(themeButtons?.secondary||packageButtons.secondary||'soft'):'';root.dataset.themeButtonTertiary=themePackage?(themeButtons?.tertiary||packageButtons.tertiary||'ghost'):'';root.dataset.themeButtonDestructive=themePackage?(themeButtons?.destructive||packageButtons.destructive||'solid'):'';root.dataset.themeButtonIcon=themePackage?(themeButtons?.icon||packageButtons.icon||'round'):'';root.dataset.themeButtonSize=themePackage?(themeButtons?.size||packageButtons.size||'standard'):'';root.dataset.themeFormControl=themeComponents.form_control||'';root.dataset.themeFormSize=themeComponents.form_size||'';root.dataset.themeFormGroup=themeComponents.form_group||'';root.dataset.themeNav=themePackage?(themeNavigation?.mobile||'standard'):'';root.dataset.themeNavLabels=themePackage?(themeNavigation?.labels||'always'):'';root.dataset.themeNavIndicator=themePackage?(themeNavigation?.indicator||'filled_icon'):'';root.dataset.themeNavContainer=themePackage?(themeNavigation?.container||'edge'):'';root.dataset.themeIconActive=themePackage?(themeNavigation?.activeStyle||'filled'):'';root.dataset.themeIconInactive=themePackage?(themeNavigation?.inactiveStyle||'outline'):'';root.dataset.themeProductCard=themeComponents.product_card||'';root.dataset.themeProductImageRatio=themeComponents.product_image_ratio||'';root.dataset.themeProductBadgePosition=themeComponents.product_badge_position||'';root.dataset.themeProductPriceLayout=themeComponents.product_price_layout||'';root.dataset.themeProductQuickAdd=themeComponents.product_quick_add||'';root.dataset.themeProductDensity=themeComponents.product_density||'';root.dataset.themeProductRadius=themeComponents.product_radius||'';root.dataset.themeProductElevation=themeComponents.product_elevation||'';root.dataset.themeTypographyPreset=themeTypography?.preset||'';root.dataset.themeTypographyScale=themeTypography?.scale||'';root.dataset.themeTypographyHeadingWeight=themeTypography?.headingWeight||'';root.dataset.themeTypographyBodyWeight=themeTypography?.bodyWeight||'';root.dataset.themeTypographyCaptionWeight=themeTypography?.captionWeight||'';root.dataset.themeTypographyButtonWeight=themeTypography?.buttonWeight||'';root.dataset.themeTypographyLineHeight=themeTypography?.lineHeight||'';root.dataset.themeTypographyLetterSpacing=themeTypography?.letterSpacing||'';
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
 useEffect(()=>{const embed=designerEmbedding();if(!embed.enabled||!config?.routing?.preview)return undefined;document.documentElement.dataset.designerEmbed='true';const onMessage=e=>{if(e.origin!==embed.parentOrigin||e.source!==window.parent)return;const m=e.data||{};if(m.type!=='luke-store-designer:config'||!m.config||typeof m.config!=='object')return;setConfig(prev=>{if(!prev)return prev;const next={...prev,experience:m.config,theme_package:m.theme_package===undefined?prev.theme_package:m.theme_package};applyTheme(next);return next;});};window.addEventListener('message',onMessage);window.parent.postMessage({type:'luke-store-designer:ready',experienceVersion:config.experience_version,storeId:config.store?.id},embed.parentOrigin);return()=>{window.removeEventListener('message',onMessage);delete document.documentElement.dataset.designerEmbed;};},[config?.routing?.preview,config?.experience_version,config?.store?.id]);
 const experience=config?.experience||{};const themePackage=config?.theme_package||null;const themeComponents=resolveThemeComponents(themePackage,experience);const themeNavigation=resolveThemeNavigation(themePackage,experience);const themeButtons=resolveThemeButtons(themePackage,experience);const themeTypography=resolveThemeTypography(themePackage,themeComponents);const rawBranding={...(config?.tenant?.branding||{}),...(experience.branding||{})};const effectiveBranding=experience.branding?.use_internal_name===true?{...rawBranding,store_name:config?.store?.name||config?.tenant?.name||rawBranding.store_name}:rawBranding;
 const value={config,tenant:config?.tenant||null,store:config?.store||null,routing:config?.routing||null,channels:config?.channels||{},experience,themePackage,themeComponents,themeNavigation,themeButtons,themeTypography,effectiveBranding,customerService:config?.customer_service||null,loading,error,errorCode,reload,publicApi:api};
 return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
export function useStore(){return useContext(StoreContext);}