import axios from "axios";

export const EQUIPEMENT_CATEGORIES_API = "http://127.0.0.1:8000/api/equipement-categories";

export const normalizeCategoryName = (value) => String(value ?? "").trim();

const asArray = (value) => (Array.isArray(value) ? value : [value]);

const extractCategoryName = (value) => {
  if (value && typeof value === "object") {
    return normalizeCategoryName(value.nom ?? value.label ?? value.value);
  }

  return normalizeCategoryName(value);
};

export const buildUniqueCategoryList = (...groups) => {
  const seen = new Set();

  return groups
    .flatMap((group) => asArray(group))
    .map(extractCategoryName)
    .filter((value) => {
      if (!value) return false;

      const normalized = value.toLowerCase();
      if (seen.has(normalized)) return false;

      seen.add(normalized);
      return true;
    })
    .sort((a, b) => a.localeCompare(b));
};

export const mapCategoryOptions = (...groups) =>
  buildUniqueCategoryList(...groups).map((value) => ({
    value,
    label: value,
  }));

const normalizeCategoryRecord = (item) => {
  const nom = normalizeCategoryName(item?.nom);
  if (!nom) return null;

  return {
    id: Number(item?.id),
    nom,
  };
};

export const fetchEquipementCategories = async () => {
  const response = await axios.get(EQUIPEMENT_CATEGORIES_API);
  const items = Array.isArray(response.data) ? response.data : [];

  return items
    .map(normalizeCategoryRecord)
    .filter(Boolean)
    .sort((left, right) => left.nom.localeCompare(right.nom));
};

export const createEquipementCategory = async (nom) => {
  const response = await axios.post(EQUIPEMENT_CATEGORIES_API, { nom });
  return normalizeCategoryRecord(response.data);
};

export const updateEquipementCategory = async (id, nom) => {
  const response = await axios.put(`${EQUIPEMENT_CATEGORIES_API}/${id}`, { nom });
  return normalizeCategoryRecord(response.data);
};

export const deleteEquipementCategory = async (id) => {
  await axios.delete(`${EQUIPEMENT_CATEGORIES_API}/${id}`);
};
