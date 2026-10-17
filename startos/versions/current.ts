import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.3.3:3',
  releaseNotes: {
    en_US:
      'A service can now ask to change photo details such as locations, and both the task and the approval form say so.',
    es_ES:
      'Un servicio ahora puede solicitar cambiar detalles de las fotos, como las ubicaciones, y tanto la tarea como el formulario de aprobación lo indican.',
    de_DE:
      'Ein Dienst kann jetzt anfragen, Fotodetails wie Orte zu ändern; sowohl die Aufgabe als auch das Genehmigungsformular weisen darauf hin.',
    pl_PL:
      'Usługa może teraz poprosić o zmianę szczegółów zdjęć, takich jak lokalizacje, a zarówno zadanie, jak i formularz zatwierdzenia to wskazują.',
    fr_FR:
      "Un service peut désormais demander à modifier des détails des photos, comme les lieux ; la tâche et le formulaire d'approbation l'indiquent tous deux.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
