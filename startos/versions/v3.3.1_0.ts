import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { readdir, rm } from 'fs/promises'

export const v_3_3_1_0 = VersionInfo.of({
  version: '3.3.1:0',
  releaseNotes: {
    en_US: `Updated Immich to 3.3.1.

- People can now be shared with other users, who see them in their own people list and can edit their name and birth date.
- Birthday memories celebrate the people in your library with photos from previous birthdays.
- Edits made on your phone in other apps are stacked on top of the original instead of cluttering the timeline.
- OAuth logins can now sync storage quota, role and username on every sign-in.
- Thumbnails and previews are sharper and more accurate. Existing thumbnails change only if you regenerate them from the job panel.
- New, more accurate PP-OCRv6 text recognition models.
- Smart search, face recognition and text recognition run faster and use less memory. The first run after updating downloads new models, so these jobs take longer once; existing results are kept.
- Workflow steps now run in their configured order.

[Full upstream release notes](https://github.com/immich-app/immich/releases/tag/v3.3.0)`,
    es_ES: `Actualiza Immich a 3.3.1.

- Ahora se pueden compartir personas con otros usuarios, que las ven en su propia lista de personas y pueden editar su nombre y fecha de nacimiento.
- Los recuerdos de cumpleaños celebran a las personas de su biblioteca con fotos de cumpleaños anteriores.
- Las ediciones hechas en el teléfono con otras aplicaciones se apilan sobre el original en lugar de llenar la línea de tiempo.
- Los inicios de sesión OAuth ahora pueden sincronizar la cuota de almacenamiento, el rol y el nombre de usuario en cada inicio de sesión.
- Las miniaturas y vistas previas son más nítidas y precisas. Las miniaturas existentes solo cambian si las regenera desde el panel de tareas.
- Nuevos modelos de reconocimiento de texto PP-OCRv6, más precisos.
- La búsqueda inteligente, el reconocimiento facial y el reconocimiento de texto son más rápidos y usan menos memoria. La primera ejecución tras actualizar descarga modelos nuevos, por lo que estas tareas tardan más una vez; los resultados existentes se conservan.
- Los pasos de los flujos de trabajo ahora se ejecutan en el orden configurado.

[Notas de la versión completas](https://github.com/immich-app/immich/releases/tag/v3.3.0)`,
    de_DE: `Aktualisiert Immich auf 3.3.1.

- Personen können jetzt mit anderen Benutzern geteilt werden, die sie in ihrer eigenen Personenliste sehen und Name und Geburtsdatum bearbeiten können.
- Geburtstagserinnerungen feiern die Personen in Ihrer Bibliothek mit Fotos früherer Geburtstage.
- Auf dem Telefon in anderen Apps bearbeitete Fotos werden auf dem Original gestapelt, statt die Zeitachse zu füllen.
- OAuth-Anmeldungen können Speicherkontingent, Rolle und Benutzernamen jetzt bei jeder Anmeldung synchronisieren.
- Miniaturansichten und Vorschauen sind schärfer und genauer. Vorhandene Miniaturansichten ändern sich nur, wenn Sie sie im Aufgabenbereich neu erzeugen.
- Neue, genauere Texterkennungsmodelle PP-OCRv6.
- Intelligente Suche, Gesichtserkennung und Texterkennung laufen schneller und brauchen weniger Speicher. Der erste Lauf nach dem Update lädt neue Modelle herunter, daher dauern diese Aufgaben einmalig länger; vorhandene Ergebnisse bleiben erhalten.
- Workflow-Schritte laufen jetzt in der konfigurierten Reihenfolge.

[Vollständige Versionshinweise](https://github.com/immich-app/immich/releases/tag/v3.3.0)`,
    pl_PL: `Aktualizacja Immich do 3.3.1.

- Osoby można teraz udostępniać innym użytkownikom, którzy widzą je na własnej liście osób i mogą edytować ich imię oraz datę urodzenia.
- Wspomnienia urodzinowe świętują osoby z Twojej biblioteki zdjęciami z poprzednich urodzin.
- Zdjęcia edytowane na telefonie w innych aplikacjach są układane na stosie nad oryginałem, zamiast zaśmiecać oś czasu.
- Logowania OAuth mogą teraz synchronizować limit miejsca, rolę i nazwę użytkownika przy każdym logowaniu.
- Miniatury i podglądy są ostrzejsze i dokładniejsze. Istniejące miniatury zmienią się tylko po ich ponownym wygenerowaniu w panelu zadań.
- Nowe, dokładniejsze modele rozpoznawania tekstu PP-OCRv6.
- Inteligentne wyszukiwanie, rozpoznawanie twarzy i rozpoznawanie tekstu działają szybciej i zużywają mniej pamięci. Pierwsze uruchomienie po aktualizacji pobiera nowe modele, więc te zadania raz potrwają dłużej; istniejące wyniki zostają zachowane.
- Kroki przepływów pracy są teraz wykonywane w skonfigurowanej kolejności.

[Pełne informacje o wydaniu](https://github.com/immich-app/immich/releases/tag/v3.3.0)`,
    fr_FR: `Mise à jour d'Immich vers 3.3.1.

- Les personnes peuvent désormais être partagées avec d'autres utilisateurs, qui les voient dans leur propre liste de personnes et peuvent modifier leur nom et leur date de naissance.
- Les souvenirs d'anniversaire célèbrent les personnes de votre bibliothèque avec des photos des anniversaires précédents.
- Les modifications faites sur votre téléphone dans d'autres applications sont empilées sur l'original au lieu d'encombrer la chronologie.
- Les connexions OAuth peuvent désormais synchroniser le quota de stockage, le rôle et le nom d'utilisateur à chaque connexion.
- Les miniatures et aperçus sont plus nets et plus fidèles. Les miniatures existantes ne changent que si vous les régénérez depuis le panneau des tâches.
- Nouveaux modèles de reconnaissance de texte PP-OCRv6, plus précis.
- La recherche intelligente, la reconnaissance faciale et la reconnaissance de texte sont plus rapides et consomment moins de mémoire. La première exécution après la mise à jour télécharge de nouveaux modèles, ces tâches prennent donc plus de temps une fois ; les résultats existants sont conservés.
- Les étapes des workflows s'exécutent désormais dans l'ordre configuré.

[Notes de version complètes](https://github.com/immich-app/immich/releases/tag/v3.3.0)`,
  },
  migrations: {
    up: async () => {
      // Immich keeps original-revision models at the root of each model's directory and v2 models in its `v2/` subdirectory.
      const cache = '/media/startos/volumes/model-cache'
      for (const task of ['clip', 'facial-recognition', 'ocr']) {
        for (const model of await readdir(`${cache}/${task}`).catch(() => [])) {
          const dir = `${cache}/${task}/${model}`
          for (const entry of await readdir(dir).catch(() => [])) {
            if (entry !== 'v2')
              await rm(`${dir}/${entry}`, { recursive: true, force: true })
          }
        }
      }
    },
    down: IMPOSSIBLE,
  },
})
