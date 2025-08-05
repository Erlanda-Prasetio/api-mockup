"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Upload, Shield, AlertCircle } from "lucide-react"

export default function LaporanPage() {
  const [formData, setFormData] = useState({
    kategori: "",
    deskripsi: "",
    tanggal: "",
    namaTerduga: "",
    nipTerduga: "",
    jabatanTerduga: "",
    jenisKelamin: "",
    nama: "",
    email: "",
    telepon: "",
    anonim: false,
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [formatStates, setFormatStates] = useState({
    bold: false,
    italic: false,
    underline: false,
  })
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
        setSearchTerm("")
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // List of names for dropdown
  const namesList = [
    "Aldriyan Satria Pradiksa, S.Kom",
    "Arinta Sistyanika, S.IP",
    "Ariyanto, SH",
    "Arya Parama Widya, S.IP",
    "Christina Harianti Nugraheni, S.STP, MAP",
    "Danang Pambudi, SH",
    "Dra. Ratna Dewajati, MT",
    "Dra. ST Khasanaturodhiyah, M.Si",
    "Drs. Johan Hadiyanto, M.Si",
    "Dwi Yuli Wibowo, A.Md",
    "Erlin Nur Marfuah .S.IP, M.Sos.",
    "Erna Sulandari, SE",
    "Fajar Efendi, S.STP. MM",
    "Hoerun Nisa, S.STP",
    "Isnin Ulfana.. S.STP",
    "Joko Supomo, S.Sos",
    "Linda Widiastuti Ariningrum, S.Sos, M.Si",
    "Meira Kartika Putri, S.STP",
    "Mochammad Rizal Sidik, SE, MAP.",
    "Mohamad Arifin Katili, S.Sos, MM",
    "Munawir, SH.MH",
    "Natalia, SE.",
    "Nency Widya Rahayu, SE. Akt, M.Ak.",
    "Novan Dwi Anggarda, S.Kom",
    "Novan Dwi Anggarda, S.Kom a",
    "Noviana Handajani, S.IP, MM",
    "PRADITYA YUDHA ARKA PRATAMA S. Ak",
    "Primasto Ardi Martono, SE.MT",
    "Purwadi Teguh Al Rosyid, SH, MPA",
    "Purwadi Teguh Al Rosyid, SH. MPA.",
    "Ratna Kawuri, SH",
    "Rifgi Majid, S.Kom",
    "Rutty Yosika, S.Sos, MM",
    "SONY HARSANTO, SE, MM",
    "Sekar Cahyo Laksanti, SE",
    "Setya Budi Prayitno, SE. MM",
    "Sri Wahyuningsih, SH.",
    "Sulistiyana, SE, MM.",
    "Supriharjiyanto, ST, MT",
    "TAVIANA DEWI HANDAYANI, ST",
    "ZAKIA KAHFIDYA RATNASARI, ST, MM",
  ]

  // Filter names based on search term
  const filteredNames = namesList.filter(name =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Check formatting states
  const checkFormatStates = () => {
    try {
      setFormatStates({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
      })
    } catch (error) {
      // Fallback if queryCommandState is not supported
      console.log('queryCommandState not supported')
    }
  }

  // Handle formatting commands
  const handleFormat = (command: string) => {
    if (editorRef.current) {
      editorRef.current.focus()
    }
    document.execCommand(command)
    setTimeout(() => {
      checkFormatStates()
      if (editorRef.current) {
        editorRef.current.focus()
      }
    }, 10) // Small delay to ensure state update and refocus
  }

  // Handle list commands specially
  const handleListFormat = (command: string) => {
    if (editorRef.current) {
      editorRef.current.focus()
      
      // For lists, we need to ensure there's a selection or cursor position
      const selection = window.getSelection()
      if (selection && selection.rangeCount === 0) {
        const range = document.createRange()
        range.selectNodeContents(editorRef.current)
        range.collapse(false)
        selection.addRange(range)
      }
    }
    
    document.execCommand(command)
    
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.focus()
      }
    }, 50) // Longer delay for lists to properly render
  }

  // Handle file selection
  const handleFileSelect = (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/jpg',
        'image/png'
      ]
      const maxSize = 10 * 1024 * 1024 // 10MB
      
      if (!validTypes.includes(file.type)) {
        alert(`File ${file.name} memiliki format yang tidak didukung. Gunakan PDF, DOC, DOCX, JPG, JPEG, atau PNG.`)
        return false
      }
      
      if (file.size > maxSize) {
        alert(`File ${file.name} terlalu besar. Maksimal ukuran file adalah 10MB.`)
        return false
      }
      
      return true
    })

    setSelectedFiles(prev => [...prev, ...validFiles])
  }

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  // Handle click to select files
  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  // Remove selected file
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Form submitted:", formData)
    alert("Laporan berhasil dikirim! Anda akan menerima nomor tiket untuk tracking.")
  }

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
                className="bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300 px-8 py-3 text-lg flex items-center space-x-2"
                onClick={() => (window.location.href = "/")}
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Kembali</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Formulir Pelaporan</h2>
            <p className="text-lg text-gray-600">Isi formulir di bawah ini dengan lengkap dan jelas</p>
          </div>

          {/* Security Notice */}
          <Card className="mb-8 border-teal-200 bg-teal-50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <Shield className="h-6 w-6 text-teal-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-teal-800 mb-2">Jaminan Keamanan</h3>
                  <p className="text-teal-700 text-sm">
                    Identitas Anda akan dilindungi secara rahasia sesuai dengan ketentuan hukum yang berlaku. Setiap data yang Anda berikan akan dienkripsi dan hanya dapat diakses oleh tim investigasi yang berwenang.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Report Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span>Detail Pelanggaran</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <Label htmlFor="kategori" className="text-base font-medium mb-3 block">Kategori Pelanggaran *</Label>
                  <Select
                    value={formData.kategori}
                    onValueChange={(value) => setFormData({ ...formData, kategori: value })}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Pilih kategori pelanggaran" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="korupsi">Korupsi</SelectItem>
                      <SelectItem value="gratifikasi">Gratifikasi</SelectItem>
                      <SelectItem value="benturan-kepentingan">Benturan Kepentingan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="deskripsi" className="text-base font-medium mb-3 block">Deskripsi Pelanggaran *</Label>
                  <div className="border border-gray-300 rounded-md">
                    <div className="border-b border-gray-200 p-3 bg-gray-50">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className={`px-3 py-1 text-sm border rounded transition-colors ${
                            formatStates.bold 
                              ? 'bg-blue-100 border-blue-300 text-blue-700' 
                              : 'border-gray-300 hover:bg-gray-100'
                          }`}
                          onMouseDown={(e) => {
                            e.preventDefault()
                            handleFormat('bold')
                          }}
                        >
                          <strong>B</strong>
                        </button>
                        <button
                          type="button"
                          className={`px-3 py-1 text-sm border rounded transition-colors ${
                            formatStates.italic 
                              ? 'bg-blue-100 border-blue-300 text-blue-700' 
                              : 'border-gray-300 hover:bg-gray-100'
                          }`}
                          onMouseDown={(e) => {
                            e.preventDefault()
                            handleFormat('italic')
                          }}
                        >
                          <em>I</em>
                        </button>
                        <button
                          type="button"
                          className={`px-3 py-1 text-sm border rounded transition-colors ${
                            formatStates.underline 
                              ? 'bg-blue-100 border-blue-300 text-blue-700' 
                              : 'border-gray-300 hover:bg-gray-100'
                          }`}
                          onMouseDown={(e) => {
                            e.preventDefault()
                            handleFormat('underline')
                          }}
                        >
                          <u>U</u>
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                          onMouseDown={(e) => {
                            e.preventDefault()
                            handleListFormat('insertUnorderedList')
                          }}
                        >
                          • List
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                          onMouseDown={(e) => {
                            e.preventDefault()
                            handleListFormat('insertOrderedList')
                          }}
                        >
                          1. List
                        </button>
                      </div>
                    </div>
                    <div
                      ref={editorRef}
                      contentEditable
                      className="min-h-[150px] p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                      style={{ wordWrap: 'break-word', direction: 'ltr', unicodeBidi: 'normal' }}
                      onInput={(e) => {
                        const content = e.currentTarget.textContent || '';
                        setFormData({ ...formData, deskripsi: content });
                      }}
                      onKeyUp={checkFormatStates}
                      onMouseUp={checkFormatStates}
                      onFocus={checkFormatStates}
                      suppressContentEditableWarning={true}
                      data-placeholder="Jelaskan secara detail pelanggaran yang terjadi, termasuk siapa yang terlibat, kapan terjadi, dan bagaimana kronologinya..."
                    />
                  </div>
                  <style jsx>{`
                    [contenteditable]:empty:before {
                      content: attr(data-placeholder);
                      color: #9ca3af;
                      font-style: italic;
                    }
                  `}</style>
                </div>

                <div>
                  <Label htmlFor="tanggal" className="text-base font-medium mb-3 block">Tanggal Kejadian *</Label>
                  <Input
                    id="tanggal"
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    className="h-12"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="namaTerduga" className="text-base font-medium mb-3 block">Nama Terduga *</Label>
                    <div className="relative" ref={dropdownRef}>
                      <Input
                        id="namaTerduga"
                        value={searchTerm || formData.namaTerduga}
                        onChange={(e) => {
                          setSearchTerm(e.target.value)
                          setIsDropdownOpen(true)
                          if (!e.target.value) {
                            setFormData({ ...formData, namaTerduga: "" })
                          }
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                        placeholder="Ketik untuk mencari nama terduga..."
                        className="h-12"
                        required
                        autoComplete="off"
                      />
                      {isDropdownOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-y-auto">
                          {filteredNames.length > 0 ? (
                            filteredNames.map((name, index) => (
                              <div
                                key={index}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                onClick={() => {
                                  setFormData({ ...formData, namaTerduga: name })
                                  setSearchTerm("")
                                  setIsDropdownOpen(false)
                                }}
                              >
                                {name}
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-gray-500 text-sm">
                              Tidak ada nama yang ditemukan
                            </div>
                          )}
                        </div>
                      )}
                      {formData.namaTerduga && !searchTerm && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, namaTerduga: "" })
                              setSearchTerm("")
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                    {formData.namaTerduga && !searchTerm && (
                      <div className="mt-2 text-sm text-gray-600">
                        Dipilih: <span className="font-medium">{formData.namaTerduga}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="nipTerduga" className="text-base font-medium mb-3 block">NIP Terduga</Label>
                    <Input
                      id="nipTerduga"
                      value={formData.nipTerduga}
                      onChange={(e) => setFormData({ ...formData, nipTerduga: e.target.value })}
                      placeholder="Isikan NIP terduga jika tidak ada (-)"
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="jabatanTerduga" className="text-base font-medium mb-3 block">Jabatan Terduga *</Label>
                    <Input
                      id="jabatanTerduga"
                      value={formData.jabatanTerduga}
                      onChange={(e) => setFormData({ ...formData, jabatanTerduga: e.target.value })}
                      placeholder="Isikan Jabatan Terduga"
                      className="h-12"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="jenisKelamin" className="text-base font-medium mb-3 block">Jenis Kelamin *</Label>
                    <Select
                      value={formData.jenisKelamin}
                      onValueChange={(value) => setFormData({ ...formData, jenisKelamin: value })}
                    >
                      <SelectTrigger className="h-12 w-full">
                        <SelectValue placeholder="Pilih jenis kelamin" />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        <SelectItem value="laki-laki">Laki-laki</SelectItem>
                        <SelectItem value="perempuan">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="bukti">Lampiran Bukti (Opsional)</Label>
                  <p className="text-sm text-gray-500 mb-3">*Dapat diisikan lebih dari 1 bukti</p>
                  <div 
                    className={`relative mt-2 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                      isDragging 
                        ? 'border-blue-400 bg-blue-50 scale-[1.02]' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={handleFileClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Upload className={`h-8 w-8 mx-auto mb-2 transition-colors duration-200 ${
                      isDragging ? 'text-blue-500' : 'text-gray-400'
                    }`} />
                    <p className={`text-sm mb-2 transition-colors duration-200 ${
                      isDragging ? 'text-blue-600 font-medium' : 'text-gray-600'
                    }`}>
                      {isDragging ? 'Lepaskan file di sini' : 'Klik untuk upload atau drag & drop file'}
                    </p>
                    <p className="text-xs text-gray-500">Format: PDF, DOC, DOCX, JPG, JPEG, PNG (Max 10MB per file)</p>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      className="hidden" 
                      multiple 
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        if (e.target.files) {
                          handleFileSelect(e.target.files)
                        }
                      }}
                    />
                  </div>
                  
                  {/* Selected files display */}
                  {selectedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-gray-700">File yang dipilih:</p>
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {file.type.startsWith('image/') ? (
                                <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              ) : (
                                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeFile(index)
                            }}
                            className="flex-shrink-0 ml-3 text-red-400 hover:text-red-600 transition-colors"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Reporter Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Pelapor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="anonim"
                    checked={formData.anonim}
                    onCheckedChange={(checked) => setFormData({ ...formData, anonim: checked as boolean })}
                    className="h-5 w-5"
                  />
                  <Label htmlFor="anonim" className="text-base font-medium">
                    Saya ingin melaporkan secara anonim
                  </Label>
                </div>

                {!formData.anonim && (
                  <div className="space-y-8">
                    <div>
                      <Label htmlFor="nama" className="text-base font-medium mb-3 block">Nama Lengkap *</Label>
                      <Input
                        id="nama"
                        value={formData.nama}
                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                        placeholder="Masukkan nama lengkap Anda"
                        className="h-12"
                        required={!formData.anonim}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="email" className="text-base font-medium mb-3 block">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="email@example.com"
                          className="h-12"
                          required={!formData.anonim}
                        />
                      </div>
                      <div>
                        <Label htmlFor="telepon" className="text-base font-medium mb-3 block">Nomor Telepon</Label>
                        <Input
                          id="telepon"
                          value={formData.telepon}
                          onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                          placeholder="08xxxxxxxxxx"
                          className="h-12"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="text-center">
              <Button type="submit" size="lg" className="bg-red-600 hover:bg-red-700 px-8">
                Kirim Laporan
              </Button>
              <p className="text-sm text-gray-600 mt-4">
                Dengan mengirim laporan ini, Anda menyatakan bahwa informasi yang diberikan adalah benar dan dapat
                dipertanggungjawabkan.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
