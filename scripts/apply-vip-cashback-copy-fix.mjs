import fs from 'node:fs';

const paths=['src/pages/CheckoutPage.jsx','scripts/v0.11.0-vip-cashback-redemption-v1-regression-test.mjs'];
const oldFragment='balance, expiry, promotions';
const newFragment='balance, reward validity, promotions';

for(const path of paths){
  let source=fs.readFileSync(path,'utf8').replace(/\r\n?/g,'\n');
  if(source.includes(newFragment)){console.log(`${path}: already updated`);continue;}
  if(!source.includes(oldFragment))throw new Error(`${path}: expected VIP cashback copy marker not found`);
  source=source.replaceAll(oldFragment,newFragment);
  fs.writeFileSync(path,source);
  console.log(`${path}: updated`);
}
