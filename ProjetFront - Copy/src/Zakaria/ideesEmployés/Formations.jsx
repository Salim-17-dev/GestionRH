import React, { useState } from "react";
import FormationForm from "./FormationForm";
import SocieteCrudPage from "../Standardized/SocieteCrudPage";
import { renderBadge } from "../Standardized/badges";

const RAW_API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_BASE_URL = RAW_API_BASE_URL.endsWith("/api")
  ? RAW_API_BASE_URL
  : `${RAW_API_BASE_URL.replace(/\/$/, "")}/api`;

const parseResponse = async (response, fallbackMessage) => {
  let json = null;

  try {
    json = await response.json();
  } catch (error) {
    json = null;
  }

  if (!response.ok) {
    throw new Error(json?.message || fallbackMessage);
  }

  return json?.data ?? json;
};

const buildFilterOptions = (items, key) =>
  [...new Set(items.map((item) => String(item?.[key] ?? "").trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({
      value,
      label: value,
    }));

const parseNumberValue = (value) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? Number.NaN : parsed;
};

const normalizeFormations = (items) =>
  items.map((item) => ({
    ...item,
    votes: Number(item?.votes || 0),
    status: item?.status || "En attente",
  }));

const Formations = () => {
  const [domaineOptions, setDomaineOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);

  const formationFilters = [
    {
      key: "domaine",
      label: "Domaine",
      placeholder: "Tous les domaines",
      options: domaineOptions,
    },
    {
      key: "type",
      label: "Type",
      placeholder: "Tous les types",
      options: typeOptions,
    },
    {
      key: "status",
      label: "Statut",
      placeholder: "Tous les statuts",
      options: ["En attente", "Acceptee", "Refusee"],
    },
    {
      key: "votes",
      label: "Votes",
      type: "range",
      placeholderMin: "Min",
      placeholderMax: "Max",
      parseRangeValue: parseNumberValue,
    },
  ];

  const fetchItems = async () => {
    const response = await fetch(`${API_BASE_URL}/formations`);
    const items = normalizeFormations(await parseResponse(response, "Erreur lors de la recuperation des formations"));
    setDomaineOptions(buildFilterOptions(items, "domaine"));
    setTypeOptions(buildFilterOptions(items, "type"));
    return items.sort((first, second) => (second.votes || 0) - (first.votes || 0));
  };

  const createItem = async (payload) => {
    const response = await fetch(`${API_BASE_URL}/formations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        ...payload,
        votes: Number(payload?.votes || 0),
      }),
    });

    await parseResponse(response, "Erreur lors de la creation de la formation");
  };

  const updateItem = async (id, payload) => {
    const response = await fetch(`${API_BASE_URL}/formations/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        ...payload,
        votes: Number(payload?.votes || 0),
      }),
    });

    await parseResponse(response, "Erreur lors de la mise a jour de la formation");
  };

  const deleteItem = async (id) => {
    const response = await fetch(`${API_BASE_URL}/formations/${id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    });

    await parseResponse(response, "Erreur lors de la suppression de la formation");
  };

  return (
    <SocieteCrudPage
      pageTitle="Formation"
      detailsTitle="Details Formations"
      addButtonLabel="Ajouter une formation"
      countLabelSingular="formation"
      countLabelPlural="formations"
      FormComponent={FormationForm}
      fetchItems={fetchItems}
      createItem={createItem}
      updateItem={updateItem}
      deleteItem={deleteItem}
      exportName="bien-etre-formations"
      filterStyleVariant="equipements"
      searchKeys={["titre", "description", "domaine", "duree", "type", "votes", "status"]}
      extraFilters={formationFilters}
      columns={[
        { key: "titre", label: "Titre" },
        { key: "description", label: "Description" },
        { key: "domaine", label: "Domaine" },
        { key: "duree", label: "Duree" },
        { key: "type", label: "Type" },
        { key: "votes", label: "Votes" },
        { key: "status", label: "Statut", render: (item) => renderBadge(item.status) },
      ]}
    />
  );
};

export default Formations;
