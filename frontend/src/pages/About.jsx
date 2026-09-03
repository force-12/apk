import { HiOutlineEnvelope, HiOutlinePhone, HiOutlineMapPin, HiOutlineEye, HiOutlineFlag } from 'react-icons/hi2';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Tentang SmartPhone Store</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          SmartPhone Store adalah toko smartphone online terpercaya yang menyediakan berbagai macam smartphone
          dari brand ternama dengan harga terbaik dan garansi resmi.
        </p>
      </div>

      {/* Description */}
      <div className="bg-white border border-gray-200 rounded-xl p-8 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Siapa Kami?</h2>
        <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
          <p>
            SmartPhone Store hadir sebagai solusi bagi Anda yang mencari smartphone berkualitas dengan harga terjangkau.
            Kami berkomitmen untuk menyediakan produk-produk original dari brand ternama seperti Samsung, Apple, Xiaomi,
            OPPO, vivo, realme, dan masih banyak lagi.
          </p>
          <p>
            Didirikan dengan visi menjadi platform e-commerce smartphone terdepan di Indonesia, kami terus berupaya
            memberikan pengalaman belanja terbaik melalui layanan pelanggan yang responsif, pengiriman cepat,
            dan jaminan produk original bergaransi resmi.
          </p>
          <p>
            Dengan ribuan pelanggan yang telah mempercayakan kebutuhan smartphone mereka kepada kami,
            SmartPhone Store terus berkembang dan berinovasi untuk memberikan layanan yang semakin baik.
          </p>
        </div>
      </div>

      {/* Vision & Mission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <HiOutlineEye className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Visi</h3>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Menjadi platform e-commerce smartphone nomor satu di Indonesia yang menyediakan produk berkualitas
            dengan harga terjangkau dan pelayanan terbaik bagi seluruh masyarakat Indonesia.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <HiOutlineFlag className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Misi</h3>
          </div>
          <ul className="text-sm text-gray-600 space-y-2 leading-relaxed">
            <li className="flex items-start space-x-2">
              <span className="text-green-500 mt-1">&#8226;</span>
              <span>Menyediakan smartphone original dari brand ternama dengan harga kompetitif.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-500 mt-1">&#8226;</span>
              <span>Memberikan layanan pelanggan yang cepat, ramah, dan profesional.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-500 mt-1">&#8226;</span>
              <span>Menjamin keaslian produk dan garansi resmi untuk setiap pembelian.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-500 mt-1">&#8226;</span>
              <span>Mengembangkan teknologi dan inovasi untuk pengalaman belanja yang lebih baik.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white border border-gray-200 rounded-xl p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Hubungi Kami</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <HiOutlineEnvelope className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Email</p>
            <p className="text-sm text-gray-500">info@smartphonestore.id</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <HiOutlinePhone className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Telepon</p>
            <p className="text-sm text-gray-500">(021) 1234-5678</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
              <HiOutlineMapPin className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Alamat</p>
            <p className="text-sm text-gray-500">Jl. Teknologi No. 123, Jakarta Selatan, DKI Jakarta 12345</p>
          </div>
        </div>
      </div>
    </div>
  );
}
