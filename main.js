console.log("Hello there")

const fs = require('node:fs');
const buffer = require('node:buffer')

// EXPLANATION:
// The heatmap file contains a float array encoded in a base64 string.
// The data consists of jam samples each consisting of 3 floats
// (32-bit little-endian): longitude, latitude and sample weight, in that order.
// The weight is a float value in the range [0.0, 255.0] and represents the
// relative frequency of the jam over the given

fs.readFile('./heatmap', 'utf8', (err, data) => {
    if(err) {
        console.error("heatmap file couldn't be opened");
        return;
    }

    console.log(data.length);

    var decoded = buffer.atob(data);
    var numFloats = decoded.length / Float32Array.BYTES_PER_ELEMENT;
    var dataView = new DataView(new ArrayBuffer(Float32Array.BYTES_PER_ELEMENT));

    var numSamples = numFloats/3; // 3 floats per sample

    // This array contains the data you will give to the HeatmapLayer constructor
    // a sample is an object of the form: { DATA: [long, lat, weight] }
    // But you will access these fields with getPosition and getWeight functions below.
    var theSamples = [];

    // Decoding the raw bytes into samples for theSamples array
    var p = 0;
    for(var i = 0; i < numSamples; i++) {
        var samplePtr = i * 3 * 4;
        sample = {DATA: [0,0,0]};
        for(var j = 0; j < 3; j++) {
            var sampleFloatPtr = samplePtr + j * 4;
            dataView.setUint8(0, decoded.charCodeAt(sampleFloatPtr + 0));
            dataView.setUint8(1, decoded.charCodeAt(sampleFloatPtr + 1));
            dataView.setUint8(2, decoded.charCodeAt(sampleFloatPtr + 2));
            dataView.setUint8(3, decoded.charCodeAt(sampleFloatPtr + 3));
            sample.DATA[j] = dataView.getFloat32(0, true);
        }
        theSamples.push(sample)
    }

    // These are the accessor functions you will give to the HeatmapLayer constructor
    var getPosition = (sample) => [sample.DATA[0], sample.DATA[1]];
    var getWeight = (sample) => sample.DATA[2];

    theSamplesJsonStr = JSON.stringify(theSamples);
    console.log(theSamplesJsonStr);
    
    fs.writeFile("heatmap.json", theSamplesJsonStr, (error) => {if(error) {throw error}});

    // Printing the samples just to check if everything seems okay
    // for(var i = 0; i < numSamples; ++i) {
    //     s = theSamples[i];
    //     console.log("long, lat: ", getPosition(s), "weight: ", getWeight(s));
    // }

});