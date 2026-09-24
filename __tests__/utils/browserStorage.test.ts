import {
    saveToLocalStorage,
    loadFromLocalStorage,
    saveToSessionStorage,
    loadFromSessionStorage,
} from '../../src/utils/browserStorage';

describe('browserStorage', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    describe('saveToLocalStorage', () => {
        it('saves a value to localStorage', () => {
            saveToLocalStorage('testKey', { foo: 'bar' });
            expect(localStorage.getItem('testKey')).toBe(JSON.stringify({ foo: 'bar' }));
        });

        it('handles string values', () => {
            saveToLocalStorage('strKey', 'hello');
            expect(localStorage.getItem('strKey')).toBe(JSON.stringify('hello'));
        });
    });

    describe('loadFromLocalStorage', () => {
        it('returns stringified value when key exists', () => {
            localStorage.setItem('testKey', JSON.stringify({ foo: 'bar' }));
            const result = loadFromLocalStorage('testKey');
            expect(result).not.toBeNull();
        });

        it('returns null when key does not exist', () => {
            const result = loadFromLocalStorage('nonexistent');
            expect(result).toBeNull();
        });
    });

    describe('saveToSessionStorage', () => {
        it('saves a value to sessionStorage', () => {
            saveToSessionStorage('sessKey', { name: 'test' });
            expect(sessionStorage.getItem('sessKey')).toBe(JSON.stringify({ name: 'test' }));
        });
    });

    describe('loadFromSessionStorage', () => {
        it('returns stringified value when key exists', () => {
            sessionStorage.setItem('sessKey', JSON.stringify('value'));
            const result = loadFromSessionStorage('sessKey');
            expect(result).not.toBeNull();
        });

        it('returns null when key does not exist', () => {
            const result = loadFromSessionStorage('nonexistent');
            expect(result).toBeNull();
        });
    });
});
