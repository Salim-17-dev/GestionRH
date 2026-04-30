import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Form, Button, Spinner } from "react-bootstrap";
import { Building, CreditCard, Hash, FileText } from "lucide-react";

const EMPLOYES_API = "http://127.0.0.1:8000/api/employes-options";
const STORAGE_BASE_URL = "http://127.0.0.1:8000";

const resolveAttachmentUrl = (item) => {
  const rawValue = item?.piece_jointe_url || item?.piece_jointe;
  if (!rawValue) return "";

  const value = String(rawValue).trim();
  if (!value) return "";

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  if (value.startsWith("/storage/")) {
    return `${STORAGE_BASE_URL}${value}`;
  }

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
  employe: String(initialData?.employe?.id ?? initialData?.employe_id ?? initialData?.employe ?? ""),
  mois_concerne: initialData?.mois_concerne || "",
  type_reclamation: initialData?.type_reclamation || initialData?.type_probleme || "",
  description: initialData?.description || "",
  piece_jointe: null,
  statut: initialData?.statut || "En attente",
});

const ReclamationForm = ({ onSubmit, onCancel, initialData }) => {
  const [employes, setEmployes] = useState([]);
  const [formData, setFormData] = useState(toInitialState(initialData));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const loadEmployes = async () => {
    const empRes = await axios.get(EMPLOYES_API);
    setEmployes(Array.isArray(empRes.data) ? empRes.data : []);
  };

  useEffect(() => {
    loadEmployes();
  }, []);

  useEffect(() => {
    setFormData(toInitialState(initialData));
    setValidationErrors({});
    setError("");
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "piece_jointe") {
      setFormData((prev) => ({
        ...prev,
        piece_jointe: files?.[0] || null,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!String(formData.employe).trim()) {
      errors.employe = "L'employe est requis";
    }
    if (!String(formData.mois_concerne).trim()) {
      errors.mois_concerne = "Le mois est requis";
    }
    if (!String(formData.type_reclamation).trim()) {
      errors.type_reclamation = "Le type de probleme est requis";
    }
    if (!String(formData.description).trim()) {
      errors.description = "La description est requise";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!validateForm()) return;
    try {
      setLoading(true);
      await onSubmit(formData);
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

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

        .societe-form-header .separator {
            height: 1px;
            background-color: #e9ecef;
            margin: 1rem 0 0 0;
            width: 100%;
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

        .form-control-enhanced::placeholder {
            color: #9ca3af;
            font-size: 0.875rem;
        }

        .form-control-enhanced.is-invalid {
            border-color: #ef4444;
        }

        .icon-accent {
          color: #4b5563;
            margin-bottom: 0.1rem;
            margin-right: 0.5rem ;
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
            transition: all 0.2s ease;
        }

        .btn-primary-custom:hover:not(:disabled) {
            background-color: #009691;
            border-color: #009691;
        }

        .btn-primary-custom:disabled {
            opacity: 0.6;
            cursor: not-allowed;
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
            transition: all 0.2s ease;
        }

        .btn-secondary-custom:hover:not(:disabled) {
            background-color: #e5e7eb;
            border-color: #9ca3af;
            color: #374151;
        }

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
        `}
      </style>

      <Card className="societe-form-container" style={{ height: "100%", width: "100%" }}>
        <div className="societe-form-header">
          <h5>{initialData ? "Modifier Reclamation Salaire" : "Ajouter Reclamation Salaire"}</h5>
        </div>

        <div className="societe-form-body">
          <Form onSubmit={handleSubmit}>
            <div className="form-group-wrapper">
              <Form.Label className="form-label-enhanced">
                <Building size={16} className="icon-accent" />
                Employe
              </Form.Label>
              <Form.Select
                name="employe"
                value={formData.employe}
                onChange={handleChange}
                className={`form-control-enhanced ${validationErrors.employe ? "is-invalid" : ""}`}
              >
                <option value="">-- Sélectionner employé --</option>
                {employes.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {[emp.nom, emp.prenom].filter(Boolean).join(" ")}
                  </option>
                ))}
              </Form.Select>
              {validationErrors.employe && <span className="error-message">{validationErrors.employe}</span>}
            </div>

            <div className="form-group-wrapper">
              <Form.Label className="form-label-enhanced">
                <Hash size={16} className="icon-accent" />
                Mois
              </Form.Label>
              <Form.Control
                type="month"
                name="mois_concerne"
                value={formData.mois_concerne}
                onChange={handleChange}
                className={`form-control-enhanced ${validationErrors.mois_concerne ? "is-invalid" : ""}`}
              />
              {validationErrors.mois_concerne && <span className="error-message">{validationErrors.mois_concerne}</span>}
            </div>

            <div className="form-group-wrapper">
              <Form.Label className="form-label-enhanced">
                <CreditCard size={16} className="icon-accent" />
                Type probleme
              </Form.Label>
              <Form.Select
                name="type_reclamation"
                value={formData.type_reclamation}
                onChange={handleChange}
                className={`form-control-enhanced ${validationErrors.type_reclamation ? "is-invalid" : ""}`}
              >
                <option value="">Selectionner</option>
                <option value="retard_paiement">Retard paiement</option>
                <option value="prime_non_versee">Prime non versee</option>
                <option value="erreur_bulletin">Erreur bulletin</option>
                <option value="autre">Autre</option>
              </Form.Select>
              {validationErrors.type_reclamation && <span className="error-message">{validationErrors.type_reclamation}</span>}
            </div>

            <div className="form-group-wrapper">
              <Form.Label className="form-label-enhanced">
                <FileText size={16} className="icon-accent" />
                Description
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={`form-control-enhanced ${validationErrors.description ? "is-invalid" : ""}`}
                placeholder="Detaillez votre reclamation..."
              />
              {validationErrors.description && <span className="error-message">{validationErrors.description}</span>}
            </div>

            <div className="form-group-wrapper">
              <Form.Label className="form-label-enhanced">
                <FileText size={16} className="icon-accent" />
                Piece jointe
              </Form.Label>
              <Form.Control type="file" name="piece_jointe" onChange={handleChange} className="form-control-enhanced" />
              {initialData && !formData.piece_jointe && resolveAttachmentUrl(initialData) && (
                <span className="error-message" style={{ color: "#4b5563" }}>
                  Fichier actuel :{" "}
                  <a href={resolveAttachmentUrl(initialData)} target="_blank" rel="noopener noreferrer">
                    {getAttachmentName(initialData) || "Voir la piece jointe"}
                  </a>
                </span>
              )}
            </div>

            {error && <div className="alert-custom">{error}</div>}

            <div className="form-actions">
              <Button type="submit" disabled={loading} className="btn-primary-custom">
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
    </>
  );
};

export default ReclamationForm;
