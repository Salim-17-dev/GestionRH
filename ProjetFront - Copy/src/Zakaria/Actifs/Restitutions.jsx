import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import RestitutionForm from './RestitutionForm';
import SocieteCrudPage from '../Standardized/SocieteCrudPage';
import { renderBadge } from '../Standardized/badges';

const RESTITUTIONS_API = 'http://127.0.0.1:8000/api/restitutions';
const AFFECTATIONS_API = 'http://127.0.0.1:8000/api/affectations';
const EQUIPEMENTS_API = 'http://127.0.0.1:8000/api/equipements';
const EMPLOYES_API = 'http://127.0.0.1:8000/api/employes-options';

const employeeLabel = (employe) => {
  if (!employe) return '';
  return `${employe.nom || ''} ${employe.prenom || ''}`.trim();
};

const employeeLabelById = (employes, employeeId) => {
  const matchedEmployee = employes.find((item) => Number(item?.id) === Number(employeeId));
  return matchedEmployee ? employeeLabel(matchedEmployee) : '';
};

const buildFilterOptions = (items, key) =>
  [...new Set(items.map((item) => String(item?.[key] ?? '').trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({
      value,
      label: value,
    }));

const normalizeEquipementEtat = (value) => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (normalized === 'neuf') return 'Neuf';
  if (normalized === 'bon') return 'Bon';
  if (normalized === 'usage') return 'Usage';
  if (normalized === 'endommage') return 'Endommage';
  return value || '';
};

const Restitutions = () => {
  const [employes, setEmployes] = useState([]);
  const [equipements, setEquipements] = useState([]);
  const [affectations, setAffectations] = useState([]);
  const [equipementOptions, setEquipementOptions] = useState([]);

  const restitutionFilters = [
    {
      key: 'equipement_label',
      label: 'Equipement',
      placeholder: 'Tous les equipements',
      options: equipementOptions,
    },
    {
      key: 'date_attribution',
      label: 'Date attribution',
      type: 'range',
      inputType: 'date',
      placeholderMin: 'Du',
      placeholderMax: 'Au',
      parseRangeValue: (value) => {
        if (!value) return Number.NaN;
        return new Date(String(value).slice(0, 10)).getTime();
      },
    },
    {
      key: 'etat_retour',
      label: 'Etat',
      placeholder: 'Tous les etats',
      options: ['Bon', 'Neuf', 'Endommage', 'Usage'],
    },
    {
      key: 'statut_label',
      label: 'Statut',
      placeholder: 'Tous les statuts',
      options: ['Restitue', 'Transfere'],
    },
  ];

  const loadSupportingData = async () => {
    const [empRes, eqRes, affRes] = await Promise.all([
      axios.get(EMPLOYES_API),
      axios.get(EQUIPEMENTS_API),
      axios.get(AFFECTATIONS_API),
    ]);
    setEmployes(Array.isArray(empRes.data) ? empRes.data : []);
    setEquipements(Array.isArray(eqRes.data) ? eqRes.data : []);
    setAffectations(Array.isArray(affRes.data) ? affRes.data : []);
  };

  useEffect(() => {
    loadSupportingData();
  }, []);

  const affectationsByEquipement = useMemo(() => {
    const map = {};
    affectations.forEach((item) => {
      if (!map[item.equipement_id] || item.id > map[item.equipement_id].id) {
        map[item.equipement_id] = item;
      }
    });
    return map;
  }, [affectations]);

  const fetchItems = async () => {
    const response = await axios.get(RESTITUTIONS_API);
    const list = Array.isArray(response.data) ? response.data : [];
    const items = list.map((item) => {
      const linkedAffectation =
        affectations.find((a) => a.id === item.affectation_id) ||
        affectationsByEquipement[item.equipement_id] ||
        null;
      const employeActuel =
        item.employeActuel || linkedAffectation?.employe || null;
      const nouvelEmployeLabel =
        employeeLabel(item.nouvelEmploye) ||
        employeeLabel(item.nouvel_employe) ||
        employeeLabelById(employes, item.nouvel_employe_id) ||
        '';
      return {
        ...item,
        equipement_label: item.equipement?.designation || '',
        employe_actuel_label: employeeLabel(employeActuel) || 'Employe inconnu',
        nouvel_employe_label: nouvelEmployeLabel,
        statut_label: item.statut === 'transfere' ? 'Transfere' : 'Restitue',
        etat_retour: normalizeEquipementEtat(item.etat_retour),
      };
    });
    setEquipementOptions(buildFilterOptions(items, 'equipement_label'));
    return items;
  };

  const createItem = async (payload) => {
    await axios.post(RESTITUTIONS_API, payload);
    await loadSupportingData();
  };

  const updateItem = async (id, payload) => {
    await axios.put(`${RESTITUTIONS_API}/${id}`, payload);
    await loadSupportingData();
  };

  const deleteItem = async (id) => {
    await axios.delete(`${RESTITUTIONS_API}/${id}`);
    await loadSupportingData();
  };

  return (
    <SocieteCrudPage
      pageTitle="Restitutions et transferts"
      detailsTitle="Details Restitutions & Transferts"
      addButtonLabel="Ajouter une operation"
      countLabelSingular="operation"
      countLabelPlural="operations"
      FormComponent={RestitutionForm}
      formProps={{ employes, assignedEquipements: equipements, affectationsByEquipement }}
      fetchItems={fetchItems}
      createItem={createItem}
      updateItem={updateItem}
      deleteItem={deleteItem}
      exportName="restitutions"
      filterStyleVariant="equipements"
      searchKeys={[
        'equipement_label',
        'employe_actuel_label',
        'date_attribution',
        'date_retour',
        'nouvel_employe_label',
        'date_transfert',
        'statut_label',
        'etat_retour',
        'commentaire',
      ]}
      extraFilters={restitutionFilters}
      columns={[
        { key: 'equipement_label', label: 'Equipement' },
        { key: 'employe_actuel_label', label: 'Employe actuel' },
        { key: 'date_attribution', label: 'Date attribution' },
        { key: 'date_retour', label: 'Date retour' },
        { key: 'nouvel_employe_label', label: 'Nouvel employe' },
        { key: 'date_transfert', label: 'Date transfert' },
        { key: 'commentaire', label: 'Commentaire' },
        {
          key: 'etat_retour',
          label: 'Etat',
          render: (item) => renderBadge(item.etat_retour || '-'),
        },
        {
          key: 'statut_label',
          label: 'Statut',
          render: (item) => renderBadge(item.statut_label),
        },
      ]}
    />
  );
};

export default Restitutions;

