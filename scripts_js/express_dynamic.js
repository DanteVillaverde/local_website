const express = require('express');
const fs = require('node:fs/promises')
const mysql = require('mysql2');
const pc = require('picocolors');
const app = express();
const PORT = process.env.PORT ?? 36394;
const ERROR_MESSAGE = '<h1>ERROR AL LEER ARCHIVO html</h1>'
const path = require("node:path")


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: 'supxer',
    database: 'dvr_facturas'
})

app.use(express.static(path.join(__dirname,'../public'))); // Para los JS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/invoice/register_invoice',(request, response) => {
    fs.readFile('./html/register_invoice.html', 'utf-8')
        .then(html => {
            response.send(html)
            connection.query(`SELECT * FROM lines_invoices`,(error, invoices) =>{
                if (error) {
                    console.log("ERROR DE SINTAXIS SQL QUERY")
                    return;
                }
            
                //console.log(invoices)
            });
        })
        .catch(error => {
            response.status(404).send(ERROR_MESSAGE+ error)
        })
})

app.get('/invoice/show_invoices', (request, response) => {
    fs.readFile('./html/show_invoices.html', 'utf-8')
        .then(html => {
            response.send(html)
        })
        .catch(error => {
            response.status(404).send(ERROR_MESSAGE + error)
        })
})

app.get('/invoice/companys', (request, response) => {
    fs.readFile('./html/companys.html', 'utf-8')
        .then(html => {
            response.send(html)
        })
        .catch(error => {
            response.status(404).send(ERROR_MESSAGE + error)
        })
})

app.post('/post_header_invoices',(request, response) => {
    let invoice_json = request.body;

    /**
     * INSERT INVOICE IN DB
     */
    let sql_insert = `
       INSERT INTO invoices (type_invoice, ruc, company, customer, date_invoice)  
       VALUES (?, ?, ?, ?, ?);
    `

    let values = [
       invoice_json.type_invoice, 
       invoice_json.ruc, 
       invoice_json.company,
       invoice_json.customer,
       invoice_json.date_invoice,
    ]

    /**
     * debug json
     */
    console.log("type of data sent in post =",typeof invoice_json)
    console.log(invoice_json)

    connection.execute(sql_insert, values, (err, result) => {
       if (err) {
           response.status(500).send("ERROR EN SINTAXIS DEL INSERT O EN LOS TIPOS DE DATOS :"+err);
           return;
       }
       
       console.log(
            pc.green("******FACTURA INSERTADA********")
        )
       response.status(200)
    });
})

app.post('/post_lines_invoices',(request, response) => {
    let line_json = request.body;

    /**
     * INSERT LINE INVOICE IN DB
     */
    let sql_insert = `
       INSERT INTO lines_invoices (id_invoice, item_name, unit, price, quantity)  
       VALUES (?, ?, ?, ?, ?);
    `

    let values = [
       line_json.id_invoice, 
       line_json.item_name, 
       line_json.unit, 
       line_json.price, 
       line_json.quantity
    ]

    /**
     * debug json
     */
    console.log("type of data sent in post =",typeof line_json)
    console.log(line_json)

    connection.execute(sql_insert, values, (error) => {
        if (error) {
            response.status(404)
            response.send("ERROR EN LA SINTAXIS DEL INSERT :",error)
        }else{
            response.status(200)
            console.log(
                pc.green("******LINEA INSERTADA CON EXITO******")
            )
        }


    })
    
})

app.get('/api/invoices', (request, response) => {

    let sql_query = `
        SELECT type_invoice, ruc, company, customer, date_invoice, gross_amount
          FROM invoices
    `

    connection.query(sql_query, (error, arr_invoices)=> {
        if (error) {
            console.log(
                pc.red("ERROR DE SINTAXIS EN LA QUERY",error)
                
            )
            response.status(500)

            return;
        }

        
        response.json(arr_invoices)
    })

})

app.listen(PORT, ()=> {
    console.log(
        pc.yellow(`LISTENING ON PORT http://localhost:${PORT}`)
    )
})