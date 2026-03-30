export default function ConfirmModal({
    isOpen,
    title       = 'Konfirmasi',
    message     = 'Apakah kamu yakin?',
    confirmLabel = 'Ya, Lanjutkan',
    cancelLabel  = 'Batal',
    danger       = false,
    onConfirm,
    onCancel,
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Dialog */}
            <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 animate-[fadeIn_0.15s_ease]">
                {/* Icon */}
                <div className={`flex justify-center pt-6`}>
                    <div className={`flex h-14 w-14 items-center justify-center rounded-full ${
                        danger ? 'bg-rose-100' : 'bg-indigo-100'
                    }`}>
                        {danger ? (
                            <svg className="h-7 w-7 text-rose-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                            </svg>
                        ) : (
                            <svg className="h-7 w-7 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                            </svg>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 pb-2 pt-4 text-center">
                    <h3 className="text-base font-bold text-slate-900">{title}</h3>
                    <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{message}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-5 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 rounded-xl border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition ${
                            danger
                                ? 'bg-rose-600 hover:bg-rose-500'
                                : 'bg-indigo-600 hover:bg-indigo-500'
                        }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
