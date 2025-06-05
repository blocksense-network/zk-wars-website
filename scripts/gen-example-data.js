const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'test', 'example-data');
fs.rmSync(dataDir, { recursive: true, force: true });
fs.mkdirSync(dataDir, { recursive: true });

const toolchains = ['jolt','nexus','risc0','sp1','zkm','zkwasm'];
const benchmarks = [
  'poseidon-hash',
  'aes256-encryption',
  'ecc-pairing',
  'stark-proof',
  'merkle-tree',
  'sha256-hash',
  'mimc-hash',
  'fibonacci-proof',
  'rsa-signing',
  'snark-verification'
];
const baseMeans = {
  'poseidon-hash':5,
  'aes256-encryption':6,
  'ecc-pairing':7,
  'stark-proof':8,
  'merkle-tree':9,
  'sha256-hash':10,
  'mimc-hash':11,
  'fibonacci-proof':12,
  'rsa-signing':13,
  'snark-verification':14
};
const systems = [
  {
    name: 'single-cpu',
    factor: 1,
    specs: {
      cpu: [{ model: 'Intel Core i7-9700K', cores: 8, speed: 3.6 }],
      memory: { model: 'Corsair Vengeance', size: 17179869184, speed: 3200 },
      hardwareAcceleration: [],
      accelerated: false
    },
    benches: benchmarks
  },
  {
    name: 'dual-cpu',
    factor: 0.9,
    specs: {
      cpu: [
        { model: 'Intel Xeon Gold 6226R', cores: 16, speed: 2.9 },
        { model: 'Intel Xeon Gold 6226R', cores: 16, speed: 2.9 }
      ],
      memory: { model: 'Samsung ECC', size: 68719476736, speed: 2933 },
      hardwareAcceleration: [],
      accelerated: false
    },
    benches: benchmarks.slice(0,8)
  },
  {
    name: 'cpu-gpu',
    factor: 0.8,
    specs: {
      cpu: [{ model: 'Intel Xeon W-1290', cores: 10, speed: 3.2 }],
      memory: { model: 'G.Skill Ripjaws', size: 34359738368, speed: 3600 },
      hardwareAcceleration: [{ model: 'NVIDIA RTX 3080', cores: 8704, speed: 1710 }],
      accelerated: true
    },
    benches: ['poseidon-hash','aes256-encryption','ecc-pairing','sha256-hash','mimc-hash','fibonacci-proof']
  },
  {
    name: 'hpc-cluster',
    factor: 0.7,
    specs: {
      cpu: [
        { model: 'Intel Xeon Platinum 8368', cores: 38, speed: 2.4 },
        { model: 'Intel Xeon Platinum 8368', cores: 38, speed: 2.4 }
      ],
      memory: { model: 'Kingston ECC', size: 137438953472, speed: 3200 },
      hardwareAcceleration: [{ model: 'NVIDIA A100', cores: 6912, speed: 1410 }],
      accelerated: true
    },
    benches: benchmarks
  },
  {
    name: 'arm-laptop',
    factor: 1.2,
    specs: {
      cpu: [{ model: 'Apple M1', cores: 8, speed: 3.2 }],
      memory: { model: 'LPDDR4', size: 17179869184, speed: 4266 },
      hardwareAcceleration: [{ model: 'Apple M1 GPU', cores: 8, speed: 3200 }],
      accelerated: true
    },
    benches: ['poseidon-hash','merkle-tree','sha256-hash','rsa-signing','snark-verification']
  }
];

const unsupported = {
  'rsa-signing': ['sp1','zkwasm'],
  'snark-verification': ['sp1','zkm']
};

function metric(mean, memory, size) {
  const deviation = +(mean * 0.05).toFixed(2);
  return {
    timeStarted: '2025-06-01T12:00:00Z',
    runs: 10,
    totalDuration: +(mean * 10).toFixed(2),
    mean: +mean.toFixed(2),
    deviation,
    min: +(mean - deviation).toFixed(2),
    max: +(mean + deviation).toFixed(2),
    memory,
    size
  };
}

for (const sys of systems) {
  for (const bench of sys.benches) {
    const benchDir = path.join(dataDir, sys.name, bench);
    fs.mkdirSync(benchDir, { recursive: true });
    for (const tc of toolchains) {
      if (unsupported[bench] && unsupported[bench].includes(tc)) continue;
      const tcIndex = toolchains.indexOf(tc);
      const factor = sys.factor * (1 + tcIndex * 0.02);
      const base = baseMeans[bench];
      const compileMean = base * factor;
      const proveMean = compileMean * 2;
      const verifyMean = compileMean * 0.75;
      const json = {
        toolchain: tc,
        benchmarks: [{
          name: bench,
          compile: metric(compileMean, 536870912, 1000000),
          prove: metric(proveMean, 1073741824, 1200000),
          verify: metric(verifyMean, 268435456, 1200000)
        }],
        hardware: sys.specs
      };
      fs.writeFileSync(path.join(benchDir, `${tc}.json`), JSON.stringify(json, null, 2));
    }
  }
}
