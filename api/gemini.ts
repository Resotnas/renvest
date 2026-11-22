// Vercel Serverless Function — Proxy seguro para a API do Google Gemini
// Em produção na Vercel, configure a variável de ambiente GEMINI_API_KEY (sem prefixo VITE_).

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'GEMINI_API_KEY não configurada no servidor.' });
  }

  try {
    const { prompt, systemInstruction, responseMimeType } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt obrigatório.' });
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const body: Record<string, unknown> = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        ...(responseMimeType ? { responseMimeType } : {}),
      },
    };

    if (systemInstruction) {
      body.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      return res.status(upstream.status).json({ error: errText });
    }

    const data = await upstream.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return res.status(200).json({ text });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Erro interno ao chamar Gemini.' });
  }
}
