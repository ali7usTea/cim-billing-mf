import { extractSubTableData } from '../../src/utils/subTableDataExtractor';

describe('subTableDataExtractor', () => {
    it('extracts columns from input string', () => {
        const input = 'columns=["col1","col2","col3"] rows=[{a=1, b=2}]';
        const result = extractSubTableData(input);
        expect(result.columns).toEqual(['col1', 'col2', 'col3']);
    });

    it('returns empty columns when no columns match', () => {
        const input = 'no columns here rows=[{a=1}]';
        const result = extractSubTableData(input);
        expect(result.columns).toEqual([]);
    });

    it('returns empty rows when no rows match', () => {
        const input = 'columns=["col1"] no rows here';
        const result = extractSubTableData(input);
        expect(result.rows).toEqual([]);
    });

    it('handles input with both columns and rows', () => {
        const input = 'columns=["name","age"] rows=[{name=John, age=30}]';
        const result = extractSubTableData(input);
        expect(result.columns).toEqual(['name', 'age']);
        expect(result.rows.length).toBeGreaterThan(0);
    });
});
