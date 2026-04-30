import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Form, Button, Spinner } from "react-bootstrap";
import { Building, CreditCard, Hash, FileText } from "lucide-react";

const EMPLOYES_API = "http://127.0.0.1:8000/api/employes-options";

const DemandeAttestationForm = ({ onSubmit, onCancel, initialData }) => {
  const [employes, setEmployes] = useState([]);
  const [formData, setFormData] = useState({
    employe: initialData?.employe || "",
    type_attestation: initialData?.type_attestation || initialData?.type || "",
    langue: initialData?.langue || "francais",
    date: initialData?.date || initialData?.date_souhaitee || "",
    destinataire: initialData?.destinataire || "",
    commentaire: initialData?.commentaire || "",
    statut: initialData?.statut || "En attente",
  });
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!String(formData.employe).trim()) errors.employe = "L'employe est requis";
    if (!String(formData.type_attestation).trim()) errors.type_attestation = "Le type est requis";
    if (!String(formData.langue).trim()) errors.langue = "La langue est requise";
    if (!String(formData.date).trim()) errors.date = "La date est requise";
    if (!String(formData.destinataire).trim()) errors.destinataire = "Le destinataire est requis";
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
          <h5>{initialData ? "Modifier Demande Attestation" : "Ajouter Demande Attestation"}</h5>
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
                  <option key={emp.id} value={`${emp.nom || ""} ${emp.prenom || ""}`.trim()}>
                    {[emp.nom, emp.prenom].filter(Boolean).join(" ")}
                  </option>
                ))}
              </Form.Select>
              {validationErrors.employe && <span className="error-message">{validationErrors.employe}</span>}
            </div>

            <div className="form-group-wrapper">
              <Form.Label className="form-label-enhanced">
                <CreditCard size={16} className="icon-accent" />
                Type attestation
              </Form.Label>
              <Form.Select
                name="type_attestation"
                value={formData.type_attestation}
                onChange={handleChange}
                className={`form-control-enhanced ${validationErrors.type_attestation ? "is-invalid" : ""}`}
              >
                <option value="">Selectionner</option>
                <option value="travail">Travail</option>
                <option value="salaire">Salaire</option>
                <option value="autre">Autre</option>
              </Form.Select>
              {validationErrors.type_attestation && <span className="error-message">{validationErrors.type_attestation}</span>}
            </div>

            <div className="form-group-wrapper">
              <Form.Label className="form-label-enhanced">
                <CreditCard size={16} className="icon-accent" />
                Langue
              </Form.Label>
              <Form.Select
                name="langue"
                value={formData.langue}
                onChange={handleChange}
                className={`form-control-enhanced ${validationErrors.langue ? "is-invalid" : ""}`}
              >
                <option value="">Selectionner</option>
                <option value="francais">Francais</option>
                <option value="arabe">Arabe</option>
              </Form.Select>
              {validationErrors.langue && <span className="error-message">{validationErrors.langue}</span>}
            </div>

            <div className="form-group-wrapper">
              <Form.Label className="form-label-enhanced">
                <Hash size={16} className="icon-accent" />
                Date
              </Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`form-control-enhanced ${validationErrors.date ? "is-invalid" : ""}`}
              />
              {validationErrors.date && <span className="error-message">{validationErrors.date}</span>}
            </div>

            <div className="form-group-wrapper">
              <Form.Label className="form-label-enhanced">
                <FileText size={16} className="icon-accent" />
                Destinataire
              </Form.Label>
              <Form.Control
                type="text"
                name="destinataire"
                value={formData.destinataire}
                onChange={handleChange}
                className={`form-control-enhanced ${validationErrors.destinataire ? "is-invalid" : ""}`}
                placeholder="Destinataire..."
              />
              {validationErrors.destinataire && <span className="error-message">{validationErrors.destinataire}</span>}
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
                placeholder="Informations complementaires..."
              />
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

export default DemandeAttestationForm;
