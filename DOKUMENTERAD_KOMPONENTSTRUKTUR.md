# Dokumenterad komponentstruktur

Den här översikten beskriver huvudkomponenterna i projektet, deras syfte och relationer.

## Layout och sidstruktur

- **Layout.jsx**
  - Huvudlayout för hela appen.
  - Innehåller `Header`, `Sidebar` och en plats för sidinnehåll (`Outlet`).
- **Header.jsx**
  - Visar sidhuvud, tema-toggle och aktuell tid/användare.
- **Sidebar.jsx**
  - Navigationsmeny med länkar till sidorna: Dashboard, History, Energy, Settings.

## Återanvändbara komponenter

- **Button.jsx**
  - Flexibel knapp med stöd för olika varianter och tillstånd.
- **Card.jsx**
  - Container med titel och innehåll, används för att gruppera information.
- **Input.jsx**
  - Formulärfält med label och validering.

## Dashboard och statistik

- **Dashboard.jsx**
  - Startsida med översikt över statistik och snabblänkar.
  - Använder `StatsBadges`, `Stats`, `QuickActions`, `Card`.
- **StatsBadges.jsx**
  - Visar badges för dagens statistik och energi.
- **Stats.jsx**
  - Visar summerad statistik (total tid, antal sessioner, genomsnittlig energi).
 

## Timer och energi

- **TimerComponent.jsx**
  - Timer med start/pause/stop/reset och val av sessionstyp.
- **CircularTimer.jsx**
  - Visuell timer med cirkulär progress.
- **Energy.jsx**
  - Sida för att logga och visa energinivåer.

## Historik och inställningar

- **History.jsx**
  - Sida som visar tidigare sessioner, filter och redigering.
- **Settings.jsx**
  - Sida för användarinställningar, mål och timerlängder.

## Övriga komponenter

- **Calendar.jsx**
  - Kalender för att visa och planera tidblock (placeholder/förberedd för framtida funktionalitet).

---

Se även filen `PROJECT_DOCUMENTATION.md` för mer detaljer om projektets struktur och logik.
