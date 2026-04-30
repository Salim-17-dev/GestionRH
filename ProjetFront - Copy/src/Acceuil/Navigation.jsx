// export default Navigation;
import React, { useEffect, useState } from "react";
import axios from "axios";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Toolbar from "@mui/material/Toolbar";
import MuiDrawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Container from "@mui/material/Container";
import MenuIcon from "@mui/icons-material/Menu";
import {
  useTheme,
  ListItemButton,
  Collapse,
} from "@mui/material";
import {   InputBase,Menu } from "@mui/material";
import {  alpha } from "@mui/material/styles";



import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";




import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ListIcon from '@mui/icons-material/List';
import NotificationsIcon from "@mui/icons-material/Notifications";
import { styled } from "@mui/material/styles";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import BusinessIcon from "@mui/icons-material/Business";
import PeopleIcon from "@mui/icons-material/People";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";
import DeliveryDiningIcon from "@mui/icons-material/DeliveryDining";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import TimeToLeaveIcon from "@mui/icons-material/TimeToLeave";
import MuiAppBar from "@mui/material/AppBar";
import Swal from "sweetalert2";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useAuth } from "../AuthContext";
import StoreIcon from "@mui/icons-material/Store";
import ReceiptIcon from "@mui/icons-material/Receipt";
import DescriptionIcon from "@mui/icons-material/Description";
import EditNoteIcon from "@mui/icons-material/EditNote";
import ReportTwoToneIcon from '@mui/icons-material/ReportTwoTone';
import AttachMoneyTwoToneIcon from '@mui/icons-material/AttachMoneyTwoTone';
import AccountBalanceTwoToneIcon from '@mui/icons-material/AccountBalanceTwoTone';
import MoreVertIcon from "@mui/icons-material/MoreVert";



import HomeIcon from "@mui/icons-material/Home";
import EventNoteIcon from "@mui/icons-material/EventNote";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import GavelIcon from "@mui/icons-material/Gavel";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import FunctionsIcon from "@mui/icons-material/Functions";
import SettingsIcon from "@mui/icons-material/Settings";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AlarmIcon from "@mui/icons-material/Alarm";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import CelebrationOutlinedIcon from "@mui/icons-material/CelebrationOutlined";
import { useOpen } from "./OpenProvider";


import { useHeader } from "./HeaderContext";


import SearchIcon from "@mui/icons-material/Search";
import PrintIcon from "@mui/icons-material/Print";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableViewIcon from "@mui/icons-material/TableView";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel } from "@fortawesome/free-solid-svg-icons";



// const drawerWidth = "14%";
const drawerWidth = "13%";
const employeeLabel = (employe) => {
  if (!employe) return "";
  return `${employe.nom || ""} ${employe.prenom || ""}`.trim();
};


const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
   // <--------------------------- Couleur de Appbar ----------------------------------->
  backgroundColor: "#f9fafb",
  boxShadow:"0 0 10px rgba(0,0,0,0.1)",

  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth})`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));



const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.black, 0.05),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.black, 0.1),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    width: "400px",
  },


}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color:"#2c3e50"
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "#2c3e50",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
  },
}));

const StyledMenuItem = styled(ListItem)(({ theme }) => ({
  padding: "8px 16px",
  marginBottom: "2px",
  borderLeft: "4px solid transparent",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderLeft: "4px solid #ffffff",
  },
  "&.submenu-item": {
    paddingLeft: "32px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderLeft: "2px solid transparent",
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.08)",
      borderLeft: "2px solid #ffffff",
    },
  },
}));


const SubMenuItem = styled(ListItem)(({ theme }) => ({
  paddingLeft: theme.spacing(6),
  paddingTop: theme.spacing(0.8),
  paddingBottom: theme.spacing(0.8),
  marginBottom: "1px",
  backgroundColor: "rgba(255, 255, 255, 0.08)",
  borderLeft: "3px solid rgba(255, 255, 255, 0.2)",
  transition: "all 0.2s ease",
  color: "#e8f4f8",
  
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderLeft: "3px solid #ffffff",
    transform: "translateX(2px)",
  },
  
  "& .MuiListItemIcon-root": {
    color: "#b8dce5",
    minWidth: "36px",
  },
  
  "& .MuiListItemText-root": {
    "& .MuiListItemText-primary": {
      fontSize: "0.875rem",
      fontWeight: 400,
    }
  }
}));

const MainMenuItem = styled(ListItem)(({ theme }) => ({
  padding: "12px 16px",
  marginBottom: "4px",
  borderRadius: "0 25px 25px 0",
  marginRight: "8px",
  transition: "all 0.3s ease",
  color: "#ffffff",
  
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    transform: "translateX(4px)",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
  },
  
  "& .MuiListItemIcon-root": {
    color: "#ffffff",
    minWidth: "40px",
  },
  
  "& .MuiListItemText-root": {
    "& .MuiListItemText-primary": {
      fontSize: "0.95rem",
      fontWeight: 500,
    }
  }
}));


// Style de deconnection 

const LogoutButton = styled(ListItem)(({ theme }) => ({
  position: "sticky",
  bottom: 0,
  marginTop: "auto",
  padding: "16px 16px",
  backgroundColor: "rgba(255, 255, 255, 0.08)",

  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
  transition: "all 0.3s ease",
  cursor: "pointer",
  
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderLeft: "4px solid #ff8a80",
  },
  
  "& .MuiListItemIcon-root": {
    color: "rgba(255, 255, 255, 0.7)",
    minWidth: "40px",
    transition: "all 0.3s ease",
  },
  
  "& .MuiListItemText-root": {
    "& .MuiListItemText-primary": {
      color: "rgba(255, 255, 255, 0.8)",
      fontWeight: 500,
      fontSize: "0.95rem",
    }
  },
  
  "&:hover .MuiListItemIcon-root": {
    color: "#ff8a80",
    transform: "translateX(4px)",
  },
  
  "&:hover .MuiListItemText-primary": {
    color: "#ff8a80",
  }
}));



// Style de Menu 
const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    minWidth: 200,
    borderRadius: 12,
    border: '1px solid #e0e0e0',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
    padding: '8px',
    
    '& .MuiMenuItem-root': {
      padding: '12px 16px',
      gap: '12px',
      borderRadius: 8,
      margin: '4px 0',
      transition: 'all 0.2s ease',
      fontWeight: 500,
      
      '&:hover': {
        backgroundColor: '#f5f5f5',
        transform: 'translateX(4px)',
      },
      
      '& .MuiSvgIcon-root': {
        fontSize: 20,
        color: '#666',
        transition: 'color 0.2s ease',
      },
      
      '&:hover .MuiSvgIcon-root': {
        color: '#37736f',
      }
    }
  }
}));















const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "fixed",
    height: "100vh",
    minHeight: "100vh",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    backgroundColor: "#2c767c",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),

      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

const defaultTheme = createTheme();

const Navigation = () => {
  const [selectedOption, setSelectedOption] = useState("");
  const [isNavOpen, setIsNavOpen] = useState(false);
  // const [open, setOpen] = React.useState(true);
  const { open, toggleOpen } = useOpen();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState([]);
  const [isCommandsOpen, setIsCommandsOpen] = useState(false);
  const [isEmployeesOpen, setIsEmployeesOpen] = useState(false);
  const [isPlanificationOpen, setIsPlanificationOpen] = useState(false);
  const [isPlanificationPaieOpen, setIsPlanificationPaieOpen] = useState(false);
  const [isTraitementPaieOpen, setIsTraitementPaieOpen] = useState(false);
  const [isCongeOpen, setIsCongeOpen] = useState(false);
  const [isSocieteOpen, setIsSocieteOpen] = useState(false);
  const [isAssetsOpen, setIsAssetsOpen] = useState(location.pathname.startsWith('/actifs'));
  const [isRhOpen, setIsRhOpen] = useState(false);
  const [isIdeasOpen, setIsIdeasOpen] = useState(location.pathname.startsWith('/bien-etre'));
  const [isThemeOpen, setIsThemeOpen] = useState(false);




  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [submenuOpenvente, setSubmenuOpenvente] = useState(false);
  const [submenuOpenachat, setSubmenuOpenachat] = useState(false);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };


  const toggleSubmenu = (opt) => {

    if (opt === 'finance') {
      setSubmenuOpen(!submenuOpen);
    }
    if (opt === 'vente') {
      setSubmenuOpenvente(!submenuOpenvente);

    }
    if (opt === 'achat') {
      setSubmenuOpenachat(!submenuOpenachat);
    }
  };
  const handleCommandsClick = () => {
    setIsCommandsOpen(!isCommandsOpen);
  };


  const handleEmployeesClick = () => {
    setIsEmployeesOpen(!isEmployeesOpen);
  };

  const handlePlanificationClick = () => {
    setIsPlanificationOpen(!isPlanificationOpen);
  };

  const handlePlanificationPaieClick = () => {
    setIsPlanificationPaieOpen(!isPlanificationPaieOpen);
  };

  const handleTraitementPaieClick = () => {
    setIsTraitementPaieOpen(!isTraitementPaieOpen);
  };


  const handleTraitementCongeClick = () => {
    setIsCongeOpen(!isCongeOpen);
  };


  const handleTraitementSocieteClick = () => {
    setIsSocieteOpen(!isSocieteOpen);
  };
  const handleAssetsClick = () => {
    setIsAssetsOpen(!isAssetsOpen);
  };

  const handleRhClick = () => {
    setIsRhOpen(!isRhOpen);
  };

  const handleIdeasClick = () => {
    setIsIdeasOpen(!isIdeasOpen);
  };

 
  const handleThemeClick = () => {
    setIsThemeOpen(!isThemeOpen);
  };
  


  const isAuthenticated = localStorage.getItem("isAuthenticated");
  const token = localStorage.getItem("API_TOKEN");
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  const { logout } = useAuth();
  const [openDrawer, setOpenDrawer] = useState(false);
  const handleOptionChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedOption(selectedValue);

    if (selectedValue === "charging") {
      navigate("/chargingCommand");
    } else if (selectedValue === "preparing") {
      navigate("/preparingCommand");
    } else if (selectedValue === "list") {
      navigate("/commandes"); //
    } else if (selectedValue === "details") {
      navigate("/details");
    } else if (selectedValue === "detailpreparations") {
      navigate("/detailpreparations");
    }
    else if (selectedValue === "preparationlogo") {
      navigate("/preparationlogo");
    }
  };


  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const isAssetsRoute = location.pathname.startsWith("/actifs");
  const isAssetsChildActive = (path) => location.pathname === path;
  const isBienEtreChildActive = (path) => location.pathname === path;
  const isIdeasRoute = location.pathname.startsWith("/bien-etre");
  const isEmployeesRoute =
    location.pathname === "/employes" ||
    location.pathname === "/emphistorique" ||
    location.pathname.startsWith("/employes/");

  useEffect(() => {
    if (isAssetsRoute) {
      setIsAssetsOpen(true);
    }
  }, [isAssetsRoute]);

  useEffect(() => {
    if (isIdeasRoute) {
      setIsIdeasOpen(true);
    }
  }, [isIdeasRoute]);

  useEffect(() => {
    let isCancelled = false;

    const prefetchCrudPages = async () => {
      const [
        demandesAttestationRes,
        demandesAdministrationRes,
        reclamationsSalaireRes,
        equipementsRes,
        affectationsRes,
        restitutionsRes,
        demandesMaterielRes,
      ] = await Promise.all([
        axios.get("http://127.0.0.1:8000/api/demandes-attestation"),
        axios.get("http://127.0.0.1:8000/api/demandes-administration"),
        axios.get("http://127.0.0.1:8000/api/reclamations-salaire"),
        axios.get("http://127.0.0.1:8000/api/equipements"),
        axios.get("http://127.0.0.1:8000/api/affectations"),
        axios.get("http://127.0.0.1:8000/api/restitutions"),
        axios.get("http://127.0.0.1:8000/api/demandes"),
      ]);

      if (isCancelled) return;

      const demandesAttestation = Array.isArray(demandesAttestationRes.data)
        ? demandesAttestationRes.data.map((item) => ({
            ...item,
            type_attestation: item.type,
            date: item.date_souhaitee,
          }))
        : [];

      const demandesAdministration = Array.isArray(demandesAdministrationRes.data) ? demandesAdministrationRes.data : [];

      const reclamationsSalaire = Array.isArray(reclamationsSalaireRes.data)
        ? reclamationsSalaireRes.data.map((item) => ({
            ...item,
            employe_id: item?.employe_id ?? item?.employe?.id ?? "",
          }))
        : [];

      const equipements = Array.isArray(equipementsRes.data) ? equipementsRes.data : [];
      const affectations = Array.isArray(affectationsRes.data)
        ? affectationsRes.data.map((item) => ({
            ...item,
            employe_label: employeeLabel(item.employe),
            equipement_label: item.equipement?.designation || "",
            statut: "Affecte",
          }))
        : [];

      const affectationsByEquipement = {};
      affectations.forEach((item) => {
        if (!affectationsByEquipement[item.equipement_id] || item.id > affectationsByEquipement[item.equipement_id].id) {
          affectationsByEquipement[item.equipement_id] = item;
        }
      });

      const restitutions = Array.isArray(restitutionsRes.data)
        ? restitutionsRes.data.map((item) => {
            const linkedAffectation = affectations.find((a) => a.id === item.affectation_id) || affectationsByEquipement[item.equipement_id] || null;
            const employeActuel = item.employeActuel || linkedAffectation?.employe || null;

            return {
              ...item,
              equipement_label: item.equipement?.designation || "",
              employe_actuel_label: employeeLabel(employeActuel) || "Employe inconnu",
              statut_label: item.statut === "transfere" ? "Transfere" : "Restitue",
            };
          })
        : [];

      const demandesMateriel = Array.isArray(demandesMaterielRes.data) ? demandesMaterielRes.data : [];

      sessionStorage.setItem("crud-cache-demandes-attestation", JSON.stringify(demandesAttestation));
      sessionStorage.setItem("crud-cache-demandes-administration", JSON.stringify(demandesAdministration));
      sessionStorage.setItem("crud-cache-reclamations-salaire", JSON.stringify(reclamationsSalaire));
      sessionStorage.setItem("crud-cache-equipements", JSON.stringify(equipements));
      sessionStorage.setItem("crud-cache-affectations", JSON.stringify(affectations));
      sessionStorage.setItem("crud-cache-restitutions", JSON.stringify(restitutions));
      sessionStorage.setItem("crud-cache-demandes-materiel", JSON.stringify(demandesMateriel));
    };

    prefetchCrudPages();

    return () => {
      isCancelled = true;
    };
  }, []);



  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     try {
  //       const response = await axios.get("http://localhost:8000/api/user", {
  //         withCredentials: true,
  //       });
  //       setUser(response.data);
  //       console.log(response.data);
  //     } catch (error) {
  //       console.error("Error fetching user data:", error);
  //     }
  //   };

  //   fetchUserData();
  // }, []);

  // useEffect(() => {
  //   const fetchUsersData = async () => {
  //     try {
  //       const response = await axios.get("http://localhost:8000/api/users", {
  //         withCredentials: true,
  //       });
  //       setUsers(response.data);
  //       console.log(response.data);
  //     } catch (error) {
  //       console.error("Error fetching user data:", error);
  //     }
  //   };

  //   fetchUsersData();
  // }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/user", {
          withCredentials: true,
        });
        if (response.data && response.data.length > 0) {
          setUser(response.data);
          const permissionsData = response.data[0].roles[0].permissions;

          // Récupérer les noms des permissions
          const permissionNames = permissionsData.map(
            (permission) => permission.name
          );

          // Mettre à jour l'état des permissions
          setPermissions(permissionNames);
          console.log(permissionNames);
          console.log(response.data);
        } else {
          console.error("Empty user data in response:", response.data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []); // Dépendance vide pour que ce useEffect s'exécute une seule fois après le montage initial


  const MyListItemButton = styled(ListItemButton)(({ theme }) => ({
    minHeight: 48,
    justifyContent: "center",
    px: 2.5,
  }));

  const handleLogoutClick = async () => {
    try {
      // Logout logic
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred during logout.",
      });
    }
  };

  const toggleDrawer = () => {
    // setOpen(!open);
    toggleOpen();
  };

  const { title, searchQuery, setSearchQuery, onPrint, onExportPDF, onExportExcel } = useHeader();

  return (


    
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{
        marginLeft: "-20px",
        marginTop: '-20px',
        maxHeight: '1400px',
        overflowY: 'auto',
        scrollbarColor: "#2c767c #e0e0e0" /* Scrollbar colors for Firefox */,
        "&::-webkit-scrollbar": {
          width: "8px" /* Adjust width as needed */,
          cursor: "pointer",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#2c767c",
          cursor: "pointer",
        },
        "&::-webkit-scrollbar-track": {
            backgroundColor: "#2c767c",
            cursor: "pointer",
          },
      }}>
        <CssBaseline />
        


        <AppBar position="absolute" open={open} className="beige-appbar">
          <Toolbar
            sx={{
              pr: "24px",

            }}
          >
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                marginRight: "36px",
                ...(open && { display: "none" }),

              }}
            >
              <MenuIcon />
            </IconButton>


            {/* <Typography 
              component="h1"
              variant="h6"
              // color="inherit"
              color="#2c3e50"

              noWrap
              sx={{ flexGrow: 1, }}
            >   */}



            <Typography 
  component="h1"
  variant="h6"
  noWrap
  sx={{ 
    flexGrow: 1,
    fontSize: "22px", 
    fontWeight: 700, 
    color: "#2c3e50", 
    letterSpacing: "-0.025em" 
  }}
>
              {title}
            </Typography>





 
  

            <Box sx={{ display: "flex", marginRight:'-1%' }}>
            <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Recherche globale..."
              inputProps={{ "aria-label": "search" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {/* Icône ⋮ à l'intérieur de la barre */}
            <IconButton color="#2c3e50" onClick={handleMenuOpen} size="small" style={{ marginLeft:'32%'}}>
              <MoreVertIcon />
            </IconButton>
          </Search>

          <StyledMenu
  anchorEl={anchorEl}
  open={openMenu}
  onClose={handleMenuClose}
>
  <MenuItem onClick={() => { handleMenuClose(); onPrint && onPrint(); }} disabled={!onPrint}>
    <PrintIcon /> Imprimer le document
  </MenuItem>
  <MenuItem onClick={() => { handleMenuClose(); onExportPDF && onExportPDF(); }} disabled={!onExportPDF}>
    <PictureAsPdfIcon /> Générer fichier PDF
  </MenuItem>
  <MenuItem onClick={() => { handleMenuClose(); onExportExcel && onExportExcel(); }} disabled={!onExportExcel}>
  <FontAwesomeIcon icon={faFileExcel} style={{ fontSize: "17px", color: "grey" , marginBottom:'3px'}} /> Exporter vers Excel
  </MenuItem>
  
</StyledMenu>





          {/* Icônes à côté */}
          {/* <IconButton color="inherit">
            <PrintIcon />
          </IconButton>
          <IconButton color="inherit">
            <PictureAsPdfIcon />
          </IconButton>
          <IconButton color="inherit">
            <TableViewIcon />
          </IconButton> */}

        </Box>




            <IconButton color="inherit">
              <Badge color="secondary">
                {user && (
                  <ListItem button style={{ color: "#2c3e50" }}>
                    <ListItemIcon style={{ color: '#2c3e50' }}>
                      <Avatar
                        alt={user[0].name}
                        src={user[0].photo}
                        style={{ width: "40px", height: "40px", }}
                      />
                    </ListItemIcon>
                    {/* <ListItemText primary={`${user[0].name}`} />{" "} */}
                  </ListItem>
                )}
              </Badge>
            </IconButton>
          </Toolbar>
        </AppBar>

        
        <Drawer variant="permanent" open={open}>
          {/* <Toolbar
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              backgroundColor: '#2c767c',  
              px: [1],
              height:'71px',
            }}
          >
            <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar> */}
          <Divider />
          <List style={{ backgroundColor: '#2c767c', height: '1307px' }}>
            <Toolbar
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                backgroundColor: '#2c767c',
                px: [1],
                height: '71px',
              }}
            >
              <IconButton onClick={toggleDrawer}>
                <ChevronLeftIcon />
              </IconButton>
            </Toolbar>
            {user && (
              <ListItem button style={{ color: "white" }}>
                {/*<ListItemIcon  style={{color:'white'}}>*/}
                {/*  <Avatar*/}
                {/*    alt={user.name}*/}
                {/*    src={user.photo}*/}
                {/*    style={{ width: "40px", height: "40px" }}*/}
                {/*  />*/}
                {/*</ListItemIcon>*/}
                <ListItemText primary={``} />
              </ListItem>
            )}
            <ListItem button component={Link} to="/" style={{ color: "white" }}     sx={{ "& .MuiListItemIcon-root": { minWidth: 56 } }}
            >
              <ListItemIcon style={{ color: 'white' }}>
                <HomeIcon style={{ fontSize: "1.6rem", color: "white" }} />

              </ListItemIcon>
              <ListItemText primary="Accueil" />
            </ListItem>
           








{/*-------------------------------- Menu Gestion des Employés -------------------------------------- */}


  <ListItem
    button
    onClick={handleEmployeesClick}
    sx={{ "& .MuiListItemIcon-root": { minWidth: 56 } }}
    style={{
      color: "white",
      display: "flex",
      backgroundColor: isEmployeesRoute ? "rgba(255, 255, 255, 0.12)" : "transparent",
      borderLeft: isEmployeesRoute ? "4px solid #ffffff" : "4px solid transparent",
      transition: "all 0.2s ease",
    }}
  >
    <ListItemIcon >
    <PeopleIcon style={{ fontSize: "1.6rem", color: "white" }} />
    </ListItemIcon>
    <ListItemText primary="Gestion employés" />
    {isEmployeesOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
  </ListItem>


<Collapse in={isEmployeesOpen} timeout="auto" unmountOnExit>
  <List component="div" disablePadding>

    {permissions.includes("view_all_employes") && (
    <SubMenuItem button component={Link} to="/employes">
      <ListItemIcon>
        <ListIcon />
      </ListItemIcon>
      <ListItemText primary="Gestion des Employés" />
    </SubMenuItem>
    )}
    
   

    {permissions.includes("view_all_employee_histories") && (
      <SubMenuItem button component={Link} to="/emphistorique">
        <ListItemIcon>
          <LocalShippingIcon />
        </ListItemIcon>
        <ListItemText primary="Historique" />
      </SubMenuItem>
    )}

    
  </List>
</Collapse>





{/*-------------------------------- MEnu Planification  -------------------------------------- */}









{/*-------------------------------- MEnu Traitement Paie  -------------------------------------- */}



{/*-------------------------------- MEnu Société  -------------------------------------- */}
  <ListItem
    button
    style={{ color: "white", display: "flex" }}
    sx={{ "& .MuiListItemIcon-root": { minWidth: 56 } }}
    onClick={handleTraitementSocieteClick}
  >
    <ListItemIcon style={{ color: 'white' }}>
      <BusinessIcon style={{ fontSize: "1.6rem", color: "white" }} />
    </ListItemIcon>
    <ListItemText primary="Société" />
    {isSocieteOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
  </ListItem>
  
<Collapse in={isSocieteOpen} timeout="auto" unmountOnExit>
  <List component="div" disablePadding>
    {permissions.includes("view_all_societes") && (
      <SubMenuItem button component={Link} to="/societes">
        <ListItemIcon style={{ color: 'white' }}>
          <ListIcon />
        </ListItemIcon>
        <ListItemText primary="Société" />
      </SubMenuItem>
    )}

  </List>
</Collapse>


{/*-------------------------------- Gestion Actifs -------------------------------------- */}





<ListItem
    button
    style={{
      color: "white",
      display: "flex",
      backgroundColor: isAssetsRoute ? "rgba(255, 255, 255, 0.12)" : "transparent",
      borderLeft: isAssetsRoute ? "4px solid #ffffff" : "4px solid transparent",
      transition: "all 0.2s ease",
    }}
    sx={{ "& .MuiListItemIcon-root": { minWidth: 56 } }}
    onClick={handleAssetsClick}
  >
    <ListItemIcon style={{ color: 'white' }}>
      <StoreIcon style={{ fontSize: "1.6rem", color: "white" }} />
    </ListItemIcon>
    <ListItemText primary="Gestion Actifs" />
    {isAssetsOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
  </ListItem>

<Collapse in={isAssetsOpen} timeout="auto" unmountOnExit>
  <List component="div" disablePadding>
    <SubMenuItem
      button
      component={Link}
      to="/actifs/equipements"
      style={isAssetsChildActive("/actifs/equipements") ? { backgroundColor: "rgba(255, 255, 255, 0.18)", borderLeft: "3px solid #ffffff" } : undefined}
    >
      <ListItemIcon style={{ color: 'white' }}>
        <ShoppingBasketIcon />
      </ListItemIcon>
      <ListItemText primary="Catalogue" />
    </SubMenuItem>
    <SubMenuItem
      button
      component={Link}
      to="/actifs/affectations"
      style={isAssetsChildActive("/actifs/affectations") ? { backgroundColor: "rgba(255, 255, 255, 0.18)", borderLeft: "3px solid #ffffff" } : undefined}
    >
      <ListItemIcon style={{ color: 'white' }}>
        <PeopleIcon />
      </ListItemIcon>
      <ListItemText primary="Affectation employe" />
    </SubMenuItem>
    <SubMenuItem
      button
      component={Link}
      to="/actifs/restitutions"
      style={isAssetsChildActive("/actifs/restitutions") ? { backgroundColor: "rgba(255, 255, 255, 0.18)", borderLeft: "3px solid #ffffff" } : undefined}
    >
      <ListItemIcon style={{ color: 'white' }}>
        <DeliveryDiningIcon />
      </ListItemIcon>
      <ListItemText primary="Restitutions & Transferts" />
    </SubMenuItem>
    <SubMenuItem
      button
      component={Link}
      to="/actifs/demandes"
      style={isAssetsChildActive("/actifs/demandes") ? { backgroundColor: "rgba(255, 255, 255, 0.18)", borderLeft: "3px solid #ffffff" } : undefined}
    >
      <ListItemIcon style={{ color: 'white' }}>
        <DescriptionIcon />
      </ListItemIcon>
      <ListItemText primary="Demandes de materiel" />
    </SubMenuItem>
  </List>
</Collapse>





{/*-------------------------------- MEnu Réclamations & RH -------------------------------------- */}




<ListItem
    button
    style={{ color: "white", display: "flex" }}
    sx={{ "& .MuiListItemIcon-root": { minWidth: 56 } }}
    onClick={handleRhClick}
  >
    <ListItemIcon style={{ color: 'white' }}>
      <ReportProblemIcon style={{ fontSize: "1.6rem", color: "white" }} />
    </ListItemIcon>
    <ListItemText primary="Reclamations & RH" />
    {isRhOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
  </ListItem>
  
<Collapse in={isRhOpen} timeout="auto" unmountOnExit>
  <List component="div" disablePadding>
    <SubMenuItem button component={Link} to="/demande-attestation">
      <ListItemIcon style={{ color: 'white' }}>
        <DescriptionIcon />
      </ListItemIcon>
      <ListItemText primary="Demande attestation" />
    </SubMenuItem>
    <SubMenuItem button component={Link} to="/reclamations">
      <ListItemIcon style={{ color: 'white' }}>
        <ReportTwoToneIcon />
      </ListItemIcon>
      <ListItemText primary="Reclamation salaire" />
    </SubMenuItem>
    <SubMenuItem button component={Link} to="/demande-administration">
      <ListItemIcon style={{ color: 'white' }}>
        <EditNoteIcon />
      </ListItemIcon>
      <ListItemText primary="Demande administrative" />
    </SubMenuItem>
  </List>
</Collapse>


          
{/*--------------------------------- Gestion des idées employés  -------------------------------------- */}


<ListItem
    button
    style={{
      color: "white",
      display: "flex",
      backgroundColor: isIdeasRoute ? "rgba(255, 255, 255, 0.12)" : "transparent",
      borderLeft: isIdeasRoute ? "4px solid #ffffff" : "4px solid transparent",
      transition: "all 0.2s ease",
    }}
    sx={{ "& .MuiListItemIcon-root": { minWidth: 56 } }}
    onClick={handleIdeasClick}
  >
    <ListItemIcon style={{ color: 'white' }}>
      <ForumOutlinedIcon style={{ fontSize: "1.45rem", color: "white" }} />
    </ListItemIcon>
    <ListItemText primary="Gestion des idées employés" />
    {isIdeasOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
  </ListItem>
  
<Collapse in={isIdeasOpen} timeout="auto" unmountOnExit>
  <List component="div" disablePadding>
    <SubMenuItem
      button
      component={Link}
      to="/bien-etre"
      style={isBienEtreChildActive("/bien-etre") ? { backgroundColor: "rgba(255, 255, 255, 0.18)", borderLeft: "3px solid #ffffff" } : undefined}
    >
      <ListItemIcon style={{ color: 'white' }}>
        <LightbulbOutlinedIcon />
      </ListItemIcon>
      <ListItemText primary="Bien-être" />
    </SubMenuItem>
    <SubMenuItem
      button
      component={Link}
      to="/bien-etre/formations"
      style={isBienEtreChildActive("/bien-etre/formations") ? { backgroundColor: "rgba(255, 255, 255, 0.18)", borderLeft: "3px solid #ffffff" } : undefined}
    >
      <ListItemIcon style={{ color: 'white' }}>
        <SchoolOutlinedIcon />
      </ListItemIcon>
      <ListItemText primary="Formation" />
    </SubMenuItem>
    <SubMenuItem
      button
      component={Link}
      to="/bien-etre/evenements"
      style={isBienEtreChildActive("/bien-etre/evenements") ? { backgroundColor: "rgba(255, 255, 255, 0.18)", borderLeft: "3px solid #ffffff" } : undefined}
    >
      <ListItemIcon style={{ color: 'white' }}>
        <CelebrationOutlinedIcon />
      </ListItemIcon>
      <ListItemText primary="Évènements" />
    </SubMenuItem>
  </List>
</Collapse>

 <ListItem
                button
                component={Link}
                to="/users"
                style={{ color: "white" }}
              >
                <ListItemIcon style={{ color: 'white' }}>
                  <StarHalfIcon />
                </ListItemIcon>
                <ListItemText primary="Users" />
              </ListItem>










{/*--------------------------------   -------------------------------------- */}










        
         
           
          </List>

          <LogoutButton
  button
  onClick={() => {
    handleLogoutClick();
    logout();
  }}
>
  <ListItemIcon>
    <ExitToAppIcon  />
  </ListItemIcon>
  <ListItemText primary="Se déconnecter" />
</LogoutButton>




        </Drawer>
      </Box>
    </ThemeProvider>
  );
};

export default Navigation;
