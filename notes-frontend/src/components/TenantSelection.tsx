import type { Tenant } from "../types/Note";

type TenantSelectionProps = {
  tenants: Tenant[];
  onSelectTenant: (tenant: Tenant) => void;
};

function TenantSelection({ tenants, onSelectTenant,}: TenantSelectionProps) {
  return (
    <div className="min-h-screen bg-gray-100 px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Select Your Workspace
          </h1>

          <p className="mt-3 text-gray-600">
            Choose a tenant to view and manage its notes.
          </p>
        </div>

        {tenants.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <p className="text-gray-600">
              No tenants found. Please create a tenant first.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tenants.map((tenant) => (
              <button
                key={tenant.id}
                type="button"
                onClick={() => onSelectTenant(tenant)}
                className="rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-400 hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  <span className="text-xl font-bold">
                    {tenant.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                <h2 className="text-lg font-semibold text-gray-900">
                  {tenant.name}
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Open this workspace to manage its notes.
                </p>

                <span className="mt-5 inline-block font-medium text-blue-600">
                  Open workspace →
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TenantSelection;

