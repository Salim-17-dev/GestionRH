import React, { useEffect, useState } from "react";
import axios from "axios";
import AffectationForm from "./AffectationForm";
import SocieteCrudPage from "../Standardized/SocieteCrudPage";
import { renderBadge } from "../Standardized/badges";

const AFFECTATIONS_API = "http://127.0.0.1:8000/api/affectations";
const EQUIPEMENTS_API = "http://127.0.0.1:8000/api/equipements";
const EMPLOYES_API = "http://127.0.0.1:8000/api/employes-options";

const employeeLabel = (employe) => {
  if (!employe) return "";
  return `${employe.nom || ""} ${employe.prenom || ""}`.trim();
};

const buildFilterOptions = (items, key) =>
  [...new Set(items.map((item) => String(item?.[key] ?? "").trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({
      value,
      label: value,
    }));

const parseDateValue = (value) => {
  if (!value) return Number.NaN;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? Number.NaN : timestamp;
};

const Affectations = () => {
  const [employes, setEmployes] = useState([]);
  const [equipements, setEquipements] = useState([]);
  const [employeOptions, setEmployeOptions] = useState([]);
  const [equipementOptions, setEquipementOptions] = useState([]);

  const affectationFilters = [
    {
      key: "employe_label",
      label: "Employe",
      placeholder: "Tous les employes",
      options: employeOptions,
    },
    {
      key: "equipement_label",
      label: "Equipement",
      placeholder: "Tous les equipements",
      options: equipementOptions,
    },
    {
      key: "date_attribution",
      label: "Date",
      type: "range",
      inputType: "date",
      placeholderMin: "Du",
      placeholderMax: "Au",
      getValue: (item) => item.date_attribution,
      parseRangeValue: parseDateValue,
    },
    {
      key: "etat",
      label: "Etat",
      placeholder: "Tous les etats",
      options: ["Bon", "Neuf", "Endommage", "Usage"],
    },
    {
      key: "statut",
      label: "Statut",
      placeholder: "Tous les statuts",
      options: ["Disponible", "Affecte"],
    },
  ];

  const loadSupportingData = async () => {
    const [empRes, eqRes] = await Promise.all([axios.get(EMPLOYES_API), axios.get(EQUIPEMENTS_API)]);
    setEmployes(Array.isArray(empRes.data) ? empRes.data : []);
    setEquipements(Array.isArray(eqRes.data) ? eqRes.data : []);
  };

  useEffect(() => {
    loadSupportingData();
  }, []);

  const fetchItems = async () => {
    const response = await axios.get(AFFECTATIONS_API);
    const items = (Array.isArray(response.data) ? response.data : []).map((item) => ({
      ...item,
      employe_label: employeeLabel(item.employe),
      equipement_label: item.equipement?.designation || "",
      etat: item.equipement?.etat || item.etat,
      statut: item.equipement?.statut || "Affecte",
    }));
    setEmployeOptions(buildFilterOptions(items, "employe_label"));
    setEquipementOptions(buildFilterOptions(items, "equipement_label"));
    return items;
  };

  const createItem = async (payload) => {
    await axios.post(AFFECTATIONS_API, payload);
    await loadSupportingData();
  };

  const updateItem = async (id, payload) => {
    await axios.put(`${AFFECTATIONS_API}/${id}`, payload);
    await loadSupportingData();
  };

  const deleteItem = async (id) => {
    await axios.delete(`${AFFECTATIONS_API}/${id}`);
    await loadSupportingData();
  };

  return (
    <SocieteCrudPage
      pageTitle="Affectations des equipements"
      detailsTitle="Details Affectations"
      addButtonLabel="Ajouter une affectation"
      countLabelSingular="affectation"
      countLabelPlural="affectations"
      FormComponent={AffectationForm}
      formProps={{ employes, equipements }}
      fetchItems={fetchItems}
      createItem={createItem}
      updateItem={updateItem}
      deleteItem={deleteItem}
      exportName="affectations"
      filterStyleVariant="equipements"
      searchKeys={["employe_label", "equipement_label", "date_attribution", "etat", "statut", "commentaire"]}
      extraFilters={affectationFilters}
      columns={[
        { key: "employe_label", label: "Employe" },
        { key: "equipement_label", label: "Equipement" },
        { key: "date_attribution", label: "Date" },
        { key: "etat", label: "Etat", render: (item) => renderBadge(item.etat) },
        { key: "statut", label: "Statut", render: (item) => renderBadge(item.statut) },
        { key: "commentaire", label: "Commentaire" },
      ]}
    />
  );
};

export default Affectations;

