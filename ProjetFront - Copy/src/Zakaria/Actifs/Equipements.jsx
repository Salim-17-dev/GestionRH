import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Button, Form } from "react-bootstrap";
import { ThemeProvider, createTheme, Box } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faFilter, faGear, faSliders } from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import { IoFolderOpenOutline } from "react-icons/io5";
import { FaPlusCircle, FaRegCircle } from "react-icons/fa";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import EquipementForm from "./EquipementForm";
import { buildUniqueCategoryList, fetchEquipementCategories, mapCategoryOptions } from "./equipementCategories";
import ExpandRTable from "../Employe/ExpandRTable";
import { renderBadge } from "../Standardized/badges";
import { openPrintableTable } from "../Standardized/printTable";
import { useOpen } from "../../Acceuil/OpenProvider";
import { useHeader } from "../../Acceuil/HeaderContext";
import "../GroupsManager.css";

const API = "http://127.0.0.1:8000/api/equipements";
const STORAGE_BASE_URL = "http://127.0.0.1:8000";
const ETAT_OPTIONS = ["Bon", "Neuf", "Endommage", "Usage"];
const STATUT_OPTIONS = ["Disponible", "Affecte"];
const PHOTO_PLACEHOLDER_SRC = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
    <circle cx="25" cy="25" r="24" fill="#f0f4f8" stroke="#d1d5db" />
    <text x="25" y="28" text-anchor="middle" font-size="10" fill="#64748b" font-family="Arial, sans-serif">
      Photo
    </text>
  </svg>
`)}`;

const normalizeValue = (value) => String(value ?? "").trim().toLowerCase();

const buildCategoryOptions = (items, managedCategories = []) =>
  mapCategoryOptions(managedCategories, items.map((item) => item?.categorie));

const resolvePhotoUrl = (item) => {
  const rawValue = item?.photo_url || item?.photo;
  if (!rawValue) return "";

  const value = String(rawValue).trim();
  if (!value || value === "null" || value === "undefined") return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("data:image/")) return value;
  if (value.startsWith("/storage/")) return `${STORAGE_BASE_URL}${value}`;
  if (value.startsWith("storage/")) return `${STORAGE_BASE_URL}/${value}`;

  const cleanedPath = value.replace(/^\/+/, "").replace(/^storage\//, "");
  return `${STORAGE_BASE_URL}/storage/${cleanedPath}`;
};

const renderPhotoCell = (item) => (
  <img
    src={resolvePhotoUrl(item) || PHOTO_PLACEHOLDER_SRC}
    alt={item.designation || "Photo equipement"}
    width="50"
    height="50"
    style={{
      objectFit: "cover",
      borderRadius: "50%",
      border: "2px solid #eee",
      transition: "transform 0.3s ease",
      backgroundColor: "#f8fafc",
    }}
    onError={(event) => {
      event.currentTarget.onerror = null;
      event.currentTarget.src = PHOTO_PLACEHOLDER_SRC;
    }}
    onMouseEnter={(event) => {
      event.currentTarget.style.transform = "scale(1.2)";
    }}
    onMouseLeave={(event) => {
      event.currentTarget.style.transform = "scale(1)";
    }}
  />
);

const Equipements = () => {
  const { dynamicStyles } = useOpen();
  const { setTitle, setOnPrint, setOnExportPDF, setOnExportExcel, searchQuery, clearActions } = useHeader();
  const columnVisibilityStorageKey = "catalogue-equipements-column-visibility";

  const [equipements, setEquipements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEquipement, setEditingEquipement] = useState(null);
  const [categoryModalTrigger, setCategoryModalTrigger] = useState(0);
  const [categoriesRefreshKey, setCategoriesRefreshKey] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [managedCategoryNames, setManagedCategoryNames] = useState([]);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  const columnsDropdownRef = useRef(null);
  const [filterOptions, setFilterOptions] = useState({
    filters: [
      {
        key: "date_expiration",
        label: "Date d'expiration",
        type: "range",
        inputType: "date",
        minValue: "",
        maxValue: "",
        minPlaceholder: "Du",
        maxPlaceholder: "Au",
      },
      {
        key: "valeur",
        label: "Valeur",
        type: "range",
        inputType: "number",
        minValue: "",
        maxValue: "",
        minPlaceholder: "Min",
        maxPlaceholder: "Max",
      },
      {
        key: "etat",
        label: "Etat",
        value: "",
        placeholder: "Selectionner un etat",
        options: ETAT_OPTIONS.map((value) => ({ value, label: value })),
      },
      {
        key: "statut",
        label: "Statut",
        value: "",
        placeholder: "Selectionner un statut",
        options: STATUT_OPTIONS.map((value) => ({ value, label: value })),
      },
    ],
  });

  const columns = useMemo(
    () => [
      { key: "photo", label: "Photo", render: renderPhotoCell },
      { key: "designation", label: "Designation" },
      { key: "categorie", label: "Categorie" },
      { key: "numero_serie", label: "Numero Serie" },
      { key: "date_expiration", label: "Date d'expiration" },
      { key: "etat", label: "Etat", render: (item) => renderBadge(item.etat) },
      { key: "statut", label: "Statut", render: (item) => renderBadge(item.statut) },
      { key: "valeur", label: "Valeur" },
    ],
    []
  );

  const getInitialColumnVisibility = () => {
    const defaultVisibility = columns.reduce((acc, column) => {
      acc[column.key] = true;
      return acc;
    }, {});

    try {
      const raw = localStorage.getItem(columnVisibilityStorageKey);
      if (!raw) return defaultVisibility;
      const parsed = JSON.parse(raw);

      return columns.reduce((acc, column) => {
        acc[column.key] = parsed?.[column.key] ?? true;
        return acc;
      }, {});
    } catch (error) {
      return defaultVisibility;
    }
  };

  const [columnVisibility, setColumnVisibility] = useState(() => getInitialColumnVisibility());

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

  const displayColumns = useMemo(() => {
    const visibleColumns = columns.filter((column) => columnVisibility[column.key] !== false);
    return visibleColumns.length > 0 ? visibleColumns : columns;
  }, [columns, columnVisibility]);

  const visibleColumnCount = useMemo(
    () => columns.filter((column) => columnVisibility[column.key] !== false).length,
    [columns, columnVisibility]
  );

  const handleColumnsChange = (columnKey) => {
    if (columnVisibility[columnKey] !== false && visibleColumnCount === 1) {
      return;
    }

    setColumnVisibility((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

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
      <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#374151", marginBottom: "10px" }}>
        Masquer les champs
      </div>
      <Form onClick={(event) => event.stopPropagation()}>
        {columns.map((column) => (
          <Form.Check
            key={column.key}
            type="checkbox"
            id={`equipements-column-${column.key}`}
            label={column.label}
            checked={columnVisibility[column.key] !== false}
            onChange={() => handleColumnsChange(column.key)}
            disabled={columnVisibility[column.key] !== false && visibleColumnCount === 1}
            style={{ marginBottom: "0.45rem", color: "#4b5563" }}
          />
        ))}
      </Form>
    </div>
  );

  const syncOptions = (items, categories = managedCategoryNames) => {
    const nextCategoryNames = buildUniqueCategoryList(categories);
    setManagedCategoryNames(nextCategoryNames);
    setCategoryOptions(buildCategoryOptions(items, nextCategoryNames));
  };

  const refreshCategoryOptions = async (categories = null) => {
    let nextCategoryNames = Array.isArray(categories) ? categories : null;

    if (!nextCategoryNames) {
      try {
        const fetchedCategories = await fetchEquipementCategories();
        nextCategoryNames = fetchedCategories.map((category) => category.nom);
      } catch (error) {
        nextCategoryNames = [];
      }
    }

    syncOptions(equipements, nextCategoryNames);
    setCategoriesRefreshKey((prev) => prev + 1);
  };

  const loadEquipements = async () => {
    try {
      setLoading(true);
      const [response, fetchedCategories] = await Promise.all([
        axios.get(API),
        fetchEquipementCategories().catch(() => []),
      ]);
      const data = Array.isArray(response.data)
        ? response.data.map((item) => ({ ...item, photo_url: resolvePhotoUrl(item) }))
        : [];
      setEquipements(data);
      syncOptions(
        data,
        fetchedCategories.map((category) => category.nom)
      );
    } catch (error) {
      console.error("Error fetching equipements:", error);
      setEquipements([]);
      syncOptions([], []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedRowsPerPage = localStorage.getItem("rowsPerPageEmploye");
    if (savedRowsPerPage) {
      setRowsPerPage(parseInt(savedRowsPerPage, 10));
    }
    loadEquipements();
  }, []);

  useEffect(() => {
    setGlobalSearch(searchQuery || "");
  }, [searchQuery]);

  useEffect(() => {
    syncOptions(equipements);
  }, [equipements]);

  const handleFilterChange = (key, value) => {
    setFilterOptions((prev) => ({
      ...prev,
      filters: prev.filters.map((filter) => (filter.key === key ? { ...filter, value } : filter)),
    }));
    setPage(0);
  };

  const handleRangeFilterChange = (key, rangeKey, value) => {
    setFilterOptions((prev) => ({
      ...prev,
      filters: prev.filters.map((filter) => (filter.key === key ? { ...filter, [rangeKey]: value } : filter)),
    }));
    setPage(0);
  };

  const filteredEquipements = useMemo(
    () =>
      equipements.filter((item) => {
        const matchesCategory = !selectedCategory || normalizeValue(item.categorie) === normalizeValue(selectedCategory);
        const matchesSearch = globalSearch
          .toLowerCase()
          .split(/\s+/)
          .every((term) =>
            Object.values(item).some((value) => value !== null && normalizeValue(value).includes(normalizeValue(term)))
          );
        const matchesOptionFilters = filterOptions.filters.every((filter) => {
          if (filter.type === "range") {
            const rawValue = item?.[filter.key];

            if (!filter.minValue && !filter.maxValue) return true;
            if (rawValue === null || rawValue === undefined || rawValue === "") return false;

            if (filter.inputType === "date") {
              const itemValue = new Date(rawValue).getTime();
              if (Number.isNaN(itemValue)) return false;

              const minValue = filter.minValue ? new Date(filter.minValue).getTime() : null;
              const maxValue = filter.maxValue ? new Date(filter.maxValue).getTime() : null;

              if (minValue !== null && itemValue < minValue) return false;
              if (maxValue !== null && itemValue > maxValue) return false;
              return true;
            }

            const itemValue = Number(rawValue);
            const minValue = filter.minValue !== "" ? Number(filter.minValue) : null;
            const maxValue = filter.maxValue !== "" ? Number(filter.maxValue) : null;

            if (Number.isNaN(itemValue)) return false;
            if (minValue !== null && !Number.isNaN(minValue) && itemValue < minValue) return false;
            if (maxValue !== null && !Number.isNaN(maxValue) && itemValue > maxValue) return false;
            return true;
          }

          if (!filter.value) return true;
          return normalizeValue(item[filter.key]) === normalizeValue(filter.value);
        });

        return matchesCategory && matchesSearch && matchesOptionFilters;
      }),
    [equipements, selectedCategory, globalSearch, filterOptions]
  );

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(filteredEquipements.length / rowsPerPage) - 1);
    if (page > maxPage) {
      setPage(0);
    }
  }, [filteredEquipements.length, rowsPerPage, page]);

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const nextRows = parseInt(event.target.value, 10);
    setRowsPerPage(nextRows);
    localStorage.setItem("rowsPerPageEmploye", nextRows);
    setPage(0);
  };

  const handleSelectAllChange = (event) => {
    const isChecked = event.target.checked;
    setSelectAll(isChecked);
    if (isChecked) {
      setSelectedItems(filteredEquipements.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleCheckboxChange = (itemId) => {
    setSelectedItems((prev) => {
      const nextSelected = prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId];
      setSelectAll(nextSelected.length === filteredEquipements.length && filteredEquipements.length > 0);
      return nextSelected;
    });
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingEquipement) {
        if (formData instanceof FormData) {
          formData.append("_method", "PUT");
          await axios.post(`${API}/${editingEquipement.id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } else {
          await axios.put(`${API}/${editingEquipement.id}`, formData);
        }
      } else {
        await axios.post(
          API,
          formData,
          formData instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined
        );
      }

      setShowForm(false);
      setEditingEquipement(null);
      await loadEquipements();

      Swal.fire({
        icon: "success",
        title: "Succes!",
        text: `Equipement ${editingEquipement ? "modifie" : "ajoute"} avec succes.`,
      });
    } catch (error) {
      console.error("Error saving equipement:", error);
      Swal.fire({
        icon: "error",
        title: "Erreur!",
        text: "Une erreur est survenue lors de l'enregistrement de l'equipement.",
      });
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Etes-vous sur de vouloir supprimer cet equipement?",
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Oui",
      denyButtonText: "Non",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        await axios.delete(`${API}/${id}`);
        setEquipements((prev) => prev.filter((item) => item.id !== id));
        Swal.fire({ icon: "success", title: "Succes!", text: "Equipement supprime avec succes." });
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        Swal.fire({ icon: "error", title: "Erreur!", text: "Echec de la suppression de l'equipement." });
      }
    });
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return;

    Swal.fire({
      title: `Etes-vous sur de vouloir supprimer ${selectedItems.length} equipement(s)?`,
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Oui",
      denyButtonText: "Non",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        await Promise.all(selectedItems.map((id) => axios.delete(`${API}/${id}`)));
        setEquipements((prev) => prev.filter((item) => !selectedItems.includes(item.id)));
        setSelectedItems([]);
        setSelectAll(false);
        Swal.fire({ icon: "success", title: "Succes!", text: "Equipements supprimes avec succes." });
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        Swal.fire({ icon: "error", title: "Erreur!", text: "Erreur lors de la suppression des equipements selectionnes." });
      }
    });
  };

  const exportToPDF = useCallback(() => {
    const doc = new jsPDF();
    const tableColumn = ["Designation", "Categorie", "Numero Serie", "Date d'expiration", "Etat", "Statut", "Valeur"];
    const tableRows = filteredEquipements.map((item) => [
      item.designation,
      item.categorie,
      item.numero_serie,
      item.date_expiration,
      item.etat,
      item.statut,
      item.valeur,
    ]);

    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 20 });
    doc.text("Liste des equipements", 14, 15);
    doc.save("equipements.pdf");
  }, [filteredEquipements]);

  const exportToExcel = useCallback(() => {
    const exportItems = filteredEquipements.length > 0 ? filteredEquipements : equipements;
    const exportColumns = displayColumns.length > 0 ? displayColumns : columns;
    const generatedAt = new Date().toLocaleDateString("fr-FR");
    const sheetData = [
      ["Liste des equipements"],
      [`Export du ${generatedAt} - ${exportItems.length} equipement(s)`],
      [],
      exportColumns.map((column) => column.label),
      ...exportItems.map((item) =>
        exportColumns.map((column) => {
          if (column.key === "photo") {
            return resolvePhotoUrl(item);
          }

          const value = item?.[column.key];
          return value ?? "";
        })
      ),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    const lastColumnIndex = Math.max(exportColumns.length - 1, 0);
    const lastColumnLetter = XLSX.utils.encode_col(lastColumnIndex);

    worksheet["!merges"] = [
      XLSX.utils.decode_range(`A1:${lastColumnLetter}1`),
      XLSX.utils.decode_range(`A2:${lastColumnLetter}2`),
    ];

    worksheet["!cols"] = exportColumns.map((column) => ({
      wch: Math.max(String(column.label || "").length + 4, 18),
    }));

    worksheet["!autofilter"] = { ref: `A4:${lastColumnLetter}4` };

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Equipements");
    XLSX.writeFile(workbook, "equipements.xlsx");
  }, [filteredEquipements, equipements, displayColumns, columns]);

  const handlePrint = useCallback(() => {
    const tableColumn = ["Designation", "Categorie", "Numero Serie", "Date d'expiration", "Etat", "Statut", "Valeur"];
    const tableRows = filteredEquipements.map((item) => [
      item.designation,
      item.categorie,
      item.numero_serie,
      item.date_expiration,
      item.etat,
      item.statut,
      item.valeur,
    ]);

    openPrintableTable({
      title: "Liste des equipements",
      columns: tableColumn,
      rows: tableRows,
    });
  }, [filteredEquipements]);

  useEffect(() => {
    setTitle("Catalogue des equipements");

    return () => {
      clearActions();
      setTitle("");
    };
  }, [setTitle, clearActions]);

  useEffect(() => {
    setOnPrint(() => handlePrint);
    setOnExportPDF(() => exportToPDF);
    setOnExportExcel(() => exportToExcel);
  }, [setOnPrint, setOnExportPDF, setOnExportExcel, handlePrint, exportToPDF, exportToExcel]);

  const handleOpenCategoryManager = () => {
    setCategoryModalTrigger((prev) => prev + 1);
  };

  return (
    <>
      <ThemeProvider theme={createTheme()}>
        <Box sx={{ ...dynamicStyles }}>
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
              <div style={{ width: "18%", height: "100%", margin: 0, padding: 0 }}>
                <div className="groups-section">
                  <div className="groups-header">
                    <span>Categories Equipements </span>
                    <button
                          type="button"
                          className="category-manager-trigger"
                          onClick={handleOpenCategoryManager}
                        >
                          <FontAwesomeIcon icon={faGear} />
                        </button>
                  </div>
                  <ul style={{ padding: 0, marginTop: "20px" }}>
                    <li
                      onClick={() => setSelectedCategory("")}
                      className={`department-item ${!selectedCategory ? "selected" : ""}`}
                      style={{ listStyleType: "none" }}
                    >
                      <div className="department-item-content">
                        <button className="expand-button" type="button">
                          <FaRegCircle size={14} />
                        </button>
                        <span className={`common-text ${!selectedCategory ? "selected" : ""}`}>
                          <IoFolderOpenOutline size={18} />
                          Toutes les categories
                        </span>
                      </div>
                    </li>

                    {categoryOptions.map((category) => (
                      <li
                        key={category.value}
                        onClick={() => setSelectedCategory(category.value)}
                        className={`department-item ${selectedCategory === category.value ? "selected" : ""}`}
                        style={{ listStyleType: "none" }}
                      >
                        <div className="department-item-content">
                          <button className="expand-button" type="button">
                            <FaRegCircle size={14} />
                          </button>
                          <span className={`common-text ${selectedCategory === category.value ? "selected" : ""}`}>
                            <IoFolderOpenOutline size={18} />
                            {category.label}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="container3" style={{ width: showForm ? "56.5%" : "81%" }}>
                <div className="mt-4">
                  <div className="section-header mb-3" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div className="section-title-row">
                        
                        <span className="section-title mb-1">
                          <i className="fas fa-calendar-times me-2"></i>
                          Details Catalogue Equipements
                        </span>
                      </div>
                      <p className="section-description text-muted mb-0">
                        {selectedCategory || "Toutes"} - categorie selectionnee
                      </p>
                    </div>

                    <div className="d-flex align-items-center" style={{ gap: "12px" }}>
                      
                        
                      <FontAwesomeIcon
                        onClick={() => setFiltersVisible((prev) => !prev)}
                        icon={filtersVisible ? faClose : faFilter}
                        style={{ cursor: "pointer", fontSize: "1.9rem", color: "#2c767c", marginRight: "15px" }}
                      />

                      
                      <Button
                        onClick={() => {
                          setShowForm(true);
                          setEditingEquipement(null);
                        }}
                        className="btn btn-outline-primary d-flex align-items-center"
                        size="sm"
                        style={{ height: "45px" }}
                      >
                        <FaPlusCircle className="me-2" />
                        Ajouter un equipement
                      </Button>
                      <div ref={columnsDropdownRef} style={{ position: "relative" }}>
                        <button
                          type="button"
                          id="dropdown-columns-equipements"
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

                <AnimatePresence>
                  {filtersVisible && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="filters-container"
                    >
                      <div className="filters-icon-section">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a90a4" strokeWidth="2" className="filters-icon">
                          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                        </svg>
                        <span className="filters-title">Filtres</span>
                      </div>
                      <div
                        className="filter-group"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "14px",
                          flexWrap: "nowrap",
                          justifyContent: "flex-start",
                          marginLeft: "10.2%",
                          overflowX: "auto",
                          overflowY: "hidden",
                          width: "calc(100% - 10.2%)",
                          paddingBottom: "4px",
                        }}
                      >
                        {filterOptions.filters.map((filter, index) => (
                          <div
                            key={filter.key}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              margin: 0,
                              flex: "0 0 auto",
                            }}
                          >
                            <label
                              key={`label-${index}`}
                              className="filter-label"
                              style={{
                                fontSize: "0.9rem",
                                margin: 0,
                                marginRight: "0",
                                whiteSpace: "nowrap",
                                minWidth: "max-content",
                                fontWeight: 600,
                                color: "#2c3e50",
                              }}
                            >
                              {filter.label}
                            </label>
                            <div key={`input-wrapper-${index}`} className="filter-input-wrapper">
                              {filter.type === "range" ? (
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                >
                                  <input
                                    type={filter.inputType}
                                    value={filter.minValue}
                                    onChange={(event) => handleRangeFilterChange(filter.key, "minValue", event.target.value)}
                                    className="filter-input filter-range-input"
                                    placeholder={filter.minPlaceholder}
                                    style={{
                                      minWidth: filter.inputType === "date" ? 120 : 50,
                                      maxWidth: filter.inputType === "date" ? 140 : 70,
                                      height: 30,
                                      fontSize: "0.9rem",
                                      padding: "2px 4px",
                                      borderRadius: 6,
                                    }}
                                  />
                                  <span
                                    className="filter-range-separator"
                                    style={{
                                      margin: "0 2px",
                                      fontSize: "0.9rem",
                                      color: "#666",
                                    }}
                                  >
                                    -
                                  </span>
                                  <input
                                    type={filter.inputType}
                                    value={filter.maxValue}
                                    onChange={(event) => handleRangeFilterChange(filter.key, "maxValue", event.target.value)}
                                    className="filter-input filter-range-input"
                                    placeholder={filter.maxPlaceholder}
                                    style={{
                                      minWidth: filter.inputType === "date" ? 120 : 50,
                                      maxWidth: filter.inputType === "date" ? 140 : 70,
                                      height: 30,
                                      fontSize: "0.9rem",
                                      padding: "2px 4px",
                                      borderRadius: 6,
                                    }}
                                  />
                                </div>
                              ) : (
                                <select
                                  value={filter.value}
                                  onChange={(event) => handleFilterChange(filter.key, event.target.value)}
                                  className="filter-input"
                                  style={{
                                    minWidth: 80,
                                    maxWidth: 110,
                                    height: 30,
                                    fontSize: "0.9rem",
                                    padding: "2px 6px",
                                    borderRadius: 6,
                                  }}
                                >
                                  <option value="">{filter.placeholder}</option>
                                  {filter.options.map((option, optIndex) => (
                                    <option key={optIndex} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <ExpandRTable
                  columns={displayColumns}
                  data={equipements}
                  filteredData={filteredEquipements}
                  searchTerm={globalSearch}
                  selectAll={selectAll}
                  selectedItems={selectedItems}
                  handleSelectAllChange={handleSelectAllChange}
                  handleCheckboxChange={handleCheckboxChange}
                  handleEdit={(item) => {
                    setEditingEquipement(item);
                    setShowForm(true);
                  }}
                  handleDelete={handleDelete}
                  handleDeleteSelected={handleDeleteSelected}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  handleChangePage={handleChangePage}
                  handleChangeRowsPerPage={handleChangeRowsPerPage}
                />

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
                    <EquipementForm
                      onSubmit={handleSubmit}
                      onCancel={() => {
                        setShowForm(false);
                        setEditingEquipement(null);
                      }}
                      initialData={editingEquipement}
                      onCategoriesUpdated={refreshCategoryOptions}
                      categoriesRefreshKey={categoriesRefreshKey}
                    />
                  </div>
                )}

                <EquipementForm
                  categoryManagerOnly
                  categoryModalTrigger={categoryModalTrigger}
                  onCategoriesUpdated={refreshCategoryOptions}
                  categoriesRefreshKey={categoriesRefreshKey}
                />
              </div>
            </div>
          </Box>
        </Box>
      </ThemeProvider>

      <style jsx>{`
        .expand-button {
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          padding: 0;
          margin-right: 8px;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .expand-button:hover {
          background-color: rgba(8, 179, 173, 0.1);
        }

        .expand-button svg {
          color: #3a8a90;
          font-size: 14px;
          font-weight: 300;
        }

        .section-header {
          border-bottom: none;
          padding-bottom: 15px;
          margin-bottom: 25px;
        }

        .section-title-row {
          display: flex;
          align-items: flex-start;
          flex-direction: column;
          gap: 14px;
          flex-wrap: wrap;
        }

        .section-title {
          color: #2c3e50;
          font-weight: 600;
          margin-bottom: 5px;
          display: flex;
          align-items: center;
          font-size: 17px;
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

        .category-manager-trigger {
          display: inline-flex;
          align-items: center;
          gap: 8px;
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

        .groups-section {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 160px);
          overflow-y: hidden;
          overflow-x: hidden;
          background-color: #fff;
          border-radius: 10px;
          padding: 15px;
          transition: all 0.3s ease;
          border: 1px solid #e9ecef;
          scrollbar-width: thin;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }

        .groups-header {
          padding: 10px 20px;
          border-radius: 10px 10px 0 0;
          margin: -15px -15px 0 -15px;
          background: #f9fafb;
          border-bottom: 1px solid #e9ecef;
        }

        .groups-header span {
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          letter-spacing: 0.2px;
          font-size: 16.5px;
          font-weight: 600;
          color: #2c3e50;
          white-space: nowrap;
        }

        .department-item {
          border-radius: 10px;
          margin-bottom: 6px;
          transition: all 0.2s ease;
          border-left: 3px solid transparent;
          box-shadow: none;
          background: rgba(255, 255, 255, 0.8);
        }

        .department-item:hover {
          background: #f0fdfc;
          box-shadow: 0 2px 8px rgba(8, 179, 173, 0.06);
          border-left: 3px solid #3a8a90;
        }

        .department-item.selected {
          background: rgba(8, 179, 173, 0.03);
          border-left: 3px solid #3a8a90;
          box-shadow: 0 6px 20px rgba(8, 179, 173, 0.15);
        }

        .department-item-content {
          display: flex;
          align-items: center;
          padding: 16px 18px;
          cursor: pointer;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 500;
          color: #2c767c;
          transition: all 0.2s ease;
        }

        .common-text {
          display: flex;
          align-items: center;
          flex-grow: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 16px;
          font-weight: 500;
          color: #4b5563;
          transition: color 0.2s;
        }

        .common-text svg {
          margin-right: 10px;
          color: #3a8a90;
          font-size: 16px;
          transition: color 0.2s, transform 0.2s;
          opacity: 0.7;
        }

        .department-item.selected .common-text,
        .department-item:hover .common-text {
          color: #3a8a90;
          font-weight: 600;
        }

        .department-item.selected .common-text svg,
        .department-item:hover .common-text svg {
          color: #3a8a90;
          opacity: 1;
          transform: scale(1.05);
        }

        .filters-container {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 30px;
          padding: 20px 24px;
          background: rgba(8, 179, 173, 0.03);
          border-radius: 12px;
          box-shadow: 0 6px 20px rgba(8, 179, 173, 0.15);
          position: relative;
        }

        .filters-icon-section {
          display: flex;
          align-items: center;
          margin-left: 8px;
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          margin-right: 24px;
        }

        .filters-icon {
          margin-right: 8px;
          stroke: #3a8a90;
        }

        .filters-title {
          font-size: 16px;
          font-weight: 600;
          color: #2c3e50;
          letter-spacing: 0.5px;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: auto;
          margin-right: 0;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          flex-wrap: nowrap;
          overflow-x: auto;
          overflow-y: hidden;
          scrollbar-width: thin;
        }

        .filter-group:last-child {
          margin-right: 0;
        }

        .filter-label {
          font-weight: 600;
          color: #2c3e50;
          font-size: 14px;
          width: 100px;
          text-align: left;
          flex-shrink: 0;
        }

        .filter-input-wrapper {
          position: relative;
        }

        .filter-input {
          width: 180px;
          padding: 8px 12px;
          border: 2px solid #e1e8ed;
          border-radius: 6px;
          font-size: 14px;
          background-color: white;
          transition: all 0.3s ease;
          outline: none;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          cursor: pointer;
        }

        .filter-input:focus {
          border-color: #3a8a90;
          box-shadow: 0 0 0 3px rgba(8, 179, 173, 0.2);
        }

        .filter-input:hover:not(:focus) {
          border-color: #92d4d1;
        }

        .filter-range-input {
          min-width: 80px;
          flex: 1;
        }

        .filter-range-separator {
          color: #666;
          font-weight: 500;
          font-size: 14px;
          padding: 0 4px;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .filters-container {
            align-items: center;
            gap: 16px;
          }

          .filter-group {
            min-width: auto;
            flex-direction: row;
            align-items: center;
            gap: 8px;
            margin-right: 0;
            margin-left: 0 !important;
            flex-wrap: nowrap;
            overflow-x: auto;
          }

          .filter-label {
            min-width: auto;
          }
        }
      `}</style>
    </>
  );
};

export default Equipements;
