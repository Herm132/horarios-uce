import { useAuth } from "../auth/AuthContext";
import { useLogout } from "../api/useLogout";
import "../styles/components/Topbar.css";

const Topbar = () => {
  const { usuario } = useAuth();
  const logout = useLogout();
  const carrera = usuario?.carreras?.[0];

  const getIniciales = () => {
    if (!usuario) return "";
    const nombres = usuario.nombres.split(" ");
    const apellidos = usuario.apellidos.split(" ");
    return ((nombres[0]?.[0] || "") + (apellidos[0]?.[0] || "")).toUpperCase();
  };

  let mensajeBienvenida = "Bienvenido";
  if (usuario?.rol.id_rol === 1) {
    mensajeBienvenida = "Bienvenido Estudiante";
  } else if (usuario?.rol.id_rol === 2) {
    mensajeBienvenida = "Bienvenido Docente";
  } else if (usuario?.rol.id_rol === 3) {
    mensajeBienvenida = `Director de Carrera de ${carrera?.nombre} (${carrera?.codigo})`;
  } else if (usuario?.rol.id_rol === 4) {
    mensajeBienvenida = "Bienvenido Administrador";
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <img src="/Login.png" alt="Logo UCE" className="logo-img" />
      </div>

      <div className="topbar-center">
        SISTEMA DE GENERACIÓN DE <br /> HORARIOS ACADÉMICOS
      </div>

      <div className="topbar-right">
        <div className="topbar-user">
          <div className="user-info">
            <div className="rol">{mensajeBienvenida}</div>
            <div className="correo">{usuario?.correo}</div>
          </div>
          <div className="avatar">{getIniciales()}</div>
        </div>
        <button className="logout-button" onClick={logout}>
          🔒 Cerrar sesión
        </button>
      </div>
    </header>
  );
};

export default Topbar;
