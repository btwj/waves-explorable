import * as d3 from 'd3';
import * as Utils from '../utils';

const section = d3.select('#wave-types');
const svg = section.select('svg.transverse')
	.attr('width', 500)
	.attr('height', 100)
	.append('g');

const padding = 10;
const height = 100 - padding * 2;
const width = 500 - padding * 2;

const x = d3.scaleLinear()
	.domain([0, 1]).range([padding, padding + width]);
const y = d3.scaleLinear()
	.domain([1, -1]).range([padding, padding + height]);

let amplitude = 0.8;
let frequency = 0.0005;
let wavelength = 0.2;

const wave = (x, t) => {
	return amplitude * Math.sin(Math.PI * 2 * (x / wavelength - frequency * t));
}

const displacementSamples = d3.range(0, 1, 0.005 * 4);

const xAxis = svg.append('line')
	.attr('stroke', Utils.colors.grey)
	.attr('stroke-width', '2')
	.attr('x1', x(0)).attr('y1', y(0)).attr('x2', x(1)).attr('y2', y(0));

const displacementGroup = svg.append('g');

Utils.createTimer(svg.node(), elapsed => {
	let displacementItems = displacementGroup.selectAll("g").data(displacementSamples);
	
	let displacementItemsEnter = displacementItems.enter().append('g');
	displacementItemsEnter.append("line")
		.attr('stroke', Utils.colors.blue)
		.attr('stroke-width', 2)
		.attr('stroke-linecap', 'round')
		.attr('x1', d => { return x(d); }).attr('y1', d => { return y(0); })
		.attr('x2', d => { return x(d); });
	displacementItemsEnter.append("circle")
		.attr('r', 4)
		.attr('fill', Utils.colors.blue)
		.attr('cx', d => { return x(d); });
	
	let displacementItemsMerge = displacementItems.merge(displacementItemsEnter);
	displacementItemsMerge.select("line")
		.attr('y2', d => { return y(wave(d, elapsed)); });
	displacementItemsMerge.select("circle")
		.attr('cy', d => { return y(wave(d, elapsed)); });
});