import { useState, useEffect } from 'react';
import { CheckCircleIcon, TruckIcon, ClockIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const COURIERS = [
    { code: 'jne', name: 'JNE', logo: '🚚' },
    { code: 'tiki', name: 'TIKI', logo: '📦' },
    { code: 'pos', name: 'POS', logo: '✉️' },
    { code: 'sicepat', name: 'SiCepat', logo: '⚡' },
    { code: 'jnt', name: 'J&T', logo: '🚛' },
];

const formatPrice = (v) => `Rp${Number(v).toLocaleString('id-ID')}`;

export default function CourierComparison({ 
    destination, 
    weight, 
    onSelect, 
    selectedService = null 
}) {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sortBy, setSortBy] = useState('price'); // price, fastest, recommended
    const [filterCourier, setFilterCourier] = useState('all');

    useEffect(() => {
        if (destination && weight) {
            fetchCouriers();
        }
    }, [destination, weight]);

    const fetchCouriers = async () => {
        setLoading(true);
        setError('');
        
        try {
            const res = await fetch(
                `/shipping/compare?destination=${destination}&weight=${weight}`,
                {
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                }
            );
            
            const data = await res.json();
            
            if (!res.ok) {
                setError(data.message || 'Gagal memuat data pengiriman');
                return;
            }
            
            setServices(data.data || []);
        } catch (err) {
            setError('Terjadi kesalahan saat memuat data pengiriman');
        } finally {
            setLoading(false);
        }
    };

    const getSortedServices = () => {
        let sorted = [...services];
        
        // Filter by courier
        if (filterCourier !== 'all') {
            sorted = sorted.filter(s => s.courier?.toLowerCase() === filterCourier);
        }
        
        // Sort
        if (sortBy === 'price') {
            sorted.sort((a, b) => a.cost - b.cost);
        } else if (sortBy === 'fastest') {
            sorted.sort((a, b) => {
                const aEtd = parseInt(a.etd?.split('-')[0] || '999');
                const bEtd = parseInt(b.etd?.split('-')[0] || '999');
                return aEtd - bEtd;
            });
        }
        
        return sorted;
    };

    const sortedServices = getSortedServices();

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Memuat pilihan kurir...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center py-8">
                    <p className="text-red-600">{error}</p>
                    <button
                        onClick={fetchCouriers}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Pilih Pengiriman</h3>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Urutkan
                    </label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="price">Harga Termurah</option>
                        <option value="fastest">Tercepat</option>
                        <option value="recommended">Rekomendasi</option>
                    </select>
                </div>
                
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Filter Kurir
                    </label>
                    <select
                        value={filterCourier}
                        onChange={(e) => setFilterCourier(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">Semua Kurir</option>
                        {COURIERS.map(c => (
                            <option key={c.code} value={c.code}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Courier Services Grid */}
            <div className="space-y-3">
                {sortedServices.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        Tidak ada layanan pengiriman tersedia
                    </div>
                ) : (
                    sortedServices.map((service, index) => {
                        const courier = COURIERS.find(c => c.code === service.courier?.toLowerCase()) || 
                                      { code: service.courier, name: service.courier_name, logo: '📦' };
                        const isSelected = selectedService?.code === `${service.courier}_${service.service}`;
                        
                        return (
                            <button
                                key={`${service.courier}_${service.service}_${index}`}
                                onClick={() => onSelect({
                                    code: `${service.courier}_${service.service}`,
                                    courier: service.courier,
                                    service: service.service,
                                    service_label: service.description || service.service,
                                    cost: service.cost,
                                    etd: service.etd,
                                })}
                                className={`w-full text-left p-4 border-2 rounded-lg transition-all hover:shadow-md ${
                                    isSelected 
                                        ? 'border-blue-600 bg-blue-50' 
                                        : 'border-gray-200 hover:border-blue-300'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4 flex-1">
                                        {/* Courier Logo */}
                                        <div className="flex-shrink-0 text-3xl">
                                            {courier.logo}
                                        </div>
                                        
                                        {/* Service Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <h4 className="font-semibold text-gray-900">
                                                    {service.courier_name || courier.name} {service.service}
                                                </h4>
                                                {index === 0 && sortBy === 'price' && (
                                                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                                                        Termurah
                                                    </span>
                                                )}
                                                {index === 0 && sortBy === 'fastest' && (
                                                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                                        Tercepat
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {service.description}
                                            </p>
                                            <div className="flex items-center space-x-4 mt-2">
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <ClockIcon className="w-4 h-4 mr-1" />
                                                    {service.etd ? `${service.etd} hari` : 'Estimasi tersedia'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Price */}
                                    <div className="text-right ml-4">
                                        <div className="text-lg font-bold text-gray-900">
                                            {formatPrice(service.cost)}
                                        </div>
                                        {isSelected && (
                                            <CheckCircleIcon className="w-6 h-6 text-blue-600 mx-auto mt-1" />
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}
