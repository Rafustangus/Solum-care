import { Logo } from '../../components/shared/Logo'

export function AuthLayout({ eyebrow, title, description, children, footer, topAction }) {
  return (
    <div className="phone-scroll flex-1 overflow-y-auto bg-cream lg:overflow-hidden">
      <div className="relative mx-auto flex min-h-full w-full max-w-[80rem] flex-col lg:h-full lg:min-h-0 lg:flex-row lg:gap-10 lg:p-8">
        <aside className="relative hidden overflow-hidden rounded-[2.4rem] bg-coffee p-10 text-cream lg:flex lg:w-[41%] lg:min-w-[22rem] lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-clay/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-olive/20 blur-3xl" />

          <div className="relative inline-flex w-fit rounded-[1.4rem] bg-cream/95 px-4 py-3">
            <Logo size="md" />
          </div>

          <div className="relative max-w-[22rem] py-12">
            <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.22em] text-olive">
              Cuidado que acompaña
            </p>
            <h2 className="mt-4 text-balance font-display text-[2.7rem] leading-[0.98] tracking-[-0.045em] text-cream">
              El estudio y el cliente, en la misma página.
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-cream/70">
              Planes de curación, evidencias diarias y avisos claros para que nada importante se
              pierda.
            </p>
          </div>

          <ul className="relative space-y-3 text-sm font-semibold text-cream/85">
            {['Plan de curación personalizado', 'Seguimiento con evidencias', 'Notas y avisos sin ruido'].map(
              (item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-olive" aria-hidden="true" />
                  {item}
                </li>
              )
            )}
          </ul>
        </aside>

        <div className="phone-scroll relative flex flex-1 flex-col justify-center px-5 pb-8 pt-4 lg:justify-start lg:overflow-y-auto lg:px-4 lg:py-10">
          <div className="pointer-events-none absolute -right-16 top-6 h-44 w-44 rounded-full bg-olive/18 blur-2xl lg:hidden" />
          <div className="pointer-events-none absolute -left-20 top-64 h-52 w-52 rounded-full bg-clay/10 blur-3xl lg:hidden" />

          <div className="relative mx-auto w-full lg:my-auto lg:max-w-[26rem]">
            {topAction ? <div className="mb-4">{topAction}</div> : null}
            <Logo size="lg" centered className="mb-7 lg:hidden" />

            <div className="mb-6 text-center lg:text-left">
              {eyebrow ? (
                <p className="mb-2 text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-clay">
                  {eyebrow}
                </p>
              ) : null}
              <h1 className="text-balance font-display text-[2.35rem] leading-[0.98] tracking-[-0.04em] text-coffee">
                {title}
              </h1>
              {description ? (
                <p className="mx-auto mt-3 max-w-[19rem] text-sm leading-relaxed text-coffee-soft lg:mx-0 lg:max-w-none">
                  {description}
                </p>
              ) : null}
            </div>

            {children}

            {footer ? <div className="mt-6">{footer}</div> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
