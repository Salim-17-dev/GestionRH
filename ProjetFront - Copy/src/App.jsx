import 'bootstrap/dist/css/bootstrap.min.css';

import './App.css'
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Navigation from './Acceuil/Navigation';

import Dashboard from './Acceuil/Dashboard';
import DepartementManager from './Zakaria/Employe/DepartementManager';

import EmpHistorique from './Zakaria/EmpHistorique.jsx';

import { OpenProvider } from './Acceuil/OpenProvider.jsx';

// HeaderProvider import for global header state
import { HeaderProvider } from './Acceuil/HeaderContext';
import Societe from './Zakaria/Societe/Societe.jsx';
import Login from './Login/Login.jsx';
import DemandeAttestation from './Zakaria/ReclamationRhStandard/DemandeAttestation.jsx';
import Equipements from './Zakaria/Actifs/Equipements.jsx';
import Affectations from './Zakaria/Actifs/Affectations.jsx';
import Restitutions from './Zakaria/Actifs/Restitutions.jsx';
import Demandes from './Zakaria/Actifs/Demandes.jsx';
import ReclamationSalaireStandard from './Zakaria/ReclamationRhStandard/ReclamationSalaire.jsx';
import DemandeAdministration from './Zakaria/ReclamationRhStandard/DemandeAdministration.jsx';
import BienEtreIdees from './Zakaria/ideesEmployés/BienEtreIdees.jsx';
import Formations from './Zakaria/ideesEmployés/Formations.jsx';
import Evenements from './Zakaria/ideesEmployés/Evenements.jsx';

const App = () => {
  const location = useLocation();
  const showNavigation = location.pathname !== '/login';
  return (
    <AuthProvider>
      <OpenProvider>
        <HeaderProvider>
          {showNavigation && <Navigation />}
          <Routes>
            <Route path="/" element={<Dashboard />} />

            <Route path="/login" element={<Login />} />

            <Route path="/employes" element={<DepartementManager />} />

            <Route path="/emphistorique" element={<EmpHistorique />} />

            <Route path="/societes" element={<Societe/>}/>
            <Route path="/demande-attestation" element={<DemandeAttestation />} />
            <Route path="/actifs/equipements" element={<Equipements />} />
            <Route path="/actifs/affectations" element={<Affectations />} />
            <Route path="/actifs/restitutions" element={<Restitutions />} />
            <Route path="/actifs/demandes" element={<Demandes />} />
            <Route path="/reclamations" element={<ReclamationSalaireStandard />} />
            <Route path="/reclamation-salaire" element={<ReclamationSalaireStandard />} />
            <Route path="/demande-administration" element={<DemandeAdministration />} />
            <Route path="/bien-etre" element={<BienEtreIdees />} />
            <Route path="/bien-etre/formations" element={<Formations />} />
            <Route path="/bien-etre/evenements" element={<Evenements />} />
          </Routes>
        </HeaderProvider>
      </OpenProvider>
    </AuthProvider>
  );
};

export default App;
