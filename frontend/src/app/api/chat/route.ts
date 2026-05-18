import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Falta la API Key de Gemini' }, { status: 500 });
    }

    const { message, history, userData } = await req.json();

    let contextString = "";
    if (userData && userData.reporte) {
      contextString = `
DATOS ACTUALES DEL USUARIO:
- Balance: $${userData.reporte.balance}
- Ingresos este mes: $${userData.reporte.total_ingresos}
- Gastos este mes: $${userData.reporte.total_gastos}
- Gastos por categoría: ${JSON.stringify(userData.reporte.gastos_por_categoria)}
- Presupuestos: ${JSON.stringify(userData.presupuestos)}
Usa estos datos reales para responder dudas específicas sobre su dinero.`;
    }

    const systemPrompt = `Eres un asistente financiero virtual experto llamado "Fini". 
Tu objetivo es ayudar al usuario a administrar su dinero, entender sus gastos, ahorrar y planificar.
Reglas:
- Sé amigable, profesional y directo.
- Da consejos prácticos y realistas.
- Mantén tus respuestas muy breves (máximo 2 o 3 párrafos cortos) porque estás en una ventana de chat pequeña.
- Si el usuario te saluda, preséntate brevemente y ofrécele ayuda con su presupuesto o reporte.
${contextString}`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", 
      systemInstruction: systemPrompt 
    });

    const chatHistory = history.map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const chat = model.startChat({
      history: chatHistory
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error('Error en el chat:', error);
    return NextResponse.json({ error: 'Hubo un error procesando tu mensaje.' }, { status: 500 });
  }
}
