<?php

namespace Database\Seeders;

use App\Models\CourierService;
use Illuminate\Database\Seeder;

class CourierServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $couriers = [
            // JNE
            [
                'code' => 'jne',
                'name' => 'JNE',
                'service_type' => 'REG',
                'service_name' => 'Layanan Reguler',
                'description' => 'Layanan reguler JNE dengan estimasi 2-3 hari',
                'etd' => '2-3',
                'supports_tracking' => true,
                'tracking_url_template' => 'https://www.jne.co.id/id/tracking/trace/{tracking_number}',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'code' => 'jne',
                'name' => 'JNE',
                'service_type' => 'YES',
                'service_name' => 'Yakin Esok Sampai',
                'description' => 'Layanan express JNE 1 hari sampai',
                'etd' => '1',
                'supports_tracking' => true,
                'tracking_url_template' => 'https://www.jne.co.id/id/tracking/trace/{tracking_number}',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'code' => 'jne',
                'name' => 'JNE',
                'service_type' => 'OKE',
                'service_name' => 'Ongkos Kirim Ekonomis',
                'description' => 'Layanan ekonomis JNE dengan estimasi 3-5 hari',
                'etd' => '3-5',
                'supports_tracking' => true,
                'tracking_url_template' => 'https://www.jne.co.id/id/tracking/trace/{tracking_number}',
                'is_active' => true,
                'sort_order' => 3,
            ],

            // TIKI
            [
                'code' => 'tiki',
                'name' => 'TIKI',
                'service_type' => 'REG',
                'service_name' => 'Regular Service',
                'description' => 'Layanan reguler TIKI',
                'etd' => '2-4',
                'supports_tracking' => true,
                'tracking_url_template' => 'https://www.tiki.id/id/tracking?kode={tracking_number}',
                'is_active' => true,
                'sort_order' => 4,
            ],
            [
                'code' => 'tiki',
                'name' => 'TIKI',
                'service_type' => 'ONS',
                'service_name' => 'Over Night Service',
                'description' => 'Layanan express TIKI pengiriman semalam',
                'etd' => '1',
                'supports_tracking' => true,
                'tracking_url_template' => 'https://www.tiki.id/id/tracking?kode={tracking_number}',
                'is_active' => true,
                'sort_order' => 5,
            ],
            [
                'code' => 'tiki',
                'name' => 'TIKI',
                'service_type' => 'ECO',
                'service_name' => 'Economy Service',
                'description' => 'Layanan ekonomis TIKI',
                'etd' => '4-6',
                'supports_tracking' => true,
                'tracking_url_template' => 'https://www.tiki.id/id/tracking?kode={tracking_number}',
                'is_active' => true,
                'sort_order' => 6,
            ],

            // SiCepat
            [
                'code' => 'sicepat',
                'name' => 'SiCepat',
                'service_type' => 'REG',
                'service_name' => 'Regular',
                'description' => 'Layanan reguler SiCepat',
                'etd' => '2-3',
                'supports_tracking' => true,
                'tracking_url_template' => 'https://www.sicepat.com/checkAwb/{tracking_number}',
                'is_active' => true,
                'sort_order' => 7,
            ],
            [
                'code' => 'sicepat',
                'name' => 'SiCepat',
                'service_type' => 'BEST',
                'service_name' => 'Best',
                'description' => 'Layanan express SiCepat',
                'etd' => '1-2',
                'supports_tracking' => true,
                'tracking_url_template' => 'https://www.sicepat.com/checkAwb/{tracking_number}',
                'is_active' => true,
                'sort_order' => 8,
            ],
            [
                'code' => 'sicepat',
                'name' => 'SiCepat',
                'service_type' => 'HALU',
                'service_name' => 'Halu',
                'description' => 'Layanan same day SiCepat',
                'etd' => '1',
                'supports_tracking' => true,
                'tracking_url_template' => 'https://www.sicepat.com/checkAwb/{tracking_number}',
                'is_active' => true,
                'sort_order' => 9,
            ],

            // J&T Express
            [
                'code' => 'jnt',
                'name' => 'J&T Express',
                'service_type' => 'REG',
                'service_name' => 'Regular',
                'description' => 'Layanan reguler J&T',
                'etd' => '2-3',
                'supports_tracking' => true,
                'tracking_url_template' => 'https://www.jet.co.id/track?awb={tracking_number}',
                'is_active' => true,
                'sort_order' => 10,
            ],
            [
                'code' => 'jnt',
                'name' => 'J&T Express',
                'service_type' => 'EZ',
                'service_name' => 'EZ',
                'description' => 'Layanan ekonomis J&T',
                'etd' => '3-5',
                'supports_tracking' => true,
                'tracking_url_template' => 'https://www.jet.co.id/track?awb={tracking_number}',
                'is_active' => true,
                'sort_order' => 11,
            ],

            // POS Indonesia
            [
                'code' => 'pos',
                'name' => 'POS Indonesia',
                'service_type' => 'Paket Kilat Khusus',
                'service_name' => 'Paket Kilat Khusus',
                'description' => 'Paket kilat khusus POS Indonesia',
                'etd' => '2-4',
                'supports_tracking' => true,
                'tracking_url_template' => 'https://www.posindonesia.co.id/id/tracking?barcode={tracking_number}',
                'is_active' => true,
                'sort_order' => 12,
            ],
            [
                'code' => 'pos',
                'name' => 'POS Indonesia',
                'service_type' => 'Express Next Day Barang',
                'service_name' => 'Express Next Day',
                'description' => 'Layanan express next day POS',
                'etd' => '1',
                'supports_tracking' => true,
                'tracking_url_template' => 'https://www.posindonesia.co.id/id/tracking?barcode={tracking_number}',
                'is_active' => true,
                'sort_order' => 13,
            ],
        ];

        foreach ($couriers as $courier) {
            CourierService::updateOrCreate(
                [
                    'code' => $courier['code'],
                    'service_type' => $courier['service_type'],
                ],
                $courier
            );
        }
    }
}
