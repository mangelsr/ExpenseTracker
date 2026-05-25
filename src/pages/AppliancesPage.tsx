import {
  AppliancesProvider,
  ApplianceFilters,
  ApplianceForm,
  ApplianceList,
  ApplianceSummary
} from "../components/appliances";

export function AppliancesPage() {
  return (
    <AppliancesProvider>
      <div className="animate-[fadeIn_0.4s_ease-out_forwards]">
        {/* Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-heading mb-2 text-white">Registro de Electrodomésticos</h2>
          <p className="text-slate-400">Registra y administra las compras, instalaciones y mantenimientos de tus equipos.</p>
        </div>

        {/* Summary Cards */}
        <ApplianceSummary />

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start">
          {/* Form Container */}
          <ApplianceForm />

          {/* Logs List Container */}
          <div className="flex flex-col gap-6">
            {/* Controls: Search and Filters */}
            <ApplianceFilters />

            {/* Cards Grid */}
            <ApplianceList />
          </div>
        </div>
      </div>
    </AppliancesProvider>
  );
}
