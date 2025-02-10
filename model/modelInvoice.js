const mysql = require('mysql2/promise');

async function connectDB() {
    connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        port: 3306,
        password: 'supxer',
        database: 'dvr_facturas'
    });

    console.log(pc.yellow("✅ Conectado a MySQL"));
}
connectDB();

class ModelInvoice {
    constructor(parameters) {

    }

    async insertInvoice () {
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
    }

    async insertLineInvoice() {
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
    }
}