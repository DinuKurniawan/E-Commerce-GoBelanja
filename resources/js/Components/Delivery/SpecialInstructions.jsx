export default function SpecialInstructions({ value, onChange }) {
    const maxLength = 200;
    const remaining = maxLength - (value?.length || 0);

    return (
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
                Special Delivery Instructions (Optional)
            </label>
            <textarea
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                maxLength={maxLength}
                rows={3}
                placeholder="e.g., Call before arriving, Leave at door, Ring bell twice"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
            />
            <div className="flex items-center justify-between text-xs">
                <p className="text-slate-500">
                    💡 Let us know how you'd like us to deliver your order
                </p>
                <p className={`font-medium ${remaining < 20 ? 'text-rose-600' : 'text-slate-500'}`}>
                    {remaining} characters left
                </p>
            </div>
        </div>
    );
}
