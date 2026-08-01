'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'
import { ArrowLeft, ArrowRight, Upload, MapPin, FileText, CheckCircle2, Camera, X, Loader2, ImagePlus } from 'lucide-react'

// Leaflet touches `window` on import, so it can only load in the browser
const LocationPicker = dynamic(() => import('@/components/map/location-picker'), {
  ssr: false,
  loading: () => (
    <div className="h-[320px] rounded-xl bg-muted flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  ),
})

const DOCUMENT_TYPES = [
  { type: 'khasra', label: 'Khasra/Khatoni Certificate', desc: 'Official land revenue record' },
  { type: 'jamabandi', label: 'Jamabandi Record', desc: 'Ownership details from land revenue department' },
  { type: 'registry', label: 'Land Registry', desc: 'Registered sale deed' },
  { type: 'tax', label: 'Tax Payment Receipt', desc: 'Latest property tax receipt' },
  { type: 'map', label: 'Land Map / Survey', desc: 'Cadastral map or survey report' },
]

const STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan',
  'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
]

const LAND_TYPES = [
  { value: 'agricultural', label: 'Agricultural', icon: '🌾' },
  { value: 'residential', label: 'Residential', icon: '🏠' },
  { value: 'commercial', label: 'Commercial', icon: '🏢' },
  { value: 'industrial', label: 'Industrial', icon: '🏭' },
]

const STEPS = ['Property Info', 'Location', 'Documents', 'Review']

// Headings shown above the form on desktop, where there is room for context
const STEP_META = [
  { title: 'Tell us about your land', desc: 'Type, size and the price you expect. You can edit all of this later.' },
  { title: 'Where is the land located?', desc: 'Buyers search by state and city, so be as precise as you can.' },
  { title: 'Documents & photos', desc: 'Listings with documents get verified faster and receive more bids.' },
  { title: 'Review your listing', desc: 'Check everything once — our team reviews submissions within 24 hours.' },
]

export default function SellPage() {
  const router = useRouter()
  const { isAuthenticated, user, loading: authLoading } = useAuth()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'agricultural',
    area: '',
    areaUnit: 'acres',
    basePrice: '',
    state: '',
    city: '',
    address: '',
    pincode: '',
    khasraNo: '',
    khataNo: '',
    documents: [],
    images: [],
    coordinates: null, // { lat, lng, address }
  })
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadingDoc, setUploadingDoc] = useState(null)

  // Wait for the auth context to read localStorage — otherwise a direct load or
  // refresh of /sell bounces a signed-in seller straight to the login page
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [authLoading, isAuthenticated, router])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const nextStep = () => {
    if (step === 0) {
      if (!formData.title || !formData.area || !formData.basePrice) {
        toast.error('Please fill in all required fields')
        return
      }
    }
    if (step === 1) {
      if (!formData.state || !formData.city) {
        toast.error('Please fill in state and city')
        return
      }
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const prevStep = () => setStep((s) => Math.max(s - 1, 0))

  const handleImageUpload = async (files) => {
    const fileArr = Array.from(files).slice(0, 10 - formData.images.length)
    if (fileArr.length === 0) return
    setUploadingImages(true)
    const token = localStorage.getItem('token')
    try {
      const uploaded = await Promise.all(
        fileArr.map(async (file) => {
          const fd = new FormData()
          fd.append('file', file)
          fd.append('type', 'image')
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: fd,
          })
          if (res.ok) {
            const d = await res.json()
            return d.url
          }
          return null
        })
      )
      const valid = uploaded.filter(Boolean)
      setFormData(prev => ({ ...prev, images: [...prev.images, ...valid] }))
      if (valid.length) toast.success(`${valid.length} photo${valid.length > 1 ? 's' : ''} uploaded`)
    } catch {
      toast.error('Failed to upload images')
    } finally {
      setUploadingImages(false)
    }
  }

  const removeImage = (idx) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))
  }

  const handleDocumentUpload = async (doc, file) => {
    if (!file) return
    setUploadingDoc(doc.type)
    try {
      const token = localStorage.getItem('token')
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', 'document')

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')

      setFormData(prev => ({
        ...prev,
        documents: [
          ...prev.documents.filter(d => d.type !== doc.type),
          {
            type: doc.type,
            label: doc.label,
            url: data.url,
            publicId: data.publicId,
            format: data.format,
            fileName: file.name,
            uploadedAt: new Date().toISOString(),
          },
        ],
      }))
      toast.success(`${doc.label} uploaded`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setUploadingDoc(null)
    }
  }

  const removeDocument = (type) => {
    setFormData(prev => ({ ...prev, documents: prev.documents.filter(d => d.type !== type) }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          area: parseFloat(formData.area),
          areaUnit: formData.areaUnit,
          basePrice: parseInt(formData.basePrice),
          khasraNo: formData.khasraNo,
          khataNo: formData.khataNo,
          images: formData.images,
          documents: formData.documents,
          location: {
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            ...(formData.coordinates
              ? {
                  lat: formData.coordinates.lat,
                  lng: formData.coordinates.lng,
                  resolvedAddress: formData.coordinates.address || '',
                }
              : {}),
          },
        }),
      })
      if (res.ok) {
        toast.success('Property listed successfully! It will be reviewed by our team.')
        router.push('/dashboard')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to create listing')
      }
    } catch {
      toast.error('Failed to create listing')
    } finally {
      setSubmitting(false)
    }
  }

  const formatPrice = (val) => {
    const num = parseInt(val)
    if (!num) return ''
    if (num >= 10000000) return `${(num / 10000000).toFixed(2)} Cr`
    if (num >= 100000) return `${(num / 100000).toFixed(1)} L`
    return num.toLocaleString('en-IN')
  }

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Compact top bar — phones and tablets only */}
      <div className="lg:hidden sticky top-14 md:top-[72px] z-30 bg-card/95 backdrop-blur-md border-b border-border px-4 md:px-6 py-3 md:py-4">
        <div className="app-shell-narrow">
          <div className="flex items-center justify-between">
            <button onClick={() => step > 0 ? prevStep() : router.back()} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted" aria-label="Go back">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-sm md:text-lg font-semibold text-foreground">Sell Your Land</h1>
            <div className="w-9" />
          </div>

          {/* Progress */}
          <div className="flex items-center gap-1 md:gap-3 mt-3 md:mt-4">
            {STEPS.map((s, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className={`h-1 md:h-1.5 w-full rounded-full ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
                <span className={`text-[9px] md:text-xs mt-1 md:mt-1.5 ${i <= step ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop page header */}
      <div className="hidden lg:block bg-card border-b border-border">
        <div className="app-shell-wide px-6 py-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-3xl font-bold text-foreground mt-3">Sell Your Land</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            List your property in four quick steps. It is free, and verified listings usually go live within 24 hours.
          </p>
        </div>
      </div>

      <div className="px-4 md:px-6 py-6 lg:py-10 pb-32 lg:pb-16">
        <div className="app-shell-narrow lg:max-w-6xl lg:grid lg:grid-cols-[264px_1fr] lg:gap-8 lg:items-start">

          {/* Desktop stepper */}
          <aside className="hidden lg:block sticky top-[96px] space-y-4">
            <nav className="rounded-2xl border border-border bg-card p-3" aria-label="Listing steps">
              {STEPS.map((label, i) => {
                const done = i < step
                const current = i === step
                return (
                  <button
                    key={label}
                    onClick={() => i < step && setStep(i)}
                    disabled={i > step}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors ${
                      current ? 'bg-primary/5' : i < step ? 'hover:bg-muted' : 'opacity-50 cursor-default'
                    }`}
                    aria-current={current ? 'step' : undefined}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      done ? 'bg-primary text-primary-foreground'
                        : current ? 'bg-primary/15 text-primary border-2 border-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className={`block text-sm font-semibold ${current ? 'text-primary' : 'text-foreground'}`}>
                        {label}
                      </span>
                      <span className="block text-[11px] text-muted-foreground mt-0.5">
                        {done ? 'Completed' : current ? 'In progress' : 'Not started'}
                      </span>
                    </span>
                  </button>
                )
              })}
            </nav>

            <div className="rounded-2xl border border-border bg-muted/40 p-5">
              <p className="text-sm font-semibold text-foreground">Why list on LandBid?</p>
              <ul className="mt-3 space-y-2.5">
                {[
                  'Zero listing fee and zero brokerage',
                  'Reach verified buyers across India',
                  'Transparent bidding on your terms',
                ].map((point) => (
                  <li key={point} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Form column */}
          <div className="lg:rounded-2xl lg:border lg:border-border lg:bg-card lg:p-8">
            <div className="hidden lg:block mb-6 pb-5 border-b border-border">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                Step {step + 1} of {STEPS.length}
              </p>
              <h2 className="text-xl font-bold text-foreground mt-1.5">{STEP_META[step].title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{STEP_META[step].desc}</p>
            </div>

            <div className="space-y-4 md:space-y-5">

          {/* Step 0: Property Info */}
          {step === 0 && (
            <>
              <div>
                <label className="text-sm font-medium text-foreground">Land Type *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mt-2">
                  {LAND_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setFormData({ ...formData, category: type.value })}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-colors ${
                        formData.category === type.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-card'
                      }`}
                    >
                      <span className="text-xl">{type.icon}</span>
                      <span className={`text-sm font-medium ${formData.category === type.value ? 'text-primary' : 'text-foreground'}`}>
                        {type.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Property Title *</label>
                <Input name="title" placeholder="e.g. Fertile Agricultural Land in Punjab" value={formData.title} onChange={handleChange} className="mt-1.5 h-11 rounded-xl" />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Description</label>
                <Textarea name="description" placeholder="Describe your property, features, nearby landmarks..." value={formData.description} onChange={handleChange} className="mt-1.5" rows={4} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground">Area *</label>
                  <Input name="area" type="number" placeholder="e.g. 2.5" value={formData.area} onChange={handleChange} className="mt-1.5 h-11 rounded-xl" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Unit</label>
                  <select
                    name="areaUnit"
                    value={formData.areaUnit}
                    onChange={handleChange}
                    className="mt-1.5 w-full h-11 rounded-xl border border-input bg-card text-foreground px-3 text-sm"
                  >
                    <option value="acres">Acres</option>
                    <option value="sqft">Sq. Ft.</option>
                    <option value="sqm">Sq. M.</option>
                    <option value="bigha">Bigha</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Base Price (INR) *</label>
                <Input name="basePrice" type="number" placeholder="e.g. 500000" value={formData.basePrice} onChange={handleChange} className="mt-1.5 h-11 rounded-xl" />
                {formData.basePrice && (
                  <p className="text-xs text-primary font-medium mt-1">
                    {`₹${formatPrice(formData.basePrice)}`}
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground">Khasra Number</label>
                  <Input name="khasraNo" placeholder="e.g. 234/12" value={formData.khasraNo} onChange={handleChange} className="mt-1.5 h-11 rounded-xl" />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Khata Number</label>
                  <Input name="khataNo" placeholder="e.g. KH-9876" value={formData.khataNo} onChange={handleChange} className="mt-1.5 h-11 rounded-xl" />
                </div>
              </div>
            </>
          )}

          {/* Step 1: Location */}
          {step === 1 && (
            <>
              <div>
                <label className="text-sm font-medium text-foreground">State *</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="mt-1.5 w-full h-11 rounded-xl border border-input bg-card text-foreground px-3 text-sm"
                >
                  <option value="">Select State</option>
                  {STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground">City / District *</label>
                  <Input name="city" placeholder="e.g. Ludhiana" value={formData.city} onChange={handleChange} className="mt-1.5 h-11 rounded-xl" />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Pincode</label>
                  <Input name="pincode" type="text" placeholder="e.g. 141001" value={formData.pincode} onChange={handleChange} className="mt-1.5 h-11 rounded-xl" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Full Address</label>
                <Textarea name="address" placeholder="Village, Tehsil, Landmark..." value={formData.address} onChange={handleChange} className="mt-1.5" rows={3} />
              </div>

              {/* Pin the exact location */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-foreground">Pin on map</label>
                  <span className="text-[11px] text-muted-foreground">
                    {formData.coordinates ? 'Pinned' : 'Recommended'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Buyers search by area — a pin shows them exactly where your land is.
                </p>
                <LocationPicker
                  value={formData.coordinates}
                  onChange={(coordinates) => setFormData(prev => ({ ...prev, coordinates }))}
                  searchHint={[formData.city, formData.state].filter(Boolean).join(', ')}
                />
              </div>
            </>
          )}

          {/* Step 2: Documents */}
          {step === 2 && (
            <>
              <p className="text-sm text-muted-foreground">
                Upload land documents for verification. Verified properties get more bids.
              </p>

              <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-3">
              {DOCUMENT_TYPES.map((doc) => {
                const uploaded = formData.documents.find((d) => d.type === doc.type)
                const busy = uploadingDoc === doc.type
                return (
                  <Card key={doc.type} className={uploaded ? 'border-primary/50 bg-primary/5' : ''}>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${uploaded ? 'bg-primary/10' : 'bg-muted'}`}>
                            {uploaded ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <FileText className="w-5 h-5 text-muted-foreground" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{doc.label}</p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {uploaded ? uploaded.fileName : doc.desc}
                            </p>
                          </div>
                        </div>

                        {uploaded ? (
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <a
                              href={uploaded.url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-muted text-foreground hover:bg-muted/70 transition-colors"
                            >
                              View
                            </a>
                            <button
                              type="button"
                              onClick={() => removeDocument(doc.type)}
                              className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-destructive/10 transition-colors"
                              aria-label={`Remove ${doc.label}`}
                            >
                              <X className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                          </div>
                        ) : (
                          <label
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 cursor-pointer transition-colors ${
                              busy ? 'bg-primary/10 text-primary' : 'bg-muted text-foreground hover:bg-muted/70'
                            }`}
                          >
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              className="hidden"
                              disabled={busy}
                              onChange={(e) => {
                                handleDocumentUpload(doc, e.target.files?.[0])
                                e.target.value = ''
                              }}
                            />
                            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Upload'}
                          </label>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
              </div>

              {/* Property Photos */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">Property Photos</label>
                  <span className="text-xs text-muted-foreground">{formData.images.length}/10 photos</span>
                </div>

                {/* Upload zone */}
                {formData.images.length < 10 && (
                  <label className={`flex flex-col items-center justify-center gap-2 h-32 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                    uploadingImages ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-primary/5'
                  }`}>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      disabled={uploadingImages}
                      onChange={(e) => e.target.files?.length && handleImageUpload(e.target.files)}
                    />
                    {uploadingImages ? (
                      <>
                        <Loader2 className="w-7 h-7 text-primary animate-spin" />
                        <p className="text-xs text-primary font-medium">Uploading photos...</p>
                      </>
                    ) : (
                      <>
                        <ImagePlus className="w-7 h-7 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Tap to add photos · up to 10</p>
                        <p className="text-[10px] text-muted-foreground/60">JPG, PNG, WEBP accepted</p>
                      </>
                    )}
                  </label>
                )}

                {/* Previews */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-3 mt-3">
                    {formData.images.map((url, idx) => (
                      <div key={idx} className="relative rounded-xl overflow-hidden aspect-square bg-muted">
                        <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                          aria-label="Remove photo"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                        {idx === 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] font-bold text-center py-0.5">
                            COVER
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <>
              <div className="lg:hidden">
                <h2 className="text-lg font-bold text-foreground">Review Your Listing</h2>
                <p className="text-sm text-muted-foreground">Make sure all details are correct before submitting.</p>
              </div>

              <Card>
                <CardContent className="pt-4 pb-4 space-y-3 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-x-10 lg:gap-y-3.5">
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Property Title</span>
                    <span className="text-sm font-medium text-foreground">{formData.title || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Type</span>
                    <Badge variant="secondary" className="text-xs">{formData.category}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Area</span>
                    <span className="text-sm font-medium text-foreground">{formData.area} {formData.areaUnit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Base Price</span>
                    <span className="text-sm font-bold text-primary">{formData.basePrice ? `₹${formatPrice(formData.basePrice)}` : 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Location</span>
                    <span className="text-sm font-medium text-foreground text-right">{formData.city}, {formData.state}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Map pin</span>
                    <span className={`text-sm font-medium ${formData.coordinates ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {formData.coordinates
                        ? `${formData.coordinates.lat.toFixed(4)}, ${formData.coordinates.lng.toFixed(4)}`
                        : 'Not pinned'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Documents</span>
                    <span className="text-sm font-medium text-foreground">{formData.documents.length} uploaded</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Photos</span>
                    <span className="text-sm font-medium text-foreground">{formData.images.length} photo{formData.images.length !== 1 ? 's' : ''}</span>
                  </div>
                  {formData.khasraNo && (
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Khasra No.</span>
                      <span className="text-sm font-medium text-foreground">{formData.khasraNo}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="bg-accent/10 rounded-xl p-4">
                <p className="text-xs text-foreground font-medium">After submitting:</p>
                <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                  <li>{'- Your property will be reviewed by our verification team'}</li>
                  <li>{'- Verified listings go live within 24 hours'}</li>
                  <li>{'- You will receive bids via notifications and messages'}</li>
                </ul>
              </div>
            </>
          )}
            </div>

            {/* Inline actions — desktop keeps them with the form instead of a fixed bar */}
            <div className="hidden lg:flex items-center gap-3 mt-8 pt-6 border-t border-border">
              {step > 0 && (
                <Button variant="outline" onClick={prevStep} className="h-11 px-6">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              )}
              <div className="flex-1" />
              {step < STEPS.length - 1 ? (
                <Button onClick={nextStep} className="h-11 px-8 font-semibold">
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={submitting} className="h-11 px-8 font-semibold">
                  {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : 'Submit Listing'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed bottom actions — phones and tablets */}
      <div className="lg:hidden fixed bottom-16 md:bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-md border-t border-border px-4 md:px-6 py-3 md:py-4 safe-bottom">
        <div className="app-shell-narrow flex gap-3">
          {step > 0 && (
            <Button variant="outline" className="flex-1" onClick={prevStep}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button className="flex-1" onClick={nextStep}>
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button className="flex-1" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Listing'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
