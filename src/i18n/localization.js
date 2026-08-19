export const BUILTIN_LOCALES = [
  { code: 'en', label: 'English', native_label: 'English' },
  { code: 'my', label: 'Burmese', native_label: 'မြန်မာ' },
  { code: 'id', label: 'Indonesian', native_label: 'Bahasa Indonesia' },
];

const EN = {
  'nav.home':'Home','nav.explore':'Shop','nav.cart':'Bag','nav.orders':'Orders','nav.profile':'Account',
  'common.search':'Search','common.search_products':'Search products','common.sign_in':'Sign in','common.sign_out':'Sign out','common.account':'Account','common.language':'Language','common.save':'Save','common.cancel':'Cancel','common.close':'Close','common.all':'All','common.back':'Back','common.retry':'Try again','common.loading':'Loading…','common.view_product':'View product','common.choose_options':'Choose options','common.edit_choices':'Edit choices','common.added':'Added','common.adding':'Adding…','common.quick_add':'Quick add','common.in_stock':'In stock','common.out_of_stock':'Out of stock','common.only_left':'Only {count} left',
  'profile.your_account':'Your account','profile.personal':'Personal information','profile.personal_desc':'Name, profile picture and member ID','profile.addresses':'Addresses & delivery','profile.addresses_desc':'Saved addresses and precise GPS locations','profile.security':'Login & security','profile.security_desc':'Login methods, password and active sessions','profile.orders':'My orders','profile.orders_desc':'Track purchases and delivery status','profile.notifications':'Notifications','profile.notifications_desc':'Order updates are shown throughout your account','profile.support':'Customer support','profile.support_desc':'Open Luke customer support','profile.language':'Language & region','profile.language_desc':'Choose your storefront language','profile.currency':'Currency','profile.locale':'Locale','profile.customer':'Customer','profile.secure_account':'Secure customer account',
  'language.title':'Language','language.subtitle':'Choose how this storefront is displayed.','language.current':'Current language','language.default':'Store default','language.saved':'Language preference saved','language.fallback':'Some content may appear in the store default language when a translation is unavailable.','language.not_available':'This language is not enabled for this store.',
  'explore.eyebrow':'Storefront','explore.title':'Explore','explore.results_for':'Results for “{query}”','explore.search_placeholder':'Search products…','explore.categories':'Categories','explore.no_products':'No products found','explore.try_another':'Try another search or choose a different category.','explore.no_categories':'This store has not published any categories or matching products yet.',
  'home.browse':'Browse','home.shop_by_category':'Shop by category','home.see_all':'See all','home.new_arrivals':'New arrivals','home.featured_products':'Featured products','home.explore_products':'Explore products','home.featured_campaign':'Featured campaign','home.discover_collection':'Discover the collection','home.order_confidence':'Order with confidence','home.secure_checkout':'Secure checkout','home.order_tracking':'Order tracking','home.support':'Support','home.shop_offer':'Shop offer →','home.limited_offer':'Limited-time offer','home.bogo':'Buy more, get more','home.featured_product':'Featured product','home.view_product':'View product','home.curated':'Curated for you',
  'product.variant':'Variant','product.fulfillment':'Fulfillment','product.product_options':'Product options','product.selection_required':'Selection required','product.none_added':'None added','product.add':'Add · {price}','product.about':'About this item','product.details_fallback':'Product details will appear here.','product.standard_price':'Standard price','product.zoom':'Zoom','product.added_to_cart':'Added to cart','product.unable_add':'Unable to add this item. Please try again.',
  'auth.your_account':'Your account','auth.profile':'Profile','auth.orders':'Orders',
};
const MY = {
  'nav.home':'ပင်မ','nav.explore':'စျေးဝယ်','nav.cart':'အိတ်','nav.orders':'အော်ဒါများ','nav.profile':'အကောင့်',
  'common.search':'ရှာဖွေ','common.search_products':'ကုန်ပစ္စည်းရှာဖွေ','common.sign_in':'ဝင်မည်','common.sign_out':'ထွက်မည်','common.account':'အကောင့်','common.language':'ဘာသာစကား','common.save':'သိမ်းမည်','common.cancel':'ပယ်ဖျက်','common.close':'ပိတ်မည်','common.all':'အားလုံး','common.back':'နောက်သို့','common.retry':'ထပ်စမ်းမည်','common.loading':'လုပ်ဆောင်နေသည်…','common.view_product':'ကုန်ပစ္စည်းကြည့်မည်','common.choose_options':'ရွေးချယ်စရာများ','common.edit_choices':'ရွေးချယ်မှု ပြင်မည်','common.added':'ထည့်ပြီး','common.adding':'ထည့်နေသည်…','common.quick_add':'အမြန်ထည့်','common.in_stock':'ပစ္စည်းရှိ','common.out_of_stock':'ပစ္စည်းကုန်','common.only_left':'{count} ခုသာ ကျန်',
  'profile.your_account':'သင့်အကောင့်','profile.personal':'ကိုယ်ရေးအချက်အလက်','profile.personal_desc':'အမည်၊ ပရိုဖိုင်ပုံနှင့် အဖွဲ့ဝင် ID','profile.addresses':'လိပ်စာနှင့် ပို့ဆောင်မှု','profile.addresses_desc':'သိမ်းထားသောလိပ်စာနှင့် GPS နေရာ','profile.security':'ဝင်ရောက်မှုနှင့် လုံခြုံရေး','profile.security_desc':'ဝင်ရောက်နည်း၊ စကားဝှက်နှင့် session များ','profile.orders':'ကျွန်ုပ်၏ အော်ဒါများ','profile.orders_desc':'ဝယ်ယူမှုနှင့် ပို့ဆောင်မှုအခြေအနေကြည့်ရန်','profile.notifications':'အသိပေးချက်များ','profile.notifications_desc':'အော်ဒါအပ်ဒိတ်များကို အကောင့်တွင် ပြသမည်','profile.support':'ဖောက်သည်ဝန်ဆောင်မှု','profile.support_desc':'Luke ဖောက်သည်ဝန်ဆောင်မှုဖွင့်ရန်','profile.language':'ဘာသာစကားနှင့် ဒေသ','profile.language_desc':'စတိုး၏ ဘာသာစကားကို ရွေးချယ်ပါ','profile.currency':'ငွေကြေး','profile.locale':'ဒေသ','profile.customer':'ဖောက်သည်','profile.secure_account':'လုံခြုံသော ဖောက်သည်အကောင့်',
  'language.title':'ဘာသာစကား','language.subtitle':'ဤစတိုးကို မည်သည့်ဘာသာစကားဖြင့် ပြသမည်ကို ရွေးချယ်ပါ။','language.current':'လက်ရှိဘာသာစကား','language.default':'စတိုး မူလဘာသာစကား','language.saved':'ဘာသာစကားရွေးချယ်မှု သိမ်းပြီး','language.fallback':'ဘာသာပြန်မရှိသော အကြောင်းအရာအချို့ကို စတိုး၏ မူလဘာသာစကားဖြင့် ပြသနိုင်သည်။','language.not_available':'ဤဘာသာစကားကို ဤစတိုးတွင် မဖွင့်ထားပါ။',
  'explore.eyebrow':'စတိုး','explore.title':'ရှာဖွေကြည့်ရန်','explore.results_for':'“{query}” အတွက် ရလဒ်များ','explore.search_placeholder':'ကုန်ပစ္စည်းရှာဖွေ…','explore.categories':'အမျိုးအစားများ','explore.no_products':'ကုန်ပစ္စည်းမတွေ့ပါ','explore.try_another':'အခြားစကားလုံးရှာပါ သို့မဟုတ် အမျိုးအစားပြောင်းပါ။','explore.no_categories':'ဤစတိုးတွင် အမျိုးအစား သို့မဟုတ် ကိုက်ညီသောကုန်ပစ္စည်း မထုတ်ပြန်ရသေးပါ။',
  'home.browse':'ရှာဖွေကြည့်ရန်','home.shop_by_category':'အမျိုးအစားအလိုက် စျေးဝယ်ရန်','home.see_all':'အားလုံးကြည့်','home.new_arrivals':'အသစ်ရောက်ရှိမှု','home.featured_products':'အထူးရွေးချယ်ထားသော ကုန်ပစ္စည်းများ','home.explore_products':'ကုန်ပစ္စည်းများကြည့်ရန်','home.featured_campaign':'အထူးအစီအစဉ်','home.discover_collection':'စုစည်းမှုကို ရှာဖွေပါ','home.order_confidence':'ယုံကြည်စိတ်ချစွာ မှာယူပါ','home.secure_checkout':'လုံခြုံသော ငွေရှင်း','home.order_tracking':'အော်ဒါခြေရာခံ','home.support':'ဝန်ဆောင်မှု','home.shop_offer':'ကမ်းလှမ်းချက်ကြည့် →','home.limited_offer':'ကာလကန့်သတ် ကမ်းလှမ်းချက်','home.bogo':'ပိုဝယ်၊ ပိုရ','home.featured_product':'အထူးကုန်ပစ္စည်း','home.view_product':'ကုန်ပစ္စည်းကြည့်ရန်','home.curated':'သင့်အတွက် ရွေးချယ်ထားသည်',
  'product.variant':'အမျိုးအစား','product.fulfillment':'ပို့ဆောင်နည်း','product.product_options':'ကုန်ပစ္စည်းရွေးချယ်စရာများ','product.selection_required':'ရွေးချယ်ရန်လိုသည်','product.none_added':'မရွေးရသေး','product.add':'ထည့်မည် · {price}','product.about':'ဤကုန်ပစ္စည်းအကြောင်း','product.details_fallback':'ကုန်ပစ္စည်းအသေးစိတ်ကို ဤနေရာတွင် ပြသမည်။','product.standard_price':'ပုံမှန်ဈေး','product.zoom':'ချဲ့ကြည့်','product.added_to_cart':'အိတ်ထဲထည့်ပြီး','product.unable_add':'ကုန်ပစ္စည်းမထည့်နိုင်ပါ။ ထပ်စမ်းပါ။',
  'auth.your_account':'သင့်အကောင့်','auth.profile':'ပရိုဖိုင်','auth.orders':'အော်ဒါများ',
};
const ID = {
  'nav.home':'Beranda','nav.explore':'Belanja','nav.cart':'Tas','nav.orders':'Pesanan','nav.profile':'Akun',
  'common.search':'Cari','common.search_products':'Cari produk','common.sign_in':'Masuk','common.sign_out':'Keluar','common.account':'Akun','common.language':'Bahasa','common.save':'Simpan','common.cancel':'Batal','common.close':'Tutup','common.all':'Semua','common.back':'Kembali','common.retry':'Coba lagi','common.loading':'Memuat…','common.view_product':'Lihat produk','common.choose_options':'Pilih opsi','common.edit_choices':'Ubah pilihan','common.added':'Ditambahkan','common.adding':'Menambahkan…','common.quick_add':'Tambah cepat','common.in_stock':'Tersedia','common.out_of_stock':'Stok habis','common.only_left':'Tersisa {count}',
  'profile.your_account':'Akun Anda','profile.personal':'Informasi pribadi','profile.personal_desc':'Nama, foto profil, dan ID anggota','profile.addresses':'Alamat & pengiriman','profile.addresses_desc':'Alamat tersimpan dan lokasi GPS','profile.security':'Login & keamanan','profile.security_desc':'Metode login, kata sandi, dan sesi aktif','profile.orders':'Pesanan saya','profile.orders_desc':'Lacak pembelian dan status pengiriman','profile.notifications':'Notifikasi','profile.notifications_desc':'Pembaruan pesanan ditampilkan di akun Anda','profile.support':'Layanan pelanggan','profile.support_desc':'Buka layanan pelanggan Luke','profile.language':'Bahasa & wilayah','profile.language_desc':'Pilih bahasa tampilan toko','profile.currency':'Mata uang','profile.locale':'Lokal','profile.customer':'Pelanggan','profile.secure_account':'Akun pelanggan aman',
  'language.title':'Bahasa','language.subtitle':'Pilih bahasa yang digunakan untuk menampilkan toko ini.','language.current':'Bahasa saat ini','language.default':'Bahasa bawaan toko','language.saved':'Preferensi bahasa disimpan','language.fallback':'Sebagian konten mungkin tampil dalam bahasa bawaan toko jika terjemahan belum tersedia.','language.not_available':'Bahasa ini tidak diaktifkan untuk toko ini.',
  'explore.eyebrow':'Etalase','explore.title':'Jelajahi','explore.results_for':'Hasil untuk “{query}”','explore.search_placeholder':'Cari produk…','explore.categories':'Kategori','explore.no_products':'Produk tidak ditemukan','explore.try_another':'Coba pencarian lain atau pilih kategori berbeda.','explore.no_categories':'Toko ini belum menerbitkan kategori atau produk yang sesuai.',
  'home.browse':'Jelajahi','home.shop_by_category':'Belanja berdasarkan kategori','home.see_all':'Lihat semua','home.new_arrivals':'Produk terbaru','home.featured_products':'Produk unggulan','home.explore_products':'Jelajahi produk','home.featured_campaign':'Kampanye unggulan','home.discover_collection':'Temukan koleksi','home.order_confidence':'Pesan dengan percaya diri','home.secure_checkout':'Checkout aman','home.order_tracking':'Lacak pesanan','home.support':'Dukungan','home.shop_offer':'Lihat penawaran →','home.limited_offer':'Penawaran waktu terbatas','home.bogo':'Beli lebih banyak, dapat lebih banyak','home.featured_product':'Produk unggulan','home.view_product':'Lihat produk','home.curated':'Dipilih untuk Anda',
  'product.variant':'Varian','product.fulfillment':'Pemenuhan','product.product_options':'Opsi produk','product.selection_required':'Pilihan diperlukan','product.none_added':'Belum ada pilihan','product.add':'Tambah · {price}','product.about':'Tentang produk ini','product.details_fallback':'Detail produk akan tampil di sini.','product.standard_price':'Harga standar','product.zoom':'Perbesar','product.added_to_cart':'Ditambahkan ke tas','product.unable_add':'Produk tidak dapat ditambahkan. Silakan coba lagi.',
  'auth.your_account':'Akun Anda','auth.profile':'Profil','auth.orders':'Pesanan',
};

export const UI_DICTIONARIES = { en: EN, my: MY, id: ID };

export function normalizeLocale(value){
  const raw=String(value||'').trim().replace('_','-');
  if(!raw)return 'en';
  const lower=raw.toLowerCase();
  if(lower==='mm'||lower==='bur'||lower==='mya')return 'my';
  if(lower==='in'||lower==='ind')return 'id';
  return lower.split('-')[0]||'en';
}

export function interpolate(text, vars={}){
  return String(text??'').replace(/\{([a-zA-Z0-9_]+)\}/g,(_,key)=>vars[key]??`{${key}}`);
}

export function normalizeLocalizationConfig(experience={}, tenant={}){
  const raw=experience?.localization||experience?.languages||{};
  const configured=Array.isArray(raw.locales)?raw.locales:[];
  const configuredEnabled=Array.isArray(raw.enabled_locales)?raw.enabled_locales:configured.filter(x=>x?.enabled!==false).map(x=>x?.code);
  const tenantLocale=normalizeLocale(tenant?.locale||'en');
  let enabled=(configuredEnabled.length?configuredEnabled:[tenantLocale]).map(normalizeLocale).filter(Boolean);
  if(!enabled.includes(tenantLocale))enabled.unshift(tenantLocale);
  enabled=[...new Set(enabled)].slice(0,4);
  const defaults=[...BUILTIN_LOCALES];
  const labels=new Map(defaults.map(x=>[x.code,x]));
  for(const item of configured){if(!item?.code)continue;const code=normalizeLocale(item.code);labels.set(code,{code,label:item.label||item.name||code.toUpperCase(),native_label:item.native_label||item.nativeLabel||item.label||item.name||code.toUpperCase()});}
  const locales=enabled.map(code=>labels.get(code)||{code,label:code.toUpperCase(),native_label:code.toUpperCase()});
  const requestedDefault=normalizeLocale(raw.default_locale||tenantLocale||enabled[0]);
  const defaultLocale=enabled.includes(requestedDefault)?requestedDefault:enabled[0]||'en';
  return {enabled:raw.enabled!==false,defaultLocale,enabledLocales:enabled,locales,translations:raw.translations||{},uiOverrides:raw.ui||{}};
}

function entityKeys(entity={}){
  return [entity.public_id,entity.id,entity.slug,entity.code,entity.sku].filter(Boolean).map(String);
}
function entityMapFor(localePack={},type){
  const names={category:'categories',product:'products',modifier_group:'modifier_groups',modifier_option:'modifier_options',promotion:'promotions',home_section:'home_sections',navigation:'navigation'};
  return localePack[names[type]||type]||{};
}
export function entityTranslation(localePack,type,entity={}){
  const map=entityMapFor(localePack,type);
  for(const key of entityKeys(entity)){if(map?.[key]&&typeof map[key]==='object')return map[key];}
  return {};
}
export function localizeEntity(localePack,type,entity){
  if(!entity||typeof entity!=='object')return entity;
  const tr=entityTranslation(localePack,type,entity);
  return {...entity,...Object.fromEntries(Object.entries(tr||{}).filter(([,value])=>value!==undefined&&value!==null&&value!==''))};
}
export function localizeCategory(localePack,category){return localizeEntity(localePack,'category',category);}
export function localizePromotion(localePack,promotion){return localizeEntity(localePack,'promotion',promotion);}
export function localizeSection(localePack,section){return localizeEntity(localePack,'home_section',section);}
export function localizeProduct(localePack,product){
  if(!product)return product;
  const out=localizeEntity(localePack,'product',product);
  if(out.category)out.category=localizeCategory(localePack,out.category);
  if(Array.isArray(out.modifier_groups))out.modifier_groups=out.modifier_groups.map(group=>{
    const localizedGroup=localizeEntity(localePack,'modifier_group',group);
    return {...localizedGroup,options:Array.isArray(group.options)?group.options.map(option=>localizeEntity(localePack,'modifier_option',option)):group.options};
  });
  return out;
}
