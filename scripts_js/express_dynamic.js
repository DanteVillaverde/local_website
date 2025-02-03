const express = require('express');
const fs = require('node:fs/promises')
const mysql = require('mysql2/promise');
const pc = require('picocolors');
const app = express();
const PORT = process.env.PORT ?? 36395;
const ERROR_MESSAGE = '<h1>ERROR AL LEER ARCHIVO html</h1>'
const path = require("node:path")

let connection;

async function connectDB() {
    connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        port: 3306,
        password: 'supxer',
        database: 'dvr_facturas'
    });

    console.log(pc.green("✅ Conectado a MySQL"));
}

connectDB();

app.use(express.static(path.join(__dirname,'../public'))); // Para los JS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * ===================================
 *      GET METHODS
 * ===================================
 */
app.get('/app/register_invoice',async (request, response) => {
    try {
        let html = await fs.readFile('./html/register_invoice.html', 'utf-8');
        response.status(200).send(html);
    } catch (error) {
        response.status(404).send(ERROR_MESSAGE+ error);
    }
})

app.get('/app/show_invoices', async (request, response) => {
    try {
        let html = await fs.readFile('./html/show_invoices.html', 'utf-8');
        response.status(200).send(html);
    } catch (error) {
        response.status(404).send(ERROR_MESSAGE+ error);
    }
})

app.get('/app/companys', async (request, response) => {
    try {
        let html = await fs.readFile('./html/companys.html', 'utf-8');
        response.status(200).send(html)
    } catch (error) {
        response.status(404).send(ERROR_MESSAGE + error)
    }
})

app.get('/api/invoices', async (request, response) => {

    let sql_query = `
        SELECT type_invoice, ruc, company, customer, date_invoice, gross_amount
          FROM invoices
    `
    try {
        let [arr_invoices, arr_table_info] = await connection.query(sql_query)
        response.status(202).json(arr_invoices);
    } catch (error) {
        response.status(500)
    }

})

/**
 * ===================================
 *      POST METHODS
 * ===================================
 */

app.post('/post_header_invoices',async (request, response) => {
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

    try {
        let [insert_info, table_info] = await connection.execute(sql_insert,values);
        console.log(
            pc.green("******FACTURA INSERTADA********")
        )
        response.status(200)
    } catch (error) {
        response.status(500).send("ERROR EN SINTAXIS DEL INSERT O EN LOS TIPOS DE DATOS :" + error);
    }
})

app.post('/post_lines_invoices',async (request, response) => {
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

    try {
        let [insert_info, table_info] = await connection.execute(sql_insert, values);

        console.log(pc.green("******LINEA INSERTADA CON EXITO******"))
        response.status(200)
    } catch (error) {
        response.status(404)
        response.send("ERROR EN LA SINTAXIS DEL INSERT :",error)
    }
    
})

app.post('/post_qbe_invoices', async (request, response) => {
    let json_qbe = request.body;
    
})

app.listen(PORT, ()=> {
    console.log(
        pc.yellow(`LISTENING ON PORT http://localhost:${PORT}/app/register_invoice`)
    )
})