import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.1.0:2',
  releaseNotes: {
    en_US: `Fixes a startup loop on slower servers, lets Immich run without machine learning, and makes saving external libraries forgiving of one bad row.

- **Immich now starts reliably on slower hardware.** On a small or heavily loaded server — a Raspberry Pi 4, for instance — the checks asking whether Immich's database and web interface are up gave up after a second or two, a deadline easily passed when the machine is merely busy. Immich was then stopped and restarted from the beginning, over and over, and the web interface never became ready. Those checks now wait long enough to tell a busy server from a broken one.
- **Machine learning no longer holds back the rest of Immich.** Immich was made to wait for its machine-learning container before starting, even though it watches that container itself and works without it. On hardware where machine learning cannot run — an older x86 processor, for instance — that left the whole of Immich waiting forever instead of running without smart search and face recognition, and elsewhere a momentary hiccup in machine learning restarted everything.
- **One broken library no longer blocks the whole Manage External Libraries form.** A library pointing at a folder that has gone away — usually because its photo source was disconnected — made every save fail, including edits to unrelated libraries and removals. Each library is now applied on its own, and anything that could not be saved is named in the error.

Immich itself is unchanged.`,
    es_ES: `Corrige un bucle de arranque en servidores lentos, permite que Immich funcione sin aprendizaje automático y hace que el guardado de bibliotecas externas tolere una fila defectuosa.

- **Immich ya arranca de forma fiable en hardware lento.** En un servidor modesto o muy cargado —una Raspberry Pi 4, por ejemplo— las comprobaciones que preguntan si la base de datos y la interfaz web de Immich están listas se rendían al cabo de uno o dos segundos, un plazo que se supera con facilidad cuando la máquina simplemente está ocupada. Immich se detenía entonces y volvía a empezar desde cero una y otra vez, y la interfaz web nunca llegaba a estar lista. Esas comprobaciones ahora esperan lo suficiente para distinguir un servidor ocupado de uno averiado.
- **El aprendizaje automático ya no frena al resto de Immich.** Se hacía esperar a Immich por su contenedor de aprendizaje automático antes de arrancar, aunque Immich lo vigila por su cuenta y funciona sin él. En hardware donde el aprendizaje automático no puede ejecutarse —un procesador x86 antiguo, por ejemplo— eso dejaba todo Immich esperando indefinidamente en lugar de funcionar sin búsqueda inteligente ni reconocimiento facial; y en los demás casos, un fallo momentáneo del aprendizaje automático reiniciaba todo.
- **Una biblioteca averiada ya no bloquea todo el formulario Gestionar bibliotecas externas.** Una biblioteca que apuntaba a una carpeta desaparecida —normalmente porque se desconectó su fuente de fotos— hacía fallar cualquier guardado, incluidas las ediciones de bibliotecas ajenas y las eliminaciones. Ahora cada biblioteca se aplica por separado, y el error nombra las que no se han podido guardar.

Immich en sí no ha cambiado.`,
    de_DE: `Behebt eine Startschleife auf langsamen Servern, lässt Immich ohne maschinelles Lernen laufen und macht das Speichern externer Bibliotheken gegenüber einem fehlerhaften Eintrag nachsichtig.

- **Immich startet jetzt auch auf langsamer Hardware zuverlässig.** Auf einem kleinen oder stark ausgelasteten Server – etwa einem Raspberry Pi 4 – gaben die Prüfungen, ob Immichs Datenbank und Weboberfläche bereit sind, schon nach ein bis zwei Sekunden auf; diese Frist ist überschritten, sobald die Maschine schlicht beschäftigt ist. Immich wurde daraufhin gestoppt und wieder von vorn begonnen, immer wieder, und die Weboberfläche wurde nie bereit. Diese Prüfungen warten nun lange genug, um einen ausgelasteten Server von einem defekten zu unterscheiden.
- **Maschinelles Lernen hält den Rest von Immich nicht mehr auf.** Immich musste vor dem Start auf seinen Container für maschinelles Lernen warten, obwohl es diesen selbst überwacht und auch ohne ihn funktioniert. Auf Hardware, auf der maschinelles Lernen nicht laufen kann – etwa einem älteren x86-Prozessor –, wartete dadurch ganz Immich endlos, statt ohne intelligente Suche und Gesichtserkennung zu laufen; andernorts startete ein kurzzeitiger Aussetzer des maschinellen Lernens alles neu.
- **Ein defekter Eintrag blockiert nicht mehr das ganze Formular „Externe Bibliotheken verwalten“.** Eine Bibliothek, die auf einen verschwundenen Ordner zeigte – meist weil ihre Fotoquelle getrennt wurde –, ließ jedes Speichern fehlschlagen, auch Änderungen an anderen Bibliotheken und Entfernungen. Jede Bibliothek wird jetzt einzeln angewendet, und was nicht gespeichert werden konnte, wird in der Fehlermeldung benannt.

Immich selbst ist unverändert.`,
    pl_PL: `Naprawia pętlę uruchamiania na wolniejszych serwerach, pozwala Immichowi działać bez uczenia maszynowego i sprawia, że zapisywanie bibliotek zewnętrznych znosi jeden wadliwy wiersz.

- **Immich uruchamia się teraz niezawodnie na wolnym sprzęcie.** Na małym lub mocno obciążonym serwerze — na przykład Raspberry Pi 4 — sprawdzenia, czy baza danych i interfejs webowy Immicha są gotowe, poddawały się już po sekundzie czy dwóch, a ten czas łatwo przekroczyć, gdy maszyna jest po prostu zajęta. Immich był wtedy zatrzymywany i uruchamiany od nowa, raz za razem, a interfejs webowy nigdy nie stawał się gotowy. Te sprawdzenia czekają teraz na tyle długo, by odróżnić serwer zajęty od zepsutego.
- **Uczenie maszynowe nie wstrzymuje już reszty Immicha.** Immich musiał przed startem czekać na swój kontener uczenia maszynowego, choć sam go obserwuje i działa bez niego. Na sprzęcie, na którym uczenie maszynowe nie może działać — na przykład starszym procesorze x86 — powodowało to, że cały Immich czekał w nieskończoność, zamiast działać bez inteligentnego wyszukiwania i rozpoznawania twarzy; a gdzie indziej chwilowa awaria uczenia maszynowego restartowała wszystko.
- **Jeden uszkodzony wpis nie blokuje już całego formularza „Zarządzaj bibliotekami zewnętrznymi”.** Biblioteka wskazująca na folder, który zniknął — zwykle dlatego, że odłączono jej źródło zdjęć — powodowała niepowodzenie każdego zapisu, łącznie ze zmianami w innych bibliotekach i usunięciami. Każda biblioteka jest teraz stosowana osobno, a te, których nie udało się zapisać, są wymienione w komunikacie o błędzie.

Sam Immich nie uległ zmianie.`,
    fr_FR: `Corrige une boucle de démarrage sur les serveurs lents, permet à Immich de fonctionner sans apprentissage automatique et rend l'enregistrement des bibliothèques externes tolérant à une ligne défectueuse.

- **Immich démarre désormais de façon fiable sur du matériel lent.** Sur un serveur modeste ou très sollicité — un Raspberry Pi 4, par exemple — les vérifications demandant si la base de données et l'interface web d'Immich sont prêtes abandonnaient au bout d'une ou deux secondes, un délai facilement dépassé lorsque la machine est simplement occupée. Immich était alors arrêté puis repris depuis le début, encore et encore, et l'interface web n'était jamais prête. Ces vérifications patientent maintenant assez longtemps pour distinguer un serveur occupé d'un serveur en panne.
- **L'apprentissage automatique ne retient plus le reste d'Immich.** Immich devait attendre son conteneur d'apprentissage automatique avant de démarrer, alors qu'il le surveille lui-même et fonctionne sans lui. Sur du matériel où l'apprentissage automatique ne peut pas s'exécuter — un processeur x86 ancien, par exemple — tout Immich attendait indéfiniment au lieu de fonctionner sans recherche intelligente ni reconnaissance faciale ; ailleurs, une défaillance passagère de l'apprentissage automatique relançait l'ensemble.
- **Une bibliothèque défectueuse ne bloque plus tout le formulaire « Gérer les bibliothèques externes ».** Une bibliothèque pointant vers un dossier disparu — généralement parce que sa source de photos a été déconnectée — faisait échouer tout enregistrement, y compris les modifications d'autres bibliothèques et les suppressions. Chaque bibliothèque est désormais appliquée séparément, et celles qui n'ont pas pu être enregistrées sont nommées dans l'erreur.

Immich lui-même est inchangé.`,
  },
  migrations: {},
})
