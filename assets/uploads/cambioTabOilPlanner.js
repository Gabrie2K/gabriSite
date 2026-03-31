// Funzione per cambiare Tab
function switchTab(tabName) {
  // 1. Rimuovo la classe 'active' da tutti i bottoni e contenuti
  document.getElementById('btn-info').classList.remove('active');
  document.getElementById('btn-plans').classList.remove('active');
  
  document.getElementById('tab-info').classList.remove('active');
  document.getElementById('tab-plans').classList.remove('active');

  // 2. Aggiungo la classe 'active' solo agli elementi selezionati
  if (tabName === 'info') {
    document.getElementById('btn-info').classList.add('active');
    document.getElementById('tab-info').classList.add('active');
  } else if (tabName === 'plans') {
    document.getElementById('btn-plans').classList.add('active');
    document.getElementById('tab-plans').classList.add('active');
  }
}

// Funzione mock per il click sulla planimetria
function openPlan(floorNumber) {
  console.log("Navigazione in corso verso la Planimetria del Piano: " + floorNumber);
  
  // Qui in futuro aggancerai la logica della tua app per:
  // 1. Nascondere l'edificio 3D intero
  // 2. Caricare il modello 3D del piano specifico
  // 3. Spostare la telecamera
}