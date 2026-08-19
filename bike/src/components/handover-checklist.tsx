import * as React from 'react'
import { toast } from 'sonner'
import { Camera, Check, ChevronLeft, ChevronRight, Eraser, Fuel, Gauge, PenLine } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { actions, bookingById, bikeById, useStore } from '@/store/store'
import { celebrate } from '@/lib/confetti'
import { cn } from '@/lib/utils'

const INSPECTION_ITEMS = [
  'No new scratches or dents',
  'Tyres & pressure are good',
  'Brakes & clutch working',
  'Lights & indicators OK',
  'Mirrors intact',
  'Engine starts clean',
]

type Step = 'inspect' | 'fuel' | 'photo' | 'sign'

export function HandoverChecklist() {
  const bookingId = useStore((s) => s.handoverBookingId)
  const booking = bookingById(useStore((s) => s), bookingId)
  const bike = bikeById(useStore((s) => s), booking?.bikeId)

  const [step, setStep] = React.useState<Step>('inspect')
  const [items, setItems] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(INSPECTION_ITEMS.map((i) => [i, false])),
  )
  const [fuel, setFuel] = React.useState(100)
  const [odometer, setOdometer] = React.useState('')
  const [photos, setPhotos] = React.useState<string[]>([])
  const [cameraOpen, setCameraOpen] = React.useState(false)
  const [sign, setSign] = React.useState<string | null>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const drawing = React.useRef(false)

  React.useEffect(() => {
    if (bookingId) {
      setStep('inspect')
      setItems(Object.fromEntries(INSPECTION_ITEMS.map((i) => [i, false])))
      setFuel(100)
      setOdometer('')
      setPhotos([])
      setSign(null)
    }
  }, [bookingId])

  if (!booking || !bike) return null

  const inspectDone = INSPECTION_ITEMS.every((i) => items[i])
  const fuelDone = fuel >= 50 && odometer.trim().length >= 3

  const steps: { id: Step; label: string; Icon: typeof Camera }[] = [
    { id: 'inspect', label: 'Inspect', Icon: Check },
    { id: 'fuel', label: 'Fuel & Odo', Icon: Fuel },
    { id: 'photo', label: 'Photos', Icon: Camera },
    { id: 'sign', label: 'Sign', Icon: PenLine },
  ]
  const stepIdx = steps.findIndex((s) => s.id === step)

  const next = () => {
    if (step === 'inspect' && !inspectDone) {
      toast.error('Complete the body inspection first')
      return
    }
    if (step === 'fuel' && !fuelDone) {
      toast.error('Fuel must be ≥50% and odometer is required')
      return
    }
    if (step === 'sign' && !sign) {
      toast.error('Host signature is required')
      return
    }
    if (step === 'photo') {
      setStep('sign')
      return
    }
    if (step === 'inspect') setStep('fuel')
    else if (step === 'fuel') setStep('photo')
    else if (step === 'sign') {
      actions.confirmHandover(booking.id, {
        bodyItems: INSPECTION_ITEMS.map((i) => ({ label: i, checked: items[i] })),
        fuelLevel: fuel,
        odometer: Number(odometer),
        photo: photos[0],
        signature: sign ?? undefined,
      })
      actions.openHandover(null)
      celebrate()
      toast.success('Handover complete — rental is now active! 🎉')
    }
  }

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    drawing.current = true
    const ctx = canvas.getContext('2d')!
    ctx.strokeStyle = '#fbbf24'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')!
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (!drawing.current) return
    drawing.current = false
    const canvas = canvasRef.current
    if (canvas) setSign(canvas.toDataURL('image/png'))
  }

  const clearSign = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height)
    setSign(null)
  }

  const capturePhoto = () => {
    const id = `snap-${Date.now()}`
    setPhotos((p) => (p.length < 4 ? [...p, id] : p))
    setCameraOpen(false)
    toast.success('Photo captured')
  }

  return (
    <Dialog open={!!bookingId} onOpenChange={(o) => !o && actions.openHandover(null)}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Handover checklist</DialogTitle>
          <DialogDescription>
            {bike.name} · {booking.pickupTime} at {bike.location} — verify everything together with the host.
          </DialogDescription>
        </DialogHeader>

        {/* stepper */}
        <div className="flex items-center gap-1.5">
          {steps.map(({ id, label, Icon }, i) => (
            <React.Fragment key={id}>
              <button
                onClick={() => i < stepIdx && setStep(id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                  i === stepIdx
                    ? 'border-amber-300 bg-gradient-to-b from-amber-400 to-orange-500 text-[#1c1102]'
                    : i < stepIdx
                      ? 'border-teal-400/40 bg-teal-400/10 text-teal-300'
                      : 'border-white/10 bg-white/5 text-muted-foreground',
                )}
              >
                <Icon className="size-3.5" />
                {label}
              </button>
              {i < steps.length - 1 && <div className="h-px flex-1 bg-white/10" />}
            </React.Fragment>
          ))}
        </div>

        {/* step content */}
        <div className="min-h-56">
          {step === 'inspect' && (
            <div className="space-y-2">
              {INSPECTION_ITEMS.map((item) => (
                <label
                  key={item}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors',
                    items[item]
                      ? 'border-teal-400/40 bg-teal-400/8'
                      : 'border-white/10 bg-white/4 hover:bg-white/8',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-5 items-center justify-center rounded-md border transition-colors',
                      items[item] ? 'border-teal-300 bg-teal-400 text-[#04211a]' : 'border-white/20',
                    )}
                  >
                    {items[item] && <Check className="size-3.5" />}
                  </span>
                  <input
                    type="checkbox"
                    checked={items[item]}
                    onChange={() => setItems((s) => ({ ...s, [item]: !s[item] }))}
                    className="sr-only"
                  />
                  <span className="text-sm">{item}</span>
                </label>
              ))}
            </div>
          )}

          {step === 'fuel' && (
            <div className="space-y-6 py-2">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Fuel className="size-4 text-teal-300" /> Fuel level
                  </span>
                  <Badge variant="teal" className={cn(fuel >= 80 && 'text-emerald-300 border-emerald-400/30 bg-emerald-400/10')}>
                    {fuel}%
                  </Badge>
                </div>
                <Slider value={[fuel]} onValueChange={(v) => setFuel(v[0])} min={0} max={100} step={5} />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {fuel >= 80 ? 'Full tank — great' : fuel >= 50 ? 'Acceptable' : 'Too low, host should top up'}
                </p>
              </div>
              <div>
                <label className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                  <Gauge className="size-4 text-amber-300" /> Odometer reading (km)
                </label>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g. 12340"
                  value={odometer}
                  onChange={(e) => setOdometer(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 'photo' && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <button
                    key={i}
                    onClick={() => setCameraOpen(true)}
                    className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/4 text-muted-foreground transition-colors hover:border-teal-300/50 hover:text-teal-300"
                  >
                    {photos[i] ? (
                      <span className="relative flex size-full items-center justify-center overflow-hidden rounded-xl">
                        <span className="absolute inset-0 bg-gradient-to-br from-teal-400/40 to-cyan-600/40" />
                        <Camera className="size-5 text-white" />
                        <Check className="absolute bottom-1 right-1 size-3.5 rounded-full bg-teal-400 p-0.5 text-[#04211a]" />
                      </span>
                    ) : (
                      <Camera className="size-5" />
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Capture the odometer, both sides and any existing damage. {photos.length}/4 captured.
              </p>
            </div>
          )}

          {step === 'sign' && (
            <div className="space-y-3 py-2">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <PenLine className="size-4 text-amber-300" /> Host signature
              </p>
              <div className="relative overflow-hidden rounded-xl border border-white/15 bg-white/4">
                <canvas
                  ref={canvasRef}
                  width={480}
                  height={140}
                  onPointerDown={startDrawing}
                  onPointerMove={draw}
                  onPointerUp={stopDrawing}
                  onPointerLeave={stopDrawing}
                  className="h-32 w-full touch-none cursor-crosshair"
                />
                {!sign && (
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-muted-foreground/50">
                    Sign here with your finger or mouse
                  </span>
                )}
              </div>
              <Button variant="secondary" size="sm" onClick={clearSign}>
                <Eraser className="size-4" /> Clear
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" onClick={() => actions.openHandover(null)}>
            Cancel
          </Button>
          <div className="flex gap-2">
            {step !== 'inspect' && (
              <Button variant="secondary" onClick={() => setStep(steps[stepIdx - 1].id)}>
                <ChevronLeft className="size-4" /> Back
              </Button>
            )}
            <Button onClick={next}>
              {step === 'sign' ? (
                <>Confirm handover <Check className="size-4" /></>
              ) : (
                <>Continue <ChevronRight className="size-4" /></>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* simulated camera */}
      <Dialog open={cameraOpen} onOpenChange={setCameraOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Camera preview</DialogTitle>
            <DialogDescription>Simulated viewfinder — point at the odometer and capture.</DialogDescription>
          </DialogHeader>
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/30 via-[#0d1220] to-orange-500/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Gauge className="size-16 text-white/70" />
            </div>
            {/* viewfinder corners */}
            <div className="absolute inset-4 border border-white/40" />
            <div className="absolute left-1/2 top-1/2 h-8 w-px -translate-x-1/2 -translate-y-1/2 bg-white/40" />
            <div className="absolute left-1/2 top-1/2 h-px w-8 -translate-x-1/2 -translate-y-1/2 bg-white/40" />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setCameraOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={capturePhoto}>
              <Camera className="size-4" /> Capture
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
