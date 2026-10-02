document.addEventListener("DOMContentLoaded", () => {
  const contadores = document.querySelectorAll('.numero-contador');

  const animarContador = (contador) => {
    const objetivo = +contador.getAttribute('data-objetivo');
    const duracion = 1800;
    const duracionFotograma = 1000 / 60;
    const totalFotogramas = Math.round(duracion / duracionFotograma);
    let fotograma = 0;

    const intervaloConteo = setInterval(() => {
      fotograma++;
      const progreso = fotograma / totalFotogramas;
      const conteoActual = Math.round(objetivo * (1 - Math.pow(1 - progreso, 2)));

      contador.innerText = conteoActual.toLocaleString();

      if (fotograma === totalFotogramas) {
        contador.innerText = objetivo.toLocaleString();
        clearInterval(intervaloConteo);
      }
    }, duracionFotograma);
  };

  const observadorVisibilidad = new IntersectionObserver((entradas, observador) => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting) {
        const contador = entrada.target.querySelector('.numero-contador');
        if (contador && !contador.classList.contains('animado')) {
          contador.classList.add('animado');
          animarContador(contador);
        }
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.tarjeta-ventaja').forEach(tarjeta => {
    observadorVisibilidad.observe(tarjeta);
  });
});

const interiorPanel = document.getElementById('interiorPanel');
document.getElementById('botonVerColombia').addEventListener('click', () => {
  interiorPanel.classList.add('girado');
});
document.getElementById('botonVerMundo').addEventListener('click', () => {
  interiorPanel.classList.remove('girado');
});

const datosEgresadosMundo = {
  "US": { nombre: "Estados Unidos", egresados: 25 },
  "CA": { nombre: "Canadá", egresados: 11 },
  "PE": { nombre: "Perú", egresados: 10 },
  "DE": { nombre: "Alemania", egresados: 8 },
  "ES": { nombre: "España", egresados: 8 },
  "AU": { nombre: "Australia", egresados: 7 },
  "MX": { nombre: "México", egresados: 5 },
  "DO": { nombre: "República Dominicana", egresados: 3 },
  "PA": { nombre: "Panamá", egresados: 2 },
  "JP": { nombre: "Japón", egresados: 2 },
  "MT": { nombre: "Malta", egresados: 2 },
  "IT": { nombre: "Italia", egresados: 2 },
  "BO": { nombre: "Bolivia", egresados: 1 },
  "CR": { nombre: "Costa Rica", egresados: 1 },
  "EC": { nombre: "Ecuador", egresados: 1 },
  "NL": { nombre: "Países Bajos", egresados: 1 },
  "CL": { nombre: "Chile", egresados: 1 }
};

fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
  .then(respuesta => respuesta.json())
  .then(datosMapaMundo => {
    const paises = topojson.feature(datosMapaMundo, datosMapaMundo.objects.countries).features;
    const ancho = 1000, alto = 500;
    const proyeccion = d3.geoMercator().scale(130).translate([ancho / 2, alto / 1.5]);
    const generadorCaminos = d3.geoPath().projection(proyeccion);

    const equivalenciasIso = {
      "840": "US", "124": "CA", "604": "PE", "276": "DE", "724": "ES",
      "036": "AU", "484": "MX", "214": "DO", "591": "PA", "392": "JP",
      "470": "MT", "380": "IT", "068": "BO", "188": "CR", "218": "EC",
      "528": "NL", "152": "CL"
    };

    const lienzoSvg = d3.select("#contenedorMapaMundo")
      .append("svg").attr("viewBox", `0 0 ${ancho} ${alto}`);

    const cuadroFlotante = d3.select("#cuadroFlotanteMundo");
    const mapaDerecha = document.getElementById("mapaDerechaMundo");

    lienzoSvg.selectAll("path")
      .data(paises).enter().append("path")
      .attr("d", generadorCaminos)
      .attr("id", elemento => equivalenciasIso[elemento.id] || `pais-${elemento.id}`)
      .on("mouseover", (evento, elemento) => {
        const codigoIso = equivalenciasIso[elemento.id];
        if (datosEgresadosMundo[codigoIso]) {
          cuadroFlotante.style("display", "block")
            .html(`<strong>${datosEgresadosMundo[codigoIso].nombre}</strong><br/>🎓 Egresados: ${datosEgresadosMundo[codigoIso].egresados.toLocaleString()}`);
        }
      })
      .on("mousemove", (evento) => {
        const bordes = mapaDerecha.getBoundingClientRect();
        cuadroFlotante.style("left", (evento.clientX - bordes.left + 10) + "px")
                      .style("top", (evento.clientY - bordes.top + 10) + "px");
      })
      .on("mouseout", () => cuadroFlotante.style("display", "none"))
      .on("click", (evento, elemento) => {
        const codigoIso = equivalenciasIso[elemento.id];
        const panelDetalle = document.getElementById("panelDetalleMundo");
        if (datosEgresadosMundo[codigoIso]) {
          document.getElementById("nombrePaisDetalle").innerText = datosEgresadosMundo[codigoIso].nombre;
          document.getElementById("cantidadEgresadosMundo").innerText = datosEgresadosMundo[codigoIso].egresados.toLocaleString();
          panelDetalle.style.display = "block";
        } else {
          panelDetalle.style.display = "none";
        }
      });
  });

fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-10m.json')
  .then(respuesta => respuesta.json())
  .then(datosMapaDetallado => {
    const paises = topojson.feature(datosMapaDetallado, datosMapaDetallado.objects.countries).features;
    const colombiaGeometria = paises.find(pais => pais.id === "170");

    const ancho = 1000, alto = 500;
    const proyeccion = d3.geoMercator()
      .fitExtent([[80, 20], [ancho - 80, alto - 20]], colombiaGeometria);

    const generadorCaminos = d3.geoPath().projection(proyeccion);

    const lienzoSvg = d3.select("#contenedorMapaColombia")
      .append("svg").attr("viewBox", `0 0 ${ancho} ${alto}`);

    const cuadroFlotante = d3.select("#cuadroFlotanteColombia");
    const mapaDerecha = document.getElementById("mapaDerechaColombia");

    lienzoSvg.append("path")
      .datum(colombiaGeometria)
      .attr("d", generadorCaminos)
      .attr("fill", "#f1f5f9")
      .attr("stroke", "#94a3b8")
      .attr("stroke-width", "1.5");

    const puntosDepartamentos = [
      { id: "DEP_DC", nombre: "Bogotá D.C.", egresados: 645, coordenadas: [-74.0721, 4.7110], radio: 32, color: "#0e1f87" },
      { id: "DEP_CUN", nombre: "Cundinamarca", egresados: 59, coordenadas: [-74.1300, 5.0200], radio: 18, color: "#ea580c" },
      { id: "DEP_ANT", nombre: "Antioquia", egresados: 15, coordenadas: [-75.5636, 6.2518], radio: 14, color: "#16a34a" },
      { id: "DEP_MET", nombre: "Meta", egresados: 6, coordenadas: [-73.6300, 4.1400], radio: 10, color: "#a855f7" },
      { id: "DEP_ATL", nombre: "Atlántico", egresados: 5, coordenadas: [-74.7813, 10.9685], radio: 9, color: "#06b6d4" },
      { id: "DEP_TOL", nombre: "Tolima", egresados: 3, coordenadas: [-75.2300, 4.4300], radio: 8, color: "#eab308" },
      { id: "DEP_BOY", nombre: "Boyacá", egresados: 2, coordenadas: [-73.3600, 5.5300], radio: 7, color: "#64748b" },
      { id: "DEP_CAS", nombre: "Casanare", egresados: 2, coordenadas: [-72.4000, 5.3300], radio: 7, color: "#64748b" },
      { id: "DEP_SAN", nombre: "Santander", egresados: 2, coordenadas: [-73.1198, 7.1254], radio: 7, color: "#64748b" },
      { id: "DEP_NAR", nombre: "Nariño", egresados: 1, coordenadas: [-77.2800, 1.2100], radio: 6, color: "#64748b" },
      { id: "DEP_BOL", nombre: "Bolívar", egresados: 1, coordenadas: [-75.5000, 10.4000], radio: 6, color: "#64748b" },
      { id: "DEP_VAC", nombre: "Valle del Cauca", egresados: 1, coordenadas: [-76.5225, 3.4372], radio: 6, color: "#64748b" }
    ];

    lienzoSvg.selectAll("circle")
      .data(puntosDepartamentos)
      .enter()
      .append("circle")
      .attr("cx", punto => proyeccion(punto.coordenadas)[0])
      .attr("cy", punto => proyeccion(punto.coordenadas)[1])
      .attr("r", punto => punto.radio)
      .attr("fill", punto => punto.color)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", "2")
      .attr("style", "cursor: pointer; opacity: 0.95;")
      .on("mouseover", (evento, punto) => {
        cuadroFlotante.style("display", "block")
          .html(`<strong>${punto.nombre}</strong><br/>🎓 Egresados: ${punto.egresados.toLocaleString()}`);
      })
      .on("mousemove", (evento) => {
        const bordes = mapaDerecha.getBoundingClientRect();
        cuadroFlotante.style("left", (evento.clientX - bordes.left + 10) + "px")
                      .style("top", (evento.clientY - bordes.top + 10) + "px");
      })
      .on("mouseout", () => cuadroFlotante.style("display", "none"))
      .on("click", (evento, punto) => {
        const panelDetalle = document.getElementById("panelDetalleColombia");
        document.getElementById("nombreDepartamentoDetalle").innerText = punto.nombre;
        document.getElementById("cantidadEgresadosColombia").innerText = punto.egresados.toLocaleString();
        panelDetalle.style.display = "block";
      });
  });

const pistaCarrusel = document.getElementById('pistaCarruselTexto');
const botonAnterior = document.getElementById('botonAnterior');
const botonSiguiente = document.getElementById('botonSiguiente');
const anchoTarjeta = 360;

botonSiguiente.addEventListener('click', () => {
  pistaCarrusel.scrollBy({ left: anchoTarjeta, behavior: 'smooth' });
});

botonAnterior.addEventListener('click', () => {
  pistaCarrusel.scrollBy({ left: -anchoTarjeta, behavior: 'smooth' });
});

function abrirModalVideo(urlVideo, titulo) {
  const modal = document.getElementById('modalVideo');
  const reproductor = document.getElementById('reproductorVideo');
  const tituloModal = document.getElementById('tituloModal');

  reproductor.src = urlVideo + "?autoplay=1";
  tituloModal.innerText = titulo;
  modal.style.display = 'flex';
}

function cerrarModalVideo(evento) {
  if (!evento || evento.target.id === 'modalVideo') {
    const modal = document.getElementById('modalVideo');
    const reproductor = document.getElementById('reproductorVideo');
    modal.style.display = 'none';
    reproductor.src = '';
  }
}