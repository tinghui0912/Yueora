import { create } from 'zustand';

/**
 * Transient practice runtime.
 *
 * Nothing here is ever written to storage. A report (and any unsaved media it
 * refers to) exists only while the user is looking at it; leaving the report
 * destroys it, which is why an old report URL shows the expired state.
 */
export const usePracticeRuntime = create((set) => ({
  report: null,
  setReport: (report) => set({ report }),
  markSaved: (performanceId) =>
    set((st) => (st.report ? { report: { ...st.report, savedPerformanceId: performanceId } } : st)),
  clearReport: () => set({ report: null }),
}));