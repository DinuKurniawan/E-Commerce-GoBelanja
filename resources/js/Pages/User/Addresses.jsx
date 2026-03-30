import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import useConfirm from '@/Hooks/useConfirm';

const initialForm = {
    id: null,
    label: '',
    recipient_name: '',
    phone: '',
    province_id: '',
    province_name: '',
    city_id: '',
    city_name: '',
    district_id: '',
    district_name: '',
    village_name: '',
    postal_code: '',
    rajaongkir_city_id: '',
    full_address: '',
    is_default: false,
};

const inputCls = (err) =>
    `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
        err ? 'border-rose-400' : 'border-slate-300 focus:border-indigo-500'
    }`;

export default function UserAddresses({ addresses }) {
    const { flash }       = usePage().props;
    const addressItems    = addresses ?? [];
    const [editing, setEditing] = useState(initialForm);
    const form = useForm(initialForm);
    const { confirm, ConfirmDialog } = useConfirm();

    // thecloudalert.com cascade states
    const [provinces,   setProvinces]   = useState([]);
    const [kabkota,     setKabkota]     = useState([]);
    const [kecamatan,   setKecamatan]   = useState([]);
    const [kelurahan,   setKelurahan]   = useState([]);
    const [loadingProv, setLoadingProv] = useState(false);
    const [loadingKab,  setLoadingKab]  = useState(false);
    const [loadingKec,  setLoadingKec]  = useState(false);
    const [loadingKel,  setLoadingKel]  = useState(false);

    // Raja Ongkir data (background – for rajaongkir_city_id mapping)
    const [rongkirProvinces, setRongkirProvinces] = useState([]);
    const [rongkirCities,    setRongkirCities]    = useState([]);
    const matchRef = useRef(null);

    // Fetch thecloudalert provinces + Raja Ongkir provinces on mount
    useEffect(() => {
        setLoadingProv(true);
        fetch(route('wilayah.provinces'))
            .then((r) => r.json())
            .then((d) => setProvinces(Array.isArray(d) ? d : []))
            .catch(() => setProvinces([]))
            .finally(() => setLoadingProv(false));

        fetch(route('rajaongkir.provinces'))
            .then((r) => r.json())
            .then((d) => setRongkirProvinces(Array.isArray(d) ? d : []))
            .catch(() => {});
    }, []);

    // Fetch kabkota when province changes
    useEffect(() => {
        if (!form.data.province_id) { setKabkota([]); setKecamatan([]); setKelurahan([]); return; }
        setLoadingKab(true);
        fetch(route('wilayah.kabkota') + '?provinsi_id=' + form.data.province_id)
            .then((r) => r.json())
            .then((d) => setKabkota(Array.isArray(d) ? d : []))
            .catch(() => setKabkota([]))
            .finally(() => setLoadingKab(false));

        // Background: fetch Raja Ongkir cities for matching
        const prov = provinces.find((p) => p.id === form.data.province_id);
        if (prov && rongkirProvinces.length > 0) {
            const rongkirProv = rongkirProvinces.find(
                (rp) => rp.province.toLowerCase() === prov.text.toLowerCase()
            );
            if (rongkirProv) {
                fetch(route('rajaongkir.cities') + '?province_id=' + rongkirProv.province_id)
                    .then((r) => r.json())
                    .then((d) => setRongkirCities(Array.isArray(d) ? d : []))
                    .catch(() => {});
            }
        }
    }, [form.data.province_id]);

    // Fetch kecamatan when kabkota changes
    useEffect(() => {
        if (!form.data.city_id) { setKecamatan([]); setKelurahan([]); return; }
        setLoadingKec(true);
        fetch(route('wilayah.kecamatan') + '?kabkota_id=' + form.data.city_id)
            .then((r) => r.json())
            .then((d) => setKecamatan(Array.isArray(d) ? d : []))
            .catch(() => setKecamatan([]))
            .finally(() => setLoadingKec(false));
    }, [form.data.city_id]);

    // Fetch kelurahan when kecamatan changes
    useEffect(() => {
        if (!form.data.district_id) { setKelurahan([]); return; }
        setLoadingKel(true);
        fetch(route('wilayah.kelurahan') + '?kecamatan_id=' + form.data.district_id)
            .then((r) => r.json())
            .then((d) => setKelurahan(Array.isArray(d) ? d : []))
            .catch(() => setKelurahan([]))
            .finally(() => setLoadingKel(false));
    }, [form.data.district_id]);

    // Resolve rajaongkir_city_id whenever city_id or rongkirCities change (fixes race condition)
    useEffect(() => {
        if (!form.data.city_id || !form.data.city_name) return;
        if (rongkirCities.length === 0) return;
        if (form.data.rajaongkir_city_id) return; // already matched

        const name = form.data.city_name;
        const matched = rongkirCities.find(
            (rc) => `${rc.type} ${rc.city_name}`.toLowerCase() === name.toLowerCase()
        ) ?? rongkirCities.find(
            (rc) => name.toLowerCase().includes(rc.city_name.toLowerCase())
        );
        if (matched) {
            form.setData((prev) => ({
                ...prev,
                rajaongkir_city_id: matched.city_id,
                postal_code: prev.postal_code || (matched.postal_code ?? ''),
            }));
        }
    }, [form.data.city_id, rongkirCities]);

    /* ── handlers ── */
    const handleProvinceChange = (e) => {
        const id   = e.target.value;
        const prov = provinces.find((p) => p.id === id);
        form.setData((prev) => ({
            ...prev,
            province_id: id, province_name: prov?.text ?? '',
            city_id: '', city_name: '',
            district_id: '', district_name: '',
            village_name: '', postal_code: '', rajaongkir_city_id: '',
        }));
        setKabkota([]); setKecamatan([]); setKelurahan([]);
    };

    const handleKabkotaChange = (e) => {
        const id  = e.target.value;
        const kab = kabkota.find((k) => k.id === id);
        const name = kab?.text ?? '';

        form.setData((prev) => ({
            ...prev,
            city_id: id, city_name: name,
            district_id: '', district_name: '',
            village_name: '',
            rajaongkir_city_id: '', // will be resolved by useEffect above
        }));
        setKecamatan([]); setKelurahan([]);
    };

    const handleKecamatanChange = (e) => {
        const id  = e.target.value;
        const kec = kecamatan.find((k) => k.id === id);
        form.setData((prev) => ({
            ...prev,
            district_id: id, district_name: kec?.text ?? '',
            village_name: '',
        }));
        setKelurahan([]);
    };

    const handleKelurahanChange = (e) => {
        const kel = kelurahan.find((k) => k.id === e.target.value);
        form.setData('village_name', kel?.text ?? '');
    };

    /* ── submit ── */
    const submit = (e) => {
        e.preventDefault();
        if (editing.id) {
            form.transform((data) => ({ ...data, _method: 'put' }));
            form.post(route('user.addresses.update', editing.id), {
                onSuccess: () => { form.reset(); setEditing(initialForm); resetDropdowns(); },
            });
            return;
        }
        form.post(route('user.addresses.store'), {
            onSuccess: () => { form.reset(); resetDropdowns(); },
        });
    };

    const resetDropdowns = () => { setKabkota([]); setKecamatan([]); setKelurahan([]); };

    const editAddress = (address) => {
        const payload = {
            id: address.id,
            label:           address.label,
            recipient_name:  address.recipient_name,
            phone:           address.phone,
            province_id:     address.province_id     ?? '',
            province_name:   address.province_name   ?? '',
            city_id:         address.city_id         ?? '',
            city_name:       address.city_name       ?? '',
            district_id:     address.district_id     ?? '',
            district_name:   address.district_name   ?? '',
            village_name:    address.village_name    ?? '',
            postal_code:     address.postal_code     ?? '',
            rajaongkir_city_id: address.rajaongkir_city_id ?? '',
            full_address:    address.full_address,
            is_default:      address.is_default,
        };
        setEditing(payload);
        form.setData(payload);
    };

    const cancelEdit  = () => { setEditing(initialForm); form.reset(); resetDropdowns(); };
    const setDefault  = (id) => router.patch(route('user.addresses.set-default', id));
    const removeAddr  = async (id) => {
        const ok = await confirm('Alamat ini akan dihapus permanen.', { danger: true, title: 'Hapus Alamat' });
        if (!ok) return;
        router.delete(route('user.addresses.destroy', id));
    };

    const addressPreview = [
        form.data.village_name,
        form.data.district_name,
        form.data.city_name,
        form.data.province_name,
        form.data.postal_code,
    ].filter(Boolean).join(', ');

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-slate-800">Alamat Pengiriman</h2>}
        >
            <Head title="Alamat Pengiriman" />
            {ConfirmDialog}

            <div className="py-10">
                <div className="space-y-6 px-4 sm:px-6 lg:px-8">

                    {flash?.success && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                            ✅ {flash.success}
                        </div>
                    )}

                    {/* Form */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-600">
                            {editing.id ? 'Edit Alamat' : 'Tambah Alamat Baru'}
                        </h3>
                        <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">

                            {/* Label */}
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">Label *</label>
                                <input
                                    placeholder="Rumah / Kantor"
                                    value={form.data.label}
                                    onChange={(e) => form.setData('label', e.target.value)}
                                    className={inputCls(form.errors.label)}
                                    required
                                />
                                {form.errors.label && <p className="mt-1 text-xs text-rose-600">{form.errors.label}</p>}
                            </div>

                            {/* Recipient */}
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">Nama Penerima *</label>
                                <input
                                    placeholder="Nama lengkap penerima"
                                    value={form.data.recipient_name}
                                    onChange={(e) => form.setData('recipient_name', e.target.value)}
                                    className={inputCls(form.errors.recipient_name)}
                                    required
                                />
                                {form.errors.recipient_name && <p className="mt-1 text-xs text-rose-600">{form.errors.recipient_name}</p>}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">No HP *</label>
                                <input
                                    placeholder="08xxxxxxxxxx"
                                    value={form.data.phone}
                                    onChange={(e) => form.setData('phone', e.target.value)}
                                    className={inputCls(form.errors.phone)}
                                    required
                                />
                                {form.errors.phone && <p className="mt-1 text-xs text-rose-600">{form.errors.phone}</p>}
                            </div>

                            {/* Postal code */}
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">Kode Pos</label>
                                <input
                                    placeholder="12345"
                                    value={form.data.postal_code}
                                    onChange={(e) => form.setData('postal_code', e.target.value)}
                                    className={inputCls(form.errors.postal_code)}
                                    maxLength={10}
                                />
                            </div>

                            {/* Provinsi */}
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">Provinsi</label>
                                <select
                                    value={form.data.province_id}
                                    onChange={handleProvinceChange}
                                    className={inputCls(false)}
                                    disabled={loadingProv}
                                >
                                    <option value="">{loadingProv ? 'Memuat...' : '-- Pilih Provinsi --'}</option>
                                    {provinces.map((p) => (
                                        <option key={p.id} value={p.id}>{p.text}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Kabupaten / Kota */}
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">Kabupaten / Kota</label>
                                <select
                                    value={form.data.city_id}
                                    onChange={handleKabkotaChange}
                                    className={inputCls(false)}
                                    disabled={!form.data.province_id || loadingKab}
                                >
                                    <option value="">
                                        {!form.data.province_id ? 'Pilih provinsi dulu' : loadingKab ? 'Memuat...' : '-- Pilih Kab/Kota --'}
                                    </option>
                                    {kabkota.map((k) => (
                                        <option key={k.id} value={k.id}>{k.text}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Kecamatan */}
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">Kecamatan</label>
                                <select
                                    value={form.data.district_id}
                                    onChange={handleKecamatanChange}
                                    className={inputCls(false)}
                                    disabled={!form.data.city_id || loadingKec}
                                >
                                    <option value="">
                                        {!form.data.city_id ? 'Pilih kab/kota dulu' : loadingKec ? 'Memuat...' : '-- Pilih Kecamatan --'}
                                    </option>
                                    {kecamatan.map((k) => (
                                        <option key={k.id} value={k.id}>{k.text}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Kelurahan */}
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">Kelurahan / Desa</label>
                                <select
                                    value={kelurahan.find((k) => k.text === form.data.village_name)?.id ?? ''}
                                    onChange={handleKelurahanChange}
                                    className={inputCls(false)}
                                    disabled={!form.data.district_id || loadingKel}
                                >
                                    <option value="">
                                        {!form.data.district_id ? 'Pilih kecamatan dulu' : loadingKel ? 'Memuat...' : '-- Pilih Kelurahan --'}
                                    </option>
                                    {kelurahan.map((k) => (
                                        <option key={k.id} value={k.id}>{k.text}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Address preview */}
                            {addressPreview && (
                                <div className="md:col-span-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                                    <p className="text-xs text-slate-500 font-medium mb-0.5">📍 Lokasi</p>
                                    <p className="text-sm text-slate-700">{addressPreview}</p>
                                </div>
                            )}

                            {/* Full address */}
                            <div className="md:col-span-2">
                                <label className="mb-1 block text-xs font-medium text-slate-600">Alamat Lengkap (Jalan, No, RT/RW) *</label>
                                <textarea
                                    placeholder="Jl. Mawar No. 12 RT 001/002"
                                    value={form.data.full_address}
                                    onChange={(e) => form.setData('full_address', e.target.value)}
                                    className={inputCls(form.errors.full_address)}
                                    rows={3}
                                    required
                                />
                                {form.errors.full_address && <p className="mt-1 text-xs text-rose-600">{form.errors.full_address}</p>}
                            </div>

                            {/* Default */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_default"
                                    checked={form.data.is_default}
                                    onChange={(e) => form.setData('is_default', e.target.checked)}
                                    className="rounded border-slate-300"
                                />
                                <label htmlFor="is_default" className="cursor-pointer text-sm text-slate-700">
                                    Jadikan alamat default
                                </label>
                            </div>

                            {/* Buttons */}
                            <div className="md:col-span-2 flex gap-3">
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
                                >
                                    {form.processing ? 'Menyimpan...' : editing.id ? 'Perbarui Alamat' : 'Simpan Alamat'}
                                </button>
                                {editing.id && (
                                    <button
                                        type="button"
                                        onClick={cancelEdit}
                                        className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                    >
                                        Batal
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Address list */}
                    <div className="grid gap-4 md:grid-cols-2">
                        {addressItems.map((address) => (
                            <div
                                key={address.id}
                                className={`rounded-2xl border bg-white p-5 shadow-sm ${
                                    address.is_default ? 'border-indigo-300' : 'border-slate-200'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <p className="font-semibold text-slate-900">{address.label}</p>
                                    {address.is_default && (
                                        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                                            ✓ Default
                                        </span>
                                    )}
                                </div>
                                <p className="mt-2 text-sm text-slate-700">
                                    👤 {address.recipient_name} · 📞 {address.phone}
                                </p>
                                {(address.village_name || address.district_name || address.city_name) && (
                                    <p className="mt-1 text-sm text-slate-600">
                                        📍 {[address.village_name, address.district_name, address.city_name, address.province_name].filter(Boolean).join(', ')}
                                        {address.postal_code ? ` ${address.postal_code}` : ''}
                                    </p>
                                )}
                                <p className="mt-1 text-sm text-slate-600">{address.full_address}</p>
                                <div className="mt-4 flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => editAddress(address)}
                                        className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600"
                                    >
                                        Edit
                                    </button>
                                    {!address.is_default && (
                                        <button
                                            type="button"
                                            onClick={() => setDefault(address.id)}
                                            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                        >
                                            Set Default
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => removeAddr(address.id)}
                                        className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        ))}
                        {addressItems.length === 0 && (
                            <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                                <p className="text-3xl mb-2">📍</p>
                                <p className="text-sm text-slate-500">Belum ada alamat. Tambahkan di atas.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
