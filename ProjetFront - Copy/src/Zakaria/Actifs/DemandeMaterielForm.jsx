import React, { useEffect, useMemo, useState } from "react";
import { Card, Form, Button, Spinner, Modal, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Swal from "sweetalert2";
import { Building, FileText, CreditCard, Hash } from "lucide-react";
import {
  buildUniqueCategoryList,
  createEquipementCategory,
  deleteEquipementCategory,
  fetchEquipementCategories,
  normalizeCategoryName,
  updateEquipementCategory,
} from "./equipementCategories";

const EMPLOYES_API = "http://127.0.0.1:8000/api/employes-options";
const STORAGE_BASE_URL = "http://127.0.0.1:8000";
const TYPE_DEMANDEUR_OPTIONS = [
  { value: "employe", label: "Employe" },
  { value: "service", label: "Service" },
];

const URGENCES = ["Faible", "Normal", "Urgent"];

const sortCategoryRecords = (items) => [...items].sort((left, right) => left.nom.localeCompare(right.nom));

const getCategoryErrorMessage = (error, fallbackMessage) => {
  const validationMessage = Object.values(error?.response?.data?.errors ?? {}).flat().find(Boolean);
  return validationMessage || error?.response?.data?.message || fallbackMessage;
};

const toDateInput = (value) => {
  if (!value) return "";
  return String(value).slice(0, 10);
};

const resolveAttachmentUrl = (item) => {
  const rawValue = item?.piece_jointe_url || item?.piece_jointe;
  if (!rawValue) return "";

  const value = String(rawValue).trim();
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/storage/")) return `${STORAGE_BASE_URL}${value}`;

  const cleanedPath = value.replace(/^\/+/, "").replace(/^storage\//, "");
  return `${STORAGE_BASE_URL}/storage/${cleanedPath}`;
};

const getAttachmentName = (item) => {
  if (item?.piece_jointe_nom) {
    return String(item.piece_jointe_nom).trim();
  }

  const rawValue = item?.piece_jointe || item?.piece_jointe_url;
  if (!rawValue) return "";

  const value = String(rawValue).trim();
  if (!value) return "";

  const cleanValue = value.split("?")[0].split("#")[0];
  const segments = cleanValue.split("/").filter(Boolean);
  return segments.length ? decodeURIComponent(segments[segments.length - 1]) : "";
};

const toInitialState = (initialData) => ({
  type_demandeur: initialData?.type_demandeur ?? "employe",
  demandeur: initialData?.demandeur ?? "",
  categorie: initialData?.categorie ?? "",
  quantite: initialData?.quantite ?? "",
  equipement_souhaite: initialData?.equipement_souhaite ?? "",
  urgence: initialData?.urgence ?? "Normal",
  date_souhaitee: toDateInput(initialData?.date_souhaitee),
  justificatif: initialData?.justificatif ?? "",
  piece_jointe: null,
  statut: initialData?.statut ?? "En attente",
});

const DemandeMaterielForm = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  categoryModalTrigger = 0,
  onCategoriesUpdated,
  categoryManagerOnly = false,
  categoriesRefreshKey = 0,
}) => {
  const [formData, setFormData] = useState(toInitialState(initialData));
  const [employes, setEmployes] = useState([]);
  const [managedCategories, setManagedCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoryActionLoading, setCategoryActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    setFormData(toInitialState(initialData));
    setShowCategoryModal(false);
    setNewCategory("");
    setEditingCategoryId(null);
    setValidationErrors({});
    setError("");
  }, [initialData]);

  useEffect(() => {
    if (categoryModalTrigger > 0) {
      handleOpenCategoryModal();
    }
  }, [categoryModalTrigger]);

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const items = await fetchEquipementCategories();
        if (!isMounted) return;
        setManagedCategories(sortCategoryRecords(items));
      } catch (fetchError) {
        if (!isMounted) return;
        setManagedCategories([]);
      } finally {
        if (isMounted) {
          setLoadingCategories(false);
        }
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, [categoriesRefreshKey]);

  useEffect(() => {
    let isMounted = true;

    const loadEmployes = async () => {
      try {
        const response = await axios.get(EMPLOYES_API);
        const items = Array.isArray(response.data) ? response.data : [];
        if (!isMounted) return;
        setEmployes(items);
      } catch (fetchError) {
        if (!isMounted) return;
        setEmployes([]);
      }
    };

    loadEmployes();

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(
    () => buildUniqueCategoryList(managedCategories, [initialData?.categorie, formData.categorie]),
    [managedCategories, initialData?.categorie, formData.categorie]
  );

  const isValid = useMemo(() => {
    return Boolean(
      formData.type_demandeur &&
      formData.demandeur &&
      formData.categorie &&
      formData.equipement_souhaite &&
      formData.urgence &&
      formData.justificatif
    );
  }, [formData]);

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    if (name === "piece_jointe") {
      setFormData((prev) => ({ ...prev, piece_jointe: files?.[0] ?? null }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "type_demandeur" ? { demandeur: "" } : {}),
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (name === "type_demandeur" && validationErrors.demandeur) {
      setValidationErrors((prev) => ({ ...prev, demandeur: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.type_demandeur) errors.type_demandeur = "Le type de demandeur est requis";
    if (!formData.demandeur.trim()) errors.demandeur = "Le demandeur est requis";
    if (!formData.categorie) errors.categorie = "La categorie est requise";
    if (!formData.equipement_souhaite.trim()) errors.equipement_souhaite = "L'equipement souhaite est requis";
    if (!formData.urgence) errors.urgence = "L'urgence est requise";
    if (!formData.justificatif.trim()) errors.justificatif = "La description est requise";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const syncCategories = (nextCategories) => {
    const sortedCategories = sortCategoryRecords(nextCategories);
    setManagedCategories(sortedCategories);
    onCategoriesUpdated?.(sortedCategories.map((category) => category.nom));
  };

  const resetCategoryModal = () => {
    setNewCategory("");
    setEditingCategoryId(null);
  };

  const handleOpenCategoryModal = () => {
    setShowCategoryModal(true);
    resetCategoryModal();
  };

  const handleCloseCategoryModal = () => {
    setShowCategoryModal(false);
    resetCategoryModal();
  };

  const handleSaveCategory = async () => {
    const trimmedCategory = normalizeCategoryName(newCategory);
    if (!trimmedCategory || categoryActionLoading) return;

    const alreadyExists = managedCategories.some(
      (category) => category.nom.toLowerCase() === trimmedCategory.toLowerCase() && category.id !== editingCategoryId
    );

    if (alreadyExists) {
      Swal.fire({
        icon: "warning",
        title: "Categorie existante",
        text: "Cette categorie existe deja.",
      });
      return;
    }

    try {
      setCategoryActionLoading(true);

      let nextCategories = [];
      const isEditing = editingCategoryId !== null;
      const previousCategory = managedCategories.find((category) => category.id === editingCategoryId) ?? null;

      if (isEditing) {
        const updatedCategory = await updateEquipementCategory(editingCategoryId, trimmedCategory);
        nextCategories = managedCategories.map((category) =>
          category.id === editingCategoryId ? updatedCategory : category
        );

        if (formData.categorie === previousCategory?.nom) {
          setFormData((prev) => ({ ...prev, categorie: trimmedCategory }));
        }
      } else {
        const createdCategory = await createEquipementCategory(trimmedCategory);
        nextCategories = [...managedCategories, createdCategory];
        setFormData((prev) => ({ ...prev, categorie: trimmedCategory }));
      }

      syncCategories(nextCategories);
      resetCategoryModal();
      setValidationErrors((prev) => ({ ...prev, categorie: "" }));
      Swal.fire({
        icon: "success",
        title: "Succes!",
        text: isEditing ? "Categorie modifiee avec succes." : "Categorie ajoutee avec succes.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (saveError) {
      Swal.fire({
        icon: "error",
        title: "Erreur!",
        text: getCategoryErrorMessage(saveError, "Impossible d'enregistrer la categorie."),
      });
    } finally {
      setCategoryActionLoading(false);
    }
  };

  const handleEditCategory = (category) => {
    setNewCategory(category.nom ?? category.label ?? "");
    setEditingCategoryId(category.id);
  };

  const handleDeleteCategory = async (categoryToDelete) => {
    const categoryLabel = categoryToDelete.nom ?? categoryToDelete.label ?? "";
    const result = await Swal.fire({
      title: "\u00CAtes-vous s\u00FBr ?",
      text: "Cette categorie sera supprimee.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });
    if (!result.isConfirmed) return;

    try {
      setCategoryActionLoading(true);
      await deleteEquipementCategory(categoryToDelete.id);

      const nextCategories = managedCategories.filter((category) => category.id !== categoryToDelete.id);
      syncCategories(nextCategories);

      if (formData.categorie === categoryLabel) {
        setFormData((prev) => ({ ...prev, categorie: "" }));
      }

      if (newCategory === categoryLabel) {
        resetCategoryModal();
      }

      Swal.fire({
        icon: "success",
        title: "Succes!",
        text: "Categorie supprimee avec succes.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (deleteError) {
      Swal.fire({
        icon: "error",
        title: "Erreur!",
        text: getCategoryErrorMessage(deleteError, "Impossible de supprimer la categorie."),
      });
    } finally {
      setCategoryActionLoading(false);
    }
  };

  const categoryRows = managedCategories.map((category) => ({
    id: category.id,
    label: category.nom,
  }));

  const handleCancelCategoryEdit = () => {
    resetCategoryModal();
  };

  const handleSelectCategory = (event) => {
    handleChange(event);
    setValidationErrors((prev) => ({ ...prev, categorie: "" }));
  };

  const handleCategoryInputChange = (event) => {
    setNewCategory(event.target.value);
  };

  const handleCategoryKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSaveCategory();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;
    if (!validateForm()) return;

    try {
      await onSubmit({
        ...formData,
        quantite: formData.quantite === "" ? null : Number(formData.quantite),
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Une erreur est survenue");
    }
  };

  const categoryManagerModal = (
    <Modal show={showCategoryModal} onHide={handleCloseCategoryModal} centered dialogClassName="category-modal">
      <Modal.Header closeButton>
        <Modal.Title>Gestion des Categories</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="category-modal-form">
          <div className="category-modal-group">
            <Form.Control
              type="text"
              value={newCategory}
              onChange={handleCategoryInputChange}
              onKeyDown={handleCategoryKeyDown}
              placeholder="Categorie"
            />
            <Button
              type="button"
              className="btn-category-submit"
              onClick={handleSaveCategory}
              disabled={!newCategory.trim() || categoryActionLoading}
            >
              {categoryActionLoading ? "En cours..." : editingCategoryId !== null ? "Modifier" : "Ajouter"}
            </Button>
          </div>
        </div>

        <div className="category-table-wrapper">
          <Table hover responsive className="category-table">
            <thead>
              <tr>
                <th>Categorie</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loadingCategories ? (
                <tr>
                  <td colSpan={2} className="category-empty">
                    Chargement des categories...
                  </td>
                </tr>
              ) : categoryRows.length > 0 ? (
                categoryRows.map((category) => (
                  <tr key={`${category.label}-${category.id}`}>
                    <td>{category.label}</td>
                    <td className="category-action-cell">
                      <Button
                        type="button"
                        className="btn-icon-action"
                        onClick={() => handleEditCategory(category)}
                        disabled={categoryActionLoading}
                      >
                        <FontAwesomeIcon icon={faEdit} style={{ color: "#3b82f6", cursor: "pointer" }} />
                      </Button>
                      <Button
                        type="button"
                        className="btn-icon-action"
                        onClick={() => handleDeleteCategory(category)}
                        disabled={categoryActionLoading}
                      >
                        <FontAwesomeIcon icon={faTrash} style={{ color: "#ef4444", cursor: "pointer" }} />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="category-empty">
                    Aucune categorie disponible
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {editingCategoryId !== null && (
          <div className="d-flex justify-content-end mt-3">
            <Button type="button" variant="light" onClick={handleCancelCategoryEdit} disabled={categoryActionLoading}>
              Annuler la modification
            </Button>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );

  return (
    <>
      <style>
        {`
        .societe-form-container {
            border: none;
            border-radius: 0;
            background-color: transparent;
            box-shadow: none;
            height: 100%;
            width: 100%;
        }

        .societe-form-header {
            padding: 0.99rem 0;
            letter-spacing: 0.5px;
            margin: 0;
            background: #f9fafb;
            border-bottom :1px solid #e9ecef;
        }

        .societe-form-header h5 {
            display: flex;
            justify-content: center;
            letter-spacing: 0.2px;
            font-size: 1.15rem;
            font-weight: 600;
            color: #4b5563;
            margin: 0;
            padding: 0;
        }

        .societe-form-body {
            padding: 1.5rem;
            background-color: transparent;
            height: calc(100% - 80px);
            overflow-y: auto;
        }

        .form-group-wrapper {
            margin-bottom: 1.25rem;
            position: relative;
        }

        .form-group-wrapper:not(:last-child)::after {
            content: '';
            position: absolute;
            left: 0;
            right: 0;
            bottom: -0.625rem;
            height: 1px;
            background-color: #f3f4f6;
        }

        .form-label-enhanced {
            font-size: 0.875rem;
            font-weight: 500;
            color: #4b5563;
            margin-bottom: 0.5rem;
        }

        .form-control-enhanced {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            font-size: 0.875rem;
            color: #111827;
            background-color: #ffffff;
            transition: all 0.2s ease;
        }

        .form-control-enhanced:focus {
            outline: none;
            border-color: #00afaa;
            box-shadow: 0 0 0 2px rgba(0, 175, 170, 0.1);
        }

        .form-control-enhanced.is-invalid {
            border-color: #ef4444;
        }

        .icon-accent {
          color: #4b5563;
          margin-bottom: 0.1rem;
          margin-right: 0.5rem;
        }

        .error-message {
            color: #ef4444;
            font-size: 0.75rem;
            margin-top: 0.25rem;
            display: block;
        }

        .form-actions {
            margin-top: 2rem;
            padding-top: 1.5rem;
            border-top: 1px solid #e5e7eb;
            display: flex;
            gap: 1rem;
            justify-content: center;
        }

        .btn-primary-custom {
            background-color: #00afaa;
            border: 1px solid #00afaa;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 500;
            min-width: 120px;
        }

        .btn-secondary-custom {
            background-color: #f3f4f6;
            border: 1px solid #d1d5db;
            color: #4b5563;
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 500;
            min-width: 120px;
        }

        .btn-primary-custom:disabled,
        .btn-secondary-custom:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .alert-custom {
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            color: #dc2626;
            padding: 0.75rem 1rem;
            border-radius: 6px;
            font-size: 0.875rem;
            margin-top: 1rem;
        }

        .category-select-row {
            display: flex;
            gap: 0.5rem;
            align-items: center;
        }

        .category-select-row .form-control-enhanced {
            flex: 1;
        }

        .btn-category-add {
            width: 42px;
            height: 42px;
            border: 1px solid #d1d5db;
            background: #ffffff;
            color: #4b5563;
            border-radius: 10px;
            font-size: 1.2rem;
            line-height: 1;
            box-shadow: 0 4px 10px rgba(15, 23, 42, 0.08);
            transition: all 0.2s ease;
        }

        .btn-category-add:hover {
            background: #f3f4f6;
            border-color: #d1d5db;
            color: #374151;
        }

        .category-modal .modal-content {
            border: none;
            border-radius: 18px;
            overflow: hidden;
            box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
        }

        .category-modal .modal-header {
            padding: 1rem 1.25rem;
            border-bottom: 1px solid #e5e7eb;
            background: linear-gradient(135deg, #f0fdfa, #eff6ff);
        }

        .category-modal .modal-title {
            color: #1f2937;
            font-size: 1.05rem;
            font-weight: 700;
        }

        .category-modal .modal-body {
            padding: 1.25rem;
            background: #ffffff;
        }

        .category-modal-form {
            margin-bottom: 1rem;
        }

        .category-modal-group {
            display: flex;
            gap: 0.75rem;
            align-items: stretch;
        }

        .category-modal-group .form-control {
            border-radius: 12px;
            border: 1px solid #d1d5db;
            min-height: 46px;
            padding: 0.75rem 0.95rem;
            box-shadow: none;
        }

        .category-modal-group .form-control:focus {
            border-color: #14b8a6;
            box-shadow: 0 0 0 0.2rem rgba(20, 184, 166, 0.15);
        }

        .btn-category-submit {
            min-width: 120px;
            border: 1px solid #00afaa;
            border-radius: 6px;
            background-color: #00afaa;
            color: #ffffff;
            font-weight: 500;
            padding: 0.75rem 1.5rem;
            transition: all 0.2s ease;
        }

        .btn-category-submit:hover:not(:disabled) {
            background-color: #009691;
            border-color: #009691;
        }

        .category-table-wrapper {
            max-height: 300px;
            overflow-y: auto;
            border: 1px solid #e5e7eb;
            border-radius: 14px;
            overflow-x: hidden;
        }

        .category-table {
            margin-bottom: 0;
        }

        .category-table thead th {
            background: #f8fafc;
            color: #475569;
            font-weight: 700;
            border-bottom: 1px solid #e5e7eb;
        }

        .category-table td,
        .category-table th {
            vertical-align: middle;
            padding: 0.85rem 1rem;
        }

        .category-action-cell {
            white-space: nowrap;
            width: 120px;
        }

        .btn-icon-action {
            background-color: #ffffff !important;
            border: 1px solid #e5e7eb !important;
            border-radius: 8px;
            padding: 0.2rem 0.45rem;
            margin-right: 0.35rem;
            box-shadow: 0 2px 6px rgba(15, 23, 42, 0.05);
        }

        .btn-icon-action:hover {
            background-color: #ffffff !important;
            border-color: #e5e7eb !important;
            box-shadow: 0 2px 6px rgba(15, 23, 42, 0.05);
        }

        .category-empty {
            padding: 1rem;
            text-align: center;
            color: #6b7280;
            font-size: 0.9rem;
        }
        `}
      </style>

      {categoryManagerOnly ? (
        categoryManagerModal
      ) : (
        <>
      <Card className="societe-form-container" style={{ height: "100%", width: "100%" }}>
        <div className="societe-form-header">
          <h5>{initialData ? "Modifier Demande Materiel" : "Ajouter Demande Materiel"}</h5>
        </div>

        <div className="societe-form-body">
          <Form onSubmit={handleSubmit}>
            <div className="form-group-wrapper">
              <Form.Label className="form-label-enhanced">
                <Building size={16} className="icon-accent" />
                Type de demandeur
              </Form.Label>
              <Form.Select
                name="type_demandeur"
                value={formData.type_demandeur}
                onChange={handleChange}
                className={`form-control-enhanced ${validationErrors.type_demandeur ? "is-invalid" : ""}`}
              >
                {TYPE_DEMANDEUR_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
              {validationErrors.type_demandeur && <span className="error-message">{validationErrors.type_demandeur}</span>}
            </div>

            <div className="form-group-wrapper">
              <Form.Label className="form-label-enhanced">
                <Building size={16} className="icon-accent" />
                Demandeur
              </Form.Label>
              {formData.type_demandeur === "service" ? (
                <Form.Control
                  type="text"
                  name="demandeur"
                  value={formData.demandeur}
                  onChange={handleChange}
                  className={`form-control-enhanced ${validationErrors.demandeur ? "is-invalid" : ""}`}
                  placeholder="Entrez le nom du service"
                />
              ) : (
                <Form.Select
                  name="demandeur"
                  value={formData.demandeur}
                  onChange={handleChange}
                  className={`form-control-enhanced ${validationErrors.demandeur ? "is-invalid" : ""}`}
                >
                  <option value="">Selectionner un employe</option>
                  {employes.map((employe) => {
                    const fullName = [employe.nom, employe.prenom].filter(Boolean).join(" ").trim();
                    return (
                      <option key={employe.id || fullName} value={fullName}>
                        {fullName}
                      </option>
                    );
                  })}
                </Form.Select>
              )}
              {validationErrors.demandeur && <span className="error-message">{validationErrors.demandeur}</span>}
            </div>

            <div className="form-group-wrapper">
              <Form.Label className="form-label-enhanced">
                <FileText size={16} className="icon-accent" />
                Categorie
              </Form.Label>
              <div className="category-select-row">
                <Form.Select
                  name="categorie"
                  value={formData.categorie}
                  onChange={handleSelectCategory}
                  className={`form-control-enhanced ${validationErrors.categorie ? "is-invalid" : ""}`}
                >
                  <option value="">Selectionner</option>
                  {categories.map((categorie) => (
                    <option key={categorie} value={categorie}>
                      {categorie}
                    </option>
                  ))}
                </Form.Select>
                <button
                  type="button"
                  className="btn-category-add"
                  onClick={handleOpenCategoryModal}
                >
                  +
                </button>
              </div>
              {validationErrors.categorie && <span className="error-message">{validationErrors.categorie}</span>}
            </div>

            <div className="form-group-wrapper">
              <Form.Label className="form-label-enhanced">
                <Hash size={16} className="icon-accent" />
                Quantite
              </Form.Label>
              <Form.Control
                type="number"
                min="1"
                name="quantite"
                value={formData.quantite}
                onChange={handleChange}
                className="form-control-enhanced"
                placeholder="Entrez la quantite"
              />
            </div>

            <div className="form-group-wrapper">
              <Form.Label className="form-label-enhanced">
                <Building size={16} className="icon-accent" />
                Equipement souhaite
              </Form.Label>
              <Form.Control
                type="text"
                name="equipement_souhaite"
                value={formData.equipement_souhaite}
                onChange={handleChange}
                className={`form-control-enhanced ${validationErrors.equipement_souhaite ? "is-invalid" : ""}`}
                placeholder="Entrez l'equipement souhaite"
              />
              {validationErrors.equipement_souhaite && <span className="error-message">{validationErrors.equipement_souhaite}</span>}
            </div>

            <div className="form-group-wrapper">
              <Form.Label className="form-label-enhanced">
                <CreditCard size={16} className="icon-accent" />
                Date souhaitee
              </Form.Label>
              <Form.Control
                type="date"
                name="date_souhaitee"
                value={formData.date_souhaitee}
                onChange={handleChange}
                className="form-control-enhanced"
              />
            </div>

            <div className="form-group-wrapper">
              <Form.Label className="form-label-enhanced">
                <CreditCard size={16} className="icon-accent" />
                Urgence
              </Form.Label>
              <Form.Select
                name="urgence"
                value={formData.urgence}
                onChange={handleChange}
                className={`form-control-enhanced ${validationErrors.urgence ? "is-invalid" : ""}`}
              >
                {URGENCES.map((urgence) => (
                  <option key={urgence} value={urgence}>
                    {urgence}
                  </option>
                ))}
              </Form.Select>
              {validationErrors.urgence && <span className="error-message">{validationErrors.urgence}</span>}
            </div>

            <div className="form-group-wrapper">
              <Form.Label className="form-label-enhanced">
                <FileText size={16} className="icon-accent" />
                Description
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                name="justificatif"
                value={formData.justificatif}
                onChange={handleChange}
                className={`form-control-enhanced ${validationErrors.justificatif ? "is-invalid" : ""}`}
                placeholder="Entrez la description de la demande"
              />
              {validationErrors.justificatif && <span className="error-message">{validationErrors.justificatif}</span>}
            </div>

            <div className="form-group-wrapper">
              <Form.Label className="form-label-enhanced">
                <FileText size={16} className="icon-accent" />
                Piece jointe
              </Form.Label>
              <Form.Control type="file" name="piece_jointe" onChange={handleChange} accept=".pdf,.jpg,.jpeg,.png" className="form-control-enhanced" />
              {initialData && !formData.piece_jointe && resolveAttachmentUrl(initialData) && (
                <span className="error-message" style={{ color: "#4b5563" }}>
                  Fichier actuel :{" "}
                  <a href={resolveAttachmentUrl(initialData)} target="_blank" rel="noopener noreferrer">
                    {getAttachmentName(initialData) || "Voir la piece jointe"}
                  </a>
                </span>
              )}
            </div>

            <div className="form-group-wrapper">
              <Form.Label className="form-label-enhanced">
                <FileText size={16} className="icon-accent" />
                Statut
              </Form.Label>
              <Form.Control type="text" name="statut" value={formData.statut} readOnly className="form-control-enhanced" />
            </div>

            {error && <div className="alert-custom">{error}</div>}

            <div className="form-actions">
              <Button type="submit" disabled={loading || !isValid} className="btn-primary-custom">
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Chargement...
                  </>
                ) : (
                  "Enregistrer"
                )}
              </Button>
              <Button type="button" onClick={onCancel} disabled={loading} className="btn-secondary-custom">
                Annuler
              </Button>
            </div>
          </Form>
        </div>
      </Card>
          {categoryManagerModal}
        </>
      )}
    </>
  );
};

export default DemandeMaterielForm;


