import { ShieldCheckIcon } from '@heroicons/react/24/outline';

const formatPrice = (v) => `Rp${Number(v).toLocaleString('id-ID')}`;

export default function ShippingInsurance({ 
    orderValue, 
    isChecked, 
    onChange 
}) {
    const calculateInsurance = (value) => {
        const rate = 0.005; // 0.5%
        const insurance = value * rate;
        return Math.max(insurance, 5000); // minimum Rp 5,000
    };

    const insuranceCost = calculateInsurance(orderValue);

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start space-x-3">
                <input
                    type="checkbox"
                    id="shipping-insurance"
                    checked={isChecked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                    <label 
                        htmlFor="shipping-insurance" 
                        className="flex items-center cursor-pointer"
                    >
                        <ShieldCheckIcon className="w-6 h-6 text-blue-600 mr-2" />
                        <div>
                            <span className="font-semibold text-gray-900">
                                Asuransi Pengiriman
                            </span>
                            <span className="ml-2 text-blue-600 font-medium">
                                {formatPrice(insuranceCost)}
                            </span>
                        </div>
                    </label>
                    
                    <div className="mt-2 text-sm text-gray-600">
                        <p className="mb-2">
                            Lindungi paket Anda hingga <span className="font-semibold">{formatPrice(orderValue)}</span>
                        </p>
                        <div className="bg-blue-50 rounded-lg p-3 space-y-1">
                            <p className="font-medium text-blue-900">Asuransi meliputi:</p>
                            <ul className="list-disc list-inside space-y-1 text-blue-800">
                                <li>Kehilangan paket selama pengiriman</li>
                                <li>Kerusakan barang saat transit</li>
                                <li>Klaim hingga 100% nilai barang</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
