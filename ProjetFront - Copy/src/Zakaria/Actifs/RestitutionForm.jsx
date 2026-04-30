import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Card, Form, Button, Spinner } from "react-bootstrap";
import { Building, Hash, FileText, CreditCard } from "lucide-react";

const ETATS_EQUIPEMENT = [
  { value: "Neuf", label: "Neuf" },
  { value: "Bon", label: "Bon" },
  { value: "Usage", label: "Usag\u00E9" },
  { value: "Endommage", label: "Endommag\u00E9" },
];

const RESTITUTION_STATUTS = [
  { value: "restitue", label: "Restitu\u00E9" },
  { value: "transfere", label: "Transf\u00E9r\u00E9" },
];

const ETATS_RESTITUTION = [
  { value: "en attente", label: "En attente" },
  { value: "valid\u00E9", label: "Valid\u00E9" },
];

const USER_API = "http://127.0.0.1:8000/api/user";

const normalizeEtat = (value) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (normalized === "valide" || normalized === "validee") {
    return "valid\u00E9";
  }

  return "en attente";
};

const normalizeStatus = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const isRestitutionEligibleEquipement = (equipement) => {
  const status = normalizeStatus(equipement?.statut);
  return status === "affecte";
};

const normalizeEquipementEtat = (value) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const matchedOption = ETATS_EQUIPEMENT.find((option) => {
    const optionValue = option.value
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return optionValue === normalized;
  });

  return matchedOption?.value ?? "";
};

const employeeLabel = (employe) => {
  if (!employe) return "EmployÃƒÂ© inconnu";
  const first = employe.prenom || "";
  const last = employe.nom || "";
  const full = `${first} ${last}`.trim();
  return full || `Employe #${employe.id}`;
};

const toDateInput = (value) => {
  if (!value) return "";
  return String(value).slice(0, 10);
};

const today = new Date().toISOString().slice(0, 10);

const toInitialState = (initialData) => ({
  equipement_id: initialData?.equipement_id ? String(initialData.equipement_id) : "",
  statut: initialData?.statut ?? "restitue",
  etat: normalizeEtat(initialData?.etat),
  date_retour: toDateInput(initialData?.date_retour) || today,
  etat_retour: normalizeEquipementEtat(initialData?.etat_retour),
  nouvel_employe_id: initialData?.nouvel_employe_id ? String(initialData.nouvel_employe_id) : "",
  date_transfert: toDateInput(initialData?.date_transfert) || today,
  commentaire: initialData?.commentaire ?? "",
});

const RestitutionForm = ({
  initialData,
  employes = [],
  assignedEquipements = [],
  affectationsByEquipement = {},
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState(toInitialState(initialData));
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setFormData(toInitialState(initialData));
    setValidationErrors({});
    setError("");
  }, [initialData]);

  useEffect(() => {
    let isMounted = true;

    const loadUserRole = async () => {
      try {
        const response = await axios.get(USER_API, { withCredentials: true });
        const roles = Array.isArray(response.data) ? response.data[0]?.roles : response.data?.roles;
        const roleNames = Array.isArray(roles)
          ? roles.map((role) => String(role?.name ?? role ?? "").trim().toLowerCase())
          : [];

        if (isMounted) {
          setIsAdmin(roleNames.includes("admin"));
        }
      } catch (fetchError) {
        if (isMounted) {
          setIsAdmin(false);
        }
      }
    };

    loadUserRole();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentAffectation = useMemo(() => {
    if (!formData.equipement_id) return null;
    return affectationsByEquipement[Number(formData.equipement_id)] ?? null;
  }, [formData.equipement_id, affectationsByEquipement]);

  const employeeOptions = useMemo(() => {
    const currentSelectedEmployee =
      initialData?.nouvelEmploye ||
      (initialData?.nouvel_employe_id
        ? {
            id: initialData.nouvel_employe_id,
            nom: initialData?.nouvelEmploye?.nom,
            prenom: initialData?.nouvelEmploye?.prenom,
          }
        : null);

    const mergedEmployees = [...employes, currentSelectedEmployee].filter(Boolean);
    const seen = new Set();

    return mergedEmployees.filter((employee) => {
      const employeeId = Number(employee.id);
      if (!employeeId || seen.has(employeeId)) return false;
      seen.add(employeeId);
      return true;
    });
  }, [employes, initialData]);

  const canEditEtat = Boolean(initialData?.id) && isAdmin;

  const equipementOptions = useMemo(() => {
    const currentEquipementId = Number(initialData?.equipement_id);

    return assignedEquipements.filter(
      (equipement) =>
        isRestitutionEligibleEquipement(equipement) ||
        (currentEquipementId && Number(equipement.id) === currentEquipementId)
    );
  }, [assignedEquipements, initialData]);

  const isValid = useMemo(() => {
    if (!formData.equipement_id || !formData.statut ) return false;
    if (formData.statut === "restitue") {
      return Boolean(formData.date_retour && formData.etat_retour);
    }
    return Boolean(formData.nouvel_employe_id && formData.date_transfert);
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
    if (!formData.equipement_id) errors.equipement_id = "L'equipement est requis";
    if (!formData.statut) errors.statut = "Le statut est requis";
    if (formData.statut === "restitue") {
      if (!formData.date_retour) errors.date_retour = "La date de retour est requise";
      if (!formData.etat_retour) errors.etat_retour = "L'etat retour est requis";
    }
    if (formData.statut === "transfere") {
      if (!formData.nouvel_employe_id) errors.nouvel_employe_id = "Le nouvel employe est requis";
      if (!formData.date_transfert) errors.date_transfert = "La date transfert est requise";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;
    if (!validateForm()) return;

    try {
      await onSubmit({
        equipement_id: Number(formData.equipement_id),
        statut: formData.statut,
        date_retour: formData.statut === "restitue" ? formData.date_retour : null,
        etat_retour: formData.statut === "restitue" ? formData.etat_retour : null,
        nouvel_employe_id: formData.statut === "transfere" ? Number(formData.nouvel_employe_id) : null,
        date_transfert: formData.statut === "transfere" ? formData.date_transfert : null,
        commentaire: formData.commentaire,
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

        .select-enhanced {
            min-height: 46px;
            padding-right: 2.75rem;
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            background-image: linear-gradient(45deg, transparent 50%, #6b7280 50%), linear-gradient(135deg, #6b7280 50%, transparent 50%);
            background-position: calc(100% - 18px) calc(50% - 3px), calc(100% - 12px) calc(50% - 3px);
            background-size: 6px 6px, 6px 6px;
            background-repeat: no-repeat;
        }

        .select-enhanced:disabled {
            background-color: #f9fafb;
            color: #6b7280;
            cursor: not-allowed;
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
          <h5>{initialData ? "Modifier Operation" : "Ajouter Operation"}</h5>
        </div>

        <div className="societe-form-body">
          <Form onSubmit={handleSubmit}>
            <div className="form-group-wrapper">
              <Form.Label className="form-label-enhanced">
                <Hash size={16} className="icon-accent" />
                Equipement affecte
              </Form.Label>
              <Form.Select
                name="equipement_id"
                value={formData.equipement_id}
                onChange={handleChange}
                className={`form-control-enhanced select-enhanced ${validationErrors.equipement_id ? "is-invalid" : ""}`}
              >
                <option value="">Selectionner</option>
                {equipementOptions.map((equipement) => (
                  <option key={equipement.id} value={equipement.id}>
                    {equipement.designation} ({equipement.numero_serie})
                  </option>
                ))}
              </Form.Select>
              {validationErrors.equipement_id && <span className="error-message">{validationErrors.equipement_id}</span>}
            </div>

            <div className="form-group-wrapper">
              <Form.Label className="form-label-enhanced">
                <Building size={16} className="icon-accent" />
                Employe actuel
              </Form.Label>
              <Form.Control
                className="form-control-enhanced"
                value={currentAffectation?.employe ? employeeLabel(currentAffectation.employe) : "Employe inconnu"}
                readOnly
              />
            </div>

            <div className="form-group-wrapper">
              <Form.Label className="form-label-enhanced">
                <CreditCard size={16} className="icon-accent" />
                Date attribution
              </Form.Label>
              <Form.Control className="form-control-enhanced" value={toDateInput(currentAffectation?.date_attribution)} readOnly />
            </div>

            <div className="form-group-wrapper">
              <Form.Label className="form-label-enhanced">
                <FileText size={16} className="icon-accent" />
                Statut
              </Form.Label>
              <Form.Select
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                className={`form-control-enhanced select-enhanced ${validationErrors.statut ? "is-invalid" : ""}`}
              >
                {RESTITUTION_STATUTS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </Form.Select>
              {validationErrors.statut && <span className="error-message">{validationErrors.statut}</span>}
            </div>

            

            {formData.statut === "restitue" ? (
              <>
                <div className="form-group-wrapper">
                  <Form.Label className="form-label-enhanced">
                    <CreditCard size={16} className="icon-accent" />
                    Date retour
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="date_retour"
                    value={formData.date_retour}
                    onChange={handleChange}
                    className={`form-control-enhanced ${validationErrors.date_retour ? "is-invalid" : ""}`}
                  />
                  {validationErrors.date_retour && <span className="error-message">{validationErrors.date_retour}</span>}
                </div>

                <div className="form-group-wrapper">
                  <Form.Label className="form-label-enhanced">
                    <FileText size={16} className="icon-accent" />
                    Etat retour
                  </Form.Label>
                  <Form.Select
                    name="etat_retour"
                    value={formData.etat_retour}
                    onChange={handleChange}
                    className={`form-control-enhanced select-enhanced ${validationErrors.etat_retour ? "is-invalid" : ""}`}
                  >
                    <option value="">Selectionner</option>
                    {ETATS_EQUIPEMENT.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                  {validationErrors.etat_retour && <span className="error-message">{validationErrors.etat_retour}</span>}
                </div>
              </>
            ) : (
              <>
                <div className="form-group-wrapper">
                  <Form.Label className="form-label-enhanced">
                    <Building size={16} className="icon-accent" />
                    Nouvel employe
                  </Form.Label>
                  <Form.Select
                    name="nouvel_employe_id"
                    value={formData.nouvel_employe_id}
                    onChange={handleChange}
                    className={`form-control-enhanced select-enhanced ${validationErrors.nouvel_employe_id ? "is-invalid" : ""}`}
                  >
                    <option value="">Selectionner</option>
                    {employeeOptions.map((employe) => (
                      <option key={employe.id} value={employe.id}>
                        {employeeLabel(employe)}
                      </option>
                    ))}
                  </Form.Select>
                  {validationErrors.nouvel_employe_id && <span className="error-message">{validationErrors.nouvel_employe_id}</span>}
                </div>

                <div className="form-group-wrapper">
                  <Form.Label className="form-label-enhanced">
                    <CreditCard size={16} className="icon-accent" />
                    Date transfert
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="date_transfert"
                    value={formData.date_transfert}
                    onChange={handleChange}
                    className={`form-control-enhanced ${validationErrors.date_transfert ? "is-invalid" : ""}`}
                  />
                  {validationErrors.date_transfert && <span className="error-message">{validationErrors.date_transfert}</span>}
                </div>
              </>
            )}

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

export default RestitutionForm;

