const alertsPageContainer = document.getElementById("alertsPageContainer");  
  
const alerts = JSON.parse(localStorage.getItem("trainingAlerts") || "[]");  
  
if (!alerts.length) {  
  alertsPageContainer.innerHTML = `<p class="placeholder">Nenhum alerta encontrado. Volte ao painel, carregue a planilha e gere os alertas.</p>`;  
} else {  
  let html = "";  
  
  alerts.forEach(alert => {  
    const trainings = alert.treinamentos  
      .map(item => `<span class="training-pill">${item.nome}: ${item.qtd}</span>`)  
      .join("");  
  
    html += `  
      <div class="alert-card">  
        <h4>🚨 Regional ${alert.regional}</h4>  
        <div class="alert-meta">  
          <span><strong>${alert.analistasPendentes}</strong> analistas pendentes</span>  
          <span><strong>${alert.totalPendencias}</strong> pendências nesses 2 treinamentos</span>  
          <span>Regra de alerta: mínimo de 10 analistas</span>  
        </div>  
        <div class="alert-trainings">  
          ${trainings}  
        </div>  
      </div>  
    `;  
  });  
  
  alertsPageContainer.innerHTML = html;  
}