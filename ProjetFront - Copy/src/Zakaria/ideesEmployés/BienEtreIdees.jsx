import React, { useState } from "react";
import BienEtreIdeeForm from "./BienEtreIdeeForm";
import SocieteCrudPage from "../Standardized/SocieteCrudPage";
import { renderBadge } from "../Standardized/badges";

const RAW_API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_BASE_URL = RAW_API_BASE_URL.endsWith("/api")
  ? RAW_API_BASE_URL
  : `${RAW_API_BASE_URL.replace(/\/$/, "")}/api`;
const STORAGE_BASE_URL = API_BASE_URL.replace(/\/api$/, "");

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

const normalizeIdeas = (items) =>
  items.map((item) => ({
    ...item,
    votes: Number(item?.votes || 0),
    pdfName:
      item?.pdfName ||
      item?.pdf_name ||
      item?.file_name ||
      "",
    pdfDataUrl:
      item?.pdfDataUrl ||
      item?.pdf_url ||
      item?.pdfUrl ||
      item?.file_url ||
      item?.pdf ||
      "",
    urgence: item?.urgence || "Normal",
    status: item?.status || "En attente",
  }));

const resolvePdfHref = (value) => {
  const rawValue = String(value || "").trim();
  if (!rawValue) return "";
  if (rawValue.startsWith("data:application/pdf")) return rawValue;
  if (rawValue.startsWith("blob:")) return rawValue;
  if (rawValue.startsWith("http://") || rawValue.startsWith("https://")) return rawValue;
  if (rawValue.startsWith("/storage/")) return `${STORAGE_BASE_URL}${rawValue}`;
  if (rawValue.startsWith("storage/")) return `${STORAGE_BASE_URL}/${rawValue}`;

  return `${STORAGE_BASE_URL}/storage/${rawValue.replace(/^\/+/, "").replace(/^storage\//, "")}`;
};

const openPdfInNewTab = async (pdfHref) => {
  if (!pdfHref) return;

  if (!pdfHref.startsWith("data:application/pdf")) {
    window.open(pdfHref, "_blank", "noopener,noreferrer");
    return;
  }

  try {
    const response = await fetch(pdfHref);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  } catch (error) {
    window.open(pdfHref, "_blank", "noopener,noreferrer");
  }
};

const renderPdfLink = (item) => {
  const pdfHref = resolvePdfHref(item?.pdfDataUrl);
  const pdfName =
    item?.pdfName ||
    (() => {
      const cleanValue = String(pdfHref || "").split("?")[0].split("#")[0];
      const segments = cleanValue.split("/").filter(Boolean);
      return segments.length ? decodeURIComponent(segments[segments.length - 1]) : "";
    })();

  if (!pdfHref) {
    return pdfName || "-";
  }

  const handlePdfClick = async (event) => {
    event.stopPropagation();
    event.preventDefault();
    await openPdfInNewTab(pdfHref);
  };

  return (
    <a
      href={pdfHref}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handlePdfClick}
      title={pdfName || "Fichier joint"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        maxWidth: "220px",
        color: "#334155",
        textDecoration: "none",
        cursor: "pointer",
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 2v6h6" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 15h8M8 11h3M8 19h6" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span
        style={{
          display: "inline-block",
          maxWidth: "190px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {pdfName || "Fichier PDF"}
      </span>
    </a>
  );
};

const BienEtreIdees = () => {
  const [typeOptions, setTypeOptions] = useState([]);

  const bienEtreFilters = [
    {
      key: "type",
      label: "Type",
      placeholder: "Tous les types",
      options: typeOptions,
    },
    {
      key: "urgence",
      label: "Urgence",
      placeholder: "Toutes les urgences",
      options: ["Faible", "Normal", "Urgent"],
    },
    {
      key: "status",
      label: "Statut",
      placeholder: "Tous les statuts",
      options: ["En attente", "Validee", "Refusee"],
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
    const response = await fetch(`${API_BASE_URL}/bien-etre-idees`);
    const items = normalizeIdeas(await parseResponse(response, "Erreur lors de la recuperation des idees"));
    setTypeOptions(buildFilterOptions(items, "type"));
    return items.sort((first, second) => (second.votes || 0) - (first.votes || 0));
  };

  const createItem = async (payload) => {
    const response = await fetch(`${API_BASE_URL}/bien-etre-idees`, {
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

    await parseResponse(response, "Erreur lors de la creation de l'idee");
  };

  const updateItem = async (id, payload) => {
    const response = await fetch(`${API_BASE_URL}/bien-etre-idees/${id}`, {
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

    await parseResponse(response, "Erreur lors de la mise a jour de l'idee");
  };

  const deleteItem = async (id) => {
    const response = await fetch(`${API_BASE_URL}/bien-etre-idees/${id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    });

    await parseResponse(response, "Erreur lors de la suppression de l'idee");
  };

  return (
    <SocieteCrudPage
      pageTitle="Bien-etre"
      detailsTitle="Details Idees Bien-etre"
      addButtonLabel="Ajouter une idee"
      countLabelSingular="idee"
      countLabelPlural="idees"
      FormComponent={BienEtreIdeeForm}
      fetchItems={fetchItems}
      createItem={createItem}
      updateItem={updateItem}
      deleteItem={deleteItem}
      exportName="bien-etre-idees"
      filterStyleVariant="equipements"
      searchKeys={["titre", "description", "type", "budget", "urgence", "pdfName", "votes", "status"]}
      extraFilters={bienEtreFilters}
      columns={[
        { key: "titre", label: "Titre" },
        { key: "description", label: "Description" },
        { key: "type", label: "Type" },
        { key: "budget", label: "Budget" },
        { key: "urgence", label: "Urgence", render: (item) => renderBadge(item.urgence) },
        { key: "pdfName", label: "PDF", render: (item) => renderPdfLink(item) },
        { key: "votes", label: "Votes" },
        { key: "status", label: "Statut", render: (item) => renderBadge(item.status) },
      ]}
    />
  );
};

export default BienEtreIdees;
