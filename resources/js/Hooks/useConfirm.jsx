import { useState } from 'react';
import ConfirmModal from '@/Components/ConfirmModal';

/**
 * useConfirm()
 * Returns { confirm, ConfirmDialog }
 *
 * Usage:
 *   const { confirm, ConfirmDialog } = useConfirm();
 *   const ok = await confirm('Hapus item ini?', { title: 'Hapus', danger: true });
 *   if (!ok) return;
 *   // ... do action
 *
 *   // In JSX: {ConfirmDialog}
 */
export default function useConfirm() {
    const [state, setState] = useState({
        isOpen:       false,
        title:        'Konfirmasi',
        message:      '',
        confirmLabel: 'Ya, Lanjutkan',
        cancelLabel:  'Batal',
        danger:       false,
        resolve:      null,
    });

    const confirm = (message, opts = {}) =>
        new Promise((resolve) => {
            setState({
                isOpen:       true,
                title:        opts.title        ?? (opts.danger ? 'Konfirmasi Hapus' : 'Konfirmasi'),
                message,
                confirmLabel: opts.confirmLabel ?? (opts.danger ? 'Ya, Hapus'        : 'Ya, Lanjutkan'),
                cancelLabel:  opts.cancelLabel  ?? 'Batal',
                danger:       opts.danger       ?? false,
                resolve,
            });
        });

    const handleConfirm = () => {
        state.resolve?.(true);
        setState((s) => ({ ...s, isOpen: false }));
    };

    const handleCancel = () => {
        state.resolve?.(false);
        setState((s) => ({ ...s, isOpen: false }));
    };

    const ConfirmDialog = (
        <ConfirmModal
            isOpen={state.isOpen}
            title={state.title}
            message={state.message}
            confirmLabel={state.confirmLabel}
            cancelLabel={state.cancelLabel}
            danger={state.danger}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
        />
    );

    return { confirm, ConfirmDialog };
}
