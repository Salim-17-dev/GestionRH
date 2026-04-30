import React, { useEffect, useState } from "react";
import axios from "axios";
import SocieteCrudPage from "../Standardized/SocieteCrudPage";
import { renderBadge } from "../Standardized/badges";
import DemandeAdminForm from "./DemandeAdminForm";

const API = "http://127.0.0.1:8000/api/demandes-administration";
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

const DemandeAdministration = () => {
  const [employes, setEmployes] = useState([]);
  const demandeFilters = [
    {
      key: "employe_label",
      label: "Employe",
      placeholder: "Tous les employes",
      options: buildEmployeFilterOptions(employes),
    },
    {
      key: "type_demande",
      label: "Type",
      placeholder: "Tous les types",
      options: [
        { value: "salaire", label: "Salaire" },
        { value: "avance", label: "Avance salaire" },
        { value: "conge", label: "Conge exceptionnel" },
        { value: "autre", label: "Autre demande" },
      ],
    },
    {
      key: "date_demande",
      label: "Date",
      type: "range",
      inputType: "date",
      placeholderMin: "Du",
      placeholderMax: "Au",
      getValue: (item) => item.date_demande,
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
    return (Array.isArray(response.data) ? response.data : []).map((item) => ({
      ...item,
      employe_label: getEmployeNom(item.employe),
    }));
  };

  const createItem = async (payload) => {
    await axios.post(API, payload);
  };

  const updateItem = async (id, payload) => {
    await axios.put(`${API}/${id}`, payload);
  };

  const deleteItem = async (id) => {
    await axios.delete(`${API}/${id}`);
  };

  return (
    <SocieteCrudPage
      pageTitle="Liste des demandes administratives"
      detailsTitle="Details Demande Administrative"
      addButtonLabel="Ajouter une demande"
      countLabelSingular="demande"
      countLabelPlural="demandes"
      FormComponent={DemandeAdminForm}
      fetchItems={fetchItems}
      createItem={createItem}
      updateItem={updateItem}
      deleteItem={deleteItem}
      exportName="demandes-administration"
      filterStyleVariant="equipements"
      searchKeys={["employe_label", "type_demande", "montant", "date_demande", "justification", "statut", "commentaire"]}
      extraFilters={demandeFilters}
      columns={[
        { key: "employe_label", label: "Employe", render: (item) => getEmployeNom(item.employe) },
        { key: "type_demande", label: "Type" },
        { key: "montant", label: "Montant" },
        { key: "date_demande", label: "Date" },
        { key: "justification", label: "Justification" },
        { key: "statut", label: "Statut", render: (item) => renderBadge(item.statut) },
        { key: "commentaire", label: "Commentaire" },
      ]}
    />
  );
};

export default DemandeAdministration;
