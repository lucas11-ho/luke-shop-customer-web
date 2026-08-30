import React, { useState } from 'react';
import { go } from '../app/router.js';
import { useStore } from '../store/StoreContext.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { useCart } from '../cart/CartContext.jsx';
import { SupportLauncher } from './SupportLauncher.jsx';
import { SafeImage } from './SafeMedia.jsx';
import { SearchOverlay } from './SearchOverlay.jsx';
import { Icon } from './icons.jsx';
import { PwaExperience } from '../pwa/PwaExperience.jsx';
import { useLocalization } from '../i18n/LocalizationContext.jsx';

const NAV={home:['/','nav.home'],explore:['/explore','nav.explore'],cart:['/cart','nav.cart'],orders:['/orders','nav.orders'],profile:['/profile','nav.profile']};
const NAV_ICON={home:'home',explore:'grid',cart:'bag',orders:'receipt',profile:'user'};
const FOOTER_NAV={home:'/',explore:'/explore',cart:'/cart',orders:'/orders',profile:'/profile',signin:'/login'};
const SOCIAL_LABEL={facebook:'Facebook',instagram:'Instagram',telegram:'Telegram',tiktok:'TikTok',youtube:'YouTube',x:'X'};
const LIBRARY_LABEL={en:'My library',my:'My Library',id:'Perpustakaan saya'};
function safeHttps(value){try{const url=new URL(String(value||''));return url.protocol==='https:'?url.toString():''}catch{return''}}

function StorefrontFooter({brand}){
  const{experience}=useStore();
  const footer=experience?.footer;
  if(!footer?.enabled)return null;
  const name=brand?.store_name||'Luke Shop';
  const groups=Array.isArray(footer.groups)?footer.groups.slice(0,4):[];
  const socials=(Array.isArray(footer.social_links)?footer.social_links:[]).map(item=>({...item,url:safeHttps(item?.url)})).filter(item=>item.url&&SOCIAL_LABEL[item.network]).slice(0,6);
  const copyright=footer.copyright_text||`© ${new Date().getFullYear()} ${name}`;
  return <footer className={`storefront-footer footer-${footer.layout||'columns'}`} data-testid="storefront-footer">
    <div className="storefront-footer-inner">
      <div className="footer-main">
        {footer.show_brand!==false&&<div className="footer-brand">
          <button type="button" className="footer-brand-home" onClick={()=>go('/')} aria-label={`${name} home`}>
            {brand?.logo_url?<SafeImage src={brand.logo_url} alt="" fallback={<span className="footer-brand-mark">{name.slice(0,1).toUpperCase()}</span>}/>:<span className="footer-brand-mark">{name.slice(0,1).toUpperCase()}</span>}
            <strong>{name}</strong>
          </button>
          {footer.tagline&&<p>{footer.tagline}</p>}
        </div>}
        {groups.length>0&&<div className="footer-groups">{groups.map((group,index)=><section key={group.id||index}>
          {group.title&&<strong>{group.title}</strong>}
          <div>{(group.links||[]).slice(0,6).map((link,linkIndex)=>{const to=FOOTER_NAV[link.destination];if(!to)return null;return <button type="button" key={link.id||linkIndex} onClick={()=>go(to)}>{link.label||link.destination}</button>})}</div>
        </section>)}</div>}
      </div>
      {(socials.length>0||footer.show_copyright!==false)&&<div className="footer-bottom">
        {footer.show_copyright!==false&&<span>{copyright}</span>}
        {socials.length>0&&<nav aria-label="Social links">{socials.map(item=><a key={item.network} href={item.url} target="_blank" rel="noopener noreferrer">{SOCIAL_LABEL[item.network]}</a>)}</nav>}
      </div>
    </div>
  </footer>;
}

export function Shell({ children, path }) {
  const { effectiveBranding, experience } = useStore();
  const { t, localizedBranding, localePack, locale } = useLocalization();
  const { session, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const brand = localizedBranding || effectiveBranding || {};
  const name = brand.store_name || 'Luke Shop';
  const searchEnabled = experience?.features?.search !== false;
  const keys = (experience?.navigation || ['home', 'explore', 'cart', 'orders', 'profile']).filter(k=>NAV[k]);
  const desktop = keys.filter((k) => !['cart', 'profile'].includes(k));
  const header = experience?.layout?.header || 'logo_left';
  const mobileNav = experience?.layout?.mobile_nav || 'standard';
  const authOnly = path === '/login' || path === '/register';
  const navText=(key,labelKey)=>localePack?.navigation?.[key]?.title||t(labelKey);
  const libraryLabel=LIBRARY_LABEL[locale]||LIBRARY_LABEL.en;

  if (authOnly) {
    return (
      <div className={`app professional-storefront auth-only-shell header-${header} mobile-nav-${mobileNav}`}>
        <main className="auth-only-main">{children}</main>
      </div>
    );
  }

  return (
    <div className={`app professional-storefront header-${header} mobile-nav-${mobileNav}`}>
      {brand.announcement && (
        <div className="announcement"><Icon name="sparkles" size={13} />{brand.announcement}</div>
      )}
      <header className="topbar">
        <div className="topbar-inner desktop-store-header">
          <button className="brand" onClick={() => go('/')} aria-label={`${name} home`} data-testid="brand-home">
            {brand.logo_url
              ? <SafeImage src={brand.logo_url} alt="" fallback={<span className="brand-mark">{name.slice(0, 1).toUpperCase()}</span>} />
              : <span className="brand-mark">{name.slice(0, 1).toUpperCase()}</span>}
            <span>{name}</span>
          </button>
          <nav className="desktop-nav" aria-label="Primary">
            {desktop.map((k) => {
              const [to, labelKey] = NAV[k];
              return <button key={k} className={path === to ? 'active' : ''} onClick={() => go(to)} data-testid={`nav-${k}`}>{navText(k,labelKey)}</button>;
            })}
          </nav>
          <div className="header-actions">
            {searchEnabled && (
              <button className="search-action" onClick={() => setSearch(true)} aria-label={t('common.search_products')} data-testid="header-search">
                <Icon name="search" size={16} /> <span className="search-action-label">{t('common.search')}</span>
              </button>
            )}
            {keys.includes('cart') && (
              <button className="icon-btn cart-btn" onClick={() => go('/cart')} aria-label={`Cart, ${itemCount} items`} data-testid="header-cart">
                <Icon name="bag" size={18} />
                {itemCount > 0 && <b className="cart-count">{itemCount}</b>}
              </button>
            )}
            {isAuthenticated
              ? (
                <button className="account-button" onClick={() => setMenu(!menu)} aria-haspopup="menu" aria-expanded={menu} data-testid="account-menu-trigger">
                  <span className="account-avatar">{(session?.customer?.display_name || 'A').slice(0, 1).toUpperCase()}</span>
                  <span className="account-name">{session?.customer?.display_name || 'Account'}</span>
                  <Icon name="chevron-down" size={15} className="chevron" />
                </button>
              )
              : <button className="btn btn-primary btn-small" onClick={() => go('/login')} data-testid="header-signin">{t('common.sign_in')}</button>}
            {menu && isAuthenticated && (
              <div className="account-menu" role="menu">
                <div className="menu-caption">{t('profile.your_account')}</div>
                <button role="menuitem" onClick={() => { go('/profile'); setMenu(false); }}><Icon name="user" size={16} /> {t('auth.profile')}</button>
                <button role="menuitem" onClick={() => { go('/orders'); setMenu(false); }}><Icon name="receipt" size={16} /> {t('auth.orders')}</button>
                <button className="account-library-menuitem" role="menuitem" onClick={() => { go('/library'); setMenu(false); }} data-testid="account-library-link"><Icon name="gift" size={16} /> {libraryLabel}</button>
                <button role="menuitem" onClick={() => { go('/profile/language'); setMenu(false); }}><Icon name="globe" size={16} /> {t('common.language')}</button>
                <button role="menuitem" onClick={logout}><Icon name="logout" size={16} /> {t('common.sign_out')}</button>
              </div>
            )}
          </div>
        </div>
        <div className="mobile-store-header">
          <button className="mobile-store-brand" onClick={() => go('/')} aria-label={`${name} home`} data-testid="mobile-brand-home">
            {brand.logo_url
              ? <SafeImage src={brand.logo_url} alt="" fallback={<span className="brand-mark">{name.slice(0, 1).toUpperCase()}</span>} />
              : <span className="brand-mark">{name.slice(0, 1).toUpperCase()}</span>}
            <span>{name}</span>
          </button>
          <div className="mobile-header-actions">
            {searchEnabled && <button type="button" className="mobile-header-icon" onClick={() => setSearch(true)} aria-label={t('common.search_products')} data-testid="mobile-header-search"><Icon name="search" size={20}/></button>}
            <button type="button" className="mobile-header-icon mobile-account-shortcut" onClick={() => go(isAuthenticated?'/profile':'/login')} aria-label={isAuthenticated?t('common.account'):t('common.sign_in')} data-testid="mobile-header-account">
              {isAuthenticated?<span className="mobile-account-avatar">{(session?.customer?.display_name||'A').slice(0,1).toUpperCase()}</span>:<Icon name="user" size={20}/>}
            </button>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <StorefrontFooter brand={brand}/>
      <PwaExperience path={path} />
      <SupportLauncher placement="floating" />
      {searchEnabled && <SearchOverlay open={search} onClose={() => setSearch(false)} />}
      <nav className="mobile-nav" aria-label="Primary mobile">
        {keys.map((k) => {
          const [to, labelKey] = NAV[k];
          return (
            <button key={k} className={path === to ? 'active' : ''} onClick={() => go(to)} data-testid={`mobile-nav-${k}`} aria-current={path === to ? 'page' : undefined}>
              <Icon name={NAV_ICON[k]} size={21} />
              <span>{navText(k,labelKey)}</span>
              {k === 'cart' && itemCount > 0 && <b className="mobile-cart-count">{itemCount}</b>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
