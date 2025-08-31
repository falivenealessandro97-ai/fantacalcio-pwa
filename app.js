// --- Storage keys
const STORAGE_PLAYERS = 'fantacalcioPlayers';
const STORAGE_BUDGET = 'fantacalcioBudget';

// --- State
let players = [];
let sort = { key: 'nome', dir: 'asc' };

// --- Elements
const el = {
  nome: document.getElementById('nome'),
  ruolo: document.getElementById('ruolo'),
  squadra: document.getElementById('squadra'),
  crediti: document.getElementById('crediti'),
  fvm: document.getElementById('fvm'),
  addBtn: document.getElementById('addBtn'),
  budget: document.getElementById('budget'),
  spent: document.getElementById('spent'),
  remaining: document.getElementById('remaining'),
  clearBtn: document.getElementById('clearBtn'),
  filter: document.getElementById('filter'),
  countChip: document.getElementById('countChip'),
  tbody: document.getElementById('tbody'),
  empty: document.getElementById('empty'),
};

// --- Load saved data
(function init() {
  try {
    const savedPlayers = JSON.parse(localStorage.getItem(STORAGE_PLAYERS) || '[]');
    if (Array.isArray(savedPlayers)) players = savedPlayers;
  } catch { players = []; }

  const savedBudget = parseInt(localStorage.getItem(STORAGE_BUDGET) || '500', 10);
  el.budget.value = Number.isFinite(savedBudget) ? savedBudget : 500;

  render();
})();

// --- Helpers
function persist() {
  localStorage.setItem(STORAGE_PLAYERS, JSON.stringify(players));
  localStorage.setItem(STORAGE_BUDGET, String(el.budget.value || 0));
}

function calcSpent() {
  return players.reduce((sum, p) => sum + (p.crediti || 0), 0);
}

function normalizeRole(r) {
  return (r || '').trim().toUpperCase();
}

function addPlayer() {
  const nome = el.nome.value.trim();
  const ruolo = normalizeRole(el.ruolo.value);
  const squadra = el.squadra.value.trim();
  const crediti = parseInt(el.crediti.value || '0', 10);
  const fvmRaw = el.fvm.value;

  if (!nome || !ruolo || isNaN(crediti)) return;

  const fvm = fvmRaw !== '' ? parseInt(fvmRaw, 10) : null;
  players.push({
    nome,
    ruolo,
    squadra,
    crediti: Math.max(0, crediti),
    fvm: fvm !== null ? Math.max(0, fvm) : null,
  });

  el.nome.value = el.ruolo.value = el.squadra.value = el.crediti.value = el.fvm.value = '';
  render();
  el.nome.focus();
}

function deletePlayer(index) {
  players.splice(index, 1);
  render();
}

function setSort(key) {
  if (sort.key === key) sort.dir = sort.dir === 'asc' ? 'desc' : 'asc';
  else { sort.key = key; sort.dir = 'asc'; }
  render();
}

function getFiltered() {
  const f = (el.filter.value || '').toLowerCase().trim();
  const base = f
    ? players.filter(p =>
        (p.nome || '').toLowerCase().includes(f) ||
        (p.squadra || '').toLowerCase().includes(f) ||
        (p.ruolo || '').toLowerCase().includes(f)
      )
    : players.slice();

  const dir = sort.dir === 'asc' ? 1 : -1;
  base.sort((a, b) => {
    const va = a[sort.key]; const vb = b[sort.key];
    if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
    return String(va ?? '').localeCompare(String(vb ?? '')) * dir;
  });
  return base;
}

function render() {
  // stats
  const spent = calcSpent();
  const budget = parseInt(el.budget.value || '0', 10) || 0;
  const remaining = budget - spent;
  el.spent.textContent = spent;
  el.remaining.textContent = remaining;
  if (remaining < 0) el.remaining.classList.add('danger');
  else el.remaining.classList.remove('danger');

  // table
  const rows = getFiltered();
  el.countChip.textContent = `${rows.length} giocatori`;
  el.tbody.innerHTML = '';
  el.empty.style.display = rows.length === 0 ? 'block' : 'none';

  rows.forEach((p) => {
    const tr = document.createElement('tr');

    const tdNome = document.createElement('td'); tdNome.textContent = p.nome; tr.appendChild(tdNome);
    const tdRuolo = document.createElement('td'); tdRuolo.textContent = p.ruolo; tr.appendChild(tdRuolo);
    const tdSquadra = document.createElement('td'); tdSquadra.textContent = p.squadra; tr.appendChild(tdSquadra);
    const tdCred = document.createElement('td'); tdCred.textContent = p.crediti; tdCred.className = 'right'; tr.appendChild(tdCred);
    const tdFvm = document.createElement('td'); tdFvm.textContent = (p.fvm ?? '–'); tdFvm.className = 'right'; tr.appendChild(tdFvm);

    const tdAct = document.createElement('td');
    const del = document.createElement('button');
    del.textContent = 'Elimina';
    del.className = 'btn-danger';
    del.onclick = () => deletePlayer(players.indexOf(p));
    tdAct.appendChild(del);
    tr.appendChild(tdAct);

    el.tbody.appendChild(tr);
  });

  // persist
  persist();
}

// --- Events
el.addBtn.addEventListener('click', addPlayer);
['nome', 'ruolo', 'squadra', 'crediti', 'fvm'].forEach(id => {
  document.getElementById(id).addEventListener('keydown', (e) => { if (e.key === 'Enter') addPlayer(); });
});
el.clearBtn.addEventListener('click', () => {
  if (confirm('Sicuro di voler svuotare la rosa?')) { players = []; render(); }
});
el.filter.addEventListener('input', render);
el.budget.addEventListener('input', render);

document.querySelectorAll('th.sortable').forEach(th => {
  th.addEventListener('click', () => setSort(th.dataset.sort));
});
