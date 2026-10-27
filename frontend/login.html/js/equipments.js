let equipmentToDelete = null;

async function loadEquipments() {
    const res = await apiFetch('/equipments');
    const data = await res.json();
    const tbody = document.querySelector('#equipmentsTable tbody');
    tbody.innerHTML = '';
    data.forEach(equip => {
        const row = `<tr>
            <td>${equip.code}</td><td>${equip.type}</td><td>${equip.brand || ''}</td>
            <td>${equip.model || ''}</td><td>${equip.status}</td>
            <td>${equip.assignedToName || '-'}</td>
            <td><button onclick="editEquipment(${equip.id})">Modifier</button> <button onclick="deleteEquipment(${equip.id})">Supprimer</button></td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

async function loadUsers() {
    const res = await apiFetch('/users');
    const users = await res.json();
    const select = document.getElementById('assignedTo');
    select.innerHTML = '<option value="">Non affecté</option>';
    users.forEach(u => {
        select.innerHTML += `<option value="${u.id}">${u.fullname || u.username}</option>`;
    });
}

async function saveEquipment(e) {
    e.preventDefault();
    const id = document.getElementById('equipId').value;
    const data = {
        code: document.getElementById('code').value,
        type: document.getElementById('type').value,
        brand: document.getElementById('brand').value,
        model: document.getElementById('model').value,
        serialNumber: document.getElementById('serialNumber').value,
        status: document.getElementById('status').value,
        purchaseDate: document.getElementById('purchaseDate').value,
        warrantyEnd: document.getElementById('warrantyEnd').value,
        location: document.getElementById('location').value,
        assignedTo: document.getElementById('assignedTo').value || null
    };
    let res;
    if (id) res = await apiFetch(`/equipments/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    else res = await apiFetch('/equipments', { method: 'POST', body: JSON.stringify(data) });
    if (res.ok) {
        closeModal();
        loadEquipments();
    }
}

function editEquipment(id) {
    fetchEquipmentDetails(id);
    document.getElementById('modalTitle').innerText = 'Modifier équipement';
    document.getElementById('equipmentModal').style.display = 'flex';
}

async function fetchEquipmentDetails(id) {
    const res = await apiFetch(`/equipments/${id}`);
    const eq = await res.json();
    document.getElementById('equipId').value = eq.id;
    document.getElementById('code').value = eq.code;
    document.getElementById('type').value = eq.type;
    document.getElementById('brand').value = eq.brand || '';
    document.getElementById('model').value = eq.model || '';
    document.getElementById('serialNumber').value = eq.serialNumber || '';
    document.getElementById('status').value = eq.status;
    document.getElementById('purchaseDate').value = eq.purchaseDate || '';
    document.getElementById('warrantyEnd').value = eq.warrantyEnd || '';
    document.getElementById('location').value = eq.location || '';
    document.getElementById('assignedTo').value = eq.assignedTo || '';
}

async function deleteEquipment(id) {
    if (confirm('Supprimer cet équipement ?')) {
        await apiFetch(`/equipments/${id}`, { method: 'DELETE' });
        loadEquipments();
    }
}

function closeModal() { document.getElementById('equipmentModal').style.display = 'none'; }

document.getElementById('addEquipmentBtn')?.addEventListener('click', () => {
    document.getElementById('equipmentForm').reset();
    document.getElementById('equipId').value = '';
    document.getElementById('modalTitle').innerText = 'Ajouter un équipement';
    document.getElementById('equipmentModal').style.display = 'flex';
});
document.querySelector('.close')?.addEventListener('click', closeModal);
document.getElementById('equipmentForm')?.addEventListener('submit', saveEquipment);

loadEquipments();
if (document.getElementById('assignedTo')) loadUsers();