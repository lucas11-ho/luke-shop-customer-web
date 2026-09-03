import fs from'node:fs';

const read=path=>fs.readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const app=read('src/app/App.jsx');
const profile=read('src/pages/ProfilePage.jsx');
const birthday=read('src/pages/BirthdayProfilePage.jsx');

const checks=[
  [app.includes("BirthdayProfilePage"),'App imports the dedicated birthday profile page'],
  [app.includes("path==='/profile/birthday'"),'Customer router exposes /profile/birthday'],
  [profile.includes("'/profile/birthday'"),'Profile hub links to Birthday & VIP'],
  [birthday.includes("api.request('/v1/customer/me'"),'Birthday is persisted through the authenticated customer profile API'],
  [birthday.includes('birth_date:birthDate||null'),'Customer may save or clear the backend birth_date'],
  [birthday.includes('type="date"')&&birthday.includes('min="1900-01-01"')&&birthday.includes('max={today}'),'Birthday editor uses bounded calendar input'],
  [birthday.includes('refreshProfile()'),'Saved birthday refreshes authoritative customer profile state'],
  [birthday.includes('does not issue, reserve, or guarantee a reward'),'UI does not promise client-side reward issuance'],
  [birthday.includes('decided securely by the store backend'),'UI names the backend authority boundary'],
  [!birthday.includes('/v1/merchant/')&&!birthday.includes('/issuance/run')&&!birthday.includes('/entitlements/issue'),'Customer page cannot invoke merchant issuance controls'],
  [!birthday.includes('localStorage')&&!birthday.includes('sessionStorage'),'Birthday is not treated as browser-authoritative profile state'],
];

const failed=checks.filter(([,ok])=>!ok).map(([name])=>name);
if(failed.length){console.error('VIP recurring entitlement customer regression failed:\n- '+failed.join('\n- '));process.exit(1)}
console.log('VIP recurring entitlement customer regression passed');
