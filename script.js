const fileInput = document.getElementById("fileInput");  
const tableContainer = document.getElementById("tableContainer");  
  
const totalAnalistasEl = document.getElementById("totalAnalistas");  
const totalConcluidosEl = document.getElementById("totalConcluidos");  
const totalPendentesEl = document.getElementById("totalPendentes");  
const mediaPercentualEl = document.getElementById("mediaPercentual");  
  
const trainingColumns = [  
  "Drivers Day 4.0",  
  "VAT",  
  "EHA 3+ & Realocação de Pacotes",  
  "Reversão de No Show",  
  "Comunicação, Limites e Experiência no HUB",  
  "SOP - Pré expedição e expedição",  
  "AlocAção_V2"  
];  
  
fileInput.addEventListener("change", handleFile);  
  
function handleFile(event) {  
  const file = event.target.files[0];  
  if (!file) return;  
  
  const reader = new FileReader();  
  
  reader.onload = function(e) {  
    const data = new Uint8Array(e.target.result);  
    const workbook = XLSX.read(data, { type: "array" });  
  
    const firstSheetName = workbook.SheetNames[0];  
    const worksheet = workbook.Sheets[firstSheetName];  
  
    const raw = XLSX.utils.sheet_to_json(worksheet, {  
      header: 1,  
      defval: ""  
    });  
  
    const headerRowIndex = raw.findIndex(row =>  
      row.some(cell => String(cell).trim() === "Nome")  
    );  
  
    if (headerRowIndex === -1) {  
      tableContainer.innerHTML = `<p class="placeholder">Não foi possível encontrar a linha de cabeçalho da planilha.</p>`;  
      return;  
    }  
  
    const headers = raw[headerRowIndex].map(h => String(h).trim());  
    const dataRows = raw.slice(headerRowIndex + 1);  
  
    const rows = dataRows  
      .map(row => {  
        const obj = {};  
        headers.forEach((header, index) => {  
          obj[header] = row[index] ?? "";  
        });  
        return obj;  
      })  
      .filter(row => String(row["Nome"] || row["Email"] || "").trim() !== "");  
  
    renderDashboard(rows);  
  };  
  
  reader.readAsArrayBuffer(file);  
}  
  
function renderDashboard(rows) {  
  let totalAnalistas = rows.length;  
  let totalConcluidos = 0;  
  let totalPendentes = 0;  
  let somaPercentual = 0;  
  
  let tableHTML = `  
    <table>  
      <thead>  
        <tr>  
          <th>Nome</th>  
          <th>Email</th>  
          <th>Cargo</th>  
          <th>Hub</th>  
          <th>Supervisor</th>  
          <th>%</th>  
          ${trainingColumns.map(col => `<th>${col}</th>`).join("")}  
        </tr>  
      </thead>  
      <tbody>  
  `;  
  
  rows.forEach(row => {  
    const percentualBruto = row["% de Treinamentos por analista"];  
    const percentual = Number(percentualBruto || 0);  
    somaPercentual += percentual;  
  
    const trainingCells = trainingColumns.map(col => {  
      const value = String(row[col] || "").trim();  
  
      if (value === "✅") {  
        totalConcluidos++;  
        return `<td><span class="badge badge-ok">Treinado</span></td>`;  
      }  
  
      if (value === "❌") {  
        totalPendentes++;  
        return `<td><span class="badge badge-no">Pendente</span></td>`;  
      }  
  
      return `<td><span class="badge badge-empty">Sem info</span></td>`;  
    }).join("");  
  
    tableHTML += `  
      <tr>  
        <td>${escapeHtml(row["Nome"] || "-")}</td>  
        <td>${escapeHtml(row["Email"] || "-")}</td>  
        <td>${escapeHtml(row["Cargo"] || "-")}</td>  
        <td>${escapeHtml(row["Hub name"] || "-")}</td>  
        <td>${escapeHtml(row["Nome do Supervisor"] || "-")}</td>  
        <td class="percent">${(percentual * 100).toFixed(0)}%</td>  
        ${trainingCells}  
      </tr>  
    `;  
  });  
  
  tableHTML += `</tbody></table>`;  
  
  const mediaPercentual = totalAnalistas  
    ? ((somaPercentual / totalAnalistas) * 100).toFixed(0)  
    : 0;  
  
  totalAnalistasEl.textContent = totalAnalistas;  
  totalConcluidosEl.textContent = totalConcluidos;  
  totalPendentesEl.textContent = totalPendentes;  
  mediaPercentualEl.textContent = `${mediaPercentual}%`;  
  
  tableContainer.innerHTML = tableHTML;  
}  
  
function escapeHtml(value) {  
  return String(value)  
    .replaceAll("&", "&amp;")  
    .replaceAll("<", "&lt;")  
    .replaceAll(">", "&gt;")  
    .replaceAll('"', "&quot;")  
    .replaceAll("'", "&#039;");  
}