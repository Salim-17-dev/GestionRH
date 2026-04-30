import React, { useEffect, useMemo, useState } from "react";
import { Card, Form, Button, Spinner } from "react-bootstrap";
import { Building, Hash, FileText, CreditCard } from "lucide-react";

const normalizeStatus = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const isAssignableEquipement = (equipement) => {
  const status = normalizeStatus(equipement?.statut);
  return status === "disponible";
};

const employeeLabel = (employe) => {
  if (!employe) return "EmployÃƒÂ© inconnu";
  const first = employe.prenom || "";
  const last = employe.nom || "";
  const full = `${first} ${last}`.trim();
  return full || `Employe #${employe.id}`;
};

const today = new Date().toISOString().slice(0, 10);

const toInitialState = (initialData) => ({
  employe_id: initialData?.employe_id ? String(initialData.employe_id) : "",
  equipement_id: initialData?.equipement_id ? String(initialData.equipement_id) : "",
  date_attribution: initialData?.date_attribution ? String(initialData.date_attribution).slice(0, 10) : today,
  commentaire: initialData?.commentaire ?? "",
});

const AffectationForm = ({ initialData, employes = [], equipements = [], onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState(toInitialState(initialData));
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    setFormData(toInitialState(initialData));
    setValidationErrors({});
    setError("");
  }, [initialData]);

  const equipementOptions = useMemo(() => {
    if (!initialData?.equipement_id) {
      return equipements.filter(isAssignableEquipement);
    }

    return equipements.filter((item) => isAssignableEquipement(item) || item.id === initialData.equipement_id);
  }, [equipements, initialData]);

  const selectedEquipement = useMemo(() => {
    if (!formData.equipement_id) return null;
    return equipementOptions.find((item) => Number(item.id) === Number(formData.equipement_id)) ?? null;
  }, [equipementOptions, formData.equipement_id]);

  const isValid = useMemo(() => {
    return Boolean(
      formData.employe_id &&
      formData.equipement_id &&
      formData.date_attribution
    );
  }, [formData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.employe_id) errors.employe_id = "L'employe est requis";
    if (!formData.equipement_id) errors.equipement_id = "L'equipement est requis";
    if (!formData.date_attribution) errors.date_attribution = "La date est requise";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;
    if (!validateForm()) return;

    try {
      await onSubmit({
        ...formData,
        employe_id: Number(formData.employe_id),
        equipement_id: Number(formData.equipement_id),
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
          <h5>{initialData ? "Modifier Affectation" : "Ajouter Affectation"}</h5>
        </div>

        <div className="societe-form-body">
          <Form onSubmit={handleSubmit}>
            <div className="form-group-wrapper">
              <Form.Label className="form-label-enhanced">
                <Building size={16} className="icon-accent" />
                Employe
              </Form.Label>
              <Form.Select
                name="employe_id"
                value={formData.employe_id}
                onChange={handleChange}
                className={`form-control-enhanced ${validationErrors.employe_id ? "is-invalid" : ""}`}
              >
                <option value="">Selectionner</option>
                {employes.map((employe) => (
                  <option key={employe.id} value={employe.id}>
                    {employeeLabel(employe)}
                  </option>
                ))}
              </Form.Select>
              {validationErrors.employe_id && <span className="error-message">{validationErrors.employe_id}</span>}
            </div>

            <div className="form-group-wrapper">
              <Form.Label className="form-label-enhanced">
                <Hash size={16} className="icon-accent" />
                Equipement
              </Form.Label>
              <Form.Select
                name="equipement_id"
                value={formData.equipement_id}
                onChange={handleChange}
                className={`form-control-enhanced ${validationErrors.equipement_id ? "is-invalid" : ""}`}
              >
                <option value="">Selectionner</option>
                {equipementOptions.map((equipement) => (
                  <option key={equipement.id} value={equipement.id}>
                    {equipement.designation} ({equipement.numero_serie})
                  </option>
                ))}
              </Form.Select>
              {validationErrors.equipement_id && <span className="error-message">{validationErrors.equipement_id}</span>}
              {selectedEquipement && (
                <span className="text-muted d-block mt-2" style={{ fontSize: "0.8rem" }}>
                  Etat catalogue: {selectedEquipement.etat || "Non renseigne"}
                </span>
              )}
            </div>

            <div className="form-group-wrapper">
              <Form.Label className="form-label-enhanced">
                <CreditCard size={16} className="icon-accent" />
                Date attribution
              </Form.Label>
              <Form.Control
                type="date"
                name="date_attribution"
                value={formData.date_attribution}
                onChange={handleChange}
                className={`form-control-enhanced ${validationErrors.date_attribution ? "is-invalid" : ""}`}
              />
              {validationErrors.date_attribution && <span className="error-message">{validationErrors.date_attribution}</span>}
            </div>

            <div className="form-group-wrapper">
              <Form.Label className="form-label-enhanced">
                <FileText size={16} className="icon-accent" />
                Commentaire
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="commentaire"
                value={formData.commentaire}
                onChange={handleChange}
                className="form-control-enhanced"
                placeholder="Entrez un commentaire"
              />
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

export default AffectationForm;

