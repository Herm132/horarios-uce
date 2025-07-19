from django.db import models


class Asignatura(models.Model):
    id_asignatura = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    codigo = models.CharField(unique=True, max_length=20)
    horas_clase = models.IntegerField()
    horas_pae = models.IntegerField()
    semestre = models.IntegerField()
    es_comun = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "asignatura"


class AsignaturaCarrera(models.Model):
    id = models.AutoField(primary_key=True)
    id_asignatura = models.ForeignKey(
        "Asignatura", models.DO_NOTHING, db_column="id_asignatura"
    )
    id_carrera = models.ForeignKey("Carrera", models.DO_NOTHING, db_column="id_carrera")

    class Meta:
        managed = False
        db_table = "asignatura_carrera"


class Aula(models.Model):
    id_aula = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50)
    capacidad = models.IntegerField()
    tipo = models.CharField(max_length=50)
    edificio = models.CharField(max_length=100, blank=True, null=True)
    piso = models.IntegerField(blank=True, null=True)
    id_facultad = models.ForeignKey(
        "Facultad", models.DO_NOTHING, db_column="id_facultad", blank=True, null=True
    )
    uso_general = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "aula"


class Carrera(models.Model):
    id_carrera = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    codigo = models.CharField(unique=True, max_length=20)
    id_facultad = models.ForeignKey(
        "Facultad", models.DO_NOTHING, db_column="id_facultad"
    )

    class Meta:
        managed = False
        db_table = "carrera"


class Docente(models.Model):
    id_usuario = models.OneToOneField(
        "Usuario", models.DO_NOTHING, db_column="id_usuario", primary_key=True
    )
    modalidad_contratacion = models.CharField(max_length=50, blank=True, null=True)
    tiempo_dedicacion = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "docente"


class Facultad(models.Model):
    id_facultad = models.AutoField(primary_key=True)
    nombre = models.CharField(unique=True, max_length=100)

    class Meta:
        managed = False
        db_table = "facultad"


class HoraClase(models.Model):
    id_hora_clase = models.AutoField(primary_key=True)
    dia = models.CharField(max_length=10)
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()

    class Meta:
        managed = False
        db_table = "hora_clase"


class Horario(models.Model):
    id_horario = models.AutoField(primary_key=True)
    id_hora_clase = models.ForeignKey(
        "HoraClase", models.DO_NOTHING, db_column="id_hora_clase"
    )
    id_usuario = models.ForeignKey("Usuario", models.DO_NOTHING, db_column="id_usuario")
    id_asignatura = models.ForeignKey(
        "Asignatura", models.DO_NOTHING, db_column="id_asignatura"
    )
    id_aula = models.ForeignKey("Aula", models.DO_NOTHING, db_column="id_aula")
    paralelo = models.IntegerField()
    id_semestre_lectivo = models.ForeignKey(
        "SemestreLectivo", models.DO_NOTHING, db_column="id_semestre_lectivo"
    )

    class Meta:
        managed = False
        db_table = "horario"


class Rol(models.Model):
    id_rol = models.AutoField(primary_key=True)
    nombre_rol = models.CharField(unique=True, max_length=50)

    class Meta:
        managed = False
        db_table = "rol"


class SemestreLectivo(models.Model):
    id_semestre_lectivo = models.AutoField(primary_key=True)
    anio_inicio = models.IntegerField()
    anio_fin = models.IntegerField()
    periodo = models.CharField(max_length=1)

    class Meta:
        managed = False
        db_table = "semestre_lectivo"

    def __str__(self):
        return f"{self.anio_inicio}-{self.anio_fin} {self.periodo}"


class Usuario(models.Model):
    id_usuario = models.AutoField(primary_key=True)
    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    cedula = models.CharField(unique=True, max_length=10)
    correo = models.CharField(unique=True, max_length=100)
    password = models.TextField()
    id_rol = models.ForeignKey("Rol", models.DO_NOTHING, db_column="id_rol")

    @property
    def id(self):
        return self.id_usuario

    class Meta:
        managed = False
        db_table = "usuario"


class UsuarioAsignatura(models.Model):
    id = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey("Usuario", models.DO_NOTHING, db_column="id_usuario")
    id_asignatura = models.ForeignKey(
        "Asignatura", models.DO_NOTHING, db_column="id_asignatura"
    )
    paralelo = models.IntegerField()

    class Meta:
        managed = False
        db_table = "usuario_asignatura"


class UsuarioAsignaturaEstudiante(models.Model):
    id = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey("Usuario", models.DO_NOTHING, db_column="id_usuario")
    id_asignatura = models.ForeignKey(
        "Asignatura", models.DO_NOTHING, db_column="id_asignatura"
    )
    paralelo = models.IntegerField()

    class Meta:
        managed = False
        db_table = "usuario_asignatura_estudiante"


class UsuarioCarrera(models.Model):
    id = models.AutoField(primary_key=True)

    id_usuario = models.ForeignKey(
        "Usuario",
        models.DO_NOTHING,
        db_column="id_usuario",
        related_name="carreras_asociadas",  # 👈 Relación inversa
    )

    id_carrera = models.ForeignKey("Carrera", models.DO_NOTHING, db_column="id_carrera")

    class Meta:
        managed = False
        db_table = "usuario_carrera"
