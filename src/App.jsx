import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const BASE_URL = import.meta.env.BASE_URL
const assetUrl = (path) => `${BASE_URL}${path.replace(/^\/+/, '')}`
const pageUrl = (path = '') => `${BASE_URL}${path.replace(/^\/+/, '')}`
const newsletterPath = new URL(pageUrl('newsletter'), window.location.origin).pathname.replace(/\/$/, '')
const newsletterHash = '#/newsletter'
const newsletterUrl = pageUrl('newsletter')

const CHARACTER_OUTLINE_MAX_DIMENSION = 420
const CHARACTER_OUTLINE_ALPHA_THRESHOLD = 48
const CHARACTER_OUTLINE_MIN_POINTS = 20

const pillars = [
  {
    number: '01',
    title: 'Asymmetrical Co-op',
    text: 'One robot attacks, one robot blocks. Progress depends on timing, coordination, and using your opposite strengths together.',
  },
  {
    number: '02',
    title: 'Shard Sharing',
    text: 'New shards unlock tools and powers, but they can be passed between players on the move, constantly changing who can do what.',
  },
  {
    number: '03',
    title: 'Guided Adventure',
    text: 'Small open areas lead into side-scrolling dungeons, optional detours, combat set pieces, and puzzle-led progression.',
  },
]

const warFeatures = [
  'Two-player co-op built around sharing abilities',
  'Simple but tense combat with one-hit danger and bigger boss threats',
  'Day and night cycles, charge zones, weather, and rain as a real hazard',
  'Rewards like skins, music tracks, valuables, ammunition, and upgrades',
]

const factions = [
  {
    name: 'Open Areas',
    subtitle: 'Semi-open exploration spaces',
    text: 'Players move through guided hub-like regions with visible destinations, secrets, detours, and routes toward the next major progression point.',
  },
  {
    name: 'Side-Scroller Dungeons',
    subtitle: 'Camera-on-rails 3D spaces',
    text: 'Optional and mandatory dungeons shift into a Little Nightmares-style presentation where platforming, puzzles, and combat become more focused.',
  },
  {
    name: 'Charge & Survival',
    subtitle: 'Rest points and environmental danger',
    text: 'Campfires and charge zones let the pair recover, while hazards like rain push the world itself into the core of traversal and planning.',
  },
]

const chronicles = [
  {
    label: 'Premise',
    title: 'Two robots chase a soul force that may only be enough for one.',
    text: 'The overview frames the whole adventure around friendship, need, and a co-op bond that could eventually be tested by scarcity.',
    art: assetUrl('rough/ROUGH%20DESIGN%20MANUAL.pptx%20(2).png'),
    artAlt: 'Rough concept art of a dark valley with a distant glowing orb',
  },
  {
    label: 'Tone',
    title: 'Voiceless charm, beeps and bops, hustlers on a big trip.',
    text: 'The robots are described as low-paid village scoundrels with humor, personality flaws, and a habit of spending wages on drinks.',
    art: assetUrl('rough/ROUGH%20DESIGN%20MANUAL.pptx.png'),
    artAlt: 'Rough concept art of a blue robot silhouette in mist',
  },
]

const companions = [
  {
    name: 'Sheelt',
    role: 'Passive Defender',
    art: assetUrl('frame_sheel_character.png'),
    quote: 'Blocks, carries, glides, drinks, and cannot swim.',
    text: 'The shield robot is the defensive half of the pair. Early shard upgrades point toward traversal and utility tools like umbrellas, gliders, cloaking, ladders, and backpacks.',
  },
  {
    name: 'Zord',
    role: 'Aggressive Attacker',
    art: assetUrl('frame_zoort_character.png'),
    quote: 'Strikes first, fears heights, and dances better than Shield.',
    text: 'The sword robot is the offensive half of the pair. Its shard path leans into tools like laser muskets, grappling hooks, sledgehammers, ammunition, and jetpack-style mobility.',
  },
]

const heroScenes = [
  {
    src: assetUrl('leaving the village copy.jpg'),
    alt: 'Concept art of travelers leaving a village through monumental ruins',
  },
  {
    src: assetUrl('monolith.jpg'),
    alt: 'Concept art of companions walking toward a towering monolith in a green valley',
  },
  {
    src: assetUrl('field copy.jpg'),
    alt: 'Concept art of a broad field and distant structures in a painterly medieval landscape',
  },
  {
    src: assetUrl('rough/ROUGH%20DESIGN%20MANUAL.pptx%20(3).png'),
    alt: 'Rough concept art of two figures approaching a massive glowing monolith',
  },
  {
    src: assetUrl('rough/bottom_image.png'),
    alt: 'Rough concept art used as an additional hero background scene',
  },
]

function simplifyClosedLoop(loop) {
  if (loop.length <= 3) {
    return loop
  }

  const simplified = [loop[0]]

  for (let index = 1; index < loop.length - 1; index += 1) {
    const previous = simplified[simplified.length - 1]
    const current = loop[index]
    const next = loop[index + 1]

    const deltaAX = current[0] - previous[0]
    const deltaAY = current[1] - previous[1]
    const deltaBX = next[0] - current[0]
    const deltaBY = next[1] - current[1]

    if (deltaAX === deltaBX && deltaAY === deltaBY) {
      continue
    }

    simplified.push(current)
  }

  simplified.push(loop[loop.length - 1])
  return simplified
}

function pruneLoop(loop, minimumDistance = 1.35) {
  if (loop.length <= 3) {
    return loop
  }

  const pruned = [loop[0]]

  for (let index = 1; index < loop.length - 1; index += 1) {
    const [previousX, previousY] = pruned[pruned.length - 1]
    const [currentX, currentY] = loop[index]
    const deltaX = currentX - previousX
    const deltaY = currentY - previousY

    if (Math.hypot(deltaX, deltaY) < minimumDistance) {
      continue
    }

    pruned.push(loop[index])
  }

  pruned.push(loop[loop.length - 1])
  return pruned
}

function chaikinSmoothClosedLoop(loop, iterations = 2) {
  let points = loop.slice(0, -1)

  if (points.length < 4) {
    return loop
  }

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const nextPoints = []

    for (let index = 0; index < points.length; index += 1) {
      const current = points[index]
      const following = points[(index + 1) % points.length]

      nextPoints.push([
        current[0] * 0.75 + following[0] * 0.25,
        current[1] * 0.75 + following[1] * 0.25,
      ])

      nextPoints.push([
        current[0] * 0.25 + following[0] * 0.75,
        current[1] * 0.25 + following[1] * 0.75,
      ])
    }

    points = nextPoints
  }

  return [...points, points[0]]
}

function buildSmoothClosedPath(loop) {
  const points = loop.slice(0, -1)

  if (points.length < 3) {
    return loop.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x} ${y}`).join(' ')
  }

  const midpoint = (pointA, pointB) => [
    (pointA[0] + pointB[0]) / 2,
    (pointA[1] + pointB[1]) / 2,
  ]

  const firstMidpoint = midpoint(points[0], points[1])
  const commands = [`M${firstMidpoint[0]} ${firstMidpoint[1]}`]

  for (let index = 1; index < points.length; index += 1) {
    const current = points[index]
    const following = points[(index + 1) % points.length]
    const nextMidpoint = midpoint(current, following)
    commands.push(`Q${current[0]} ${current[1]} ${nextMidpoint[0]} ${nextMidpoint[1]}`)
  }

  commands.push(`Q${points[0][0]} ${points[0][1]} ${firstMidpoint[0]} ${firstMidpoint[1]} Z`)
  return commands.join(' ')
}

function traceImageOutline(image) {
  const longestSide = Math.max(image.naturalWidth, image.naturalHeight)
  const scale = Math.min(1, CHARACTER_OUTLINE_MAX_DIMENSION / longestSide)
  const width = Math.max(2, Math.round(image.naturalWidth * scale))
  const height = Math.max(2, Math.round(image.naturalHeight * scale))
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d', { willReadFrequently: true })

  if (!context) {
    return null
  }

  canvas.width = width
  canvas.height = height
  context.clearRect(0, 0, width, height)
  context.drawImage(image, 0, 0, width, height)

  const { data } = context.getImageData(0, 0, width, height)
  const solidPixels = Array.from({ length: height }, () => Array(width).fill(false))

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3]
      solidPixels[y][x] = alpha >= CHARACTER_OUTLINE_ALPHA_THRESHOLD
    }
  }

  const segments = []

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!solidPixels[y][x]) {
        continue
      }

      if (y === 0 || !solidPixels[y - 1][x]) {
        segments.push([[x, y], [x + 1, y]])
      }

      if (x === width - 1 || !solidPixels[y][x + 1]) {
        segments.push([[x + 1, y], [x + 1, y + 1]])
      }

      if (y === height - 1 || !solidPixels[y + 1][x]) {
        segments.push([[x + 1, y + 1], [x, y + 1]])
      }

      if (x === 0 || !solidPixels[y][x - 1]) {
        segments.push([[x, y + 1], [x, y]])
      }
    }
  }

  const segmentMap = new Map()
  const segmentKey = ([x, y]) => `${x},${y}`

  segments.forEach((segment, index) => {
    const startKey = segmentKey(segment[0])
    const bucket = segmentMap.get(startKey) ?? []
    bucket.push(index)
    segmentMap.set(startKey, bucket)
  })

  const visitedSegments = new Set()
  const paths = []

  for (let segmentIndex = 0; segmentIndex < segments.length; segmentIndex += 1) {
    if (visitedSegments.has(segmentIndex)) {
      continue
    }

    const firstSegment = segments[segmentIndex]
    const loop = [firstSegment[0]]
    let currentPoint = firstSegment[0]
    let currentSegmentIndex = segmentIndex

    while (true) {
      if (visitedSegments.has(currentSegmentIndex)) {
        break
      }

      visitedSegments.add(currentSegmentIndex)
      const [, segmentEnd] = segments[currentSegmentIndex]
      loop.push(segmentEnd)
      currentPoint = segmentEnd

      if (segmentEnd[0] === loop[0][0] && segmentEnd[1] === loop[0][1]) {
        break
      }

      const nextSegmentIndex = (segmentMap.get(segmentKey(currentPoint)) ?? []).find(
        (candidateIndex) => !visitedSegments.has(candidateIndex),
      )

      if (typeof nextSegmentIndex !== 'number') {
        break
      }

      currentSegmentIndex = nextSegmentIndex
    }

    if (loop.length < CHARACTER_OUTLINE_MIN_POINTS) {
      continue
    }

    const simplifiedLoop = simplifyClosedLoop(loop)
    const prunedLoop = pruneLoop(simplifiedLoop)
    const smoothedLoop = chaikinSmoothClosedLoop(prunedLoop, 2)

    paths.push(buildSmoothClosedPath(smoothedLoop))
  }

  if (paths.length === 0) {
    return null
  }

  return {
    aspectRatio: `${image.naturalWidth} / ${image.naturalHeight}`,
    paths,
    viewBox: `0 0 ${width} ${height}`,
  }
}

function CharacterBand({ companion, reverse = false }) {
  const bandRef = useRef(null)
  const copyRef = useRef(null)
  const fillRef = useRef(null)
  const outlinePathRefs = useRef([])
  const [outlineData, setOutlineData] = useState(null)

  useEffect(() => {
    if (!fillRef.current) {
      return undefined
    }

    const imageNode = fillRef.current

    function updateOutline() {
      const nextOutline = traceImageOutline(imageNode)
      outlinePathRefs.current = []
      setOutlineData(nextOutline)
    }

    if (imageNode.complete) {
      updateOutline()
      return undefined
    }

    imageNode.addEventListener('load', updateOutline)
    return () => imageNode.removeEventListener('load', updateOutline)
  }, [companion.art])

  useEffect(() => {
    if (!fillRef.current) {
      return undefined
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const outlinePaths = outlinePathRefs.current.filter(Boolean)

    if (reduceMotion || !outlineData || outlinePaths.length === 0) {
      gsap.set(fillRef.current, { autoAlpha: 1, clearProps: 'clipPath' })
      return undefined
    }

    const context = gsap.context(() => {
      outlinePaths.forEach((path) => {
        const pathLength = path.getTotalLength()
        gsap.set(path, {
          autoAlpha: 1,
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength,
        })
      })

      gsap.set(fillRef.current, {
        autoAlpha: 0,
        clipPath: 'inset(0 0 100% 0)',
      })

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: bandRef.current,
          start: 'top 80%',
          endTrigger: copyRef.current,
          end: 'center center',
          scrub: true,
        },
      })

      timeline.to(
        outlinePaths,
        {
          strokeDashoffset: 0,
          duration: 0.72,
          ease: 'none',
          stagger: {
            each: 0.03,
            from: 'start',
          },
        },
        0,
      )

      timeline.to(
        fillRef.current,
        {
          autoAlpha: 1,
          clipPath: 'inset(0 0 0% 0)',
          duration: 0.28,
          ease: 'none',
        },
        0.72,
      )

      timeline.to(
        outlinePaths,
        {
          autoAlpha: 0,
          duration: 0.28,
          ease: 'none',
          stagger: {
            each: 0.02,
            from: 'end',
          },
        },
        0.72,
      )
    }, bandRef)

    ScrollTrigger.refresh()
    return () => context.revert()
  }, [outlineData])

  return (
    <article className={`character-band ${reverse ? 'character-band-reverse' : ''}`} ref={bandRef}>
      <div className="character-band__copy" ref={copyRef}>
        <span className="character-band__eyebrow">{companion.role}</span>
        <h3>{companion.name}</h3>
        <blockquote>{companion.quote}</blockquote>
        <p>{companion.text}</p>
      </div>
      <div className="character-band__art">
        <div
          className="character-band__visual"
          style={outlineData ? { '--character-aspect': outlineData.aspectRatio } : undefined}
        >
          {outlineData ? (
            <svg
              aria-hidden="true"
              className="character-band__outline"
              preserveAspectRatio="xMidYMid meet"
              viewBox={outlineData.viewBox}
            >
              {outlineData.paths.map((pathData, index) => (
                <path
                  key={`${companion.name}-${index}`}
                  ref={(node) => {
                    outlinePathRefs.current[index] = node
                  }}
                  className="character-band__outline-path"
                  d={pathData}
                />
              ))}
            </svg>
          ) : null}
          <img
            ref={fillRef}
            className="character-band__image character-band__image-fill"
            src={companion.art}
            alt={`${companion.name} character art`}
          />
        </div>
      </div>
    </article>
  )
}

function NewsletterPage({ activeHeroScene }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')

  async function handleSubmit(event) {
    event.preventDefault()

    const trimmedEmail = email.trim()
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)

    if (!isValidEmail) {
      setStatus('error')
      return
    }

    setStatus('loading')

    const sheetsUrl = import.meta.env.VITE_SHEETS_URL
    if (sheetsUrl) {
      try {
        await fetch(sheetsUrl, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify({ email: trimmedEmail, timestamp: new Date().toISOString() }),
        })
      } catch {
        // network error — still show success since we can't distinguish from opaque no-cors responses
      }
    }

    setStatus('success')
    setEmail('')
  }

  return (
    <main className="newsletter-page" id="top">
      <section className="hero hero-fullbleed newsletter-hero">
        <div className="hero-stage">
          <div className="hero-stage__frame hero-stage__frame--full">
            <div className="hero-stage__scene" aria-label={heroScenes[activeHeroScene].alt}>
              {heroScenes.map((scene, index) => (
                <img
                  key={scene.src}
                  src={scene.src}
                  alt=""
                  aria-hidden="true"
                  className={`hero-stage__scene-image ${
                    index === activeHeroScene ? 'hero-stage__scene-image-active' : ''
                  }`}
                />
              ))}
            </div>
            <div className="newsletter-hero__overlay">
              <div className="newsletter-card">
                <h1 className="newsletter-title">Join the watchlist</h1>
                <form className="newsletter-form" onSubmit={handleSubmit}>
                  <input
                    id="newsletter-email"
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value)
                      if (status !== 'idle') {
                        setStatus('idle')
                      }
                    }}
                    aria-invalid={status === 'error'}
                    aria-describedby="newsletter-status"
                  />
                  <button className="button button-primary newsletter-submit" type="submit" disabled={status === 'loading'}>
                    {status === 'loading' ? 'Signing up…' : 'Sign up'}
                  </button>
                </form>
                <p className={`newsletter-status newsletter-status-${status}`} id="newsletter-status">
                  {status === 'error'
                    ? 'Enter a valid email address.'
                    : status === 'success'
                      ? "You're on the list. We'll be in touch."
                      : ' '}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function App() {
  const pageRef = useRef(null)
  const heroRef = useRef(null)
  const heroSceneRef = useRef(0)
  const heroSceneTimeoutRef = useRef(null)
  const heroIntroTimeoutsRef = useRef([])
  const heroSceneTransitionRef = useRef(false)
  const [showTopbar, setShowTopbar] = useState(false)
  const [activeHeroScene, setActiveHeroScene] = useState(0)
  const [extinguishingHeroScene, setExtinguishingHeroScene] = useState(null)
  const [introHeroOrb, setIntroHeroOrb] = useState(null)
  const [heroIntroBursting, setHeroIntroBursting] = useState(false)
  const [heroIntroComplete, setHeroIntroComplete] = useState(false)
  const [locationHash, setLocationHash] = useState(window.location.hash || '')
  const normalizedPathname = window.location.pathname.replace(/\/$/, '')
  const isNewsletterPage = normalizedPathname === newsletterPath || locationHash === newsletterHash

  useEffect(() => {
    const handleHashChange = () => {
      setLocationHash(window.location.hash || '')
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  function finishHeroSceneTransition(nextScene) {
    setExtinguishingHeroScene(null)
    setActiveHeroScene(nextScene)
    heroSceneRef.current = nextScene
    heroSceneTransitionRef.current = false
    heroSceneTimeoutRef.current = null
  }

  function triggerHeroScene(nextScene) {
    if (nextScene === heroSceneRef.current && heroIntroComplete && !heroSceneTransitionRef.current) {
      return
    }

    if (!heroIntroComplete) {
      heroIntroTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId))
      heroIntroTimeoutsRef.current = []
      setIntroHeroOrb(null)
      setHeroIntroBursting(false)
      setHeroIntroComplete(true)
      setExtinguishingHeroScene(null)
      finishHeroSceneTransition(nextScene)
      return
    }

    if (heroSceneTransitionRef.current) {
      return
    }

    const currentScene = heroSceneRef.current
    heroSceneTransitionRef.current = true
    setExtinguishingHeroScene(currentScene)

    heroSceneTimeoutRef.current = window.setTimeout(() => {
      finishHeroSceneTransition(nextScene)
    }, 1000)
  }

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      return undefined
    }

    const ctx = gsap.context(() => {
      if (isNewsletterPage) {
        gsap.from('.newsletter-card', {
          y: 28,
          opacity: 0,
          scale: 0.985,
          duration: 0.9,
          ease: 'power3.out',
          delay: 0.1,
        })

        gsap.from('.newsletter-card > *', {
          y: 18,
          opacity: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power2.out',
          delay: 0.35,
        })
      } else {
        gsap.from('.hero-stage', {
          y: 48,
          opacity: 0,
          duration: 1.1,
          ease: 'power3.out',
          delay: 0.3,
        })

        gsap.to('.mist-a', {
          xPercent: 8,
          yPercent: -6,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          duration: 9,
        })

        gsap.to('.mist-b', {
          xPercent: -7,
          yPercent: 5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          duration: 11,
        })

        const triggerDefaults = {
          start: 'top 82%',
        }

        const animateTargets = (targets, vars, trigger, extraTrigger = {}) => {
          if (!targets || targets.length === 0) {
            return
          }

          gsap.from(targets, {
            scrollTrigger: {
              trigger,
              ...triggerDefaults,
              ...extraTrigger,
            },
            ...vars,
          })
        }

        gsap.utils.toArray('.section-heading').forEach((heading) => {
          animateTargets(heading.children, {
            y: 34,
            opacity: 0,
            duration: 0.8,
            stagger: 0.08,
            ease: 'power3.out',
          }, heading)
        })

        gsap.utils.toArray('.pillar-grid').forEach((grid) => {
          animateTargets(grid.children, {
            y: 52,
            opacity: 0,
            rotateX: -8,
            transformOrigin: 'center top',
            duration: 0.9,
            stagger: 0.1,
            ease: 'power3.out',
          }, grid, { start: 'top 78%' })
        })

        gsap.utils.toArray('.world-copy').forEach((copy) => {
          animateTargets(copy.children, {
            x: -36,
            opacity: 0,
            duration: 0.82,
            stagger: 0.09,
            ease: 'power3.out',
          }, copy)
        })

        gsap.utils.toArray('.feature-list').forEach((list) => {
          animateTargets(list.children, {
            x: -18,
            opacity: 0,
            duration: 0.64,
            stagger: 0.07,
            ease: 'power2.out',
          }, list, { start: 'top 86%' })
        })

        gsap.utils.toArray('.tableau-card').forEach((card) => {
          const overlay = card.querySelector('.tableau-card__overlay')
          animateTargets([card], {
            y: 46,
            opacity: 0,
            scale: 0.975,
            duration: 0.92,
            ease: 'power3.out',
          }, card, { start: 'top 80%' })

          if (overlay) {
            animateTargets(overlay.children, {
              y: 26,
              opacity: 0,
              duration: 0.72,
              stagger: 0.08,
              ease: 'power2.out',
            }, card, { start: 'top 80%' })
          }
        })

        gsap.utils.toArray('.chronicle-stack').forEach((stack) => {
          animateTargets(stack.children, {
            x: 28,
            opacity: 0,
            scale: 0.985,
            duration: 0.78,
            stagger: 0.1,
            ease: 'power3.out',
          }, stack)
        })

        gsap.utils.toArray('.faction-header').forEach((header) => {
          animateTargets(header.children, {
            y: 32,
            opacity: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power3.out',
          }, header)
        })

        gsap.utils.toArray('.faction-grid').forEach((grid) => {
          animateTargets(grid.children, {
            y: 48,
            opacity: 0,
            rotateX: -7,
            transformOrigin: 'center top',
            duration: 0.86,
            stagger: 0.1,
            ease: 'power3.out',
          }, grid, { start: 'top 78%' })
        })

        gsap.utils.toArray('.character-band').forEach((band) => {
          const copy = band.querySelector('.character-band__copy')
          const art = band.querySelector('.character-band__art')
          const reverse = band.classList.contains('character-band-reverse')

          if (copy) {
            animateTargets(copy.children, {
              x: reverse ? 36 : -36,
              opacity: 0,
              duration: 0.82,
              stagger: 0.08,
              ease: 'power3.out',
            }, band, { start: 'top 76%' })
          }

          if (art) {
            animateTargets([art], {
              x: reverse ? -48 : 48,
              y: 20,
              opacity: 0,
              scale: 0.94,
              duration: 1,
              ease: 'power3.out',
            }, band, { start: 'top 76%' })
          }
        })

        gsap.utils.toArray('.quote-panel').forEach((panel) => {
          animateTargets(panel.children, {
            y: 38,
            opacity: 0,
            scale: 0.97,
            duration: 0.9,
            stagger: 0.09,
            ease: 'power3.out',
          }, panel, { start: 'top 78%' })
        })

        gsap.utils.toArray('.cta-panel').forEach((panel) => {
          const copy = panel.querySelector('.cta-copy')
          const form = panel.querySelector('.signup-form')

          if (copy) {
            animateTargets(copy.children, {
              x: -28,
              opacity: 0,
              duration: 0.78,
              stagger: 0.08,
              ease: 'power3.out',
            }, panel, { start: 'top 80%' })
          }

          if (form) {
            animateTargets(form.children, {
              x: 28,
              opacity: 0,
              duration: 0.74,
              stagger: 0.08,
              ease: 'power3.out',
            }, panel, { start: 'top 80%' })
          }
        })

        gsap.utils.toArray('.reveal').forEach((node) => {
          if (node.classList.contains('hero-stage')) {
            return
          }

          gsap.from(node, {
            scrollTrigger: {
              trigger: node,
              start: 'top 84%',
            },
            opacity: 0,
            duration: 0.55,
            ease: 'power2.out',
          })
        })
      }
    }, pageRef)

    return () => ctx.revert()
  }, [isNewsletterPage])

  useEffect(() => {
    if (isNewsletterPage) {
      setShowTopbar(false)
      return undefined
    }

    const heroNode = heroRef.current
    if (!heroNode) {
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowTopbar(!entry.isIntersecting)
      },
      {
        threshold: 0.15,
      },
    )

    observer.observe(heroNode)

    return () => observer.disconnect()
  }, [isNewsletterPage])

  useEffect(() => {
    heroSceneRef.current = activeHeroScene
  }, [activeHeroScene])

  useEffect(() => {
    if (isNewsletterPage) {
      setHeroIntroComplete(true)
      return undefined
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      setHeroIntroComplete(true)
      return undefined
    }

    const introStepDelay = 180
    const introStartDelay = 220
    const fadeOutDelay = introStartDelay + heroScenes.length * introStepDelay + 180
    const burstDelay = fadeOutDelay + 340
    const finishDelay = burstDelay + 1000

    const scheduleIntro = (callback, delay) => {
      const timeoutId = window.setTimeout(callback, delay)
      heroIntroTimeoutsRef.current.push(timeoutId)
    }

    heroIntroTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId))
    heroIntroTimeoutsRef.current = []
    setIntroHeroOrb(null)
    setHeroIntroBursting(false)
    setHeroIntroComplete(false)

    heroScenes.forEach((_, index) => {
      scheduleIntro(() => {
        setIntroHeroOrb(index)
      }, introStartDelay + index * introStepDelay)
    })

    scheduleIntro(() => {
      setIntroHeroOrb(null)
    }, fadeOutDelay)

    scheduleIntro(() => {
      setHeroIntroBursting(true)
    }, burstDelay)

    scheduleIntro(() => {
      setHeroIntroBursting(false)
      setHeroIntroComplete(true)
    }, finishDelay)

    return () => {
      heroIntroTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId))
      heroIntroTimeoutsRef.current = []
    }
  }, [isNewsletterPage])

  useEffect(() => {
    if (!heroIntroComplete) {
      return undefined
    }

    const intervalId = window.setInterval(() => {
      if (heroSceneTransitionRef.current) {
        return
      }

      const nextScene = (heroSceneRef.current + 1) % heroScenes.length
      triggerHeroScene(nextScene)
    }, 8000)

    return () => {
      window.clearInterval(intervalId)

      if (heroSceneTimeoutRef.current) {
        window.clearTimeout(heroSceneTimeoutRef.current)
      }
    }
  }, [heroIntroComplete])

  return (
    <div className="page-shell" ref={pageRef}>
      <div className="page-noise" aria-hidden="true" />
      {!isNewsletterPage ? (
        <header className={`topbar ${showTopbar ? 'topbar-visible' : 'topbar-hidden'}`}>
          <a className="brand" href="#top">
            <img className="brand-logo" src={assetUrl('logo.png')} alt="Sword and Shield" />
          </a>
          <nav className="topnav">
            <a href="#about">Chronicle</a>
            <a href="#world">World</a>
            <a href="#companions">Companions</a>
            <a href={newsletterUrl}>Watchlist</a>
          </nav>
        </header>
      ) : null}

      {isNewsletterPage ? (
        <NewsletterPage activeHeroScene={activeHeroScene} />
      ) : (
      <main id="top">
        <section className="hero hero-fullbleed" ref={heroRef}>
          <div className="hero-stage reveal">
            <div className="mist mist-a" />
            <div className="mist mist-b" />
            <div className="hero-stage__frame hero-stage__frame--full">
              <div className="hero-stage__scene" aria-label={heroScenes[activeHeroScene].alt}>
                {heroScenes.map((scene, index) => (
                  <img
                    key={scene.src}
                    src={scene.src}
                    alt=""
                    aria-hidden="true"
                    className={`hero-stage__scene-image ${
                      index === activeHeroScene ? 'hero-stage__scene-image-active' : ''
                    }`}
                  />
                ))}
              </div>
              <div className="hero-scene-orbs" aria-label="Hero scene selector" role="tablist">
                {heroScenes.map((scene, index) => (
                  (() => {
                    const isIntroPhase = !heroIntroComplete
                    const isIntroLit = index === introHeroOrb
                    const isIntroActive = heroIntroBursting && index === activeHeroScene
                    const orbStateClass = isIntroPhase
                      ? isIntroActive
                        ? 'hero-scene-orb-active hero-scene-orb-intro-burst'
                        : isIntroLit
                          ? 'hero-scene-orb-intro-lit'
                          : 'hero-scene-orb-intro-off'
                      : index === extinguishingHeroScene
                        ? 'hero-scene-orb-extinguishing'
                        : index === activeHeroScene
                          ? 'hero-scene-orb-active'
                          : ''

                    return (
                  <button
                    type="button"
                    key={scene.src}
                    className={`hero-scene-orb ${orbStateClass}`}
                    onClick={() => {
                      triggerHeroScene(index)
                    }}
                    aria-label={`Show hero scene ${index + 1}`}
                    aria-selected={index === activeHeroScene}
                    role="tab"
                  >
                    <span className="hero-scene-orb__particles" />
                  </button>
                    )
                  })()
                ))}
              </div>
              <div className="hero-overlay">
                <p className="eyebrow">A Co-op Adventure</p>
                <h1 className="hero-title">
                  <span className="hero-title__dropcap" aria-hidden="true">
                    <img src={assetUrl('rough/frame_1_letterB.png')} alt="" />
                  </span>
                  <span className="hero-title__text">
                    ots set out to find a soul force, only to learn there may be enough for one.
                  </span>
                </h1>
                <div className="hero-actions">
                  <a className="button button-primary" href={newsletterUrl}>
                    Begin the Journey
                  </a>
                  <a className="button button-ghost" href="#about">
                    Read the Chronicle
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section reveal" id="about">
          <div className="section-frame">
            <div className="chronicle-layout">
              <div className="chronicle-main">
                <div className="section-heading section-heading-wide section-heading-chronicle">
                  <p className="eyebrow">The Chronicle</p>
                  <h2>Built around two-player cooperation, shard-swapping, and a rough but strong central hook.</h2>
                </div>
              </div>
              <aside className="chronicle-art">
                <img
                  src={assetUrl('rough/orbframe.png')}
                  alt="Rough concept art of an orb framed scene"
                />
              </aside>
            </div>
            <div className="pillar-grid stagger-rise">
              {pillars.map((pillar) => (
                <article className="pillar-card window-card" key={pillar.title}>
                  <span className="pillar-card__number">{pillar.number}</span>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section world-section reveal" id="world">
          <div className="world-layout">
            <div className="world-copy world-copy-featured">
              <p className="eyebrow">A Weathered Realm</p>
              <h2>Small open worlds, side-scrolling dungeons, and a journey shaped by discovery.</h2>
              <p>
                The game structure in the overview mixes explorable hub-like spaces with
                camera-on-rails 3D dungeons, giving the pair room for exploration, secrets,
                optional content, and tightly directed moments.
              </p>
              <ul className="feature-list">
                {warFeatures.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>

            <div className="world-tableau">
              <div className="tableau-card tableau-card-large tableau-card-scene">
                <span className="tableau-card__label">Journey sketch</span>
                <img src={assetUrl('rough/ROUGH%20DESIGN%20MANUAL.pptx%20(1).png')} alt="Rough concept art of travelers crossing a field of stone fragments" />
                <div className="tableau-card__overlay">
                  <h3>From village jobs to a much bigger adventure</h3>
                  <p>
                    The rough story starts with the pair doing low-paid local work before a crate
                    delivery goes wrong and exposes their first shards.
                  </p>
                </div>
              </div>
                <div className="chronicle-stack stagger-rise">
                  {chronicles.map((item) => (
                  <article className="chronicle-card chronicle-card-illustrated" key={item.title}>
                    <img src={item.art} alt={item.artAlt} />
                    <div className="chronicle-card__body">
                      <span>{item.label}</span>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </div>
                  </article>
                  ))}
                </div>
              </div>
          </div>
        </section>

        <section className="section reveal">
          <div className="faction-header">
            <div className="faction-header__lead">
              <p className="eyebrow">Power in the Realm</p>
              <h2>Three pillars define how the world is explored and survived.</h2>
            </div>
            <div className="faction-aside">
              <p>
                The overview is less about political factions and more about structure:
                traversal, dungeon pacing, and environmental pressure.
              </p>
            </div>
          </div>
          <div className="faction-grid stagger-rise">
            {factions.map((faction, index) => (
              <article className="faction-card window-card" key={faction.name}>
                <div className="faction-card__head">
                  <span className="faction-card__number">0{index + 1}</span>
                  <span className="faction-card__subtitle">{faction.subtitle}</span>
                </div>
                <h3>{faction.name}</h3>
                <p>{faction.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section companion-section reveal" id="companions">
          <div className="companion-title">
            <img
              className="companion-title__art"
              src={assetUrl('rough/characters_titles.png')}
              alt="Character titles artwork"
            />
          </div>
          <div className="character-showcase stagger-rise">
            {companions.map((companion, index) => (
              <CharacterBand
                companion={companion}
                key={companion.name}
                reverse={index % 2 === 1}
              />
            ))}
          </div>
        </section>

        <section className="section quote-section reveal">
          <div className="quote-panel">
            <p className="quote-mark">" "</p>
            <h2 className="quote-panel__title">
              The strongest part of the concept is simple: one has a shield, one has a sword,
              and only teamwork carries them forward.
            </h2>
          </div>
        </section>

        <section className="section cta-section reveal" id="join">
          <div className="cta-panel">
            <h2 className="cta-title">Join the watchlist</h2>
            <form className="signup-form">
              <input
                id="email"
                type="email"
                placeholder="Email address"
                aria-label="Email address"
              />
              <a className="button button-primary" href={newsletterUrl}>
                Sign up
              </a>
            </form>
          </div>
        </section>

        <footer className="page-footer reveal" aria-label="Footer artwork">
          <img
            className="page-footer__art"
            src={assetUrl('rough/characters.png')}
            alt="Rough concept art of the companion characters as a footer image"
          />
        </footer>
      </main>
      )}
    </div>
  )
}

export default App
