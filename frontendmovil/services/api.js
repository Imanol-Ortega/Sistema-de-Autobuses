export async function login(email, password) {
    if (email === 'test@correo.com' && password === '1234') {
        return { success: true, token: 'mock-token-123' };
    }
    return { success: false, message: 'Credenciales incorrectas' };
}

export async function getBuses() {
    return [
        { id: 1, lat: -27.3368, lon: -55.8661 },
        { id: 2, lat: -27.3391, lon: -55.8642 },
        { id: 3, lat: -27.3315, lon: -55.8683 },
    ];
}

export function getHorarios() {
    return [
        { id: 1, linea: '1A', hora: '06:30', destino: 'Terminal' },
        { id: 2, linea: '2B', hora: '07:15', destino: 'San Pedro' },
        { id: 3, linea: '3C', hora: '08:45', destino: 'Cambyretá' },
    ];
}
