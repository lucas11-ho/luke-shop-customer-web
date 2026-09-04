import fs from 'node:fs';

const read=(path)=>fs.readFileSync(path,'utf8');
const store=read('src/store/StoreContext.jsx');
const shell=read('src/components/Shell.jsx');
const navIcon=read('src/components/ThemeNavIcon.jsx');
const css=read('src/theme-system-v1.css');
const main=read('src/main.jsx');
let count=0;
const pass=(ok,message)=>{if(!ok)throw new Error(`FAIL ${message}`);count++;console.log(`PASS ${message}`);};

pass(store.includes('config.theme_package')&&store.includes('manifest.foundations'), 'Customer runtime consumes resolved safe theme package manifest');
pass(store.includes('const themePackage=config?.theme_package||null')&&store.includes('themePackage,themeComponents'), 'Resolved package remains exposed through StoreContext after A3 component derivation');
pass(store.includes("m.theme_package===undefined?prev.theme_package:m.theme_package"), 'Designer preview can hot-swap resolved package without changing legacy config');
pass(store.includes("root.dataset.themeSystem=themePackage?'v1':''"), 'Theme System runtime is explicitly scoped');
pass(store.includes("packageNavigation.mobile||'standard'"), 'Package navigation variant controls renderer dataset');
pass(shell.includes('ThemeNavIcon')&&shell.includes('theme-system-nav'), 'Shell uses Theme System navigation renderer when package is selected');
pass(shell.includes("['standard','ios_tab','floating_tab','minimal_tab','commerce_tab']"), 'Customer renderer allow-lists all professional navigation variants');
pass(shell.includes("packageIcons.active_style||'filled'"), 'Active navigation icon style follows package contract');
pass(navIcon.includes("variant==='filled'||variant==='duotone'"), 'Filled active navigation glyph rendering exists');
pass(css.includes('.theme-nav-ios_tab')&&css.includes('.theme-nav-floating_tab')&&css.includes('.theme-nav-minimal_tab')&&css.includes('.theme-nav-commerce_tab'), 'All professional mobile navigation variants have dedicated styles');
pass(css.includes('env(safe-area-inset-bottom)'), 'Theme navigation preserves iOS safe-area spacing');
pass(css.includes('@media(prefers-reduced-motion:reduce)'), 'Theme navigation respects reduced-motion preference');
pass(main.includes("import './theme-system-v1.css'"), 'Theme System renderer stylesheet is loaded');
pass(!store.includes('eval(')&&!store.includes('new Function'), 'Theme package runtime does not execute package source');

console.log(`${count}/${count} Luke Customer Web Theme System v1 A2 checks passed`);
