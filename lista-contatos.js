document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('list-root');
  const clearBtn = document.getElementById('clear-all');
  const exportBtn = document.getElementById('export-pdf');
  const modalEl = document.getElementById('detailModal');
  const modalBody = document.getElementById('modal-body-content');
  const modal = (typeof bootstrap !== 'undefined' && modalEl) ? new bootstrap.Modal(modalEl) : null;

  function loadContatos() {
    try {
      return JSON.parse(localStorage.getItem('contatos') || '[]');
    } catch {
      return [];
    }
  }

  function saveContatos(arr) {
    localStorage.setItem('contatos', JSON.stringify(arr));
  }

  function maskSenha(encoded) {
    try {
      const decoded = atob(encoded);
      return '*'.repeat(Math.max(4, Math.min(10, decoded.length)));
    } catch {
      return '****';
    }
  }

  function truncate(str, n) {
    if (!str) return '';
    return str.length > n ? str.slice(0, n - 1) + '…' : str;
  }

  function escapeHtml(s) {
    if (!s) return '';
    return s.toString().replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
  }

  function render() {
    const contatos = loadContatos();
    if (!contatos.length) {
      root.innerHTML = '<div class="alert alert-info">Nenhum contato encontrado.</div>';
      return;
    }

    const rows = contatos.map(c => {
      return `
      <tr data-id="${c.id}">
        <td>${escapeHtml(c.nome)}</td>
        <td>${escapeHtml(c.email)}</td>
        <td>${maskSenha(c.senha)}</td>
        <td>${escapeHtml(c.assunto)}</td>
        <td>${escapeHtml(truncate(c.mensagem, 60))}</td>
        <td>${new Date(c.createdAt).toLocaleDateString()}</td>
        <td>
          <button class="btn btn-sm btn-primary view-btn">Ver</button>
          <button class="btn btn-sm btn-danger delete-btn">Excluir</button>
        </td>
      </tr>`;
    }).join('');

    root.innerHTML = `
      <div class="table-responsive">
        <table class="table table-striped table-bordered">
          <thead class="table-light">
            <tr>
              <th>Nome</th><th>E-mail</th><th>Senha</th><th>Assunto</th><th>Mensagem</th><th>Data</th><th>Ações</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;

    root.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = +e.target.closest('tr').dataset.id;
        const contato = contatos.find(x => x.id === id);
        if (!contato) return;
        const decodedSenha = (() => { try { return atob(contato.senha); } catch { return '[inválida]'; } })();
        modalBody.innerHTML = `
          <ul class="list-group">
            <li class="list-group-item"><strong>ID:</strong> ${contato.id}</li>
            <li class="list-group-item"><strong>Nome:</strong> ${escapeHtml(contato.nome)}</li>
            <li class="list-group-item"><strong>E-mail:</strong> ${escapeHtml(contato.email)}</li>
            <li class="list-group-item"><strong>Senha:</strong> ${escapeHtml(decodedSenha)}</li>
            <li class="list-group-item"><strong>Assunto:</strong> ${escapeHtml(contato.assunto)}</li>
            <li class="list-group-item"><strong>Mensagem:</strong><br>${escapeHtml(contato.mensagem).replace(/\n/g, '<br>')}</li>
            <li class="list-group-item text-muted"><small>Enviado: ${new Date(contato.createdAt).toLocaleString()}</small></li>
          </ul>
        `;
        if (modal) modal.show();
      });
    });

    root.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = +e.target.closest('tr').dataset.id;
        if (!confirm('Excluir este contato?')) return;
        const updated = contatos.filter(c => c.id !== id);
        saveContatos(updated);
        render();
      });
    });
  }

  clearBtn.addEventListener('click', () => {
    if (!confirm('Limpar todos os contatos?')) return;
    localStorage.removeItem('contatos');
    render();
  });

  exportBtn.addEventListener('click', () => {
    const contatos = loadContatos();
    if (!contatos.length) {
      alert('Nenhum contato para exportar.');
      return;
    }

    const element = document.createElement('div');
    element.innerHTML = `
      <h2>Relatório de Contatos</h2>
      <p>Gerado em: ${new Date().toLocaleString()}</p>
      <table border="1" cellpadding="10" cellspacing="0" style="width:100%; border-collapse:collapse;">
        <thead>
          <tr style="background-color:#e3f2fd;">
            <th>Nome</th>
            <th>E-mail</th>
            <th>Assunto</th>
            <th>Mensagem</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          ${contatos.map(c => `
            <tr>
              <td>${escapeHtml(c.nome)}</td>
              <td>${escapeHtml(c.email)}</td>
              <td>${escapeHtml(c.assunto)}</td>
              <td>${escapeHtml(c.mensagem)}</td>
              <td>${new Date(c.createdAt).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    const opt = {
      margin: 10,
      filename: `relatorio-contatos-${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };

    html2pdf().set(opt).from(element).save();
  });

  render();
});