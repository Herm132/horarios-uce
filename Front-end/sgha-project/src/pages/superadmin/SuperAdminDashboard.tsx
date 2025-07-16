import "../../styles/SuperAdmin/SuperAdminDashboard.css";

const SuperAdminDashboard = () => {
  return (
    <div className="dashboard-container text-center">
      <h2 className="dashboard-title">Bienvenido, Admin</h2>

      {/* Carrusel sin contenedor */}
      <div
        id="carouselUCE"
        className="carousel slide dashboard-carousel"
        data-bs-ride="carousel">
        <div className="carousel-indicators">
          <button
            type="button"
            data-bs-target="#carouselUCE"
            data-bs-slide-to="0"
            className="active"></button>
          <button
            type="button"
            data-bs-target="#carouselUCE"
            data-bs-slide-to="1"></button>
          <button
            type="button"
            data-bs-target="#carouselUCE"
            data-bs-slide-to="2"></button>
        </div>
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img
              src="/Decorativa1.jpg"
              className="d-block w-100"
              alt="Imagen 1"
            />
          </div>
          <div className="carousel-item">
            <img
              src="/Decorativa2.jpeg"
              className="d-block w-100"
              alt="Imagen 2"
            />
          </div>
          <div className="carousel-item">
            <img
              src="/Decorativa3.jpg"
              className="d-block w-100"
              alt="Imagen 3"
            />
          </div>
        </div>
        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#carouselUCE"
          data-bs-slide="prev">
          <span className="carousel-control-prev-icon"></span>
        </button>
        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#carouselUCE"
          data-bs-slide="next">
          <span className="carousel-control-next-icon"></span>
        </button>
      </div>

      {/* Botones sin envoltorio Bootstrap */}
      <div className="dashboard-buttons">
        <button className="custom-button">🔄 Actualización de Datos</button>
        <button className="custom-button">📅 Generación de Horarios</button>
        <button className="custom-button">📊 Reportes</button>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
