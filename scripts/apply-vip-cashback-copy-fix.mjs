import fs from 'node:fs';

const checkoutPath='src/pages/CheckoutPage.jsx';
const regressionPath='scripts/v0.11.0-vip-cashback-redemption-v1-regression-test.mjs';
const oldCopy='Backend rechecks balance, expiry, promotions, delivery and the policy inside the order transaction.';
const newCopy='Backend rechecks balance, reward validity, promotions, delivery and the policy inside the order transaction.';

for(const path of [checkoutPath,regressionPath]){
  let source=fs.readFileSync(path,'utf8').replace(/\r\n?/g,'\n');
  if(source.includes(newCopy)){console.log(`${path}: already updated`);continue;}
  if(!source.includes(oldCopy))throw new Error(`${path}: expected VIP cashback copy marker not found`);
  source=source.replaceAll(oldCopy,newCopy);
  fs.writeFileSync(path,source);
  console.log(`${path}: updated`);
}
