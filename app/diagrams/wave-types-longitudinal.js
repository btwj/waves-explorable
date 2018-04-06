import * as d3 from 'd3';
import * as Utils from '../utils';

const section = d3.select('#wave-types');
const svg = section.select('svg.longitudinal')
	.attr('width', 500)
	.attr('height', 100)
	.append('g');

const padding = 20;
const height = 100 - padding * 2;
const width = 500 - padding * 2;

const x = d3.scaleLinear()
	.domain([0, 1]).range([padding, padding + width]);
const y = d3.scaleLinear()
	.domain([1, -1]).range([padding, padding + height]);

let amplitude = 0.03;
let frequency = 0.001;
let wavelength = 0.4;

const wave = (x, t) => {
	return amplitude * Math.sin(Math.PI * 2 * (x / wavelength - frequency * t));
}

const samples = d3.range(0, 1, amplitude / 2);

let lineGroup = svg.append('g');

lineGroup.selectAll('line')
	.data(samples)
	.enter()
	.append('line')
	.attr('stroke', 'black').attr('stroke-width', 1)
	.attr('x1', d => { return x(d); }).attr('x2', d => { return x(d); })
	.attr('y1', d => { return y(-1); }).attr('y2', d => { return y(1); });

Utils.createTimer(svg.node(), elapsed => {
	lineGroup.selectAll('line')
		.attr('x1', d => { return x(d + wave(d, elapsed)); }).attr('x2', d => { return x(d + wave(d, elapsed)); });
});