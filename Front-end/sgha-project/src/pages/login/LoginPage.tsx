import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import "../../styles/Login/login.css";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(correo, password);
      const storedUser = JSON.parse(localStorage.getItem("usuario") || "{}");

      switch (storedUser.rol.id_rol) {
        case 1:
          navigate("/dashboard/estudiante");
          break;
        case 2:
          navigate("/dashboard/docente");
          break;
        case 3:
          navigate("/dashboard/admin");
          break;
        case 4:
          navigate("/dashboard/superadmin");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      setError("Correo o contraseña incorrectos");
    }
  };

  return (
    <div>
      {/* Figuras decorativas detrás */}
      <div className="background-shapes">
        <div className="rectangle rect-top" />
        <div className="oval oval-left" />
        <div className="rectangle rect-right" />
        <div className="oval oval-right" />
      </div>

      <div>
        {/* Imagen encabezado superior */}
        <div className="header-image" />

        {/* Texto título principal */}
        <h1 className="main-title">
          SISTEMA DE GENERACION DE HORARIOS ACADEMICOS
        </h1>

        {/* Contenedor centrado */}
        <div className="main-container">
          {/* Parte izquierda: formulario */}
          <form className="login-form" onSubmit={handleSubmit}>
            <h2 className="login-title">Iniciar Sesión</h2>

            <div className="textbox">
              <label className="label">Usuario</label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="example.email@gmail.com"
                required
              />
            </div>

            <div className="textbox">
              <label className="label">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter at least 8+ characters"
                required
              />
            </div>

            {error && <p className="error-text">{error}</p>}

            <button type="submit" className="button">
              Entrar
            </button>
          </form>

          {/* Parte derecha: imagen escudo */}
          <div className="right-section">
            <img src="/Login.png" alt="Escudo UCE" className="escudo" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
