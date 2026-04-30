import React, { useEffect, useMemo, useState } from "react";
import { Card, Form, Button, Spinner } from "react-bootstrap";
import { BookOpen, FileText, Tag, Calendar, MapPin, DollarSign } from "lucide-react";

const STATUS_OPTIONS = ["En attente", "Acceptee", "Refusee", "Completee"];
const TYPE_OPTIONS = ["Sortie", "Seminaire", "Conference", "Team building", "Atelier", "Celebration"];

const toInitialState = (initialData) => ({
  titre: initialData?.titre ?? "",
  description: initialData?.description ?? "",
  type: initialData?.type ?? "",
  date: initialData?.date ?? "",
  lieu: initialData?.lieu ?? "",
  budget: initialData?.budget !== undefined && initialData?.budget !== null ? String(initialData.budget) : "0",
  status: initialData?.status ?? "En attente",
});

const EvenementForm = ({ initialData, onSubmit, onCancel, loading = false }) => {
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
        formData.type.trim() &&
        formData.date.trim() &&
        formData.lieu.trim()
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
    if (!formData.type.trim()) errors.type = "Le type est requis";
    if (!formData.date.trim()) errors.date = "La date est requise";
    if (!formData.lieu.trim()) errors.lieu = "Le lieu est requis";
    if (formData.budget !== "" && Number.isNaN(Number(formData.budget))) errors.budget = "Le budget doit etre numerique";
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
        type: formData.type.trim(),
        date: formData.date.trim(),
        lieu: formData.lieu.trim(),
        budget: formData.budget === "" ? 0 : Number(formData.budget),
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
          <h5>{initialData ? "Modifier Événement" : "Ajouter Événement"}</h5>
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
                <Calendar size={16} className="icon-accent" />
                Date
              </Form.Label>
              <Form.Control
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                className={`form-control-enhanced ${validationErrors.date ? "is-invalid" : ""}`}
              />
              {validationErrors.date && <span className="error-message">{validationErrors.date}</span>}
            </div>

            <div className="form-group-wrapper">
              <Form.Label className="form-label-enhanced">
                <MapPin size={16} className="icon-accent" />
                Lieu
              </Form.Label>
              <Form.Control
                name="lieu"
                value={formData.lieu}
                onChange={handleChange}
                className={`form-control-enhanced ${validationErrors.lieu ? "is-invalid" : ""}`}
                placeholder="Entrez le lieu"
              />
              {validationErrors.lieu && <span className="error-message">{validationErrors.lieu}</span>}
            </div>

            <div className="form-group-wrapper">
              <Form.Label className="form-label-enhanced">
                <DollarSign size={16} className="icon-accent" />
                Budget
              </Form.Label>
              <Form.Control
                type="number"
                min="0"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className={`form-control-enhanced ${validationErrors.budget ? "is-invalid" : ""}`}
              />
              {validationErrors.budget && <span className="error-message">{validationErrors.budget}</span>}
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

export default EvenementForm;
