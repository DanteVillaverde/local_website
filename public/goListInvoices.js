document.getElementById("form_qbe").addEventListener("submit", (event) => {
    event.preventDefault(); // Evita que el formulario recargue la página

    const query_params = new URLSearchParams(
        {
            type_invoice : document.getElementById("type_invoice").value,
            serie        : document.getElementById("serie").value,
            ruc          : document.getElementById("ruc").value,
            company      : document.getElementById("company").value,
            customer     : document.getElementById("customer").value,
            date_invoice : document.getElementById("date_invoice").value
        }
    )
    console.log(query_params);
    
    window.location.href = `http://localhost:36395/show_invoices.html?${query_params}`
});