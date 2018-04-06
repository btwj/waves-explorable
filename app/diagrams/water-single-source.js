import * as d3 from 'd3';
import * as Utils from '../utils';

const section = d3.select('#water-single-source');
const svg = section.select('svg')
	.attr('width', 500)
	.attr('height', 220);

const xPadding = 0, yPadding = 10;
const height = 220 - yPadding * 2;
const width = 500 - xPadding * 2;

const canvas = svg.append('foreignObject')
		.attr('x', xPadding)
		.attr('y', yPadding)
		.attr('height', height)
		.attr('width', width)
	.append('xhtml:canvas')
		.attr('height', height)
		.attr('width', width);

const context = canvas.node().getContext('2d');

let amplitude = 0.5;
let frequency = 1;
const velocity = 40;
let sourceX = width / 2;
let sourceY = height / 2;

const resolution = 5;
const halfResolution = Math.ceil(resolution / 2);
const maxAmplitude = 1;
const waveScale = d3.scaleLinear().domain([-maxAmplitude, maxAmplitude]).range([0, 1]);

const slidersEl = section.select('.sliders');
Utils.createSlider(slidersEl.select('.slider-row.amplitude'), val => { amplitude = val; });
Utils.createSlider(slidersEl.select('.slider-row.frequency'), val => { frequency = val; });

function render (elapsed) {
	elapsed = elapsed / 1000;
	context.clearRect(0, 0, width, height);
	const k = 2 * Math.PI * frequency / velocity;
	const w = 2 * Math.PI * frequency;
	for (let i = 0; i < width; i += resolution) {
		for (let j = 0; j < height; j += resolution) {
			const dist = Math.sqrt((i + halfResolution - sourceX) ** 2 + (j + halfResolution - sourceY) ** 2);
			const value = amplitude * Math.sin(k * dist - w * elapsed) / Math.max(dist, 1) * 50;
			context.fillStyle = d3.interpolateBlues(waveScale(value));
			context.fillRect(i, j, resolution, resolution);
		}
	}
}

Utils.createTimer(svg.node(), elapsed => {
	render(elapsed);
});