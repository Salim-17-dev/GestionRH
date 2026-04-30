import { AnimatePresence, motion } from "framer-motion";

const UnifiedFiltersPanel = ({ visible, fields = [], onReset, hasActiveFilters = false, title = "Filtres" }) => {
  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="unified-filters-panel"
          >
            <div className="unified-filters-header">
              <div className="unified-filters-title-wrap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a90a4" strokeWidth="2" aria-hidden="true">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                <span className="unified-filters-title">{title}</span>
              </div>

              {onReset && hasActiveFilters && (
                <button type="button" className="unified-filters-reset" onClick={onReset}>
                  Reinitialiser
                </button>
              )}
            </div>

            <div className="unified-filters-fields">
              {fields.map((field) => (
                <div key={field.key} className={`unified-filter-field ${field.type === "range" ? "range" : ""}`}>
                  <label className="unified-filter-label">{field.label}</label>

                  {field.type === "range" ? (
                    <div className="unified-filter-range">
                      <input
                        type={field.inputType || "number"}
                        value={field.min ?? ""}
                        onChange={(event) => field.onMinChange?.(event.target.value)}
                        placeholder={field.placeholderMin || "Min"}
                        className="unified-filter-input"
                      />
                      <span className="unified-filter-separator">-</span>
                      <input
                        type={field.inputType || "number"}
                        value={field.max ?? ""}
                        onChange={(event) => field.onMaxChange?.(event.target.value)}
                        placeholder={field.placeholderMax || "Max"}
                        className="unified-filter-input"
                      />
                    </div>
                  ) : field.type === "select" ? (
                    <select
                      value={field.value ?? ""}
                      onChange={(event) => field.onChange?.(event.target.value)}
                      className="unified-filter-input"
                    >
                      <option value="">{field.placeholder || `Tous les ${String(field.label || "").toLowerCase()}`}</option>
                      {(field.options || []).map((option) => {
                        const normalizedOption = typeof option === "object" ? option : { value: option, label: option };
                        return (
                          <option key={`${field.key}-${normalizedOption.value}`} value={normalizedOption.value}>
                            {normalizedOption.label}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <input
                      type={field.inputType || field.type || "text"}
                      value={field.value ?? ""}
                      onChange={(event) => field.onChange?.(event.target.value)}
                      placeholder={field.placeholder || ""}
                      className="unified-filter-input"
                    />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .unified-filters-panel {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin: 0 1% 18px;
          padding: 16px 20px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: #ffffff;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
        }

        .unified-filters-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .unified-filters-title-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .unified-filters-title {
          color: #2c3e50;
          font-size: 0.98rem;
          font-weight: 700;
        }

        .unified-filters-reset {
          border: none;
          background: transparent;
          color: #2c767c;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
        }

        .unified-filters-fields {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 12px 28px;
        }

        .unified-filter-field {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .unified-filter-label {
          font-size: 0.9rem;
          font-weight: 600;
          color: #2c3e50;
          margin: 0;
          white-space: nowrap;
        }

        .unified-filter-input {
          min-width: 110px;
          max-width: 180px;
          height: 30px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background-color: #fff;
          padding: 2px 8px;
          font-size: 0.9rem;
          color: #111827;
          transition: all 0.2s ease;
        }

        .unified-filter-input:focus {
          outline: none;
          border-color: #00afaa;
          box-shadow: 0 0 0 3px rgba(0, 175, 170, 0.12);
        }

        .unified-filter-range {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 4px;
        }

        .unified-filter-separator {
          color: #64748b;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .unified-filters-panel {
            padding: 14px;
          }

          .unified-filters-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .unified-filters-reset {
            align-self: flex-end;
          }

          .unified-filters-fields {
            justify-content: flex-start;
          }

          .unified-filter-field {
            width: 100%;
            justify-content: space-between;
          }

          .unified-filter-input {
            min-width: 140px;
            max-width: none;
            flex: 1;
          }
        }
      `}</style>
    </>
  );
};

export default UnifiedFiltersPanel;
