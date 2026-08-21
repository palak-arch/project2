import confetti from 'canvas-confetti'

export function celebrate() {
  const end = Date.now() + 800
  const colors = ['#fbbf24', '#f59e0b', '#fb7185', '#2dd4bf', '#f97316']

  const frame = () => {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 60,
      origin: { x: 0.1, y: 0.7 },
      colors,
      startVelocity: 45,
      ticks: 220,
    })
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 60,
      origin: { x: 0.9, y: 0.7 },
      colors,
      startVelocity: 45,
      ticks: 220,
    })
    if (Date.now() < end) requestAnimationFrame(frame)
  }

  frame()

  confetti({
    particleCount: 120,
    spread: 100,
    origin: { y: 0.6 },
    colors,
    scalar: 1.1,
  })
}
