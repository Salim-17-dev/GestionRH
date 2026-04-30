import React, { createContext, useContext, useMemo, useRef, useState, useCallback } from "react";

const HeaderContext = createContext(null);

export function HeaderProvider({ children }) {
  const [title, setTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const onPrintRef = useRef(undefined);
  const onExportPDFRef = useRef(undefined);
  const onExportExcelRef = useRef(undefined);
  const [actionsAvailable, setActionsAvailable] = useState({
    print: false,
    exportPDF: false,
    exportExcel: false,
  });

  const updateActionAvailability = useCallback((key, hasAction) => {
    setActionsAvailable((prev) => {
      if (prev[key] === hasAction) return prev;
      return { ...prev, [key]: hasAction };
    });
  }, []);

  const setHeaderAction = useCallback(
    (ref, key, valueOrUpdater) => {
      const previousAction = ref.current;
      const nextAction =
        typeof valueOrUpdater === "function"
          ? valueOrUpdater(previousAction)
          : valueOrUpdater;

      if (previousAction === nextAction) return;

      ref.current = nextAction;
      updateActionAvailability(key, Boolean(nextAction));
    },
    [updateActionAvailability]
  );

  const setOnPrint = useCallback(
    (valueOrUpdater) => setHeaderAction(onPrintRef, "print", valueOrUpdater),
    [setHeaderAction]
  );

  const setOnExportPDF = useCallback(
    (valueOrUpdater) => setHeaderAction(onExportPDFRef, "exportPDF", valueOrUpdater),
    [setHeaderAction]
  );

  const setOnExportExcel = useCallback(
    (valueOrUpdater) => setHeaderAction(onExportExcelRef, "exportExcel", valueOrUpdater),
    [setHeaderAction]
  );

  const onPrint = useCallback((...args) => onPrintRef.current?.(...args), []);
  const onExportPDF = useCallback((...args) => onExportPDFRef.current?.(...args), []);
  const onExportExcel = useCallback((...args) => onExportExcelRef.current?.(...args), []);

  const clearActions = useCallback(() => {
    const hadActions = Boolean(onPrintRef.current || onExportPDFRef.current || onExportExcelRef.current);

    onPrintRef.current = undefined;
    onExportPDFRef.current = undefined;
    onExportExcelRef.current = undefined;

    if (hadActions) {
      setActionsAvailable({
        print: false,
        exportPDF: false,
        exportExcel: false,
      });
    }
  }, []);

  const value = useMemo(
    () => ({
      title,
      setTitle,
      searchQuery,
      setSearchQuery,
      onPrint: actionsAvailable.print ? onPrint : undefined,
      setOnPrint,
      onExportPDF: actionsAvailable.exportPDF ? onExportPDF : undefined,
      setOnExportPDF,
      onExportExcel: actionsAvailable.exportExcel ? onExportExcel : undefined,
      setOnExportExcel,
      clearActions,
    }),
    [
      title,
      searchQuery,
      actionsAvailable.print,
      actionsAvailable.exportPDF,
      actionsAvailable.exportExcel,
      onPrint,
      onExportPDF,
      onExportExcel,
      setOnPrint,
      setOnExportPDF,
      setOnExportExcel,
      clearActions,
    ]
  );

  return <HeaderContext.Provider value={value}>{children}</HeaderContext.Provider>;
}

export function useHeader() {
  const ctx = useContext(HeaderContext);
  if (!ctx) throw new Error("useHeader must be used within a HeaderProvider");
  return ctx;
} 
