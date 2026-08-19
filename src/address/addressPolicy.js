const DEFAULT_FIELDS={label:true,country_code:true,address_line_2:true,postal_code:true};

function asBoolean(value,fallback=true){return typeof value==='boolean'?value:fallback}
function cleanCountry(value){const v=String(value||'').trim().toUpperCase();return /^[A-Z]{2}$/.test(v)?v:''}

export function resolveAddressFieldPolicy(experience={},tenant={},store={}){
  const delivery=experience?.delivery||{};
  const raw=delivery?.address_fields||experience?.address_fields||{};
  const locale=String(tenant?.locale||store?.locale||'');
  const localeMatch=locale.match(/[-_]([A-Za-z]{2})(?:$|[-_])/);
  const defaultCountry=cleanCountry(raw.default_country_code||delivery.default_country_code||tenant?.country_code||store?.country_code||(localeMatch?.[1]||''));
  return{
    label:asBoolean(raw.label,DEFAULT_FIELDS.label),
    country_code:asBoolean(raw.country_code,DEFAULT_FIELDS.country_code),
    address_line_2:asBoolean(raw.address_line_2,DEFAULT_FIELDS.address_line_2),
    postal_code:asBoolean(raw.postal_code,DEFAULT_FIELDS.postal_code),
    default_country_code:defaultCountry,
  };
}

export function prepareAddressForPolicy(address={},policy={}){
  const next={...address};
  if(policy.label===false&&!String(next.label||'').trim())next.label='Home';
  if(policy.country_code===false&&!cleanCountry(next.country_code)&&policy.default_country_code)next.country_code=policy.default_country_code;
  next.country_code=cleanCountry(next.country_code)||String(next.country_code||'').trim().toUpperCase();
  return next;
}

export function addressSummaryParts(address={},policy={}){
  return[
    address.address_line_1,
    policy.address_line_2===false?null:address.address_line_2,
    address.city,
    address.state,
    policy.postal_code===false?null:address.postal_code,
    policy.country_code===false?null:address.country_code,
  ].filter(Boolean);
}

export const DEFAULT_ADDRESS_FIELD_POLICY=Object.freeze({...DEFAULT_FIELDS,default_country_code:''});
