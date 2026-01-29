document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  function loadContatos() {
    try { return JSON.parse(localStorage.getItem('contatos') || '[]'); } catch { return []; }
  }

  function saveContatos(arr) {
    localStorage.setItem('contatos', JSON.stringify(arr));
  }

  form.addEventListener('submit', (e) => {
    // allow bootstrap validation to mark fields first
    if (!form.checkValidity()) return;
    e.preventDefault();

    const nome = (form.nome && form.nome.value || '').trim();
    const email = (form.email && form.email.value || '').trim();
    const senhaRaw = (form.senha && form.senha.value || '');
    const assunto = (form.assunto && form.assunto.value || '').trim();
    const mensagem = (form.mensagem && form.mensagem.value || '').trim();

    const contatos = loadContatos();
    const novo = {
      id: Date.now(),
      nome,
      email,
      senha: (typeof btoa === 'function') ? btoa(senhaRaw) : senhaRaw,
      assunto,
      mensagem,
      createdAt: new Date().toISOString()
    };

    contatos.push(novo);
    saveContatos(contatos);

    alert('Contato salvo com sucesso.');
    form.reset();
    form.classList.remove('was-validated');
  });
});
