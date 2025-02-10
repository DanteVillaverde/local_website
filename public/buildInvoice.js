function getFormatDate(fechaISO) {
    const fecha = new Date(fechaISO); // Convierte el string en un objeto Date
    const dia = String(fecha.getUTCDate()).padStart(2, '0'); // Día con dos dígitos
    const mes = String(fecha.getUTCMonth() + 1).padStart(2, '0'); // Mes (0-indexed)
    const año = fecha.getUTCFullYear(); // Año completo
    return `${dia}-${mes}-${año}`;
}

function getLabel_TypeInvoice(type_invoice){
    switch (type_invoice) {
        case 'F':
            return 'Factura'
            break;

        case 'B':
            return 'Boleta'
            break;

        case 'NC':
            return 'Nota de credito'
            break;
        
        case 'NB':
            return 'Nota de debito'
            break;
    }
}


const tbody = document.querySelector('tbody');
const query_params = window.location.search;

fetch(`/app/qbe_show_invoices/${query_params}`)
    .then(response => response.json())
    .then(arr_invoices => {
        
        arr_invoices.forEach(obj_invoice => {
            tbody.innerHTML += `
                <tr>
					<th>${getLabel_TypeInvoice(obj_invoice.type_invoice)}</th>
                    <th>${obj_invoice.serie}</th>
					<th>${obj_invoice.ruc}</th>
					<th>${obj_invoice.company}</th>
					<th>${obj_invoice.customer}</th>
					<th>${getFormatDate(obj_invoice.date_invoice)}</th>
					<th>S/ ${obj_invoice.gross_amount}</th>
				</tr>
            `
        });
    })
    .catch(error => {
        console.log(error)
    })
