-- ============================================================
-- OpenClaw Skill Shop - Database Schema
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- Helper: updated_at trigger
-- ============================================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- 1. profiles — 用户资料表
-- ============================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger update_profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at_column();

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

alter table profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================================
-- 2. categories — 分类表
-- ============================================================
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order int not null default 0,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

alter table categories enable row level security;

create policy "Categories are viewable by everyone"
  on categories for select using (true);

create policy "Only admins can insert categories"
  on categories for insert with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Only admins can update categories"
  on categories for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Only admins can delete categories"
  on categories for delete using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- 3. skills — 技能表
-- ============================================================
create table skills (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid not null references profiles(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  short_description text,
  description text,
  icon_url text,
  status text not null default 'draft' check (status in ('draft', 'pending_review', 'published', 'rejected', 'suspended', 'archived')),
  pricing_type text not null default 'free' check (pricing_type in ('free', 'paid')),
  price_cents int not null default 0,
  currency text not null default 'USD',
  tags text[] not null default '{}',
  rating_avg real not null default 0,
  rating_count int not null default 0,
  install_count int not null default 0,
  purchase_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index idx_skills_author on skills(author_id);
create index idx_skills_category on skills(category_id);
create index idx_skills_status on skills(status);
create index idx_skills_pricing on skills(pricing_type);
create index idx_skills_rating on skills(rating_avg desc);
create index idx_skills_installs on skills(install_count desc);
create index idx_skills_created on skills(created_at desc);

create trigger update_skills_updated_at
  before update on skills
  for each row execute function update_updated_at_column();

alter table skills enable row level security;

create policy "Published skills are viewable by everyone"
  on skills for select
  using (status = 'published' or auth.uid() = author_id);

create policy "Authenticated users can create skills"
  on skills for insert
  with check (auth.uid() = author_id);

create policy "Authors can update own skills"
  on skills for update
  using (auth.uid() = author_id);

create policy "Authors can delete own skills"
  on skills for delete
  using (auth.uid() = author_id);

-- ============================================================
-- 4. skill_versions — 技能版本表
-- ============================================================
create table skill_versions (
  id uuid primary key default uuid_generate_v4(),
  skill_id uuid not null references skills(id) on delete cascade,
  version text not null,
  manifest jsonb not null default '{}',
  changelog text,
  package_path text,
  checksum text,
  package_size bigint,
  status text not null default 'draft' check (status in ('draft', 'active', 'deprecated', 'blocked')),
  created_at timestamptz not null default now(),
  unique(skill_id, version)
);

create index idx_versions_skill on skill_versions(skill_id);

alter table skill_versions enable row level security;

create policy "Skill versions are viewable by everyone"
  on skill_versions for select using (true);

create policy "Skill authors can insert versions"
  on skill_versions for insert with check (
    exists (select 1 from skills where id = skill_id and author_id = auth.uid())
  );

-- ============================================================
-- 5. orders — 订单表
-- ============================================================
create table orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  skill_id uuid not null references skills(id) on delete cascade,
  amount_cents int not null default 0,
  currency text not null default 'USD',
  status text not null default 'pending' check (status in ('pending', 'paid', 'cancelled', 'refunded', 'failed')),
  payment_provider text,
  payment_ref text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index idx_orders_user on orders(user_id);
create index idx_orders_skill on orders(skill_id);

alter table orders enable row level security;

create policy "Users can view own orders"
  on orders for select
  using (auth.uid() = user_id);

create policy "Users can create own orders"
  on orders for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- 6. purchases — 购买记录表
-- ============================================================
create table purchases (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  skill_id uuid not null references skills(id) on delete cascade,
  order_id uuid references orders(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(user_id, skill_id)
);

create index idx_purchases_user on purchases(user_id);
create index idx_purchases_skill on purchases(skill_id);

alter table purchases enable row level security;

create policy "Users can view own purchases"
  on purchases for select
  using (auth.uid() = user_id);

create policy "Users can create own purchases"
  on purchases for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- 7. reviews — 评价表
-- ============================================================
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  skill_id uuid not null references skills(id) on delete cascade,
  rating int not null check (rating >= 1 and rating <= 5),
  content text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, skill_id)
);

create index idx_reviews_skill on reviews(skill_id);

create trigger update_reviews_updated_at
  before update on reviews
  for each row execute function update_updated_at_column();

alter table reviews enable row level security;

create policy "Reviews are viewable by everyone"
  on reviews for select using (true);

create policy "Users can create reviews"
  on reviews for insert
  with check (auth.uid() = user_id);

create policy "Users can update own reviews"
  on reviews for update
  using (auth.uid() = user_id);

create policy "Users can delete own reviews"
  on reviews for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 8. favorites — 收藏表
-- ============================================================
create table favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  skill_id uuid not null references skills(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, skill_id)
);

create index idx_favorites_user on favorites(user_id);

alter table favorites enable row level security;

create policy "Users can view own favorites"
  on favorites for select
  using (auth.uid() = user_id);

create policy "Users can create own favorites"
  on favorites for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own favorites"
  on favorites for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 9. installs — 安装记录表
-- ============================================================
create table installs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  skill_id uuid not null references skills(id) on delete cascade,
  version_id uuid references skill_versions(id) on delete set null,
  client_version text,
  created_at timestamptz not null default now()
);

create index idx_installs_user on installs(user_id);
create index idx_installs_skill on installs(skill_id);

alter table installs enable row level security;

create policy "Users can view own installs"
  on installs for select
  using (auth.uid() = user_id);

create policy "Users can create install records"
  on installs for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- 10. audit_logs — 审计日志表
-- ============================================================
create table audit_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references profiles(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text,
  details jsonb,
  created_at timestamptz not null default now()
);

create index idx_audit_logs_actor on audit_logs(actor_id);
create index idx_audit_logs_action on audit_logs(action);
create index idx_audit_logs_created on audit_logs(created_at desc);

alter table audit_logs enable row level security;

create policy "Only admins can view audit logs"
  on audit_logs for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Authenticated users can insert audit logs"
  on audit_logs for insert
  with check (auth.uid() = actor_id);

-- ============================================================
-- Storage Buckets (run in Supabase dashboard or via API)
-- ============================================================
-- Buckets needed: skill-packages, skill-assets
-- These must be created via Supabase Dashboard (SQL doesn't manage Storage buckets)
