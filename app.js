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
(function init(){
try {
const savedPlayers = JSON.parse(localStorage.getItem(STORAGE_PLAYERS) || '[]');
if (Array.isArray(savedPlayers)) players = savedPlayers;
} catch { players = []; }
const savedBudget = parseInt(localStorage.getItem(STORAGE_BUDGET) || '500', 10);
el.budget.value = Number.isFinite(savedBudget) ? savedBudget : 500;
render();
})();


// --- Helpers
function persist(){
localStorage.setItem(STORAGE_PLAYERS, JSON.stringify(players));
localStorage.setItem(STORAGE_BUDGET, String(el.budget.value || 0));
}


function calcSpent(){
return players.reduce((sum, p) => sum + (p.crediti || 0), 0);
}


function normalizeRole(r){
return (r || '').trim().toUpperCase();
}


function addPlayer(){
const nome = el.nome.value.trim();
const ruolo = normalizeRole(el.ruolo.value);
const squadra = el.squadra.value.trim();
const crediti = parseInt(el.crediti.value || '0', 10);
const fvmRaw = el.fvm.value;
if (!nome || !ruolo || isNaN(crediti)) return;
const fvm = fvmRaw !== '' ? parseInt(fvmRaw, 10) : null;
players.push({ nome, ruolo, squadra, crediti: Math.max(0, crediti), fvm: fvm !== null ? Math.max(0, fvm) : null });
el.nome.value = el.ruolo.value = el.squadra.value = el.crediti.value = el.fvm.value = '';
render();
el.nome.focus();
}


function deletePlayer(index){
players.splice(index, 1);
});