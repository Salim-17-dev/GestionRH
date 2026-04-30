import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";
import { Button, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faFilter, faSliders } from "@fortawesome/free-solid-svg-icons";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import { AnimatePresence, motion } from "framer-motion";
import "jspdf-autotable";
import { useOpen } from "../../Acceuil/OpenProvider.jsx";
import ExpandRTable from "../Employe/ExpandRTable";
import { FaPlusCircle } from "react-icons/fa";
import { useHeader } from "../../Acceuil/HeaderContext";
import { openPrintableTable } from "./printTable";

const normalizeValue = (value) => {
  if (value === null || value === undefined) return "";
  return String(value)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

const normalizeFilterOptions = (filters = []) =>
  filters.map((filter) => ({
    ...filter,
    type: filter.type || "select",
    inputType: filter.inputType || (filter.type === "range" ? "number" : "text"),
    options: (filter.options || []).map((option) =>
      typeof option === "object"
        ? { value: option.value, label: option.label ?? option.value }
        : { value: option, label: option }
    ),
  }));

const buildInitialFilterState = (filters = []) =>
  filters.reduce((acc, filter) => {
    acc[filter.key] = filter.type === "range" ? { min: "", max: "" } : "";
    return acc;
  }, {});

const hasRangeValue = (value) => Boolean(value?.min || value?.max);

const matchesSelectFilter = (filter, item, selectedValue) => {
  if (!selectedValue) return true;
  if (typeof filter.match === "function") {
    return filter.match(item, selectedValue);
  }

  const rawValue = typeof filter.getValue === "function" ? filter.getValue(item) : item[filter.key];
  if (Array.isArray(rawValue)) {
    return rawValue.some((entry) => normalizeValue(entry) === normalizeValue(selectedValue));
  }

  return normalizeValue(rawValue) === normalizeValue(selectedValue);
};

const matchesRangeFilter = (filter, item, rangeValue) => {
  if (!hasRangeValue(rangeValue)) return true;

  const rawValue = typeof filter.getValue === "function" ? filter.getValue(item) : item[filter.key];
  const parseRangeValue =
    typeof filter.parseRangeValue === "function"
      ? filter.parseRangeValue
      : (value) => Number(value);
  const comparableValue = parseRangeValue(rawValue);
  if (Number.isNaN(comparableValue)) return false;

  const min = rangeValue.min === "" ? Number.NEGATIVE_INFINITY : parseRangeValue(rangeValue.min);
  const max = rangeValue.max === "" ? Number.POSITIVE_INFINITY : parseRangeValue(rangeValue.max);

  if (Number.isNaN(min) || Number.isNaN(max)) return false;

  return comparableValue >= min && comparableValue <= max;
};

const SocieteCrudPage = ({
  pageTitle,
  detailsTitle,
  addButtonLabel,
  countLabelSingular,
  countLabelPlural,
  FormComponent,
  formProps = {},
  columns = [],
  searchKeys = [],
  extraFilters = [],
  fetchItems,
  createItem,
  updateItem,
  deleteItem,
  exportName = "export",
  renderCustomActions,
  renderHeaderActions,
  filterStyleVariant = "default",
}) => {
  const { dynamicStyles } = useOpen();
  const { setTitle, setOnPrint, setOnExportPDF, setOnExportExcel, searchQuery, clearActions } = useHeader();
  const storageKey = `crud-cache-${exportName}`;
  const columnVisibilityStorageKey = `crud-column-visibility-${exportName}`;

  const getCachedItems = () => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn("Cache lecture impossible:", error);
      return [];
    }
  };

  const getInitialColumnVisibility = () => {
    const defaultVisibility = columns.reduce((acc, column) => {
      acc[column.key] = true;
      return acc;
    }, {});

    try {
      const raw = localStorage.getItem(columnVisibilityStorageKey);
      if (!raw) return defaultVisibility;

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        return defaultVisibility;
      }

      return columns.reduce((acc, column) => {
        acc[column.key] = parsed[column.key] ?? true;
        return acc;
      }, {});
    } catch (error) {
      console.warn("Visibilite des colonnes invalide:", error);
      return defaultVisibility;
    }
  };

  const normalizedExtraFilters = useMemo(() => normalizeFilterOptions(extraFilters), [extraFilters]);

  const [items, setItems] = useState(() => getCachedItems());
  const [filteredItems, setFilteredItems] = useState(() => getCachedItems());
  const [loading, setLoading] = useState(() => getCachedItems().length === 0);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [globalSearch, setGlobalSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [showFilters, setShowFilters] = useState(false);
  const [filterValues, setFilterValues] = useState(() => buildInitialFilterState(normalizeFilterOptions(extraFilters)));
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState(() => getInitialColumnVisibility());
  const columnsDropdownRef = useRef(null);

  useEffect(() => {
    setColumnVisibility((prev) => {
      const nextVisibility = getInitialColumnVisibility();
      const hasChanged =
        columns.length !== Object.keys(prev || {}).length ||
        columns.some((column) => prev?.[column.key] !== nextVisibility[column.key]);

      return hasChanged ? nextVisibility : prev;
    });
  }, [columns, columnVisibilityStorageKey]);

  useEffect(() => {
    localStorage.setItem(columnVisibilityStorageKey, JSON.stringify(columnVisibility));
  }, [columnVisibility, columnVisibilityStorageKey]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!columnsDropdownRef.current?.contains(event.target)) {
        setShowColumnsDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    setFilterValues((prev) =>
      normalizedExtraFilters.reduce((acc, filter) => {
        acc[filter.key] =
          prev[filter.key] ??
          (filter.type === "range"
            ? { min: "", max: "" }
            : "");
        return acc;
      }, {})
    );
  }, [normalizedExtraFilters]);

  const loadItems = async ({ showLoader = false } = {}) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      const list = await fetchItems();
      const safeList = Array.isArray(list) ? list : [];
      setItems(safeList);
      sessionStorage.setItem(storageKey, JSON.stringify(safeList));
    } catch (error) {
      console.error("Erreur chargement:", error);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Impossible de charger les donnees.",
      });
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const savedRowsPerPage = localStorage.getItem("rowsPerPageEmploye");
    if (savedRowsPerPage) {
      setRowsPerPage(parseInt(savedRowsPerPage, 10));
    }
    loadItems({ showLoader: items.length === 0 });
  }, []);

  useEffect(() => {
    setGlobalSearch(searchQuery || "");
  }, [searchQuery]);

  useEffect(() => {
    const keys = searchKeys.length > 0 ? searchKeys : columns.map((c) => c.key);
    let filtered = items.filter((item) =>
      keys.some((key) => {
        const value = item[key];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(globalSearch.toLowerCase());
      })
    );

    filtered = filtered.filter((item) =>
      normalizedExtraFilters.every((filter) => {
        const currentValue = filterValues[filter.key];
        return filter.type === "range"
          ? matchesRangeFilter(filter, item, currentValue)
          : matchesSelectFilter(filter, item, currentValue);
      })
    );

    setFilteredItems(filtered);
  }, [items, globalSearch, searchKeys, columns, normalizedExtraFilters, filterValues]);

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(filteredItems.length / rowsPerPage) - 1);
    if (page > maxPage) {
      setPage(0);
    }
  }, [filteredItems.length, rowsPerPage, page]);

  useEffect(() => {
    const visibleIds = filteredItems.map((item) => item.id);
    setSelectAll(visibleIds.length > 0 && visibleIds.every((id) => selectedItems.includes(id)));
  }, [filteredItems, selectedItems]);

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const selectedRows = parseInt(event.target.value, 10);
    setRowsPerPage(selectedRows);
    localStorage.setItem("rowsPerPageEmploye", selectedRows);
    setPage(0);
  };

  const handleCheckboxChange = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleSelectAllChange = () => {
    const visibleIds = filteredItems.map((item) => item.id);

    if (selectAll) {
      setSelectedItems(selectedItems.filter((id) => !visibleIds.includes(id)));
      return;
    }

    setSelectedItems([...new Set([...selectedItems, ...visibleIds])]);
  };

  const handleDeleteSelected = () => {
    Swal.fire({
      title: "Etes-vous sur de vouloir supprimer ?",
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Oui",
      denyButtonText: "Non",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        await Promise.all(selectedItems.map((id) => deleteItem(id)));
        await loadItems();
        setSelectedItems([]);
        Swal.fire({ icon: "success", title: "Succes!", text: "Elements supprimes avec succes." });
      } catch (error) {
        console.error(error);
        Swal.fire({ icon: "error", title: "Erreur!", text: "Echec de la suppression." });
      }
    });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Etes-vous sur de vouloir supprimer ?",
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Oui",
      denyButtonText: "Non",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        await deleteItem(id);
        await loadItems();
        Swal.fire({ icon: "success", title: "Succes!", text: "Element supprime avec succes." });
      } catch (error) {
        console.error(error);
        Swal.fire({ icon: "error", title: "Erreur!", text: "Echec de la suppression." });
      }
    });
  };

  const handleShowFormButtonClick = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingItem) {
        await updateItem(editingItem.id, formData);
      } else {
        await createItem(formData);
      }
      closeForm();
      await loadItems();
      Swal.fire({
        icon: "success",
        title: "Succes!",
        text: `${countLabelSingular} ${editingItem ? "modifie" : "ajoute"} avec succes.`,
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Echec de l'operation",
        text: "L'operation n'a pas pu etre completee.",
      });
      throw error;
    }
  };

  const handleFilterChange = (key, value) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleRangeFilterChange = (key, type, value) => {
    setFilterValues((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || { min: "", max: "" }),
        [type]: value,
      },
    }));
    setPage(0);
  };

  const handleResetFilters = () => {
    setFilterValues(buildInitialFilterState(normalizedExtraFilters));
    setPage(0);
  };

  const hasActiveFilters = useMemo(
    () =>
      normalizedExtraFilters.some((filter) => {
        const value = filterValues[filter.key];
        return filter.type === "range" ? hasRangeValue(value) : Boolean(value);
      }),
    [normalizedExtraFilters, filterValues]
  );

  const filteredCountLabel = filteredItems.length > 1 ? countLabelPlural : countLabelSingular;
  const displayColumns = useMemo(() => {
    const visibleColumns = columns.filter((column) => columnVisibility[column.key] !== false);
    return visibleColumns.length > 0 ? visibleColumns : columns;
  }, [columns, columnVisibility]);

  const exportToExcel = useCallback(() => {
    const exportItems = filteredItems.length > 0 ? filteredItems : items;
    const exportColumns = displayColumns.length > 0 ? displayColumns : columns;
    const sheetData = [
      [detailsTitle],
      [`Export du ${new Date().toLocaleDateString("fr-FR")} - ${exportItems.length} ${exportItems.length > 1 ? countLabelPlural : countLabelSingular}`],
      [],
      exportColumns.map((column) => column.label),
      ...exportItems.map((item) =>
        exportColumns.map((column) => {
          const value = item?.[column.key];
          if (Array.isArray(value)) return value.join(", ");
          return value ?? "";
        })
      ),
    ];

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    const lastColumnIndex = exportColumns.length - 1;
    const lastColumnLetter = XLSX.utils.encode_col(Math.max(lastColumnIndex, 0));

    ws["!merges"] = [
      XLSX.utils.decode_range(`A1:${lastColumnLetter}1`),
      XLSX.utils.decode_range(`A2:${lastColumnLetter}2`),
    ];

    ws["!cols"] = exportColumns.map((column) => ({
      wch: Math.max(String(column.label || "").length + 4, 18),
    }));

    ws["!autofilter"] = { ref: `A4:${lastColumnLetter}4` };
    ws["!rows"] = [
      { hpt: 30 },
      { hpt: 24 },
      { hpt: 10 },
      { hpt: 24 },
      ...exportItems.map(() => ({ hpt: 20 })),
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, countLabelPlural || countLabelSingular);
    XLSX.writeFile(wb, `${exportName}.xlsx`);
  }, [filteredItems, items, displayColumns, columns, detailsTitle, countLabelPlural, countLabelSingular, exportName]);

  const exportToPDF = useCallback(() => {
    const doc = new jsPDF();
    const tableColumn = displayColumns.map((c) => c.label);
    const tableRows = filteredItems.map((item) => displayColumns.map((c) => item[c.key] ?? ""));
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    doc.save(`${exportName}.pdf`);
  }, [displayColumns, filteredItems, exportName]);

  const handlePrint = useCallback(() => {
    openPrintableTable({
      title: detailsTitle,
      columns: displayColumns.map((column) => column.label),
      rows: filteredItems.map((item) =>
        displayColumns.map((column) => {
          const value = item?.[column.key];
          if (Array.isArray(value)) return value.join(", ");
          return value ?? "";
        })
      ),
    });
  }, [detailsTitle, displayColumns, filteredItems]);

  const handleColumnsChange = (columnKey) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  useEffect(() => {
    setTitle(pageTitle);

    return () => {
      clearActions();
      setTitle("");
    };
  }, [pageTitle, setTitle, clearActions]);

  useEffect(() => {
    setOnPrint(() => handlePrint);
    setOnExportPDF(() => exportToPDF);
    setOnExportExcel(() => exportToExcel);
  }, [setOnPrint, setOnExportPDF, setOnExportExcel, handlePrint, exportToPDF, exportToExcel]);

  const iconButtonStyle = {
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    backgroundColor: "#ffffff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(15, 23, 42, 0.08)",
    transition: "all 0.2s ease",
  };

  const CustomColumnsMenu = () => (
    <div
      style={{
        padding: "12px",
        backgroundColor: "white",
        border: "1px solid #d1d5db",
        borderRadius: "12px",
        minWidth: "230px",
        maxHeight: "360px",
        overflowY: "auto",
        boxShadow: "0 18px 40px rgba(15, 23, 42, 0.12)",
        position: "absolute",
        top: "calc(100% + 8px)",
        right: 0,
        zIndex: 1200,
      }}
    >
      <div
        style={{
          fontSize: "0.88rem",
          fontWeight: 700,
          color: "#374151",
          marginBottom: "10px",
        }}
      >
        Masquer les champs
      </div>
      <Form onClick={(event) => event.stopPropagation()}>
        {columns.map((column) => (
          <Form.Check
            key={column.key}
            type="checkbox"
            id={`${exportName}-column-${column.key}`}
            label={column.label}
            checked={columnVisibility[column.key] !== false}
            onChange={() => handleColumnsChange(column.key)}
            style={{ marginBottom: "0.45rem", color: "#4b5563" }}
          />
        ))}
      </Form>
    </div>
  );

  return (
    <>
      <ThemeProvider theme={createTheme()}>
        <Box className="postionPage" sx={{ ...dynamicStyles }}>
          <Box component="main" sx={{ flexGrow: 1, p: 0, mt: 12 }}>
            <div
              style={{
                display: "flex",
                flex: 1,
                position: "relative",
                margin: 0,
                padding: 0,
                height: "calc(100vh - 80px)",
              }}
            >
              {showForm && (
                <div
                  style={{
                    position: "fixed",
                    right: "0",
                    zIndex: 1000,
                    overflowY: "auto",
                    top: "-8.2%",
                    width: "20%",
                    height: "84%",
                    marginTop: "8.7%",
                    marginRight: "1%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    borderRadius: "8px",
                    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                    backgroundColor: "#fff",
                  }}
                >
                  <FormComponent onSubmit={handleSubmit} onCancel={closeForm} initialData={editingItem} {...formProps} />
                </div>
              )}

              <div className="container3" style={{ width: showForm ? "74.5%" : "99%" }}>
                <div className="mt-4">
                  <div className="section-header mb-3">
                    <div className="d-flex justify-content-between align-items-center" style={{ gap: 24 }}>
                      <div>
                        <span className="section-title mb-1">
                          <i className="fas fa-calendar-times me-2"></i>
                          {detailsTitle}
                        </span>
                        <p className="section-description text-muted mb-0">
                          {filteredItems.length} {filteredCountLabel} actuellement affichee{filteredItems.length > 1 ? "s" : ""}
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {renderHeaderActions ? renderHeaderActions() : null}
                        {normalizedExtraFilters.length > 0 && (
                          <FontAwesomeIcon
                            onClick={() => setShowFilters((prev) => !prev)}
                            icon={showFilters ? faClose : faFilter}
                            style={{
                              cursor: "pointer",
                              fontSize: "1.9rem",
                              color: "#2c767c",
                              marginTop: "1.3%",
                              marginRight: "8px",
                              transition: "all 0.2s ease",
                            }}
                          />
                        )}
                        <Button onClick={handleShowFormButtonClick} className="btn btn-outline-primary d-flex align-items-center" size="sm" style={{ height: "45px" }}>
                          <FaPlusCircle className="me-2" />
                          {addButtonLabel}
                        </Button>
                        <div ref={columnsDropdownRef} style={{ position: "relative" }}>
                          <button
                            type="button"
                            id={`dropdown-columns-${exportName}`}
                            title="Masquer les champs"
                            style={iconButtonStyle}
                            onClick={() => setShowColumnsDropdown((prev) => !prev)}
                          >
                            <FontAwesomeIcon icon={faSliders} style={{ width: 18, height: 18, color: "#4b5563" }} />
                          </button>
                          {showColumnsDropdown && <CustomColumnsMenu />}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {showFilters && normalizedExtraFilters.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className={`filters-container ${filterStyleVariant === "equipements" ? "filters-container-equipements" : ""}`}
                    >
                      <div className={`filters-heading ${filterStyleVariant === "equipements" ? "filters-heading-equipements" : ""}`}>
                        <div className={`filters-heading-main ${filterStyleVariant === "equipements" ? "filters-icon-section" : ""}`}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a90a4" strokeWidth="2">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                          </svg>
                          <span className="filters-title">Filtres</span>
                        </div>
                        {hasActiveFilters && (
                          <button type="button" className="filters-reset" onClick={handleResetFilters}>
                            Reinitialiser
                          </button>
                        )}
                      </div>

                      <div className={`filters-grid ${filterStyleVariant === "equipements" ? "filters-grid-equipements" : ""}`}>
                        {normalizedExtraFilters.map((filter) => (
                          <div key={filter.key} className={`filter-field ${filterStyleVariant === "equipements" ? "filter-field-equipements" : ""}`}>
                            <label className="filter-label">{filter.label}</label>

                            {filter.type === "range" ? (
                              <div className="filter-range-group">
                                <input
                                  type={filter.inputType || "number"}
                                  value={filterValues[filter.key]?.min || ""}
                                  onChange={(event) => handleRangeFilterChange(filter.key, "min", event.target.value)}
                                  placeholder={filter.placeholderMin || "Min"}
                                  className={`filter-input ${filter.type === "range" ? "filter-range-input" : ""}`}
                                />
                                <span className="filter-range-separator">-</span>
                                <input
                                  type={filter.inputType || "number"}
                                  value={filterValues[filter.key]?.max || ""}
                                  onChange={(event) => handleRangeFilterChange(filter.key, "max", event.target.value)}
                                  placeholder={filter.placeholderMax || "Max"}
                                  className={`filter-input ${filter.type === "range" ? "filter-range-input" : ""}`}
                                />
                              </div>
                            ) : (
                              <select
                                value={filterValues[filter.key] || ""}
                                onChange={(event) => handleFilterChange(filter.key, event.target.value)}
                                className="filter-input"
                              >
                                <option value="">{filter.placeholder || `Tous les ${filter.label.toLowerCase()}`}</option>
                                {filter.options.map((option) => (
                                  <option key={`${filter.key}-${option.value}`} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {loading ? (
                  <div
                    style={{
                      minHeight: "260px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid #e5e7eb",
                      borderRadius: "10px",
                      backgroundColor: "#fff",
                      color: "#64748b",
                      fontSize: "0.98rem",
                      fontWeight: 500,
                    }}
                  >
                    Chargement des donnees...
                  </div>
                ) : (
                  <ExpandRTable
                    columns={displayColumns}
                    data={items}
                    filteredData={filteredItems}
                    searchTerm={globalSearch}
                    selectAll={selectAll}
                    selectedItems={selectedItems}
                    handleSelectAllChange={handleSelectAllChange}
                    handleCheckboxChange={handleCheckboxChange}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    handleDeleteSelected={handleDeleteSelected}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    handleChangePage={handleChangePage}
                    handleChangeRowsPerPage={handleChangeRowsPerPage}
                    renderCustomActions={renderCustomActions ? (item) => renderCustomActions(item, loadItems) : undefined}
                  />
                )}
              </div>
            </div>
          </Box>
        </Box>
      </ThemeProvider>
      <style jsx>{`
        .section-header {
          border-bottom: none;
          padding-bottom: 15px;
          margin: 0.5% 1% 1%;
        }
        .section-title {
          color: #2c3e50;
          font-weight: 600;
          margin-bottom: 5px;
          display: flex;
          align-items: center;
          font-size: 19px;
        }
        .section-title i {
          color: rgba(8, 179, 173, 0.02);
          background: #3a8a90;
          padding: 6px;
          border-radius: 60%;
          margin-right: 10px;
        }
        .section-description {
          color: #6c757d;
          font-size: 16px;
          margin-bottom: 0;
        }
        .btn-primary {
          background-color: #3a8a90;
          border-color: #3a8a90;
          color: white;
          border-radius: 0.375rem;
          font-weight: 500;
          padding: 0.5rem 1rem;
          transition: background-color 0.15s ease-in-out;
        }
        .category-manager-trigger {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 42px;
          border: 1px solid #d7e3e5;
          border-radius: 999px;
          background: #f7fbfb;
          color: #2c767c;
          font-size: 0.92rem;
          font-weight: 600;
          padding: 8px 14px;
          transition: all 0.2s ease;
        }
        .category-manager-trigger:hover {
          background: #edf8f8;
          border-color: #b9d4d7;
          color: #255f64;
        }
        .filters-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin: 0 1% 18px;
          padding: 16px 20px;
          min-height: 0;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: #ffffff;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
        }
        .filters-container-equipements {
          justify-content: center;
          align-items: center;
          margin: 0 1% 30px;
          padding: 20px 24px;
          background: rgba(8, 179, 173, 0.03);
          border: none;
          box-shadow: 0 6px 20px rgba(8, 179, 173, 0.15);
          position: relative;
        }
        .filters-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 4px;
        }
        .filters-heading-equipements {
          width: 100%;
          justify-content: flex-end;
          margin-bottom: 0;
        }
        .filters-heading-main {
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: flex-start;
        }
        .filters-icon-section {
          margin-left: 8px;
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          margin-right: 24px;
        }
        .filters-heading-main svg {
          margin-right: 8px;
          stroke: #3a8a90;
        }
        .filters-title {
          color: #2c3e50;
          font-size: 0.98rem;
          font-weight: 700;
        }
        .filters-reset {
          border: none;
          background: transparent;
          color: #2c767c;
          font-size: 0.88rem;
          font-weight: 600;
        }
        .filters-grid {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: nowrap;
          justify-content: flex-start;
          overflow-x: auto;
          overflow-y: hidden;
          width: 100%;
          padding-bottom: 4px;
          scrollbar-width: thin;
        }
        .filters-grid-equipements {
          justify-content: flex-start;
          margin-left: 10.2%;
          width: calc(100% - 10.2%);
        }
        .filter-field {
          display: flex;
          align-items: center;
          margin: 0;
          gap: 10px;
          flex: 0 0 auto;
        }
        .filter-field-equipements {
          gap: 10px;
        }
        .filter-label {
          font-size: 0.9rem;
          font-weight: 600;
          color: #2c3e50;
          margin: 0;
          white-space: nowrap;
        }
        .filter-field-equipements .filter-label {
          margin-right: 0;
          min-width: max-content;
        }
        .filter-input {
          min-width: 110px;
          max-width: 150px;
          height: 30px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background-color: #fff;
          padding: 2px 6px;
          font-size: 0.9rem;
          color: #111827;
          transition: all 0.2s ease;
        }
        .filters-container-equipements .filter-input {
          border: 2px solid #e1e8ed;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          cursor: pointer;
        }
        .filter-input:focus {
          outline: none;
          border-color: #00afaa;
          box-shadow: 0 0 0 3px rgba(0, 175, 170, 0.12);
        }
        .filters-container-equipements .filter-input:hover:not(:focus) {
          border-color: #92d4d1;
        }
        .filter-range-group {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 4px;
        }
        .filters-container-equipements .filter-range-group {
          display: flex;
        }
        .filter-range-input {
          min-width: 80px;
          flex: 1;
        }
        .filters-container-equipements .filter-range-input[type="date"] {
          min-width: 120px;
          max-width: 140px;
          padding: 2px 4px;
        }
        .filters-container-equipements .filter-range-input:not([type="date"]) {
          min-width: 50px;
          max-width: 70px;
          padding: 2px 4px;
        }
        .filter-range-separator {
          color: #64748b;
          font-weight: 600;
        }
        .filters-container-equipements .filter-range-separator {
          margin: 0 2px;
          font-size: 0.9rem;
          color: #666;
          padding: 0;
        }
        .filters-container-equipements .filters-reset {
          position: relative;
          z-index: 1;
        }
        @media (max-width: 768px) {
          .filters-container {
            padding: 14px;
          }
          .filters-container-equipements {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }
          .filters-heading {
            flex-direction: column;
            align-items: flex-start;
          }
          .filters-heading-equipements {
            justify-content: flex-start;
          }
          .filters-icon-section {
            position: static;
            transform: none;
            margin-left: 0;
            margin-right: 0;
          }
          .filters-reset {
            align-self: flex-end;
          }
          .filters-grid {
            justify-content: flex-start;
            gap: 12px;
            flex-wrap: nowrap;
            overflow-x: auto;
          }
          .filters-grid-equipements {
            width: 100%;
            margin-left: 0 !important;
          }
          .filter-field {
            width: auto;
            margin-right: 0;
            justify-content: flex-start;
            flex: 0 0 auto;
          }
          .filter-field-equipements {
            justify-content: flex-start;
            gap: 10px;
          }
          .filter-field-equipements .filter-label {
            margin-right: 0;
          }
          .filter-input {
            min-width: 140px;
            max-width: none;
          }
        }
      `}</style>
    </>
  );
};

export default SocieteCrudPage;
