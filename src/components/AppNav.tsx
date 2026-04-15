export type AppView = "calculator" | "armies" | "workspace" | "updates";

const TABS: { id: AppView; label: string }[] = [
  { id: "calculator", label: "Calculator" },
  { id: "armies", label: "My Armies" },
  { id: "workspace", label: "Battle Workspace" },
  { id: "updates", label: "Updates" },
];

type Props = {
  view: AppView;
  setView: (v: AppView) => void;
};

export function AppNav({ view, setView }: Props) {
  return (
    <nav className="app-nav" aria-label="App sections">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`app-nav__tab${view === tab.id ? " app-nav__tab--active" : ""}`}
          onClick={() => setView(tab.id)}
          aria-current={view === tab.id ? "page" : undefined}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
