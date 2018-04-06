import * as d3 from 'd3';
import * as Utils from '../utils';

const section = d3.select('#wave-examples');
const svg = section.select('svg.sound')
	.attr('width', 500)
	.attr('height', 320)
	.append('g');

const padding = 10;
const height = 320 - padding * 2;
const width = 500 - padding * 2;

const particleScales = {
	x: d3.scaleLinear().domain([0, 1]).range([padding, padding + width]),
	y: d3.scaleLinear().domain([0, 1]).range([padding, padding + height / 3])
}

const displacementScales = {
	x: d3.scaleLinear().domain([0, 1]).range([padding, padding + width]),
	y: d3.scaleLinear().domain([1, -1]).range([padding + height / 3, padding + 2 * height / 3])
}

const pressureScales = {
	x: d3.scaleLinear().domain([0, 1]).range([padding, padding + width]),
	y: d3.scaleLinear().domain([1, -1]).range([padding + 2 * height / 3, padding + height])
}

let amplitude = 0.05;
let frequency = 0.0001;
let wavelength = 0.4;

const wave = (x, t) => {
	return amplitude * Math.sin(Math.PI * 2 * (x / wavelength - frequency * t));
}

const pressure = (x, t) => {
	return amplitude * Math.sin(Math.PI * 2 * (x / wavelength - frequency * t) - Math.PI / 2);
}

const particleNumber = 200;
let particles = [];
for (let i = 0; i < particleNumber; i++) {
	particles.push([1/particleNumber * i, d3.randomUniform(0, 0.7)()]);
}

const particleGroup = svg.append('g');
const graphStart = 0.1;
const samples = d3.range(graphStart, 1, 0.005);

const displacementXAxis = svg.append('line')
	.attr('stroke', Utils.colors.grey)
	.attr('stroke-width', '2')
	.attr('marker-end', 'url(#arrow-end-grey)')
	.attr('x1', displacementScales.x(graphStart)).attr('y1', displacementScales.y(0))
	.attr('x2', displacementScales.x(1)).attr('y2', displacementScales.y(0));

const displacementYAxis = svg.append('line')
	.attr('stroke', Utils.colors.grey)
	.attr('stroke-width', '2')
	.attr('marker-end', 'url(#arrow-end-grey)')
	.attr('x1', displacementScales.x(graphStart)).attr('y1', displacementScales.y(-0.7))
	.attr('x2', displacementScales.x(graphStart)).attr('y2', displacementScales.y(0.7));

const displacementLine = d3.line().x(d => { return displacementScales.x(d); });
const displacementLinePath = svg.append('path').datum(samples)
	.attr('fill', 'none')
	.attr('stroke', Utils.colors.black)
	.attr('stroke-width', '2');

const displacementLabel = svg.append('text')
	.attr('x', displacementScales.x(graphStart)).attr('y', displacementScales.y(0.9))
	.attr('text-anchor', 'middle')
	.text('displacement');

const pressureXAxis = svg.append('line')
	.attr('stroke', Utils.colors.grey)
	.attr('stroke-width', '2')
	.attr('marker-end', 'url(#arrow-end-grey)')
	.attr('x1', pressureScales.x(graphStart)).attr('y1', pressureScales.y(0))
	.attr('x2', pressureScales.x(1)).attr('y2', pressureScales.y(0));

const pressureYAxis = svg.append('line')
	.attr('stroke', Utils.colors.grey)
	.attr('stroke-width', '2')
	.attr('marker-end', 'url(#arrow-end-grey)')
	.attr('x1', pressureScales.x(graphStart)).attr('y1', pressureScales.y(-0.7))
	.attr('x2', pressureScales.x(graphStart)).attr('y2', pressureScales.y(0.7));

const pressureLine = d3.line().x(d => { return pressureScales.x(d); });
const pressureLinePath = svg.append('path').datum(samples)
	.attr('fill', 'none')
	.attr('stroke', Utils.colors.black)
	.attr('stroke-width', '2');

const pressureLabel = svg.append('text')
	.attr('x', pressureScales.x(graphStart)).attr('y', pressureScales.y(0.9))
	.attr('text-anchor', 'middle')
	.text('pressure');

const particleItems = particleGroup.selectAll("g").data(particles, (d, i) => { return i; });
const particleItemsEnter = particleItems.enter().append('g');
particleItemsEnter.append("line")
	.attr('stroke', Utils.colors.green)
	.attr('stroke-width', 2)
	.attr('stroke-linecap', 'round')
	.attr('x1', d => { return particleScales.x(d[0]); }).attr('y1', d => { return particleScales.y(d[1]); })
	.attr('y2', d => { return particleScales.y(d[1]); });
particleItemsEnter.append("circle")
	.attr('r', 4)
	.attr('fill', Utils.colors.green)
	.attr('cy', d => { return particleScales.y(d[1]); });

Utils.createTimer(svg.node(), elapsed => {
	displacementLine.y(d => { return displacementScales.y(wave(d, elapsed) * 10); });
	displacementLinePath.attr('d', displacementLine);

	pressureLine.y(d => { return pressureScales.y(pressure(d, elapsed) * 10); });
	pressureLinePath.attr('d', pressureLine);

	particleItemsEnter.select("line")
		.attr('x2', d => { return particleScales.x(d[0] + wave(d[0], elapsed)); });
	particleItemsEnter.select("circle")
		.attr('cx', d => { return particleScales.x(d[0] + wave(d[0], elapsed)); });
});