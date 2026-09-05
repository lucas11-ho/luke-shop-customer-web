export const THEME_COMMERCE_SURFACE_OPTIONS=Object.freeze({
  header_surface:Object.freeze(['standard','ios_clean','compact','glass']),
  search_surface:Object.freeze(['standard','ios_search','pill','sheet']),
  account_surface:Object.freeze(['standard','ios_grouped','soft','compact']),
  cart_surface:Object.freeze(['standard','ios_grouped','soft','compact']),
  checkout_surface:Object.freeze(['standard','ios_grouped','soft','compact']),
});

export function resolveThemeCommerceSurfaces(themePackage,experience={}){
  const fallback={header_surface:'standard',search_surface:'standard',account_surface:'standard',cart_surface:'standard',checkout_surface:'standard'};
  if(!themePackage?.key||!themePackage?.version)return fallback;
  const manifest=themePackage.manifest||{},defaults=manifest.components||{},advertised=manifest.component_options||{},overrides=experience?.theme_component_overrides&&typeof experience.theme_component_overrides==='object'?experience.theme_component_overrides:{};
  const resolved={...fallback};
  for(const[key,rendererAllowed]of Object.entries(THEME_COMMERCE_SURFACE_OPTIONS)){
    const packageDefault=String(defaults[key]||'').toLowerCase();
    if(rendererAllowed.includes(packageDefault))resolved[key]=packageDefault;
    const requested=String(overrides[key]||'').toLowerCase();
    const packageAllowed=Array.isArray(advertised[key])?advertised[key]:[];
    if(rendererAllowed.includes(requested)&&packageAllowed.includes(requested))resolved[key]=requested;
  }
  return resolved;
}
