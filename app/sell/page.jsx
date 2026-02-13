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
import { ArrowLeft, ArrowRight, Upload, MapPin, FileText, CheckCircle2, Camera, X } from 'lucide-react'

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

export default function SellPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
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
  })

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to list a property')
      router.push('/login')
    }
  }, [isAuthenticated, router])

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
          location: {
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
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

  return (
    <div className="bg-background min-h-screen">
      {/* Top Bar */}
      <div className="sticky top-14 z-30 bg-card/95 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between">
            <button onClick={() => step > 0 ? prevStep() : router.back()} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted" aria-label="Go back">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-sm font-semibold text-foreground">Sell Your Land</h1>
            <div className="w-9" />
          </div>

          {/* Progress */}
          <div className="flex items-center gap-1 mt-3">
            {STEPS.map((s, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className={`h-1 w-full rounded-full ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
                <span className={`text-[9px] mt-1 ${i <= step ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-6 pb-32">
        <div className="max-w-lg mx-auto space-y-4">

          {/* Step 0: Property Info */}
          {step === 0 && (
            <>
              <div>
                <label className="text-sm font-medium text-foreground">Land Type *</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
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

              <div>
                <label className="text-sm font-medium text-foreground">Khasra Number</label>
                <Input name="khasraNo" placeholder="e.g. 234/12" value={formData.khasraNo} onChange={handleChange} className="mt-1.5 h-11 rounded-xl" />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Khata Number</label>
                <Input name="khataNo" placeholder="e.g. KH-9876" value={formData.khataNo} onChange={handleChange} className="mt-1.5 h-11 rounded-xl" />
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

              <div>
                <label className="text-sm font-medium text-foreground">City / District *</label>
                <Input name="city" placeholder="e.g. Ludhiana" value={formData.city} onChange={handleChange} className="mt-1.5 h-11 rounded-xl" />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Full Address</label>
                <Textarea name="address" placeholder="Village, Tehsil, Landmark..." value={formData.address} onChange={handleChange} className="mt-1.5" rows={3} />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Pincode</label>
                <Input name="pincode" type="text" placeholder="e.g. 141001" value={formData.pincode} onChange={handleChange} className="mt-1.5 h-11 rounded-xl" />
              </div>

              {/* Map Placeholder */}
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="h-40 bg-muted rounded-xl flex flex-col items-center justify-center gap-2">
                    <MapPin className="w-8 h-8 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Map integration coming soon</p>
                    <p className="text-[10px] text-muted-foreground">You can pin your land location on map</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Step 2: Documents */}
          {step === 2 && (
            <>
              <p className="text-sm text-muted-foreground">
                Upload land documents for verification. Verified properties get more bids.
              </p>

              {[
                { type: 'khasra', label: 'Khasra/Khatoni Certificate', desc: 'Official land revenue record' },
                { type: 'jamabandi', label: 'Jamabandi Record', desc: 'Ownership details from land revenue department' },
                { type: 'registry', label: 'Land Registry', desc: 'Registered sale deed' },
                { type: 'tax', label: 'Tax Payment Receipt', desc: 'Latest property tax receipt' },
                { type: 'map', label: 'Land Map / Survey', desc: 'Cadastral map or survey report' },
              ].map((doc) => {
                const uploaded = formData.documents.includes(doc.type)
                return (
                  <Card key={doc.type} className={`${uploaded ? 'border-primary/50 bg-primary/5' : ''}`}>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${uploaded ? 'bg-primary/10' : 'bg-muted'}`}>
                            {uploaded ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <FileText className="w-5 h-5 text-muted-foreground" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{doc.label}</p>
                            <p className="text-[10px] text-muted-foreground">{doc.desc}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (uploaded) {
                              setFormData({ ...formData, documents: formData.documents.filter((d) => d !== doc.type) })
                            } else {
                              setFormData({ ...formData, documents: [...formData.documents, doc.type] })
                              toast.success(`${doc.label} uploaded (demo)`)
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                            uploaded
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-foreground'
                          }`}
                        >
                          {uploaded ? 'Done' : 'Upload'}
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {/* Add Photos */}
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Camera className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Property Photos</p>
                      <p className="text-[10px] text-muted-foreground">Add up to 10 photos of your land</p>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-accent/10 text-accent" onClick={() => toast.info('Photo upload coming soon')}>
                      Add
                    </button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <>
              <h2 className="text-lg font-bold text-foreground">Review Your Listing</h2>
              <p className="text-sm text-muted-foreground">Make sure all details are correct before submitting.</p>

              <Card>
                <CardContent className="pt-4 pb-4 space-y-3">
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
                    <span className="text-xs text-muted-foreground">Documents</span>
                    <span className="text-sm font-medium text-foreground">{formData.documents.length} uploaded</span>
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
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-16 left-0 right-0 z-30 bg-card/95 backdrop-blur-md border-t border-border px-4 py-3 safe-bottom">
        <div className="max-w-lg mx-auto flex gap-3">
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
