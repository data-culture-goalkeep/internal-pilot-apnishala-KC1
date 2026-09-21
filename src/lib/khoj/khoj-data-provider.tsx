"use client";

import * as React from "react";

import { getKhojData } from "./khoj-data";
import type { KhojData, Role } from "./types";

type Ctx = {
  data: KhojData | null;
  error: string | null;
  refresh: () => Promise<void>;
  role: Role;
  setRole: (r: Role) => void;
  /** Selected grade code, or "All". */
  gradeCode: string;
  setGradeCode: (c: string) => void;
};

const KhojDataContext = React.createContext<Ctx | null>(null);

export function KhojDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = React.useState<KhojData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [role, setRole] = React.useState<Role>("teacher");
  const [gradeCode, setGradeCode] = React.useState<string>("All");
  const seq = React.useRef(0);

  const refresh = React.useCallback(async () => {
    const mySeq = ++seq.current;
    try {
      const fresh = await getKhojData();
      if (mySeq === seq.current) {
        setData(fresh);
        setError(null);
      }
    } catch {
      if (mySeq === seq.current) setError("Couldn't load dashboard data. Check your Supabase connection.");
    }
  }, []);

  // Written inline (rather than calling refresh()) with an ignore flag per
  // React's documented fetch-in-effect pattern — setState happens inside the
  // promise callback, not synchronously in the effect body.
  React.useEffect(() => {
    let ignore = false;
    getKhojData().then(
      (fresh) => {
        if (ignore) return;
        setData(fresh);
        setError(null);
      },
      () => {
        if (ignore) return;
        setError("Couldn't load dashboard data. Check your Supabase connection.");
      }
    );
    return () => {
      ignore = true;
    };
  }, []);

  const value = React.useMemo(
    () => ({ data, error, refresh, role, setRole, gradeCode, setGradeCode }),
    [data, error, refresh, role, gradeCode]
  );

  return <KhojDataContext.Provider value={value}>{children}</KhojDataContext.Provider>;
}

export function useKhojData() {
  const ctx = React.useContext(KhojDataContext);
  if (!ctx) throw new Error("useKhojData must be used within KhojDataProvider");
  return ctx;
}
