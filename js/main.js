const ctx = new (window.AudioContext || window.webkitAudioContext)()

//analyser node
const fft = new AnalyserNode(ctx, { fftSize: 2048 })
const types = ['sine', 'square', 'sawtooth', 'triangle']

//Source Node
// const tone = new OscillatorNode(ctx, {
//   type: 'sine',
//   frequency: 440
// })

// const lvl = new GainNode(ctx, {
//   gain: 0.25
// })

function tone (type, pitch, time, duration) {
  const t = time || ctx.currentTime
  const dur = duration || 1
  const osc = new OscillatorNode(ctx, {
    type: type || 'sine',
    frequency: pitch || 440
  })
  const lvl = new GainNode(ctx, {gain: 0.001})
  osc.connect(lvl)
  lvl.connect(ctx.destination)
  lvl.connect(fft)
  osc.start(t)
  osc.stop(t + dur)
  adsr({
    param: lvl.gain,
    peak: 0.7,
    hold: 0.8,
    time: t,
    duration: dur
  })


}

function adsr (opts) {
  /*
                peak
                /\   val  val
               /| \__|____|
              / |    |    |\
             /  |    |    | \
       init /a  |d   |s   |r \ init

       <----------time------------>
  */
  const param = opts.param
  const peak = opts.peak || 1
  const hold = opts.hold || 0.8
  const time = opts.time || ctx.currentTime
  const dur = opts.duration || 1
  const a = opts.attack || dur * 0.2
  const d = opts.decay || dur * 0.2
  const s = opts.sustain || dur * 0.3
  const r = opts.release || dur * 0.3

  const initVal = param.value
  param.setValueAtTime(initVal, time)
  param.linearRampToValueAtTime(peak, time+a)
  param.linearRampToValueAtTime(hold, time+a+d)
  param.linearRampToValueAtTime(hold, time+a+d+s)
  param.linearRampToValueAtTime(initVal, time+a+d+s+r)
}

function step(rootFreq, steps) {
  let tr2 = Math.pow(2, 1/12)
  let rnd = rootFreq * Math.pow(tr2, steps)
  return Math.round(rnd * 100) / 100
}

function r(scale) {
  return Math.floor(Math.random() * scale.length)
}
// lvl.gain.setValueAtTime(0.25, ctx.currentTime)
// lvl.gain.linearRampToValueAtTime(1, ctx.currentTime + 1)
// lvl.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 2)

// const p = 0.8 // peak value for all tones
// const v = 0.7 // sustained value for all tones

// tone.frequency.setValueAtTime(440.00, ctx.currentTime)
// adsr(lvl.gain, p,v, ctx.currentTime, 0.2,0.1,0.4,0.2) // 0.9s

// tone.frequency.setValueAtTime(523.25, ctx.currentTime + 1)
// adsr(lvl.gain, p,v, ctx.currentTime + 1, 0.2,0.1,0.4,0.2) // 0.9s

// tone.frequency.setValueAtTime(659.26, ctx.currentTime + 2)
// adsr(lvl.gain, p,v, ctx.currentTime + 2, 0.2,0.1,0.4,0.2) // 0.9s

// tone.frequency.setValueAtTime(523.25, ctx.currentTime + 3)
// adsr(lvl.gain, p,v, ctx.currentTime + 3, 0.2,0.1,0.7,0.2) // 1.2s

// tone.frequency.setValueAtTime(440.00, ctx.currentTime + 4.5)
// adsr(lvl.gain, p,v, ctx.currentTime + 4.5, 0.2,0.1,2.0,0.2) // 2.5s

// // tone.connect(fft)
// tone.connect(lvl)
// lvl.connect(ctx.destination)
// lvl.connect(fft)


// tone.start(ctx.currentTime)
// tone.stop(ctx.currentTime + 7)

const major = [0, 2, 4, 5, 7, 9, 11, 12]
const minor = [0, 2, 3, 5, 7, 8, 10, 12]
const octatonic = [0, 1, 3, 4, 5, 6, 7, 9]

const delayStart = 0.75
const tempo = 140
const beat = 60/tempo
const bar = beat * 4
const root = 523.2511
const scale = octatonic
const notes = [1, 1, 7, 5]

for (let b = 0; b < 4; b++) {
  const delayB = b * bar * 4
  notes[2] = r(scale)
  notes[3] = r(scale)

  for (let a = 0; a < 4; a++) {
    const delayA = a * bar
    let typ = r(types)
    for (let i = 0; i < notes.length; i++) {
      const time = i * beat + delayStart + delayA + delayB
      const dur = beat
      const pitch = step(root, notes[i])
      tone(types[typ], pitch, time, dur)
    }
  }

}
createWaveCanvas({ element: 'section', analyser: fft })