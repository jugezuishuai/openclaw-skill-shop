import pg from "pg";
import crypto from "crypto";

const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD || "18701168079q.";

const pool = new pg.Pool({
  host: "aws-1-ap-south-1.pooler.supabase.com",
  port: 6543,
  database: "postgres",
  user: "postgres.eejewwvioiqrvczhyisp",
  password: DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

async function seed() {
  const client = await pool.connect();
  try {
    // ==========================================
    // 1. Create test users
    // ==========================================
    const demoId = "22222222-2222-2222-2222-222222222222";
    const demoEmail = "demo@skillshop.dev";
    // We use Supabase auth API to create users, but for seed we insert directly
    await client.query(`
      INSERT INTO auth.users (id, email, email_confirmed_at, raw_user_meta_data, encrypted_password, created_at, updated_at, aud, role)
      VALUES ($1, $2, now(), '{"display_name":"Demo作者"}', $3, now(), now(), 'authenticated', 'authenticated')
      ON CONFLICT (id) DO NOTHING
    `, [demoId, demoEmail, crypto.randomUUID()]);

    await client.query(`
      INSERT INTO public.profiles (id, display_name, role)
      VALUES ($1, 'Demo作者', 'user')
      ON CONFLICT (id) DO NOTHING
    `, [demoId]);

    const adminId = "33333333-3333-3333-3333-333333333333";
    await client.query(`
      INSERT INTO auth.users (id, email, email_confirmed_at, raw_user_meta_data, encrypted_password, created_at, updated_at, aud, role)
      VALUES ($1, 'admin@skillshop.dev', now(), '{"display_name":"管理员"}', $2, now(), now(), 'authenticated', 'authenticated')
      ON CONFLICT (id) DO NOTHING
    `, [adminId, crypto.randomUUID()]);

    await client.query(`
      INSERT INTO public.profiles (id, display_name, role)
      VALUES ($1, '管理员', 'admin')
      ON CONFLICT (id) DO UPDATE SET role = 'admin'
    `, [adminId]);

    // Second normal user for testing
    const user2Id = "44444444-4444-4444-4444-444444444444";
    await client.query(`
      INSERT INTO auth.users (id, email, email_confirmed_at, raw_user_meta_data, encrypted_password, created_at, updated_at, aud, role)
      VALUES ($1, 'user2@skillshop.dev', now(), '{"display_name":"测试用户"}', $2, now(), now(), 'authenticated', 'authenticated')
      ON CONFLICT (id) DO NOTHING
    `, [user2Id, crypto.randomUUID()]);

    await client.query(`
      INSERT INTO public.profiles (id, display_name, role)
      VALUES ($1, '测试用户', 'user')
      ON CONFLICT (id) DO NOTHING
    `, [user2Id]);

    console.log("✓ 用户创建完成 (demo作者 + 管理员 + 测试用户)");

    // ==========================================
    // 2. Create categories
    // ==========================================
    const categories = [
      { name: "开发工具", slug: "dev-tools", description: "代码生成、调试、部署相关技能", sort_order: 1 },
      { name: "效率办公", slug: "productivity", description: "文档处理、日程管理、邮件辅助", sort_order: 2 },
      { name: "AI 工具", slug: "ai-tools", description: "AI 对话、图像生成、数据分析", sort_order: 3 },
      { name: "设计美化", slug: "design", description: "UI 设计、图标制作、配色方案", sort_order: 4 },
      { name: "数据分析", slug: "data-analysis", description: "数据清洗、可视化、报表生成", sort_order: 5 },
      { name: "安全测试", slug: "security", description: "安全扫描、漏洞检测、渗透测试", sort_order: 6 },
    ];

    const catIds = {};
    for (const cat of categories) {
      const { rows } = await client.query(
        `INSERT INTO public.categories (name, slug, description, sort_order)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (slug) DO UPDATE SET name = $1, description = $3, sort_order = $4
         RETURNING id`,
        [cat.name, cat.slug, cat.description, cat.sort_order]
      );
      catIds[cat.slug] = rows[0].id;
    }
    console.log("✓ 分类创建完成 (6个)");

    // ==========================================
    // 3. Create skills (mix of free and paid)
    // ==========================================
    const skills = [
      {
        name: "React 组件生成器",
        slug: "react-component-generator",
        short_description: "通过自然语言描述自动生成 React 组件代码，支持 TypeScript、样式定制和 Storybook。",
        description: "## 功能简介\n\n本技能可以让你用自然语言描述 UI 需求，自动生成高质量的 React 组件代码。\n\n## 特性\n\n- 支持 TypeScript 类型定义\n- 自动生成 Tailwind CSS 样式\n- 可选的 Storybook 故事文件\n- 遵循 React 最佳实践\n\n## 使用方法\n\n只需描述你需要的组件外观和功能，技能会自动生成完整的组件代码。",
        category: "dev-tools",
        pricing_type: "paid",
        price_cents: 2990,
        tags: ["react", "typescript", "代码生成", "前端"],
        rating_avg: 4.7,
        rating_count: 128,
        install_count: 2340,
        purchase_count: 156,
        status: "published",
      },
      {
        name: "智能文档助手",
        slug: "smart-doc-assistant",
        short_description: "自动生成项目文档、API 文档、README，支持中英文双语输出。",
        description: "## 功能简介\n\n自动分析代码库并生成专业的技术文档。\n\n## 特性\n\n- 支持 JSDoc/TSDoc 解析\n- 自动生成 API 参考文档\n- 中英文双语输出\n- 支持 Markdown 和 HTML 格式",
        category: "productivity",
        pricing_type: "free",
        price_cents: 0,
        tags: ["文档", "markdown", "api"],
        rating_avg: 4.3,
        rating_count: 89,
        install_count: 5670,
        purchase_count: 0,
        status: "published",
      },
      {
        name: "AI 图像生成助手",
        slug: "ai-image-generator",
        short_description: "调用 DALL-E / Stable Diffusion 生成高质量图片，支持多种风格和尺寸。",
        description: "## 功能简介\n\n通过 AI 模型生成各种风格的图片。\n\n## 特性\n\n- 支持多种 AI 模型\n- 丰富的风格预设\n- 批量生成\n- 自动优化 prompt",
        category: "ai-tools",
        pricing_type: "paid",
        price_cents: 4990,
        tags: ["ai", "图像生成", "dalle", "stable-diffusion"],
        rating_avg: 4.5,
        rating_count: 67,
        install_count: 890,
        purchase_count: 73,
        status: "published",
      },
      {
        name: "UI 配色生成器",
        slug: "ui-color-palette",
        short_description: "根据品牌主色自动生成完整的 UI 配色方案，包含浅色和深色主题。",
        description: "## 功能简介\n\n输入一个主色调，自动生成专业的 UI 配色方案。\n\n## 特性\n\n- 智能色彩搭配算法\n- 自动生成 CSS 变量\n- 浅色/深色双主题\n- 无障碍对比度检查",
        category: "design",
        pricing_type: "paid",
        price_cents: 990,
        tags: ["ui", "配色", "设计", "css"],
        rating_avg: 4.8,
        rating_count: 45,
        install_count: 1200,
        purchase_count: 52,
        status: "published",
      },
      {
        name: "Excel 数据分析大师",
        slug: "excel-data-master",
        short_description: "自动处理 Excel 表格，进行数据清洗、透视分析和图表生成。",
        description: "## 功能简介\n\n上传 Excel 文件，自动完成数据分析和可视化。\n\n## 特性\n\n- 智能数据类型识别\n- 自动清洗脏数据\n- 多维度透视分析\n- 生成专业图表",
        category: "data-analysis",
        pricing_type: "paid",
        price_cents: 1990,
        tags: ["excel", "数据分析", "图表", "报表"],
        rating_avg: 4.1,
        rating_count: 34,
        install_count: 670,
        purchase_count: 28,
        status: "published",
      },
      {
        name: "Git 提交信息生成器",
        slug: "git-commit-generator",
        short_description: "分析代码变更自动生成规范的 Git 提交信息，支持 Conventional Commits 格式。",
        description: "## 功能简介\n\n扫描 git diff 并生成符合 Conventional Commits 规范的提交信息。\n\n## 特性\n\n- 自动识别变更类型\n- 支持中文和英文\n- 可配置提交模板\n- 集成 husky 钩子",
        category: "dev-tools",
        pricing_type: "free",
        price_cents: 0,
        tags: ["git", "自动化", "规范"],
        rating_avg: 4.6,
        rating_count: 210,
        install_count: 8900,
        purchase_count: 0,
        status: "published",
      },
      {
        name: "邮件模板设计器",
        slug: "email-template-designer",
        short_description: "拖拽式邮件模板设计，支持响应式布局和主流邮件客户端。",
        description: "## 功能简介\n\n可视化设计精美的响应式邮件模板。\n\n## 特性\n\n- 拖拽式编辑\n- 响应式布局\n- 邮件客户端兼容\n- 一键导出 HTML",
        category: "productivity",
        pricing_type: "free",
        price_cents: 0,
        tags: ["email", "模板", "设计"],
        rating_avg: 3.9,
        rating_count: 23,
        install_count: 3400,
        purchase_count: 0,
        status: "published",
      },
      {
        name: "代码审查助手",
        slug: "code-review-assistant",
        short_description: "自动审查代码质量、安全漏洞和性能问题，提供改进建议。",
        description: "## 功能简介\n\n对 Pull Request 进行全面自动审查。\n\n## 特性\n\n- 代码质量检查\n- 安全漏洞扫描\n- 性能问题检测\n- 最佳实践建议",
        category: "dev-tools",
        pricing_type: "paid",
        price_cents: 3990,
        tags: ["code-review", "质量", "安全"],
        rating_avg: 4.9,
        rating_count: 56,
        install_count: 450,
        purchase_count: 41,
        status: "published",
      },
      {
        name: "SQL 查询优化器",
        slug: "sql-query-optimizer",
        short_description: "分析 SQL 查询性能瓶颈，自动生成优化建议和索引方案。",
        description: "## 功能简介\n\n自动分析慢查询并提供优化方案。\n\n## 特性\n\n- 执行计划分析\n- 索引推荐\n- 查询重写建议\n- 支持 PostgreSQL/MySQL",
        category: "data-analysis",
        pricing_type: "paid",
        price_cents: 2490,
        tags: ["sql", "数据库", "性能优化"],
        rating_avg: 4.4,
        rating_count: 78,
        install_count: 1100,
        purchase_count: 89,
        status: "published",
      },
      {
        name: "安全漏洞扫描器",
        slug: "security-vulnerability-scanner",
        short_description: "扫描项目依赖和代码中的已知安全漏洞，提供修复建议。",
        description: "## 功能简介\n\n集成 OWASP Top 10 检测，扫描代码和依赖的安全漏洞。\n\n## 特性\n\n- CVE 数据库集成\n- 依赖版本检查\n- 代码注入检测\n- 自动修复建议",
        category: "security",
        pricing_type: "free",
        price_cents: 0,
        tags: ["security", "漏洞扫描", "安全"],
        rating_avg: 4.2,
        rating_count: 15,
        install_count: 2100,
        purchase_count: 0,
        status: "published",
      },
      // Draft skill (not published)
      {
        name: "API 接口文档生成器 (草稿)",
        slug: "api-doc-generator-draft",
        short_description: "从代码注解自动生成 OpenAPI 规范文档。",
        description: "还在开发中...",
        category: "dev-tools",
        pricing_type: "free",
        price_cents: 0,
        tags: ["api", "swagger", "文档"],
        rating_avg: 0,
        rating_count: 0,
        install_count: 0,
        purchase_count: 0,
        status: "draft",
      },
    ];

    const skillIds = {};
    for (const skill of skills) {
      const { rows } = await client.query(
        `INSERT INTO public.skills (name, slug, short_description, description, category_id, author_id, pricing_type, price_cents, tags, rating_avg, rating_count, install_count, purchase_count, status, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         ON CONFLICT (slug) DO UPDATE SET name = $1
         RETURNING id`,
        [
          skill.name, skill.slug, skill.short_description, skill.description,
          catIds[skill.category], demoId, skill.pricing_type, skill.price_cents,
          skill.tags, skill.rating_avg, skill.rating_count,
          skill.install_count, skill.purchase_count, skill.status,
          skill.status === "published" ? new Date().toISOString() : null,
        ]
      );
      skillIds[skill.slug] = rows[0].id;
    }
    console.log("✓ 技能创建完成 (10个已发布 + 1个草稿)");

    // ==========================================
    // 4. Create skill versions
    // ==========================================
    const versionData = [
      { slug: "react-component-generator", versions: ["1.0.0", "1.1.0", "1.2.0"] },
      { slug: "smart-doc-assistant", versions: ["1.0.0", "2.0.0"] },
      { slug: "ai-image-generator", versions: ["1.0.0"] },
      { slug: "ui-color-palette", versions: ["1.0.0", "1.1.0"] },
      { slug: "excel-data-master", versions: ["1.0.0"] },
      { slug: "git-commit-generator", versions: ["1.0.0", "1.0.1", "1.1.0", "2.0.0"] },
      { slug: "email-template-designer", versions: ["1.0.0"] },
      { slug: "code-review-assistant", versions: ["1.0.0", "1.0.1"] },
      { slug: "sql-query-optimizer", versions: ["1.0.0"] },
      { slug: "security-vulnerability-scanner", versions: ["1.0.0"] },
    ];

    for (const { slug, versions } of versionData) {
      const skillId = skillIds[slug];
      if (!skillId) continue;
      for (const ver of versions) {
        await client.query(
          `INSERT INTO public.skill_versions (skill_id, version, manifest, changelog, status)
           VALUES ($1, $2, $3, $4, 'active')
           ON CONFLICT (skill_id, version) DO NOTHING`,
          [skillId, ver, JSON.stringify({
            name: slug,
            version: ver,
            description: "Skill manifest",
            entry: "index.js",
            permissions: ["read", "write"],
            commands: [{ name: "run", description: "Run the skill" }],
          }), ver === "1.0.0" ? "初始版本发布" : `版本 ${ver} 更新`]
        );
      }
    }
    console.log("✓ 版本创建完成");

    // ==========================================
    // 5. Create orders and purchases
    // ==========================================
    const orderData = [
      { skill: "react-component-generator", amount: 2990, status: "paid" },
      { skill: "code-review-assistant", amount: 3990, status: "paid" },
      { skill: "ui-color-palette", amount: 990, status: "paid" },
      { skill: "sql-query-optimizer", amount: 2490, status: "pending" },
    ];

    for (const order of orderData) {
      const orderId = crypto.randomUUID();
      const paidAt = order.status === "paid" ? new Date().toISOString() : null;

      await client.query(
        `INSERT INTO public.orders (id, user_id, skill_id, amount_cents, currency, status, created_at, paid_at)
         VALUES ($1, $2, $3, $4, 'USD', $5, now(), $6)
         ON CONFLICT DO NOTHING`,
        [orderId, user2Id, skillIds[order.skill], order.amount, order.status, paidAt]
      );

      if (order.status === "paid") {
        await client.query(
          `INSERT INTO public.purchases (user_id, skill_id, order_id)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, skill_id) DO NOTHING`,
          [user2Id, skillIds[order.skill], orderId]
        );
      }
    }
    console.log("✓ 订单和购买记录创建完成 (3已支付 + 1待支付)");

    // ==========================================
    // 6. Create reviews
    // ==========================================
    const reviewData = [
      { slug: "react-component-generator", rating: 5, content: "非常好用，大大提升了开发效率！组件生成质量很高。" },
      { slug: "react-component-generator", rating: 5, content: "功能强大，文档清晰，强烈推荐给所有前端开发者。" },
      { slug: "react-component-generator", rating: 4, content: "整体不错，希望能支持更多框架如 Vue 和 Svelte。" },
      { slug: "smart-doc-assistant", rating: 5, content: "自动生成的文档质量很高，节省了大量时间。" },
      { slug: "smart-doc-assistant", rating: 4, content: "使用体验很好，但中文翻译偶尔有小错误。" },
      { slug: "ai-image-generator", rating: 5, content: "生成的图片质量非常高，物超所值！" },
      { slug: "ai-image-generator", rating: 3, content: "功能是可以的，但价格有点贵，希望能有按量计费。" },
      { slug: "ui-color-palette", rating: 5, content: "配色方案非常专业，自动生成 CSS 变量太方便了。" },
      { slug: "excel-data-master", rating: 4, content: "数据清洗功能很不错，透视分析也很直观。" },
      { slug: "git-commit-generator", rating: 5, content: "提交信息生成非常规范，团队一致性大大提升。" },
      { slug: "code-review-assistant", rating: 5, content: "安全漏洞检测很全面，发现的几个问题都很关键。" },
      { slug: "sql-query-optimizer", rating: 4, content: "索引推荐非常实用，查询速度提升了50%以上。" },
    ];

    // Alternate between demo user and user2 for reviews
    for (let i = 0; i < reviewData.length; i++) {
      const r = reviewData[i];
      const reviewerId = i % 2 === 0 ? demoId : user2Id;
      await client.query(
        `INSERT INTO public.reviews (skill_id, user_id, rating, content)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, skill_id) DO NOTHING`,
        [skillIds[r.slug], reviewerId, r.rating, r.content]
      );
    }
    console.log("✓ 评价创建完成 (12条)");

    // ==========================================
    // 7. Create favorites
    // ==========================================
    const favSkills = [
      { user: demoId, slugs: ["react-component-generator", "ai-image-generator", "code-review-assistant"] },
      { user: user2Id, slugs: ["git-commit-generator", "ui-color-palette", "sql-query-optimizer", "smart-doc-assistant"] },
    ];

    for (const { user, slugs } of favSkills) {
      for (const slug of slugs) {
        await client.query(
          `INSERT INTO public.favorites (user_id, skill_id)
           VALUES ($1, $2)
           ON CONFLICT (user_id, skill_id) DO NOTHING`,
          [user, skillIds[slug]]
        );
      }
    }
    console.log("✓ 收藏创建完成 (7条)");

    // ==========================================
    // 8. Create install records
    // ==========================================
    const installSkills = ["git-commit-generator", "smart-doc-assistant", "email-template-designer", "security-vulnerability-scanner"];
    for (const slug of installSkills) {
      await client.query(
        `INSERT INTO public.installs (user_id, skill_id, client_version, created_at)
         VALUES ($1, $2, '1.0.0', now())
         ON CONFLICT DO NOTHING`,
        [user2Id, skillIds[slug]]
      );
    }
    console.log("✓ 安装记录创建完成 (4条)");

    // ==========================================
    // 9. Create audit logs
    // ==========================================
    const auditLogs = [
      { action: "skill.publish", target_type: "skill", target_id: skillIds["react-component-generator"], details: { by: "demo" } },
      { action: "admin.login", target_type: "auth", target_id: adminId, details: { ip: "127.0.0.1" } },
      { action: "category.create", target_type: "category", target_id: catIds["security"], details: { name: "安全测试" } },
    ];

    for (const log of auditLogs) {
      await client.query(
        `INSERT INTO public.audit_logs (actor_id, action, target_type, target_id, details)
         VALUES ($1, $2, $3, $4, $5)`,
        [adminId, log.action, log.target_type, log.target_id, JSON.stringify(log.details)]
      );
    }
    console.log("✓ 审计日志创建完成 (3条)");

    // ==========================================
    // Summary
    // ==========================================
    console.log("\n========== 种子数据统计 ==========");
    const { rows: stats } = await client.query(`
      SELECT
        (SELECT count(*) FROM public.profiles) as profiles,
        (SELECT count(*) FROM public.categories) as categories,
        (SELECT count(*) FROM public.skills) as skills,
        (SELECT count(*) FROM public.skill_versions) as versions,
        (SELECT count(*) FROM public.orders) as orders,
        (SELECT count(*) FROM public.purchases) as purchases,
        (SELECT count(*) FROM public.reviews) as reviews,
        (SELECT count(*) FROM public.favorites) as favorites,
        (SELECT count(*) FROM public.installs) as installs,
        (SELECT count(*) FROM public.audit_logs) as audit_logs
    `);
    console.log(JSON.stringify(stats[0], null, 2));
    console.log("\n========== 测试账号 ==========");
    console.log("  普通用户: demo@skillshop.dev");
    console.log("  管理员:   admin@skillshop.dev");
    console.log("  测试用户: user2@skillshop.dev");
    console.log("  (密码需要通过 Supabase 认证设置)");

  } catch (err) {
    console.error("种子数据创建失败:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
