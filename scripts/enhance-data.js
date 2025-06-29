#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');

// Sample data generation for testing
const enhancedData = {
  'cat': {
    fr: {
      frequency_score: 8500, // Very common word
      example_native: "Le chat dort sur le canapé.",
      pronunciation: "/ʃa/", 
      usage_context: "Mot générique pour 'chat'. Bien que 'chatte' existe pour la femelle, 'chat' est utilisé comme terme général pour l'espèce.",
      gender_reason: "Du latin 'cattus' (masculin), mais le français a adopté la forme féminine 'chatte' comme standard. Le genre féminin reflète peut-être l'association culturelle avec la grâce et la domesticité."
    },
    de: {
      frequency_score: 7200,
      example_native: "Die Katze schläft auf dem Sofa.",
      pronunciation: "/ˈkat͡sə/",
      usage_context: "Standard-Bezeichnung für Katze. 'Kater' wird spezifisch für männliche Katzen verwendet, aber 'Katze' ist der allgemeine Begriff.",
      gender_reason: "Vom althochdeutschen 'kazza' (weiblich). Deutsche Tiernamen kleinerer Haustiere tendieren häufig zum femininen Genus, was Nähe und Vertrautheit ausdrückt."
    },
    es: {
      frequency_score: 8100,
      example_native: "El gato duerme en el sofá.",
      pronunciation: "/ˈɡato/",
      usage_context: "Término general para gato. 'Gata' se usa específicamente para hembras, pero 'gato' sirve como genérico.",
      gender_reason: "Del latín 'cattus' (masculino). El español mantiene el género latino original. Los nombres de animales domésticos suelen conservar su género etimológico."
    }
  },
  'book': {
    fr: {
      frequency_score: 9200, // Very common
      example_native: "J'ai lu un bon livre hier soir.",
      pronunciation: "/livʁ/",
      usage_context: "Terme standard pour livre. Plus formel que 'bouquin' qui est familier.",
      gender_reason: "Du latin 'liber' (masculin). Le français conserve généralement le genre des substantifs latins, surtout pour les concepts abstraits et intellectuels."
    },
    de: {
      frequency_score: 9500,
      example_native: "Das Buch liegt auf dem Tisch.",
      pronunciation: "/buːχ/",
      usage_context: "Standardwort für Buch in allen Kontexten, sowohl gedruckt als auch digital.",
      gender_reason: "Vom althochdeutschen 'buoh' (neutrum). Neutrum ist typisch für abstrakte Konzepte und Objekte ohne natürliches Geschlecht im Deutschen."
    },
    es: {
      frequency_score: 9400,
      example_native: "El libro está sobre la mesa.",
      pronunciation: "/ˈlibɾo/",
      usage_context: "Palabra estándar para libro en todos los contextos, tanto físico como digital.",
      gender_reason: "Del latín 'liber' (masculino). El español mantiene el género masculino latino para objetos relacionados con el conocimiento y la escritura."
    }
  },
  'house': {
    fr: {
      frequency_score: 9100,
      example_native: "La maison est grande et belle.",
      pronunciation: "/mɛ.zɔ̃/",
      usage_context: "Terme général pour habitation familiale. Distinct de 'immeuble' (appartement) ou 'château' (manor).",
      gender_reason: "Du latin 'mansio' (féminin). Les noms de lieux d'habitation sont souvent féminins en français, associés à l'idée de protection et d'accueil."
    },
    de: {
      frequency_score: 9300,
      example_native: "Das Haus ist groß und schön.",
      pronunciation: "/haʊs/",
      usage_context: "Allgemeine Bezeichnung für Wohngebäude. Unterscheidet sich von 'Wohnung' (Apartment) oder 'Villa' (Villa).",
      gender_reason: "Vom althochdeutschen 'hūs' (neutrum). Gebäude und Strukturen sind im Deutschen typischerweise neutral, da sie als sachliche Objekte betrachtet werden."
    },
    es: {
      frequency_score: 9200,
      example_native: "La casa es grande y hermosa.",
      pronunciation: "/ˈkasa/",
      usage_context: "Término general para vivienda familiar. Se distingue de 'apartamento' o 'mansión'.",
      gender_reason: "Del latín 'casa' (féminin). Los espacios domésticos y de refugio tienden a ser femeninos en español, reflejando conceptos de acogida y protección."
    }
  }
};

function updateDatabase() {
  const db = new Database(path.join(__dirname, '../data/translation.db'));
  
  try {
    const updateFr = db.prepare(`
      UPDATE translation_fr 
      SET frequency_score = ?, example_native_1 = ?, pronunciation_1 = ?, 
          usage_context_1 = ?, gender_reason_1 = ?
      WHERE en = ?
    `);
    
    const updateDe = db.prepare(`
      UPDATE translation_de 
      SET frequency_score = ?, example_native_1 = ?, pronunciation_1 = ?, 
          usage_context_1 = ?, gender_reason_1 = ?
      WHERE en = ?
    `);
    
    const updateEs = db.prepare(`
      UPDATE translation_es 
      SET frequency_score = ?, example_native_1 = ?, pronunciation_1 = ?, 
          usage_context_1 = ?, gender_reason_1 = ?
      WHERE en = ?
    `);

    // Update sample words
    for (const [word, langData] of Object.entries(enhancedData)) {
      if (langData.fr) {
        const { frequency_score, example_native, pronunciation, usage_context, gender_reason } = langData.fr;
        updateFr.run(frequency_score, example_native, pronunciation, usage_context, gender_reason, word);
        console.log(`Updated French data for: ${word}`);
      }
      
      if (langData.de) {
        const { frequency_score, example_native, pronunciation, usage_context, gender_reason } = langData.de;
        updateDe.run(frequency_score, example_native, pronunciation, usage_context, gender_reason, word);
        console.log(`Updated German data for: ${word}`);
      }
      
      if (langData.es) {
        const { frequency_score, example_native, pronunciation, usage_context, gender_reason } = langData.es;
        updateEs.run(frequency_score, example_native, pronunciation, usage_context, gender_reason, word);
        console.log(`Updated Spanish data for: ${word}`);
      }
    }
    
    console.log('✅ Sample data enhancement completed!');
  } catch (error) {
    console.error('Error updating database:', error);
  } finally {
    db.close();
  }
}

updateDatabase();