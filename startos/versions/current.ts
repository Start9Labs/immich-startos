import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.3.3:1',
  releaseNotes: {
    en_US:
      "Other services can now ask to read an Immich account's photos, albums, people and tags. Each request appears as a task in Immich, where you choose the account or deny it, and an approved service's key is listed under Account Settings → API Keys in that account.",
    es_ES:
      'Otros servicios ahora pueden solicitar leer las fotos, álbumes, personas y etiquetas de una cuenta de Immich. Cada solicitud aparece como una tarea en Immich, donde usted elige la cuenta o la deniega, y la clave de un servicio aprobado aparece en Ajustes de la cuenta → Claves API de esa cuenta.',
    de_DE:
      'Andere Dienste können jetzt anfragen, die Fotos, Alben, Personen und Tags eines Immich-Kontos zu lesen. Jede Anfrage erscheint als Aufgabe in Immich, wo Sie das Konto wählen oder die Anfrage ablehnen, und der Schlüssel eines genehmigten Dienstes steht in diesem Konto unter Kontoeinstellungen → API-Schlüssel.',
    pl_PL:
      'Inne usługi mogą teraz prosić o odczyt zdjęć, albumów, osób i tagów konta Immich. Każda prośba pojawia się jako zadanie w Immich, gdzie wybierasz konto albo ją odrzucasz, a klucz zatwierdzonej usługi jest widoczny w tym koncie w Ustawienia konta → Klucze API.',
    fr_FR:
      "D'autres services peuvent désormais demander à lire les photos, albums, personnes et étiquettes d'un compte Immich. Chaque demande apparaît comme une tâche dans Immich, où vous choisissez le compte ou la refusez, et la clé d'un service approuvé figure dans Paramètres du compte → Clés d'API de ce compte.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
