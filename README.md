# Whistle Blowing System DPMPTSP Jawa Tengah

A modern whistleblowing system built with Next.js 15 for DPMPTSP Provinsi Jawa Tengah. This system allows users to report corruption, gratification, and conflicts of interest through a secure and user-friendly interface.

## 🚀 Features

- **Modern UI/UX**: Responsive design with Tailwind CSS and shadcn/ui components
- **Multi-category Reporting**: Support for corruption, gratification, and conflict of interest reports
- **Employee Search**: Auto-complete dropdown for suspect information
- **File Upload**: Drag-and-drop file upload with validation
- **Report Tracking**: Real-time status tracking with ticket numbers
- **Statistics Dashboard**: Live statistics showing report categories
- **Email Notifications**: Automated confirmation emails with tracking links
- **Security**: reCAPTCHA integration and input validation
- **API Integration**: Seamless integration with company's INTAN API

## 🏗️ Architecture

```
Frontend (Next.js 15)
├── API Routes (Proxy/Middleware)
│   ├── Reports API → INTAN API MOCKUP
│   ├── Search API → INTAN API MOCKUP
│   ├── Statistics API → INTAN API MOCKUP
│   ├── Categories API → INTAN API MOCKUP
│   ├── Employee API → INTAN API MOCKUP
│   ├── Email Service → nodemailer
│   └── reCAPTCHA Verification → Google API
└── UI Components
    ├── Report Form with validation
    ├── Employee Search
    ├── File Upload
    ├── Statistics Display
    └── Report Tracking
```

## 📋 Prerequisites

- Node.js 18 or higher
- npm or yarn
- Vercel account (for deployment)
- INTAN API credentials from your company
- Google reCAPTCHA credentials

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Erlanda-Prasetio/api-mockup
   cd api-mockup
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure environment variables**
   ```env
   # API Configuration
   API_INTAN=your_api_url_here
   API_INTAN_TOKEN=your_api_token_here
   API_USERNAME=your_username
   API_PASSWORD=your_password

   # reCAPTCHA Configuration
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
   RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key

   # Email Configuration
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password


5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)** in your browser


### Authentication
All API endpoints use Bearer token authentication via the `API_INTAN_TOKEN` environment variable.

### Endpoints

#### 📊 Statistics API
**GET** `/api/stats`

Retrieves statistics for all report categories from the INTAN API.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "nama": "Korupsi",
      "jumlah_pengaduan": 25
    },
    {
      "nama": "Gratifikasi", 
      "jumlah_pengaduan": 15
    },
    {
      "nama": "Benturan Kepentingan",
      "jumlah_pengaduan": 8
    }
  ]
}
```

#### 🔍 Search API
**GET** `/api/search?kode_aduan={ticket_number}`

Searches for a report by its ticket number.

**Parameters:**
- `kode_aduan` (required): The ticket number to search for

**Response:**
```json
[
  {
    "id": 1,
    "kode_aduan": "202501200001",
    "status": {
      "name": "Sedang Diproses",
      "description": "Menunggu Respon Kepala Dinas"
    },
    "kategori_id": 1,
    "nama_terduga": "John Doe",
    "jabatan_terduga": "Manager",
    "created_at": "2025-01-20T10:00:00Z"
  }
]
```

**Error Responses:**
- `422`: Missing or invalid `kode_aduan` parameter
- `404`: Report not found
- `500`: Internal server error

#### 📝 Reports API
**POST** `/api/reports`

Submits a new report to the INTAN API.

**Request Body (JSON):**
```json
{
  "kategori_id": "korupsi",
  "deskripsi": "Description of the corruption incident",
  "tanggal": "2025-01-20",
  "nama_terduga": "John Doe",
  "nip_terduga": "1234567890",
  "jabatan_terduga": "Manager",
  "jenis_kelamin": "Laki-laki",
  "nama": "Reporter Name",
  "email": "reporter@example.com",
  "telepon": "081234567890",
  "anonim": false,
  "validasi_pengaduan": true
}
```

**Request Body (Form Data):**
```html
<form enctype="multipart/form-data">
  <input name="kategori_id" value="korupsi">
  <input name="deskripsi" value="Description">
  <input name="nama_terduga" value="John Doe">
  <input type="file" name="bukti[]">
</form>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "kode_aduan": "202501200001",
    "message": "Report submitted successfully"
  }
}
```

**Supported Categories:**
- `korupsi` → ID: 1
- `gratifikasi` → ID: 2  
- `benturan-kepentingan` → ID: 3

**File Upload:**
- Maximum 10 files per submission
- Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG
- Maximum file size: 2MB per file

#### 👥 Employee API
**GET** `/api/pegawai`

Retrieves employee list for suspect information dropdown.

**Response:**
```json
[
  {
    "name": "John Doe",
    "jabatan": "Manager",
    "nip": "1234567890"
  },
  {
    "name": "Jane Smith", 
    "jabatan": "Supervisor",
    "nip": "0987654321"
  }
]
```

#### 📧 Email API
**POST** `/api/send-email`

Sends confirmation email with tracking link.

**Request Body:**
```json
{
  "to_email": "user@example.com",
  "kode_aduan": "202501200001"
}
```

**Response:**
```json
{
  "message": "Email sent successfully"
}
```

#### 🔐 reCAPTCHA API
**POST** `/api/verify-recaptcha`

Verifies reCAPTCHA token with Google.

**Request Body:**
```json
{
  "token": "recaptcha_token_here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "reCAPTCHA verification successful",
  "score": 0.7
}
```

#### 📋 Categories API
**GET** `/api/categories`

Retrieves available report categories from INTAN API.

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "nama": "Korupsi"
    },
    {
      "id": 2,
      "nama": "Gratifikasi"
    },
    {
      "id": 3,
      "nama": "Benturan Kepentingan"
    }
  ]
}
```

#### 📄 Report Details API
**GET** `/api/reports/{id}`

Retrieves detailed information for a specific report.

**Response:**
```json
{
  "id": 1,
  "kode_aduan": "202501200001",
  "kategori_id": 1,
  "nama_terduga": "John Doe",
  "jabatan_terduga": "Manager",
  "deskripsi": "Detailed description...",
  "status_pengaduan_id": 1,
  "created_at": "2025-01-20T10:00:00Z"
}
```

## 🔧 Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Type checking
npm run type-check
```

### Testing

The project includes several test files for API validation:

```bash
# Run API tests
node scripts/stats_api_test.js
node scripts/stats_search_test.js
node tests/intan-api-test.js
node tests/test-pegawai-api.js
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `API_INTAN` | Base URL for INTAN API | ✅ |
| `API_INTAN_TOKEN` | Bearer token for INTAN API | ✅ |
| `API_USERNAME` | Username for basic auth | ❌ |
| `API_PASSWORD` | Password for basic auth | ❌ |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | reCAPTCHA site key | ✅ |
| `RECAPTCHA_SECRET_KEY` | reCAPTCHA secret key | ✅ |
| `SMTP_USER` | Email for sending notifications | ✅ |
| `SMTP_PASS` | Email password | ✅ |

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables
   - Deploy automatically on push

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm run start
```

## 📱 User Interface

### Main Features

1. **Homepage**
   - Hero section with call-to-action
   - Statistics dashboard
   - Report categories overview
   - Complaint tracking form

2. **Report Form (`/laporan`)**
   - Multi-step form with validation
   - Employee search dropdown
   - File upload with drag-and-drop
   - Rich text editor
   - reCAPTCHA verification

3. **Report Tracking**
   - Real-time status checking
   - Ticket number validation
   - Status display with descriptions

### UI Components

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Form Validation**: Real-time validation with helpful error messages
- **Loading States**: Loading indicators during API calls
- **Toast Notifications**: Success and error feedback

## 🔒 Security Features

- **Input Validation**: All inputs are validated and sanitized
- **reCAPTCHA Protection**: Bot prevention on forms
- **File Upload Security**: Type and size restrictions
- **API Security**: Bearer token authentication
- **CORS Protection**: Proper cross-origin configuration
- **HTTPS**: Secure communication in production

## 📊 Monitoring & Analytics

### Built-in Logging

The application includes comprehensive logging for:

- API request/response logging
- Error tracking and debugging
- User activity monitoring
- Performance metrics

### Error Handling

- Graceful error handling with user-friendly messages
- Detailed error logging for debugging
- Fallback mechanisms for API failures
- Proper HTTP status codes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔄 Changelog

### v0.1.2 (Current)
- Initial release with core functionality
- Integration with INTAN API MOCKUP
- Responsive UI design
- Email notifications
- Report tracking system
- Deploy to Vercel https://wbs-beta-six.vercel.app/

---

**Built with ❤️ by DPMPTSP Provinsi Jawa Tengah**
