import React from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import DemandeMaterielForm from "./DemandeMaterielForm";
import { buildUniqueCategoryList, fetchEquipementCategories, mapCategoryOptions } from "./equipementCategories";
import SocieteCrudPage from "../Standardized/SocieteCrudPage";
import { renderBadge } from "../Standardized/badges";

const URGENCES = ["Faible", "Normal", "Urgent"];
const STORAGE_BASE_URL = "http://127.0.0.1:8000";
const TYPE_DEMANDEUR_LABELS = {
  employe: "Employe",
  service: "Service",
};

const API = "http://127.0.0.1:8000/api/demandes";

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

const resolveAttachmentUrl = (item) => {
  const rawValue = item?.piece_jointe_url || item?.piece_jointe;
  if (!rawValue) return "";

  const value = String(rawValue).trim();
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/storage/")) return `${STORAGE_BASE_URL}${value}`;

  const cleanedPath = value.replace(/^\/+/, "").replace(/^storage\//, "");
  return `${STORAGE_BASE_URL}/storage/${cleanedPath}`;
};

const getAttachmentName = (item) => {
  const rawValue = item?.piece_jointe_nom || item?.piece_jointe_url || item?.piece_jointe;
  if (!rawValue) return "";

  const normalizedValue = String(rawValue).trim();
  if (!normalizedValue) return "";

  const cleanValue = normalizedValue.split("?")[0].split("#")[0];
  const segments = cleanValue.split("/").filter(Boolean);
  return segments.length ? decodeURIComponent(segments[segments.length - 1]) : normalizedValue;
};

const renderAttachmentLink = (item) => {
  const attachmentUrl = resolveAttachmentUrl(item);
  if (!attachmentUrl) return "-";
  const attachmentName = getAttachmentName(item) || "Fichier joint";
  const fileName = attachmentName.toLowerCase();
  const isPdf = fileName.endsWith(".pdf");
  const isImage = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg"].some((extension) => fileName.endsWith(extension));

  return (
    <a
      href={attachmentUrl}
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

const normalizeDemandes = (items) =>
  items.map((item) => {
    const typeDemandeur = item?.type_demandeur || "employe";

    return {
      ...item,
      type_demandeur: typeDemandeur,
      type_demandeur_label: TYPE_DEMANDEUR_LABELS[typeDemandeur] || typeDemandeur,
      piece_jointe_url: resolveAttachmentUrl(item),
    };
  });

const Demandes = () => {
  const [demandeurOptions, setDemandeurOptions] = React.useState([]);
  const [equipementOptions, setEquipementOptions] = React.useState([]);
  const [categorieOptions, setCategorieOptions] = React.useState([]);
  const [typeDemandeurOptions, setTypeDemandeurOptions] = React.useState([]);
  const [managedCategoryNames, setManagedCategoryNames] = React.useState([]);
  const [itemCategoryNames, setItemCategoryNames] = React.useState([]);
  const [categoryModalTrigger, setCategoryModalTrigger] = React.useState(0);
  const [categoriesRefreshKey, setCategoriesRefreshKey] = React.useState(0);
  const demandeFilters = [
    {
      key: "type_demandeur_label",
      label: "Type demandeur",
      placeholder: "Tous les types",
      options: typeDemandeurOptions,
    },
    {
      key: "demandeur",
      label: "Demandeur",
      placeholder: "Tous les demandeurs",
      options: demandeurOptions,
    },
    {
      key: "equipement_souhaite",
      label: "Equipement souhaite",
      placeholder: "Tous les equipements",
      options: equipementOptions,
    },
    {
      key: "categorie",
      label: "Categorie",
      placeholder: "Toutes les categories",
      options: categorieOptions,
    },
    {
      key: "quantite",
      label: "Quantite",
      type: "range",
      placeholderMin: "Min",
      placeholderMax: "Max",
    },
    {
      key: "urgence",
      label: "Urgence",
      placeholder: "Toutes les urgences",
      options: URGENCES,
    },
    {
      key: "statut",
      label: "Statut",
      placeholder: "Tous les statuts",
      options: ["En attente"],
    },
    {
      key: "date_souhaitee",
      label: "Date",
      type: "range",
      inputType: "date",
      placeholderMin: "Du",
      placeholderMax: "Au",
      getValue: (item) => item.date_souhaitee,
      parseRangeValue: parseDateValue,
    },
  ];

  const syncCategoryOptions = (managedCategories = managedCategoryNames, itemCategories = itemCategoryNames) => {
    const nextManagedCategories = buildUniqueCategoryList(managedCategories);
    const nextItemCategories = buildUniqueCategoryList(itemCategories);

    setManagedCategoryNames(nextManagedCategories);
    setItemCategoryNames(nextItemCategories);
    setCategorieOptions(mapCategoryOptions(nextManagedCategories, nextItemCategories));
  };

  const fetchItems = async () => {
    const [response, fetchedCategories] = await Promise.all([
      axios.get(API),
      fetchEquipementCategories().catch(() => []),
    ]);
    const items = normalizeDemandes(Array.isArray(response.data) ? response.data : []);
    const nextItemCategories = items.map((item) => String(item?.categorie ?? "").trim()).filter(Boolean);
    setTypeDemandeurOptions(buildFilterOptions(items, "type_demandeur_label"));
    setDemandeurOptions(buildFilterOptions(items, "demandeur"));
    setEquipementOptions(buildFilterOptions(items, "equipement_souhaite"));
    syncCategoryOptions(
      fetchedCategories.map((category) => category.nom),
      nextItemCategories
    );
    return items;
  };

  const refreshCategoryOptions = async (categories = null) => {
    let nextManagedCategories = Array.isArray(categories) ? categories : null;

    if (!nextManagedCategories) {
      try {
        const fetchedCategories = await fetchEquipementCategories();
        nextManagedCategories = fetchedCategories.map((category) => category.nom);
      } catch (error) {
        nextManagedCategories = [];
      }
    }

    syncCategoryOptions(nextManagedCategories);
    setCategoriesRefreshKey((prev) => prev + 1);
  };

  const handleOpenCategoryManager = () => {
    setCategoryModalTrigger((prev) => prev + 1);
  };

  const createItem = async (payload) => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        formData.append(key, value);
      }
    });
    await axios.post(API, formData, { headers: { "Content-Type": "multipart/form-data" } });
  };

  const updateItem = async (id, payload) => {
    if (payload?.piece_jointe instanceof File) {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value);
        }
      });
      formData.append("_method", "PUT");
      await axios.post(`${API}/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      return;
    }
    await axios.put(`${API}/${id}`, payload);
  };

  const deleteItem = async (id) => {
    await axios.delete(`${API}/${id}`);
  };

  return (
    <>
      <SocieteCrudPage
        pageTitle="Demandes de materiel"
        detailsTitle="Details Demandes Materiel"
        addButtonLabel="Ajouter une demande"
        countLabelSingular="demande"
        countLabelPlural="demandes"
        FormComponent={DemandeMaterielForm}
        formProps={{
          onCategoriesUpdated: refreshCategoryOptions,
          categoriesRefreshKey,
        }}
        fetchItems={fetchItems}
        createItem={createItem}
        updateItem={updateItem}
        deleteItem={deleteItem}
        exportName="demandes-materiel"
        renderHeaderActions={() => (
          <button
            type="button"
            className="category-manager-trigger"
            onClick={handleOpenCategoryManager}
          >
            <FontAwesomeIcon icon={faGear} />
            <span>Gestion des Categories</span>
          </button>
        )}
        filterStyleVariant="equipements"
        searchKeys={["type_demandeur_label", "demandeur", "categorie", "quantite", "equipement_souhaite", "justificatif", "piece_jointe", "urgence", "date_souhaitee", "statut"]}
        extraFilters={demandeFilters}
        columns={[
          { key: "type_demandeur_label", label: "Type demandeur" },
          { key: "demandeur", label: "Demandeur" },
          { key: "categorie", label: "Categorie" },
          { key: "quantite", label: "Quantite" },
          { key: "equipement_souhaite", label: "Equipement souhaite" },
          { key: "justificatif", label: "Description" },
          { key: "piece_jointe", label: "Piece jointe", render: (item) => renderAttachmentLink(item) },
          { key: "date_souhaitee", label: "Date" },
          { key: "urgence", label: "Urgence", render: (item) => renderBadge(item.urgence) },
          { key: "statut", label: "Statut", render: (item) => renderBadge(item.statut) },
        ]}
      />

      <DemandeMaterielForm
        categoryManagerOnly
        categoryModalTrigger={categoryModalTrigger}
        onCategoriesUpdated={refreshCategoryOptions}
        categoriesRefreshKey={categoriesRefreshKey}
      />
    </>
  );
};

export default Demandes;

