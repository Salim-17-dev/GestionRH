import React, { useEffect, useState } from "react";
import axios from "axios";
import SocieteCrudPage from "../Standardized/SocieteCrudPage";
import { renderBadge } from "../Standardized/badges";
import DemandeAttestationForm from "./DemandeAttestationForm";

const API = "http://127.0.0.1:8000/api/demandes-attestation";
const EMPLOYES_API = "http://127.0.0.1:8000/api/employes-options"; 

const getEmployeLabel = (employe) => {
  if (!employe) return "";
  return [employe.nom, employe.prenom].filter(Boolean).join(" ").trim();
};

const buildEmployeFilterOptions = (employes) =>
  [...new Set(employes.map(getEmployeLabel).filter(Boolean))].map((label) => ({
    value: label,
    label,
  }));

const parseDateValue = (value) => {
  if (!value) return Number.NaN;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? Number.NaN : timestamp;
};

const DemandeAttestation = () => {
  const [employes, setEmployes] = useState([]);
  const demandeFilters = [
    {
      key: "employe_label",
      label: "Employe",
      placeholder: "Tous les employes",
      options: buildEmployeFilterOptions(employes),
    },
    {
      key: "type_attestation",
      label: "Type attestation",
      placeholder: "Tous les types",
      options: [
        { value: "travail", label: "Travail" },
        { value: "salaire", label: "Salaire" },
        { value: "autre", label: "Autre" },
      ],
    },
    {
      key: "date",
      label: "Date",
      type: "range",
      inputType: "date",
      placeholderMin: "Du",
      placeholderMax: "Au",
      getValue: (item) => item.date,
      parseRangeValue: parseDateValue,
    },
    {
      key: "statut",
      label: "Statut",
      placeholder: "Tous les statuts",
      options: ["En attente", "Validee", "Refusee", "Traitee"],
    },
  ];

  const loadEmployes = async () => {
    const empRes = await axios.get(EMPLOYES_API);
    setEmployes(Array.isArray(empRes.data) ? empRes.data : []);
  };

  useEffect(() => {
    loadEmployes();
  }, []);

  const getEmployeNom = (id) => {
    const emp = employes.find((e) => e.id === id);
    return emp ? getEmployeLabel(emp) || emp.nom : id;
  };

  const fetchItems = async () => {
    const response = await axios.get(API);
    const list = Array.isArray(response.data) ? response.data : [];
    return list.map((item) => ({
      ...item,
      employe_label: getEmployeNom(item.employe),
      type_attestation: item.type,
      date: item.date_souhaitee,
    }));
  };

  const toApiPayload = (payload) => ({
    employe: payload.employe,
    type: payload.type_attestation,
    langue: payload.langue || "francais",
    destinataire: payload.destinataire || "Administration",
    date_souhaitee: payload.date,
    commentaire: payload.commentaire || "",
    statut: payload.statut,
  });

  const createItem = async (payload) => {
    await axios.post(API, toApiPayload(payload));
  };

  const updateItem = async (id, payload) => {
    await axios.put(`${API}/${id}`, toApiPayload(payload));
  };

  const deleteItem = async (id) => {
    await axios.delete(`${API}/${id}`);
  };

  return (
    <SocieteCrudPage
      pageTitle="Demandes d'attestation"
      detailsTitle="Details Demande Attestation"
      addButtonLabel="Ajouter une demande"
      countLabelSingular="demande"
      countLabelPlural="demandes"
      FormComponent={DemandeAttestationForm}
      fetchItems={fetchItems}
      createItem={createItem}
      updateItem={updateItem}
      deleteItem={deleteItem}
      exportName="demandes-attestation"
      filterStyleVariant="equipements"
      searchKeys={["employe_label", "type_attestation", "langue", "date", "destinataire", "commentaire", "statut"]}
      extraFilters={demandeFilters}
      columns={[
        { key: "employe_label", label: "Employe", render: (item) => getEmployeNom(item.employe) },
        { key: "type_attestation", label: "Type Attestation" },
        { key: "langue", label: "Langue" },
        { key: "date", label: "Date" },
        { key: "destinataire", label: "Destinataire" },
        { key: "commentaire", label: "Commentaire" },
        { key: "statut", label: "Statut", render: (item) => renderBadge(item.statut) },
      ]}
    />
  );
};

export default DemandeAttestation;
