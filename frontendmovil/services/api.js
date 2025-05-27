export async function login(email, password) {
    if (email === 'test@correo.com' && password === '1234') {
        return { success: true, token: 'mock-token-123' };
    }
    return { success: false, message: 'Credenciales incorrectas' };
}

export const getBuses = async () => {
    try {
        const response = await fetch("http://192.168.0.58:5000/api/buses");
        const data = await response.json();  
        return data;
    } catch (error) {
        console.error("Error al obtener buses:", error);
        return [];
    }
};

export function getHorarios() {
    return [
        { id: 1, linea: '1A', hora: '06:30', destino: 'Terminal' },
        { id: 2, linea: '2B', hora: '07:15', destino: 'San Pedro' },
        { id: 3, linea: '3C', hora: '08:45', destino: 'Cambyretá' },
    ];
}
