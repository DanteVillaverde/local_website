const express = require('express');
const fs = require('node:fs/promises')
const pc = require('picocolors');
const app = express();
const PORT = process.env.PORT ?? 36395;
const ERROR_MESSAGE = '<h1>ERROR AL LEER ARCHIVO html</h1>'
const path = require("node:path");

let connection;


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

app.get('/app/qbe_show_invoices', async (request, response) => {
    let invoice_data = request.query;
    console.log('REQUEST INVOICE BACKEND =',invoice_data)
    /**
     * SQL Condition
     */
    let sql_condition = '1=1';
    let arr_values = [];

    if (invoice_data.type_invoice) {
        sql_condition += ` AND type_invoice = ?`;
        arr_values.push(invoice_data.type_invoice);
    } 

    if (invoice_data.serie) {
        sql_condition += ` AND serie = ?`;
        arr_values.push(invoice_data.serie);
    } 

    if (invoice_data.ruc) {
        sql_condition += ' AND ruc = ?';
        arr_values.push(invoice_data.ruc);
    } 

    if (invoice_data.company) {
        sql_condition += ` AND company = ?`;
        arr_values.push(invoice_data.company);
    } 

    if (invoice_data.customer) {
        sql_condition += ` AND customer = ?`;
        arr_values.push(invoice_data.customer);
    } 

    if (invoice_data.date_invoice) {
        sql_condition += ` AND date_invoice = ?`;
        arr_values.push(invoice_data.date_invoice);
    } 

    if (sql_condition == '1=1') {
        sql_condition = ` 1 = ?`;
        arr_values.push(1);
    }
    
    let sql_query = `
        SELECT * 
        FROM invoices
        WHERE ${sql_condition}
    `;
    
    console.log(sql_query)
    console.log('SQL CONDITION =',sql_condition)
    console.log(arr_values)

    try {
        let [invoices_filtered, fields] = await connection.query(sql_query, arr_values);
        response.json(invoices_filtered)
    } catch (error) {
        response.status(501).send(error)
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
     * MAKE CODE OF INVOICE
     */
    try {
        let number_serie;

        if (!invoice_json.number_serie) {
            
            let sql_get = `
                SELECT COUNT(*) invoices_serie
                FROM invoices
                WHERE substr(serie, 1, 4) = '${invoice_json.code_serie}'
            `

            let [ 
                [ {invoices_serie} ] , 
                fields
            ] = await connection.query(sql_get)
            
            number_serie = invoices_serie > 0 ? String(invoices_serie + 1) : '1';
        }else{
            number_serie = invoice_json.number_serie
        }

        invoice_json.serie = invoice_json.code_serie + '-' + number_serie;

    } catch (error) {
        console.log(error)
    }

    /**
     * INSERT INVOICE IN DB
     */
    let sql_insert = `
       INSERT INTO invoices (type_invoice, ruc, company, customer, date_invoice, serie)  
       VALUES (?, ?, ?, ?, ?, ?);
    `

    let values = [
       invoice_json.type_invoice, 
       invoice_json.ruc, 
       invoice_json.company,
       invoice_json.customer,
       invoice_json.date_invoice,
       invoice_json.serie
    ]

    /**
     * debug json
     */
    console.log("type of data sent in HEADER post =",typeof invoice_json)
    console.log(invoice_json)

    try {
        let [insert_info, table_info] = await connection.execute(sql_insert,values);

        console.log(pc.green("******FACTURA INSERTADA********"))
        response.status(200).json({message : 'sucess'})
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
    console.log("type of data sent in LINE post =",typeof line_json)
    console.log(line_json)

    try {
        let [insert_info, table_info] = await connection.execute(sql_insert, values);

        console.log(pc.green("******LINEA INSERTADA CON EXITO******"))
        response.status(200)
    } catch (error) {
        console.log(pc.red(error))
        response.status(404).send("ERROR EN LA SINTAXIS DEL INSERT :",error)
    }
    
})

app.listen(PORT, ()=> {
    console.log(
        pc.yellow(`LISTENING ON PORT http://localhost:${PORT}/app/register_invoice`)
    )
})