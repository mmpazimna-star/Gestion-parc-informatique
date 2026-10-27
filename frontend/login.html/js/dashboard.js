async function loadDashboard() {
    const res = await apiFetch('/dashboard');
    const data = await res.json();
    document.getElementById('totalEquipments').innerText = data.totalEquipments;
    document.getElementById('activeTickets').innerText = data.activeTickets;
    document.getElementById('outOfWarranty').innerText = data.outOfWarranty;

    const ctx = document.getElementById('typeChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.byType.map(t => t.type),
            datasets: [{ label: 'Nombre', data: data.byType.map(t => t.count), backgroundColor: '#3498db' }]
        }
    });
}
loadDashboard();