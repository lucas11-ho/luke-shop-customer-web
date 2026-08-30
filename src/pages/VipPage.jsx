import React,{useEffect,useMemo,useState}from'react';
import{useAuth}from'../auth/AuthContext.jsx';
import{useStore}from'../store/StoreContext.jsx';
import{go}from'../app/router.js';
import{Badge,Empty,Spinner,Toast,formatDate,money}from'../components/UI.jsx';
import{Icon}from'../components/icons.jsx';
import{useLocalization}from'../i18n/LocalizationContext.jsx';

const COPY={
 en:{eyebrow:'VIP & loyalty',title:'VIP & rewards',subtitle:'Track your current tier, qualification progress and rewards using the store’s confirmed loyalty records.',loading:'Loading your VIP account…',signIn:'Sign in to view VIP & rewards',signInBody:'Your tier and rewards are protected by your customer account.',signInAction:'Sign in',inactive:'VIP program is not active',inactiveBody:'This store has not enabled its VIP program yet. Existing reward history remains visible when available.',noLevel:'No tier yet',topTier:'Top tier reached',nextTier:'Next tier',progress:'Qualification progress',spend:'Qualified spend',orders:'Qualified orders',benefits:'Current benefits',noBenefits:'No active benefits are attached to your current tier.',rewardBalance:'Reward balance',ledgerNote:'Calculated from the store’s immutable reward ledger.',availableRewards:'Vouchers & gifts',noEntitlements:'No voucher or gift rewards have been issued yet.',rewardHistory:'Reward history',noRewardHistory:'No reward ledger activity yet.',tierHistory:'Tier history',noTierHistory:'No tier changes yet.',evaluation:'Evaluation',expires:'Tier expires',grace:'Grace until',lifetime:'Lifetime',rolling:'Rolling period',calendar:'Calendar period',custom:'Custom period',andRule:'Meet both requirements to qualify.',orRule:'Meet either requirement to qualify.',spendRule:'Meet the spend requirement to qualify.',ordersRule:'Meet the completed-order requirement to qualify.',freeDelivery:'Free delivery',cashback:'Cashback',voucher:'Voucher',gift:'Gift',tierEntry:'On tier entry',everyOrder:'Every completed order',monthly:'Monthly',annual:'Annual',birthday:'Birthday',manual:'Merchant issued',available:'Available',redeemed:'Redeemed',expired:'Expired',cancelled:'Cancelled',copyCode:'Copy code',copied:'Reward code copied',code:'Reward code',issued:'Issued',sourceOrder:'Source order',validUntil:'Valid until',from:'From',to:'To',current:'Current tier',serverConfirmed:'Tier, reward balance and entitlement status are confirmed by the store server. This page does not change or redeem rewards.'},
 my:{eyebrow:'VIP နှင့် Loyalty',title:'VIP နှင့် ဆုလာဘ်များ',subtitle:'လက်ရှိအဆင့်၊ အရည်အချင်းပြည့်မီမှု တိုးတက်မှုနှင့် ဆုလာဘ်များကို ဆိုင်၏ အတည်ပြုထားသော မှတ်တမ်းများအတိုင်း ကြည့်ရှုပါ။',loading:'VIP အကောင့်ကို ဖွင့်နေသည်…',signIn:'VIP နှင့် ဆုလာဘ်များကြည့်ရန် အကောင့်ဝင်ပါ',signInBody:'သင့် VIP အဆင့်နှင့် ဆုလာဘ်များကို customer account ဖြင့် ကာကွယ်ထားပါသည်။',signInAction:'အကောင့်ဝင်ရန်',inactive:'VIP အစီအစဉ် မဖွင့်ရသေးပါ',inactiveBody:'ဤဆိုင်တွင် VIP အစီအစဉ်ကို မဖွင့်ရသေးပါ။ ရှိပြီးသား ဆုလာဘ်မှတ်တမ်းများ ရှိပါက ဆက်လက်ပြသပါမည်။',noLevel:'VIP အဆင့် မရှိသေးပါ',topTier:'အမြင့်ဆုံးအဆင့် ရောက်ရှိပြီး',nextTier:'နောက်အဆင့်',progress:'အရည်အချင်းပြည့်မီမှု',spend:'အရည်အချင်းပြည့်မီသော အသုံးစရိတ်',orders:'အရည်အချင်းပြည့်မီသော အော်ဒါ',benefits:'လက်ရှိ အကျိုးခံစားခွင့်များ',noBenefits:'လက်ရှိ VIP အဆင့်အတွက် အသက်ဝင်သော အကျိုးခံစားခွင့် မရှိသေးပါ။',rewardBalance:'ဆုလာဘ် လက်ကျန်',ledgerNote:'ဆိုင်၏ မပြောင်းလဲနိုင်သော reward ledger မှ တွက်ချက်ထားပါသည်။',availableRewards:'Voucher နှင့် Gift',noEntitlements:'Voucher သို့မဟုတ် Gift ဆုလာဘ် မထုတ်ပေးရသေးပါ။',rewardHistory:'ဆုလာဘ် မှတ်တမ်း',noRewardHistory:'Reward ledger မှတ်တမ်း မရှိသေးပါ။',tierHistory:'VIP အဆင့် မှတ်တမ်း',noTierHistory:'VIP အဆင့် ပြောင်းလဲမှု မရှိသေးပါ။',evaluation:'စစ်ဆေးကာလ',expires:'အဆင့် သက်တမ်းကုန်',grace:'Grace ကာလ',lifetime:'တစ်သက်တာ',rolling:'ရွေ့လျားကာလ',calendar:'ပြက္ခဒိန်ကာလ',custom:'သတ်မှတ်ကာလ',andRule:'လိုအပ်ချက် နှစ်ခုလုံး ပြည့်မီရပါမည်။',orRule:'လိုအပ်ချက် တစ်ခုခု ပြည့်မီရပါမည်။',spendRule:'အသုံးစရိတ် လိုအပ်ချက် ပြည့်မီရပါမည်။',ordersRule:'ပြီးဆုံးသော အော်ဒါ လိုအပ်ချက် ပြည့်မီရပါမည်။',freeDelivery:'ပို့ဆောင်ခ အခမဲ့',cashback:'Cashback',voucher:'Voucher',gift:'Gift',tierEntry:'အဆင့်ဝင်ချိန်',everyOrder:'ပြီးဆုံးသော အော်ဒါတိုင်း',monthly:'လစဉ်',annual:'နှစ်စဉ်',birthday:'မွေးနေ့',manual:'ဆိုင်မှ ထုတ်ပေးသည်',available:'အသုံးပြုနိုင်',redeemed:'အသုံးပြုပြီး',expired:'သက်တမ်းကုန်',cancelled:'ပယ်ဖျက်',copyCode:'Code ကူးရန်',copied:'Reward code ကူးပြီးပါပြီ',code:'Reward code',issued:'ထုတ်ပေးချိန်',sourceOrder:'မူရင်းအော်ဒါ',validUntil:'သက်တမ်း',from:'မှ',to:'သို့',current:'လက်ရှိအဆင့်',serverConfirmed:'VIP အဆင့်၊ ဆုလာဘ်လက်ကျန်နှင့် entitlement အခြေအနေကို ဆိုင် server က အတည်ပြုပါသည်။ ဤစာမျက်နှာမှ ဆုလာဘ်ကို ပြောင်းလဲခြင်း သို့မဟုတ် redeem လုပ်ခြင်း မပြုပါ။'},
 id:{eyebrow:'VIP & loyalitas',title:'VIP & hadiah',subtitle:'Pantau level, progres kualifikasi, dan hadiah Anda berdasarkan catatan loyalitas yang dikonfirmasi toko.',loading:'Memuat akun VIP Anda…',signIn:'Masuk untuk melihat VIP & hadiah',signInBody:'Level dan hadiah Anda dilindungi oleh akun pelanggan.',signInAction:'Masuk',inactive:'Program VIP belum aktif',inactiveBody:'Toko ini belum mengaktifkan program VIP. Riwayat hadiah yang sudah ada tetap ditampilkan jika tersedia.',noLevel:'Belum ada level',topTier:'Level tertinggi tercapai',nextTier:'Level berikutnya',progress:'Progres kualifikasi',spend:'Belanja yang memenuhi syarat',orders:'Pesanan yang memenuhi syarat',benefits:'Manfaat saat ini',noBenefits:'Belum ada manfaat aktif untuk level Anda saat ini.',rewardBalance:'Saldo hadiah',ledgerNote:'Dihitung dari ledger hadiah toko yang tidak dapat diubah.',availableRewards:'Voucher & hadiah',noEntitlements:'Belum ada voucher atau hadiah yang diterbitkan.',rewardHistory:'Riwayat hadiah',noRewardHistory:'Belum ada aktivitas ledger hadiah.',tierHistory:'Riwayat level',noTierHistory:'Belum ada perubahan level.',evaluation:'Evaluasi',expires:'Level berakhir',grace:'Masa tenggang',lifetime:'Seumur hidup',rolling:'Periode berjalan',calendar:'Periode kalender',custom:'Periode khusus',andRule:'Penuhi kedua persyaratan untuk lolos.',orRule:'Penuhi salah satu persyaratan untuk lolos.',spendRule:'Penuhi persyaratan belanja untuk lolos.',ordersRule:'Penuhi persyaratan pesanan selesai untuk lolos.',freeDelivery:'Gratis ongkir',cashback:'Cashback',voucher:'Voucher',gift:'Hadiah',tierEntry:'Saat naik level',everyOrder:'Setiap pesanan selesai',monthly:'Bulanan',annual:'Tahunan',birthday:'Ulang tahun',manual:'Diterbitkan toko',available:'Tersedia',redeemed:'Digunakan',expired:'Kedaluwarsa',cancelled:'Dibatalkan',copyCode:'Salin kode',copied:'Kode hadiah disalin',code:'Kode hadiah',issued:'Diterbitkan',sourceOrder:'Pesanan sumber',validUntil:'Berlaku hingga',from:'Dari',to:'Ke',current:'Level saat ini',serverConfirmed:'Level, saldo hadiah, dan status entitlement dikonfirmasi oleh server toko. Halaman ini tidak mengubah atau menukarkan hadiah.'}
};

const periodLabel=(value,c)=>({LIFETIME:c.lifetime,ROLLING:c.rolling,CALENDAR:c.calendar,CUSTOM:c.custom})[value]||value||c.lifetime;
const frequencyLabel=(value,c)=>({TIER_ENTRY:c.tierEntry,EVERY_ORDER:c.everyOrder,MONTHLY:c.monthly,ANNUAL:c.annual,BIRTHDAY:c.birthday,MANUAL:c.manual})[value]||value;
const benefitLabel=(value,c)=>({FREE_DELIVERY:c.freeDelivery,CASHBACK:c.cashback,VOUCHER:c.voucher,GIFT:c.gift})[value]||value;
const entitlementTone=value=>value==='AVAILABLE'?'good':value==='CANCELLED'?'bad':value==='EXPIRED'?'warn':'neutral';
const ledgerTone=(type,amount)=>Number(amount)>0?'good':['REFUND_CLAWBACK','EXPIRE','REVERSAL'].includes(type)?'bad':'neutral';
const safeBadgeColor=value=>/^#[0-9a-f]{3,8}$/i.test(String(value||''))?value:null;
const pct=(value,target)=>target>0?Math.max(0,Math.min(100,Number(value||0)/Number(target)*100)):0;
const signedMoney=(value,currency,locale)=>`${Number(value||0)>0?'+':''}${money(value,currency,locale)}`;

function benefitDetail(benefit,c,currency,locale){
 const config=benefit?.config&&typeof benefit.config==='object'?benefit.config:{};
 if(benefit.benefit_type==='CASHBACK'){
  const value=(config.value_type||'PERCENTAGE')==='FIXED'?money(config.value,currency,locale):`${Number(config.value||0)}%`;
  const details=[`${value} ${c.cashback.toLowerCase()}`];
  if(Number(config.min_order)>0)details.push(`min ${money(config.min_order,currency,locale)}`);
  if(config.cap!==null&&config.cap!==undefined&&config.cap!=='')details.push(`cap ${money(config.cap,currency,locale)}`);
  return details.join(' · ');
 }
 if(benefit.benefit_type==='FREE_DELIVERY'){
  const details=[c.freeDelivery];
  if(Number(config.min_order)>0)details.push(`min ${money(config.min_order,currency,locale)}`);
  if(config.max_subsidy!==null&&config.max_subsidy!==undefined&&config.max_subsidy!=='')details.push(`up to ${money(config.max_subsidy,currency,locale)}`);
  return details.join(' · ');
 }
 return benefitLabel(benefit.benefit_type,c);
}

function ProgressRow({label,value,target,formattedValue,formattedTarget}){
 return <div className="vip-progress-row"><div className="vip-progress-copy"><span>{label}</span><strong>{formattedValue} / {formattedTarget}</strong></div><div className="vip-progress-track" aria-hidden="true"><span style={{width:`${pct(value,target)}%`}}/></div></div>;
}

export function VipPage(){
 const{api,isAuthenticated}=useAuth();
 const{tenant}=useStore();
 const{locale}=useLocalization();
 const c=COPY[locale]||COPY.en;
 const[vip,setVip]=useState(null),[rewards,setRewards]=useState(null),[loading,setLoading]=useState(false),[error,setError]=useState(''),[toast,setToast]=useState('');
 const load=async()=>{if(!isAuthenticated)return;setLoading(true);setError('');try{const[v,r]=await Promise.all([api.request('/v1/customer/vip',{auth:true}),api.request('/v1/customer/vip/rewards',{auth:true})]);setVip(v.data.vip||null);setRewards(r.data.rewards||null)}catch(e){setError(e.message||String(e))}finally{setLoading(false)}};
 useEffect(()=>{load()},[isAuthenticated]);
 const currency=rewards?.currency||vip?.currency||tenant?.currency||'USD';
 const currentLevel=vip?.current_level||null,nextLevel=vip?.next_level||null,progress=vip?.progress||{};
 const requirements=useMemo(()=>{
  if(!nextLevel)return [];
  const rows=[];
  if(Number(nextLevel.spend_threshold)>0)rows.push({kind:'spend',value:Number(progress.qualified_spend||0),target:Number(nextLevel.spend_threshold)});
  if(Number(nextLevel.order_threshold)>0)rows.push({kind:'orders',value:Number(progress.qualified_orders||0),target:Number(nextLevel.order_threshold)});
  return rows;
 },[nextLevel,progress.qualified_spend,progress.qualified_orders]);
 const ruleCopy=nextLevel?.qualification_mode==='AND'?c.andRule:nextLevel?.qualification_mode==='OR'?c.orRule:nextLevel?.qualification_mode==='ORDERS'?c.ordersRule:c.spendRule;
 const copyCode=async code=>{try{await navigator.clipboard.writeText(code);setToast(c.copied)}catch{setToast(code)}};
 if(!isAuthenticated)return <section className="section vip-center-page"><Empty icon="star" title={c.signIn} body={c.signInBody} action={<button className="btn btn-primary" onClick={()=>go('/login',{next:'/vip'})}>{c.signInAction}</button>}/></section>;
 if(loading)return <section className="section vip-center-page"><Spinner label={c.loading}/></section>;
 return <section className="section vip-center-page" data-testid="customer-vip-center">
  <div className="vip-hero" style={safeBadgeColor(currentLevel?.badge_color)?{'--vip-level-color':safeBadgeColor(currentLevel.badge_color)}:undefined}>
   <div className="vip-hero-copy"><span className="eyebrow">{c.eyebrow}</span><h1>{c.title}</h1><p>{c.subtitle}</p><div className="vip-hero-meta"><span><Icon name="clock" size={14}/>{c.evaluation}: <strong>{periodLabel(vip?.evaluation_period,c)}</strong></span>{vip?.evaluation_start&&vip?.evaluation_end&&<span>{formatDate(vip.evaluation_start,locale)} — {formatDate(vip.evaluation_end,locale)}</span>}</div></div>
   <div className="vip-level-card"><span className="vip-level-icon"><Icon name="star" size={24}/></span><small>{c.current}</small><strong>{currentLevel?.name||c.noLevel}</strong>{currentLevel?.code&&<span>{currentLevel.code}</span>}</div>
  </div>
  {error&&<div className="form-error" role="alert">{error}</div>}
  {vip&&!vip.enabled&&<div className="vip-notice"><Icon name="info" size={18}/><div><strong>{c.inactive}</strong><span>{c.inactiveBody}</span></div></div>}
  <div className="vip-summary-grid">
   <article className="vip-panel vip-progress-panel"><div className="vip-panel-head"><div><span className="eyebrow">{c.progress}</span><h2>{nextLevel?`${c.nextTier}: ${nextLevel.name}`:c.topTier}</h2></div><Icon name="radar" size={21}/></div>
    {nextLevel?<><p className="muted">{ruleCopy}</p><div className="vip-progress-list">{requirements.map(row=>row.kind==='spend'?<ProgressRow key="spend" label={c.spend} value={row.value} target={row.target} formattedValue={money(row.value,currency,locale)} formattedTarget={money(row.target,currency,locale)}/>:<ProgressRow key="orders" label={c.orders} value={row.value} target={row.target} formattedValue={String(row.value)} formattedTarget={String(row.target)}/>)}</div></>:<div className="vip-top-tier"><Icon name="check-circle" size={24}/><span>{c.topTier}</span></div>}
    <div className="vip-expiry-row">{vip?.tier_expires_at&&<span>{c.expires}: <strong>{formatDate(vip.tier_expires_at,locale)}</strong></span>}{vip?.grace_until&&<span>{c.grace}: <strong>{formatDate(vip.grace_until,locale)}</strong></span>}</div>
   </article>
   <article className="vip-panel vip-balance-panel"><div className="vip-panel-head"><div><span className="eyebrow">{c.rewardBalance}</span><h2>{money(rewards?.balance||0,currency,locale)}</h2></div><Icon name="gift" size={22}/></div><p className="muted">{c.ledgerNote}</p><div className="vip-balance-facts"><span>{c.availableRewards}<strong>{(rewards?.entitlements||[]).filter(x=>x.status==='AVAILABLE').length}</strong></span><span>{c.rewardHistory}<strong>{(rewards?.ledger||[]).length}</strong></span></div></article>
  </div>

  <article className="vip-panel"><div className="vip-panel-head"><div><span className="eyebrow">{c.benefits}</span><h2>{currentLevel?.name||c.noLevel}</h2></div><Icon name="sparkles" size={21}/></div>{vip?.benefits?.length?<div className="vip-benefit-grid">{vip.benefits.map(benefit=><div className="vip-benefit-card" key={benefit.id}><span className="vip-benefit-icon"><Icon name={benefit.benefit_type==='FREE_DELIVERY'?'truck':benefit.benefit_type==='CASHBACK'?'star':'gift'} size={19}/></span><div><strong>{benefit.name||benefitLabel(benefit.benefit_type,c)}</strong><span>{benefitDetail(benefit,c,currency,locale)}</span><small>{frequencyLabel(benefit.frequency,c)}</small></div></div>)}</div>:<p className="muted">{c.noBenefits}</p>}</article>

  <article className="vip-panel"><div className="vip-panel-head"><div><span className="eyebrow">{c.availableRewards}</span><h2>{c.availableRewards}</h2></div><Icon name="gift" size={21}/></div>{rewards?.entitlements?.length?<div className="vip-entitlement-list">{rewards.entitlements.map(item=><div className="vip-entitlement" key={item.id}><div className="vip-entitlement-main"><span className="vip-entitlement-icon"><Icon name={item.entitlement_type==='VOUCHER'?'tag':'gift'} size={19}/></span><div><strong>{item.benefit_name||benefitLabel(item.entitlement_type,c)}</strong><span>{benefitLabel(item.entitlement_type,c)}{item.source_order_number?` · ${c.sourceOrder} ${item.source_order_number}`:''}</span><small>{c.issued}: {formatDate(item.issued_at,locale)}{item.expires_at?` · ${c.validUntil}: ${formatDate(item.expires_at,locale)}`:''}</small></div></div><div className="vip-entitlement-side"><Badge tone={entitlementTone(item.status)}>{({AVAILABLE:c.available,REDEEMED:c.redeemed,EXPIRED:c.expired,CANCELLED:c.cancelled})[item.status]||item.status}</Badge>{item.redeem_code&&<div className="vip-code"><small>{c.code}</small><strong>{item.redeem_code}</strong><button type="button" className="link-btn" onClick={()=>copyCode(item.redeem_code)}>{c.copyCode}</button></div>}</div></div>)}</div>:<p className="muted">{c.noEntitlements}</p>}</article>

  <div className="vip-history-grid">
   <article className="vip-panel"><div className="vip-panel-head"><div><span className="eyebrow">{c.rewardHistory}</span><h2>{c.rewardHistory}</h2></div><Icon name="receipt" size={21}/></div>{rewards?.ledger?.length?<div className="vip-ledger-list">{rewards.ledger.slice(0,25).map(entry=><div className="vip-ledger-row" key={entry.id}><span className="vip-ledger-dot"/><div><strong>{entry.description||entry.entry_type}</strong><span>{entry.benefit_name||entry.entry_type.replaceAll('_',' ')}</span><small>{formatDate(entry.created_at,locale)}{entry.order_number?` · #${entry.order_number}`:''}{entry.expires_at?` · ${c.validUntil}: ${formatDate(entry.expires_at,locale)}`:''}</small></div><Badge tone={ledgerTone(entry.entry_type,entry.amount)}>{signedMoney(entry.amount,entry.currency||currency,locale)}</Badge></div>)}</div>:<p className="muted">{c.noRewardHistory}</p>}</article>
   <article className="vip-panel"><div className="vip-panel-head"><div><span className="eyebrow">{c.tierHistory}</span><h2>{c.tierHistory}</h2></div><Icon name="clock" size={21}/></div>{vip?.history?.length?<div className="vip-tier-history">{vip.history.map((row,index)=><div className="vip-tier-history-row" key={`${row.created_at}-${index}`}><span className="vip-history-mark"><Icon name="star" size={14}/></span><div><strong>{row.from_level_name||c.noLevel} <Icon name="arrow-right" size={13}/> {row.to_level_name||c.noLevel}</strong><span>{row.reason||row.source||'VIP'}</span><small>{formatDate(row.created_at,locale)}</small></div></div>)}</div>:<p className="muted">{c.noTierHistory}</p>}</article>
  </div>
  <div className="vip-server-note"><Icon name="shield" size={17}/><span>{c.serverConfirmed}</span></div>
  <Toast message={toast} onClose={()=>setToast('')}/>
 </section>;
}
