function sendDataInvoice(p_form, p_endpoint) {
    const formData = new FormData(p_form)

    fetch(p_endpoint,
        {
            method : 'POST',
            body : formData
        }
    )
    .then(response => response.json())
    .then(json => {
        alert('Datos enviados correctamente');
    })
    .catch(error => {
        console.log(error);
        alert('Hubo un error al enviar los datos');
    })
}

// Adjunta el evento submit al formulario de HEADER
document.getElementById('form-header').addEventListener('submit', (event) => {
    console.log(event.target)
    sendDataInvoice(event.target,'/post_header_invoices'); 
});

// Adjunta el evento submit al formulario de LINES
document.getElementById('form-lines').addEventListener('submit', (event) => {
    sendDataInvoice(event.target,'/post_lines_invoices'); 
});