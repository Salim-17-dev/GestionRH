import React, { useEffect, useMemo, useState } from "react";
import { Card, Form, Button, Spinner } from "react-bootstrap";
import { BookOpen, FileText, Briefcase, Clock3, Tag, BarChart3 } from "lucide-react";

const STATUS_OPTIONS = ["En attente", "Acceptee", "Refusee"];
const DUREE_UNIT_OPTIONS = ["jour", "mois"];
const DOMAINE_OPTIONS = ["Dev", "RH", "Management", "Finance", "Marketing", "Qualite", "Informatique"];
const TYPE_OPTIONS = ["Technique", "Soft skills", "Certifiante", "Presentielle", "En ligne", "Autre"];

const parseDuree = (value) => {
  const normalized = String(value || "").trim();
  const match = normalized.match(/^(\d+)\s*(jour|jours|mois)$/i);

  if (!match) {
    return {
      dureeValue: "",
      dureeUnit: "jour",
    };
  }

  const unit = match[2].toLowerCase().startsWith("mois") ? "mois" : "jour";

  return {
    dureeValue: match[1],
    dureeUnit: unit,
  };
};

const toInitialState = (initialData) => {
  const { dureeValue, dureeUnit } = parseDuree(initialData?.duree);

  return {
    titre: initialData?.titre ?? "",
    description: initialData?.description ?? "",
    domaine: initialData?.domaine ?? "",
    dureeValue,
    dureeUnit,
    type: initialData?.type ?? "",
    votes: initialData?.votes !== undefined && initialData?.votes !== null ? String(initialData.votes) : "0",
    status: initialData?.status ?? "En attente",
  };
};

const FormationForm = ({ initialData, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState(toInitialState(initialData));
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    setFormData(toInitialState(initialData));
    setValidationErrors({});
    setError("");
  }, [initialData]);

  const isValid = useMemo(
    () =>
      Boolean(
        formData.titre.trim() &&
        formData.description.trim() &&
        formData.domaine.trim() &&
        formData.dureeValue.trim() &&
        formData.type.trim()
      ),
    [formData]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.titre.trim()) errors.titre = "Le titre est requis";
    if (!formData.description.trim()) errors.description = "La description est requise";
    if (!formData.domaine.trim()) errors.domaine = "Le domaine est requis";
    if (!formData.dureeValue.trim()) errors.dureeValue = "La duree est requise";
    if (formData.dureeValue !== "" && Number.isNaN(Number(formData.dureeValue))) errors.dureeValue = "La duree doit etre numerique";
    if (formData.dureeValue !== "" && Number(formData.dureeValue) <= 0) errors.dureeValue = "La duree doit etre superieure a 0";
    if (!formData.type.trim()) errors.type = "Le type est requis";
    if (formData.votes !== "" && Number.isNaN(Number(formData.votes))) errors.votes = "Les votes doivent etre numeriques";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;
    if (!validateForm()) return;

    try {
      await onSubmit({
        titre: formData.titre.trim(),
        description: formData.description.trim(),
        domaine: formData.domaine.trim(),
        duree: `${Number(formData.dureeValue)} ${Number(formData.dureeValue) > 1 && formData.dureeUnit === "jour" ? "jours" : formData.dureeUnit}`,
        type: formData.type.trim(),
        votes: formData.votes === "" ? 0 : Number(formData.votes),
        status: formData.status,
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Une erreur est survenue");
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

        .duree-row {
            display: grid;
            grid-template-columns: 1fr 1.3fr;
            gap: 0.75rem;
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
        `}
      </style>

      <Card className="societe-form-container" style={{ height: "100%", width: "100%" }}>
        <div className="societe-form-header">
          <h5>{initialData ? "Modifier Formation" : "Ajouter Formation"}</h5>
        </div>

        <div className="societe-form-body">
          <Form onSubmit={handleSubmit}>
            <div className="form-group-wrapper">
              <Form.Label className="form-label-enhanced">
                <BookOpen size={16} className="icon-accent" />
                Titre
              </Form.Label>
              <Form.Control
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                className={`form-control-enhanced ${validationErrors.titre ? "is-invalid" : ""}`}
                placeholder="Entrez le titre"
              />
              {validationErrors.titre && <span className="error-message">{validationErrors.titre}</span>}
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
                placeholder="Entrez la description"
              />
              {validationErrors.description && <span className="error-message">{validationErrors.description}</span>}
            </div>

            <div className="form-group-wrapper">
              <Form.Label className="form-label-enhanced">
                <Briefcase size={16} className="icon-accent" />
                Domaine
              </Form.Label>
              <Form.Select
                name="domaine"
                value={formData.domaine}
                onChange={handleChange}
                className={`form-control-enhanced ${validationErrors.domaine ? "is-invalid" : ""}`}
              >
                <option value="">Selectionner</option>
                {DOMAINE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Form.Select>
              {validationErrors.domaine && <span className="error-message">{validationErrors.domaine}</span>}
            </div>

            <div className="form-group-wrapper">
              <Form.Label className="form-label-enhanced">
                <Clock3 size={16} className="icon-accent" />
                Duree
              </Form.Label>
              <div className="duree-row">
                <Form.Select
                  name="dureeUnit"
                  value={formData.dureeUnit}
                  onChange={handleChange}
                  className="form-control-enhanced"
                >
                  {DUREE_UNIT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option === "jour" ? "Jour" : "Mois"}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control
                  type="number"
                  min="1"
                  name="dureeValue"
                  value={formData.dureeValue}
                  onChange={handleChange}
                  className={`form-control-enhanced ${validationErrors.dureeValue ? "is-invalid" : ""}`}
                  placeholder="Ex: 3"
                />
              </div>
              {validationErrors.dureeValue && <span className="error-message">{validationErrors.dureeValue}</span>}
            </div>

            <div className="form-group-wrapper">
              <Form.Label className="form-label-enhanced">
                <Tag size={16} className="icon-accent" />
                Type
              </Form.Label>
              <Form.Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={`form-control-enhanced ${validationErrors.type ? "is-invalid" : ""}`}
              >
                <option value="">Selectionner</option>
                {TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Form.Select>
              {validationErrors.type && <span className="error-message">{validationErrors.type}</span>}
            </div>

            <div className="form-group-wrapper">
              <Form.Label className="form-label-enhanced">
                <BarChart3 size={16} className="icon-accent" />
                Votes
              </Form.Label>
              <Form.Control
                type="number"
                min="0"
                name="votes"
                value={formData.votes}
                onChange={handleChange}
                className={`form-control-enhanced ${validationErrors.votes ? "is-invalid" : ""}`}
              />
              {validationErrors.votes && <span className="error-message">{validationErrors.votes}</span>}
            </div>

            <div className="form-group-wrapper">
              <Form.Label className="form-label-enhanced">
                <Tag size={16} className="icon-accent" />
                Statut
              </Form.Label>
              <Form.Select name="status" value={formData.status} onChange={handleChange} className="form-control-enhanced">
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Form.Select>
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
    </>
  );
};

export default FormationForm;
