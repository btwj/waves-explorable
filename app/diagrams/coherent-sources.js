import * as d3 from 'd3';
import * as Utils from '../utils';

const xPadding = 0, yPadding = 10;
const height = 400 - yPadding * 2;
const width = 500;
const canvasWidth = 400;

const resolution = 6;
const halfResolution = Math.ceil(resolution / 2);

const section = d3.select('#coherent-sources');
const svg = section.select('svg')
	.attr('width', 500)
	.attr('height', 400);
const graph = svg.append('g');

const canvas = section.select('canvas')
	.style('margin-top', yPadding + 'px')
	.style('margin-left', xPadding + 'px')
	.attr('height', height / resolution)
	.attr('width', canvasWidth / resolution)
	.style('transform-origin', '0 0')
	.style('transform', `scale(${resolution})`);
const context = canvas.node().getContext('2d');

let distance = 50;

const waveOne = {
	amplitude: 0.5,
	frequency: 1,
	y: height / 2 - distance / 2,
	x: 10,
	phaseDifference: 0
};

const waveTwo = {
	amplitude: 0.5,
	frequency: 1,
	y: height / 2 + distance / 2,
	x: 10,
	phaseDifference: 0
};

const velocity = 40;
const maxAmplitude = 2;

function displacement (x, y, elapsed, sources) {
	let value = 0;
	for (let source of sources) {
		const dist = Math.sqrt((source.x - x) ** 2 + (source.y - y) ** 2);
		value += source.amplitude * Math.sin(2 * Math.PI * source.frequency * (dist / velocity - elapsed) - source.phaseDifference) / Math.max(dist, 1);
	}
	return value *= 50;
}

const waveScale = d3.scaleLinear().domain([-maxAmplitude, maxAmplitude]).range([0, 1]);

Utils.createSlider(section.select('.slider-row.amplitude.one'), val => { waveOne.amplitude = val; });
Utils.createSlider(section.select('.slider-row.amplitude.two'), val => { waveTwo.amplitude = val; });
Utils.createSlider(section.select('.slider-row.frequency'), val => { waveOne.frequency = waveTwo.frequency = val; });
Utils.createSlider(section.select('.slider-row.phase-difference'), 
	val => { waveTwo.phaseDifference = val * Math.PI; },
	(val, el) => { katex.render(`${val}\\pi`, el.node()); });
Utils.createSlider(section.select('.slider-row.distance'), val => { 
	waveOne.y = height / 2 - val / 2;
	waveTwo.y = height / 2 + val / 2;
});
Utils.createSlider(section.select('.slider-row.screen-distance'), val => {
	waveOne.x = canvasWidth - val;
	waveTwo.x = canvasWidth - val;
});

const screenSamples = d3.range(0, height, height / 150);
const rollingAverage = new Float32Array(screenSamples.length);

const graphXScale = d3.scaleLinear().range([canvasWidth + 5, width - 5]);
const graphYScale = d3.scaleLinear().domain([0, height]).range([yPadding, height + yPadding]);

const line = d3.line()
	.x((d, i) => { return graphXScale(rollingAverage[i]); })
	.y(d => { return graphYScale(d); });

let linePath = graph.append('path').datum([])
	.attr('d', line)
	.attr('fill', 'none')
	.attr('stroke', Utils.colors.blue)
	.attr('stroke-width', '2');

const numSamplesForAverage = 100;

function render (elapsed) {
	elapsed = elapsed / 1000;
	context.clearRect(0, 0, width, height);
	screenSamples.forEach((d, i) => {
		const displacementAtPoint = displacement(canvasWidth, d, elapsed, [waveOne, waveTwo]);
		rollingAverage[i] = rollingAverage[i] + (displacementAtPoint ** 2 - rollingAverage[i]) / numSamplesForAverage;
	});
	graphXScale.domain(d3.extent(rollingAverage));
	line.x((d, i) => { return graphXScale(rollingAverage[i]); });
	linePath.datum(screenSamples)
		.attr('d', line);

	for (let i = 0; i < width / resolution; i++) {
		for (let j = 0; j < height / resolution; j++) {
			const value = displacement(i * resolution + halfResolution, j * resolution + halfResolution, elapsed, [waveOne, waveTwo]);
			context.fillStyle = d3.interpolateBlues(waveScale(value));
			context.fillRect(i, j, 1, 1);
		}
	}
}

Utils.createTimer(svg.node(), render);