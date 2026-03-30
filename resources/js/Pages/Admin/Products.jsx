import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import useConfirm from '@/Hooks/useConfirm';

const emptyProduct = {
    category_id: '',
    name: '',
    slug: '',
    price: '',
    stock: '',
    is_new: false,
    is_featured: false,
    is_popular: false,
};

function toSlug(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
}

// Convert booleans to 0/1 so Laravel `boolean` validation passes via FormData
function booleanFix(data) {
    const clean = { ...data };
    // image_files handled separately via ref
    delete clean.image_files;
    return {
        ...clean,
        is_new: data.is_new ? 1 : 0,
        is_featured: data.is_featured ? 1 : 0,
        is_popular: data.is_popular ? 1 : 0,
    };
}

export default function Products({ products, categories }) {
    const { flash } = usePage().props;
    const categoryList = categories ?? [];
    const productList = products ?? [];

    const [editingId, setEditingId] = useState(null);
    const [editingImages, setEditingImages] = useState([]);
    const [addSizes, setAddSizes] = useState([]);
    const [editSizes, setEditSizes] = useState([]);

    const addForm = useForm({ ...emptyProduct, category_id: String(categoryList[0]?.id ?? '') });
    const editForm = useForm({ ...emptyProduct, category_id: String(categoryList[0]?.id ?? '') });

    // Refs hold the selected File arrays for each form
    const addFilesRef = useState([]); // [files, setFiles]
    const editFilesRef = useState([]); // [files, setFiles]
    const [addFiles, setAddFiles] = addFilesRef;
    const [editFiles, setEditFiles] = editFilesRef;

    const { confirm, ConfirmDialog } = useConfirm();

    /* ── Add ── */
    const submitAdd = (e) => {
        e.preventDefault();
        addForm.transform((data) => {
            const fixed = booleanFix(data);
            addFiles.forEach((f, i) => { fixed[`image_files[${i}]`] = f.file; });
            addSizes.forEach((s, i) => { fixed[`sizes[${i}]`] = s; });
            return fixed;
        });
        addForm.post(route('admin.products.store'), {
            forceFormData: true,
            onSuccess: () => {
                addForm.reset();
                addForm.setData('category_id', String(categoryList[0]?.id ?? ''));
                setAddFiles([]);
                setAddSizes([]);
            },
        });
    };

    /* ── Open edit ── */
    const openEdit = (product) => {
        setEditingId(product.id);
        setEditingImages(product.images ?? []);
        setEditSizes((product.sizes ?? []).map((s) => s.name));
        editForm.setData({
            category_id: String(product.category_id),
            name: product.name,
            slug: product.slug,
            price: String(product.price),
            stock: String(product.stock ?? 0),
            is_new: Boolean(product.is_new),
            is_featured: Boolean(product.is_featured),
            is_popular: Boolean(product.is_popular),
        });
        setEditFiles([]);
    };

    const cancelEdit = () => {
        setEditingId(null);
        editForm.reset();
        setEditFiles([]);
        setEditingImages([]);
        setEditSizes([]);
    };

    /* ── Save edit ── */
    const submitEdit = (e) => {
        e.preventDefault();
        editForm.transform((data) => {
            const fixed = { ...booleanFix(data), _method: 'put' };
            editFiles.forEach((f, i) => { fixed[`image_files[${i}]`] = f.file; });
            editSizes.forEach((s, i) => { fixed[`sizes[${i}]`] = s; });
            return fixed;
        });
        editForm.post(
            route('admin.products.update', editingId),
            {
                forceFormData: true,
                onSuccess: () => {
                    setEditingId(null);
                    editForm.reset();
                    setEditFiles([]);
                    setEditingImages([]);
                },
            },
        );
    };

    const handleDelete = async (id) => {
        const ok = await confirm('Produk ini akan dihapus permanen beserta semua gambarnya.', { danger: true, title: 'Hapus Produk' });
        if (!ok) return;
        router.delete(route('admin.products.destroy', id));
    };

    const handleDeleteImage = async (imageId) => {
        const ok = await confirm('Hapus gambar ini dari produk?', { danger: true, title: 'Hapus Gambar' });
        if (!ok) return;
        router.delete(route('admin.products.images.destroy', imageId), {
            preserveScroll: true,
            onSuccess: () => setEditingImages((prev) => prev.filter((img) => img.id !== imageId)),
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-slate-800">Manajemen Produk</h2>}
        >
            <Head title="Manajemen Produk" />
            {ConfirmDialog}

            <div className="py-10">
                <div className="space-y-6 px-4 sm:px-6 lg:px-8">

                    {flash?.success && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                            {flash.success}
                        </div>
                    )}

                    {/* ── Add Form ── */}
                    <ProductForm
                        title="Tambah Produk Baru"
                        form={addForm}
                        categories={categoryList}
                        onSubmit={submitAdd}
                        submitLabel="Tambah Produk"
                        submitColor="indigo"
                        files={addFiles}
                        onFilesChange={setAddFiles}
                        sizes={addSizes}
                        onSizesChange={setAddSizes}
                    />

                    {/* ── Edit Form (shown only when editing) ── */}
                    {editingId && (
                        <ProductForm
                            title={`Edit Produk: ${editForm.data.name}`}
                            form={editForm}
                            categories={categoryList}
                            onSubmit={submitEdit}
                            submitLabel="Simpan Perubahan"
                            submitColor="amber"
                            onCancel={cancelEdit}
                            highlight
                            files={editFiles}
                            onFilesChange={setEditFiles}
                            existingImages={editingImages}
                            onDeleteImage={handleDeleteImage}
                            sizes={editSizes}
                            onSizesChange={setEditSizes}
                        />
                    )}

                    {/* ── Table ── */}
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Produk</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Kategori</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Harga</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Stok</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Label</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productList.map((product) => (
                                    <tr
                                        key={product.id}
                                        className={`border-t border-slate-100 transition ${editingId === product.id ? 'bg-amber-50' : 'hover:bg-slate-50'}`}
                                    >
                                        <td className="px-4 py-3 font-medium text-slate-900">
                                            {product.name}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{product.category?.name ?? '-'}</td>
                                        <td className="px-4 py-3 text-slate-700">
                                            Rp{Number(product.price).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">{product.stock}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                {product.is_new && <Badge color="green">New</Badge>}
                                                {product.is_featured && <Badge color="indigo">Featured</Badge>}
                                                {product.is_popular && <Badge color="orange">Popular</Badge>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openEdit(product)}
                                                    className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(product.id)}
                                                    className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {productList.length === 0 && (
                                    <tr>
                                        <td className="px-4 py-10 text-center text-slate-500" colSpan={6}>
                                            Belum ada produk. Tambahkan produk pertama di atas.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

/* ── Shared product form component ── */
function ProductForm({ title, form, categories, onSubmit, submitLabel, submitColor, onCancel, highlight, files, onFilesChange, existingImages = [], onDeleteImage, sizes = [], onSizesChange }) {
    const borderColor = highlight ? 'border-amber-300' : 'border-slate-200';
    const bgColor = highlight ? 'bg-amber-50' : 'bg-white';
    const btnColor = submitColor === 'amber'
        ? 'bg-amber-500 hover:bg-amber-600'
        : 'bg-indigo-600 hover:bg-indigo-700';

    const allErrors = Object.values(form.errors);
    const [sizeInput, setSizeInput] = useState('');

    const addSize = () => {
        const trimmed = sizeInput.trim().toUpperCase();
        if (!trimmed || sizes.includes(trimmed)) return;
        onSizesChange([...sizes, trimmed]);
        setSizeInput('');
    };
    const removeSize = (s) => onSizesChange(sizes.filter((x) => x !== s));

    const handleImageChange = (e) => {
        const selected = Array.from(e.target.files ?? []);
        const previews = selected.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
        onFilesChange((prev) => [...prev, ...previews]);
        e.target.value = ''; // reset input so same file can be re-added if removed
    };

    const removeNewPreview = (index) => {
        onFilesChange((prev) => {
            URL.revokeObjectURL(prev[index].url);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleNameChange = (value) => {
        form.setData((prev) => ({
            ...prev,
            name: value,
            slug: (!prev.slug || prev.slug === toSlug(prev.name)) ? toSlug(value) : prev.slug,
        }));
    };

    return (
        <div className={`rounded-2xl border ${borderColor} ${bgColor} p-5 shadow-sm`}>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-600">{title}</h3>

            {/* Error summary */}
            {allErrors.length > 0 && (
                <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                    <p className="mb-1 text-xs font-semibold text-rose-700">Ada kesalahan pada formulir:</p>
                    <ul className="list-disc pl-4 text-xs text-rose-600">
                        {allErrors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {/* Kategori */}
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">Kategori *</label>
                        <select
                            value={String(form.data.category_id)}
                            onChange={(e) => form.setData('category_id', e.target.value)}
                            className={`w-full rounded-lg border px-3 py-2 text-sm ${form.errors.category_id ? 'border-rose-400' : 'border-slate-300'}`}
                            required
                        >
                            <option value="">-- Pilih Kategori --</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
                            ))}
                        </select>
                        {form.errors.category_id && <p className="mt-1 text-xs text-rose-600">{form.errors.category_id}</p>}
                    </div>

                    {/* Nama */}
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">Nama Produk *</label>
                        <input
                            value={form.data.name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            className={`w-full rounded-lg border px-3 py-2 text-sm ${form.errors.name ? 'border-rose-400' : 'border-slate-300'}`}
                            placeholder="Nama produk"
                            required
                        />
                        {form.errors.name && <p className="mt-1 text-xs text-rose-600">{form.errors.name}</p>}
                    </div>

                    {/* Slug */}
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">Slug *</label>
                        <input
                            value={form.data.slug}
                            onChange={(e) => form.setData('slug', e.target.value)}
                            className={`w-full rounded-lg border px-3 py-2 text-sm font-mono ${form.errors.slug ? 'border-rose-400' : 'border-slate-300'}`}
                            placeholder="slug-produk"
                            required
                        />
                        {form.errors.slug && <p className="mt-1 text-xs text-rose-600">{form.errors.slug}</p>}
                    </div>

                    {/* Harga */}
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">Harga (Rp) *</label>
                        <input
                            type="number"
                            min="0"
                            value={form.data.price}
                            onChange={(e) => form.setData('price', e.target.value)}
                            className={`w-full rounded-lg border px-3 py-2 text-sm ${form.errors.price ? 'border-rose-400' : 'border-slate-300'}`}
                            placeholder="0"
                            required
                        />
                        {form.errors.price && <p className="mt-1 text-xs text-rose-600">{form.errors.price}</p>}
                    </div>

                    {/* Stok */}
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">Stok *</label>
                        <input
                            type="number"
                            min="0"
                            value={form.data.stock}
                            onChange={(e) => form.setData('stock', e.target.value)}
                            className={`w-full rounded-lg border px-3 py-2 text-sm ${form.errors.stock ? 'border-rose-400' : 'border-slate-300'}`}
                            placeholder="0"
                            required
                        />
                        {form.errors.stock && <p className="mt-1 text-xs text-rose-600">{form.errors.stock}</p>}
                    </div>



                    {/* Image Upload */}
                    <div className="lg:col-span-3">
                        <label className="mb-1 block text-xs font-semibold text-slate-600">Upload Gambar (bisa lebih dari satu)</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                        {form.errors.image_files && <p className="mt-1 text-xs text-rose-600">{form.errors.image_files}</p>}

                        {/* Existing images (edit mode) */}
                        {existingImages.length > 0 && (
                            <div className="mt-3">
                                <p className="mb-2 text-xs font-semibold text-slate-500">Gambar tersimpan:</p>
                                <div className="flex flex-wrap gap-3">
                                    {existingImages.map((img) => (
                                        <div key={img.id} className="relative">
                                            <img
                                                src={img.image_url}
                                                alt=""
                                                className="h-24 w-24 rounded-xl object-cover border border-slate-200 shadow-sm"
                                            />
                                            {onDeleteImage && (
                                                <button
                                                    type="button"
                                                    onClick={() => onDeleteImage(img.id)}
                                                    className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white shadow hover:bg-rose-700"
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* New image previews */}
                        {files.length > 0 && (
                            <div className="mt-3">
                                <p className="mb-2 text-xs font-semibold text-slate-500">Gambar baru yang akan diupload:</p>
                                <div className="flex flex-wrap gap-3">
                                    {files.map((item, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={item.url}
                                                alt=""
                                                className="h-24 w-24 rounded-xl object-cover border border-indigo-200 shadow-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeNewPreview(index)}
                                                className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white shadow hover:bg-rose-700"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sizes (opsional) */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-2 text-xs font-semibold text-slate-600">Ukuran / Size <span className="font-normal text-slate-400">(opsional — kosongkan jika produk tidak punya ukuran)</span></p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={sizeInput}
                            onChange={(e) => setSizeInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                            placeholder="Contoh: S, M, L, XL, 38, 39..."
                            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                        <button type="button" onClick={addSize} className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                            + Tambah
                        </button>
                    </div>
                    {sizes.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {sizes.map((s) => (
                                <span key={s} className="flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                                    {s}
                                    <button type="button" onClick={() => removeSize(s)} className="text-indigo-400 hover:text-rose-600">×</button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Checkboxes */}
                <div className="flex flex-wrap gap-5">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                        <input
                            type="checkbox"
                            checked={!!form.data.is_new}
                            onChange={(e) => form.setData('is_new', e.target.checked)}
                            className="rounded"
                        />
                        <span>Produk Baru</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                        <input
                            type="checkbox"
                            checked={!!form.data.is_featured}
                            onChange={(e) => form.setData('is_featured', e.target.checked)}
                            className="rounded"
                        />
                        <span>Featured</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                        <input
                            type="checkbox"
                            checked={!!form.data.is_popular}
                            onChange={(e) => form.setData('is_popular', e.target.checked)}
                            className="rounded"
                        />
                        <span>Popular</span>
                    </label>
                </div>

                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={form.processing}
                        className={`rounded-lg px-5 py-2 text-sm font-semibold text-white transition ${btnColor} disabled:opacity-60`}
                    >
                        {form.processing ? 'Menyimpan...' : submitLabel}
                    </button>
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                        >
                            Batal
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}

function Badge({ children, color }) {
    const colors = {
        green: 'bg-emerald-100 text-emerald-700',
        indigo: 'bg-indigo-100 text-indigo-700',
        orange: 'bg-orange-100 text-orange-700',
    };
    return (
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${colors[color] ?? ''}`}>
            {children}
        </span>
    );
}
