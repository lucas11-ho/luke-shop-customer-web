const BOT_PILOT_AUTH_URL = (
  import.meta.env.VITE_BOT_PILOT_MINIAPP_AUTH_URL
  || 'https://contact2-lucas200.pythonanywhere.com/shop/miniapp/session'
).replace(/\/$/, '');

const SHOP_ID = /^bp_[A-Za-z0-9_-]{5,117}$/;

export function botPilotShopPublicId(pathname = window.location.pathname) {
  const parts = String(pathname || '/').split('/').filter(Boolean);
  if (parts.length !== 2 || parts[0] !== 's') return '';
  const value = decodeURIComponent(parts[1] || '');
  return SHOP_ID.test(value) ? value : '';
}

async function exchangeSession(shopPublicId) {
  const tg = window.Telegram?.WebApp || null;
  const initData = String(tg?.initData || '');
  if (!initData) {
    throw new Error('Open this Shop from its Telegram bot to sign in automatically.');
  }

  tg.ready?.();
  tg.expand?.();

  let response;
  try {
    response = await fetch(BOT_PILOT_AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        shop_public_id: shopPublicId,
        actor_type: 'CUSTOMER',
        init_data: initData,
      }),
    });
  } catch {
    throw new Error('Unable to reach Bot Pilot Shop sign-in. Please try again.');
  }

  let payload = null;
  try { payload = await response.json(); } catch {}
  if (!response.ok || payload?.ok !== true) {
    throw new Error(payload?.error || 'Bot Pilot Shop sign-in failed.');
  }

  const session = payload?.data?.session;
  const tokens = session?.tokens;
  if (
    session?.actor_type !== 'CUSTOMER'
    || !session?.tenant_slug
    || !session?.store_id
    || !tokens?.access_token
    || !tokens?.refresh_token
    || !session?.customer
  ) {
    throw new Error('Bot Pilot returned an invalid customer session.');
  }
  return session;
}

function canonicalStorefrontPath(session) {
  const tenant = encodeURIComponent(session.tenant_slug);
  const store = String(session.store_slug || '').trim();
  return store
    ? `/t/${tenant}/s/${encodeURIComponent(store)}`
    : `/t/${tenant}`;
}

export async function bootstrapBotPilotCustomerMiniApp({ writeSession }) {
  const shopPublicId = botPilotShopPublicId();
  if (!shopPublicId) return { handled: false };

  const session = await exchangeSession(shopPublicId);
  const next = {
    tenantSlug: session.tenant_slug,
    accessToken: session.tokens.access_token,
    refreshToken: session.tokens.refresh_token,
    expiresIn: session.tokens.expires_in,
    customer: session.customer,
  };
  writeSession(next);

  window.history.replaceState({}, '', `${canonicalStorefrontPath(session)}#/`);
  return { handled: true, session: next };
}
