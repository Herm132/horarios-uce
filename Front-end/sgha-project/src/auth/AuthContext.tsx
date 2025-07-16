import React, { createContext, useContext, useState } from "react";

// Guardar al usuario y sus tokens (access, refresh).

// Proveer funciones login() y logout().

// Compartir estos datos con el resto de la app.

interface Rol {
  id_rol: number;
  nombre_rol: string;
}

interface Carrera {
  id_carrera: number;
  nombre: string;
  codigo: string;
}

interface Usuario {
  id_usuario: number;
  nombres: string;
  apellidos: string;
  correo: string;
  cedula: string;
  rol: Rol;
  carreras: Carrera[];
}

interface AuthData {
  usuario: Usuario | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (correo: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthData | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  const login = async (correo: string, password: string) => {
    const response = await fetch("http://localhost:8000/api/usuarios/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, password }),
    });

    if (!response.ok) {
      throw new Error("Credenciales inválidas");
    }

    const data = await response.json();

    setAccessToken(data.access);
    setRefreshToken(data.refresh);
    setUsuario(data.usuario);

    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    localStorage.setItem("usuario", JSON.stringify(data.usuario));
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUsuario(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{ usuario, accessToken, refreshToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};
