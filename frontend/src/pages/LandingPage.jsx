import { useEffect, useRef, useState } from 'react';

import { Link, Navigate } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

import PublicHeader from '../components/PublicHeader';

import { useAuth } from '../context/AuthContext';



const FEATURE_KEYS = [

  { mark: 'MT', key: 'featureMultiTenant' },

  { mark: 'RB', key: 'featureRbac' },

  { mark: 'TV', key: 'featureTasks' },

  { mark: 'LC', key: 'featureLivestock' },

  { mark: 'FS', key: 'featureFinances' },

  { mark: 'VR', key: 'featureVacations' },

];



const ROLE_KEYS = [

  { roleKey: 'SUPERADMIN', textKey: 'roleSuperAdmin', color: 'from-emerald-400 to-teal-600' },

  { roleKey: 'OWNER', textKey: 'roleOwner', color: 'from-leaf-400 to-leaf-600' },

  { roleKey: 'MANAGER', textKey: 'roleManager', color: 'from-sky-400 to-sky-600' },

  { roleKey: 'WORKER', textKey: 'roleWorker', color: 'from-amber-400 to-orange-500' },

];



function useReveal() {

  const ref = useRef(null);

  useEffect(() => {

    const el = ref.current;

    if (!el) return undefined;

    const nodes = el.querySelectorAll('.fm-reveal');

    const io = new IntersectionObserver(

      (entries) => {

        entries.forEach((entry) => {

          if (entry.isIntersecting) entry.target.classList.add('is-visible');

        });

      },

      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }

    );

    nodes.forEach((n) => io.observe(n));

    return () => io.disconnect();

  }, []);

  return ref;

}



function HeroPreview() {

  const { t } = useTranslation();



  const stats = [

    ['12', t('landing.previewAnimals')],

    ['8', t('landing.previewFields')],

    ['5', t('landing.previewOpenTasks')],

  ];



  const tasks = [

    [t('landing.previewTask1'), t('status.IN_PROGRESS'), 'bg-sky-100 text-sky-800'],

    [t('landing.previewTask2'), t('landing.previewReview'), 'bg-violet-100 text-violet-800'],

    [t('landing.previewTask3'), t('status.PENDING'), 'bg-amber-100 text-amber-900'],

  ];



  return (

    <div className="relative mx-auto h-[420px] w-full max-w-md lg:mx-0 lg:h-[480px]">

      <div className="fm-pulse-orb absolute -right-6 top-10 h-40 w-40 rounded-full bg-leaf-400/30 blur-3xl" />

      <div className="fm-pulse-orb absolute bottom-8 left-0 h-32 w-32 rounded-full bg-amber-300/20 blur-3xl" />



      <div className="fm-float absolute inset-x-4 top-8 rounded-3xl border border-white/20 bg-white/95 p-5 shadow-2xl shadow-brand-950/40 backdrop-blur sm:inset-x-0">

        <div className="mb-4 flex items-center justify-between">

          <div>

            <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">

              {t('landing.previewLiveDashboard')}

            </p>

            <p className="font-display text-lg font-bold text-brand-950">

              {t('landing.previewDemoFarm')}

            </p>

          </div>

          <span className="rounded-full bg-leaf-600/10 px-2.5 py-1 text-[11px] font-bold text-leaf-600">

            {t('roles.OWNER')}

          </span>

        </div>

        <div className="grid grid-cols-3 gap-2">

          {stats.map(([v, l]) => (

            <div key={l} className="rounded-2xl bg-mist-50 px-2 py-3 text-center">

              <div className="font-display text-xl font-bold text-brand-950">{v}</div>

              <div className="text-[10px] font-medium text-ink-500">{l}</div>

            </div>

          ))}

        </div>

        <div className="mt-4 space-y-2">

          {tasks.map(([title, status, cls]) => (

            <div

              key={title}

              className="flex items-center justify-between rounded-xl border border-brand-900/5 px-3 py-2.5"

            >

              <span className="truncate text-sm font-medium text-brand-950">{title}</span>

              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${cls}`}>

                {status}

              </span>

            </div>

          ))}

        </div>

      </div>



      <div className="fm-float-slow absolute -left-2 bottom-6 z-10 w-48 rounded-2xl border border-white/30 bg-brand-900 p-4 text-white shadow-xl sm:left-[-1.5rem]">

        <p className="text-[10px] font-semibold uppercase tracking-wider text-leaf-400">

          {t('landing.previewLeaveRequest')}

        </p>

        <p className="mt-1 text-sm font-semibold">{t('landing.previewMedicalLeave')}</p>

        <p className="mt-0.5 text-xs text-white/60">{t('landing.previewWorkerDays')}</p>

        <div className="mt-3 flex gap-2">

          <span className="rounded-full bg-leaf-500 px-2.5 py-1 text-[10px] font-bold">

            {t('vacations.approve')}

          </span>

          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold">

            {t('vacations.reject')}

          </span>

        </div>

      </div>



      <div className="fm-float absolute -right-1 top-0 z-10 rounded-2xl border border-white/40 bg-white px-4 py-3 shadow-xl sm:right-[-1rem]">

        <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">

          {t('landing.previewBalance')}

        </p>

        <p className="font-display text-xl font-bold text-leaf-600">€2,530</p>

        <div className="mt-1 flex h-1.5 w-24 overflow-hidden rounded-full bg-mist-100">

          <div className="w-2/3 bg-leaf-500" />

          <div className="w-1/3 bg-rose-400" />

        </div>

      </div>

    </div>

  );

}



export default function LandingPage() {

  const { t } = useTranslation();

  const { isAuthenticated } = useAuth();

  const pageRef = useReveal();

  const [scrolled, setScrolled] = useState(false);

  const [activeRole, setActiveRole] = useState(0);



  useEffect(() => {

    const onScroll = () => setScrolled(window.scrollY > 24);

    onScroll();

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);

  }, []);



  useEffect(() => {

    const id = setInterval(

      () => setActiveRole((i) => (i + 1) % ROLE_KEYS.length),

      3200

    );

    return () => clearInterval(id);

  }, []);



  if (isAuthenticated) return <Navigate to="/dashboard" replace />;



  const trustItems = [

    [t('landing.trust1Stat'), t('landing.trust1Label')],

    [t('landing.trust2Stat'), t('landing.trust2Label')],

    [t('landing.trust3Stat'), t('landing.trust3Label')],

  ];



  const operationsBullets = [

    t('landing.operationsBullet1'),

    t('landing.operationsBullet2'),

    t('landing.operationsBullet3'),

  ];



  const payrollBullets = [

    t('landing.payrollBullet1'),

    t('landing.payrollBullet2'),

    t('landing.payrollBullet3'),

  ];



  const pipelineStatuses = [

    t('status.PENDING'),

    t('status.IN_PROGRESS'),

    t('status.COMPLETED'),

    t('status.APPROVED'),

  ];



  const demoCards = [

    [t('landing.previewAnnualLeave'), t('status.PENDING')],

    [t('landing.previewMedicalLeave'), t('status.APPROVED')],

    [t('landing.previewSalaryWorker'), '€900'],

  ];



  const footerModules = [

    t('landing.footerModLivestock'),

    t('landing.footerModTasks'),

    t('landing.footerModFinances'),

    t('landing.footerModVacations'),

  ];



  const footerRoles = [

    t('landing.footerRoleSuperAdmin'),

    t('landing.footerRoleOwner'),

    t('landing.footerRoleManager'),

    t('landing.footerRoleWorker'),

  ];



  const active = ROLE_KEYS[activeRole];



  return (

    <div ref={pageRef} className="bg-white text-ink-900">

      <PublicHeader overlay={!scrolled} />



      <section className="relative -mt-[73px] min-h-[100vh] overflow-hidden">

        <div className="fm-hero-mesh absolute inset-0" />

        <div

          className="fm-hero-bg absolute inset-0 opacity-40"

          style={{

            backgroundImage:

              'url(https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2000&q=80)',

            backgroundSize: 'cover',

            backgroundPosition: 'center',

          }}

        />

        <div className="absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-950/85 to-brand-900/40" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(39,163,90,0.25),transparent_45%)]" />



        <div className="relative mx-auto grid min-h-[100vh] max-w-6xl items-center gap-10 px-4 pb-16 pt-28 lg:grid-cols-2 lg:gap-8 lg:pb-20 lg:pt-24">

          <div>

            <div className="fm-animate-in inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-leaf-400 backdrop-blur">

              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-leaf-400" />

              {t('landing.heroBadge')}

            </div>

            <p className="fm-animate-in mt-6 font-display text-4xl font-bold text-white sm:text-5xl md:text-6xl">

              {t('common.appName')}

            </p>

            <h1 className="fm-animate-in-delay mt-4 max-w-xl text-3xl font-semibold leading-[1.15] text-white sm:text-4xl">

              {t('landing.heroHeadline')}

            </h1>

            <p className="fm-animate-in-delay-2 mt-5 max-w-lg text-base leading-relaxed text-white/75 sm:text-lg">

              {t('landing.heroSubtitle')}

            </p>

            <div className="fm-animate-in-delay-2 mt-8 flex flex-wrap gap-3">

              <Link to="/register" className="fm-btn fm-btn-primary px-6 text-base shadow-lg shadow-leaf-600/30">

                {t('landing.tryFree')}

              </Link>

              <Link to="/login" className="fm-btn border border-white/25 bg-white/10 text-white backdrop-blur hover:bg-white/20">

                {t('common.signIn')}

              </Link>

            </div>

            <div className="fm-animate-in-delay-3 mt-10 flex flex-wrap gap-6 text-sm text-white/60">

              <div>

                <div className="font-display text-2xl font-bold text-white">4</div>

                {t('landing.statRoles')}

              </div>

              <div>

                <div className="font-display text-2xl font-bold text-white">8+</div>

                {t('landing.statModules')}

              </div>

              <div>

                <div className="font-display text-2xl font-bold text-white">JWT</div>

                {t('landing.statSecured')}

              </div>

            </div>

          </div>

          <div className="fm-animate-in-delay-3 hidden sm:block">

            <HeroPreview />

          </div>

        </div>



        <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-white/40 lg:flex">

          <span className="text-[10px] font-semibold uppercase tracking-widest">

            {t('landing.scroll')}

          </span>

          <span className="h-8 w-px animate-pulse bg-white/40" />

        </div>

      </section>



      <section className="relative z-10 -mt-8 px-4">

        <div className="fm-reveal mx-auto grid max-w-6xl gap-4 rounded-3xl border border-brand-900/5 bg-white p-6 shadow-[0_20px_60px_rgba(12,31,23,0.1)] sm:grid-cols-3 sm:divide-x sm:divide-brand-900/8 sm:p-8">

          {trustItems.map(([stat, label]) => (

            <div key={stat} className="sm:px-6">

              <div className="font-display text-2xl font-bold text-brand-950">{stat}</div>

              <div className="mt-1 text-sm text-ink-500">{label}</div>

            </div>

          ))}

        </div>

      </section>



      <section id="features" className="bg-white py-24">

        <div className="mx-auto max-w-6xl px-4">

          <div className="fm-reveal max-w-2xl">

            <p className="text-sm font-semibold uppercase tracking-wider text-leaf-600">

              {t('landing.featuresBadge')}

            </p>

            <h2 className="mt-2 font-display text-3xl font-bold text-brand-950 sm:text-4xl">

              {t('landing.featuresTitle')}

            </h2>

            <p className="mt-3 text-ink-500">{t('landing.featuresSubtitle')}</p>

          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {FEATURE_KEYS.map((f, i) => (

              <article

                key={f.key}

                className="fm-reveal group rounded-3xl border border-brand-900/5 bg-mist-50 p-6 transition duration-300 hover:-translate-y-1 hover:border-leaf-500/30 hover:bg-white hover:shadow-[0_20px_50px_rgba(12,31,23,0.08)]"

                style={{ transitionDelay: `${i * 60}ms` }}

              >

                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-900 text-xs font-bold tracking-wide text-leaf-400 shadow-sm transition group-hover:scale-110">

                  {f.mark}

                </div>

                <h3 className="text-lg font-semibold text-brand-950">

                  {t(`landing.${f.key}.title`)}

                </h3>

                <p className="mt-2 text-sm leading-relaxed text-ink-500">

                  {t(`landing.${f.key}.text`)}

                </p>

              </article>

            ))}

          </div>

        </div>

      </section>



      <section id="modules" className="bg-mist-50 py-24">

        <div className="mx-auto max-w-6xl space-y-8 px-4">

          <div className="fm-reveal grid items-center gap-8 overflow-hidden rounded-[2rem] bg-brand-900 p-6 text-white md:grid-cols-2 md:p-10">

            <div>

              <p className="text-sm font-semibold uppercase tracking-wider text-leaf-400">

                {t('landing.operationsBadge')}

              </p>

              <h3 className="mt-2 font-display text-3xl font-bold">

                {t('landing.operationsTitle')}

              </h3>

              <ul className="mt-6 space-y-4">

                {operationsBullets.map((item) => (

                  <li key={item} className="flex gap-3 text-sm text-white/80">

                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-leaf-500 text-[10px] font-bold">✓</span>

                    {item}

                  </li>

                ))}

              </ul>

              <Link to="/register" className="fm-btn mt-8 bg-white text-brand-950 hover:bg-mist-100">

                {t('landing.exploreOperations')}

              </Link>

            </div>

            <div className="relative min-h-[260px] overflow-hidden rounded-3xl bg-gradient-to-br from-leaf-600/40 to-brand-950">

              <div className="absolute inset-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">

                <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-leaf-300">

                  {t('landing.taskPipeline')}

                </div>

                <div className="space-y-2">

                  {pipelineStatuses.map((s, i) => (

                    <div key={s} className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2">

                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">

                        <div className="h-full rounded-full bg-leaf-400" style={{ width: `${90 - i * 18}%` }} />

                      </div>

                      <span className="w-24 text-right text-[10px] font-bold">{s}</span>

                    </div>

                  ))}

                </div>

              </div>

            </div>

          </div>



          <div className="fm-reveal grid items-center gap-8 overflow-hidden rounded-[2rem] border border-brand-900/5 bg-white p-6 md:grid-cols-2 md:p-10">

            <div className="order-2 md:order-1 relative min-h-[260px] overflow-hidden rounded-3xl bg-gradient-to-br from-mist-100 to-leaf-600/10">

              <div className="absolute inset-4 space-y-3">

                {demoCards.map(([a, b]) => (

                  <div key={a} className="flex items-center justify-between rounded-2xl border border-brand-900/5 bg-white px-4 py-3 shadow-sm">

                    <span className="text-sm font-semibold text-brand-950">{a}</span>

                    <span className="rounded-full bg-leaf-600/10 px-2.5 py-1 text-[10px] font-bold text-leaf-600">

                      {b}

                    </span>

                  </div>

                ))}

              </div>

            </div>

            <div className="order-1 md:order-2">

              <p className="text-sm font-semibold uppercase tracking-wider text-leaf-600">

                {t('landing.payrollBadge')}

              </p>

              <h3 className="mt-2 font-display text-3xl font-bold text-brand-950">

                {t('landing.payrollTitle')}

              </h3>

              <ul className="mt-6 space-y-4">

                {payrollBullets.map((item) => (

                  <li key={item} className="flex gap-3 text-sm text-ink-500">

                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-leaf-600 text-[10px] font-bold text-white">✓</span>

                    {item}

                  </li>

                ))}

              </ul>

            </div>

          </div>

        </div>

      </section>



      <section id="roles" className="bg-brand-950 py-24 text-white">

        <div className="mx-auto max-w-6xl px-4">

          <div className="fm-reveal text-center">

            <h2 className="font-display text-3xl font-bold sm:text-4xl">{t('landing.rolesTitle')}</h2>

            <p className="mx-auto mt-3 max-w-xl text-white/60">{t('landing.rolesSubtitle')}</p>

          </div>

          <div className="fm-reveal mt-10 flex flex-wrap justify-center gap-2">

            {ROLE_KEYS.map((r, i) => (

              <button

                key={r.roleKey}

                type="button"

                onClick={() => setActiveRole(i)}

                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${

                  activeRole === i ? 'bg-white text-brand-950' : 'bg-white/10 text-white/70 hover:bg-white/15'

                }`}

              >

                {t(`roles.${r.roleKey}`)}

              </button>

            ))}

          </div>

          <div className="fm-reveal mx-auto mt-8 max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">

            <div className={`inline-flex rounded-full bg-gradient-to-r ${active.color} px-3 py-1 text-xs font-bold text-white`}>

              {t(`roles.${active.roleKey}`)}

            </div>

            <p className="mt-4 text-lg leading-relaxed text-white/85">{t(`landing.${active.textKey}`)}</p>

            <div className="mt-6 flex gap-2">

              {ROLE_KEYS.map((_, i) => (

                <span key={i} className={`h-1.5 flex-1 rounded-full transition ${activeRole === i ? 'bg-leaf-400' : 'bg-white/15'}`} />

              ))}

            </div>

          </div>

        </div>

      </section>



      <section className="relative overflow-hidden bg-mist-50 py-24">

        <div className="fm-reveal relative mx-auto max-w-3xl px-4 text-center">

          <h2 className="font-display text-3xl font-bold text-brand-950 sm:text-5xl">{t('landing.ctaTitle')}</h2>

          <p className="mt-4 text-ink-500">{t('landing.ctaSubtitle')}</p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">

            <Link to="/register" className="fm-btn fm-btn-primary px-8 text-base shadow-lg shadow-leaf-600/25">

              {t('landing.registerFarm')}

            </Link>

            <Link to="/login" className="fm-btn fm-btn-ghost text-base">{t('common.signIn')}</Link>

          </div>

        </div>

      </section>



      <footer className="relative overflow-hidden bg-brand-950 text-white">

        <div className="relative mx-auto max-w-6xl px-4 py-14">

          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

            <div className="lg:col-span-1">

              <Link to="/" className="inline-flex items-center gap-2.5">

                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-leaf-500 text-sm font-bold text-white">F</span>

                <span className="font-display text-xl font-bold">{t('common.appName')}</span>

              </Link>

              <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">{t('landing.footerDesc')}</p>

              <div className="mt-5 flex flex-wrap gap-2">

                <Link to="/register" className="rounded-full bg-leaf-500 px-4 py-2 text-xs font-semibold text-white hover:bg-leaf-400">

                  {t('nav.startFree')}

                </Link>

                <Link to="/login" className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/85 hover:bg-white/10">

                  {t('common.signIn')}

                </Link>

              </div>

            </div>

            <div>

              <h4 className="text-xs font-bold uppercase tracking-wider text-leaf-400">{t('landing.footerProduct')}</h4>

              <ul className="mt-4 space-y-2.5 text-sm text-white/65">

                <li><Link to="/features" className="hover:text-white">{t('nav.features')}</Link></li>

                <li><Link to="/modules" className="hover:text-white">{t('nav.modules')}</Link></li>

                <li><Link to="/roles" className="hover:text-white">{t('landing.footerRolesAccess')}</Link></li>

                <li><Link to="/register" className="hover:text-white">{t('landing.footerCreateFarm')}</Link></li>

              </ul>

            </div>

            <div>

              <h4 className="text-xs font-bold uppercase tracking-wider text-leaf-400">{t('nav.modules')}</h4>

              <ul className="mt-4 space-y-2.5 text-sm text-white/65">

                {footerModules.map((m) => (

                  <li key={m}>{m}</li>

                ))}

              </ul>

            </div>

            <div>

              <h4 className="text-xs font-bold uppercase tracking-wider text-leaf-400">{t('nav.roles')}</h4>

              <ul className="mt-4 space-y-2.5 text-sm text-white/65">

                {footerRoles.map((r) => (

                  <li key={r}>{r}</li>

                ))}

              </ul>

            </div>

          </div>

          <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-xs text-white/45">{t('landing.footerCopyright', { year: new Date().getFullYear() })}</p>

            <p className="text-xs text-white/45">{t('landing.footerStack')}</p>

          </div>

        </div>

      </footer>

    </div>

  );

}


