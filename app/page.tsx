"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FileText, AlertTriangle, Shield, Search } from "lucide-react"

export default function HomePage() {
  const [stats, setStats] = useState({
    korupsi: 0,
    gratifikasi: 0,
    benturaanKepentingan: 0,
  })

  const [trackingNumber, setTrackingNumber] = useState("")

  // Simulate API call for statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // TODO: Replace with real API when keys are available
        // const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.STATS_API_ENDPOINT}`, {
        //   headers: {
        //     'Authorization': `Bearer ${process.env.STATS_API_KEY}`
        //   }
        // })
        // const data = await response.json()

        // Simulate API delay with placeholder data
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock data - replace with real API response when available
        const mockStats = {
          korupsi: 0, // Keep as 0
          gratifikasi: 0, // Keep as 0
          benturaanKepentingan: 0, // Keep as 0
        }

        setStats(mockStats)
      } catch (error) {
        console.error("Error fetching stats:", error)
        // Fallback to zero values
        setStats({
          korupsi: 0,
          gratifikasi: 0,
          benturaanKepentingan: 0,
        })
      }
    }

    fetchStats()
  }, [])

  const handleTrackComplaint = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackingNumber.trim()) {
      alert("Masukkan nomor tiket pengaduan")
      return
    }

    try {
      // TODO: Replace with real API when keys are available
      // const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.TRACKING_API_ENDPOINT}/${trackingNumber}`, {
      //   headers: {
      //     'Authorization': `Bearer ${process.env.TRACKING_API_KEY}`
      //   }
      // })
      // const data = await response.json()

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock response - replace with real API response when available
      const mockStatuses = [
        "Laporan diterima dan sedang diverifikasi",
        "Laporan sedang dalam proses investigasi",
        "Laporan telah selesai diproses",
        "Laporan tidak ditemukan",
      ]

      const randomStatus = mockStatuses[Math.floor(Math.random() * mockStatuses.length)]

      if (randomStatus === "Laporan tidak ditemukan") {
        alert(`Tiket ${trackingNumber} tidak ditemukan. Pastikan nomor tiket sudah benar.`)
      } else {
        alert(`Status tiket ${trackingNumber}: ${randomStatus}`)
      }

      // Reset form
      setTrackingNumber("")
    } catch (error) {
      console.error("Error tracking complaint:", error)
      alert("Terjadi kesalahan saat melacak pengaduan. Silakan coba lagi.")
    }
  }

  const reportCategories = [
    {
      title: "Korupsi",
      description:
        "Laporkan tindakan korupsi yang merugikan negara dan masyarakat. Termasuk penyalahgunaan wewenang, suap, dan penggelapan dana publik.",
      icon: AlertTriangle,
      color: "bg-red-500",
      count: stats.korupsi,
      image: "/images/korupsi.jpg",
    },
    {
      title: "Gratifikasi",
      description:
        "Laporkan pemberian atau penerimaan hadiah, fasilitas, atau keuntungan lain yang dapat mempengaruhi keputusan pejabat.",
      icon: FileText,
      color: "bg-orange-500",
      count: stats.gratifikasi,
      image: "/images/gratifikasi.jpg",
    },
    {
      title: "Benturan Kepentingan",
      description:
        "Laporkan situasi dimana kepentingan pribadi bertentangan dengan kepentingan publik dalam pengambilan keputusan.",
      icon: Shield,
      color: "bg-yellow-500",
      count: stats.benturaanKepentingan,
      image: "/images/benturan-kepentingan.jpg",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-28">
            <Link href="/" className="flex items-center space-x-4 cursor-pointer">
              <Image
                src="/images/ptsp-logo.png"
                alt="PTSP Jateng Logo"
                width={240}
                height={120}
                className="h-20 w-auto"
              />
            </Link>

            <nav className="hidden lg:flex items-center">
              <Button
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
                onClick={() => (window.location.href = "/laporan")}
              >
                Laporkan
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section - Full viewport height */}
      <section className="min-h-[calc(100vh-7rem)] bg-white flex items-center">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between max-w-7xl mx-auto">
            <div className="lg:w-1/2 mb-8 lg:mb-0">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-teal-700 mb-6 text-left leading-tight">
                Whistle Blowing System
              </h1>
              <p className="text-2xl md:text-3xl lg:text-4xl text-gray-600 mb-6 text-left">
                DPMPTSP Provinsi Jawa Tengah
              </p>
              <p className="text-lg md:text-xl text-gray-600 mb-12 text-left leading-relaxed">
                Punya informasi soal korupsi, gratifikasi, atau konflik kepentingan? Jangan diam. Yuk, bantu laporkan lewat jalur pengaduan resmi kami. Aman dan rahasia, pastinya!
              </p>
             
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white px-12 py-4 text-xl"
                onClick={() => (window.location.href = "/laporan")}
              >
                Laporkan
              </Button>
            </div>
            <div className="lg:w-1/2 flex justify-center lg:justify-end">
              <Image
                src="/images/landing.png"
                alt="No Corruption - Anti Corruption Illustration"
                width={600}
                height={600}
                className="max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Report Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">Kategori Pelaporan</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Pilih kategori pelanggaran yang ingin Anda laporkan. Setiap laporan akan ditangani dengan serius dan
              profesional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reportCategories.map((category, index) => {
              const IconComponent = category.icon
              return (
                <Card
                  key={index}
                  className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full p-0"
                >
                  <div 
                    className="relative aspect-[4/3] bg-cover bg-center bg-no-repeat w-full"
                    style={{ 
                      backgroundImage: `url(${category.image || "/placeholder.svg"})`,
                      margin: 0,
                      padding: 0,
                      border: 'none'
                    }}
                  >
                    <div
                      className={`absolute top-4 right-4 ${category.color} text-white px-3 py-1 rounded-full text-sm font-semibold`}
                    >
                      {category.count.toLocaleString()} Laporan
                    </div>
                  </div>
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-center mb-4">
                      <div className={`${category.color} p-2 rounded-lg mr-3`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-800">{category.title}</h4>
                    </div>
                    <p className="text-gray-600 mb-6 leading-relaxed flex-grow">{category.description}</p>
                    <Button
                      className="w-full bg-teal-600 hover:bg-teal-700 mt-auto"
                      onClick={() => (window.location.href = "/laporan")}
                    >
                      Laporkan {category.title}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Sistem Pelaporan Pelanggaran Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Proses Penanganan Pengaduan</h3>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 text-center shadow-md">
              <div className="text-3xl md:text-4xl font-bold mb-2 text-teal-600">{stats.korupsi.toLocaleString()}</div>
              <div className="text-gray-600">Laporan Korupsi</div>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-md">
              <div className="text-3xl md:text-4xl font-bold mb-2 text-teal-600">
                {stats.gratifikasi.toLocaleString()}
              </div>
              <div className="text-gray-600">Laporan Gratifikasi</div>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-md">
              <div className="text-3xl md:text-4xl font-bold mb-2 text-teal-600">
                {stats.benturaanKepentingan.toLocaleString()}
              </div>
              <div className="text-gray-600">Benturan Kepentingan</div>
            </div>
          </div>
        </div>
      </section>

      {/* Complaint Tracking Section */}
      <section className="py-16 bg-teal-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-4">Lacak Progress Pengaduan Anda</h3>
            <p className="text-xl text-teal-100 mb-8">Masukkan nomor tiket pengaduan Anda</p>

            <form onSubmit={handleTrackComplaint} className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Nomor Tiket Aduan"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="h-14 text-lg px-6 bg-white border-0 focus:ring-2 focus:ring-white"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="bg-teal-800 hover:bg-teal-900 text-white px-8 py-4 text-lg h-14"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Lacak
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            <div className="mb-6 md:mb-0">
              <Image
                src="/images/ptsp-logo.png"
                alt="PTSP Jateng Logo"
                width={200}
                height={100}
                className="h-20 w-auto"
              />
            </div>

            <nav className="flex flex-wrap items-center gap-8">
              <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                About
              </Link>
              <Link href="/privacy-policy" className="text-gray-300 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/licensing" className="text-gray-300 hover:text-white transition-colors">
                Licensing
              </Link>
              <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                Contact
              </Link>
            </nav>
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-sm">© 2025 WBS™. DPMPTSP Provinsi Jawa Tengah.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
