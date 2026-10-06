// Project registry. Grouped into categories like SpaceX groups its vehicles.
// type: 'model'   Apple-style scroll scene (uses the 3D model in src/media/<id>/)
//       'gallery' photo/video sections only
// repo: GitHub repo name under alexvaldex, shown live on the project page
export const GITHUB_USER = 'alexvaldex'

export const categories = [
  { id: 'rockets', label: 'Rockets', blurb: 'Flight hardware: vehicles, payloads, and propulsion.' },
  { id: 'software', label: 'Software', blurb: 'Ground stations, flight software, and mission control.' },
  { id: 'impact', label: 'Impact', blurb: 'Research, ventures, and community.' },
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
    id: 'sunflower', category: 'rockets', type: 'model', kind: 'Scientific Payload', year: '2026', status: 'Flown · IREC 2026', repo: 'Payload-Sunflower-by-SHPE-UCF',
    stats: [['Flown', 'IREC 2026'], ['FreeRTOS', 'flight firmware'], ['Open', 'source design']],
    scenes: [
      ['Mission', 'Science at apogee', 'Pressure, temperature, humidity, and particulate sampling through ascent and descent.'],
      ['Electronics', 'Custom sensor array', 'ESP-IDF firmware on FreeRTOS: IMU at high priority, tracking at medium, logging at low.'],
      ['Recovery', 'Built for deployment loads', 'Drogue at apogee, main at 700 ft AGL. Hard points rated for 15G.'],
    ],
  },
  {
    id: 'knightsrp', category: 'rockets', type: 'model', kind: 'Hybrid Propulsion', year: '2025', status: 'Static fire campaign',
    stats: [['N₂O', 'oxidizer'], ['HTPB', 'fuel grain'], ['100%', 'built in-house']],
    scenes: [
      ['Propellant', 'N₂O + HTPB hybrid', 'Nitrous oxide oxidizer with a cast HTPB grain. Throttleable, re-ignitable, built in-house.'],
      ['Hardware', 'Motor from scratch', 'CFD-optimized injector, combustion chamber, and nozzle, all designed and machined by the team.'],
      ['Testing', 'Static fire campaign', 'Chamber pressure, thrust, temperature, and mass flow data feeding every iteration.'],
    ],
  },
  { id: 'vxtelemetry', category: 'software', type: 'gallery', kind: 'Ground Station', year: '2026', status: 'v0.9 shipped', repo: 'Valdex_Telemetry',
    stats: [['3', 'platforms'], ['Any', 'flight computer'], ['Live', '3D vehicle']] },
  { id: 'phantom', category: 'software', type: 'gallery', kind: 'Mission Control', year: '2026', status: 'Boom Prize', repo: 'Boom-KnightsRP-Flight-Software',
    stats: [['Mach 1', 'target'], ['CRC-16', 'checked link'], ['Sim + live', 'one interface']] },
  { id: 'valdex', category: 'impact', type: 'gallery', kind: 'Avionics Company', year: '2025', status: 'Founder',
    stats: [['8 km', 'telemetry range'], ['20G', 'rated hardware'], ['KiCad', 'to flight']] },
  { id: 'fsi', category: 'impact', type: 'gallery', kind: 'Research', year: '2025', status: 'Researcher',
    stats: [['UCF', 'Florida Space Institute'], ['SmallSat', 'subsystems'], ['Mission', 'design']] },
  { id: 'restem', category: 'impact', type: 'gallery', kind: 'Nonprofit', year: '2025', status: 'Founder',
    stats: [['200+', 'students reached'], ['Central FL', 'partner schools'], ['Hands-on', 'every program']] },
]

export const getProject = id => projects.find(p => p.id === id)
export const byCategory = cat => projects.filter(p => p.category === cat)
