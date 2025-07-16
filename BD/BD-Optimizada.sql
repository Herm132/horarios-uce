BEGIN;

-- Tabla de facultades
CREATE TABLE public.facultad (
    id_facultad SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL
);

-- Tabla de carreras
CREATE TABLE public.carrera (
    id_carrera SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    id_facultad INTEGER NOT NULL REFERENCES facultad(id_facultad)
);

-- Tabla de asignaturas
CREATE TABLE public.asignatura (
    id_asignatura SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    horas_clase INTEGER NOT NULL,
    horas_pae INTEGER NOT NULL,
    semestre INTEGER NOT NULL,
    es_comun BOOLEAN DEFAULT false
);

-- Relación asignatura-carrera
CREATE TABLE public.asignatura_carrera (
    id SERIAL PRIMARY KEY,
    id_asignatura INTEGER NOT NULL REFERENCES asignatura(id_asignatura),
    id_carrera INTEGER NOT NULL REFERENCES carrera(id_carrera),
    es_basica BOOLEAN DEFAULT false
);

-- Tabla de aulas
CREATE TABLE public.aula (
    id_aula SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    capacidad INTEGER NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    edificio VARCHAR(100),
    piso INTEGER,
    id_facultad INTEGER REFERENCES facultad(id_facultad),
    uso_general BOOLEAN DEFAULT false
);

-- Tabla de roles
CREATE TABLE public.rol (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) UNIQUE NOT NULL
);

-- Tabla de usuarios
CREATE TABLE public.usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    cedula CHAR(10) UNIQUE NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    id_rol INTEGER NOT NULL REFERENCES rol(id_rol)
);

-- Tabla intermedia: un usuario puede pertenecer a muchas carreras
CREATE TABLE public.usuario_carrera (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario),
    id_carrera INTEGER NOT NULL REFERENCES carrera(id_carrera)
);

-- Tabla de docentes (vinculada a usuario)
CREATE TABLE public.docente (
    id_usuario INTEGER PRIMARY KEY REFERENCES usuario(id_usuario),
    modalidad_contratacion VARCHAR(50),
    tiempo_dedicacion VARCHAR(50)
);

-- Tabla de horas de clase
CREATE TABLE public.hora_clase (
    id_hora_clase SERIAL PRIMARY KEY,
    dia VARCHAR(10) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL
);

-- Tabla de horarios
CREATE TABLE public.horario (
    id_horario SERIAL PRIMARY KEY,
    id_hora_clase INTEGER NOT NULL REFERENCES hora_clase(id_hora_clase),
    id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario),
    id_asignatura INTEGER NOT NULL REFERENCES asignatura(id_asignatura),
    id_aula INTEGER NOT NULL REFERENCES aula(id_aula),
    paralelo INTEGER NOT NULL,
    semestre_lectivo VARCHAR(50) NOT NULL
);

-- Tabla de asignaturas por usuario (docente)
CREATE TABLE public.usuario_asignatura (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario),
    id_asignatura INTEGER NOT NULL REFERENCES asignatura(id_asignatura),
    paralelo INTEGER NOT NULL,
    total_estudiantes INTEGER
);

-- Tabla de asignaturas por estudiante
CREATE TABLE public.usuario_asignatura_estudiante (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario),
    id_asignatura INTEGER NOT NULL REFERENCES asignatura(id_asignatura),
    paralelo INTEGER NOT NULL
);

END;
