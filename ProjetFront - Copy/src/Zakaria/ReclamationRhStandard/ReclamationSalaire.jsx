import React, { useEffect, useState } from "react";
import axios from "axios";
import SocieteCrudPage from "../Standardized/SocieteCrudPage";
import ReclamationForm from "./ReclamationForm";

const API = "http://127.0.0.1:8000/api/reclamations-salaire";
const EMPLOYES_API = "http://127.0.0.1:8000/api/employes-options";
const STORAGE_BASE_URL = "http://127.0.0.1:8000";

const getEmployeLabel = (employe) => {
  if (!employe) return "";
  return [employe.nom, employe.prenom].filter(Boolean).join(" ").trim();
};

const buildEmployeFilterOptions = (employes) =>
  [...new Set(employes.map(getEmployeLabel).filter(Boolean))].map((label) => ({
    value: label,
    label,
  }));

const parseMonthValue = (value) => {
  if (!value) return Number.NaN;
  const timestamp = new Date(`${value}-01`).getTime();
  return Number.isNaN(timestamp) ? Number.NaN : timestamp;
};

const resolveAttachmentUrl = (item) => {
  const rawValue = item?.piece_jointe_url || item?.piece_jointe;
  if (!rawValue) return "";

  const value = String(rawValue).trim();
  if (!value) return "";

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  if (value.startsWith("/storage/")) {
    return `${STORAGE_BASE_URL}${value}`;
  }

  const cleanedPath = value.replace(/^\/+/, "").replace(/^storage\//, "");
  return `${STORAGE_BASE_URL}/storage/${cleanedPath}`;
};

const getAttachmentName = (item) => {
  if (item?.piece_jointe_nom) {
    return String(item.piece_jointe_nom).trim();
  }

  const rawValue = item?.piece_jointe || item?.piece_jointe_url;
  if (!rawValue) return "";

  const value = String(rawValue).trim();
  if (!value) return "";

  const cleanValue = value.split("?")[0].split("#")[0];
  const segments = cleanValue.split("/").filter(Boolean);
  return segments.length ? decodeURIComponent(segments[segments.length - 1]) : "";
};

const renderAttachmentLink = (item) => {
  const url = resolveAttachmentUrl(item);
  if (!url) return "-";
  const attachmentName = getAttachmentName(item) || "Fichier joint";
  const fileName = attachmentName.toLowerCase();
  const isPdf = fileName.endsWith(".pdf");
  const isImage = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg"].some((extension) => fileName.endsWith(extension));

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(event) => event.stopPropagation()}
      title={attachmentName}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        maxWidth: "220px",
        color: "#334155",
        textDecoration: "none",
      }}
    >
      {isPdf ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 2v6h6" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 15h8M8 11h3M8 19h6" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ) : isImage ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" stroke="#2563eb" strokeWidth="2" />
          <circle cx="9" cy="10" r="1.5" fill="#2563eb" />
          <path d="M21 16l-5-5-6 6-2-2-5 5" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 2v6h6" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: "190px",
          fontSize: "0.9rem",
        }}
      >
        {attachmentName}
      </span>
    </a>
  );
};

const ReclamationSalaire = () => {
  const [employes, setEmployes] = useState([]);
  const reclamationFilters = [
    {
      key: "employe_label",
      label: "Employe",
      placeholder: "Tous les employes",
      options: buildEmployeFilterOptions(employes),
    },
    {
      key: "mois_concerne",
      label: "Mois concerne",
      type: "range",
      inputType: "month",
      placeholderMin: "Du",
      placeholderMax: "Au",
      parseRangeValue: parseMonthValue,
    },
    {
      key: "type_probleme",
      label: "Type probleme",
      placeholder: "Tous les types",
      options: [
        { value: "retard_paiement", label: "Retard paiement" },
        { value: "prime_non_versee", label: "Prime non versee" },
        { value: "erreur_bulletin", label: "Erreur bulletin" },
        { value: "autre", label: "Autre" },
      ],
    },
    {
      key: "statut",
      label: "Statut",
      placeholder: "Tous les statuts",
      options: ["En attente", "En cours", "Resolue", "Rejetee"],
    },
  ];

  const renderStatusBadge = (value) => {
    const normalized = String(value || "").trim().toLowerCase();

    const stylesByStatus = {
      "en attente": { label: "En attente", color: "#9a6700", backgroundColor: "#fff3cd" },
      "en cours": { label: "En cours", color: "#1d4ed8", backgroundColor: "#dbeafe" },
      "resolue": { label: "Resolue", color: "#166534", backgroundColor: "#dcfce7" },
      "résolue": { label: "Resolue", color: "#166534", backgroundColor: "#dcfce7" },
      "rejetee": { label: "Rejetee", color: "#b91c1c", backgroundColor: "#fee2e2" },
      "rejetée": { label: "Rejetee", color: "#b91c1c", backgroundColor: "#fee2e2" },
    };

    const statusStyle = stylesByStatus[normalized] || {
      label: value || "-",
      color: "#475569",
      backgroundColor: "#e2e8f0",
    };

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: "92px",
          padding: "5px 12px",
          borderRadius: "999px",
          fontSize: "0.78rem",
          fontWeight: 700,
          lineHeight: 1.2,
          color: statusStyle.color,
          backgroundColor: statusStyle.backgroundColor,
        }}
      >
        {statusStyle.label}
      </span>
    );
  };

  const loadEmployes = async () => {
    const empRes = await axios.get(EMPLOYES_API);
    setEmployes(Array.isArray(empRes.data) ? empRes.data : []);
  };

  useEffect(() => {
    loadEmployes();
  }, []);

  const getEmployeDisplay = (item) => {
    if (item?.employe && typeof item.employe === "object") {
      return getEmployeLabel(item.employe) || item.employe.id || "-";
    }

    const employe = employes.find((emp) => emp.id === item?.employe_id);
    return employe ? getEmployeLabel(employe) : item?.employe_id ?? "-";
  };

  const normalizePayload = (payload) => ({
    employe_id: payload.employe,
    mois_concerne: payload.mois_concerne,
    type_probleme: payload.type_reclamation,
    description: payload.description,
    piece_jointe: payload.piece_jointe,
    statut: payload.statut,
  });

  const normalizeItem = (item) => ({
    ...item,
    employe_id: item?.employe_id ?? item?.employe?.id ?? "",
    employe_label: getEmployeDisplay(item),
    piece_jointe_url: resolveAttachmentUrl(item),
  });

  const fetchItems = async () => {
    const response = await axios.get(API);
    return Array.isArray(response.data) ? response.data.map(normalizeItem) : [];
  };

  const createItem = async (payload) => {
    await axios.post(API, normalizePayload(payload), {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  };

  const updateItem = async (id, payload) => {
    const formData = normalizePayload(payload);
    formData._method = "PUT";

    await axios.post(`${API}/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  };

  const deleteItem = async (id) => {
    await axios.delete(`${API}/${id}`);
  };

  return (
    <SocieteCrudPage
      pageTitle="Liste des reclamations salaire"
      detailsTitle="Details Reclamation Salaire"
      addButtonLabel="Ajouter une reclamation"
      countLabelSingular="reclamation"
      countLabelPlural="reclamations"
      FormComponent={ReclamationForm}
      fetchItems={fetchItems}
      createItem={createItem}
      updateItem={updateItem}
      deleteItem={deleteItem}
      exportName="reclamations-salaire"
      filterStyleVariant="equipements"
      searchKeys={["employe_label", "mois_concerne", "type_probleme", "description", "piece_jointe", "statut"]}
      extraFilters={reclamationFilters}
      columns={[
        { key: "employe_label", label: "Employe", render: (item) => getEmployeDisplay(item) },
        { key: "mois_concerne", label: "Mois concerne" },
        { key: "type_probleme", label: "Type probleme" },
        { key: "description", label: "Description" },
        { key: "piece_jointe", label: "Piece jointe", render: (item) => renderAttachmentLink(item) },
        { key: "statut", label: "Statut", render: (item) => renderStatusBadge(item.statut) },
      ]}
    />
  );
};

export default ReclamationSalaire;
