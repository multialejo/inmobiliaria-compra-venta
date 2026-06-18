/**
 * @file CatalogPage.jsx
 * @brief Vista del catálogo público e interactivo de bienes raíces.
 * 
 * @section estructura Estructura de la Vista
 * Presenta una grilla de propiedades disponibles con filtros dinámicos basados en la provincia de Bolívar.
 * Contiene:
 * - Buscador general de texto (título y dirección).
 * - Filtros por Ubicación (Cantón y Parroquia).
 * - Filtros por Tipo de Inmueble y rango de precios.
 * - Modal detallado de propiedades con fotos y contacto del agente a cargo.
 * 
 * @section api Conexión y Autenticación con la API
 * - Realiza peticiones de obtención (`GET`) a los endpoints públicos del backend: `/api/cantones` y `/api/parroquias/canton/:id`.
 * - **Autenticación Silenciosa**: Para usuarios no registrados (invitados), efectúa un inicio de sesión transparente con las credenciales por defecto (`admin@inmobiliaria.com`) para obtener el token que autoriza la lectura del catálogo de propiedades.
 * - **Registro de Interés**: Permite enviar intenciones de compra (`POST /api/intereses`) enviando el token JWT del cliente autenticado.
 * - **Control de Eliminación**: Permite la eliminación directa de propiedades (`DELETE /api/propiedades/:id`) validando que el rol activo sea 'administrador'.
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize2, 
  SlidersHorizontal, 
  X, 
  Phone, 
  Mail, 
  Info,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building,
  ArrowRight,
  User,
  Lock,
  PhoneCall,
  CheckCircle,
  LogOut,
  Sparkles
} from 'lucide-react';
import './CatalogPage.css';
import ToastContainer, { useToast } from '../Toast';
import ConfirmDialog from '../ConfirmDialog';

const API_URL = 'http://localhost:3000/api';
const PLACEHOLDER = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="500" height="350"><rect fill="#eff6ff" width="500" height="350"/><text fill="#3b82f6" font-family="sans-serif" font-size="18" x="50%" y="50%" text-anchor="middle" dy=".3em">Cargando...</text></svg>');

const MOCK_CANTONES = [
  { id: 201, nombre: 'GUARANDA' },
  { id: 202, nombre: 'CHILLANES' },
  { id: 203, nombre: 'CHIMBO' },
  { id: 204, nombre: 'ECHEANDÍA' },
  { id: 205, nombre: 'SAN MIGUEL' },
  { id: 206, nombre: 'CALUMA' },
  { id: 207, nombre: 'LAS NAVES' }
];

const MOCK_PARROQUIAS = {
  201: [
    { id: 20101, nombre: 'ÁNGEL POLIBIO CHÁVES' },
    { id: 20102, nombre: 'GABRIEL IGNACIO VEINTIMILLA' },
    { id: 20103, nombre: 'GUANUJO' },
    { id: 20155, nombre: 'SALINAS' },
    { id: 20156, nombre: 'SAN LORENZO' },
    { id: 20157, nombre: 'SAN SIMÓN (YACOTO)' },
    { id: 20158, nombre: 'SANTA FÉ (SANTA FÉ)' },
    { id: 20159, nombre: 'SIMIÁTUG' }
  ],
  203: [
    { id: 20350, nombre: 'SAN JOSÉ DE CHIMBO' },
    { id: 20351, nombre: 'ASUNCIÓN (ASANCOTO)' },
    { id: 20353, nombre: 'MAGDALENA (CHAPACOTO)' },
    { id: 20354, nombre: 'SAN SEBASTIÁN' },
    { id: 20355, nombre: 'TELIMBELA' }
  ],
  205: [
    { id: 20550, nombre: 'SAN MIGUEL' },
    { id: 20551, nombre: 'BALSAPAMBA' },
    { id: 20552, nombre: 'BILOVÁN' },
    { id: 20554, nombre: 'SAN PABLO (SAN PABLO DE ATENAS)' },
    { id: 20555, nombre: 'SANTIAGO' },
    { id: 20556, nombre: 'SAN VICENTE' }
  ],
  202: [{ id: 20250, nombre: 'CHILLANES' }, { id: 20251, nombre: 'SAN JOSÉ DEL TAMBO' }],
  204: [{ id: 20450, nombre: 'ECHEANDÍA' }],
  206: [{ id: 20650, nombre: 'CALUMA' }],
  207: [{ id: 20701, nombre: 'LAS MERCEDES' }, { id: 20702, nombre: 'LAS NAVES' }]
};

export default function CatalogPage({ currentUser, token, setToken, setCurrentUser, onNavigateToDashboard }) {
  const { toasts, showToast, removeToast } = useToast();
  const [propiedades, setPropiedades] = useState([]);
  const [cantones, setCantones] = useState(MOCK_CANTONES);
  const [parroquias, setParroquias] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Local guest token for public fetching if not logged in
  const [guestToken, setGuestToken] = useState(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCanton, setSelectedCanton] = useState('');
  const [selectedParroquia, setSelectedParroquia] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Selected Property Modal State
  const [selectedProp, setSelectedProp] = useState(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Confirm Delete State
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, message: '', id: null });

  // Buy interest and Auth Modal State
  const [interestRegistered, setInterestRegistered] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState('login'); // 'login' | 'register'

  // Solicitar Agente State
  const [showSolicitudModal, setShowSolicitudModal] = useState(false);
  const [solicitudExperiencia, setSolicitudExperiencia] = useState('');
  const [solicitudLicencia, setSolicitudLicencia] = useState('');
  const [solicitudMotivo, setSolicitudMotivo] = useState('');
  
  // Auth Form State
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Register Form State
  const [regNombre, setRegNombre] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regTelefono, setRegTelefono] = useState('');
  const [regCedula, setRegCedula] = useState('');
  const [regDireccion, setRegDireccion] = useState('');
  const [regError, setRegError] = useState('');

  const activeToken = token || guestToken;

  // Helper to fetch properties
  const fetchPropiedades = async (tok) => {
    const currentToken = tok || token || guestToken;
    if (!currentToken) return;
    try {
      const propsRes = await fetch(`${API_URL}/propiedades`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        }
      });

      if (propsRes.ok) {
        const pData = await propsRes.json();
        setPropiedades(pData || []);
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
    }
  };

  const handleDelete = (id, e) => {
    if (e) e.stopPropagation();
    setConfirmDelete({
      isOpen: true,
      message: '¿Estás seguro de eliminar esta propiedad de forma permanente?',
      id
    });
  };

  const executeDelete = async () => {
    const { id } = confirmDelete;
    if (!id) return;
    try {
      const response = await fetch(`${API_URL}/propiedades/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        await fetchPropiedades();
        if (selectedProp && selectedProp.id === id) {
          setSelectedProp(null);
        }
        showToast('Propiedad eliminada con éxito.', 'success');
      } else {
        showToast('Error al eliminar la propiedad.', 'error');
      }
    } catch (err) {
      console.error('Error deleting property:', err);
      showToast('Error al eliminar.', 'error');
    }
    setConfirmDelete({ isOpen: false, message: '', id: null });
  };

  // Initial silent auth and fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        let currentToken = token;

        // If there's no logged-in user token, do a silent login with admin to retrieve properties
        if (!currentToken) {
          const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email: 'admin@inmobiliaria.com', 
              contrasena: 'admin123' 
            }),
          });

          if (loginRes.ok) {
            const loginData = await loginRes.json();
            currentToken = loginData.access_token;
            setGuestToken(currentToken);
          }
        }

        // Fetch Cantones
        const cantonesRes = await fetch(`${API_URL}/cantones`);
        if (cantonesRes.ok) {
          const cData = await cantonesRes.json();
          if (cData && cData.length > 0) setCantones(cData);
        }

        // Fetch Propiedades
        if (currentToken) {
          await fetchPropiedades(currentToken);
        }
      } catch (err) {
        console.error('Error fetching data from API:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [token]);

  // Fetch Parroquias when Canton changes
  useEffect(() => {
    if (!selectedCanton) {
      setParroquias([]);
      setSelectedParroquia('');
      return;
    }

    const fetchParroquiasOfCanton = async () => {
      if (activeToken) {
        try {
          const res = await fetch(`${API_URL}/parroquias/canton/${selectedCanton}`);
          if (res.ok) {
            const data = await res.json();
            setParroquias(data);
            return;
          }
        } catch (error) {
          console.warn('Failed to fetch parroquias from API, using fallback');
        }
      }
      setParroquias(MOCK_PARROQUIAS[selectedCanton] || []);
    };

    fetchParroquiasOfCanton();
    setSelectedParroquia('');
  }, [selectedCanton, activeToken]);

  // Check if current user already has interest registered for selected property
  useEffect(() => {
    if (selectedProp && currentUser && token) {
      // Check if user already registered interest
      const checkInterest = async () => {
        try {
          const res = await fetch(`${API_URL}/intereses/mis-intereses`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            const exists = data.some(x => x.propiedad_id === selectedProp.id || x.propiedad?.id === selectedProp.id);
            setInterestRegistered(exists);
          }
        } catch (e) {
          console.warn('Failed to fetch interests:', e);
        }
      };
      checkInterest();
    } else {
      setInterestRegistered(false);
    }
  }, [selectedProp, currentUser, token]);

  const handlePrevImage = (e, imgs) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev === 0 ? imgs.length - 1 : prev - 1));
  };

  const handleNextImage = (e, imgs) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev === imgs.length - 1 ? 0 : prev + 1));
  };

  const parseDescripcion = (desc) => {
    try {
      const d = JSON.parse(desc);
      return d.texto || desc;
    } catch {
      return desc;
    }
  };

  const getDormitorios = (prop) => {
    try {
      const d = JSON.parse(prop.descripcion);
      return d.dormitorios || '—';
    } catch {
      return '—';
    }
  };

  const getBanos = (prop) => {
    try {
      const d = JSON.parse(prop.descripcion);
      return d.banos || '—';
    } catch {
      return '—';
    }
  };

  // Auth: Login submission from modal
  const handleAuthLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, contrasena: authPassword }),
      });
      if (!response.ok) throw new Error('Credenciales inválidas');
      const data = await response.json();
      
      localStorage.setItem('token', data.access_token);
      setToken(data.access_token);
      setCurrentUser(data.usuario);
      setShowAuthModal(false);
      
      // Auto-register interest if property was selected
      if (selectedProp) {
        registerPurchaseInterest(selectedProp.id, data.access_token);
      }
    } catch (error) {
      setAuthError(error.message);
    }
  };

  // Auth: Register client submission from modal
  const handleAuthRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');
    try {
      // 1. Register Client
      const registerRes = await fetch(`${API_URL}/clientes/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: regNombre,
          email: regEmail,
          contrasena: regPassword,
          telefono: regTelefono || undefined,
          cedula: regCedula || undefined,
          direccion: regDireccion || undefined
        }),
      });

      if (!registerRes.ok) {
        const err = await registerRes.json();
        throw new Error(err.message || 'Error al registrarse. Verifica los datos.');
      }

      // 2. Perform Login Automatically
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail, contrasena: regPassword }),
      });

      if (!loginRes.ok) throw new Error('Registro exitoso, pero fallo el login automático.');
      const data = await loginRes.json();
      
      localStorage.setItem('token', data.access_token);
      setToken(data.access_token);
      setCurrentUser(data.usuario);
      setShowAuthModal(false);
      
      // Auto-register interest
      if (selectedProp) {
        registerPurchaseInterest(selectedProp.id, data.access_token);
      }
    } catch (error) {
      setRegError(error.message);
    }
  };

  // Register purchase interest in the backend
  const registerPurchaseInterest = async (propId, userToken) => {
    const activeUserToken = userToken || token;
    if (!activeUserToken) return;

    try {
      const res = await fetch(`${API_URL}/intereses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeUserToken}`
        },
        body: JSON.stringify({ propiedad_id: propId })
      });
      if (res.ok) {
        setInterestRegistered(true);
        if (selectedProp && selectedProp.id === propId) {
          setSelectedProp({ ...selectedProp, estado: 'vendida' });
        }
        fetchPropiedades(activeUserToken);
      }
    } catch (e) {
      console.error('Error registering purchase interest:', e);
    }
  };

  // Handle clicking "Comprar"
  const handleBuyClick = () => {
    if (!currentUser) {
      // Not logged in -> show login/register modal
      setAuthError('');
      setRegError('');
      setAuthTab('login');
      setShowAuthModal(true);
    } else {
      // Logged in -> register interest
      registerPurchaseInterest(selectedProp.id);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
    setInterestRegistered(false);
  };

  const handleSolicitarAgenteClick = () => {
    setSolicitudExperiencia('');
    setSolicitudLicencia('');
    setSolicitudMotivo('');
    setShowSolicitudModal(true);
  };

  const handleEnviarSolicitud = async (e) => {
    if (e) e.preventDefault();
    if (!solicitudExperiencia.trim() || !solicitudMotivo.trim()) {
      showToast('Por favor complete los datos obligatorios (Experiencia y Motivo de postulación).', 'error');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/usuarios/solicitar-agente`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          experienciaAgente: solicitudExperiencia,
          licenciaAgente: solicitudLicencia || undefined,
          motivoAgente: solicitudMotivo
        })
      });
      if (response.ok) {
        setCurrentUser({
          ...currentUser,
          solicitudAgente: true,
          experienciaAgente: solicitudExperiencia,
          licenciaAgente: solicitudLicencia,
          motivoAgente: solicitudMotivo
        });
        setShowSolicitudModal(false);
        showToast('Solicitud de privilegios de Agente enviada al Administrador con éxito.', 'success');
      } else {
        showToast('Hubo un error al procesar la solicitud.', 'error');
      }
    } catch (error) {
      console.warn('Failed to submit agent request:', error);
      showToast('Error de conexión.', 'error');
    }
  };

  const handleDismissSolicitudStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/clientes/perfil`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estadoSolicitud: 'ninguna' })
      });
      if (response.ok) {
        setCurrentUser({ ...currentUser, estadoSolicitud: 'ninguna' });
      }
    } catch (error) {
      console.error('Error al descartar estado de solicitud:', error);
    }
  };

  // Filtering
  const filteredPropiedades = propiedades.filter((p) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      !searchTerm || 
      p.titulo.toLowerCase().includes(searchLower) || 
      (p.direccion && p.direccion.toLowerCase().includes(searchLower)) ||
      (parseDescripcion(p.descripcion).toLowerCase().includes(searchLower));

    const matchesCanton = !selectedCanton || Number(p.canton_id) === Number(selectedCanton);
    const matchesParroquia = !selectedParroquia || Number(p.parroquia_id) === Number(selectedParroquia);
    const matchesTipo = !selectedTipo || p.tipo_inmueble === selectedTipo;
    const matchesPrice = !maxPrice || p.precio <= Number(maxPrice);

    return matchesSearch && matchesCanton && matchesParroquia && matchesTipo && matchesPrice;
  });

  // Sorting
  const sortedPropiedades = [...filteredPropiedades].sort((a, b) => {
    if (sortBy === 'price_asc') return a.precio - b.precio;
    if (sortBy === 'price_desc') return b.precio - a.precio;
    if (sortBy === 'size_desc') return (b.superficie_m2 || 0) - (a.superficie_m2 || 0);
    return 0;
  });

  const getFirstImage = (imagenes) => {
    if (!imagenes || imagenes.length === 0) return '';
    return imagenes[0];
  };

  const getCantonName = (cantonId) => {
    const c = cantones.find(x => Number(x.id) === Number(cantonId));
    return c ? c.nombre : '';
  };

  return (
    <div className="catalog-wrapper">
      {/* NAVBAR */}
      <header className="catalog-header">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="brand-logo">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="brand-title">InmoEcuador</h1>
              <p className="brand-subtitle">Bolívar, Ecuador</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-3 bg-blue-50/80 px-4 py-2 rounded-xl border border-blue-100">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-blue-900">
                  <User className="w-4 h-4 text-blue-600" />
                  {currentUser.nombre} 
                  <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-black uppercase">
                    {currentUser.rol}
                  </span>
                </span>

                {currentUser.rol === 'cliente' && (
                  currentUser.solicitudAgente ? (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1.5 rounded-lg font-bold" title="Solicitud Agente Pendiente">
                      ⏳ Pendiente
                    </span>
                  ) : (
                    <button 
                      onClick={handleSolicitarAgenteClick}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-bold transition"
                    >
                      🔑 Ser Agente
                    </button>
                  )
                )}
                
                {currentUser.rol !== 'cliente' && (
                  <button onClick={onNavigateToDashboard} className="btn-admin-access text-xs py-1.5 px-3">
                    Panel Interno
                  </button>
                )}
                
                <button onClick={handleLogout} className="text-red-500 hover:text-red-700 transition" title="Cerrar Sesión" aria-label="Cerrar sesión">
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => { setAuthTab('login'); setShowAuthModal(true); setAuthError(''); }} className="btn-login-public">
                  Iniciar Sesión
                </button>
                <button onClick={onNavigateToDashboard} className="btn-admin-access">
                  <span>Acceso Administrativo</span>
                  <ArrowRight className="w-4 h-4 transition-transform" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {currentUser && (currentUser.estadoSolicitud === 'aprobada' || currentUser.estadoSolicitud === 'rechazada') && (
        <div className="max-w-7xl mx-auto px-4 pt-6 sm:px-6 lg:px-8">
          {currentUser.estadoSolicitud === 'aprobada' ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎉</span>
                <div>
                  <h4 className="text-sm font-bold text-green-900 text-left">¡Solicitud Aprobada!</h4>
                  <p className="text-xs text-green-700 text-left">Tu solicitud para ser Agente ha sido aceptada por el Administrador. Ahora tienes privilegios de Agente.</p>
                </div>
              </div>
              <button 
                onClick={() => handleDismissSolicitudStatus()}
                className="bg-green-100 hover:bg-green-200 text-green-800 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
              >
                Entendido
              </button>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-2xl">❌</span>
                <div>
                  <h4 className="text-sm font-bold text-red-900 text-left">Solicitud Rechazada</h4>
                  <p className="text-xs text-red-700 text-left">Tu solicitud para ser Agente ha sido rechazada por el Administrador.</p>
                </div>
              </div>
              <button 
                onClick={() => handleDismissSolicitudStatus()}
                className="bg-red-100 hover:bg-red-200 text-red-800 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
              >
                Entendido
              </button>
            </div>
          )}
        </div>
      )}

      {/* HERO SECTION */}
      <section className="catalog-hero">
        <div className="catalog-hero-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 py-20 sm:py-28 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="badge-luxury">
            <Sparkles className="w-4 h-4" />
            <span>Encuentra tu hogar soñado en Bolívar</span>
          </div>
          <h2 className="hero-title">
            Tu puerta a las mejores propiedades
          </h2>
          <p className="hero-description">
            Casas, departamentos, locales comerciales y terrenos exclusivos en Guaranda, San Miguel, Chimbo y más. Explora sin iniciar sesión.
          </p>

          {/* SEARCH BAR */}
          <div className="hero-search-container">
            <div className="search-input-wrapper">
              <Search className="search-icon text-blue-600" />
              <input
                type="text"
                placeholder="Busca por palabra clave, título o dirección..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="hero-search-input"
                aria-label="Buscar propiedades"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="clear-search-btn" aria-label="Limpiar búsqueda">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        
        {/* FILTERS PANEL */}
        <section className="filters-section bg-white rounded-2xl shadow-lg p-6 mb-8 border border-slate-100">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
            <SlidersHorizontal className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">Búsqueda avanzada</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Canton */}
            <div className="filter-group">
              <label className="filter-label" htmlFor="filter-canton">Cantón</label>
              <select
                id="filter-canton"
                value={selectedCanton}
                onChange={(e) => setSelectedCanton(e.target.value)}
                className="filter-select"
              >
                <option value="">Todos los cantones</option>
                {cantones.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>

            {/* Parroquia */}
            <div className="filter-group">
              <label className="filter-label" htmlFor="filter-parroquia">Parroquia</label>
              <select
                id="filter-parroquia"
                value={selectedParroquia}
                onChange={(e) => setSelectedParroquia(e.target.value)}
                className="filter-select"
                disabled={!selectedCanton}
              >
                <option value="">Todas las parroquias</option>
                {parroquias.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>

            {/* Tipo */}
            <div className="filter-group">
              <label className="filter-label" htmlFor="filter-tipo">Tipo de Inmueble</label>
              <select
                id="filter-tipo"
                value={selectedTipo}
                onChange={(e) => setSelectedTipo(e.target.value)}
                className="filter-select"
              >
                <option value="">Todos los tipos</option>
                <option value="casa">Casa</option>
                <option value="departamento">Departamento</option>
                <option value="terreno">Terreno</option>
                <option value="local">Local Comercial</option>
              </select>
            </div>

            {/* Precio */}
            <div className="filter-group">
              <label className="filter-label" htmlFor="filter-price">Precio Máximo</label>
              <div className="price-input-wrapper">
                <span className="price-currency">$</span>
                <input
                  id="filter-price"
                  type="number"
                  placeholder="Cualquier precio"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="filter-input-price"
                />
              </div>
            </div>

            {/* Orden */}
            <div className="filter-group">
              <label className="filter-label" htmlFor="filter-sort">Ordenar por</label>
              <select
                id="filter-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="newest">Más recientes</option>
                <option value="price_asc">Menor precio</option>
                <option value="price_desc">Mayor precio</option>
                <option value="size_desc">Mayor área (m²)</option>
              </select>
            </div>

          </div>

          {(searchTerm || selectedCanton || selectedTipo || maxPrice || sortBy !== 'newest') && (
            <div className="flex justify-end mt-4">
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCanton('');
                  setSelectedTipo('');
                  setMaxPrice('');
                  setSortBy('newest');
                }}
                className="reset-filters-btn"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </section>

        {/* PROPERTIES GRID */}
        <section className="results-section">
          <div className="results-header mb-6">
            <h4 className="results-count font-bold text-slate-800 text-base">
              {sortedPropiedades.length === 1 
                ? '1 propiedad encontrada' 
                : `${sortedPropiedades.length} propiedades encontradas`}
            </h4>
          </div>

          {loading ? (
            <div className="loading-container py-20 text-center" role="status" aria-live="polite">
              <div className="spinner mb-4" aria-hidden="true"></div>
              <p className="text-slate-500 font-medium">Buscando en la base de datos...</p>
            </div>
          ) : sortedPropiedades.length > 0 ? (
            <div className="properties-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedPropiedades.map((prop) => (
                <article 
                  key={prop.id} 
                  className="property-card bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition cursor-pointer border border-slate-100"
                  onClick={() => {
                    setSelectedProp(prop);
                    setActiveImageIdx(0);
                  }}
                >
                  <div className="property-card-image-wrapper relative">
                    {getFirstImage(prop.imagenes) ? (
                      <img 
                        src={getFirstImage(prop.imagenes)} 
                        alt={prop.titulo}
                        className="property-card-image"
                        loading="lazy"
                        onError={(e) => { e.target.src = PLACEHOLDER; }}
                      />
                    ) : (
                      <div className="fallback-image-placeholder">
                        <Building className="w-12 h-12 text-blue-200 mb-2" />
                        <span className="text-xs text-blue-500 font-bold uppercase tracking-wider">Sin imagen cargada</span>
                      </div>
                    )}
                    
                    <div className="card-price-badge">
                      ${prop.precio?.toLocaleString('es-EC')}
                    </div>

                    <div className="card-top-tags flex flex-col gap-1.5 items-start">
                      <span className={`tag-type tag-${prop.tipo_inmueble}`}>
                        {prop.tipo_inmueble.toUpperCase()}
                      </span>
                      {prop.estado === 'vendida' && (
                        <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow uppercase">
                          VENDIDA
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="property-card-body p-6">
                    <div className="card-location mb-2 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="location-text text-slate-500 font-bold truncate text-[10px]">
                        {getCantonName(prop.canton_id) || prop.canton?.nombre || 'BOLÍVAR'}, {prop.direccion}
                      </span>
                    </div>

                    <h3 className="card-title text-slate-900 font-black mb-3">
                      {prop.titulo}
                    </h3>

                    <p className="card-description text-slate-500 text-xs mb-5 line-clamp-2 leading-relaxed">
                      {parseDescripcion(prop.descripcion)}
                    </p>

                    <div className="card-features border-t border-slate-100 pt-4 flex justify-between text-slate-500 text-[11px] font-semibold">
                      {prop.tipo_inmueble !== 'terreno' && (
                        <>
                          <div className="feature-item">
                            <Bed className="w-4 h-4 text-blue-500" />
                            <span>{getDormitorios(prop)} Dorms</span>
                          </div>
                          <div className="feature-item">
                            <Bath className="w-4 h-4 text-blue-500" />
                            <span>{getBanos(prop)} Baños</span>
                          </div>
                        </>
                      )}
                      <div className="feature-item">
                        <Maximize2 className="w-4 h-4 text-blue-500" />
                        <span>{prop.superficie_m2} m²</span>
                      </div>
                    </div>
                    {currentUser?.rol === 'administrador' && (
                      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={(e) => handleDelete(prop.id, e)}
                          className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs py-1.5 px-3 rounded-lg transition"
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-results-state text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <Info className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h5 className="text-lg font-bold text-slate-800 mb-1">Sin propiedades</h5>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">
                No hay propiedades en la base de datos que coincidan con los filtros seleccionados.
              </p>
            </div>
          )}
        </section>
      </main>

      {/* PROPERTY DETAILS MODAL */}
      {selectedProp && (
        <div
          className="modal-backdrop fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedProp(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="catalog-modal-title"
          onKeyDown={(e) => { if (e.key === 'Escape') setSelectedProp(null); }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            
            <button onClick={() => setSelectedProp(null)} className="modal-close-btn" aria-label="Cerrar detalle">
              <X className="w-5 h-5 text-slate-600" />
            </button>

            <div className="modal-grid">
              
              {/* IMAGE GALLERY SLIDER */}
              <div className="modal-gallery-col">
                {selectedProp.imagenes && selectedProp.imagenes.length > 0 ? (
                  <>
                    <img 
                      src={selectedProp.imagenes[activeImageIdx]} 
                      alt={selectedProp.titulo} 
                      className="modal-gallery-image"
                      onError={(e) => { e.target.src = PLACEHOLDER; }}
                    />
                    
                    {selectedProp.imagenes.length > 1 && (
                      <>
                        <button onClick={(e) => handlePrevImage(e, selectedProp.imagenes)} className="slider-nav-btn slider-prev-btn" aria-label="Imagen anterior">
                          <ChevronLeft className="w-5 h-5 text-slate-800" />
                        </button>
                        <button onClick={(e) => handleNextImage(e, selectedProp.imagenes)} className="slider-nav-btn slider-next-btn" aria-label="Imagen siguiente">
                          <ChevronRight className="w-5 h-5 text-slate-800" />
                        </button>

                        <div className="slider-indicators">
                          {selectedProp.imagenes.map((_, idx) => (
                            <span
                              key={idx}
                              className={`indicator-dot ${idx === activeImageIdx ? 'active' : ''}`}
                              onClick={() => setActiveImageIdx(idx)}
                              role="button"
                              aria-label={`Ir a imagen ${idx + 1}`}
                            ></span>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="modal-no-image-placeholder text-center">
                    <Building className="w-16 h-16 text-slate-600 mx-auto mb-2" />
                    <span className="text-slate-400 text-xs">Sin imágenes registradas</span>
                  </div>
                )}

                <span className={`modal-tag-type tag-${selectedProp.tipo_inmueble}`}>
                  {selectedProp.tipo_inmueble.toUpperCase()}
                </span>
              </div>

              {/* DETAILS AND ACTIONS */}
              <div className="modal-details-col">
                <div>
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <span className="modal-canton-badge">
                      {getCantonName(selectedProp.canton_id) || selectedProp.canton?.nombre || 'PROVINCIA BOLÍVAR'}
                    </span>
                    <div className="modal-price">
                      ${selectedProp.precio?.toLocaleString('es-EC')}
                    </div>
                  </div>

                  <h3 className="modal-title text-2xl font-black text-slate-900 mb-4 leading-tight" id="catalog-modal-title">
                    {selectedProp.titulo}
                  </h3>

                  <div className="modal-address flex items-start gap-2 text-slate-600 text-sm mb-6 pb-4 border-b border-slate-100">
                    <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    {currentUser ? (
                      <span className="font-semibold text-slate-900">{selectedProp.direccion}</span>
                    ) : (
                      <span className="font-semibold text-slate-400 italic">
                        🔒 Inicia sesión para ver la dirección exacta
                      </span>
                    )}
                  </div>

                  {/* SPECS */}
                  <div className="modal-specs grid grid-cols-3 gap-3 mb-6 bg-slate-50 p-4 rounded-2xl">
                    <div className="spec-box text-center">
                      <span className="spec-val font-black text-slate-900 block text-base">
                        {selectedProp.superficie_m2}
                      </span>
                      <span className="spec-lbl text-[10px] text-slate-500 font-bold uppercase">Superficie</span>
                    </div>
                    {selectedProp.tipo_inmueble !== 'terreno' ? (
                      <>
                        <div className="spec-box text-center border-l border-slate-200">
                          <span className="spec-val font-black text-slate-900 block text-base">
                            {getDormitorios(selectedProp)}
                          </span>
                          <span className="spec-lbl text-[10px] text-slate-500 font-bold uppercase">Cuartos</span>
                        </div>
                        <div className="spec-box text-center border-l border-slate-200">
                          <span className="spec-val font-black text-slate-900 block text-base">
                            {getBanos(selectedProp)}
                          </span>
                          <span className="spec-lbl text-[10px] text-slate-500 font-bold uppercase">Baños</span>
                        </div>
                      </>
                    ) : (
                      <div className="spec-box text-center col-span-2 border-l border-slate-200 flex items-center justify-center">
                        <span className="text-[10px] text-blue-600 font-black uppercase tracking-wider">Terreno edificable</span>
                      </div>
                    )}
                  </div>

                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">Descripción</h4>
                  <p className="modal-desc text-slate-600 text-sm leading-relaxed mb-6 max-h-[120px] overflow-y-auto pr-2">
                    {parseDescripcion(selectedProp.descripcion)}
                  </p>

                  {/* AGENTE CONTACT INFO */}
                  <div className="mb-6">
                    {currentUser ? (
                      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
                        <span className="text-[10px] font-black tracking-wider text-blue-800 uppercase block mb-2">👨‍💼 Agente de Ventas Asignado</span>
                        {selectedProp.agente ? (
                          <div className="space-y-1.5 text-xs text-slate-700">
                            <p className="font-bold text-slate-900 text-sm">{selectedProp.agente.nombre}</p>
                            <p className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-slate-500" />
                              <span>{selectedProp.agente.telefono || 'Sin teléfono'}</span>
                            </p>
                            <p className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-slate-500" />
                              <span className="break-all">{selectedProp.agente.email}</span>
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 italic">No hay agente asignado a esta propiedad.</p>
                        )}
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-4 text-center">
                        <span className="text-xs font-bold text-slate-500 block mb-1">👨‍💼 Datos de Contacto del Agente</span>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          🔒 Inicia sesión o regístrate para ver el nombre, teléfono y email del agente a cargo.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* PURCHASE CTAS */}
                <div className="purchase-cta-box bg-slate-50 rounded-2xl p-5 border border-slate-200">
                  {selectedProp.estado === 'vendida' ? (
                    <div className="text-center py-2">
                      <div className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1.5 rounded-lg inline-block mb-2 uppercase">
                        🔴 Vendido
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Esta propiedad ya ha sido vendida y no está disponible para adquisición.
                      </p>
                    </div>
                  ) : interestRegistered ? (
                    <div className="text-center py-2">
                      <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                      <h5 className="font-bold text-slate-900 text-sm mb-1">¡Interés Registrado!</h5>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Ya registraste tu interés de compra en esta propiedad. Un asesor se comunicará contigo en breve.
                      </p>
                    </div>
                  ) : (
                    <>
                      <h5 className="font-bold text-slate-800 text-xs mb-3 flex items-center gap-1.5 justify-center uppercase tracking-wide">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        <span>Adquisición Directa</span>
                      </h5>
                      
                      <div className="flex flex-col gap-2">
                        <button onClick={handleBuyClick} className="btn-buy-property">
                          🤝 Comprar esta Propiedad
                        </button>
                        <p className="text-[10px] text-slate-400 text-center leading-normal">
                          {!currentUser 
                            ? 'Se te solicitará registrarte o iniciar sesión para formalizar tu solicitud.' 
                            : 'Al hacer clic, registraremos tu interés oficial de compra en la base de datos.'}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {currentUser?.rol === 'administrador' && (
                  <div className="admin-actions-box mt-4 bg-red-50/50 rounded-2xl p-5 border border-red-200 text-center">
                    <h5 className="font-bold text-red-800 text-xs mb-3 uppercase tracking-wide">
                      ⚙️ Acciones de Administrador
                    </h5>
                    <button 
                      onClick={(e) => handleDelete(selectedProp.id, e)} 
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 px-4 rounded-xl transition"
                    >
                      🗑️ Eliminar Propiedad
                    </button>
                  </div>
                )}

              </div>

            </div>

          </div>
        </div>
      )}

      {/* LOGIN/REGISTER MODAL (CLIENT SIDE FLOW) */}
      {showAuthModal && (
        <div
          className="modal-backdrop fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAuthModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
          onKeyDown={(e) => { if (e.key === 'Escape') setShowAuthModal(false); }}
        >
          <div className="auth-modal-content bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowAuthModal(false)} className="modal-close-btn" aria-label="Cerrar">
              <X className="w-5 h-5 text-slate-500" />
            </button>

            <div className="auth-tabs flex border-b border-slate-100 mb-6" role="tablist">
              <button 
                onClick={() => { setAuthTab('login'); setAuthError(''); }} 
                className={`auth-tab-btn flex-1 py-3 text-center text-sm font-bold transition ${authTab === 'login' ? 'active-tab' : 'text-slate-400'}`}
                role="tab"
                aria-selected={authTab === 'login'}
                aria-controls="auth-login-panel"
              >
                Iniciar Sesión
              </button>
              <button 
                onClick={() => { setAuthTab('register'); setRegError(''); }} 
                className={`auth-tab-btn flex-1 py-3 text-center text-sm font-bold transition ${authTab === 'register' ? 'active-tab' : 'text-slate-400'}`}
                role="tab"
                aria-selected={authTab === 'register'}
                aria-controls="auth-register-panel"
              >
                Crear Cuenta
              </button>
            </div>

            {authTab === 'login' ? (
              <form onSubmit={handleAuthLoginSubmit} className="space-y-4" id="auth-login-panel" role="tabpanel">
                <h3 className="text-xl font-black text-slate-900 mb-2" id="auth-modal-title">Ingresa a tu cuenta</h3>
                <p className="text-slate-500 text-xs mb-4">Inicia sesión para registrar tu interés en comprar este inmueble.</p>
                
                <div className="form-group-custom">
                  <label className="input-label-custom" htmlFor="auth-email">Correo Electrónico</label>
                  <input
                    id="auth-email"
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="input-custom"
                    required
                    placeholder="ejemplo@correo.com"
                  />
                </div>

                <div className="form-group-custom">
                  <label className="input-label-custom" htmlFor="auth-password">Contraseña</label>
                  <input
                    id="auth-password"
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="input-custom"
                    required
                    placeholder="••••••••"
                  />
                </div>

                {authError && <div className="error-alert" role="alert">{authError}</div>}

                <button type="submit" className="btn-auth-submit">
                  Ingresar y Continuar Compra
                </button>
              </form>
            ) : (
              <form onSubmit={handleAuthRegisterSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1" id="auth-register-panel" role="tabpanel">
                <h3 className="text-xl font-black text-slate-900 mb-2">Regístrate como Cliente</h3>
                <p className="text-slate-500 text-xs mb-4">Crea una cuenta rápida y formaliza tu interés en adquirir propiedades.</p>

                <div className="form-group-custom">
                  <label className="input-label-custom" htmlFor="reg-nombre">Nombre Completo</label>
                  <input
                    id="reg-nombre"
                    type="text"
                    value={regNombre}
                    onChange={(e) => setRegNombre(e.target.value)}
                    className="input-custom"
                    required
                    placeholder="Juan Pérez"
                  />
                </div>

                <div className="form-group-custom">
                  <label className="input-label-custom" htmlFor="reg-email">Correo Electrónico</label>
                  <input
                    id="reg-email"
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="input-custom"
                    required
                    placeholder="juan@correo.com"
                  />
                </div>

                <div className="form-group-custom">
                  <label className="input-label-custom" htmlFor="reg-password">Contraseña (mínimo 6 caracteres)</label>
                  <input
                    id="reg-password"
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="input-custom"
                    required
                    placeholder="••••••••"
                  />
                </div>

                <div className="form-group-custom">
                  <label className="input-label-custom" htmlFor="reg-telefono">Teléfono (opcional)</label>
                  <input
                    id="reg-telefono"
                    type="text"
                    value={regTelefono}
                    onChange={(e) => setRegTelefono(e.target.value)}
                    className="input-custom"
                    placeholder="0999999999"
                  />
                </div>

                <div className="form-group-custom">
                  <label className="input-label-custom" htmlFor="reg-cedula">Cédula (opcional)</label>
                  <input
                    id="reg-cedula"
                    type="text"
                    value={regCedula}
                    onChange={(e) => setRegCedula(e.target.value)}
                    className="input-custom"
                    placeholder="0201234567"
                  />
                </div>

                <div className="form-group-custom">
                  <label className="input-label-custom" htmlFor="reg-direccion">Dirección (opcional)</label>
                  <input
                    id="reg-direccion"
                    type="text"
                    value={regDireccion}
                    onChange={(e) => setRegDireccion(e.target.value)}
                    className="input-custom"
                    placeholder="Guaranda, Bolívar"
                  />
                </div>

                {regError && <div className="error-alert" role="alert">{regError}</div>}

                <button type="submit" className="btn-auth-submit">
                  Registrarse y Comprar Inmueble
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SOLICITUD AGENTE MODAL */}
      {showSolicitudModal && (
        <div
          className="modal-backdrop fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSolicitudModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="solicitud-modal-title"
          onKeyDown={(e) => { if (e.key === 'Escape') setShowSolicitudModal(false); }}
        >
          <div className="auth-modal-content bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowSolicitudModal(false)} className="modal-close-btn" aria-label="Cerrar">
              <X className="w-5 h-5 text-slate-500" />
            </button>

            <form onSubmit={handleEnviarSolicitud} className="space-y-4">
              <h3 className="text-xl font-black text-slate-900 mb-2" id="solicitud-modal-title">Solicitar ser Agente</h3>
              <p className="text-slate-500 text-xs mb-4">
                Para postularte como agente de ventas, ingresa los siguientes datos importantes sobre tu perfil profesional. Tu información personal registrada ya será enviada al administrador.
              </p>
              
              <div className="form-group-custom">
                <label className="input-label-custom" htmlFor="sol-experiencia">Experiencia Laboral (Años o descripción)</label>
                <textarea
                  id="sol-experiencia"
                  value={solicitudExperiencia}
                  onChange={(e) => setSolicitudExperiencia(e.target.value)}
                  className="input-custom min-h-[60px] resize-none"
                  required
                  placeholder="Ej: 3 años en ventas de terrenos, o agente independiente..."
                />
              </div>

              <div className="form-group-custom">
                <label className="input-label-custom" htmlFor="sol-licencia">Registro / Nro Licencia Corredor (Opcional)</label>
                <input
                  id="sol-licencia"
                  type="text"
                  value={solicitudLicencia}
                  onChange={(e) => setSolicitudLicencia(e.target.value)}
                  className="input-custom"
                  placeholder="Ej: L-384920"
                />
              </div>

              <div className="form-group-custom">
                <label className="input-label-custom" htmlFor="sol-motivo">Motivo de postulación</label>
                <textarea
                  id="sol-motivo"
                  value={solicitudMotivo}
                  onChange={(e) => setSolicitudMotivo(e.target.value)}
                  className="input-custom min-h-[60px] resize-none"
                  required
                  placeholder="¿Por qué deseas trabajar como agente en la plataforma?"
                />
              </div>

              <button type="submit" className="btn-auth-submit mt-2">
                Enviar Solicitud
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="catalog-footer mt-24">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 text-center text-sm">
          <p className="text-slate-400 font-bold">© 2026 InmoEcuador - Plataforma de Bienes Inmuebles. Bolívar, Ecuador.</p>
          <p className="text-slate-500 text-xs mt-2 font-medium">Guaranda - San Miguel - Chimbo - Chillanes - Echeandía - Caluma - Las Naves</p>
        </div>
      </footer>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        message={confirmDelete.message}
        onConfirm={executeDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, message: '', id: null })}
      />
    </div>
  );
}
