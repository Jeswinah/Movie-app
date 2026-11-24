import React from "react";

const Loading = () => {
  return (
    <main
      role="status"
      aria-live="polite"
      className="relative grid min-h-screen w-full place-items-center overflow-hidden bg-slate-50 text-slate-900 dark:bg-[#08090c] dark:text-white"
    >
      <div className="relative flex w-[min(90vw,25rem)] flex-col items-center rounded-3xl border border-slate-200/80 bg-white/75 px-8 py-10 text-center shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-[#11151b]/75 dark:shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="relative grid h-20 w-20 place-items-center">
          <span
            aria-hidden="true"
            className="absolute inset-0 animate-spin rounded-2xl border-2 border-red-500/20 border-t-red-500 [animation-duration:1.6s] dark:border-red-400/20 dark:border-t-red-400"
          />
          <span className="display-title grid h-14 w-14 place-items-center rounded-xl bg-slate-900 text-4xl text-white shadow-lg dark:bg-white dark:text-[#0b0c0e]">
            M
          </span>
        </div>

        <h1 className="display-title mt-6 text-4xl tracking-wider">Loading</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-white/60">
          Finding something great to watch...
        </p>

        <div aria-hidden="true" className="mt-7 flex items-center gap-2">
          <span className="h-1.5 w-8 animate-pulse rounded-full bg-red-600" />
          <span className="h-1.5 w-5 animate-pulse rounded-full bg-red-500/60 [animation-delay:150ms]" />
          <span className="h-1.5 w-3 animate-pulse rounded-full bg-red-500/30 [animation-delay:300ms]" />
        </div>
      </div>

      <span className="absolute bottom-6 text-xs font-semibold tracking-[0.3em] text-slate-400 dark:text-white/25">
        MOVIEDB
      </span>
    </main>
  );
};

export default Loading;
