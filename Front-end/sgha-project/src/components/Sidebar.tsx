import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "../styles/components/Sidebar.css";

const Sidebar = () => {
  const location = useLocation();
  const { usuario } = useAuth();

  if (usuario?.rol.id_rol === 1 || usuario?.rol.id_rol === 2) {
    return null;
  }

  const basePath = `/dashboard/${usuario?.rol.nombre_rol.toLowerCase()}`;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setIsMobileMenuOpen(false);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleLinkClick = () => {
    if (isMobile) setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const handleOverlayClick = () => setIsMobileMenuOpen(false);

  useEffect(() => {
    document.body.style.overflow =
      isMobile && isMobileMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobile, isMobileMenuOpen]);

  return (
    <>
      {isMobile && (
        <button
          className={`mobile-menu-toggle ${isMobileMenuOpen ? "active" : ""}`}
          onClick={toggleMobileMenu}
          aria-label="Abrir/cerrar menú">
          <span></span>
          <span></span>
          <span></span>
        </button>
      )}

      {isMobile && (
        <div
          className={`mobile-menu-overlay ${isMobileMenuOpen ? "active" : ""}`}
          onClick={handleOverlayClick}
        />
      )}

      <aside
        className={`sidebar-menu ${
          isMobile ? (isMobileMenuOpen ? "mobile-open" : "mobile-closed") : ""
        }`}>
        {isMobile && (
          <button
            className="mobile-menu-close"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Cerrar menú">
            ×
          </button>
        )}

        {/* Sección 1: Inicio */}
        <Link
          to={basePath}
          className={`sidebar-menu-item ${
            location.pathname === basePath ? "selected" : ""
          }`}
          onClick={handleLinkClick}>
          🏠 Inicio
        </Link>

        <div className="accordion" id="accordionSidebar">
          {/* Sección 2: Actualizar datos */}
          <div className="accordion-item bg-transparent border-0">
            <h2 className="accordion-header">
              <button
                className="accordion-button collapsed bg-transparent text-white p-2"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseActualizar">
                📁 Actualizar Datos
              </button>
            </h2>
            <div
              id="collapseActualizar"
              className="accordion-collapse collapse"
              data-bs-parent="#accordionSidebar">
              <div className="accordion-body p-0 d-flex flex-column gap-2">
                <Link
                  to={`${basePath}/facultades`}
                  className={`sidebar-menu-item ${
                    location.pathname.includes("facultades") ? "selected" : ""
                  }`}
                  onClick={handleLinkClick}>
                  Facultades
                </Link>
                <Link
                  to={`${basePath}/carreras`}
                  className={`sidebar-menu-item ${
                    location.pathname.includes("carreras") ? "selected" : ""
                  }`}
                  onClick={handleLinkClick}>
                  Carreras
                </Link>
                <Link
                  to={`${basePath}/aulas`}
                  className={`sidebar-menu-item ${
                    location.pathname.includes("aulas") ? "selected" : ""
                  }`}
                  onClick={handleLinkClick}>
                  Aulas
                </Link>
                <Link
                  to={`${basePath}/asignaturas`}
                  className={`sidebar-menu-item ${
                    location.pathname.includes("asignaturas") ? "selected" : ""
                  }`}
                  onClick={handleLinkClick}>
                  Asignaturas
                </Link>
                <Link
                  to={`${basePath}/asignatura-carreras`}
                  className={`sidebar-menu-item ${
                    location.pathname.includes("asignatura-carreras")
                      ? "selected"
                      : ""
                  }`}
                  onClick={handleLinkClick}>
                  Asignaturas - Carreras
                </Link>
                <Link
                  to={`${basePath}/horas-clase`}
                  className={`sidebar-menu-item ${
                    location.pathname.includes("horas-clase") ? "selected" : ""
                  }`}
                  onClick={handleLinkClick}>
                  Horas predeterminadas
                </Link>
                <Link
                  to={`${basePath}/usuario-carrera`}
                  className={`sidebar-menu-item ${
                    location.pathname.includes("usuario-carrera")
                      ? "selected"
                      : ""
                  }`}
                  onClick={handleLinkClick}>
                  Usuarios - Carreras
                </Link>
                <Link
                  to={`${basePath}/usuario-asignatura`}
                  className={`sidebar-menu-item ${
                    location.pathname.includes("usuario-asignatura")
                      ? "selected"
                      : ""
                  }`}
                  onClick={handleLinkClick}>
                  Docentes - Asignaturas
                </Link>
                <Link
                  to={`${basePath}/usu-asig-estudiante`}
                  className={`sidebar-menu-item ${
                    location.pathname.includes("usu-asig-estudiante")
                      ? "selected"
                      : ""
                  }`}
                  onClick={handleLinkClick}>
                  Estudiantes - Asignaturas
                </Link>
                <Link
                  to={`${basePath}/semestre-lectivo`}
                  className={`sidebar-menu-item ${
                    location.pathname.includes("semestre-lectivo")
                      ? "selected"
                      : ""
                  }`}
                  onClick={handleLinkClick}>
                  Años Lectivos
                </Link>
                {usuario?.rol.id_rol === 4 && (
                  <Link
                    to={`${basePath}/usuarios`}
                    className={`sidebar-menu-item ${
                      location.pathname.includes("usuarios") ? "selected" : ""
                    }`}
                    onClick={handleLinkClick}>
                    Gestión de Usuarios
                  </Link>
                )}
                {usuario?.rol.id_rol === 4 && (
                  <Link
                    to={`${basePath}/logs`}
                    className={`sidebar-menu-item ${
                      location.pathname.includes("logs") ? "selected" : ""
                    }`}
                    onClick={handleLinkClick}>
                    Reporte de Logs
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Sección 3: Generar Horario */}
          <div className="accordion-item bg-transparent border-0">
            <h2 className="accordion-header">
              <button
                className="accordion-button collapsed bg-transparent text-white p-2"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseHorario">
                🧠 Generar Horario
              </button>
            </h2>
            <div
              id="collapseHorario"
              className="accordion-collapse collapse"
              data-bs-parent="#accordionSidebar">
              <div className="accordion-body p-0">
                <Link
                  to={`${basePath}/horario`}
                  className={`sidebar-menu-item ${
                    location.pathname.includes("horario") ? "selected" : ""
                  }`}
                  onClick={handleLinkClick}>
                  Horarios
                </Link>
              </div>
            </div>
          </div>

          {/* Sección 4: Reportes */}
          <div className="accordion-item bg-transparent border-0">
            <h2 className="accordion-header">
              <button
                className="accordion-button collapsed bg-transparent text-white p-2"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseReportes">
                📊 Reportes
              </button>
            </h2>
            <div
              id="collapseReportes"
              className="accordion-collapse collapse"
              data-bs-parent="#accordionSidebar">
              <div className="accordion-body p-0">
                <Link
                  to={`${basePath}/reportes`}
                  className={`sidebar-menu-item ${
                    location.pathname.includes("reportes") ? "selected" : ""
                  }`}
                  onClick={handleLinkClick}>
                  Generar Reportes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
