import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Shared Gemini Client (Server-side only)
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Endpoint for OCR and Invoice Data Extraction with Gemini 3.8 Flash
app.post('/api/scan-receipt', async (req, res) => {
  try {
    const { fileBase64, mimeType, filename } = req.body;

    if (!fileBase64) {
      return res.status(400).json({ error: 'No se recibió archivo o imagen en base64' });
    }

    const cleanBase64 = fileBase64.replace(/^data:([a-zA-Z0-9/+-]+);base64,/, '');
    const actualMimeType = mimeType || 'image/jpeg';

    if (ai && process.env.GEMINI_API_KEY) {
      try {
        const prompt = `Analiza esta factura, tiquete POS o soporte de gasto de caja menor para la empresa colombiana "Impresos El Día S.A.S.".
Extrae con precisión contable los siguientes campos según las normas tributarias DIAN de Colombia:
1. provider: Nombre o Razón Social del proveedor/tercero.
2. nit: Número de Identificación Tributaria (NIT) o Cédula del proveedor con dígito de verificación si aparece (ej. 900.123.456-1).
3. invoiceNumber: Número o consecutivo de factura, tiquete POS o comprobante.
4. date: Fecha del documento en formato YYYY-MM-DD. Si no es clara, usa la fecha más probable o actual.
5. subtotal: Subtotal antes de impuestos en pesos colombianos (COP).
6. iva: Valor del IVA en pesos colombianos (COP) o 0 si no aplica o no está discriminado.
7. total: Monto total pagado en pesos colombianos (COP).
8. category: Clasifica el gasto en una de estas categorías de caja menor de Impresos El Día S.A.S.:
   - "Papelería y Útiles"
   - "Aseo y Cafetería"
   - "Repuestos y Mantenimiento Litografía"
   - "Transporte y Mensajería"
   - "Combustibles y Peajes"
   - "Servicios y Fotocopias"
   - "Otros Gastos Menores"
9. description: Breve descripción clara y profesional del gasto realizado (ej. "Compra de tintas y solventes para taller de litografía", "Pago de carrera de taxi para entrega urgente de artes").
10. documentType: Uno de ["Factura Electrónica", "Tiquete POS", "Documento Soporte", "Comprobante de Caja"].
11. complianceStatus: "Válido DIAN" si tiene NIT y factura formal, o "Requiere Documento Soporte" si es proveedor no obligado a facturar.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: actualMimeType,
                  data: cleanBase64,
                },
              },
              { text: prompt },
            ],
          },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                provider: { type: Type.STRING },
                nit: { type: Type.STRING },
                invoiceNumber: { type: Type.STRING },
                date: { type: Type.STRING },
                subtotal: { type: Type.NUMBER },
                iva: { type: Type.NUMBER },
                total: { type: Type.NUMBER },
                category: { type: Type.STRING },
                description: { type: Type.STRING },
                documentType: { type: Type.STRING },
                complianceStatus: { type: Type.STRING },
              },
              required: ['provider', 'total', 'category', 'description'],
            },
          },
        });

        const rawText = response.text?.trim() || '{}';
        const parsedData = JSON.parse(rawText);

        return res.json({
          success: true,
          source: 'gemini-ai',
          data: parsedData,
        });
      } catch (geminiError: any) {
        console.warn('Gemini API call warning, falling back to simulated extraction:', geminiError?.message);
      }
    }

    // Heuristic / Simulated fallback if AI key is missing or service temporarily offline
    const today = new Date().toISOString().split('T')[0];
    const mockCategories = [
      {
        provider: 'Distribuidora Gráfica Papelcol S.A.S.',
        nit: '900.542.118-4',
        cat: 'Papelería y Útiles',
        desc: 'Pliegos de cartulina opalina y resmas bond para pruebas de impresión',
        total: 125000,
        subtotal: 105042,
        iva: 19958,
        docType: 'Factura Electrónica',
      },
      {
        provider: 'Insumos Industriales & Rodillos Litográficos',
        nit: '811.024.993-2',
        cat: 'Repuestos y Mantenimiento Litografía',
        desc: 'Solvente lavador de planchas y esponjas especiales litográficas',
        total: 180000,
        subtotal: 151261,
        iva: 28739,
        docType: 'Factura Electrónica',
      },
      {
        provider: 'Supermercado y Aseo El Diamante',
        nit: '901.332.109-1',
        cat: 'Aseo y Cafetería',
        desc: 'Café, azúcar, bolsas para residuos y toallas de manos para taller',
        total: 68500,
        subtotal: 68500,
        iva: 0,
        docType: 'Tiquete POS',
      },
      {
        provider: 'Mensajería Rápida Urbana & Envíos',
        nit: '900.871.229-8',
        cat: 'Transporte y Mensajería',
        desc: 'Flete de envío de prueba de color y planchas a cliente centro',
        total: 35000,
        subtotal: 35000,
        iva: 0,
        docType: 'Documento Soporte',
      },
    ];

    const pick = mockCategories[Math.floor(Math.random() * mockCategories.length)];
    const randomInvNum = 'FE-' + Math.floor(1000 + Math.random() * 9000);

    return res.json({
      success: true,
      source: 'simulated-ocr',
      data: {
        provider: pick.provider,
        nit: pick.nit,
        invoiceNumber: randomInvNum,
        date: today,
        subtotal: pick.subtotal,
        iva: pick.iva,
        total: pick.total,
        category: pick.cat,
        description: pick.desc,
        documentType: pick.docType,
        complianceStatus: 'Válido DIAN',
      },
      note: 'Extracción asistida (Modo demostración / contingencia)',
    });
  } catch (error: any) {
    console.error('Error in scan-receipt endpoint:', error);
    return res.status(500).json({ error: 'Error procesando el documento: ' + error.message });
  }
});

// Setup Vite in Dev or serve static files in Production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
