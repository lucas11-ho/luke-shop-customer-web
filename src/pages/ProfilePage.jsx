import React from'react';
import{useAuth}from'../auth/AuthContext.jsx';
import{useStore}from'../store/StoreContext.jsx';
import{Empty}from'../components/UI.jsx';
import{Icon}from'../components/icons.jsx';
import{go}from'../app/router.js';
import{useLocalization}from'../i18n/LocalizationContext.jsx';

export function ProfilePage(){
 const{session,isAuthenticated,logout}=useAuth();
 const{tenant}=useStore();
 const{t,locale,locales}=useLocalization();
 if(!isAuthenticated)return <section className="section"><Empty title="Sign in to manage your account" action={<button className="btn btn-primary" onClick={()=>go('/login',{next:'/profile'})}>Sign in</button>}/></section>;
 const c=session?.customer||{};const current=locales.find(x=>x.code===locale);
 const library=({en:['My library','Secure access to purchased digital images and videos'],my:['My Library','ဝယ်ယူထားသော ဒစ်ဂျစ်တယ်ပုံနှင့် ဗီဒီယိုများကို လုံခြုံစွာ အသုံးပြုရန်'],id:['Perpustakaan saya','Akses aman ke gambar dan video digital yang telah dibeli']})[locale]||['My library','Secure access to purchased digital images and videos'];
 const vip=({en:['VIP & rewards','View your tier, benefits, reward balance and history'],my:['VIP နှင့် ဆုလာဘ်များ','VIP အဆင့်၊ အကျိုးခံစားခွင့်၊ ဆုလာဘ်လက်ကျန်နှင့် မှတ်တမ်းများကို ကြည့်ရန်'],id:['VIP & hadiah','Lihat level, manfaat, saldo hadiah, dan riwayat Anda']})[locale]||['VIP & rewards','View your tier, benefits, reward balance and history'];
 const birthday=({en:['Birthday & VIP','Set your birthday for eligible birthday rewards'],my:['မွေးနေ့နှင့် VIP','အရည်အချင်းပြည့်မီသော မွေးနေ့ဆုလာဘ်များအတွက် မွေးနေ့ကို သတ်မှတ်ပါ'],id:['Ulang tahun & VIP','Atur tanggal lahir untuk hadiah ulang tahun yang memenuhi syarat']})[locale]||['Birthday & VIP','Set your birthday for eligible birthday rewards'];
 const items=[['user',t('profile.personal'),t('profile.personal_desc'),'/profile/personal'],['gift',birthday[0],birthday[1],'/profile/birthday'],['address',t('profile.addresses'),t('profile.addresses_desc'),'/profile/addresses'],['shield',t('profile.security'),t('profile.security_desc'),'/profile/security'],['receipt',t('profile.orders'),t('profile.orders_desc'),'/orders'],['star',vip[0],vip[1],'/vip'],['gift',library[0],library[1],'/library'],['globe',t('profile.language'),current?.native_label||t('profile.language_desc'),'/profile/language'],['bell',t('profile.notifications'),t('profile.notifications_desc'),'/orders'],['headset',t('profile.support'),t('profile.support_desc'),'/profile/support']];
 return <section className="section profile-hub-v08"><div className="profile-hero-card"><div className="profile-avatar-large">{c.avatar_url?<img src={c.avatar_url} alt=""/>:(c.display_name||'C').slice(0,1).toUpperCase()}</div><div className="profile-hero-copy"><span className="eyebrow">{t('profile.your_account')}</span><h1>{c.display_name||t('profile.customer')}</h1><strong className="customer-code-chip">{c.customer_code||c.id}</strong><span>{c.email||c.phone_e164||t('profile.secure_account')}</span></div></div><div className="profile-menu-list">{items.map(([icon,label,desc,path])=><button key={path} className={`profile-menu-item ${path==='/vip'?'profile-vip-center-item':''}`} onClick={()=>go(path)}><span className="profile-menu-icon"><Icon name={icon} size={21}/></span><span><strong>{label}</strong><small>{desc}</small></span><Icon name="chevron-right" size={18}/></button>)}</div><div className="profile-meta-strip"><span>{t('profile.currency')} <strong>{tenant?.currency||'—'}</strong></span><span>{t('common.language')} <strong>{current?.native_label||locale.toUpperCase()}</strong></span></div><button className="btn btn-secondary btn-full" onClick={logout}><Icon name="logout" size={17}/> {t('common.sign_out')}</button></section>;
}
