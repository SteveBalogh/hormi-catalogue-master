-- ROLES
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- CATEGORIES
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.categories to anon;
grant select, insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "categories public read" on public.categories for select using (true);
create policy "categories admin write" on public.categories for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger categories_updated_at before update on public.categories for each row execute function public.update_updated_at_column();

-- PRODUCTS
create table public.products (
  id uuid primary key default gen_random_uuid(),
  sku text unique,
  name text not null,
  slug text not null unique,
  category_id uuid references public.categories(id) on delete set null,
  short_description text,
  description text,
  price numeric(12,2),
  currency text not null default 'EUR',
  status text not null default 'active',
  availability text,
  featured boolean not null default false,
  main_image text,
  additional_images jsonb not null default '[]'::jsonb,
  specifications jsonb not null default '[]'::jsonb,
  documents jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_idx on public.products(category_id);
create index products_status_idx on public.products(status);
grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "products public read active" on public.products for select using (status = 'active');
create policy "products admin read all" on public.products for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "products admin write" on public.products for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger products_updated_at before update on public.products for each row execute function public.update_updated_at_column();

-- IMPORT LOGS
create table public.import_logs (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  total_rows integer not null default 0,
  created_count integer not null default 0,
  updated_count integer not null default 0,
  error_count integer not null default 0,
  warnings jsonb not null default '[]'::jsonb,
  imported_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
grant select, insert on public.import_logs to authenticated;
grant all on public.import_logs to service_role;
alter table public.import_logs enable row level security;
create policy "import logs admin" on public.import_logs for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- STORAGE POLICIES
create policy "product images admin read" on storage.objects for select to authenticated
  using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
create policy "product images admin write" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
create policy "product images admin update" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
create policy "product images admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));

-- SEED CATEGORIES
insert into public.categories (name, slug, description, sort_order) values
 ('Zváracia technika', 'zvaracia-technika', 'Zváracie invertory, MIG/MAG a TIG zdroje, plazmové rezačky a príslušenstvo pre profesionálne zváranie.', 1),
 ('Osobné ochranné pracovné prostriedky', 'osobne-ochranne-pracovne-prostriedky', 'Pracovné odevy, obuv, rukavice a prostriedky na ochranu zraku, sluchu a hlavy.', 2),
 ('Reklamný textil', 'reklamny-textil', 'Tričká, polokošele, softshelly a čiapky vhodné na potlač a výšivku s vaším logom.', 3),
 ('Závlahové systémy', 'zavlahove-systemy', 'Postrekovače, hadice, spojky a riadiace jednotky pre záhradné aj profesionálne závlahy.', 4),
 ('Propán-bután', 'propan-butan', 'Predaj a výmena propán-butánových fliaš pre domácnosť, gastro a priemysel.', 5),
 ('Technické plyny', 'technicke-plyny', 'Kyslík, acetylén, argón, CO2 a zváracie zmesi vrátane nájmu fliaš.', 6);

-- SEED PRODUCTS
insert into public.products (sku, name, slug, category_id, short_description, description, price, status, availability, featured, specifications, sort_order)
select v.sku, v.name, v.slug, c.id, v.short_description, v.description, v.price, 'active', v.availability, v.featured, v.specs::jsonb, v.sort_order
from (values
 ('ZV-INV-160','Zvárací invertor MMA 160 A','zvaraci-invertor-mma-160a','zvaracia-technika','Kompaktný invertor na elektródové zváranie do 160 A.','Ľahký a spoľahlivý invertor pre elektródové zváranie MMA. Vhodný pre údržbu, dielne aj domácich majstrov. Súčasťou balenia sú zváracie káble s držiakom elektród a zemniacou klieštinou.',289.00,'Na sklade',true,'[{"label":"Zvárací prúd","value":"20 – 160 A"},{"label":"Napájanie","value":"230 V / 50 Hz"},{"label":"Zaťažovateľ","value":"60 %"},{"label":"Hmotnosť","value":"4,8 kg"}]',1),
 ('ZV-MIG-200','MIG/MAG zdroj 200 A synergic','mig-mag-zdroj-200a-synergic','zvaracia-technika','Synergický MIG/MAG zdroj pre presné zváranie ocele a nerezu.','Synergický zvárací zdroj MIG/MAG s digitálnym ovládaním a plynulou reguláciou. Umožňuje zváranie ocele, nerezu aj hliníka s plnou kontrolou nad rýchlosťou podávania drôtu.',749.00,'Na sklade',true,'[{"label":"Zvárací prúd","value":"30 – 200 A"},{"label":"Metódy","value":"MIG/MAG, MMA, TIG Lift"},{"label":"Priemer drôtu","value":"0,6 – 1,0 mm"}]',2),
 ('ZV-TIG-180','TIG invertor 180 A AC/DC','tig-invertor-180a-ac-dc','zvaracia-technika','Profesionálny TIG invertor pre hliník a nerez.','TIG invertor AC/DC s pulzným režimom, ideálny na presné zváranie hliníka, nerezu a tenkých materiálov. Vysoká stabilita oblúka a jednoduché ovládanie.',1190.00,'Na objednávku',false,'[{"label":"Zvárací prúd","value":"10 – 180 A"},{"label":"Režim","value":"AC/DC, pulz"},{"label":"Chladenie","value":"Vzduchové"}]',3),
 ('ZV-KUK-9','Zváracia kukla samostmievacia','zvaracia-kukla-samostmievacia','zvaracia-technika','Samostmievacia kukla s DIN 9-13 a solárnym napájaním.','Samostmievacia zváracia kukla s veľkým priezorom a plynulým nastavením zatmenia DIN 9–13. Ochrana proti UV a IR žiareniu, nastaviteľný hlavový kríž.',59.00,'Na sklade',true,'[{"label":"Zatmenie","value":"DIN 9 – 13"},{"label":"Reakčný čas","value":"1/25000 s"},{"label":"Napájanie","value":"Solárne + batéria"}]',4),
 ('OOP-RUK-KOZ','Zváračské rukavice hovädzia koža','zvaracske-rukavice-hovadzia-koza','osobne-ochranne-pracovne-prostriedky','Päťprstové zváračské rukavice s podšívkou.','Zváračské rukavice z hovädzej štiepenkovej kože s bavlnenou podšívkou a zosilnenou dlaňou. Vysoká odolnosť proti teplu a mechanickému poškodeniu.',9.90,'Na sklade',true,'[{"label":"Materiál","value":"Hovädzia štiepenková koža"},{"label":"Norma","value":"EN 388, EN 12477"},{"label":"Veľkosti","value":"10, 11"}]',1),
 ('OOP-OBU-S3','Pracovná obuv S3 kompozit','pracovna-obuv-s3-kompozit','osobne-ochranne-pracovne-prostriedky','Polovysoká obuv S3 s kompozitnou špicou.','Pracovná obuv kategórie S3 s kompozitnou tužinkou a nekovovou planžetou. Protiskluzová podrážka, antistatické vlastnosti a priedušná podšívka.',54.90,'Na sklade',false,'[{"label":"Kategória","value":"S3 SRC"},{"label":"Špica","value":"Kompozit 200 J"},{"label":"Veľkosti","value":"38 – 48"}]',2),
 ('OOP-ODE-SET','Pracovná súprava blúza a nohavice','pracovna-suprava-bluza-nohavice','osobne-ochranne-pracovne-prostriedky','Odolná pracovná súprava do dielne aj na stavbu.','Pracovná súprava z odolnej zmesovej tkaniny s vysokou gramážou. Množstvo praktických kapsičiek, zosilnené kolená a reflexné prvky.',39.90,'Na sklade',false,'[{"label":"Materiál","value":"65 % polyester / 35 % bavlna"},{"label":"Gramáž","value":"260 g/m²"}]',3),
 ('TEX-TRI-190','Tričko na potlač 190 g','tricko-na-potlac-190g','reklamny-textil','Bavlnené tričko vhodné na potlač a výšivku.','Kvalitné bavlnené tričko s krátkym rukávom, vhodné na sieťotlač, digitálnu potlač aj výšivku. Široká škála farieb a veľkostí.',4.50,'Na sklade',false,'[{"label":"Materiál","value":"100 % bavlna"},{"label":"Gramáž","value":"190 g/m²"},{"label":"Veľkosti","value":"S – 3XL"}]',1),
 ('TEX-SOF-3L','Softshellová bunda 3-vrstvová','softshellova-bunda-3-vrstvova','reklamny-textil','Priedušná softshellová bunda ideálna na firemné logo.','Trojvrstvová softshellová bunda s membránou, vetruodolná a vodoodpudivá. Vhodná na výšivku firemného loga.',44.00,'Na objednávku',true,'[{"label":"Membrána","value":"5000 mm / 3000 g"},{"label":"Veľkosti","value":"S – 3XL"}]',2),
 ('ZAV-POS-360','Rotačný postrekovač 360°','rotacny-postrekovac-360','zavlahove-systemy','Nastaviteľný postrekovač pre trávniky a záhrady.','Rotačný postrekovač s nastaviteľným rozsahom postreku a dosahom až 12 m. Odolné telo a jednoduchá montáž do závlahového systému.',18.50,'Na sklade',false,'[{"label":"Dosah","value":"do 12 m"},{"label":"Pripojenie","value":"3/4 palca"}]',1),
 ('ZAV-RJ-6','Riadiaca jednotka závlahy 6 zón','riadiaca-jednotka-zavlahy-6-zon','zavlahove-systemy','Programovateľná jednotka pre šesť závlahových zón.','Programovateľná riadiaca jednotka pre šesť nezávislých závlahových zón s podporou dažďového senzora a záložnou batériou.',129.00,'Na objednávku',false,'[{"label":"Počet zón","value":"6"},{"label":"Programy","value":"3 nezávislé"}]',2),
 ('PB-FLA-10','Propán-butánová fľaša 10 kg','propan-butanova-flasa-10kg','propan-butan','Náplň PB fľaše 10 kg vrátane výmeny.','Plnenie a výmena propán-butánovej fľaše 10 kg. Vhodná pre domácnosť, gastro prevádzky aj vykurovanie. Cena za náplň pri výmene prázdnej fľaše.',24.90,'Na sklade',true,'[{"label":"Obsah","value":"10 kg"},{"label":"Typ","value":"Propán-bután"}]',1),
 ('PB-FLA-33','Propán-butánová fľaša 33 kg','propan-butanova-flasa-33kg','propan-butan','Veľkoobjemová PB fľaša pre priemysel a gastro.','Propán-butánová fľaša 33 kg pre náročnejšie prevádzky. Zabezpečujeme plnenie aj výmenu.',59.90,'Na sklade',false,'[{"label":"Obsah","value":"33 kg"}]',2),
 ('TP-ARG-20','Argón 4.6 – fľaša 20 l','argon-46-flasa-20l','technicke-plyny','Čistý argón pre TIG a MIG zváranie.','Technický argón čistoty 4.6 vo fľaši 20 l (200 bar). Určený pre TIG zváranie a ako ochranná atmosféra pri MIG zváraní hliníka.',null,'Na sklade',true,'[{"label":"Objem fľaše","value":"20 l / 200 bar"},{"label":"Čistota","value":"4.6"}]',1),
 ('TP-CO2-10','CO2 zvárací – fľaša 10 kg','co2-zvaraci-flasa-10kg','technicke-plyny','Zvárací CO2 pre metódu MAG.','Zvárací oxid uhličitý vo fľaši 10 kg pre zváranie metódou MAG. Možnosť nájmu fľaše.',null,'Na sklade',false,'[{"label":"Obsah","value":"10 kg"}]',2),
 ('TP-KYS-50','Kyslík technický – fľaša 50 l','kyslik-technicky-flasa-50l','technicke-plyny','Technický kyslík na rezanie a zváranie.','Technický kyslík vo fľaši 50 l (200 bar) pre autogénne rezanie a zváranie. Predaj aj výmena fliaš.',null,'Na sklade',false,'[{"label":"Objem fľaše","value":"50 l / 200 bar"}]',3)
) as v(sku,name,slug,cat,short_description,description,price,availability,featured,specs,sort_order)
join public.categories c on c.slug = v.cat;