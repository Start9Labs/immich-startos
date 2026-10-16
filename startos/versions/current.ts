import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.3.3:2',
  releaseNotes: {
    en_US:
      "Access requests can now carry a label identifying the account or person they are for. Approval shows which services already hold keys in each account, warns that approving replaces that service's existing key, and reports replacements. Error messages and form examples in Immich's actions are now translated.",
    es_ES:
      'Las solicitudes de acceso ahora pueden llevar una etiqueta que identifique la cuenta o la persona para la que son. La aprobación muestra qué servicios ya tienen claves en cada cuenta, advierte de que aprobar sustituye la clave existente de ese servicio e informa de las sustituciones. Los mensajes de error y los ejemplos de los formularios de las acciones de Immich ahora están traducidos.',
    de_DE:
      'Zugriffsanfragen können jetzt eine Bezeichnung für das betreffende Konto oder die Person tragen. Die Genehmigung zeigt, welche Dienste bereits Schlüssel in jedem Konto haben, warnt vor dem Ersetzen des vorhandenen Schlüssels dieses Dienstes und meldet Ersetzungen. Fehlermeldungen und Formularbeispiele in den Aktionen von Immich sind jetzt übersetzt.',
    pl_PL:
      'Prośby o dostęp mogą teraz zawierać etykietę wskazującą konto lub osobę, dla której są przeznaczone. Formularz zatwierdzania pokazuje, które usługi mają już klucze na każdym koncie, ostrzega, że zatwierdzenie zastępuje istniejący klucz tej usługi, i informuje o zastąpieniu. Komunikaty o błędach i przykłady w formularzach akcji Immich są teraz przetłumaczone.',
    fr_FR:
      "Les demandes d'accès peuvent désormais porter un libellé identifiant le compte ou la personne concernés. Le formulaire d'approbation indique quels services possèdent déjà des clés dans chaque compte, avertit que l'approbation remplace la clé existante de ce service et signale les remplacements. Les messages d'erreur et les exemples de formulaire des actions d'Immich sont désormais traduits.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
