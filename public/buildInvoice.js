function getFormathate(fechaISO) {
    const fecha = new Date(fechaISO); // Convierte el string en un objeto Date
    const dia = String(fecha.getUTCDate()).padStart(2, '0'); // Día con dos dígitos
    const mes = String(fecha.getUTCMonth() + 1).padStart(2, '0'); // Mes (0-indexed)
    const año = fecha.getUTCFullYear(); // Año completo
    return `${dia}-${mes}-${año}`;
}


const tbody = document.querySelector('tbody')

fetch('/api/invoices')
    .then(response => response.json())
    .then(arr_invoices => {
        
        arr_invoices.forEach(obj_invoice => {
            console.log(obj_invoice.date_invoice)
            tbody.innerHTML += `
                <tr>
					<th>${obj_invoice.type_invoice}</th>
					<th>${obj_invoice.ruc}</th>
					<th>${obj_invoice.company}</th>
					<th>${obj_invoice.customer}</th>
					<th>${getFormathate(obj_invoice.date_invoice)}</th>
					<th>S/ ${obj_invoice.gross_amount}</th>
				</tr>
            `
        });
    })
    .catch(error => {
        console.log(error)
    })
