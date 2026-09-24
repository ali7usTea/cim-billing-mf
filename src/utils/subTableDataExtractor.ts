export function extractSubTableData(input: string) {
    // Extract the JSON part for columns and rows using regex
    const columnsMatch = input.match(/columns=\[([^\]]+)\]/);
    const rowsMatch = input.match(/rows=\[([^\]]+)\]/);

    let columns = [];
    //@ts-ignore
    let rows = [];

    // Parse columns
    if (columnsMatch) {
        const columnsJSON = `[${columnsMatch[1]}]`;
        columns = JSON.parse(columnsJSON);
    }

    // Parse rows
    if (rowsMatch) {
        const rowsString = rowsMatch[1]
            .replace(/=/g, ':') // Replace `=` with `:` for JSON compatibility
            .replace(/{{/g, '{') // Normalize nested braces
            .replace(/}}/g, '}') // Normalize nested braces
            .replace(/([\w\s]+):/g, '"$1":'); // Ensure all keys are wrapped in quotes

        // Split rows into separate objects
        const rowsArray = rowsString.split('}, {').map(row => {
            const cleanRow = row.trim();

            // Add braces to make it valid JSON if necessary
            if (!cleanRow.startsWith('{')) {
                row = `{${cleanRow}`;
            }
            if (!cleanRow.endsWith('}')) {
                row = `${cleanRow}}`;
            }
            console.log(row)
            return row
            // Parse the row into an object
            // return JSON.parse(row);
        });

        rows = rowsArray;
    }

    //@ts-ignore
    return { columns, rows };
}