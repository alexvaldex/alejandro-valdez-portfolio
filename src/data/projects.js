// Project registry. Grouped into categories like SpaceX groups its vehicles.
// type: 'model'   Apple-style scroll scene (uses the 3D model in src/media/<id>/)
//       'gallery' photo/video sections only
// repo: GitHub repo name under alexvaldex, shown live on the project page
export const GITHUB_USER = 'alexvaldex'

const allCategories = [
  { id: 'rockets', label: 'Rockets', blurb: 'Vehicles, payloads, and the road to certification.' },
  { id: 'software', label: 'Software', blurb: 'Mission control, written from scratch.' },
  { id: 'forge', label: 'The Forge', blurb: 'Built by hand. Bionics, armor, and everything between.' },
  { id: 'arsenal', label: 'Arsenal', blurb: 'Reverse-engineering the machines that shaped history.' },
  { id: 'impact', label: 'Impact', blurb: 'Research, ventures, and the people they reach.' },
]

const allProjects = [
  {
    id: 'odysseus', category: 'rockets', type: 'model', kind: 'Competition Rocket', year: '2026', status: 'Flown · IREC 2026',
    stats: [['IREC', '2026, Spaceport America'], ['347', 'bodies in the CAD'], ['Flown', 'and recovered']],
    scenes: [
      ['The rocket', 'Team 25, UCF', 'The full flight assembly, flown at Spaceport America at IREC 2026.'],
      ['Payload bay', 'Sunflower in the nose', 'Our payload rides up front on its own retention and elevator hardware.'],
      ['Avionics', 'Redundant altimeters', 'Commercial altimeters on a 3D-printed sled, bench-tested before the trip.'],
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
    stats: [['Flown', 'IREC 2026'], ['97', 'open-source CAD files'], ['FreeRTOS', 'flight firmware']],
    scenes: [
      ['Mission', 'Find the sun', 'After landing, Sunflower orients itself and raises a solar panel, like a flower turning to the light.'],
      ['Mechanism', 'Gears and a scissor lift', 'Planetary gears rotate it. Stepper-driven lead screws lift the panel.'],
      ['Electronics', 'ESP32 on FreeRTOS', 'A BNO085 IMU, stepper drivers, SD logging, and a LiFePO4 pack, under a flight state machine.'],
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

  { id: 'vxtelemetry', category: 'software', type: 'gallery', kind: 'Ground Station', year: '2026', status: 'v1.1 shipped', repo: 'Valdex_Telemetry', showcase: 'vx',
    stats: [['3', 'desktop platforms'], ['Any', 'flight computer'], ['0', 'lines of parsing code']] },
  { id: 'phantom', category: 'software', type: 'gallery', kind: 'Mission Control', year: '2026', status: 'Boom Prize', repo: 'Boom-KnightsRP-Flight-Software', related: 'phantomjet',
    stats: [['Mach 1', 'target'], ['CRC-16', 'checked link'], ['Sim + live', 'one interface']] },
  { id: 'prostheticarm', category: 'forge', draft: true, type: 'model', kind: 'Bionics', year: '2026', status: 'Build log',
    stats: [['Arm', 'prosthetic'], ['Custom', 'designed'], ['Hand', 'built']],
    scenes: [
      ['Design', 'Built around the user', 'Fill in: what drove the design and who it is for.'],
      ['Mechanism', 'How it moves', 'Fill in: actuation, joints, and control.'],
      ['Build', 'From CAD to hardware', 'Fill in: materials, manufacturing, and testing.'],
    ] },
  { id: 'prostheticknee', category: 'forge', draft: true, type: 'model', kind: 'Bionics', year: '2026', status: 'Build log',
    stats: [['Knee', 'prosthetic'], ['Custom', 'designed'], ['Hand', 'built']],
    scenes: [
      ['Design', 'Built for the gait cycle', 'Fill in: what the knee needed to do and why.'],
      ['Mechanism', 'How it moves', 'Fill in: joint design, damping, and locking.'],
      ['Build', 'From CAD to hardware', 'Fill in: materials, manufacturing, and testing.'],
    ] },
  { id: 'ironarmor', category: 'forge', draft: true, type: 'model', kind: 'Wearable Armor', year: '2026', status: 'Build log',
    stats: [['Iron', 'armor'], ['Wearable', 'fit'], ['Hand', 'built']],
    scenes: [
      ['Design', 'Shaped to the body', 'Fill in: concept, references, and fit.'],
      ['Fabrication', 'Cut, formed, assembled', 'Fill in: materials and fabrication methods.'],
      ['Finish', 'The finished suit', 'Fill in: finishing, mobility, and what you learned.'],
    ] },
  {
    id: 'phantomjet', category: 'arsenal', related: 'phantom', type: 'model', kind: 'Supersonic RC Jet', year: '2026', status: 'Boom Prize · in development',
    stats: [['Mach 1+', 'twice, same day'], ['25 kg', 'max takeoff weight'], ['$800K', 'Boom Prize']],
    scenes: [
      ['The prize', 'Break the sound barrier', 'Boom Supersonic put $800K on the first amateur RC jet past Mach 1. No dives, no rockets, twice in one day.'],
      ['Airframe', 'Shaped for transonic', 'A slender fuselage and ogive-delta wing, built to slip through the drag rise instead of fighting it.'],
      ['Structure', 'Bulkheads and longerons', 'Explode the model to see it: ring frames and longerons carrying load to the wing, with the turbine in its own aft section.'],
      ['Mission control', 'Ready before first flight', 'I wrote the ground station first. Mach, EGT, RPM, and q, live against redlines.'],
    ],
  },
  { id: 'valdex', category: 'impact', type: 'gallery', kind: 'Avionics Company', year: '2025', status: 'Founder',
    stats: [['v1.1', 'VX Telemetry shipped'], ['3', 'desktop platforms'], ['3', 'boards in design']] },
  { id: 'fsi', category: 'impact', type: 'gallery', kind: 'Research', year: '2025', status: 'Researcher',
    stats: [] },
  { id: 'restem', category: 'impact', type: 'gallery', kind: 'Nonprofit', year: '2025', status: 'Founder',
    stats: [] },
]

// Drafts stay out of the public site until they have real content
export const projects = allProjects.filter(p => !p.draft)
export const categories = allCategories.filter(c => projects.some(p => p.category === c.id))

export const getProject = id => projects.find(p => p.id === id)
export const byCategory = cat => projects.filter(p => p.category === cat)
