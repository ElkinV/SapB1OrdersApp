import odbc from "odbc";
let connection
async function sapQuery(connectionString, schema, query, parameter) {
    console.log('Attempting to connect to the database...');
    connection = await odbc.connect(connectionString);
    console.log('Connected to the database');

    await connection.query('SET SCHEMA '+ schema);
    let result;
    if(parameter) {
        result = await connection.query(query, parameter);
    }
    else{
        result = await connection.query(query);
    }

    if (connection) {
        try {
            await connection.close();
            console.log('Database connection closed');
        } catch (closeError) {
            console.error('Error closing database connection:', closeError);
        }
    }
    return result;
}
export default sapQuery;