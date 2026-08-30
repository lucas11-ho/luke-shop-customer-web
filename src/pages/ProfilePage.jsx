import React from'react';
import{ProfilePage as BaseProfilePage}from'./ProfilePages.jsx';
import{useAuth}from'../auth/AuthContext.jsx';
import{useLocalization}from'../i18n/LocalizationContext.jsx';
import{go}from'../app/router.js';
import{Icon}from'../components/icons.jsx';

const COPY={en:['My library','Secure access to purchased digital images and videos'],my:['My Library','ဝယ်ယူထားသော ဒစ်ဂျစ်တယ်ပုံနှင့် ဗီဒီယိုများကို လုံခြုံစွာ အသုံးပြုရန်'],id:['Perpustakaan saya','Akses aman ke gambar dan video digital yang telah dibeli']};

export function ProfilePage(){
 const{isAuthenticated}=useAuth();const{locale}=useLocalization();const[label,description]=COPY[locale]||COPY.en;
 return <><BaseProfilePage/>{isAuthenticated&&<div className="profile-library-shortcut"><button type="button" onClick={()=>go('/library')} data-testid="profile-library-shortcut"><span className="profile-menu-icon"><Icon name="gift" size={21}/></span><span><strong>{label}</strong><small>{description}</small></span><Icon name="chevron-right" size={18}/></button></div>}</>;
}
