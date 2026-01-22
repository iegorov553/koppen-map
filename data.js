const fs = require("fs/promises");
const raw = require("./raw-data.json");
const exec = require("node-exec-promise").exec;

// Chaikin algorithm for smoothing polygon corners
function chaikinSmooth(coords, iterations = 2) {
  let result = coords;
  for (let i = 0; i < iterations; i++) {
    const smoothed = [];
    for (let j = 0; j < result.length - 1; j++) {
      const p0 = result[j];
      const p1 = result[j + 1];
      // Create points at 25% and 75% along each edge
      smoothed.push([
        0.75 * p0[0] + 0.25 * p1[0],
        0.75 * p0[1] + 0.25 * p1[1],
      ]);
      smoothed.push([
        0.25 * p0[0] + 0.75 * p1[0],
        0.25 * p0[1] + 0.75 * p1[1],
      ]);
    }
    // Close the polygon
    if (smoothed.length > 0) {
      smoothed.push(smoothed[0]);
    }
    result = smoothed;
  }
  return result;
}

function smoothPolygonCoords(coordinates) {
  return coordinates.map((ring) => chaikinSmooth(ring, 2));
}

function makeName(e) {
  if (e === "Dfa Cold-Withouth_dry_season-Very_Cold_Winter") {
    return "Dfd";
  }
  const code = e.split(" ")[0];
  return code;
}

const boundary = 400;
const transform = (func) => (coordinates) => {
  const projected = coordinates.map(([l, r]) => [func(l), r]);
  const removeBadData = projected.filter(([l]) => {
    return l >= -boundary && l <= boundary;
  });
  return removeBadData;
};

function duplicate360(feature, code) {
  const coordinates = feature.geometry.coordinates || [];
  // Apply Chaikin smoothing to round corners
  const smoothedCoords = smoothPolygonCoords(coordinates);
  const makeCords = (c) => ({
    type: feature.type,
    geometry: {
      ...feature.geometry,
      coordinates: c,
    },
    properties: {
      code,
    },
  });
  const added = smoothedCoords.map(transform((l) => l + 360));
  const removed = smoothedCoords.map(transform((l) => l - 360));
  return [makeCords(smoothedCoords), makeCords(added), makeCords(removed)];
}

const newFeatures = raw.features
  .map((e) => {
    const climate = makeName(e.properties.climate);
    return duplicate360(e, climate);
  })
  .flat(1);

function jsonStringWithFixDfaDfd(code, json) {
  const str = JSON.stringify(json);
  if (code === "Dfd") {
    return str.replace(/Dfa/g, "Dfd");
  }
  return str;
}

function makeGeoJson(name, features) {
  const gj = {
    type: "FeatureCollection",
    features,
  };
  return fs.writeFile(`./data/${name}.json`, jsonStringWithFixDfaDfd(name, gj));
}

async function main() {
  try {
    await fs.stat("./data");
  } catch (_) {
    await fs.mkdir("./data");
  }
  await makeGeoJson("all", newFeatures);
  await exec(
    `npx mapshaper ./data/all.json -snap -split code -o ./data format=topojson id-field=code singles`
  );
  await fs.unlink("./data/all.json");
}

main();
