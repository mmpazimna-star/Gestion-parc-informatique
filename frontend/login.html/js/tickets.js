async function loadTickets() {
    const res = await apiFetch('/tickets');
    const tickets = await res.json();
    const tbody = document.querySelector('#ticketsTable tbody');
    tbody.innerHTML = '';
    tickets.forEach(t => {
        const row = `<tr>
            <td>${t.title}</td><td>${t.status}</td><td>${t.priority}</td>
            <td>${t.equipmentCode || '-'}</td><td>${t.createdByName || '-'}</td>
            <td><button onclick="closeTicket(${t.id})">Fermer</button></td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

async function loadEquipmentSelect() {
    const res = await apiFetch('/equipments');
    const eqs = await res.json();
    const select = document.getElementById('equipmentId');
    select.innerHTML = '<option value="">Aucun</option>';
    eqs.forEach(eq => { select.innerHTML += `<option value="${eq.id}">${eq.code} - ${eq.type}</option>`; });
}

async function createTicket(e) {
    e.preventDefault();
    const data = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        priority: document.getElementById('priority').value,
        equipmentId: document.getElementById('equipmentId').value || null
    };
    const res = await apiFetch('/tickets', { method: 'POST', body: JSON.stringify(data) });
    if (res.ok) {
        closeModal();
        loadTickets();
    }
}

async function closeTicket(id) {
    await apiFetch(`/tickets/${id}`, { method: 'PUT', body: JSON.stringify({ status: 'closed' }) });
    loadTickets();
}

function closeModal() { document.getElementById('ticketModal').style.display = 'none'; }

document.getElementById('newTicketBtn')?.addEventListener('click', () => {
    document.getElementById('ticketForm').reset();
    document.getElementById('ticketModal').style.display = 'flex';
});
document.querySelector('.close')?.addEventListener('click', closeModal);
document.getElementById('ticketForm')?.addEventListener('submit', createTicket);

loadTickets();
loadEquipmentSelect();