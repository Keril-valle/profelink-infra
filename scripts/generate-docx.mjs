import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const toolRoot = join(process.env.TEMP ?? '.', 'opencode', 'docx-tools');
const require = createRequire(import.meta.url);
const {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  ImageRun,
  Packer,
  PageBreak,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} = require(join(toolRoot, 'node_modules', 'docx'));

const root = process.cwd();
const evidence = join(root, 'docs', 'evidencias');
const diagrams = join(root, 'docs', 'diagramas');

function pngSize(path) {
  const data = readFileSync(path);
  if (data.toString('ascii', 1, 4) !== 'PNG') throw new Error(`No es PNG: ${path}`);
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
}

function image(path, width = 590) {
  const size = pngSize(path);
  return new ImageRun({
    type: 'png',
    data: readFileSync(path),
    transformation: { width, height: Math.round((size.height / size.width) * width) },
  });
}

function text(value, options = {}) {
  return new TextRun({ text: value, ...options });
}

function para(value, options = {}) {
  return new Paragraph({
    spacing: { after: 100 },
    ...options,
    children: options.children ?? [text(value, options.run ?? {})],
  });
}

function bullet(value) {
  return new Paragraph({
    text: value,
    bullet: { level: 0 },
    spacing: { after: 80 },
  });
}

function caption(value) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 180 },
    children: [text(value, { italics: true, size: 20, color: '555555' })],
  });
}

function heading(value, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    heading: level,
    spacing: { before: 220, after: 120 },
    children: [text(value, { bold: true })],
  });
}

function table(headers, rows, widths = []) {
  const cell = (value, bold = false) =>
    new TableCell({
      children: [new Paragraph({ children: [text(String(value), { bold, size: 19 })] })],
      margins: { top: 70, bottom: 70, left: 90, right: 90 },
    });
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: widths,
    rows: [
      new TableRow({ tableHeader: true, children: headers.map((h) => cell(h, true)) }),
      ...rows.map((row) => new TableRow({ children: row.map((value) => cell(value)) })),
    ],
  });
}

const children = [];
children.push(
  new Paragraph({ spacing: { before: 1500 } }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [text('ProfeLink', { bold: true, size: 56, color: '2563EB' })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 260 },
    children: [text('Evaluaciones en vivo', { bold: true, size: 34 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [text('Entrega final — Paradigmas de Programación (EIF400)', { size: 26 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [text('II Ciclo 2026', { size: 24, color: '555555' })],
  }),
  new Paragraph({ spacing: { before: 900 } }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [text('Documento generado a partir del repositorio, la base PostgreSQL existente y evidencias locales verificadas.', { size: 21, italics: true })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [text('11 de noviembre de 2026', { size: 21 })],
  }),
  new Paragraph({ children: [new PageBreak()] }),
);

children.push(
  heading('1. Resumen ejecutivo'),
  para('ProfeLink es una aplicación web de evaluaciones en vivo tipo Kahoot. El profesor crea cuestionarios de verdadero/falso o de cuatro opciones, abre una sala y dirige la partida; los estudiantes se unen con un código y responden desde el navegador. La API conserva la autorización, la idempotencia de respuestas, el cierre atómico y los resultados.'),
  para('La entrega reutiliza la instancia PostgreSQL que ya existía en Docker (`profelink-pg-test-answers`), sin crear otra base ni un volumen nuevo. La infraestructura del proyecto solo administra los contenedores de API y frontend; los scripts de parada no tocan la base.'),
  para('Se verificaron login real con Supabase, dashboard e historial contra la base existente, consulta del cliente REST independiente, compilación/levantamiento de imágenes locales, conectividad de solo lectura y pruebas automatizadas. Las capturas de juego en vivo se obtuvieron en el modo mock y se identifican como simuladas; la base contiene datos de prueba, no participantes humanos.'),
);

children.push(
  heading('2. Alcance y reglas'),
  bullet('Sala con estados WAITING, IN_PROGRESS y FINISHED; pregunta copiada con PENDING, OPEN y CLOSED.'),
  bullet('Preguntas de 5 a 120 segundos (30 s por defecto); revisión de 3 a 15 segundos (5 s por defecto).'),
  bullet('Cierre por vencimiento o cuando todos los participantes fijados tienen respuesta aceptada.'),
  bullet('Una respuesta por participante y pregunta; reintento idempotente y conflicto ante una elección distinta.'),
  bullet('El anfitrión no juega; los participantes tienen una sola membresía activa.'),
  bullet('Puntuación: incorrecta 0, correcta 1, primer acierto rápido (≤3 s) 3, más bono por racha de aciertos consecutivos.'),
  bullet('Las preguntas se copian a la sala, por lo que editar el cuestionario original no altera partidas existentes.'),
  bullet('La autenticación se delega a Supabase Auth mediante JWT; las imágenes usan Storage con URLs firmadas.'),
);

children.push(
  heading('3. Arquitectura'),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [image(join(diagrams, 'arquitectura.png'))] }),
  caption('Figura 1. Arquitectura verificada. La PostgreSQL es un contenedor preexistente; Compose no la crea ni la detiene.'),
  para('El frontend Dockerizado se publica en :8080 (Vite en :5173 para desarrollo). La API NestJS escucha en :3000. El cliente REST independiente se sirve en :5174 y consulta la API sin Socket.IO. Supabase Auth/Storage, DeepSeek y Grafana son servicios externos opcionales; la disponibilidad de Grafana o DeepSeek no determina la partida.'),
);

children.push(
  heading('4. Diagrama de clases'),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [image(join(diagrams, 'clases.png'))] }),
  caption('Figura 2. Entidades y relaciones principales; fuente editable en docs/diagramas/clases.mmd.'),
);

children.push(
  heading('5. Modelo de datos'),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [image(join(diagrams, 'modelo-datos.png'))] }),
  caption('Figura 3. Modelo relacional real, con claves y cardinalidades. Fuente: docs/diagramas/modelo-datos.mmd.'),
  table(
    ['Tabla', 'Clave/restricción', 'Propósito'],
    [
      ['profiles', 'PK userId', 'Perfil, rol y avatar'],
      ['quizzes', 'PK id; FK ownerId', 'Cuestionario del profesor'],
      ['questions', 'PK id; unique (quizId, position)', 'Preguntas originales'],
      ['game_sessions', 'PK id; unique code', 'Sala y estado de partida'],
      ['session_questions', 'PK id; unique (sessionId, position)', 'Copia de preguntas al abrir sala'],
      ['session_participants', 'PK id; unique (sessionId,userId)', 'Participación histórica'],
      ['answers', 'PK id; unique (sessionQuestionId,participantId)', 'Respuesta y puntaje'],
      ['game_results', 'PK id; unique (sessionId,participantId)', 'Puntaje y rank final'],
      ['active_session_memberships', 'PK userId', 'Reserva de una sala activa'],
      ['question_batch_operations', 'PK (userId,quizId,operationId)', 'Idempotencia del chatbot/lote'],
    ],
  ),
);

children.push(
  heading('6. API REST y eventos en vivo'),
  para('La especificación completa está en docs/evidencias/openapi.json y en http://localhost:3000/docs. Las rutas /sessions/* devuelven errores {statusCode, code, message}; el resto usa el formato estándar de NestJS.'),
  table(
    ['Método', 'Ruta', 'Auth', 'Propósito'],
    [
      ['GET', '/health', 'No', 'Salud de API y BD'],
      ['GET/PATCH', '/profiles/me', 'JWT', 'Perfil propio'],
      ['GET/POST', '/quizzes', 'JWT/profesor', 'Listar o crear cuestionarios'],
      ['GET/PATCH/DELETE', '/quizzes/:id', 'JWT/propietario', 'Detalle/editar/eliminar'],
      ['POST', '/quizzes/:quizId/questions', 'JWT/propietario', 'Agregar pregunta'],
      ['POST', '/quizzes/:quizId/questions/batch', 'JWT/propietario', 'Guardado idempotente por lote'],
      ['POST', '/quizzes/:quizId/chat', 'JWT/profesor', 'Chatbot opcional'],
      ['POST', '/sessions', 'JWT/profesor', 'Crear sala'],
      ['POST', '/sessions/join', 'JWT', 'Unirse/recuperar participación'],
      ['GET', '/sessions/:code/state', 'JWT/host o jugador', 'Estado por código'],
      ['GET', '/sessions/history', 'JWT/host', 'Historial del anfitrión'],
      ['GET', '/sessions/played', 'JWT', 'Historial del participante'],
    ],
  ),
  para('Socket.IO usa el namespace /sessions y JWT en el handshake. Los comandos incluyen room:join, room:subscribe, game:start, game:advance, game:finish y answer:submit; los eventos del servidor son room:state, question:opened, question:closed, game:finished y scoreboard:updated. Todos los eventos públicos transportan un RoomEnvelope; el ack tiene la forma {ok:true,data} o {ok:false,error:{code,message}}.'),
);

children.push(
  heading('7. Infraestructura Docker y ejecución'),
  table(
    ['Elemento', 'Valor verificado'],
    [
      ['DB existente', 'profelink-pg-test-answers, PostgreSQL 17.11'],
      ['Puerto DB', 'API: profelink-pg-test-answers:5432; Windows: 127.0.0.1:15433'],
      ['Red de BD', 'Externa profelink-data; conserva también bridge'],
      ['API Docker', 'profelink-api-local, :3000, health OK'],
      ['Frontend Docker', 'profelink-web-local, :8080, health OK'],
      ['Imágenes locales', 'profelink-api:local (≈597 MB), profelink-web:local (≈121 MB)'],
      ['Compose', 'Base con imágenes publicadas; compose.build.yaml para build local; solo api/web'],
      ['Docker Hub', 'keril777/profelink-api y keril777/profelink-web: etiquetas versionadas y latest, publicadas con autorización'],
    ],
  ),
  para('Comandos principales (PowerShell, desde la raíz):'),
  new Paragraph({ children: [text('  .\\scripts\\start.ps1                 # descarga por defecto', { font: 'Consolas', size: 21 })], spacing: { after: 60 } }),
  new Paragraph({ children: [text('  .\\scripts\\start.ps1 -Mode Local     # alternativa con build', { font: 'Consolas', size: 21 })], spacing: { after: 60 } }),
  new Paragraph({ children: [text('  .\\scripts\\stop.ps1', { font: 'Consolas', size: 21 })], spacing: { after: 60 } }),
  new Paragraph({ children: [text('  .\\scripts\\status.ps1', { font: 'Consolas', size: 21 })], spacing: { after: 60 } }),
  new Paragraph({ children: [text('  docker compose config -q', { font: 'Consolas', size: 21 })], spacing: { after: 120 } }),
  para('start.ps1 comprueba Docker y la PostgreSQL existente, conserva las credenciales configuradas y conecta la API a profelink-pg-test-answers:5432 por DNS Docker en la red externa profelink-data. Es el mismo principio que db:5432 en la referencia, pero sin definir un servicio db nuevo. El script crea solo la red si falta y conecta el contenedor existente, conservando su volumen y su red bridge. Si el motor no responde, intenta abrir Docker Desktop; esta rama desde apagado sigue pendiente de validación completa. PostgreSQL debe estar iniciada: puede reanudarse con docker start profelink-pg-test-answers. stop.ps1 ejecuta docker compose down --remove-orphans (sin -v) y conserva PostgreSQL y la red externa. La parada y el reinicio finales pasaron, con la API devolviendo database:"up".'),
  para('Las variables VITE_* se incorporan en el build. Después del reinicio se detectó una imagen web en modo demo y se reconstruyó mediante start.ps1 con la configuración real; el login volvió a consultar la API y obtuvo tres respuestas HTTP 200, sin banner mock (docs/evidencias/real-login-resume.json). Después de cambiar estas variables no debe usarse -SkipBuild. El script valida su presencia para evitar una caída silenciosa al modo simulado.'),
  para('Incidente histórico: una revisión anterior encontró HTTP 500 en el motor Docker. En la revisión de conexión por red externa el motor volvió a responder y se verificaron consulta SQL desde la API, parada segura y reinicio (db-docker-dns.json y status-network.txt). Los datos siguieron en 1 cuestionario, 2 salas, 60 participaciones, 161 respuestas y 60 resultados. No se borraron ni recrearon datos. Si Word mantiene abierto el DOCX original, el generador guarda una copia alternativa sin cerrarlo a la fuerza.'),
  para('Repositorio de infraestructura: https://github.com/Keril-valle/profelink-infra. Se preparó en una carpeta independiente a petición del usuario, conservando los repositorios de aplicación y la raíz original. Incluye Compose, scripts, ejemplos y documentación; .gitignore excluye clones, referencia, secretos y temporales. Los contextos de build predeterminados son clones hermanos y el modo Published no requiere código de aplicaciones. run.ps1 y stop.ps1 simplifican el uso. La sintaxis y el arranque se validaron desde esta carpeta, no solo desde el workspace original. Guía: docs/repositorio-infra.md.'),
  para('Modo Published, ahora predeterminado: descarga las imágenes versionadas de keril777 como en la referencia, sin compilar. Ambas se publicaron con autorización expresa del usuario, se verificaron públicamente y se descargaron. La web usa localhost:3000, sin mocks y con configuración pública de Supabase. El arranque, login real y consulta REST autenticada pasaron sobre la BD existente. Se conservó la API v1 anterior. La incompatibilidad histórica de camilitofge/Railway quedó resuelta para estas nuevas referencias sin reescribir JavaScript ni modificar lógica funcional. Evidencia: docs/evidencias/publicacion-keril777.md.'),
  table(['Imagen', 'Digest del índice inspeccionado'], [
    ['keril777/profelink-api:local-20261111-a28e5dd', 'sha256:3c89816c53715068ea9bc80a2b617163992605b2057101deb0e04bb61c5d0745'],
    ['keril777/profelink-web:local-20261111-38b014f', 'sha256:0fd3124051d9fcad5844fdff7756791c0edb5ad6130c755f1be2240d99f88eb2'],
  ]),
);

children.push(
  heading('8. Evidencias de ejecución real'),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [image(join(evidence, 'published-dashboard-keril777.png'), 600)] }),
  caption('Figura 4. Dashboard real con las imágenes públicas keril777: 1 cuestionario, 2 partidas, 60 participaciones y 38% de aciertos desde la BD existente.'),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [image(join(evidence, 'real-history.png'), 600)] }),
  caption('Figura 5. Historial real de las dos partidas finalizadas, con 30 participantes y códigos DZB7QG/4JD8VU.'),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [image(join(evidence, 'rest-viewer-real-room.png'), 560)] }),
  caption('Figura 6. Cliente REST independiente consultando la sala real DZB7QG; se ocultaron autenticación y credenciales.'),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [image(join(evidence, 'backend-swagger-top.png'), 600)] }),
  caption('Figura 7. Swagger/OpenAPI de la API real.'),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [image(join(evidence, 'backend-health.png'), 560)] }),
  caption('Figura 8. /health de la API Dockerizada conectada a la PostgreSQL existente.'),
);

children.push(
  heading('9. Juego en vivo — modo mock explícitamente simulado'),
  para('Las siguientes capturas prueban la interfaz y el flujo de juego con el backend simulado del frontend. No se presentan como 30 participantes humanos ni como una partida real contra la BD.'),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [image(join(evidence, 'mock-host-lobby.png'), 590)] }),
  caption('Figura 9. Lobby del anfitrión con código, QR y cuatro bots simulados.'),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [image(join(evidence, 'mock-host-question.png'), 590)] }),
  caption('Figura 10. Pregunta en vivo, temporizador y opciones V/F del modo simulado.'),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [image(join(evidence, 'mock-host-ranking.png'), 590)] }),
  caption('Figura 11. Revisión y clasificación parcial del modo simulado.'),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [image(join(evidence, 'mock-participant-question.png'), 590)] }),
  caption('Figura 12. Pantalla del participante simulado respondiendo V/F.'),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [image(join(evidence, 'mock-participant-result.png'), 590)] }),
  caption('Figura 13. Resultado final del participante simulado.'),
);

children.push(
  heading('10. Pruebas y limitaciones'),
  table(
    ['Comprobación', 'Resultado', 'Evidencia'],
    [
      ['Backend unitarias', '261/261, 37 suites', 'backend-unit-tests.txt'],
      ['Backend integración', '10/10, 2 suites', 'backend-integration-tests.txt'],
      ['Backend sesiones', '92/92, 9 suites', 'backend-sessions-tests.txt'],
      ['Frontend unitarias', '152/152, 41 archivos', 'frontend-unit-tests.txt'],
      ['Compose/build/health', 'API y web healthy; BD intacta', 'compose-start.txt, compose-ps.txt'],
      ['Login real/dashboard', 'Exitoso', 'real-dashboard.png'],
      ['Cliente REST real', 'Exitoso', 'rest-viewer-real-room.png'],
      ['Socket.IO completo', '86/87; fallo intermitente repetido 5/5 aislado', 'backend-socket-tests.txt, backend-process-restart-tests.txt'],
      ['E2E frontend', '6/10; 4 expectativas de UI desactualizadas', 'frontend-e2e-tests.txt'],
      ['Docker Hub', 'API y web keril777 publicadas con etiquetas versionadas y latest; v1 conservada', 'publicacion-keril777.md, dockerhub-push-*.txt'],
      ['Arranque Published local', 'Exitoso: descarga, health, login y REST autenticado con 30 participantes históricos', 'published-start-keril777.txt, published-login-keril777.json'],
      ['Alternativa Local', 'Arranque y health correctos tras separar ambos Compose', 'local-after-published.txt, status-after-published.txt'],
    ],
  ),
  bullet('No se usaron participantes humanos. Los 30 alumnos son datos de prueba/seed y los rivales del mock son bots.'),
  bullet('No se creó una partida real nueva para no modificar datos funcionales; las capturas de juego en vivo son simuladas y están etiquetadas.'),
  bullet('La suite Socket.IO completa tuvo un fallo intermitente en process-restart; al repetir solo esa suite pasó 5/5. No se ocultó.'),
  bullet('Los E2E frontend tienen cuatro fallos de deriva (redirección tras registro y rows del textarea del chatbot); no se cambiaron pruebas ni código fuente.'),
  bullet('Las dos imágenes keril777 están publicadas y el smoke test real pasó. No se repitió toda la suite ni una partida nueva completa sobre los binarios publicados. La primera espera automatizada del dashboard agotó su plazo; la repetición sincronizada con la red pasó, y se conservó el incidente en el reporte.'),
);

children.push(
  heading('11. Aportes verificables'),
  para('La atribución se basa solo en Git. Backend: Luz-Davila/Luz Dávila Mayorga (modelo, auth, perfiles, quizzes, imágenes, seed, specs), Elian Fajardo Gutierrez (mejoras, rachas, duplicado) y Keril-valle (juego en vivo, recuperación/telemetría, chatbot, Dockerfile). Frontend: Melissa Campos (base, UI, editor, sala del host, E2E/Dockerfile), Elian Fajardo Gutierrez (animaciones/mejoras) y Keril-valle (chatbot). Los hashes y conteos están en docs/aportes.md.'),
  para('La infraestructura, README, diagramas y DOCX se reunieron en Keril-valle/profelink-infra por autorización del usuario. La autoría funcional se basa solo en los historiales de aplicaciones, sin atribuir implementaciones nuevas por copiar evidencias. El Dockerfile frontend se registró y subió a main con autorización expresa (38b014f, Keril-valle). Las imágenes keril777 también fueron autorizadas; su publicación es distinta del historial Git de infraestructura.'),
);

children.push(
  heading('12. Conclusión'),
  para('La entrega incluye el repositorio de infraestructura Keril-valle/profelink-infra y arranque por descarga de las imágenes públicas keril777, reutilizando PostgreSQL. Se verificaron health, login, datos históricos y REST sin cambiar lógica funcional; también se validó el arranque desde la carpeta independiente. README, scripts y DOCX incluyen versiones, digests y prerrequisitos reales: la BD debe existir y la configuración privada no se publica. Se conservan las limitaciones de partida nueva no ejecutada, capturas mock y fallos E2E/intermitentes. La correspondencia con los requisitos está en docs/rubrica.md.'),
);

const doc = new Document({
  creator: 'ProfeLink',
  title: 'ProfeLink — Entrega final',
  description: 'Documento de entrega con arquitectura, API, evidencias y limitaciones',
  styles: {
    default: {
      document: { run: { font: 'Aptos', size: 22 } },
    },
  },
  sections: [
    {
      properties: { page: { margin: { top: 900, right: 900, bottom: 900, left: 900 } } },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [text('ProfeLink — Entrega final — 2026-11-11', { size: 18, color: '666666' })],
            }),
          ],
        }),
      },
      children,
    },
  ],
});

const out = join(root, 'docs', 'entrega-final.docx');
const buffer = await Packer.toBuffer(doc);
try {
  writeFileSync(out, buffer);
  console.log(out);
} catch (error) {
  if (!['EBUSY', 'EPERM', 'EACCES'].includes(error.code)) throw error;
  const alternate = join(root, 'docs', 'entrega-final-actualizada.docx');
  writeFileSync(alternate, buffer);
  console.log(`El DOCX original está bloqueado; copia actualizada: ${alternate}`);
}
