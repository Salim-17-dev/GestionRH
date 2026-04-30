import React, { useState } from "react";
import EvenementForm from "./EvenementForm";
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

const normalizeEvenements = (items) =>
  items.map((item) => ({
    ...item,
    budget: Number(item?.budget || 0),
    status: item?.status || "En attente",
  }));

const Evenements = () => {
  const [typeOptions, setTypeOptions] = useState([]);
  const [lieuOptions, setLieuOptions] = useState([]);

  const evenementFilters = [
    {
      key: "type",
      label: "Type",
      placeholder: "Tous les types",
      options: typeOptions,
    },
    {
      key: "lieu",
      label: "Lieu",
      placeholder: "Tous les lieux",
      options: lieuOptions,
    },
    {
      key: "status",
      label: "Statut",
      placeholder: "Tous les statuts",
      options: ["En attente", "Acceptee", "Refusee", "Completee"],
    },
    {
      key: "budget",
      label: "Budget",
      type: "range",
      placeholderMin: "Min",
      placeholderMax: "Max",
      parseRangeValue: parseNumberValue,
    },
  ];

  const fetchItems = async () => {
    const response = await fetch(`${API_BASE_URL}/evenements`);
    const items = normalizeEvenements(await parseResponse(response, "Erreur lors de la recuperation des evenements"));
    setTypeOptions(buildFilterOptions(items, "type"));
    setLieuOptions(buildFilterOptions(items, "lieu"));
    return items.sort((first, second) => (second.budget || 0) - (first.budget || 0));
  };

  const createItem = async (payload) => {
    const response = await fetch(`${API_BASE_URL}/evenements`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        ...payload,
        budget: Number(payload?.budget || 0),
      }),
    });

    await parseResponse(response, "Erreur lors de la creation de l'evenement");
  };

  const updateItem = async (id, payload) => {
    const response = await fetch(`${API_BASE_URL}/evenements/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        ...payload,
        budget: Number(payload?.budget || 0),
      }),
    });

    await parseResponse(response, "Erreur lors de la mise a jour de l'evenement");
  };

  const deleteItem = async (id) => {
    const response = await fetch(`${API_BASE_URL}/evenements/${id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    });

    await parseResponse(response, "Erreur lors de la suppression de l'evenement");
  };

  return (
    <SocieteCrudPage
      pageTitle="Evenements"
      detailsTitle="Details Evenements"
      addButtonLabel="Ajouter un evenement"
      countLabelSingular="evenement"
      countLabelPlural="evenements"
      FormComponent={EvenementForm}
      fetchItems={fetchItems}
      createItem={createItem}
      updateItem={updateItem}
      deleteItem={deleteItem}
      exportName="bien-etre-evenements"
      filterStyleVariant="equipements"
      searchKeys={["titre", "description", "type", "date", "lieu", "budget", "status"]}
      extraFilters={evenementFilters}
      columns={[
        { key: "titre", label: "Titre" },
        { key: "description", label: "Description" },
        { key: "type", label: "Type" },
        { key: "date", label: "Date" },
        { key: "lieu", label: "Lieu" },
        { key: "budget", label: "Budget" },
        { key: "status", label: "Status", render: (item) => renderBadge(item.status) },
      ]}
    />
  );
};

export default Evenements;
