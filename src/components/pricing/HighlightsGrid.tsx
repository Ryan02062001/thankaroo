export default function HighlightsGrid() {
  return (
    <div className="mx-auto mt-8 sm:mt-10 grid max-w-5xl grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm text-gray-700">
      <div className="rounded-lg border border-[#A8E6CF]/60 bg-white p-4">
        <div className="font-semibold text-gray-900">No credit card</div>
        Try it first, upgrade later.
      </div>
      <div className="rounded-lg border border-[#A8E6CF]/60 bg-white p-4">
        <div className="font-semibold text-gray-900">Pay once</div>
        No subscriptions. Yours for the event.
      </div>
      <div className="rounded-lg border border-[#A8E6CF]/60 bg-white p-4">
        <div className="font-semibold text-gray-900">Focused on weddings</div>
        Everything you need for thank‑yous.
      </div>
    </div>
  );
}
