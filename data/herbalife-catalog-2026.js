/**
 * Herbalife Product Catalog - Seed Data (Abril 2026)
 * 
 * Source: Lista Oficial de Precios Herbalife Península - Abril 2026
 * Validated against real invoices.
 * 
 * Fields:
 *   - name: Product name
 *   - sku: Reference code
 *   - price: Retail price (Precio en Lista / PL)
 *   - basePrice: Earn Base (Base de Descuento / BD)
 *   - pv: Volume Points (Puntos de Volumen)
 *   - taxType: 'internal' (nutrition 10% IVA), 'external' (cosmetics 21% IVA), 'literature' (4% IVA)
 *   - category: Product line grouping for UI display
 */

export const HERBALIFE_CATALOG_2026 = [
    // =============================================
    // NUTRICIÓN BÁSICA (Fórmula 1, Fórmula 2, etc.)
    // =============================================
    {
        name: "Batido Fórmula 1 - Vainilla",
        sku: "0141",
        price: 45.51,
        basePrice: 41.70,
        pv: 25.75,
        taxType: "internal",
        category: "Nutrición Básica"
    },
    {
        name: "Batido Fórmula 1 - Chocolate",
        sku: "0142",
        price: 45.51,
        basePrice: 41.70,
        pv: 25.75,
        taxType: "internal",
        category: "Nutrición Básica"
    },
    {
        name: "Batido Fórmula 1 - Frutos Rojos",
        sku: "0146",
        price: 45.51,
        basePrice: 41.70,
        pv: 25.75,
        taxType: "internal",
        category: "Nutrición Básica"
    },
    {
        name: "Batido Fórmula 1 - Cookies & Cream",
        sku: "0147",
        price: 45.51,
        basePrice: 41.70,
        pv: 25.75,
        taxType: "internal",
        category: "Nutrición Básica"
    },
    {
        name: "Batido Fórmula 1 - Café Latte",
        sku: "1171",
        price: 45.51,
        basePrice: 41.70,
        pv: 25.75,
        taxType: "internal",
        category: "Nutrición Básica"
    },
    {
        name: "Batido Fórmula 1 - Banana y Caramelo",
        sku: "1470",
        price: 45.51,
        basePrice: 41.70,
        pv: 25.75,
        taxType: "internal",
        category: "Nutrición Básica"
    },
    {
        name: "Fórmula 2 Complejo Vitaminas (Hombre)",
        sku: "1800",
        price: 26.52,
        basePrice: 24.30,
        pv: 15.00,
        taxType: "internal",
        category: "Nutrición Básica"
    },
    {
        name: "Fórmula 2 Complejo Vitaminas (Mujer)",
        sku: "1819",
        price: 26.52,
        basePrice: 24.30,
        pv: 15.00,
        taxType: "internal",
        category: "Nutrición Básica"
    },
    {
        name: "Fórmula 3 - Proteína Personalizada (PPP)",
        sku: "0242",
        price: 42.83,
        basePrice: 39.24,
        pv: 24.25,
        taxType: "internal",
        category: "Nutrición Básica"
    },

    // =============================================
    // PAQUETES
    // =============================================
    {
        name: "Paquete Desayuno Saludable Vainilla",
        sku: "2589",
        price: 134.97,
        basePrice: 123.67,
        pv: 76.40,
        taxType: "internal",
        category: "Paquetes"
    },
    {
        name: "Paquete Desayuno Saludable Chocolate",
        sku: "2590",
        price: 134.97,
        basePrice: 123.67,
        pv: 76.40,
        taxType: "internal",
        category: "Paquetes"
    },

    // =============================================
    // BEBIDAS Y TÉS
    // =============================================
    {
        name: "Concentrado Herbal de Aloe - Original",
        sku: "0006",
        price: 40.49,
        basePrice: 37.10,
        pv: 22.90,
        taxType: "internal",
        category: "Bebidas"
    },
    {
        name: "Concentrado Herbal de Aloe - Mango",
        sku: "0626",
        price: 40.49,
        basePrice: 37.10,
        pv: 22.90,
        taxType: "internal",
        category: "Bebidas"
    },
    {
        name: "Bebida Instantánea de Té - Original",
        sku: "0255",
        price: 40.49,
        basePrice: 37.10,
        pv: 22.90,
        taxType: "internal",
        category: "Bebidas"
    },
    {
        name: "Bebida Instantánea de Té - Limón",
        sku: "0256",
        price: 40.49,
        basePrice: 37.10,
        pv: 22.90,
        taxType: "internal",
        category: "Bebidas"
    },
    {
        name: "Bebida Instantánea de Té - Melocotón",
        sku: "0258",
        price: 40.49,
        basePrice: 37.10,
        pv: 22.90,
        taxType: "internal",
        category: "Bebidas"
    },
    {
        name: "Bebida con Proteína CR7 Drive",
        sku: "1462",
        price: 25.23,
        basePrice: 23.12,
        pv: 14.30,
        taxType: "internal",
        category: "Bebidas"
    },

    // =============================================
    // SNACKS Y BARRITAS
    // =============================================
    {
        name: "Barritas con Proteína - Limón",
        sku: "3976",
        price: 25.13,
        basePrice: 14.62,
        pv: 9.00,
        taxType: "internal",
        category: "Snacks"
    },
    {
        name: "Barritas con Proteína - Chocolate",
        sku: "0561",
        price: 25.13,
        basePrice: 14.62,
        pv: 9.00,
        taxType: "internal",
        category: "Snacks"
    },
    {
        name: "Barritas con Proteína - Cítrico",
        sku: "0562",
        price: 25.13,
        basePrice: 14.62,
        pv: 9.00,
        taxType: "internal",
        category: "Snacks"
    },
    {
        name: "Proteína de Soja Tostada",
        sku: "0120",
        price: 17.42,
        basePrice: 15.95,
        pv: 9.85,
        taxType: "internal",
        category: "Snacks"
    },

    // =============================================
    // NUTRICIÓN DIRIGIDA
    // =============================================
    {
        name: "Herbalife Nutrition Active Fiber Complex",
        sku: "2862",
        price: 34.26,
        basePrice: 31.39,
        pv: 19.40,
        taxType: "internal",
        category: "Nutrición Dirigida"
    },
    {
        name: "Cell Activator",
        sku: "6673",
        price: 38.38,
        basePrice: 35.17,
        pv: 21.73,
        taxType: "internal",
        category: "Nutrición Dirigida"
    },
    {
        name: "Xtra-Cal (Calcio avanzado)",
        sku: "0020",
        price: 22.78,
        basePrice: 20.87,
        pv: 12.90,
        taxType: "internal",
        category: "Nutrición Dirigida"
    },
    {
        name: "Herbalifeline Max (Omega 3)",
        sku: "0127",
        price: 44.02,
        basePrice: 40.33,
        pv: 24.90,
        taxType: "internal",
        category: "Nutrición Dirigida"
    },
    {
        name: "Beta Heart (Avena beta-glucano)",
        sku: "1065",
        price: 47.09,
        basePrice: 43.14,
        pv: 26.65,
        taxType: "internal",
        category: "Nutrición Dirigida"
    },

    // =============================================
    // HL / SKIN (Cosmética - Nueva Línea 2026)
    // =============================================
    {
        name: "Gel Limpiador Renovador HL/SKIN",
        sku: "511K",
        price: 30.94,
        basePrice: 28.35,
        pv: 17.50,
        taxType: "external",
        category: "HL/SKIN"
    },
    {
        name: "Crema Tensora HL/SKIN",
        sku: "513K",
        price: 51.14,
        basePrice: 46.85,
        pv: 28.95,
        taxType: "external",
        category: "HL/SKIN"
    },
    {
        name: "Crema de Ojos Nutritiva HL/SKIN",
        sku: "515K",
        price: 38.87,
        basePrice: 35.61,
        pv: 22.00,
        taxType: "external",
        category: "HL/SKIN"
    },
    {
        name: "Sérum con 10% Niacinamida HL/SKIN",
        sku: "508K",
        price: 46.03,
        basePrice: 42.17,
        pv: 26.05,
        taxType: "external",
        category: "HL/SKIN"
    },
    {
        name: "Crema de Noche Revitalizante HL/SKIN",
        sku: "539K",
        price: 51.14,
        basePrice: 46.85,
        pv: 28.95,
        taxType: "external",
        category: "HL/SKIN"
    },
    {
        name: "Paquete Esenciales HL/SKIN",
        sku: "4T53",
        price: 141.15,
        basePrice: 129.33,
        pv: 79.90,
        taxType: "external",
        category: "HL/SKIN"
    },

    // =============================================
    // SKIN (Línea Clásica)
    // =============================================
    {
        name: "Crema Hidratante de Ojos SKIN",
        sku: "0771",
        price: 38.87,
        basePrice: 35.61,
        pv: 22.00,
        taxType: "external",
        category: "SKIN Clásica"
    },
    {
        name: "Crema Revitalizante de Noche SKIN",
        sku: "0827",
        price: 49.38,
        basePrice: 45.25,
        pv: 27.95,
        taxType: "external",
        category: "SKIN Clásica"
    },
    {
        name: "Sérum Minimizador de Líneas SKIN",
        sku: "0829",
        price: 63.87,
        basePrice: 58.52,
        pv: 36.15,
        taxType: "external",
        category: "SKIN Clásica"
    },
    {
        name: "Gel Limpiador Purificante SKIN",
        sku: "0773",
        price: 26.99,
        basePrice: 24.73,
        pv: 15.28,
        taxType: "external",
        category: "SKIN Clásica"
    }
];
