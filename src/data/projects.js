// Project registry. Grouped into categories like SpaceX groups its vehicles.
// type: 'model'   Apple-style scroll scene (uses the 3D model in src/media/<id>/)
//       'gallery' photo/video sections only
// repo: GitHub repo name under alexvaldex, shown live on the project page
export const GITHUB_USER = 'alexvaldex'

export const categories = [
  { id: 'rockets', label: 'Rockets', blurb: 'Vehicles, payloads, and the road to certification.' },
  { id: 'software', label: 'Software', blurb: 'Mission control, written from scratch.' },
  { id: 'forge', label: 'The Forge', blurb: 'Built by hand. Bionics, armor, and everything between.' },
  { id: 'arsenal', label: 'Arsenal', blurb: 'Reverse-engineering the machines that shaped history.' },
  { id: 'impact', label: 'Impact', blurb: 'Research, ventures, and the people they reach.' },
]

export const projects = [
  {
    id: 'odysseus', category: 'rockets', type: 'model', kind: 'Competition Rocket', year: '2026', status: 'IREC 2026',
    stats: [['10,000', 'ft apogee target'], ['IREC', '2026 competition'], ['Dual', 'deploy recovery']],
    scenes: [
      ['Propulsion', 'High-power motor', 'Commercial HPR motor selected for a 10,000 ft AGL apogee under the competition weight budget.'],
      ['Airframe', 'Composite structure', 'Fiberglass and carbon fiber airframe with machined aluminum couplers built for transonic flight.'],
      ['Avionics', 'Dual-deploy recovery', 'Valdex flight computer as primary, commercial altimeter as backup. LoRa telemetry from pad to recovery.'],
    ],
  },
  {
    id: 'monkeybar', category: 'rockets', type: 'model', kind: 'Guided Rocket', year: '2026', status: 'In development', repo: 'Monkey_Bar',
    stats: [['2', 'stages'], ['TVC', 'booster landing'], ['Canard', 'guided dart']],
    scenes: [
      ['Booster', 'Lands itself', 'Two thrust vector control mounts bring the booster back down under control.'],
      ['Dart', 'Aims for a target', 'Canard fins steer the upper stage onto a ground target, scored on accuracy over speed.'],
      ['Ground', 'Live link', 'A Yagi-linked ground station streams onboard data for real-time safety calls.'],
    ],
  },
  {
    id: 'sunflower', category: 'rockets', type: 'model', kind: 'Scientific Payload', year: '2026', status: 'Flown · IREC 2026', repo: 'Payload-Sunflower-by-SHPE-UCF', buildKit: true,
    stats: [['Flown', 'IREC 2026'], ['FreeRTOS', 'flight firmware'], ['Open', 'source design']],
    scenes: [
      ['Mission', 'Science at apogee', 'Pressure, temperature, humidity, and particulate sampling through ascent and descent.'],
      ['Electronics', 'Custom sensor array', 'ESP-IDF firmware on FreeRTOS: IMU at high priority, tracking at medium, logging at low.'],
      ['Recovery', 'Built for deployment loads', 'Drogue at apogee, main at 700 ft AGL. Hard points rated for 15G.'],
    ],
  },
  {
    id: 'harper', category: 'rockets', type: 'model', kind: 'HPR Level 1', year: '2026', status: 'Working toward L1',
    stats: [['H169', 'attempt 1 motor'], ['2', 'attempts'], ['L1', 'in progress']],
    // Each version gets its own 3D model: file is matched against filenames in src/media/harper/
    versions: [
      { label: 'Attempt 1', file: 'harper-attempt-1', note: 'H169 · did not certify' },
      { label: 'Attempt 2', file: 'harper-attempt-2', note: 'Coming soon' },
    ],
    scenes: [
      ['Attempt 1', 'First flight, H169', 'The first Harper and the first shot at Level 1. It did not certify, and that flight taught the most.'],
      ['Airframe', 'Designed and built', 'Fill in: airframe, fins, and the materials you chose.'],
      ['Next', 'Attempt two', 'Every lesson from the first flight, built into the next one.'],
    ],
  },
  {
    id: 'charlotte', category: 'rockets', type: 'model', kind: 'HPR Level 2', year: '2026', status: 'Working toward L2',
    stats: [['V5', 'design revision'], ['J / K / L', 'motor class'], ['L2', 'in progress']],
    scenes: [
      ['Level 2', 'The step up', 'A bigger motor, a tougher airframe, and five revisions to get it right.'],
      ['Airframe', 'Built for more power', 'Fill in: airframe, fins, and what changed from Harper.'],
      ['Avionics', 'Recovery and electronics', 'Fill in: altimeter, deployment, and how the flight went.'],
    ],
  },

  { id: 'vxtelemetry', category: 'software', type: 'gallery', kind: 'Ground Station', year: '2026', status: 'v0.9 shipped', repo: 'Valdex_Telemetry',
    stats: [['3', 'platforms'], ['Any', 'flight computer'], ['Live', '3D vehicle']] },
  { id: 'phantom', category: 'software', type: 'gallery', kind: 'Mission Control', year: '2026', status: 'Boom Prize', repo: 'Boom-KnightsRP-Flight-Software',
    stats: [['Mach 1', 'target'], ['CRC-16', 'checked link'], ['Sim + live', 'one interface']] },
  { id: 'prostheticarm', category: 'forge', type: 'model', kind: 'Bionics', year: '2026', status: 'Build log',
    stats: [['Arm', 'prosthetic'], ['Custom', 'designed'], ['Hand', 'built']],
    scenes: [
      ['Design', 'Built around the user', 'Fill in: what drove the design and who it is for.'],
      ['Mechanism', 'How it moves', 'Fill in: actuation, joints, and control.'],
      ['Build', 'From CAD to hardware', 'Fill in: materials, manufacturing, and testing.'],
    ] },
  { id: 'prostheticknee', category: 'forge', type: 'model', kind: 'Bionics', year: '2026', status: 'Build log',
    stats: [['Knee', 'prosthetic'], ['Custom', 'designed'], ['Hand', 'built']],
    scenes: [
      ['Design', 'Built for the gait cycle', 'Fill in: what the knee needed to do and why.'],
      ['Mechanism', 'How it moves', 'Fill in: joint design, damping, and locking.'],
      ['Build', 'From CAD to hardware', 'Fill in: materials, manufacturing, and testing.'],
    ] },
  { id: 'ironarmor', category: 'forge', type: 'model', kind: 'Wearable Armor', year: '2026', status: 'Build log',
    stats: [['Iron', 'armor'], ['Wearable', 'fit'], ['Hand', 'built']],
    scenes: [
      ['Design', 'Shaped to the body', 'Fill in: concept, references, and fit.'],
      ['Fabrication', 'Cut, formed, assembled', 'Fill in: materials and fabrication methods.'],
      ['Finish', 'The finished suit', 'Fill in: finishing, mobility, and what you learned.'],
    ] },
  { id: 'valdex', category: 'impact', type: 'gallery', kind: 'Avionics Company', year: '2025', status: 'Founder',
    stats: [['8 km', 'telemetry range'], ['20G', 'rated hardware'], ['KiCad', 'to flight']] },
  { id: 'fsi', category: 'impact', type: 'gallery', kind: 'Research', year: '2025', status: 'Researcher',
    stats: [['UCF', 'Florida Space Institute'], ['SmallSat', 'subsystems'], ['Mission', 'design']] },
  { id: 'restem', category: 'impact', type: 'gallery', kind: 'Nonprofit', year: '2025', status: 'Founder',
    stats: [['200+', 'students reached'], ['Central FL', 'partner schools'], ['Hands-on', 'every program']] },
]

export const getProject = id => projects.find(p => p.id === id)
export const byCategory = cat => projects.filter(p => p.category === cat)
