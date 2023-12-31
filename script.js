const db = require('hsqldb');

// Conexão com o banco de dados
const connection = db.connect({
  type: 'mem',
  name: '',
  user: 'sa',
  password: '',
  url: 'jdbc:hsqldb:mem:'
});


// Criação das tabelas no banco de dados
const createTables = () => {
  connection.createStatement().execute(`
    CREATE TABLE Estudante (
      id INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
      matricula VARCHAR(50) NOT NULL,
      nome VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL,
      ano_egresso INT NOT NULL
    );

    CREATE TABLE Professor (
      id INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
      matricula VARCHAR(50) NOT NULL,
      nome VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL,
      ano_egresso INT NOT NULL
    );

    CREATE TABLE Disciplina (
      id INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
      codigo VARCHAR(50) NOT NULL,
      nome VARCHAR(100) NOT NULL,
      professor_id INT,
      FOREIGN KEY (professor_id) REFERENCES Professor(id)
    );

    CREATE TABLE Matricula (
      disciplina_id INT,
      estudante_id INT,
      FOREIGN KEY (disciplina_id) REFERENCES Disciplina(id),
      FOREIGN KEY (estudante_id) REFERENCES Estudante(id)
    );

    CREATE TABLE Dia (
      id INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
      nome VARCHAR(50) NOT NULL
    );

    CREATE TABLE Horario (
      id INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
      dia_id INT,
      hora_inicio TIME NOT NULL,
      hora_fim TIME NOT NULL,
      disciplina_id INT,
      FOREIGN KEY (dia_id) REFERENCES Dia(id),
      FOREIGN KEY (disciplina_id) REFERENCES Disciplina(id)
    );
  `);
};

// Criação das tabelas no banco de dados (chamada apenas uma vez)
createTables();

// Função para cadastrar um estudante no curso
function cadastrarEstudante(event) {
  event.preventDefault();

  const matricula = document.getElementById('matricula').value;
  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const anoEgresso = document.getElementById('ano-egresso').value;

  const estudante = {
    matricula,
    nome,
    email,
    anoEgresso
  };

  connection.createStatement().execute(`
    INSERT INTO Estudante (matricula, nome, email, ano_egresso)
    VALUES ('${estudante.matricula}', '${estudante.nome}', '${estudante.email}', ${estudante.anoEgresso})
  `);

  document.getElementById('estudante-form').reset();
}

// ...

// Função para cadastrar um professor no curso
function cadastrarProfessor(event) {
  event.preventDefault();

  const matricula = document.getElementById('matricula').value;
  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const anoEgresso = document.getElementById('ano-egresso').value;

  const professor = {
    matricula,
    nome,
    email,
    anoEgresso
  };

  connection.createStatement().execute(`
    INSERT INTO Professor (matricula, nome, email, ano_egresso)
    VALUES ('${professor.matricula}', '${professor.nome}', '${professor.email}', ${professor.anoEgresso})
  `);

  document.getElementById('professor-form').reset();
}

// ...

// Event Listeners
// ...
document.getElementById('professor-form').addEventListener('submit', cadastrarProfessor);
// ...

// Função para cadastrar uma disciplina no curso
function cadastrarDisciplina(event) {
  event.preventDefault();

  const codigo = document.getElementById('codigo').value;
  const nome = document.getElementById('nome').value;
  const professorIndex = document.getElementById('professor').selectedIndex;
  const professorId = professorIndex + 1; // O índice começa em 0, mas o ID começa em 1 no banco de dados

  connection.createStatement().execute(`
    INSERT INTO Disciplina (codigo, nome, professor_id)
    VALUES ('${codigo}', '${nome}', ${professorId})
  `);

  document.getElementById('disciplina-form').reset();
}

// Função para matricular um estudante na disciplina
function matricularEstudante(event) {
  event.preventDefault();

  const disciplinaIndex = document.getElementById('disciplina').selectedIndex;
  const estudanteIndex = document.getElementById('estudante').selectedIndex;
  const disciplinaId = disciplinaIndex + 1;
  const estudanteId = estudanteIndex + 1;

  connection.createStatement().execute(`
    INSERT INTO Matricula (disciplina_id, estudante_id)
    VALUES (${disciplinaId}, ${estudanteId})
  `);

  document.getElementById('matricula-form').reset();
}

// Função para emitir o quadro de horário do professor
function emitirQuadroHorarioProfessor() {
  const quadroHorarioProfessor = document.getElementById('quadro-horario-professor');
  quadroHorarioProfessor.innerHTML = '';

  const result = connection.createStatement().executeQuery(`
    SELECT Disciplina.nome AS disciplina_nome, Dia.nome AS dia, Horario.hora_inicio, Horario.hora_fim
    FROM Disciplina
    JOIN Horario ON Disciplina.id = Horario.disciplina_id
    JOIN Dia ON Horario.dia_id = Dia.id
  `);

  while (result.next()) {
    const disciplinaNome = result.getString('disciplina_nome');
    const dia = result.getString('dia');
    const horaInicio = result.getString('hora_inicio');
    const horaFim = result.getString('hora_fim');

    const disciplinaInfo = document.createElement('div');
    disciplinaInfo.innerHTML = `
      <strong>${disciplinaNome}</strong><br>
      Dia: ${dia}<br>
      Horário: ${horaInicio} - ${horaFim}<br>
    `;

    quadroHorarioProfessor.appendChild(disciplinaInfo);
  }
}

// Função para emitir o quadro de horário do estudante
function emitirQuadroHorarioEstudante() {
  const quadroHorarioEstudante = document.getElementById('quadro-horario-estudante');
  quadroHorarioEstudante.innerHTML = '';

  const result = connection.createStatement().executeQuery(`
    SELECT Disciplina.nome AS disciplina_nome, Dia.nome AS dia, Horario.hora_inicio, Horario.hora_fim, Professor.nome AS professor_nome
    FROM Disciplina
    JOIN Horario ON Disciplina.id = Horario.disciplina_id
    JOIN Dia ON Horario.dia_id = Dia.id
    JOIN Professor ON Disciplina.professor_id = Professor.id
  `);

  while (result.next()) {
    const disciplinaNome = result.getString('disciplina_nome');
    const dia = result.getString('dia');
    const horaInicio = result.getString('hora_inicio');
    const horaFim = result.getString('hora_fim');
    const professorNome = result.getString('professor_nome');

    const disciplinaInfo = document.createElement('div');
    disciplinaInfo.innerHTML = `
      <strong>${disciplinaNome}</strong><br>
      Dia: ${dia}<br>
      Horário: ${horaInicio} - ${horaFim}<br>
      Professor: ${professorNome}<br>
    `;

    quadroHorarioEstudante.appendChild(disciplinaInfo);
  }
}

// Função para emitir o diário da disciplina
function emitirDiarioDisciplina() {
  const diarioDisciplina = document.getElementById('diario-disciplina');
  diarioDisciplina.innerHTML = '';

  const result = connection.createStatement().executeQuery(`
    SELECT Disciplina.nome AS disciplina_nome, Dia.nome AS dia, Horario.hora_inicio, Horario.hora_fim, Professor.nome AS professor_nome, Estudante.nome AS estudante_nome
    FROM Disciplina
    JOIN Horario ON Disciplina.id = Horario.disciplina_id
    JOIN Dia ON Horario.dia_id = Dia.id
    JOIN Professor ON Disciplina.professor_id = Professor.id
    JOIN Matricula ON Disciplina.id = Matricula.disciplina_id
    JOIN Estudante ON Matricula.estudante_id = Estudante.id
  `);

  let lastDisciplinaNome = null;
  let lastDia = null;
  let lastHoraInicio = null;
  let lastHoraFim = null;
  let lastProfessorNome = null;
  let estudantes = [];

  while (result.next()) {
    const disciplinaNome = result.getString('disciplina_nome');
    const dia = result.getString('dia');
    const horaInicio = result.getString('hora_inicio');
    const horaFim = result.getString('hora_fim');
    const professorNome = result.getString('professor_nome');
    const estudanteNome = result.getString('estudante_nome');

    if (
      disciplinaNome !== lastDisciplinaNome ||
      dia !== lastDia ||
      horaInicio !== lastHoraInicio ||
      horaFim !== lastHoraFim ||
      professorNome !== lastProfessorNome
    ) {
      if (lastDisciplinaNome !== null) {
        const disciplinaInfo = document.createElement('div');
        disciplinaInfo.innerHTML = `
          <strong>${lastDisciplinaNome}</strong><br>
          Dia: ${lastDia}<br>
          Horário: ${lastHoraInicio} - ${lastHoraFim}<br>
          Professor: ${lastProfessorNome}<br>
          Estudantes matriculados:<br>
        `;

        const estudantesList = document.createElement('ul');
        estudantes.forEach(estudante => {
          const estudanteItem = document.createElement('li');
          estudanteItem.textContent = estudante;
          estudantesList.appendChild(estudanteItem);
        });

        disciplinaInfo.appendChild(estudantesList);
        diarioDisciplina.appendChild(disciplinaInfo);
      }

      lastDisciplinaNome = disciplinaNome;
      lastDia = dia;
      lastHoraInicio = horaInicio;
      lastHoraFim = horaFim;
      lastProfessorNome = professorNome;
      estudantes = [];
    }

    estudantes.push(estudanteNome);
  }

  if (lastDisciplinaNome !== null) {
    const disciplinaInfo = document.createElement('div');
    disciplinaInfo.innerHTML = `
      <strong>${lastDisciplinaNome}</strong><br>
      Dia: ${lastDia}<br>
      Horário: ${lastHoraInicio} - ${lastHoraFim}<br>
      Professor: ${lastProfessorNome}<br>
      Estudantes matriculados:<br>
    `;

    const estudantesList = document.createElement('ul');
    estudantes.forEach(estudante => {
      const estudanteItem = document.createElement('li');
      estudanteItem.textContent = estudante;
      estudantesList.appendChild(estudanteItem);
    });

    disciplinaInfo.appendChild(estudantesList);
    diarioDisciplina.appendChild(disciplinaInfo);
  }
}

// Event Listeners

document.getElementById('estudante-form').addEventListener('submit', cadastrarEstudante);
document.getElementById('professor-form').addEventListener('submit', cadastrarProfessor);
document.getElementById('disciplina-form').addEventListener('submit', cadastrarDisciplina);
document.getElementById('matricula-form').addEventListener('submit', matricularEstudante);

// Inicialização do sistema
emitirQuadroHorarioProfessor();
emitirQuadroHorarioEstudante();
emitirDiarioDisciplina();
