import { StatusBar } from './StatusBar'

export function AppShell({ sidebar = null, children }) {
  return (
    <div className="organic-backdrop grain flex h-dvh min-h-dvh w-full overflow-hidden">
      {sidebar}

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <StatusBar className="md:hidden" />

        <div
          id="phone-root"
          className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-cream"
        >
          {children}
          <div className="pointer-events-none relative z-20 flex shrink-0 justify-center pb-1.5 pt-1 md:hidden">
            <span className="h-1.5 w-28 rounded-full bg-coffee/20" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  )
}
